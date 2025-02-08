import {BaseClass} from "../core/BaseClass";
import {App} from "../App";
import * as path from "path";
import {getIpSearcher, IpSearcher} from "./libs/ip2reegion";
import {serverDevOption} from "../../config/serverDevOption";

import {configure, getLogger} from "log4js";

export class SystemUtil extends BaseClass {
    /*
    * 统一进程传参方式 -- key value  key[直接置为true]
    * */
    private searcher: IpSearcher;

    public formatArgv(argv: string[]) {
        let startParam: any = {};
        let key = null;

        for (let i = 2; i < argv.length; i++) {
            if (argv[i].indexOf("--") != -1) {
                key = argv[i].replace("--", "");
                continue;
            }
            if (key) {
                startParam[key] = argv[i];
                key = null;
            } else {
                startParam[argv[i]] = true;
            }


        }
        startParam.nodePath = argv[0];
        startParam.appPath = argv[1];
        startParam.serverType = startParam.serverType ? startParam.serverType : "master"
        return startParam;
    }

    public getLocalIP() {
        const os = require('os');
        const osType = os.type(); //系统类型
        const netInfo = os.networkInterfaces(); //网络信息
        let ip = '';
        if (osType === 'Windows_NT') {
            for (let dev in netInfo) {
                //win7的网络信息中显示为本地连接，win10显示为以太网
                if (dev === '本地连接' || dev === '以太网' || dev === 'WLAN') {
                    for (let j = 0; j < netInfo[dev].length; j++) {
                        if (netInfo[dev][j].family === 'IPv4') {
                            ip = netInfo[dev][j].address;
                            break;
                        }
                    }
                }
            }

        } else if (osType === 'Linux') {
            // ip = netInfo;
            let Info = netInfo.eth0 || netInfo.ens192 || netInfo.eno1 || [];
            ip = Info[0]?.address || "127.0.0.1";

        } else if (osType === 'Darwin') {
            // mac操作系统
            // ip = netInfo.eth0[0].address;
            // ip = netInfo.eth0[0].address;
        } else {
            // 其他操作系统
        }

        return ip;
    }

    public getClientIP(ctx: any) {
        let ip = ctx.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            ctx.ip ||
            ctx.connection?.remoteAddress || // 判断 connection 的远程 IP
            ctx.socket?.remoteAddress || // 判断后端的 socket 的 IP
            ctx.connection?.socket?.remoteAddress || ''
        if (ip) {
            ip = ip.replace('::ffff:', '')
        }
        return ip;
    }

    public async ip2Region(ip: string) {
        if (!this.searcher) {
            this.searcher = getIpSearcher(path.resolve(__dirname, "../../resource/ip2region.xdb"))
        }
        return await this.searcher.searchCity(ip);

    }

    public async safeRunFuncAsync(func: Function, that: any, ...args: any[]) {
        try {
            return await func.call(that, ...args);
        } catch (e) {
            console.error(e);
        }
        return;
    }

    public safeRunFunc(func: Function, that: any, ...args: any[]) {
        try {
            return func.call(that, ...args);
        } catch (e) {
            console.error(e);
        }
        return;
    }


    public InitLog4js(level: string = "debug") {
        let serverId = App.startParam.id || "master";
        configure({
            appenders: {
                fileout: {
                    type: "file", filename: serverDevOption.userLogDir + `/${serverId}.log`,
                    "maxLogSize": 1048576 * 4,
                    "backups": 7,
                    layout: {
                        type: "pattern",
                        pattern: `%[[${serverId}] [%f{1},%l,%o] [%d] [%p]%] %m`,
                    },

                },
                datafileout: {
                    type: "stdout",
                    layout: {
                        type: "pattern",
                        pattern: `%[[${serverId}] [%f{1}] [%d] [%p]%] %m`,
                    },
                },
                consoleout: {type: "console"},
            },
            categories: {
                default: {appenders: ["fileout", "datafileout"], level: level, enableCallStack: true},
                publish: {appenders: ["fileout"], level: level, enableCallStack: false},

            },
        });


        const logger = getLogger(serverDevOption.loggerName || "console");
        console.debug = logger.debug.bind(logger);
        console.log = logger.debug.bind(logger);
        console.info = logger.info.bind(logger);
        console.warn = logger.warn.bind(logger);
        console.error = logger.error.bind(logger);
        console.trace = logger.trace.bind(logger);
    }
}

