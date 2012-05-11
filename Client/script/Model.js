/**	@Name:	Model Class

	@Author: James Browne
	
	@Brief:
	A model that represents all the joint data from the kinect.
	Upon creation there will be 15 joints.
	After construction the individual joints data will be passed as a map.

*/
function Model( jointNames, playerPos ){

	this._joint = {};				        // Map of joint objects.
	this._jointNames = jointNames;			// Array of key values for the kinect data.
	this._dummyMap = {}
	
	// Construct all the joints.
	for( var i = 0; i < this._jointNames.length; i++){
	
		this._joint[ this._jointNames[ i ] ] = new Joint(  );
		
		// Give it a random position.
		this._joint[ this._jointNames[ i ] ].setPosition(  new THREE.Vector3( 
			playerPos.x, playerPos.y+100, playerPos.z
		));
		//this._dummyMap[ this._jointNames[ i ] ] = this._joint[ this._jointNames[ i ] ].getPosition()
		
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
		
		// it could be null if the kinect map is the action map instead of joints.
		if( kinectPos !== undefined && kinectPos !== null )
		{
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
		}
	}// End for
	
	// Return the player pos for the next iteration. 
	return playerPos;
	
}//End set all Joints



Model.prototype.move = function( newPos ){

	var pos = new THREE.Vector3( newPos.x, newPos.y, newPos.z );
	pos.y+= 150;
	for ( index in this._joint ){
	
		this._joint[ index ].setPosition( pos );
	}
};



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



Model.prototype.remove = function(){
	
	//Remove all joints from the scene.
	for ( index in this._joint ){
		this._joint[ index ].remove();
	}
}