// The port to listen for client connctions.
var clientPort = 7541;
// Http protocol 
var http = require('http');
// File serving
var fs = require('fs');
// Validates the existance of files.
var path = require('path');
// Sockets
var io = require('./lib/socket.io');		

var server = http.createServer( function ( request , response ) {
 
    console.log('request starting...');
	
    var filePath = '.' + request.url;

    if ( filePath == './' ){// Just the root, localtion of server.js. Will only enter here initally.
        filePath = './index.htm';// Serve html page.
	}
	
    var extname = path.extname( filePath );
	
    var contentType = 'text/html';
	
    switch ( extname ) {
        case '.js':// Serving some script.
            contentType = 'text/javascript';
			filePath = './script'+request.url;
			console.log( "Serving JS" ); 
            break;
        case '.css':// Serving some style
            contentType = 'text/css';
			filePath = '..'+request.url;
			console.log( "Serving CSS" ); 
            break;
		case '.png':// We're serving an image.
            contentType = 'image/png';
			filePath = '.'+request.url;
			console.log( "Serving PNG" ); 
            break;
		case '.jpg':// We're serving an image.
            contentType = 'image/jpg';
			filePath = '.'+request.url;
			console.log( "Serving JPG" ); 
            break;
		case '.dae':// We're serving an image.
            contentType = 'text/plain';
			filePath = '.'+request.url;
			console.log( "Serving DAE" ); 
            break;
    }
     
    path.exists( filePath, function(exists) {// Check to see if the file exists
     
        if (exists) {// Returned from the callback, checking to see if valid.
			// Read file from disk and trigger callback.
            fs.readFile( filePath, function(error, content) {
                if (error) {
					// If there's and error throw 500
                    response.writeHead(500);
                    response.end();
                }
                else {
					// Otherwise return the file.
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
			// Throw 404 if the file isn't there.
            response.writeHead(404);
            response.end();
        }
	});
	
});// End of Http create server.

var socket = io.listen( server ); 		// Socket IO server instance.
var users = [];							// List of connected players.
var interfaces = [];
var userCount = 0;						// Number of users connected.
var map = [];

/*		EXAMPLE USE
	socket.sockets.emit('updatechat', client.username, message );		// Send to everyone, including me.
	socket.sockets.send( 'updatechat', client.username, message );	    // Send to everyone but me.
	client.emit('updatechat', "Please enter your user name to chat");	// Send to just me.
	
*/
socket.sockets.on( 'connection', function( client ){
	
	
	//				(1)
	// GET PLAYERS, SEND TO JUST ME.
	//
	client.on('getPlayers', function() {
		
		// Why in gods name do I have to do this shit?
		var test = {};
		var count=0;
		for ( index in users){
			count++;
			test[ count ] = users[ index ];
		
		}

		client.emit( 'heresPlayersFromServer', test );// Whys is this null!?

	});
	
	
	// 				(2)
	// STORE ME AS A USER, TELL EVERYONE INCLUDING ME COS I NEED MY IP.
	//	
	client.on('registerMeInServer', function( data ){
		console.log("Register Me In Server was called on the server.");
		
		// Construct a map from the new player.
		var map = { "name": "Bot",
		"pos":data.pos,
		"ip":client.handshake.address.address,
		"kinect":undefined,
		"id":undefined,
		"meshName":undefined
		};
	
		users[ client.handshake.address.address ] =  map ;	

		client.emit( 'registerSelf', { player : users[ client.handshake.address.address ] } );
		
		socket.sockets.emit( 'RegisterNewUser', { player:users[ client.handshake.address.address ], ip:client.handshake.address.address }  );
	});
	
	
	// 				(3)
	// UPDATE ME AND TELL EVERYONE BUT ME.
	//
	client.on( 'updateMe', function( me ) {
	
		console.log("Update me was called on the server.");
		
		if( users[ me.ip ] !== undefined){
		
			users[ me.ip ].pos = me.pos;
			users[ me.ip ].kinect = me.kinect;
		}
		else
		{
			console.log( " Unregistered user "+ me.ip );return;		
		}
		
		socket.sockets.send( 'updateHim', users[ me.ip] );
		socket.sockets.emit( 'updateHim', users[ me.ip] );		// Send to everyone, including me.
		socket.sockets.send( 'updateHim', users[ me.ip] );	    // Send to everyone but me.
		client.emit( 'updateHim', users[ me.ip] );				// Send to just me.

	});
	
	// 				(4)
	// TELL EVERYONE I'M OFF AND DELETE ME.
	//
	client.on('disconnect', function(){
		
		console.log("User disconnected");
		socket.sockets.emit( 'deleteHim', users[ client.handshake.address.address ] );		// Send to everyone, including me.
		// Tell the users that some one has quit so tey can remve from their scenes.
		delete users[ client.handshake.address.address ];
	});
	
	client.on( 'test', function(){
		
		var test = {};
		var count=0;
		for ( index in users){
			count++;
			test[ count ] = users[ index ];
		
		}
		socket.sockets.send( 'test', test );
		socket.sockets.emit( 'test', test );		
		socket.sockets.send( 'test', test );	  
		client.emit( 'test', test );		
	});

});// End of 'onConnection'

// Listen for connection
server.listen( clientPort );


var javaPort = 7540;
var javaServer = require('net').createServer();

javaServer.on('listening', function () {

    console.log('Server is listening on for kinect data on :' + javaPort);
});


javaServer.on('error', function ( e ) {

    console.log('Server error: ');// + e.code);
});

javaServer.on('close', function () {

    console.log('Server closed');
});


var dataBuffer = "";
var newlineIndex = 0
var kinectSynced = false;

//
// 
//
javaServer.on('connection', function ( javaSocket ) {
	
    // Store the address of the java client.
    var clientAddress = javaSocket.address().address + ':' + javaSocket.address().port;
	var interfaceIpAddress = javaSocket.address().address;
	console.log("An interface connection was detected, "+ interfaceIpAddress );
	interfaces[ interfaceIpAddress ] = {};
	
		/* USER
		{
			name : player._name,
			id	: player._userId,
			pos : player.getPosition, 
			kinect : player._kinectData, 
			ip : player._id,
			mesh : player._meshName 
			visible : player._visible
		}	
		*/
		
	var count = 1;
	// Look for the user with the same ip address.
	for( index in users ){
	
		console.log("interface is %s .",interfaceIpAddress);
		
		if( users[ index ].ip == interfaceIpAddress ){
		
			console.log(" We found the corresponding client to the interface." );
			// First or second user per device.
			users[ index ].id = count;
			// 1 PERSON PER PC?
			count++;
			// We're ready to stream. When the library gets a '\n' it begins to send the data...
			javaSocket.write( '\n' );
			break;
		}
		else
		{
			console.log(" We did not find the corresponding client to the interface. Not storing data." );		
		}
	}
		
	//
	// DATA RECIEVED FROM THE KINECT.
	//
    javaSocket.on('data', function( data ){
		
		console.log(" Streaming data " );
		
		dataBuffer += data;
		
		newlineIndex = dataBuffer.indexOf( '\n' );
		
		if( newlineIndex == -1){// Did we find an end of line?
		
			console.log("There was no end of line");
			// Send next packet.
			javaSocket.write( '\n' );
			return;// If there was no end of package in the data return.
		}
		
		console.log("There was an end of line detected.");
		
		users[ javaSocket.address().address ].kinect = JSON.parse( dataBuffer.slice(0, newlineIndex) );
		console.log( users[ javaSocket.address().address ].kinect );
        dataBuffer = dataBuffer.slice(newlineIndex + 1);
		
		users[ javaSocket.address().address ].visible = true;
		
		javaSocket.write( '\n' );
		
	});// End of on.Data

	// User has disconnected...
    javaSocket.on('close', function() {
		
		//users[ javaSocket.address().address ].visible = false;
		delete interfaces[ javaSocket.address().address  ];
    });
});

// Listen for connections on the java port specified!
javaServer.listen( javaPort );