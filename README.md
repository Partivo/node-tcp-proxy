<h1 align="center">@partivo/tcp-proxy</h1>
It is a simple tcp proxy written in NodeJS. You can support development. If there is a problem, you can open Issues.

## Example Code
```js
var proxy = new tcpProxy('127.0.0.1:8888', {
	listen: '127.0.0.1:8887'
});

proxy.on('access', (data) => console.info(data));
proxy.on('error', (data) => console.error(data));
```

## Coming Soon
* IPv6 Support
* Load Blancer
* CLI (Added but still in the test phase)
