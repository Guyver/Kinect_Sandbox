package org.wiigee.device;

import java.util.Vector;

import org.wiigee.control.Extension;
import org.wiigee.event.DataEvent;
import org.wiigee.event.DataListener;
import org.wiigee.event.RotationEvent;
import org.wiigee.event.RotationListener;
import org.wiigee.event.RotationSpeedEvent;
import org.wiigee.filter.Filter;
import org.wiigee.filter.RotationThresholdFilter;
/**
 * Defines all logic related with the WiiMotionPlus
 * @author Benjamin Poppinga, upgraded by Santiago Hors Fraile
 */
public class WiiMotionPlus implements DataListener, Extension{

	/**
	 * Represents the WiiMote to whom the Nunchuk is attached.
	 */
	private Wiimote wiimote;

	/**
	 * Represents the number of samples that has been taken to calibrate the WiiMotionPlus.
	 */
	private int calibrationcounter;
	/**
	 * Represents a three position vector in which the psi, theta and psi values are stored.
	 */
    private Vector<double[]> calibrationsequence;
    // keep track of the orientation
    /**
     * Represents the pitch
     */
    private double pitch = 0.0;
    /**
     * Represents the roll 
     */
    private double roll = 0.0;
    /**
     * Represents the yaw
     */
    private double yaw = 0.0;
    /**
     * Represents the offset value of the angles.
     */
    private double psi0, theta0, phi0;
    private double lastRoll=0.0;
	private double lastPitch=0.0;
	private double lastYaw=0.0;

    /**
     *  Stores the rotation listeners that receive generated events.
     */
    protected Vector<RotationListener> rotationListener = new Vector<RotationListener>();

    /**
     * Gets the field pitch.
     * @return double The field pitch.
     */
    public double getPitch() {
        return this.pitch;
    }
    /**
     * Gets the field yaw.
     * @return double The field yaw.
     */
    public double getYaw() {
        return this.yaw;
    }
    /**
     * Gets the field roll.
     * @return double The field roll.
     */
    public double getRoll() {
        return this.roll;
    }

	/**
	 * Initializes the fields for this class to their default values and sets the wiimote to the wiimote given as parameter.
	 * @param wiimote The new wiimote to whom the WiiMotionPlus is attached.
	 */
	public WiiMotionPlus(Wiimote wiimote) {
		this.wiimote =wiimote;
		this.calibrationcounter = 0;
        this.calibrationsequence = new Vector<double[]>();

	}
    
    /**
     * Not implemented 
     */
	@Override
	public void initialize() {		
	}

	
	double lastPsi=0.0;
	double lastTheta=0.0;
	double lastPhi=0.0;
	
	
	
	
	/**
	 * Fires rotation speed events if the WiiMotionPlus has been calibrated, if not, the WiiMotionPlus is calibrated by taking 1000 samples.
	 * @param data The string of bytes that arrives from the WiiMote via BlueToot containing the WiiMotionPlus state information.
	 */
	@Override
	public void parseExtensionData(byte[] data) {
		

        // fixed values until calibration procedure is known
        //int psi0 = 8265;
        //int theta0 = 7963;
        //int phi0 = 7923;

	
       // this.printBytes(b);

    	   
        int psiL = (data[0] & 0xFF);
        int thetaL = (data[1] & 0xFF);
        int phiL = (data[2] & 0xFF);

        // cut two lower bits of UPPER values, shift right
        int psiU = ((data[3] &0xFC) << 6);
        int thetaU = ((data[4] & 0xFC) << 6);
        int phiU = ((data[5] & 0xFC) << 6);

        
        // get speed indicators
        boolean psiHighSpeed = ((data[3] & 0x02) >> 1) == 0;
        boolean phiHighSpeed = (data[3] & 0x01) == 0;
        boolean thetaHighSpeed = ((data[4] & 0x02) >> 1) == 0;
        
        
        // add the two values
        int psiRAW = psiU + psiL;
        int thetaRAW = thetaU + thetaL;
        int phiRAW = phiU + phiL;

        // average of 1000 samples for calibration
        if (!wiimote.isWiiMotionPlusCalibrated()) {
        	
            if (this.calibrationcounter++ <1000) {
                this.calibrationsequence.add(new double[]{psiRAW, thetaRAW, phiRAW});
            } else {
                this.calibrateWiiMotionPlus();
            }
        } else { // is calibrated
            // calculate degrees per second movement
        	 double psi = 0.0;
             double theta = 0.0;
             double phi = 0.0;

             if(psiHighSpeed) {
                 psi = (double) (psiRAW - psi0) / 4.0;
             } else {
                 psi = (double) (psiRAW - psi0) / 20.0;
             }

             if(thetaHighSpeed) {
                 theta = (double) (thetaRAW - theta0) / 4.0;
             } else {
                 theta = (double) (thetaRAW - theta0) / 20.0;
             }

             if(phiHighSpeed) {
                 phi = (double) (phiRAW - phi0) / 4.0;
             } else {
                 phi = (double) (phiRAW - phi0) / 20.0;
             }
             
             double []vector={psi,theta,phi};
             RotationThresholdFilter filter = new RotationThresholdFilter();
             filter.setSensivity(15);
             vector= filter.filterAlgorithm(vector);
             //RotationResetFilter filter2 = new RotationResetFilter(wiimote);
             //vector=filter2.filterAlgorithm(vector);
             
            
             
         	if(-vector[0]!=lastPsi || -vector[1]!=lastTheta ||-vector[2]!=lastPhi){
	            
					fireRotationSpeedEvent(new double[]{-vector[0], -vector[1], -vector[2]});
					lastPsi=-vector[0];
					lastTheta=-vector[1];
					lastPhi=-vector[2];
         	}
             
        }		
       
        
	}
	 /**
     * If a Wii Motion Plus is attached and activated properly this
     * event could be fired within every change of orientation of the
     * device. The orientation is not used to do gesture recognition,
     * yet.
     * Fires the rotation speed event and calculates the rotation event and calls the function who fires it.
     *
     * @param vector The rotational speed vector, containing:
     *  phi - Rotational speed of x axis (pitch)
     *  theta - Rotational speed of y axis (roll)
     *  psi - Rotational speed of z axis (yaw)
     */

	public void fireRotationSpeedEvent(double[] vector) {
		Vector<RotationListener> listeners = this.getRotationListener();
		if (listeners.isEmpty()) {
				return;
			}	
	        for (int i = 0; i < wiimote.rotfilters.size(); i++) {
	            vector = wiimote.rotfilters.get(i).filter(vector);
	            // cannot return here if null, because of time-dependent filters
	        }
	        if (vector != null) {
	        	RotationSpeedEvent evt = new RotationSpeedEvent(wiimote,vector[0], vector[1], vector[2]);
	 			for (RotationListener l : listeners) {
	 				l.rotationSpeedReceived(evt);
	 			}       	
	            // calculate new orientation with integration
	            // do not store new global values here, since they
	            // need regular updates only depended on acceleration values.          
	 			double tyaw = this.yaw +  vector[0]* 0.01;
	            double troll = this.roll + vector[1]* 0.01;           
	            double tpitch = this.pitch + vector[2]* 0.01;	 
	            
	            if (tyaw>=360) {tyaw=tyaw%360;}
	            if (troll>=360) {troll=troll%360;}
	            if (tpitch>=360) {tpitch=tpitch%360;}
	            
	            
	            if(tyaw!=lastYaw || troll!=lastRoll || tpitch!=lastPitch){
	        		
		            lastYaw=tyaw;
					lastRoll=troll;
					lastPitch=tpitch;
	            
	            fireRotationEvent(tpitch, troll, tyaw);	    
	            }
	            
	        }
	        
	    }

	/**
	 * Sets the psi0, theta0 and phi0 with a calculus using the calibrationsequence field.
	 * Fires a CalibrationFinishedEvent when the calibration is finished.
	 */
	private void calibrateWiiMotionPlus() {
	
		for (int i = 0; i < this.calibrationsequence.size(); i++) {
			this.psi0 += this.calibrationsequence.elementAt(i)[0];
			this.theta0 += this.calibrationsequence.elementAt(i)[1];
			this.phi0 += this.calibrationsequence.elementAt(i)[2];
		}
		this.psi0 /= this.calibrationsequence.size();
		this.theta0 /= this.calibrationsequence.size();
		this.phi0 /= this.calibrationsequence.size();
		
		System.out.print("Wii Motion Plus calibrated manually!"+"\n");
		wiimote.setWiiMotionPlusCalibrated(true);
        fireCalibrationFinishedEvent(wiimote);
      
    }
	/**
	 * Set the WiiMote field with the wiimote given as parameter.
	 * @param wiimote The new wiimote.
	 */
	@Override
	public void setMote(Wiimote wiimote) {	
		this.wiimote = wiimote;

	}

	/**
	 * Not implemented
	 * */
	@Override
	public void dataRead(DataEvent evt) {
	}
	/**
	 * Gets the field wiimote.
	 * @return Wiimote The WiiMote to whom the WiiMotionPlus is attached.
	 */
	public Wiimote getWiimote() {
		return wiimote;
	}
    /**
     * Adds a filter to process the rotation speed data of the
     * wiimote with an attached Wii Motion Plus.
     *
     * @param filter The Filter to be added.
     */
    public void addRotationFilter(Filter filter) {
        wiimote.rotfilters.add(filter);
    }

    /**
     * Resets all filters which are applied to the rotation data
     * from the Wii Motion Plus. Also resets _all_ determined orientation
     * angles,  which should be extended with a consideration of other
     * external datas - maybe irda events.
     */
    public void resetRotationFilters() {
        this.yaw = 0.0;
        this.pitch = 0.0;
        this.roll = 0.0;
        for (int i = 0; i < wiimote.rotfilters.size(); i++) {
            wiimote.rotfilters.elementAt(i).reset();
        }
    }
    /**
     * Fires the current relative orientation of the Wiimote to
     * all RotationListeners.
     *
     * @param yaw Orientation around Z axis.
     * @param roll Orientation around Y axis.
     * @param pitch Orientation around X axis.
     */
    public void fireRotationEvent(double pitch, double roll, double yaw) {
    	
    	
		Vector<RotationListener> listeners = this.getRotationListener();

    	this.pitch = pitch;
        this.roll = roll;
        this.yaw = yaw;

    	RotationEvent evt = new RotationEvent(wiimote,pitch,roll, yaw);
			for (RotationListener l : listeners) {
				l.rotationReceived(evt);
			}
    }

    /**
     * Throws a CalibrationFinishedEvent to all rotation listeners.
     * @param wiimote The wiimote in which the listeners are.
     */
    public void fireCalibrationFinishedEvent(Wiimote wiimote) {
    	
		Vector<RotationListener> listeners = this.getRotationListener();

			for (RotationListener l : listeners) {
				l.calibrationFinished();
			}
    }
    /**
     * The added Listener will be notified about detected orientation
     * changes.
     *
     * @param listener The Listener to be added.
     */
    public void addRotationListener(RotationListener listener) {
        this.rotationListener.add(listener);
        

    }

	public Vector<RotationListener> getRotationListener() {
		return rotationListener;
	}
	  /**
     * Prints a byte stream as hex string.
     * @param b
     */
   
    @SuppressWarnings("unused")
	private void printBytes(byte[] b) {
        String out = "";
        String[] s = this.byte2hex(b);
        for (int i = 0; i < s.length; i++) {
            out += " " + s[i];
        }
       System.out.println(out);
    }

    /**
     * Converts a byte array to a string array.
     * 
     * @param b The byte array.
     * @return String [] The converted string array.
     */
    
    private String[] byte2hex(byte[] b) {
        String[] out = new String[b.length];
        String stmp = "";
        for (int n = 0; n < b.length; n++) {
            stmp = (java.lang.Integer.toHexString(b[n] & 0XFF));
            if (stmp.length() == 1) {
                out[n] = ("0" + stmp).toUpperCase();
            } else {
                out[n] = stmp.toUpperCase();
            }
        }
        return out;
    }
}