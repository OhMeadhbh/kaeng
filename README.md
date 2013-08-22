kaeng
=====

a simplified wrapper around nodejitsu's http-proxy

# Introduction

'kaeng' is a small package we use around the office to implement a simple
tls-aware, hostname-based reverse proxy. This code will listen on ports 80
and 443 on a "real" network interface and proxy HTTP and HTTPS requests to
ports on different ports on localhost based on the hostname in the request.

# Installation

To install with NPM, issue this command:

<pre>    npm install kaeng</pre>

Or, to get the (even more) bleeding edge code, use GIT:

<pre>    git clone git://github.com/OhMeadhbh/kaeng.git</pre>

# Configuration

Once you've downloaded the package, copy the <code>proxyroutes-example.json</code>
file to <code>proxyroutes.json</code> and open it in your favorite editor. The
example file shows a configuration with three "zones": production, development
and secure. Each zone is an element in the JSON object in the proxyroutes.json
file.

<pre>{
  "production": {
    "ssl": false,
    "port": 80,
    "router": {
      "local.example.com": "127.0.0.1:9000",
      "local.example.net": "127.0.0.1:9001",
      "local.example.org": "127.0.0.1:9002"
    }
  },
  "development": {
    "ssl": false,
    "port": 8080,
    "router": {
      "local.example.com": "127.0.0.1:19000",
      "local.example.org": "127.0.0.1:19002"
    }
  },
  "secure": {
    "ssl": true,
    "port": 443,
    "ciphers": "AES:!LOW:!MEDIUM:!aNULL:!eNULL:!EXPORT:!CAMELLIA:!DES:!3DES",
    "router": {
      "local.example.com": "127.0.0.1:29000"
      "local.example.net": "127.0.0.1:29001"
    }
  }
}</pre>

The first two zones (production and development) are non-secure
(i.e. - non https.) You can see this because the "ssl" member of the zone
object is "false". The "production" zone routes requests that come in from
port 80 to local ports 9000, 9001 or 9002 depending on the hostname in the
request.

If you wanted to deploy a service on local.example.com, you would build your
service normally, but instead of listening on port 80, you would listen on
port 9000 on the local interface (127.0.0.1).

The "secure" zone works the same way, except you have the option of adding
"ciphers" and "secureProtocol" members that describe the ciphers you want to
use and the version of TLS you want to support.

Before using the secure option, you must generate keys for each host specified
in the zone's router object. Keys are named <hostname>.key while certs are
<hostname>.crt. So, for example, in the example above, we would need the files:
local.example.com.key, local.example.com.crt, local.example.net.key and
local.example.net.crt before continuing.

You'll also need a default key and cert called "localhost.key" and
"localhost.crt". The default key is used if an unknown host is specified, so
it's up to you to determine how secure this key (and cert) should be. We
frequently use self-signed certs for the default. (For a quick and easy way
to generate a self signed cert, see <code>gssc</code> script at
<a href="https://gist.github.com/OhMeadhbh/6201808">https://gist.github.com/OhMeadhbh/6201808</a>.)

# Deployment

Once you've configured your proxy, install the pre-requesite packages with
the command:

<pre>    make</pre>

Once that completes, you can start it with the command:

<pre>    node kaeng.js --config file://proxyroutes.json</pre>

Assuming it works correctly and you're on a Debian-based system (including
most recent versions of Ubuntu) you can install it as a self-starting service
with the command:

<pre>    make install-deb</pre>

This will copy the kaeng package to <code>/opt/kaeng</code> and copy a startup
script into <code>/etc/init.d/kaeng</code>. Beware, however, as the startup
script assumes node is installed in <code>/opt/node</code>.
