/*

// This will change according to the network.
var socket = io.connect('193.156.105.166:7541');

// The other clients connected.
var players = undefined;
// Players to be added to the scene.
var playersToBeAdded = [];

var syncPlayers;
var updatePlayer;
var addPlayerToScene;
var updateSelf;

var registeredPlayers = undefined;

// The game flow.

//
//	1
//
socket.on('syncPlayers', function ( users ){
	
	// Now we have a list of users already connected to the server.

	// What we need to do is to create them locally and give them the users server position initally.
		// The players datastructure is filled with player objects.
		// We store them in there and associate them by their ip address.
	registeredPlayers = users;	
	playersToBeAdded = users;
	
});


socket.on('updatePlayer', function ( data ){
	
	// The players should already exist locally, so now just update them with the data sent from the server.
	console.log("The user %s needs to be updated", data.ip);
	
	// Update a player
	players[ data.ip ]._name 		= data.name;
	players[ data.ip ]._userId 		= data.id;
	players[ data.ip ]._kinectData 	= data.kinect;
	players[ data.ip ]._id 			= data.ip;
	players[ data.ip ]._meshName 	= data.mesh;
	players[ data.ip ].setPosition(	data.pos );
	
});

//
//	2
//
socket.on('addPlayerToScene', function ( data ){
	
	// Next loop they will be created and added to the scene.
	playersToBeAdded.push( data.player );
	
});
	
socket.on( 'updateSelf' , function( data ){

	// Server game me some attributes and is giving them back to me.
	updateSelf = data;	

});
	
*/