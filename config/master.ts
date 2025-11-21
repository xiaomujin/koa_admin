import {serverDevOption} from "./serverDevOption";

export var master = {
    'id': 'master',
    'host': serverDevOption.host,
    'port': serverDevOption.httpPort,
    'client_ip': serverDevOption.host,
    'client_port': 3001,
}