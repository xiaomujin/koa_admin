import {ErrorCode} from "../../const/ErrorCode";
import {AuthTool} from "../../tool/AuthTool";


/**
 * Created by Zero .
 * 基类
 */

export class BaseHandler {
    public startTime: number;
    public urlTemp: any;

    public constructor() {

    }

    /**  */
    public async preHandle(msg, session: any): Promise<any> {
        let uuid = msg.token || session.token;
        // 接口前鉴权
        let auth = await AuthTool.authSessionForHandler({uuid, session, type: "game"})
        if (!auth) {
            console.warn(this.urlTemp)
            return this.fail(ErrorCode.enum.LOGIN_INVALID)
        }

        return null;
    }

    public afterHandle(msg: any, session: any, handler_result: any) {
        let useTime = Date.now() - this.startTime;
        if (useTime > 80) {
            console.warn(`接口请求 ${this.urlTemp.route}/${this.urlTemp.method}  耗时${useTime}ms`);
        }

    }


    public suc(data: any) {
        return {
            code: 200,
            data: data,
            serverTime: Date.now(),
        }
    }


    public page(data: any, count: number) {
        return {
            code: 0,
            msg: "suc",
            data: data,
            count: count,
        }
    }

    public fail(key: string, ...args: any[]) {
        return {
            code: key,
            data: ErrorCode.enum[key],
            param: args
        }
    }

}
