/**	@Name:	Player Class

	@Author: James Browne
	
	@Brief:

*/



/** @name CONSTRUCTOR( )

	@brief
	Construct an instance of the player.
	
	@args
	name = A String name of the user.
	id = An intiger unique user identifer.
	meshUrl = The String path to the model to be loaded.
	position = The Vector3 position to create the entity.
	
	@Returns
	N/A
*/
function Player( name, position ){

	// The name of the user.
	this._name = name;
	// The global position.
	this._position = position;
	// THe velocity of the player.
	this._velocity = new THREE.Vector3(0,0,0);
	// The acceleration...
	this._accel = new THREE.Vector3(0,-9.81,0);
	// The walkspeed, could replace velocity.
	this._walkSpeed = 50;
	// The direction of the player.
	this._direction = new THREE.Vector3(0,0,1);
	// Move 100 units in the z direction, this is the players orientation.
	this._sightNode = new THREE.Vector3(0,0,100);
	// Define the up axis on the cartesian plane.
	this._upAxis = new THREE.Vector3( 0,0,1 );
	// The unique id, i.p address for Example.
	this._ip  = undefined;
	// The local id from the kinect.
	this._userId = undefined;
	// The Kinect data.
	this._kinectData = undefined;
	// Is the player to be drawn to screen.
	this._visible = undefined;
	// The avatar url.
	this._model = undefined;
	// The url of the Avatar.
	this._meshName = undefined;

	//this._model = this.loadModelMesh( 'model/monster.dae' );

	
	// The data for the joints
	this._rig = new Model( jointList, this._position );
	// The items the player has.
	this._inventory = [];
	
	// Set up the sphere vars
	var radius = 100, segments = 10, rings = 10;
	var Material = new THREE.MeshLambertMaterial( {color: 0xff0000 });
	var Geometry = new THREE.SphereGeometry( radius, segments, rings );
	
	// The mesh of the Joint. Contains physical properties.
	this._mesh = new THREE.Mesh( Geometry , Material );	
	this._mesh.name	= "Player";
	// Add ourself to the scene.
	scene.add( this._mesh );	
	
	this._mesh.position = this._position;
};



/**	@name SYNC JOINTS(  ) 

	@brief
	Updates the joint positions of the player using the kinect data.
	
	@args
	jointMap = A map object containing the names and positions of the player's joints.
	
	@Returns
	N/A

*/
Player.prototype.syncJoints = function( ){

	// Update if there is something to update...
	if ( this._kinectData !== undefined && this._kinectData !== null ){
	
		// The new position represents the updated height, keeps feet from going throuh floor.
		var newPosition = this._rig.setAllJoints( this._position , this._kinectData );		
		this._position = newPosition;
	}
};



/**	@name Update(  ) 

	@brief
	Updates the joint positions of the player using the kinect data.
	
	@args
	jointMap = A map object containing the names and positions of the player's joints.
	
	@Returns
	N/A

*/
Player.prototype.update = function( ){
/*		 
	var jointMap;
	var enumMap;
	
	if ( this._kinectData[ "type" ] === "action" )
	{
		jointMap = this._kinectData;
	}	
	else if ( this._kinectData[ "type" ] === "jointPosition" )
	{
		enumMap = this._kinectData;
	}
*/	
	// Apply the movements from the Kinect.
	this.handleMovement();
	/*this._model.position = this._position;
	this._model.scale( 0.1, 0.1 , 0.1 );
	this._model.children[0].children[0].position = this._position;*/
	this.syncJoints();
	
	if( this._kinectData == undefined ){
	
		this._rig.move( this._position );
	}
};//End update



/**	@name SET POSITION( )

	@brief
	Sets the position of the player.
	
	@args
	pos = A vector3 position to position the player.
	
	@Returns
	N/A
*/
Player.prototype.setPosition = function( pos ){

	this._position = pos;
	this._mesh.position = pos;
};


/**	@name REMOVE( )

	@brief
	Remove the meshes associated with the Player.
	
	@args
	
	
	@Returns
	N/A
*/
Player.prototype.remove = function(  ){

	//Remove all meshes from the scene associated with the player.
	//Joint data.
	this._rig.remove();
	// Player Mesh.
	scene.remove( this._mesh );
	renderer.deallocateObject( this._mesh );
};


/**	@name GET POSITION(  )

	@brief
	Get the Vector3 position of the player.
	
	@args
	N/A
	
	@Returns
	A Vector3 representing the players position.

*/
Player.prototype.getPosition = function(  ){

	return ( this._position );
};


/**	@Name: MOVE

	@Brief:When the player moves it should move the model.
	The joint data and its own position also.
	
	@Arguments: Vector3 pos
	A vector to translate the current position to.
	
	@Returns:
	N/A
*/
Player.prototype.move = function( direction ){

	// Move in the direction of the sight node.
	var dir = new THREE.Vector3( this._sightNode.x - this._position.x, this._position.y, this._sightNode.z- this._position.z );
	dir.normalize();
	var dist = direction * this._walkSpeed;
	var x = dist * dir.x;
	var y = 0;// Move on the x z plane.
	var z = dist * dir.z;
	var newVec =  new THREE.Vector3( x,y,z )
	
	this._position.addSelf( newVec  );
	this._sightNode.addSelf( newVec  );
	
	// Set the position of the mesh for the player.
	this._mesh.position = this._position;
	/*
	// Update player position.
	this._position.addSelf( pos );
	// Keep the sight node in sync.
	this._sightNode.addSelf( pos );
	*/
};



/**	@Name:	Get Sight Node
	
	@Brief:
	A model that represents all the joint data from the kinect.
	Upon creation there will be 15 joints.
	After construction the individual joints data will be passed as a map.
	
	@Arguments: N/A
	
	@Returns: Vector3 sight node position

*/
Player.prototype.getSightNode = function( ) {

	return ( this._sightNode );
};


/**	@Name:	Set Sight Node
	
	@Brief:
	Set the position of the sight node.
	
	@Arguments: angle
	
	@Returns: N/A

*/
Player.prototype.setSightNode = function( theta ) {
	
	// Translate...sight - player pos
	this._sightNode.subSelf( this._position );
	
	// Rotate up and down
	this._sightNode.x = this._sightNode.x * Math.cos( theta ) + Math.sin( theta ) * this._sightNode.z; 
	this._sightNode.z = this._sightNode.z * Math.cos( theta ) - Math.sin( theta ) * this._sightNode.x 
	
	// Translate...sight + playerPos
	this._sightNode.addSelf( this._position );
	

};


/**	@Name:	Add Inventory
	
	@Brief:
	Add an item picked up to the players inventory.
	
	@Arguments: Item - an object to carry.
	
	@Returns: N/A

*/
Player.prototype.addInventory = function( item ) {
	
	this._inventory.push( item );	

};


/**	@Name:	Handle Movement
	
	@Brief:
	Process the commands that were sent from the users Kinect.
	
	@Arguments: N/A
	
	@Returns: N/A

*/
Player.prototype.handleMovement = function(  ) {
	
	// Process all the states to be applied to the Player.
	var state = undefined;
	
	for ( index in this._kinectData ){
		
		if (  this._kinectData[ index ] == "true" ){
			
			state = index;		
		}
		
		switch( state ){
			case "walk":
				this._walkSpeed = 50;
				this.move( 1 );
				break;
			case "run":
				this._walkSpeed = 100;
				this.move( 1 );
				break;
			case "rotateLeft":
				this.rotateLeft();
				break;
			case "rotateRight":
				this.rotateRight();
				break;
			case "standStill":
				// Do nowt!
				break;
			case "backwards":
				this._walkSpeed = -50;
				break;
			default:
				break;
		}//End Switch
		
	}// End for 

};


/**	@Name:	Rotate Left
	
	@Brief:

	
	@Arguments: N/A
	
	@Returns: 

*/
Player.prototype.rotateLeft = function( ) {

	theta = 0.1;
	// Translate...sight - player pos
	this._sightNode.subSelf( this._position );
	
	// Rotate up and down
	this._sightNode.x = this._sightNode.x * Math.cos( theta ) + Math.sin( theta ) * this._sightNode.z; 
	this._sightNode.z = this._sightNode.z * Math.cos( theta ) - Math.sin( theta ) * this._sightNode.x 
	
	// Translate...sight + playerPos
	this._sightNode.addSelf( this._position );
};


/**	@Name:	Rotate Right
	
	@Brief:

	
	@Arguments: N/A
	
	@Returns: 

*/
Player.prototype.rotateRight = function( ) {

	theta = -0.1;
	// Translate...sight - player pos
	this._sightNode.subSelf( this._position );
	
	// Rotate up and down
	this._sightNode.x = this._sightNode.x * Math.cos( theta ) + Math.sin( theta ) * this._sightNode.z; 
	this._sightNode.z = this._sightNode.z * Math.cos( theta ) - Math.sin( theta ) * this._sightNode.x 
	
	// Translate...sight + playerPos
	this._sightNode.addSelf( this._position );
};


/**	@Name:	Rotate Up
	
	@Brief:

	
	@Arguments: N/A
	
	@Returns: 

*/
Player.prototype.rotateUp = function( ) {

	theta = 0.1;
	// Translate...sight - player pos
	this._sightNode.subSelf( this._position );
	
	// Rotate up and down
	this._sightNode.x = this._sightNode.x * Math.cos( theta ) + Math.sin( theta ) * this._sightNode.y; 
	this._sightNode.y = this._sightNode.y * Math.cos( theta ) - Math.sin( theta ) * this._sightNode.x 
	
	// Translate...sight + playerPos
	this._sightNode.addSelf( this._position );
};


/**	@Name:	Rotate Down
	
	@Brief:

	
	@Arguments: N/A
	
	@Returns: 

*/
Player.prototype.rotateDown = function( ) {

	theta = -0.1;
	// Translate...sight - player pos
	this._sightNode.subSelf( this._position );
	
	// Rotate up and down
	this._sightNode.x = this._sightNode.x * Math.cos( theta ) + Math.sin( theta ) * this._sightNode.y; 
	this._sightNode.y = this._sightNode.y * Math.cos( theta ) - Math.sin( theta ) * this._sightNode.x  
	
	// Translate...sight + playerPos
	this._sightNode.addSelf( this._position );
};


/**	@name LOAD MODEL MESH( )

	@brief
	Load a model from file specified.
	
	@args
	url = The string location of the model on disk
	
	@Returns
	N/A
*/
Player.prototype.loadModelMesh = function( url ){
	
	var that = this;
	var what = new THREE.ColladaLoader();
	
	what.load( url ,function( collada ){
		
		that._model = collada.scene;
		that._model.scale.set(0.01,0.01,0.01);
		that._model.position = that._position;
		that._model.rotation.x = -Math.PI/2;
		
		scene.add( that._model );
	});
};