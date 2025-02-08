const path = require('path');
const fs = require('fs');
const http = require('http2');
const https = require('https');
const net = require('net');
const os = require('node:os');

/**
 * Enable request handler being in HTTPS mode.
 * @param handler {RequestListener}
 * @param httpsConfig {{keyPath: string, certPath: string, [forceHttpsWhenEnabled]: boolean}}
 * @return {Server & { https: Server, http: Server } }
 */
export function enableHandlerHttps(handler, httpsConfig) {
    const options = {
        key: fs.readFileSync(path.resolve(httpsConfig.keyPath)),
        cert: fs.readFileSync(path.resolve(httpsConfig.certPath)),
        secureOptions: os.constants.signals.SSL_OP_NO_SSLv2 | os.constants.signals.SSL_OP_NO_TLSv1 | os.constants.signals.SSL_OP_NO_TLSv1_1 | os.constants.signals.SSL_OP_NO_TLSv1_2
// secureProtocol: ''
    };

    // If no need to forcibly redirect HTTP requests to same path HTTPS route.
    if (!httpsConfig.forceHttpsWhenEnabled) {
        // OK. Normal flow.
        return https.createServer(options, handler);
    }

    /**
     * Automatically redirect http request to https.
     * Only change the protocol.
     * @see https://stackoverflow.com/a/42019773
     */
    const server = net.createServer(conn => {
        conn.once('data', buffer => {
            // Pause the socket.
            conn.pause();

            const firstByte = buffer[0];
            const httpReqFirstByteRange = [32, 127];
            const httpsReqFirstByte = 22;

            // Determine what proxy we need to use.
            let protocol;

            if (firstByte === httpsReqFirstByte) {
                protocol = 'https';
            } else if (
                httpReqFirstByteRange[0] < firstByte &&
                firstByte < httpReqFirstByteRange[1]
            ) {
                protocol = 'http';
            }

            const proxy = server[protocol];
            if (proxy) {
                // Push the buffer back onto the front of the data stream.
                conn.unshift(buffer);
                // Emit the socket to the HTTP(s) server.
                proxy.emit('connection', conn);
            }

            // As of NodeJS 10.x the socket must be
            // resumed asynchronously or the socket
            // connection hangs, potentially crashing
            // the process. Prior to NodeJS 10.x
            // the socket may be resumed synchronously.
            process.nextTick(() => {
                conn.resume();
            });
        });
    });

    // HTTP server proxy.
    server.http = http.createServer((req, res) => {
        // Force redirect.
        const host = req.headers['host'];
        // Use 301 - Moved Permanently.
        // To notify browsers that update the bookmarks and cache the redirection.
        res.writeHead(301, {Location: 'https://' + host + req.url});
        res.end();
    });

    // HTTPS server proxy.
    server.https = https.createServer(options, handler);

    return server;
}
