import {serverDevOption} from "./serverDevOption";
// master 参数在此
export var master = {
    'id': 'master',
    'host': serverDevOption.host,
    'port': serverDevOption.httpPort,
    'client_ip': serverDevOption.host,
    'client_port': 3001,
}