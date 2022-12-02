const EventEmitter = require('node:events');
const net = require('node:net');

export default class tcpProxy {
	constructor(target, options) {
		this.eventEmitter = new EventEmitter();

		this.target = target;
		this.options = options;
		this.#createServer();
		
		return this.eventEmitter;
	}

	#createServer() {
		this.options.listen = this.options.listen.split(":");
		net.createServer((socket) => {
			var client = tcpProxy.createProxy(socket, {
				target: this.target
			});
			this.#log(socket, client);
			socket.on('close', () => client.emit('end'));
		}).listen(this.options.listen[1], this.options.listen[0]);
	}

	static createProxy(socket, options) {
		const proxyEmitter = new EventEmitter();
		const target = options.target.split(":");

		const client = net.createConnection(target[1], target[0]);
		client.on('close', () => socket.end());

		socket.pipe(client);
		client.pipe(socket);
		
		proxyEmitter.on('end', () => client.end());
		client.on("error", (err) => proxyEmitter.emit('error', err));

		return proxyEmitter;
	}

	#log(socket, client) {
		// Access
		this.eventEmitter.emit('access', {
			message: 'connect',
			remoteAddress: socket.remoteAddress
		});
		socket.on('end', () => this.eventEmitter.emit('access', {
			message: "disconnect",
			remoteAddress: socket.remoteAddress
		}));

		// Error
		socket.on("error", (err) => this.eventEmitter.emit('error', {
			message: "server",
			remoteAddress: socket.remoteAddress,
			error: err
		}));
		client.on("error", (err) => this.eventEmitter.emit('error', {
			message: "upstream",
			remoteAddress: socket.remoteAddress,
			error: err
		}));
	}
}
