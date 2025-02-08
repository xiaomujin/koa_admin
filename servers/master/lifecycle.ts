import {BaseLifecycle} from "../../base/core/BaseLifecycle";
import {ILifeCycle} from "../../base/core/ILifeCycle";
import {App} from "../../base/App";
import {master} from "../../config/master";


export default function () {
    return new Lifecycle();
}


class Lifecycle extends BaseLifecycle implements ILifeCycle {
    async beforeStartup() {
        App.startParam = Object.assign(App.startParam, master)
        App.startParam.isStatic = true
        App.startParam.client_ip = master.client_ip
        App.startParam.client_port = master.client_port
        App.startParam.port = master.port
        App.startParam.id = master.id
    }

    async afterStartup() {
        console.log(App.startParam.id, '启动完成');
    }


}


