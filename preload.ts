import {App} from "./base/App";


declare global {
    interface UserRpc {

    }

    interface SySRpc {

    }

    // 与ServerType一致
    interface PrivateRpc {

    }

}

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
export function preload() {
    // global["App"] = App;
    App.SystemUtil.InitLog4js();
    // 使用bluebird输出完整的promise调用链
    // global.Promise = Promise;
    // 开启长堆栈
    // Promise.config({
    //     // Enable warnings
    //     warnings: true,
    //     // Enable long stack traces
    //     longStackTraces: true,
    //     // Enable cancellation
    //     cancellation: true,
    //     // Enable monitoring
    //     monitoring: true
    // });

    // 自动解析ts的sourcemap
    require('source-map-support').install({
        handleUncaughtExceptions: false
    });


    // 捕获普通异常
    process.on('uncaughtException', function (err) {
        console.warn(App.startParam.id);
        console.warn(err);

    });

    // 捕获async异常
    process.on('unhandledRejection', (reason: any, p) => {
        console.warn(App.startParam.id + 'Caught Unhandled Rejection at:' + p + 'reason:' + reason, "ERR_ASYNC", "stack", reason.stack);
        console.warn(p);
    });

}

