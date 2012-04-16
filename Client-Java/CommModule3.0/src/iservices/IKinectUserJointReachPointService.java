/**Copyright 2012 Santiago Hors Fraile
 * *
 */
package iservices;

import services.KinectUserJointReachPointServiceEvent;
import control.IListenerCommModule;
/**
 * Must be implemented by any class which wants to receive the Skeleton events from a Kinect
 * @author Santiago Hors Fraile
 */
public interface IKinectUserJointReachPointService  extends IListenerCommModule {
	/**
	 * Must be implemented to manage the KinectSkeletonServiceEvent received.
	 * @param se This is the KinectSkeletonServiceEvent received.
	 */
	public void kinectUpdate(KinectUserJointReachPointServiceEvent se);
}
