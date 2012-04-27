/*
 * Copyright 2007-2008 Volker Fritzsch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
 */
package org.wiigee.event;

import java.util.EventListener;

/**
 * Must be implemented by all class which wants to deal with Nuchuk buttons events.
 * <p>
 * @author <a href="mailto:vfritzsch@users.sourceforge.net">Volker Fritzsch</a>, upgraded by Santiago Hors Fraile
 */
public interface NunchukButtonListener extends EventListener{

	/**
	 * Must be implemented to manage the Nunchuk button pressed events.
	 * @param event The new NunchukButtonPressedEvent.
	 */
	public void buttonPressedReceived(NunchukButtonPressedEvent event);
	/**
	 * Must be implemented to manage the Nunchuk button released events.
	 * @param event The new NunchukButtonReleasedEvent.
	 */
	public void buttonReleasedReceived (NunchukButtonReleasedEvent event);
	
}
