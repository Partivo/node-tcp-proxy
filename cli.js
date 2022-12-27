#!/usr/bin/env node

var process = require("node:process");
var tcpProxy = require("./index");

const myArgs = process.argv.slice(2);

if(!myArgs[0]) {
	console.log('Upstream IP or Port not found!');
	console.log('Example: tcp-proxy 127.0.0.1:8080');
	console.log('Optional: tcp-proxy 127.0.0.1:8080 -l 127.0.0.1:8888');
	process.exit(1);
}

const options = {};
if(myArgs[1] == "-l" || myArgs[1] == "-listen") options.listen = myArgs[2];

var proxy = new tcpProxy(myArgs[0], options);
proxy.on('access', function(data) {
	console.info(JSON.stringify({
		time: new Date().toISOString(),
		level: 'info',
		...data
	}));
});
proxy.on('error', function(data) {
	console.error(JSON.stringify({
		time: new Date().toISOString(),
		level: 'error',
		...data
	}));
});
