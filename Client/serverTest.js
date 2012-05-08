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
var userCount = 0;						// Number of users connected.


/*		EXAMPLE USE
	socket.sockets.emit('updatechat', client.username, message );		// Send to everyone, including me.
	socket.sockets.send( 'updatechat', client.username, message );	    // Send to everyone but me.
	client.emit('updatechat', "Please enter your user name to chat");	// Send to just me.
	
*/
socket.sockets.on( 'connection', function( client ){
	
	var clientAddress = client.handshake.address.address;

	// Increment the number of connections.
	userCount++;
	
	console.log("Giving all the users to the new client");
	// Push the connected players. --1-- Only send it to the client that connected!
	client.emit('syncPlayers', users );
		
	// Add ourselves to the users list and tell everyone else we're here.	
	client.on('addNewPlayer', function( user ){
		
		console.log( "Trying to add a new user to the server." );
		// Give the player his name.
		user.name = "Bot"+userCount;
		// Assign a unique id for the player.
		user.ip = client.handshake.address.address;
		
		// Store him in the users bucket!
		if( client.handshake.address.address !== undefined ){
		
			// Only add them by ip associate.
			users[ client.handshake.address.address ] = user;
			// Give the user back his profile.
			client.emit('updateSelf', users[ client.handshake.address.address ] );
			console.log("A new user was added to te user pile. IP : "+ users[ client.handshake.address.address ].ip);
		}
		else
		{
			console.log( "Couldn't add the player, no ip address" );
			return;
		
		}
				
		for ( index in users){
			console.log( "Users name is : %s", users[ index ].name );
			console.log( "User %s's x position is %d: ",index, users[index].pos.x );
			console.log( "User %s's y position is %d: ",index, users[index].pos.y );
			console.log( "User %s's z position is %d: ",index, users[index].pos.x );
		}
		
		
	});

	
	client.on('updatePlayer', function( user ){
		
		console.log( "Trying to update a user in the server user list." );
		
		// Update the stock pile of players unless the user insn't valid.
		if( user.id === undefined ){
			console.log("Doesn't move cos the ip address was undefined from the client.");
			return;
		}
		else
		{
			users[ user.id ] = user;
		}
		
		for ( index in users){
			console.log( "User %s's x position after update is %d: ",index, users[index].pos.x );
			console.log( "User %s's y position after update is %d: ",index, users[index].pos.y );
			console.log( "User %s's z position after update is %d: ",index, users[index].pos.x );
		}
		
		// Update the clients of your new position. Send to all but the client.
		socket.sockets.emit('updatePlayer', { player : users[ user.id ] } );
		
	});
	
	
	client.on('disconnect', function(){
		
		console.log("User disconnected");
		// Tell the users that some one has quit so tey can remve from their scenes.
		delete users[ client.handshake.address.address ];
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

javaServer.on('connection', function ( javaSocket ) {
	
    // Store the address of the java client.
    var clientAddress = javaSocket.address().address + ':' + javaSocket.address().port;
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
		
		if( users[index].ip === clientAddress ){
			
			// First or second user per device.
			users[ index ].id = count;
			//
			count++;
			// We're ready to stream.
			javaSocket.write( '\n' );		
		}
	}
		
    /**	@Name:	Setup Gui
	@Brief:	Creates the GUI panel on screen and assigns variables to change at run time for debugging
	@Arguments:N/A
	@Returns:N/A
*/
    javaSocket.on('data', function( data ){
		
		dataBuffer += data;
		
		newlineIndex = dataBuffer.indexOf( '\n' );
		
		if( newlineIndex == -1){// Did we find an end of line?
		
			console.log("There was no end of line");
			// Send next packet.
			javaSocket.write( '\n' );
			return;// If there was no end of package in the data return.
		}
		
		console.log("There was an end of line detected.");
		// Associate the kinect data with the player of the same ip address.
		users[ javaSocket.address().address ].kinect = JSON.parse( dataBuffer.slice(0, newlineIndex) );
        dataBuffer = dataBuffer.slice(newlineIndex + 1);
		users[ javaSocket.address().address ].visible = true;
		javaSocket.write( '\n' );
		
	});// End of on.Data

	// User has disconnected...
    javaSocket.on('close', function() {
		
		users[ javaSocket.address().address ].visible = false;
		
    });
});

// Listen for connections on the java port specified!
javaServer.listen( javaPort );