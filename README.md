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
// 1st parameter is array or comma-separated list of trusted proxies, default ['127.0.0.1', '::1']
// 2nd parameter is trusted header, default is X-Forwarded-For
app.use(trustProxy('127.0.0.1, ::1', 'X-Real-IP'));

..........
```

## License

  MIT
