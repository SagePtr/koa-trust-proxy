[![Build Status](https://travis-ci.org/SagePtr/koa-trust-proxy.svg?branch=master)](https://travis-ci.org/SagePtr/koa-trust-proxy)
[![Coverage Status](https://coveralls.io/repos/github/SagePtr/koa-trust-proxy/badge.svg?branch=master)](https://coveralls.io/github/SagePtr/koa-trust-proxy?branch=master)

# koa-trust-proxy
Middleware for Koa2 that allows to trust specified proxies while distrusting another

Replaces app.proxy = true

## Installation

```js
$ npm install koa-trust-proxy
```

## Examples

```js
const Koa = require('koa');
const trustProxy = require('koa-trust-proxy');

const app = new Koa();

// This line is not needed
//app.proxy = true

// Use middleware instead
// 1st parameter is array or comma-separated list of trusted proxies, default ['127.0.0.1/8', '::1/128']
// 2nd parameter is trusted header, default is X-Forwarded-For
app.use(trustProxy('127.0.0.1, ::1', 'X-Real-IP'));
// You can use CIDRs as well
app.use(trustProxy('192.168.0.1/24, ::1/128', 'X-Real-IP'));

..........
```

## Aliases

This module also supports well-known aliases:

* loopback: 127.0.0.1/8, ::1/128,
* linklocal: 169.254.0.0/16, fe80::/10
* uniquelocal: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, fc00::/7

## License

  MIT
