'use strict';

const request = require('supertest');
const assert = require('assert');
const trustProxy = require('..');
const Koa = require('koa');

const LOCAL_IP = '::ffff:127.0.0.1';

describe('trustProxy without params', function () {
	const app = new Koa()
	app.use(trustProxy());
	app.use(async (ctx) => ctx.body = ctx.request.ip );
	const server = app.listen();
	it('should return straight ip if called without x-forwarded-for', function (done) {
        request(server).get('/')
			.expect(LOCAL_IP, done);
	});
	it('should return rightmost ip if nothing to trust in x-forwarded-for', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '5.5.5.5, 6.6.6.6, 7.7.7.7')
			.expect('7.7.7.7', done);
	});
	it('should return rightmost untrusted ip in x-forwarded-for', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '5.5.5.5, 6.6.6.6, 127.0.0.1')
			.expect('6.6.6.6', done);
	});
	it('should return leftmost ip in x-forwarded-for if all trusted', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '::1, 127.0.0.1')
			.expect('::1', done);
	});
	it('should ignore x-real-ip as when was not specified as trustparam', function (done) {
        request(server).get('/')
			.set('X-Real-IP', '99.88.77.66')
			.expect(LOCAL_IP, done);
	});
});

describe('trustProxy with proxylist "7.7.7.7, 8.8.8.8"', function () {
	const app = new Koa()
	app.use(trustProxy('7.7.7.7, 8.8.8.8'));
	app.use(async (ctx) => ctx.body = ctx.request.ip );
	const server = app.listen();
	it('x-forwarded-for should be completely ignored', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '5.5.5.5, 6.6.6.6')
			.expect(LOCAL_IP, done);
	});
});

describe('trustProxy with proxylist "7.7.7.7/8, 8.8.8.8/8"', function () {
	const app = new Koa()
	app.use(trustProxy('7.7.7.7, 8.8.8.8'));
	app.use(async (ctx) => ctx.body = ctx.request.ip );
	const server = app.listen();
	it('x-forwarded-for should be completely ignored', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '5.5.5.5, 6.6.6.6')
			.expect(LOCAL_IP, done);
	});
});

describe('trustProxy with proxylist "1.2.3.4, 127.0.0.1, 5.6.7.8"', function () {
	const app = new Koa()
	app.use(trustProxy('1.2.3.4, 127.0.0.1, 5.6.7.8'));
	app.use(async (ctx) => ctx.body = ctx.request.ip );
	const server = app.listen();
	it('should return rightmost untrusted proxy', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '6.5.4.3, 1.2.3.5, 5.6.7.8')
			.expect('1.2.3.5', done);
	});
});

describe('trustProxy with proxylist "1.2.3.4, 127.0.0.1, 5.6.7.8"', function () {
	const app = new Koa()
	app.use(trustProxy('1.2.3.4, 127.0.0.1, 5.6.7.8'));
	app.use(async (ctx) => ctx.body = ctx.request.ip );
	const server = app.listen();
	it('should return rightmost untrusted proxy', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '6.5.4.3, 1.2.3.5, 5.6.7.8')
			.expect('1.2.3.5', done);
	});
});

describe('trustProxy with proxylist "1.2.3.4, 127.0.0.1, 5.6.7.8" and trustheader "X-ReaL-Ip"', function () {
	const app = new Koa()
	app.use(trustProxy(['1.2.3.4', '127.0.0.1', '5.6.7.8'], 'X-ReaL-Ip'));
	app.use(async (ctx) => ctx.body = ctx.request.ip );
	const server = app.listen();
	it('should use trustedheader', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '6.5.4.3, 1.2.3.95, 5.6.7.8')
			.set('X-Real-IP', '6.5.4.3, 1.2.3.99, 5.6.7.8')
			.expect('1.2.3.99', done);
	});
	it('should not use x-forwarded-for', function (done) {
        request(server).get('/')
			.set('X-Forwarded-For', '6.5.4.3, 1.2.3.95, 5.6.7.8')
			.expect(LOCAL_IP, done);
	});
});
