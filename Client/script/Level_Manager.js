/**	@Name:	Level_Manager Class

	@Author: James Browne
	
	@Brief:
	A Level_Manager that controls the flow of the game.
	Tell the scene builder how many levels there are and it will generate them for us.
	Give the scene builder the current level and it will only display that level.
	When the current level changes, tell the scene manager to change scene to the current one.
	Every frame tell the collision manger to handle the collisions.
	Every frame let the player manager handle all the players.

*/
function Level_Manager(  ){

	// The number of different levels.
	this._maxLevels = 5;
	// The current level...
	this._currentLevel = 1;
	// Handle Collisions.
	this._collision_Manager = new Collision_Manager();
	// Handle the Players.
	this._player_Manager = new Player_Manager();
	// Handle the Scene.
	//this._scene_Manager = new Scene_Builder( this._maxLevels, this._currentLevel );
	this._cameraPosition = undefined;

};


/**	@Name: Update
	@Brief:	
	Check all objects in the scene to see if any collisions occured.
	@Arguments:
	N/A
	@Returns:
	N/A

*/
Level_Manager.prototype.update = function( player, objects, camera ){

	// Test to see if the players hands are in an object.
	this.testPickups( player, objects );
	
	// Get the collision manager to do its job.
	this._collision_Manager.update( );

	// Get the Player Manager to update the players.
	this._player_Manager.update( );
	
	// Set the camera to the position of the head joint.
	if( player._kinectData !== undefined && player._kinectData !== null ){
		
		if( player._kinectData[ "HEAD" ] != undefined ){
			
			var pos = player._rig._joint[ "HEAD" ].getPosition();
			this._cameraPosition = new THREE.Vector3( pos );
		
			camera.position = this._cameraPosition;
		}
		
	}
	else{
		var playerPos = player.getPosition();
		camera.position.x = playerPos.x;
		camera.position.y = playerPos.y;
		camera.position.z = playerPos.z;
	}
	camera.lookAt( player.getSightNode() );
	// Check the progress of the current level.
	
	// Advance a level if conditions are met.
	
	// Get the Scene Builder to construct the new level.
	
};


Level_Manager.prototype.testPickups = function( player, objects ){
	
	if( player._inventory.length > 0 ){
		// If the player has an item already then forget it.
		return;
	}
	var lHand = player._rig._joint["LEFT_HAND"];
	var rHand = player._rig._joint["RIGHT_HAND"];
	var obj;
	for ( index in objects){
		//Test if the meshes collide.
		obj = objects[ index ];
		var coll1 = this._collision_Manager.sphereSphereCollision( lHand._mesh, obj._mesh );
		var coll2 = this._collision_Manager.sphereSphereCollision( rHand._mesh, obj._mesh );	
		
		if( coll1 && coll2 && objects[ index ]._alive ){
			// Ok the hands are on/in an object, is it already equipped?
			if( !objects[ index ]._equipped ){

				player.addInventory( objects[ index ] );	// Add it to the players inventory.
				objects[ index ].equipToMesh( rHand );		// Equip it to the right hands position.
				
			}//end if object equipped
		}// end if coll1&2
		else{//Either the left hand let go or trying to pick up a dead object or you're just not near it.
		
			// Hands dont touch this particular object, if he has it equipped drop it.
			// Make sure you only drop the item you know is not in his inventory.
			
			for ( index in player._inventory ){
			
				var equippedItem = player._inventory[ index ]._mesh;
				
				if( equippedItem.id === objects[ index ]._mesh.id )
				{
					this.removeItemFromPlayer( player , objects[ index ] );					
				}//End if id's are the same.
				
			}// End each equipped item.
				
		}//End if/else no collision.
		
	}// End for objects.
	
};//End function.

/**	@Name: Update
	@Brief:	
	Check all objects in the scene to see if any collisions occured.
	@Arguments:
	N/A
	@Returns:
	N/A

*/
Level_Manager.prototype.testCollision = function( objA, scene ){
	
	var walls = [];
	
	this._collision_Manager.testCollision( objA, scene  );
};
/**	@Name:	Remove Item From Player
	@Brief:
	@Arguments:
	@Returns:

*/
Level_Manager.prototype.removeItemFromPlayer = function( player, object ){

	object.removeFromMesh();
	player.removeInventory();	

};