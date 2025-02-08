import {RouteUtil} from "../tool/RouteUtil";
import {SystemUtil} from "./util/SystemUtil";
import {application} from "../app";
import {ObjectUtils} from "./util/ObjectUtils";
import {MsgUtil} from "./util/MsgUtil";
import {KoaApp} from "./koaApp";


export class StartParamDefine {
    id: string
    port: number
    serverType: string
    nodePath: string
    appPath: string
    dev: boolean
    client_ip: string
    client_port: number
    ws_port: number
    isStatic: boolean
    isForce: boolean
    // 懒惰模式 handler config 都是不预加载
    lazy: boolean
    started: boolean
}

declare global {
    interface UserRpc {

    }
}


/**
 永远跟党走，心中有党，事业理想。
 ⣿⣿⣿⣿⣿⠟⠋⠄⠄⠄⠄⠄⠄⠄⢁⠈⢻⢿⣿⣿⣿⣿⣿⣿⣿
 ⣿⣿⣿⣿⣿⠃⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⡀⠭⢿⣿⣿⣿⣿
 ⣿⣿⣿⣿⡟⠄⢀⣾⣿⣿⣿⣷⣶⣿⣷⣶⣶⡆⠄⠄⠄⣿⣿⣿⣿
 ⣿⣿⣿⣿⡇⢀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⠄⠄⢸⣿⣿⣿⣿
 ⣿⣿⣿⣿⣇⣼⣿⣿⠿⠶⠙⣿⡟⠡⣴⣿⣽⣿⣧⠄⢸⣿⣿⣿⣿
 ⣿⣿⣿⣿⣿⣾⣿⣿⣟⣭⣾⣿⣷⣶⣶⣴⣶⣿⣿⢄⣿⣿⣿⣿⣿
 ⣿⣿⣿⣿⣿⣿⣿⣿⡟⣩⣿⣿⣿⡏⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
 ⣿⣿⣿⣿⣿⣿⣹⡋⠘⠷⣦⣀⣠⡶⠁⠈⠁⠄⣿⣿⣿⣿⣿⣿⣿
 ⣿⣿⣿⣿⣿⣿⣍⠃⣴⣶⡔⠒⠄⣠⢀⠄⠄⠄⡨⣿⣿⣿⣿⣿⣿
 ⣿⣿⣿⣿⣿⣿⣿⣦⡘⠿⣷⣿⠿⠟⠃⠄⠄⣠⡇⠈⠻⣿⣿⣿⣿
 ⣿⣿⣿⣿⡿⠟⠋⢁⣷⣠⠄⠄⠄⠄⣀⣠⣾⡟⠄⠄⠄⠄⠉⠙⠻
 ⡿⠟⠋⠁⠄⠄⠄⢸⣿⣿⡯⢓⣴⣾⣿⣿⡟⠄⠄⠄⠄⠄⠄⠄⠄
 ⠄⠄⠄⠄⠄⠄⠄⣿⡟⣷⠄⠹⣿⣿⣿⡿⠁⠄⠄⠄⠄⠄⠄⠄⠄
 */
export class App {
    public static cacheMap = {}
    public static app: application
    public static koaApp: KoaApp

    public static startParam: StartParamDefine
    public static routeUtil: RouteUtil

    // 示例 C:\work\4、服务端\game_server
    public static root: string
    public static startTime: Date

    public static get SystemUtil(): SystemUtil {
        return SystemUtil.getInstance()
    }

    public static get ObjectUtils(): ObjectUtils {
        return ObjectUtils.getInstance()
    }

    public static get MsgUtil(): MsgUtil {
        return MsgUtil.getInstance()
    }


    public static getKey(key: any): any
    public static getKey<T>(key: any): T
    public static getKey(key: any) {
        return App.cacheMap[key]
    }

    public static setKey(key: any, value: any): void {
        App.cacheMap[key] = value;
    }

    public static _options: any;

    public static get options() {
        if (!App._options) {
            App.loadOptions();
        }
        return this._options;
    }

    public static loadOptions(): void {
        this._options = require("../config/serverDevOption").serverDevOption;

    }
}
