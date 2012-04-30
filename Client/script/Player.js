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
function Player( name, id, meshUrl, position){

	// The name of the user.
	this._name = name;
	// The unique id, i.p address for Example.
	this._id = id;
	// The avatar url.
	if( meshUrl != ""){
		this._model = this.loadModelMesh( meshUrl );
	}
	
	// The data for the joints
	this._rig = new Model( jointList );
	// The global position.
	this._position = position;
	// THe velocity of the player.
	this._velocity = new THREE.Vector3(0,0,0);
	// The acceleration...
	this._accel = new THREE.Vector3(0,-9.81,0);
	// The walkspeed, could replace velocity.
	this._walkSpeed = 50;
	// The direction of the player.
	this._direction = new THREE.Vector3(0,0,0);
	// Move 100 units in the z direction, this is the players orientation.
	this._sightNode = new THREE.Vector3(0,0,100);
	this._upAxis = new THREE.Vector3( 0,0,1 );
	
};



/**	@name UPDATE()

	@brief
	Updates an instance of the player.
	
	@args
	dt = A decimal value that represents the time since last frame.
	
	@Returns
	N/A
*/
Player.prototype.update = function( dt ){
	
	// Calculate new position and set in model.
	
	// Calculate new velocity.
	
	// Calculate new Direction and set in model.

};



/**	@name SYNC JOINTS(  ) 

	@brief
	Updates the joint positions of the player using the kinect data.
	
	@args
	jointMap = A map object containing the names and positions of the player's joints.
	
	@Returns
	N/A

*/
Player.prototype.syncJoints = function( jointMap ){

	 var newPosition = this._rig.setAllJoints( jointMap, this._position );
	 this._position = newPosition;
	
};



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
	
	//return this._rig.getPosition();
};



/**	@name ROTATE(  )
	
	@brief
	Rotate an face in the direction of the position specified.
	
	@args
	pos = the vector3 position to orient towards. 
	
	@Returns
	N/A
*/
Player.prototype.rotate = function( pos ){

	this._model.rotation.x = pos;
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
	
	this._position.addSelf( dir.multiplyScalar( direction * this._walkSpeed ) );
	this._sightNode.addSelf( dir.multiplyScalar( direction * this._walkSpeed ) );
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
	new THREE.ColladaLoader().load( url ,function( collada ){
		
		that._model = collada;
		model.scale.set(0.1,0.1,0.1);
		that._model.position = that._position;
		that._model.scene.rotation.x = -Math.PI/2;
		scene.add( that._model.scene );
	});
};