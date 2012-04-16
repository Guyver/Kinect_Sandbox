/*
	@Author: James Browne.
	
	@Brief: 
	This was designed to recieve kinect data from and OpenNi interface and to staore it.
	Ze client can conect then and request it per frame to draw the user in the browser.
	
	...neat ain't it.
	
	CONNECTS TO: Browser, Java Web sockets.
	
*/

/*======================================================

	ACT 1: Server the client the game.

========================================================*/


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
// A map containing a 3d vector for each joint.
var kinectMap = {};				


//Server
var server = http.createServer( function ( request , response ) {
 
    console.log('request starting...');
     
    var filePath = '.' + request.url;
	
    if ( filePath == './' )// Just the root.
        filePath = '../scripts/index.htm';// Default page, our case the game html page.
         
    var extname = path.extname( filePath );
    var contentType = 'text/html';
	
    switch ( extname ) {
        case '.js':// Serving some script.
            contentType = 'text/javascript';
            break;
        case '.css':// Serving some style
            contentType = 'text/css';
            break;
		case '.png':// We're serving an image.
            contentType = 'image/png';
            break;
    }
     
    path.exists(filePath, function(exists) {// Check to see if the file exists
     
        if (exists) {// Returned from the callback, checking to see if valid.
			
            fs.readFile(filePath, function(error, content) {// Read file, filePath. Plus a callback
            	
                if (error) {// If theres and error throw 500
				
                    response.writeHead(500);
                    response.end();
                }
                else {	// Otherwise return the file.
			
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {// Throw 404 if the file isn't there.
        
            response.writeHead(404);
            response.end();
        }
    });
     
});// End of Http create server.

var socket = io.listen( server ); 		// Socket IO server instance.


// Add a connect listener
socket.sockets.on( 'connection', function( client ){
	
	// Store a global reference to the client connected.
	if(gClient !== null ){
		gClient = client;	
	}
	
	
	/*
	    The browser calls this to retrieve the latest kinect data from the server.	
	*/
	client.on('kinect', function(  ){
		
		client.emit('passClientData', kinectMap);
	});

	/*
		When the user disconnects.. perform this.
	*/
	client.on('disconnect', function(){
		
		console.log("User disconnected");
	});
	

});// End of 'onConnection'

// Listen for connection
server.listen( clientPort );

/*===================================================
	
	ACT 2 : Connect to openNi and get the data.

====================================================*/
var javaPort = 7540;
var javaServer = require('net').createServer();

javaServer.on('listening', function () {

    console.log('Server is listening on for java data on :' + javaPort);
});



javaServer.on('error', function ( e ) {

    console.log('Server error: ');// + e.code);
});



javaServer.on('close', function () {

    console.log('Server closed');
});

// Debugging variables.
var packetCount = 0;
var fullPackets = 0;
var dataBuffer = "";
var packetLength = 0;
var newlineIndex = 0
var kinectSynced = false;

javaServer.on('connection', function ( javaSocket ) {
	
    // Store the address of the java client.
    var clientAddress = javaSocket.address().address + ':' + javaSocket.address().port;
	
    // Log that a client has connected...
    console.log('Java ' + clientAddress + ' connected');

    // Send a message to openNi that we are ready to recieve some funk.
    javaSocket.write( '\n' );
	
    // The point of entry, giggidy, from openNi
    javaSocket.on('data', function( data ){
		
		// Debugging Node is a pain in the balls.
		packetLength = data.length;
		packetCount++;
		console.log("	");
		console.log("	");
		console.log( packetCount + " packets recieved and "+fullPackets+" have been recieved.");
		console.log("	");
		console.log("	");
		dataBuffer += data;
		
		newlineIndex = dataBuffer.indexOf( '\n' );
		
		if( newlineIndex == -1){// Did we find an end of line?
		
			console.log("There was no end of line");
			javaSocket.write( '\n' );
			return;// If there was no end of package in the data return.
		}
		
		console.log("There was an end of line detected.");
		kinectMap = JSON.parse( dataBuffer.slice(0, newlineIndex) );
		fullPackets++;
        	dataBuffer = dataBuffer.slice(newlineIndex + 1);
		
		
		if( !kinectSynced ){// Used by the client to only stream when we have connected to openNi.
			kinectSynced = true;
			gClient.emit('kinectSynced', true);
			console.log("The kinect data has began streaming and the browser should connect.");
		}
		
		javaSocket.write( '\n' );
		
	});// End of on.Data

	// User has disconnected...
    javaSocket.on('close', function() {
	
		gClient.emit('kinectSynced', false);
		console.log("The kinect data has ended streaming and the browser shouldn't connect.");
		console.log( "The packet caount for the client was: "+ packetCount);
		packetCount = 0;
		fullPackets = 0;
		kinectSynced = false;
        console.log('Java ' + clientAddress + ' disconnected');
    });
});

// Listen for connections on the java port specified!
javaServer.listen( javaPort );