import { argv } from 'node:process';
import tcpProxy from './index.js';

const myArgs = process.argv.slice(2);

if(!myArgs[0] && !myArgs[1]) {
	console.log('Upstream IP or Port not found!');
	console.log('Example: tcp-proxy 127.0.0.1 8080');
	console.log('Optional: tcp-proxy 127.0.0.1 8080 -l 127.0.0.1 8888');
	process.exit(1);
}

const options = {
	log: (data) => {
		if(data.type == "access") console.info(JSON.stringify(data.log));
		else if(data.type == "error") console.error(JSON.stringify(data.log));
		else console.warn(data);
	}
};

if(myArgs[2] == "-l" || myArgs[2] == "-listen") options.listen = {
	host: myArgs[3],
	port: myArgs[4]
};

var proxy = new tcpProxy(`${myArgs[0]}:${myArgs[1]}`, options);

process.on("uncaughtException", (err) => {
	console.error(err);
	proxy.end();
});

process.on("SIGINT", () => proxy.end());
