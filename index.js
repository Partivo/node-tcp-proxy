import net from 'node:net';

export default class tcpProxy {
    constructor(data) {
        this.data = data;
        this.#createServer();
    }

    #createServer() {
        this.server = net.createServer((socket) => this.#handle(socket, net.createConnection(this.data.client.port, this.data.client.host)))
        this.server.listen(this.data.server.port, this.data.server.host);
    }

    #handle(server, client) {
        this.client[] = client;
        this.#log(server, client);
        this.#data(server, client);
        this.#close(server, client);
    }

    #log(socket, client) {
        // Access
        this.data.log({
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
        socket.on('end', () => this.data.log({
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
        socket.on("error", (err) => this.data.log({
            type: "error",
            log: {
                time: new Date().toISOString(),
                message: "server",
                ...err
            }
        }));
        client.on("error", (err) => this.data.log({
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
