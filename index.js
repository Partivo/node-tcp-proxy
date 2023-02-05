const { EventEmitter } = require('events');
const net = require('net');

function tcpProxy(target, options) {
    this.eventEmitter = new EventEmitter();

    this.target = target;
    this.options = options;
    this.createServer();

    return this.eventEmitter;
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

tcpProxy.prototype.createServer = function() {
    this.options.listen = this.options.listen.split(":");
    net.createServer((socket) => {
        const client = tcpProxy.createProxy(socket, {
            target: this.target
        });
        this.log(socket, client);
        socket.on('close', function() {
            client.emit('end');
        });
    }).listen(this.options.listen[1], this.options.listen[0]);
}

tcpProxy.prototype.log = function(socket, client) {
    const eventEmitter = this.eventEmitter;
    // Access
    eventEmitter.emit('access', {
        message: 'connect',
        remoteAddress: socket.remoteAddress
    });
    socket.on('end', function() {
        eventEmitter.emit('access', {
            message: "disconnect",
            remoteAddress: socket.remoteAddress
        });
    });

    // Error
    socket.on("error", function(err) {
        eventEmitter.emit('error', {
            message: "server",
            remoteAddress: socket.remoteAddress,
            error: err
        });
    });
    client.on("error", function(err) {
        eventEmitter.emit('error', {
            message: "upstream",
            remoteAddress: socket.remoteAddress,
            error: err
        });
    });
}

module.exports = tcpProxy;
