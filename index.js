import net from 'node:net';

export default class tcpProxy {
    constructor(client, server, callback) {
        this.client = client;
        this.server = server;
        this.callback = callback;

        this.#createServer();
    }

    #createServer() {
        net.createServer(this.#handle)
            .listen(this.server.port, this.server.host);
    }

    #createConnection() {
        return net.createConnection(this.client.port, this.server.host);
    }

    #handle(socket) {
        var client = this.#createConnection();

        this.#log(socket, client);
        this.#data(socket, client);
        this.#close(socket, client);
    }

    #log(socket, client) {
        // Access
        this.callback({
            type: "access",
            log: {
                message: 'connect',
                remoteAddress: socket.remoteAddress,
                remotePort: socket.remotePort,
                server: {
                    host: socket.localAddress,
                    port: socket.localPort
                }
            }
        });
        socket.on('end', () => this.callback({
            type: "access",
            log: {
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
        socket.on("error", (err) => console.log({
            type: "error",
            model: "server",
            log: err
        }));
        client.on("error", (err) => console.log({
            type: "error",
            model: "client",
            log: err
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
}
