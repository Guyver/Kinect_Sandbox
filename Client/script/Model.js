/**	@Name:	Model Class

	@Author: James Browne
	
	@Brief:
	A model that represents all the joint data from the kinect.
	Upon creation there will be 15 joints.
	After construction the individual joints data will be passed as a map.

*/
function Model( jointNames ){

	this._joint = {};				        // Map of joint objects.
	this._jointNames = jointNames;			// Array of key values for the kinect data.
	this._dummyMap = {}
	
	// Construct all the joints.
	for( var i = 0; i < this._jointNames.length; i++){
	
		this._joint[ this._jointNames[ i ] ] = new Joint(  );
		
		// Give it a random position.
		this._joint[ this._jointNames[ i ] ].setPosition(  new THREE.Vector3( 
			Math.floor((Math.random()*1000)), Math.floor((Math.random()*1000)), Math.floor((Math.random()*1000))
		));
		
		this._dummyMap[ this._jointNames[ i ] ] = this._joint[ this._jointNames[ i ] ].getPosition()
		
	}//End for
}




/**	@Name:

	@Brief:
	
	@Arguments:
	
	@Returns:

*/
Model.prototype.setJointPosition = function( name, pos ){

	this._joint[ name ].setPosition( pos );
}





/**	@Name:
	@Brief:	
	@Arguments:
	@Returns:

*/
Model.prototype.setAllJoints = function( map, playerPos ){

	//Take a reference to the model.
	var that = this;
	
	//The position in kinect space.
	var kinectPos = new THREE.Vector3(0,0,0);
	// The position in game space.
	var translatedPos = new THREE.Vector3( 0,0,0 );
	
	// Cycle through the joints and set the according to the map.
	for (var i =0; i < this._jointNames.length; i++){
	
		kinectPos = that._dummyMap[ that._jointNames[ i ] ];
		 
		 // This is the offending line bruv...
		 translatedPos.add(  playerPos, kinectPos );
		 
		 
		that._joint[ that._jointNames[ i ] ].setPosition(  translatedPos  );
		
	}// End for
	
}//End set all Joints





/**	@Name:
	@Brief:	
	@Arguments:
	@Returns:

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