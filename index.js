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
        this.server = net.createServer((socket) => this.#handle(socket, this.#createConnection()))
        this.server.listen(this.options.listen.port, this.options.listen.host);
    }

    #createConnection() {
        // net.createConnection(this.port, this.ip)
        const client = new net.Socket();
        client.connect(this.port, this.ip);
        return client;
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
                forward: `${socket.localAddress}:${socket.localPort}`,
                listen: `${client.remoteAddress}:${client.remotePort}`
            }
        });
        socket.on('end', () => this.options.log({
            type: "access",
            log: {
                time: new Date().toISOString(),
                message: 'disconnect',
                remoteAddress: socket.remoteAddress,
                remotePort: socket.remotePort,
                forward: `${socket.localAddress}:${socket.localPort}`,
                listen: `${client.remoteAddress}:${client.remotePort}`
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
