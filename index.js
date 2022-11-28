import net from 'node:net';

export default class tcpProxy {
	constructor(target, options) {
		this.target = target;
		this.options = options;
		this.#createServer();
	}

	#createServer() {
		this.options.listen.host = this.options.listen.host || '127.0.0.1';
		this.options.listen.port = this.options.listen.port || this.target.split(":")[1];
		net.createServer((socket) => {
			var client = tcpProxy.createProxy(socket, this.target);
			this.#log(socket, client);
			socket.on('close', () => client.end());
		}).listen(this.options.listen.port, this.options.listen.host);
	}

	static createProxy(socket, target) {
		target = target.split(":");
		const client = net.createConnection(target[1], target[0]);
		client.on('close', () => socket.end());

		socket.pipe(client);
		client.pipe(socket);

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
				listen: {
					host: this.options.listen.host,
					port: this.options.listen.port
				},
				...err
			}
		}));
		client.on("error", (err) => this.options.log({
			type: "error",
			log: {
				time: new Date().toISOString(),
				message: "upstream",
				upstream: this.target,
				...err
			}
		}));
	}
}
