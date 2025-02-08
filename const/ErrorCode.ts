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
        'NO_LOTTERY_CAN_USE': 206, 206: "没有可抽取的奖励",
        'NO_HANDLER_TO_REQ': 207, 207: "没有可访问的接口",
        'GATE_CHANGE_NEED_LOGIN': 208, 208: "路由已变更 请重新登录",
        'SERVER_HANDLE_TIME_OUT': 209, 209: "接口请求超时",
        'MOD_NOT_UNLOCK': 210, 210: "功能未解锁",
        'SERVER_OPEN_TIME': 211, 211: "未到服务器开服时间",
        'CUR_SERVER_BUSY': 212, 212: "服务器当前拥挤，请稍后重试",
        'REQ_TO_FAST': 213, 213: "重复请求过于频繁，请稍后重试",
        'ERR_DO': 214, 214: "操作错误",

        //登陆类
        'ROLE_LOGIN_FAIL': 101, 101: "登录失败",
        'ROLE_LOGIN_AUTH_FAIL': 102, 102: "登录权限验证失败",
        'ADMIN_AUTH_FAIL': 103, 103: "权限验证失败",
        'ROLE_CAN_NOT_FOUND': 104, 104: "未找到该玩家",
        'ADMIN_ACCOUNT_EXISTS': 105, 105: "账号已存在",
        'HANDLER_DISABLED': 106, 106: "接口不可达",
        'USER_ALREADY_BIND': 107, 107: "账号已被绑定",
        'AUTH_IS_NOT_ENOUGH': 108, 108: "权限不足",
        'ACCOUNT_BLOCKED': 109, 109: "账号已被封禁",
        'ROLE_BLOCKED': 110, 110: "角色已被封禁",
        'CREATE_ROLE_LIMIT': 111, 111: "该服务器创角已满",
    }
}
