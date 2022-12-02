const process = require('node:process');
const tcpProxy = require('./index.js');

const myArgs = process.argv.slice(2);

if(!myArgs[0] && !myArgs[1]) {
	console.log('Upstream IP or Port not found!');
	console.log('Example: tcp-proxy 127.0.0.1 8080');
	console.log('Optional: tcp-proxy 127.0.0.1 8080 -l 127.0.0.1 8888');
	process.exit(1);
}

const options = {};
if(myArgs[2] == "-l" || myArgs[2] == "-listen") options.listen = {
	host: myArgs[3],
	port: myArgs[4]
};

var proxy = new tcpProxy(`${myArgs[0]}:${myArgs[1]}`, options);
proxy.on('access', (data) => console.info(data));
proxy.on('error', (data) => console.error(data));

process.on("uncaughtException", (err) => {
	console.error(err);
	proxy.end();
});

process.on("SIGINT", () => proxy.end());
