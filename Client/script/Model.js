/**

	@Author: James Browne
	
	@Brief:
	A model that represents all the joint data from the kinect.
	Upon creation there will be 15 joints.
	After construction the individual joints data will be passed as a map.

*/

function Model( jointNames ){

	this._joint = {};				        // Map of joint objects.
	this._jointNames = jointNames;			// Array of key values for the kinect data.
		
	// Initalise the kinectMap.
	kinectMap = this._joint;
	
	// Construct all the joints.
	for( var i = 0; i < this._jointNames.length; i++){
	
		this._joint[ this._jointNames[ i ] ] = new Joint(  );
		
		// Give it a random position.
		this._joint[ this._jointNames[ i ] ].setPosition(  new THREE.Vector3( 
		Math.floor((Math.random()*1000)), Math.floor((Math.random()*1000)), Math.floor((Math.random()*1000))
		));
		
	}//End for
}





/*
	@Brief:
	
	@Arguments:

*/
Model.prototype.setJointPosition = function( name, pos ){

	this._joint[ name ].setPosition( pos );
}





/*
	@Brief:
	
	@Arguments:

*/
Model.prototype.setAllJoints = function( map ){

	// Cycle through the joints and set the according to the map.
	for (var i =0; i < this._jointNames.length; i++){
	
		this._joint[ this._jointNames[ i ] ].setPosition( map[ this._jointNames[ i ] ] );
	}
}





/*
	@Brief:
	
	@Arguments:

*/
Model.prototype.getPosition = function(  ){

	 return ( this._joint[ 'TORSO' ].getPosition() );
		
	
};



/**	@Name: UPDATE

	@Brief: Update the vector positions of the skeleton of the player.
	The raw kinect data is a vector position from the actual device-
	but we want to translate it so that it corresponds to the player-
	object position.
	
	@Arguments: Vector3 playerPos
	The cartesian position of the player.
	
	@Returns:
	N/A

*/
Model.prototype.update = function( playerPos ){
	
	// Move all the joint starting from an offset of the player.
	var posFromPlayer = new THREE.Vector3(0,0,0);
	var kinectSpacePos= new THREE.Vector3(0,0,0);
	
	// Construct all the joints.
	for( var i = 0; i < this._jointNames.length; i++){
		
		// Store the joint pos in the kinect space.
		kinectSpacePos = kinectMap[ this._jointNames[ i ] ];
		
		// Add the kinect pos to the player pos and assign to posFrom player.
		posFromPlayer.add( playerPos, kinectSpacePos.getPosition() );
		
		// Assign the position in the game space to its corresponding joint.
		this._joint[ this._jointNames[ i ] ].setPosition( posFromPlayer );
		
	}//End for	
}