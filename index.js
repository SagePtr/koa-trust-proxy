'use strict';

// Simple proxy trusting middleware
// TODO: make proxylist somewhat compatible with https://expressjs.com/ru/guide/behind-proxies.html

// convert comma-separated ip list to array
function listToArray(str) {
    return str.split(',').map(x => x.trim());
}

// check if addr is enlisted
// TODO: add check against cidr ranges
function isAddrInList (addr, trustlist) {
    return trustlist.some(item => {
        return (addr == item) || (addr == '::ffff:' + item);
    });
}

function koaTrustProxy (trustlist = ['127.0.0.1', '::1'], trustheader = 'x-forwarded-for') {
    
    // fold trusted header to lowercase
    trustheader = trustheader.toLowerCase();

    // check if proxylist is string, then split it
    if (typeof trustlist === 'string') {
        trustlist = listToArray(trustlist);
    }

    // return middleware async function
    return async function (ctx, next) {

        let ip = ctx.socket.remoteAddress;

        // check if our addr belongs to proxy
        if (isAddrInList(ctx.socket.remoteAddress, trustlist)) {
            // check for trustheader presence
            let header = ctx.request.headers[trustheader];
            if (header) {
                let ips = listToArray(header);
                // find first rightmost untrusted address, or leftmost if all trusted
                for (let i = ips.length-1; i >= 0; i--) {
                    ip = ips[i];
                    if (!isAddrInList(ip, trustlist)) break;
                }
            }
        }

        ctx.request.ip = ip;
        
        // call next middleware in chain
        await next();
    }
}

module.exports = koaTrustProxy;