# @partivo/tcp-proxy [![Node.js Package](https://github.com/Partivo/node-tcp-proxy/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/Partivo/node-tcp-proxy/actions/workflows/npm-publish.yml)

```js
new tcpProxy({
	host: '127.0.0.1', // Client Host
	port: 8888 // Client Port
}, {
	host: '127.0.0.1', // Server Host
	port: 8887 // Server Port
}, (data) => {
	console.log(data); // Log
});
```
