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
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.bluetooth.DiscoveryAgent;
import javax.bluetooth.LocalDevice;

/**
 * Manages the Nonin connection and the throwing event logic.
 * @author Santiago Hors Fraile
 */

public class NoninManager implements Runnable{

	/**
	 * Last pulse received.
	 */
	private int pulse;
	/**
	 * Last oxygen value received.
	 */
	private int oxy;
	/**
	 * Last NoninData received.
	 */
	NoninData data;
	/**
	 * Contains all Nonin listeners.
	 */
	List <INoninListener> listenersList  = new ArrayList <INoninListener> ();

	/**
	 * Represents the object of the Nonin discoverer.
	 */
	NoninDiscoveryListener ndl = new NoninDiscoveryListener();
	
	/**
	 * Represents the Nonin device MAC
	 */
	private String noninMac = "";
	
	
	/**
	 * Adds a new Listener to the listeners list.
	 * @param li The new listener to be add.
	 */
	public void addListener(INoninListener li) {
		this.listenersList.add(li);
	}
	
	/**
	 * Removes the NoninListener given as parameter from the IRGlance object attribute list.
	 * @param li The new listener to be removed.
	 */
	public void removeListener(INoninListener li){
		this.listenersList.remove(li);
	}
	/**
	 * Initializes the class.
	 */
	public NoninManager(String noninMac){
		this.noninMac= noninMac;
		pulse = 0;
		oxy = 0;
		data = new NoninData();	
	}
	/**
	 * Initializes the class.
	 */
	public NoninManager(){
		this.noninMac= "";
		pulse = 0;
		oxy = 0;
		data = new NoninData();	
	}
	/**
	 * Tries to connect with a Nonin. If it connects to one, the Nonin is activated.
	 * @throws Exception In case that it could not connect.
	 */
	public void connect() throws Exception{
		
		ndl.setMacToMatch(noninMac);
		synchronized(ndl.inquiryCompletedEvent) {
            /**
            * Get the DiscoveryAgent of the LocalDevice and start the
            * Discovery process
            */
		
	        boolean started;
			
			started = LocalDevice.getLocalDevice().getDiscoveryAgent().startInquiry(DiscoveryAgent.GIAC, ndl);
			
	        if (started) {
	             System.out.println("Comenzando el proceso de descubrimiento del Nonin ...");
	             /*
	             * Wait for Discovery Process end
	             */
	             ndl.inquiryCompletedEvent.wait();
	             if(!ndl.isConnected()){
	            	 System.out.println("No se ha encontrado el Nonin a la primera y lanzo una excepción");
	            	 throw new Exception();
	             }
	             System.out.println("Hubo " + ndl.devicesDiscovered.size() +  " Nonines(s) encontrado(s)");
	             
	        } else {	
	             System.out.println("¡Falló el proceso de descubrimiento del Nonin!");
	             throw new Exception();
	        }
			activate();
       }
		
	}
	/**
	 * Disconnects the Nonin
	 */
	public void disconnect(){
		ndl.setConnected(false);
       
	}
	/**
	 * Creates a new thread of this class
	 */
	private void activate(){
		(new Thread(this)).start();
		
	}
	/**
	 * Gets the last received pulse.
	 * @return int The last pulse.
	 */
	public int getPulse(){
		return pulse;
	}
	/**
	 * Gets the last received oxygen value.
	 * @return int The last oxygen value.
	 */
	public int getOxy(){
		return oxy;
	}
	/**
	 * Gets the last received Nonin data.
	 * @return int The last Nonin data.
	 */
	public NoninData getData(){
		return data;
		
	}
	

	/**
	 * Throws the given NoninEvent to all listeners.
	 * @param ne The NoninEvent to be thrown.
	 */
	private void fireNoninEvent(NoninEvent ne){ 
		 Iterator <INoninListener> it = listenersList.iterator();
		
		  while(it.hasNext()){
			 
			  INoninListener nl =((INoninListener)it.next());
			  
			  (new Thread(new EventLauncher (nl, ne))).start();
		  }
		  
    }


	/**
	 * Reads 4 bytes from the connection input pipe and creates a new NoninEvent with that data. 
	 */
	public void run(){
		
		byte[] b= new byte[4];
		InputStream input = ndl.getInput();

		while(ndl.isConnected()){

			try {
				input.read(b);
			
				// lowBattery
				if((b[3]&1)!=0){ 
					this.data.setLowBattery(true);
				}else{
					this.data.setLowBattery(false);
				}
				// artf
				if((b[0]&4)!=0){ 
					this.data.setArtf(true);
				}else{
					this.data.setArtf(false);
				}
				// oot
				if((b[0]&32)!=0){ 
					this.data.setOot(true);
				}else{
					this.data.setOot(false);
				}
				// lprf
				if((b[0]&16)!=0){
					this.data.setLprf(true);
				}else{
					this.data.setLprf(false);
				}
				// mprf
				if((b[0]&8)!=0){ 
					this.data.setMprf(true);
				}else{
					this.data.setMprf(false);
				}
				// snsa
				if((b[3]&8)!=0){ 
					this.data.setSnsa(true);
				}else{
					this.data.setSnsa(false);
				}
				// spa
				if((b[3]&32)!=0){ 
					this.data.setSpa(true);
				}else{
					this.data.setSpa(false);
				}
		
				//Pulse update
				if((b[0]&1)!=0){
					this.pulse=b[1]+128;
				}else if((b[0]&2)!=0){//No human could resist this.
					this.pulse=b[1]+256;
				}else if((b[0]&3)!=0){//No human could resist this.
					this.pulse=b[1]+384;
				}else{
					this.pulse=b[1];
				}
				//Oxy update
				this.oxy=b[2];
			
				
				NoninEvent ne = new NoninEvent(this.pulse,this.oxy, data, this);
				fireNoninEvent(ne);
				
				
			
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
	}//run

	public void setNoninMac(String noninMac) {
		this.noninMac = noninMac;
	}

	public String getNoninMac() {
		return noninMac;
	}



	/**
	 * @author Santiago Hors Fraile
	 */
	class EventLauncher implements Runnable
	 {
	  /**
	   * Represents the interface of the Nonin listener.
	   */
	  INoninListener nl;
	  /**
	   * Represents the Nonin event.
	   */
	  NoninEvent ne;
	  /**
	   * Sets the fields of this inner class with the given parameter.
	   * @param nl The new INoninListener.
	   * @param ne The new NoninEvent.
	   */
	  EventLauncher (INoninListener nl,NoninEvent ne)
	  {
	   this.nl = nl;
	   this.ne = ne;
	  }
	 
	  /**
	   * Calls to noninUpdate while it is running.
	   */
	  public void run()
	  {
	  
	   nl.noninUpdate(ne);
	  }
	 }
	
	
	
}