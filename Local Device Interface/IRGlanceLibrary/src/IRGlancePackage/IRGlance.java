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
package IRGlancePackage;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

/**
 * This is a class whose objects will take the events fired by the IR event thrower of the library you are working with, and will report the speed in which the the IR spots goes and comes into the camera to the list of added listeners. 
 * Its rate is determined by "period". In order to get a reliable speed, it has been implemented a filter that avoids counting short amounts of different IR values that could be added to the speed
 * result when they are, in deed, just noise. That means that if the filter is set to "4", it will be necessary to take 4 or more values of the same quantity of IR spots continously.
 * Depending on how much noise we have and the characteristics of the library we are using we should set the value to a higher or lower value (it is an empiric value). 
 * It has been considered that the filter value for the WiiGee is 3 and for the WiiUseJ is 5.
 * @author    Santiago Hors Fraile 
 */
public class IRGlance extends IRGlanceSupporter{

	/**
	 * Represents the counter of IR changes
	 */
	private int changeCounter=0;
	/**
	 * Represents the counter of IR changes in one period. 
	 */
	private int periodChangeCounter=0;
	/**
	 * Represents the number of seconds in which it is going to be counted the number of IR spot changes.
	 */
	private int period;
	/**
	 * Stores the immediate last speed.
	 */
	private float lastSpeed=0;
	/**
	 * represents the last number of IR points glanced.
	 */
	private int lastIRGlanced=0;
	
	/**
	 * Represents a filter whose objective is to avoid that slight IR points are count as real changes when they are only noise. 
	 * It will be obligatory that the camera detects at least eventFilter ocurrences so that that amount of IR spots glanced counts.
	 */
	private int eventFilter = 0;
	/**
	 * Represents the last event filter
	 */
	private int lastFilter= 0;
	/**
	 * Counts the number of continuous IR spot ocurrences with the same number of IR spots.
	 */
	private int filterCounter = 0;
	
	/**
	 * Stores the listeners of this class.
	 */
	List <IRGlanceListener> listenersList  = new ArrayList <IRGlanceListener> ();
	/**
	 * Represents the timer object that is necessary to perform the tasks.
	 */
	Timer timer = new Timer(true);
	
	/**
	 * Gets the current changeCounter.
	 * @return int The current changeCounter.
	 */
	public int changeCounter(){
		return changeCounter;
	}
	/**
	 * Gets the current periodChangeCounter.
	 * @return int The current periodChangeCounter.
	 */
	public int getPeriodChangeCounter(){
		return periodChangeCounter;
	}
	/**
	 * Gets the current period.
	 * @return int The current period.
	 */
	public int getPeriod(){
		return period;
	}
	/**
	 * Gets the last speed.
	 * @return float The last speed.
	 */
	public float getLastSpeed(){
		return lastSpeed;
	}
	
	/**
	 * Sets the eventFilter field to the one given as parameter.
	 * @param newEventFilter The new event filter.
	 */
	public void setEventFilter(int newEventFilter){
		this.eventFilter = newEventFilter;
	}
	/**
	 * Gets the current event filter.
	 * @return int The current event filter.
	 */ 
	public int getEventFilter(){
		return this.eventFilter;
	}

	/**
	 * Settles the timer and calls the creation of the main task.
	 * @param period The number of milliseconds that the timer will last until a new task is created.
	 */

	public IRGlance (int period){
		this.period= period;
		timer.schedule(createTask(), 0, period);
		
	}
	
	
	/**
	 * Updates the following attributes: changeCounter, periodChangeCounter and lastIRGlanced if the parameter num is not equal to the lastIRGlanced and 
	 * the num passes the filterPassed function test.
	 * @param num The number of IR points that the WiiMote has seen in a concrete moment.
	 */
	public void IRSpotGlanced(int num) {
		
		if(filterPassed(num) && num != lastIRGlanced){
								
			changeCounter++;
			periodChangeCounter++;
			lastIRGlanced = num;
		}
	}
	
	/**
	 * Adds a new listener to the listeners list.
	 * @param li The new listener to be added.
	 */
	public void addListener(IRGlanceListener li){
		this.listenersList.add(li);
	}
	
	/**
	 * Removes the IRGlanceListenr given as parameter from the IRGlance object attribute list.
	 * @param li The listener to be removed.
	 * */
	public void removeListener(IRGlanceListener li){
		this.listenersList.remove(li);
	}
	
	/**
	 *  Takes every single listener from the listener list and reports the event to them.
	 *  @param e The SpeedEvent we want to be fired
	 */
	private void fireSpeedEvent(SpeedEvent e){ 
		Iterator <IRGlanceListener> it = listenersList.iterator();
		while(it.hasNext()){
			((IRGlanceListener)it.next()).speedUpdated(e);
		}
	}
	
	/**
	 * Creates and return a new SpeedEvent using the period and periodChangeCounter.
	 * @return SpeeEvent The new SpeedEvent created.
	 */
	
	private SpeedEvent createSpeedEvent(){
		return new SpeedEvent(this, period, periodChangeCounter);
	}
	

	/**
	 * Creates and returns a TimerTask whose mission is to fire speed events. The attribute lastSpeed is updated to the same value of periodChangeCounter 
	 * and periodChangeCounter is updated to the value "0" before throwing the event but after the event itself has been created.
	 * @return TimerTask the new TimerTask created.
	 */
	
	private TimerTask createTask(){
		
		return new TimerTask(){
			
			public void run(){
				
				//Attention: we might not be catching all the events due to the lack of synchronism. It would be a good idea to use semaphoress to avoid this.
				SpeedEvent se = createSpeedEvent();
				lastSpeed=periodChangeCounter;//�no podr�a ser lastSpeed=speed; speed=0; ???
				periodChangeCounter =0;
			
				
				fireSpeedEvent(se);
				
			}
		};
	}
	
	/**
	 * Returns true when it is called with a sequence of equal numbers. The length of this sequence has to be greater or equal than eventFilter.
	 * It is done to filter some IR points (the num is the number of IR points the wiimote has recognized) that might be taken as correct but they are 
	 * indeed produced by slight noise.
	 * *
	 * @param num Represents the number of IR points that the wiimote has seen in a concrete moment.
	 * @return is True if "num" has passed the filter it will be true, false otherwise. 
	 */
	
	private boolean filterPassed (int num){
			
		if(eventFilter==0){
			return true;
		}else{
			if(num==lastFilter){
				filterCounter++;
				if(filterCounter>=eventFilter){
					return true;
				}else{
					return false;
				}
			}else{
				filterCounter=1;
				lastFilter=num;
				return false;
			}
		}
		
		
		
	}
	
	
}
