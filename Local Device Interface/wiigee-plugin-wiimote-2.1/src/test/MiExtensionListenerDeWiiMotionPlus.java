package test;

import org.wiigee.event.RotationEvent;
import org.wiigee.event.RotationListener;
import org.wiigee.event.RotationSpeedEvent;


public class MiExtensionListenerDeWiiMotionPlus implements RotationListener {


	

	@Override
	public void rotationSpeedReceived(RotationSpeedEvent evt) {
		System.out.println("Se ha lanzado el evento de rotación de velocidad del wiimotionplus con valor "+evt.getPsi()+", "+evt.getTheta()+" ,"+evt.getPhi());
			
		
	}

	public void rotationReceived(RotationEvent evt){
		System.out.println("Se ha lanzado el evento de rotación del wiimotionplus con valor "+evt.getPitch()+", "+evt.getRoll()+" ,"+evt.getYaw());
		
	}

	@Override
	public void calibrationFinished() {
		System.out.println("Ya puede empezar a usar el wiimotionplus");		
	}




}