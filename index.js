import net from 'node:net';

export default class tcpProxy {
	constructor(target, options) {
		this.target = target;
		this.options = options;
        
		this.client = [];
		this.#createServer();
	}

	#createServer() {
		this.options.listen.host = this.options.listen.host || '127.0.0.1';
		this.options.listen.port = this.options.listen.port || this.target.split(":")[1];
		this.server = net.createServer((socket) => {
			var client = tcpProxy.createProxy(socket, this.target, (err) => this.options.log({
				type: "error",
				log: {
					time: new Date().toISOString(),
					message: "upstream",
					...err
				}
			}));
			this.client.push(client);
			this.#log(socket);
			socket.on('close', () => client.end());
		});
		this.server.listen(this.options.listen.port, this.options.listen.host);
	}

	static createProxy(socket, target, error) {
		target = target.split(":");
		const client = net.createConnection(target[1], target[0]);
		client.on("error", error);
		
		socket.pipe(client);
		client.pipe(socket);
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
				upstream: this.target,
				listen: {
					host: this.options.listen.host,
					port: this.options.listen.port
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
				upstream: this.target,
				listen: {
					host: this.options.listen.host,
					port: this.options.listen.port
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
	}

	end() {
		this.server.close();
		for (var id in this.client) {
			this.client[id].destroy();
		}
		this.server.unref();
	}
}
