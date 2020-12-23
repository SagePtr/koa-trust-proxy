'use strict';
const ip6addr = require('ip6addr');
// Simple proxy trusting middleware
// TODO: make proxylist somewhat compatible with https://expressjs.com/ru/guide/behind-proxies.html


// convert comma-separated ip list to array
function listToArray(str) {
    return str.split(',').map(x => x.trim());
}

// check if addr is enlisted
// TODO: add check against cidr ranges
function isAddrInList (addr, cidrs) {
    return cidrs.some(item => {
        return item.contains(addr);
    });
}

function koaTrustProxy (trustlist = ['127.0.0.1', '::1'], trustheader = 'x-forwarded-for') {
    
    // fold trusted header to lowercase
    trustheader = trustheader.toLowerCase();

    // check if proxylist is string, then split it
    if (typeof trustlist === 'string') {
        trustlist = listToArray(trustlist);
    }
    const cidrs = trustlist.map((ip) => ip.includes('/') ? ip6addr.createCIDR(ip): ip6addr.createAddrRange(ip, ip));

    // return middleware async function
    return async function (ctx, next) {

        let ip = ctx.socket.remoteAddress;

        // check if our addr belongs to proxy or there is no ip at all (in case of unix socket)
        if (!ctx.socket.remoteAddress || isAddrInList(ctx.socket.remoteAddress, cidrs)) {
            // check for trustheader presence
            let header = ctx.request.headers[trustheader];
            if (header) {
                let ips = listToArray(header);
                // find first rightmost untrusted address, or leftmost if all trusted
                for (let i = ips.length-1; i >= 0; i--) {
                    ip = ips[i];
                    if (!isAddrInList(ip, cidrs)) break;
                }
            }
        }

        ctx.request.ip = ip;
        
        // call next middleware in chain
        await next();
    }
}

module.exports = koaTrustProxy;
