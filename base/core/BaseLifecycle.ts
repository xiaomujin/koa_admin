import {App} from "../App";
import * as fs from "fs";
import * as path from "path";
import {ILifeCycle} from "./ILifeCycle";

export class BaseLifecycle implements ILifeCycle {

    constructor() {

    }

    /**
     * 加载服务器配置
     */
    async loadOptions() {
        App.loadOptions();
        let dir = "../../config";
        let abs_path = path.join(__dirname, dir)
        fs.watch(abs_path, (event, name) => {
            let watchRes = App.SystemUtil.safeRunFunc(() => {
                if (event === 'change') {
                    let routePath = path.join(abs_path, name);
                    let moduleObj = require.cache[path.join(abs_path, name)];
                    if (moduleObj && moduleObj.parent) {
                        moduleObj.parent.children.splice(moduleObj.parent.children.indexOf(moduleObj), 1);
                    }
                    delete require.cache[path.resolve(__dirname, routePath)];
                    App.loadOptions();
                    console.warn(`options 热更新 成功`, App.options)

                }
            }, this);
        });
    }

}
