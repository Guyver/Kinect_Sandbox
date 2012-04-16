/**
 * Copyright 2010 Santiago Hors Fraile and Salvador Jesús Romero

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

package NoninPackage;

import java.io.IOException;
import java.io.InputStream;
import java.util.Vector;

import javax.bluetooth.DeviceClass;
import javax.bluetooth.DiscoveryListener;
import javax.bluetooth.RemoteDevice;
import javax.bluetooth.ServiceRecord;
import javax.microedition.io.Connector;
import javax.microedition.io.StreamConnection;

/**
 * Contains all necessary logic to discover the Nonin via BlueTooth 
 * @author Santiago Hors Fraile
 */
public class NoninDiscoveryListener implements DiscoveryListener{

	/**
	 * Contains the BlueTooth devices which has been discovered.
	 */
	Vector<RemoteDevice> devicesDiscovered = new Vector<RemoteDevice>();
	/**
	 * Flag object for synchronism purposes.
	 */
	Object inquiryCompletedEvent = new Object();
	/**
	 * Represents the opened BlueTooth connection.
	 */
	private StreamConnection cc;
	/**
	 * Represents the input "pipe" of the connection. We can only read data from this pipe.
	 */
	private InputStream input;
	/**
	 * Represents if the Nonin has been connected or not. True when the Nonin is connected, false otherwise.
	 */
	private boolean connected= false;
	/**
	 * Represents the MAC adress to match
	 */
	private String macToMatch;

	/**
	 * Called when a BlueTooth device has been discovered. If it is a Nonin, this function tries to connect with the Nonin and open an input pipe for reading the Nonin data. 
	 * If it get it, connected turnst to true.
	 * @param btDevice The BlueTooth device which has beeen discovered.
	 * @param cod The DeviceClass. It is not used in this function because it recognizes if the BlueTooth device is a Nonin by its friendly name.
	 */
	@Override
	public void deviceDiscovered(RemoteDevice btDevice, DeviceClass cod){


		 System.out.println("El dispositivo " + btDevice.getBluetoothAddress() + " ha sido econtrado");
         devicesDiscovered.addElement(btDevice);

        try {
             System.out.println("     nombre " + btDevice.getFriendlyName(false));
    
                  
  
             /*Deprecated
              * if(btDevice.getFriendlyName(false).substring(0, 19).equals("Nonin_Medical_Inc._")){
              */  
             System.out.println("estoy comparando "+btDevice.getBluetoothAddress()+" con "+macToMatch);
             if(btDevice.getBluetoothAddress().compareToIgnoreCase(macToMatch)==0){
            	 try{
	                	 cc = (StreamConnection) Connector.open("btspp://"+btDevice.getBluetoothAddress()+":1");
	                	 
	                	 setInput(cc.openInputStream());
	                	 setConnected(true);     
                }
                catch(Exception e){
                	e.printStackTrace();
        		}
             }
        } catch (IOException cantGetDeviceName) {
             System.out.println("Error: "+cantGetDeviceName);
        }
        
        
	}
	/**
	 * Notifies all waiting threads of inquiryCompletedEvent.
	 * @param arg0 Not used parameter.
	 */
	@Override
	public void inquiryCompleted(int arg0) {
		   System.out.println("Completada la investigacion del dispositivo!");

	          synchronized(inquiryCompletedEvent) {
	               inquiryCompletedEvent.notifyAll();
	          }
		
	}

	/**
	 * Not implemented function
	 */
	@Override
	public void serviceSearchCompleted(int arg0, int arg1) {
		
	}

	/**
	 * Not implemented function.
	 */
	@Override
	public void servicesDiscovered(int arg0, ServiceRecord[] arg1) {
		
	}
	/**
	 * Sets the field input with the given parameter.
	 * @param input The new InputStream
	 */
	public void setInput(InputStream input) {
		this.input = input;
	}
	/**
	 * Gets the current input field.
	 * @return InputStream The current input.
	 */
	public InputStream getInput() {
		return input;
	}
	/**
	 * Sets the field cc with the given parameter.
	 * @param cc The new StreamConnection.
	 */
	public void setCc (StreamConnection cc) {
		this.cc = cc;
	}
	/**
	 * Gets the current field cc.
	 * @return StreamConnection The current connection.
	 */
	public StreamConnection getCc() {
		return cc;
	}
	/**
	 * Sets the field connected with the given parameter.
	 * @param connected The new connected value.
	 */
	public void setConnected(boolean connected) {
		this.connected = connected;
	}
	/**
	 * Gets the current field connected.
	 * @return boolean The current field connected.
	 */
	public boolean isConnected() {
		return connected;
	}
	public void setMacToMatch(String macToMatch) {
		this.macToMatch = macToMatch;
	}
	public String getMacToMatch() {
		return macToMatch;
	}

}
