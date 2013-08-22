// Kaeng is the http proxy server daemon i use to route requests to the correct
// server node. At it's core is a function that reads a list of proxy
// descriptors, then starts a http-proxy for each descriptor.

var props     = require( 'node-props' );
var httpProxy = require( 'http-proxy' );
var fs        = require( 'fs' );
var https     = require( 'https' );
var crypto    = require( 'crypto' );

var servers   = {};
var defaults;

process.on( 'SIGHUP', function () {
  stop_servers( servers, begin_proxy );
} );

function begin_proxy ( ) {
    props.read( function ( p ) {
      defaults = p;
      start_servers( defaults, servers );
    } );
}

function stop_servers ( s, next ) {
    for( var item in s ) {
	var current = s[ item ];
	current.close();
    }

    if( next ) {
        setTimeout( function () { next();}, 10000 );
    }
}

function start_servers ( p, s ) {
  var current;
  var listen_on_port;
  var routes;
  var options;

  try {
    for( var item in p ) {
	current = p[ item ];
	listen_on_port = current.port;
	
	if( current.ssl ) {
          s[ item ] = httpProxy.createServer( _constructHttpsOpts( current ) );
          s[ item ].listen( listen_on_port );
	} else {
	    routes = current.router;

	    options = {
		hostnameOnly: true,
		router: current.router
	    };

	    s[ item ] = httpProxy.createServer( options );
	    s[ item ].listen( listen_on_port );
	}
    }
  } catch( e ) {
    console.log( e.toString() );
    console.log( e.stack );
  }
}

function _constructHttpsOpts( input ) {
  var certs = {};

  var output = {
    hostnameOnly: true,
    router: input.router,
    https: {
      SNICallback: function( host ) {
        return certs[ host ];
      },
      key: fs.readFileSync( "localhost.key" ),
      cert: fs.readFileSync( "localhost.crt" )
    }
  };

  if( input.ciphers ) {
    output.https.ciphers = input.ciphers;
  }

  if( input.secureProtocol ) {
    output.https.secureProtocol = input.secureProtocol;
  }

  for( var i in input.router ) {
    certs[ i ] = crypto.createCredentials( {
      key: fs.readFileSync( i + '.key' ),
      cert: fs.readFileSync( i + '.crt' )
    } ).context;
  }

  return output;
}

begin_proxy( );