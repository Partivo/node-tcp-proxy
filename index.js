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
        this.server = net.createServer((socket) => {
			var client = tcpProxy.createConnection(this.ip, this.port, socket, (err) => this.options.log({
            	type: "error",
            	log: {
                	time: new Date().toISOString(),
                	message: "client",
                	...err
            	}
			}));
            this.client.push(client);
            this.#log(socket);
            socket.on('close', () => client.end());
        });
        this.server.listen(this.options.listen.port, this.options.listen.host);
    }

    static createConnection(ip, port, socket, error) {
        const client = net.createConnection(port, ip);
        
        socket.pipe(client);
        client.pipe(socket);
        
        client.on("error", (err) => error(error));
        client.on('close', () => socket.end());
		return client;
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
    }

    end() {
        this.server.close();
        for (var id in this.client) {
            this.client[id].destroy();
        }
        this.server.unref();
    }
}
