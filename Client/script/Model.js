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
		
	}
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
Model.prototype.setAllJoints = function( playerPos, kinectMap ){

	//The position in kinect space.
	var kinectPos = new THREE.Vector3(0,0,0);
	// The position in game space.
	var translatedPos;
	
	// Cycle through the joints and set the according to the map.
	for (var i =0; i < this._jointNames.length; i++){
	
		kinectPos = kinectMap[ this._jointNames[ i ] ]; //this._dummyMap[ this._jointNames[ i ] ];
		
		// Get the new joint position.
		translatedPos = this.translatePos( playerPos, kinectPos );
		
		// What if its under the floor?
		while( translatedPos.y < 0 ){
			
			// Move the player position up.
			playerPos.y +=1;
			
			// Recalculate.
			translatedPos = this.translatePos( playerPos, kinectPos );
		}
		
		//Assign the new position to the graphical joint.
		this._joint[ this._jointNames[ i ] ].setPosition(  
			new THREE.Vector3( translatedPos.x, translatedPos.y, translatedPos.z ) );
		
	}// End for
	
	// Return the player pos for the next iteration. 
	return playerPos;
	
}//End set all Joints




/**	@Name:
	@Brief:	
	@Arguments:
	@Returns:

*/
Model.prototype.translatePos = function( playerPos, kinectPos ){

	var newPos = new THREE.Vector3( 0,0,0 );
	
	return ( newPos.add(  playerPos, kinectPos ) );
			
};




/**	@Name:
	@Brief:	
	@Arguments:
	@Returns:

*/
Model.prototype.getPosition = function(  ){

	 return ( this._joint[ 'TORSO' ].getPosition() );
			
};

