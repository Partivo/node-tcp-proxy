import net from 'node:net';

export default class tcpProxy {
    constructor(ip, port, options) {
        this.ip = ip;
        this.port = port;
        this.options = options;
        
        this.client = [];
        this.#createServer();
    }

    #createServer() {
        this.options.listen.host = this.options.listen.host ? this.options.listen.host : '127.0.0.1';
        this.options.listen.port = this.options.listen.port ? this.options.listen.port : this.port;
        this.server = net.createServer((socket) => this.#handle(socket, net.createConnection(this.port, this.ip)))
        this.server.listen(this.options.listen.port, this.options.listen.host);
    }

    #handle(server, client) {
        this.client.push(client);
        this.#log(server, client);
        this.#data(server, client);
        this.#close(server, client);
    }

    #log(socket, client) {
        // Access
        this.options.log({
            type: "access",
            log: {
                time: new Date().toISOString(),
                message: 'connect',
                remoteAddress: socket.remoteAddress,
                remotePort: socket.remotePort,
                server: {
                    host: socket.localAddress,
                    port: socket.localPort
                }
            }
        });
        socket.on('end', () => this.options.log({
            type: "access",
            log: {
                time: new Date().toISOString(),
                message: 'disconnect',
                remoteAddress: socket.remoteAddress,
                remotePort: socket.remotePort,
                server: {
                    host: socket.localAddress,
                    port: socket.localPort
                }
            }
        }));

        // Error
        socket.on("error", (err) => this.options.log({
            type: "error",
            log: {
                time: new Date().toISOString(),
                message: "server",
                ...err
            }
        }));
        client.on("error", (err) => this.options.log({
            type: "error",
            log: {
                time: new Date().toISOString(),
                message: "client",
                ...err
            }
        }));
    }

    #data(socket, client) {
        socket.pipe(client);
        client.pipe(socket);
    }

    #close(socket, client) {
        client.on('close', () => socket.end());
        socket.on('close', () => client.end());
    }
    
    end() {
        this.server.close();
        for (var id in this.client) {
            this.client[id].destroy();
        }
        this.server.unref();
    }
}
