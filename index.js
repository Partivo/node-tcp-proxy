const EventEmitter = require('node:events');
const net = require('node:net');

function tcpProxy(target, options) {
	this.eventEmitter = new EventEmitter();

	this.target = target;
	this.options = options;
	this.createServer();
		
	return this.eventEmitter;
}

tcpProxy.prototype.createServer = function() {
	this.options.listen = this.options.listen.split(":");
	net.createServer(function(socket) {
		var client = tcpProxy.createProxy(socket, {
			target: this.target
		});
		this.log(socket, client);
		socket.on('close', function() {
			client.emit('end');
		});
	}).listen(this.options.listen[1], this.options.listen[0]);
}

tcpProxy.createProxy = function(socket, options) {
	const proxyEmitter = new EventEmitter();
	const target = options.target.split(":");

	const client = net.createConnection(target[1], target[0]);
	client.on('close', function() {
		socket.end();
	});

	socket.pipe(client);
	client.pipe(socket);
		
	proxyEmitter.on('end', function() {
		client.end();
	});
	client.on("error", function(err) {
		proxyEmitter.emit('error', err);
	});

	return proxyEmitter;
}

tcpProxy.prototype.log = function(socket, client) {
	// Access
	this.eventEmitter.emit('access', {
		message: 'connect',
		remoteAddress: socket.remoteAddress
	});
	socket.on('end', function() {
		this.eventEmitter.emit('access', {
			message: "disconnect",
			remoteAddress: socket.remoteAddress
		});
	});

	// Error
	socket.on("error", function(err) {
		this.eventEmitter.emit('error', {
			message: "server",
			remoteAddress: socket.remoteAddress,
			error: err
		});
	});
	client.on("error", function(err) {
		this.eventEmitter.emit('error', {
			message: "upstream",
			remoteAddress: socket.remoteAddress,
			error: err
		});
	});
}

module.exports = tcpProxy;
