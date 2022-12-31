## The Event Manager Component


The main responsibilities of the component are
- To list out all the events and corresponding subevents data in detail.  
- Add new events and subevents to the application database
- Edit the existing event/ subevent details
- Delete any existing event or subevent from the application database  
&nbsp;

In order to provide the above functionalities, the EventManager view is designed as follows. The view mainly consists of 5 parts,
- The data display view is designed as the 2-layered nested table. The outer Table created         using the list component provided by the external nebular library. While the inner table is      wrapped inside the list item of the outer table
- Form to create a new event, initially in a hidden mode
- Form to edit the existing event details, initially in a hidden mode. As the user click’s 
   edit button for the event, the view hides the corresponding event list item and displays the edit form by changing the hidden mode
- The view consists of the Form to create a new subevent, initially in a hidden mode. The
   subevent edit form is designed using the nebular stepper Angular UI component. As subevent
   creation requires a large number of parameters, the form is divided into two steps. On the first step, the form takes the user input for the information common to all types of the subevent. While The second step collects the subevent type-specific information, so based on the user-selected subevent type, the corresponding form displayed on the second step. When the user clicks the Add new subevent, the component displays the form view by hiding the data display view
- The form to edit the existing subevent details, initially in a hidden mode. When the user
   clicks the edit button for any subevent,  the component displays the subevent edit form view by hiding the data display view

&nbsp;
On the EventManager view initialization, The component fetches the Event and Subevent data and set the component properties. Using those properties, view displays the data in a nested tabular view. Whenever the user clicks the Add/Edit event button, The component toggle the corresponding hidden form and binds the component property to access the form data for further server communication. To add/edit the subevent, once the user clicks the Add/Edit subevent button, the component hides the actual tabular data view and shows the corresponding form view. The EventManager component uses below mentioned external libraries,

- Ng-pick-datetime library: used to select date and time for configuration properties of event     and subevent. For example start date, end date, late end time, etc.
- Ngx-color-picker library: used to select the background-color property for the subevent of       SUPLOAD type
- Ngx-file-upload library: used to select and upload CSV file for various subevents
- Material slide toggle Module: used to take input for various boolean-valued configuration        parameters of event/subevent
