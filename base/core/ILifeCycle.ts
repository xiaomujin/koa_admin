/**
 * 服务器生命周期
 */
export interface ILifeCycle {
    beforeStartup?: () => Promise<any>;
    afterStartup?: () => Promise<any>;
    // 暂时弃用
    afterStartupAll?: () => Promise<any>;
    loadOptions?: () => Promise<any>;
}
