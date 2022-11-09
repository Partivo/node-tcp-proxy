<h1 align="center">@partivo/tcp-proxy</h1>


## Example Code
```js
new tcpProxy({
	client: {
		host: '127.0.0.1', // Client Host
		port: 8888 // Client Port
	},
	server: {
		host: '127.0.0.1', // Server Host
		port: 8887 // Server Port
	}, 
	log: (data) => console.log(data) // Log
});
```

## Coming Soon
* Load Blancer
* CLI

