import net from 'node:net';

export default class tcpProxy {
    constructor(client, server, callback) {
        this.server = server;
        this.client = client;
        this.callback = callback;

        this.createServer();
    }

    createServer() {
        net.createServer((socket) => this.handle(socket, net.createConnection(this.client.port, this.client.host)))
            .listen(this.server.port, this.server.host);
    }

    handle(server, client) {
        this.log(server, client);
        this.data(server, client);
        this.close(server, client);
    }

    log(socket, client) {
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
        socket.on("error", (err) => this.callback({
            type: "error",
            model: "server",
            log: err
        }));
        client.on("error", (err) => this.callback({
            type: "error",
            model: "client",
            log: err
        }));
    }

    data(socket, client) {
        socket.pipe(client);
        client.pipe(socket);
    }

    close(socket, client) {
        client.on('close', () => socket.end());
        socket.on('close', () => client.end());
    }
}
