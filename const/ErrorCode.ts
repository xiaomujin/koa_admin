export class ErrorCode {
    /* 1 - 200 通用返回码 */
    public static enum: any = {
        'SUCCESS': 200, 200: "ok",
        'SERVER_ERROR': 500, 500: "SERVER_ERROR",
        //通用错误官方回复类
        'ERR_PARAM': 201, 201: "参数错误",
        'ERR_CFG': 202, 202: "配置错误",
        'ERR_SIGN': 203, 203: "签名错误",
        'SERVER_CLOSED': 204, 204: "服务器维护中",
        'LOGIN_INVALID': 205, 205: "登录信息无效或同账号已登录,请重新登录",
        'NO_HANDLER_TO_REQ': 207, 207: "没有可访问的接口",
        'GATE_CHANGE_NEED_LOGIN': 208, 208: "路由已变更 请重新登录",
        'SERVER_HANDLE_TIME_OUT': 209, 209: "接口请求超时",
    }
}
