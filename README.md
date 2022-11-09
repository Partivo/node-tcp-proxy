<h1 align="center">@partivo/tcp-proxy</h1>
It is a simple tcp proxy written in NodeJS. You can support development. If there is a problem, you can open Issues.

## Example Code
```js
new tcpProxy('127.0.0.1', 8888, {
	listen: {
		host: '127.0.0.1', // Listen Host (Optional)
		port: 8887 // Listen Port (optional)
	}, 
	log: (data) => console.log(data) // Log
});
```

## Coming Soon
* Load Blancer
* CLI (Added but still in the test phase)

