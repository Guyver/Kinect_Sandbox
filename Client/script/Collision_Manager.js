
/**	@Name:	Collision_Manager Class

	@Author: James Browne
	
	@Brief:
	A Collision_Manager that controls all collisions regarding the 3d objects.

*/
function Collision_Manager(  ){



};


/**	@Name: Test Collision

	@Brief:
	
	@Arguments:
	
	@Returns:

*/
Collision_Manager.prototype.testCollision = function( objA, scene ){

	if ( objA.name === "Player" ){
		var test = 0;
	}
	
	var sceneMeshes = scene.children;
	var wallMeshes = [];
	var playerMeshes = [];
	var collision = false;
	
	for ( index in sceneMeshes ){
	
		if( sceneMeshes[ index ].name === "Wall" ){
		
			wallMeshes.push( sceneMeshes[ index ] );
		}
		else if( sceneMeshes[ index ].name === "Player" ){
			
			playerMeshes.push( sceneMeshes[ index ] );
		}
	}
	for ( index in playerMeshes ){
		
		for( i in wallMeshes )
		{
			collision = this.ballWall( playerMeshes[ index ] , wallMeshes[ i ] );
		}
	}
	
	
	var test = 0;
	
};//End sphere collision.



/**	@Name: Sphere - Sphere Collision

	@Brief:
	
	@Arguments:
	
	@Returns:

*/
Collision_Manager.prototype.sphereSphereCollision = function( objA, objB ){


	
};//End sphere collision.




/**	@Name:	Cube - Cube Collision

	@Brief:	
	Axis Aligned Bounding Boxes
	
	@Arguments:
	
	@Returns:
*/
Collision_Manager.prototype.cubeCubeCollision = function( objA, objB ){


};//End cube collision




/**	@Name:	Plane - Sphere Collision
	@Brief:	
	Point - line collision detection.
	@Arguments:
	@Returns:

*/
Collision_Manager.prototype.planeSphereCollision = function( objA, plane ){

};




/**	@Name: Distance
	@Brief:	
	@Arguments:
	@Returns:

*/
Collision_Manager.prototype.getDistance = function( objA, objB ){

		var posA = objA.position;
		var posB = objB.position;
		
		var dx,dy,dy,x2,y2,z2,dist;
		// Deltas.
		dx = posA.x - posB.x;
		dy = posA.y - posB.y;
		dz = posA.z - posB.z;
		// Squares.
		x2 = dx * dx;
		y2 = dy * dy;
		z2 = dz * dz;
		// Root
		return ( Math.sqrt( x2 + y2 + z2 ) );

};



/**	@Name: S.A.T 
	@Brief:	
	@Arguments:
	@Returns:

*/
Collision_Manager.prototype.SAT = function( objA, objB ){

	// Seperating axis Therom. Convex polygons
		
};

Collision_Manager.prototype.ballWall = function( ball, wall ){
	
	var dist,rad1,rad2;
	dist = this.getDistance( ball, wall );
	rad1 = ball.boundRadius;
	rad2 = wall.boundRadius;
	
	if( dist < (rad1 + rad2) ){
	
		return true;
	}
	
	return false;
};

/**	@Name: Update
	@Brief:	
	Check all objects in the scene to see if any collisions occured.
	@Arguments:
	N/A
	@Returns:
	N/A

*/
Collision_Manager.prototype.update = function(  ){

	// Get all objects in the scene.
	
	// Test for collisions between all...expensive bt hey, its a prototype.
	
	// if the left hand, right hand and object are in collision pick up the object.
	
	// As soon as they are not in contact anymore update the object so it adheres to gravity.	

};