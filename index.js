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

const wellKnownNames = {
    loopback: ['127.0.0.1/8', '::1/128'],
    linklocal: ['169.254.0.0/16', 'fe80::/10'],
    uniquelocal: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', 'fc00::/7'],
    docker: ['172.16.0.0/12'],
}

const flattenArray = (arr) => arr.reduce((acc, val) => acc.concat(val), []);

function mapCidrs(addresses) {
    const ipOrCidrs = flattenArray(addresses.map(addr => wellKnownNames[addr] || addr));
    const cidrs = ipOrCidrs.map(ipOrCidr => ipOrCidr.includes('/') ? ip6addr.createCIDR(ipOrCidr): ip6addr.createAddrRange(ipOrCidr, ipOrCidr));
    return cidrs
}

function koaTrustProxy (trustlist = 'loopback', trustheader = 'x-forwarded-for') {
    
    // fold trusted header to lowercase
    trustheader = trustheader.toLowerCase();

    // check if proxylist is string, then split it
    if (typeof trustlist === 'string') {
        trustlist = listToArray(trustlist);
    }
    const cidrs = mapCidrs(trustlist);

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
