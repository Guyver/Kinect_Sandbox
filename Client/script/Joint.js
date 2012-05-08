/**
	@Author: James Browne
	
	@Brief:
	A model has 15 joints and this is the template class for them all.

*/
function Joint(  ){

	this._accel = new THREE.Vector3();		// Usually Gravity if ignoring external force.
	this._velocity = new THREE.Vector3();		// Velocity vector.
	this._direction = new THREE.Vector3();		// Direction vector, maybe use a quaternion.
	
	// Set up the sphere vars
	var radius = 10, segments = 10, rings = 10;
	this._Material = new THREE.MeshLambertMaterial( {color: 0x000000 });
	this._Geometry = new THREE.SphereGeometry( radius, segments, rings );
	
	// The mesh of the Joint. Contains physical properties.
	this._mesh = new THREE.Mesh( this._Geometry , this._Material );		
	
	// Add ourself to the scene.
	scene.add( this._mesh );						
}

/*
	@Brief:
	Get the position of the Joint.
	
	@Arguments:
	N/A

*/
Joint.prototype.getPosition = function(  ){

	return ( this._mesh.position );
	
};



/**	@Name:
	
	@Brief:
	Set the position of the Joint using the arguments.
	
	@Arguments:
	position: The position to set the joint...
	
	@Returns:
	N/A

*/
Joint.prototype.setPosition = function( position ){

	this._mesh.position =  position;
};