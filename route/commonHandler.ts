import {BaseHandler} from "../base/core/BaseHandler";

export default function () {
    return new commonHandler();
}
export var routeName: string = "common";

export class commonHandler extends BaseHandler {
    // async preHandle(msg, session: any) {
    //
    // }
    //
    // public afterHandle(msg, session: any) {
    //
    // }

    async test(msg: any, session: any) {
        return this.suc({})
    }

}
