import * as Koa from 'koa';
import * as koaBodyParser from 'koa-bodyparser';
import * as cors from 'koa2-cors';
import * as KoaStatic from 'koa-static';
import * as koa_session from 'koa-session';
import * as multer from '@koa/multer';
import http = require('http');
import https = require('https');
import {App} from "./App";
import {ErrorCode} from "../const/ErrorCode";
import {serverDevOption} from "../config/serverDevOption";
import {enableHandlerHttps} from "../tool/httpsUtil";
import {BaseHandler} from "./core/BaseHandler";

export class KoaApp {
    private app: Koa;
    public server: http.Server | https.Server;

    private async handle(ctx, next) {
        let host: string = ctx.host;
        let path: string = ctx.path;
        let lastIndexOf = path.lastIndexOf('/');
        let method = path.substring(lastIndexOf + 1); // 获取最后一个 / 后面的部分
        let routeName = path.substring(1, lastIndexOf); // 获取最后一个 / 前面的部分
        let handler: { handler: Function, route: BaseHandler } = App.routeUtil.getHandler(routeName, method);

        if (!handler?.handler) {
            return ctx.fail(ErrorCode.enum.NO_HANDLER_TO_REQ);
        }
        handler.route.urlTemp = {
            host, routeName, method
        };
        let handleRes = await App.SystemUtil.safeRunFuncAsync(async () => {
            let params = Object.assign(ctx.request.body, ctx.query);
            let is_sign: boolean = false;
            if (params.sign_body) {
                let sign_body = App.MsgUtil.DecodeMsg(params.sign_body);
                params = Object.assign(params, sign_body);
                is_sign = true;
            }

            ctx.session.ip = ctx.session.ip ? ctx.session.ip : App.SystemUtil.getClientIP(ctx);

            handler.route.startTime = Date.now();
            let result = await App.routeUtil.dealHandle(handler.route, handler.handler, ctx.session, params);

            if (result) {
                if (is_sign) {
                    ctx.body = {sign_res: App.MsgUtil.EncodeMsg(result)};
                } else {
                    ctx.body = result;
                }
            } else {
                ctx.suc({})
            }
            return true;
        }, this)

        if (!handleRes) {
            return ctx.fail(ErrorCode.enum.SERVER_ERROR)
        }

    }

    private async initBackFnc(ctx, next) {
        ctx.startTime = Date.now();
        ctx.suc = (data: any) => {
            ctx.body = {
                code: 200,
                data: data,
                serverTime: Date.now(),
            }
        }
        ctx.fail = (key: string, ...args: any) => {
            ctx.body = {
                code: key,
                data: ErrorCode.enum[key],
                param: args
            }
        }
        await next();
    }

    constructor(port: number, pre: string = "") {
        //创建koa对象
        let app = new Koa();

        /**
         app.use(cors({
         origin: function(ctx) { //设置允许来自指定域名请求
         const whiteList = ['https://www.fqniu.xyz', 'http://localhost:8080', 'http://localhost:8081']; //可跨域白名单
         let url = ctx.header.referer.substr(0, ctx.header.referer.length - 1);
         if(whiteList.includes(url)){
         return url // 注意，这里域名末尾不能带/，否则不成功，所以在之前我把/通过substr干掉了
         }
         return 'http://localhost:8080' //默认允许本地请求8080端口可跨域
         },
         maxAge: 5, //指定本次预检请求的有效期，单位为秒。
         credentials: true, //是否允许发送Cookie
         allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
         allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
         exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
         }))
         */

        app.use(cors({
            origin: function (evt) {
                // 此处不能用*号，前端需要携带cookie
                return evt.header.origin?.toString();
            },
            maxAge: 60, //指定本次预检请求的有效期，单位为秒。
            credentials: true, //是否允许发送Cookie
        }))

        app.use(multer({}).any())
        app.use(koaBodyParser())
        app.use(this.initBackFnc)

        //配置session的中间件
        app.keys = ['ccwlzj'];   /*cookie的签名*/
        const CONFIG = {
            key: 'game.sess', /** 默认 */
            maxAge: 24 * 60 * 60 * 1000,  /*  cookie的过期时间        【需要修改】  */
            overwrite: true, /** (boolean) can overwrite or not (default true)    没有效果，默认 */
            httpOnly: true, /**  true表示只有服务器端可以获取cookie */
            signed: true, /** 默认 签名 */
            rolling: false, /** 在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false） 【需要修改】 */
            renew: false, /** (boolean) renew session when session is nearly expired      【需要修改】*/
        };
        app.use(koa_session(CONFIG, app));


        app.on('error', function (err, ctx) {
            console.log('server error', err)
            // ctx.res.writeHead(200, {
            //     'content-Type': 'application/json'
            // });
            // ctx.res.end(JSON.stringify({
            //     code: ErrorCode.enum.SERVER_ERROR,
            //     data: ErrorCode.enum[ErrorCode.enum.SERVER_ERROR]
            // }))
        })

        let pathStr = App.rootPath + "/admin_web";
        if (serverDevOption.adminWebDir) {
            pathStr = serverDevOption.adminWebDir;
        }
        if (App.startParam.isStatic) {
            app.use(KoaStatic(pathStr, {
                index: false,    // 默认为true  访问的文件为index.html  可以修改为别的文件名或者false
                hidden: false,   // 是否同意传输隐藏文件
                defer: false      // 如果为true，则在返回next()之后进行服务，从而允许后续中间件先进行响应
            }))
        }

        app.use(this.handle)


        app.use(async ctx => {
            ctx.body = 'there is 404';

        })
        if (serverDevOption.https) {
            this.server = enableHandlerHttps(app.callback(), {
                keyPath: serverDevOption.httpsConfig.key, // HTTPS cert key path.
                certPath: serverDevOption.httpsConfig.pem, // HTTPS cert file path.
            });
            this.server.listen(port, () => {
                console.log(`${App.startParam.id || "master"}== Https 服务器启动完成正在监听端口=======》 ${port}`)
            }).on('error', (e: any) => {
                console.log(e);
                if (e.code === "EADDRINUSE") {
                    console.error("https端口占用程序退出====" + port)
                    setTimeout(() => {
                        process.exit(1);
                    }, 300)

                }
            })
        } else {
            this.server = http.createServer(app.callback());
            this.server.listen(port, () => {
                console.log(`${App.startParam.id || "master"}==服务器启动完成正在监听端口=======》 ${port}`)
            }).on('error', (e: any) => {
                console.log(e);
                if (e.code === "EADDRINUSE") {
                    console.error("http端口占用程序退出====" + port)
                    setTimeout(() => {
                        process.exit(1);
                    }, 300)
                }
            })
        }
        this.app = app;
        App.setKey(pre + "KoaApp", this);
    }
}

export function startApp(port: number, pre: string = "") {
    // 启动http服务
    App.koaApp = new KoaApp(port, pre);
}

