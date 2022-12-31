import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NbIconLibraries, NbToastrService } from '@nebular/theme';
import { EventManagerService } from './eventmanager.service';
import { AssignmentManagerService } from '../assignmentmanager/assignmentmanager.service';
import { Assignment } from '../assignmentmanager/assignmentmanager.model';
import { EventClass, SubEvent } from './eventmanager.model';
import { AppSettings } from '../../Shared/constants';


/**
 * Please see the README for the description
 */
@Component({
  selector: 'eventmanager',
  templateUrl: './eventmanager.component.html',
  styleUrls: ['./eventmanager.component.scss'],
})
export class EventmanagerComponent implements OnInit {

  /**
   * the boolean flag used to display/hide the event creation form
   */
  isOpenCreateForm: boolean = false;
  /**
   * the boolean flag used to display/hide the edit form for the user-selected event
   */
  isOpenEditForm: boolean = false;
  /**
   * the list of course assignment used to show in form dropdown for the event create/edit activity 
   */
  assignments: Assignment[] = [];
  /**
   * The EventClass model object used for 2 way data binding to the event create/edit form 
   */
  tempevent: EventClass;
  /**
   * The SubEvent model object used for 2 way data binding to the subevent create/edit form 
   */
  tempSubEvent: SubEvent;
   /**
   * the boolean flag used to display/hide the subevent creation form
   */
  isOpenSubeventCreateForm: boolean = false;
    /**
   * the boolean flag used to display/hide the edit form for the user-selected subevent
   */
  isOpenSubeventEditForm: boolean = false;
  
  // subeventMode: String = '';
  // public selectedMoments = [new Date(2018, 1, 12, 10, 30), new Date(2018, 3, 21, 20, 30)];
  // public selectedMoment = this.selectedMoments[1];
  /**
   * the list of user submission modes available for subevent( of type SUPLOAD) configuration
   */
  submission_modes: any[] = [];
  /**
   * the list consists all types of the subevent
   */
  subevent_types: any[] = AppSettings.subevent_types;
  /**
   * the list of available submission group schemes for the SUPLOAD subevent. For example IN(individual), FG(fixed group), OG(open group).
   */
  submission_group_scheme: any[] = AppSettings.submission_group_scheme;
   /**
   * the list of available question set schemes for the SUPLOAD subevent. For example OS(open questionset scheme), FS(fixed question set scheme).
   */
  question_set_scheme: any[] = AppSettings.question_set_scheme;
   /**
   * the list of available grading duty schemes for the GUPLOAD subevent. For example MQS, MQR, etc.
   */
   grading_duty_schemes: any[] = AppSettings.grading_duty_schemes;
      /**
   * the list of available regrading duty schemes for the RGUPLOAD subevent. For example SOR, RAN, QRN, etc.
   */
  regrading_duty_schemes: any[] = AppSettings.regrading_duty_schemes;
  // public color3: string = 'rgba(45,208,45,1)';
  /**
   *  the object used to hold the user uploaded participant's CSV file for the SUPLOAD subevent
   */
  public supload_file: Array<File> = [];
  /**
   *  the object used to hold the user uploaded participant's CSV file for the QVIEW/AVIEW subevent
   */
  public qa_view_file: Array<File> = [];
   /**
   *  the object used to hold the user uploaded participant's CSV file for the SVIEW/MVIEW/RMVIEW/GVIEW/RGVIEW subevent
   */
  public smrmgrg_view_file: Array<File> = [];
   /**
   *  the object used to hold the user uploaded participant's CSV file for the GUPLOAD subevent
   */
  public gupload_file: Array<File> = [];
    /**
   *  the object used to hold the user uploaded participant's CSV file for the RGREQ subevent
   */
  public rgreq_file: Array<File> = [];
  /**
   *  the object used to hold the user uploaded participant's CSV file for the RGUPLOAD subevent
   */
  public rgupload_file: Array<File> = [];
  // public participant_spec: string = '0';

/**
 * the component constructor used to inject the services and initialize objects of
 *  Event Manager Service, Assignment Manager Service, Nebular Icons library, and Nebular Toastr Service 
 * @param iconsLibrary the object of Nebular Icons Library
 * @param eventManagerService the object of Event Manager Service
 * @param assignManagerService the object of Assignment Manager Service
 * @param toastr the object of Nebular Toastr Service
 */
  constructor(
    iconsLibrary: NbIconLibraries,
    public eventManagerService: EventManagerService,
    public assignManagerService: AssignmentManagerService,
    private toastr: NbToastrService) {
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });

  }

  /**
   * the component lifecycle hook, get called on every component initialization. 
   * It used to make required API calls to fetch all event and subevent data,
   *  initialize the properties which binds to view forms present for the event and subevent.
   */
  ngOnInit() {
    this.submission_modes = AppSettings.submission_modes;
    console.log(this.submission_modes);
    this.getEvents();
    this.initializeTempEvent();
    this.initializeTempSubEvent();
  }

/**
 * The list of all event objects present in the course.
 *  Each event object hold the event properties and list of corresponding subevents.
 * The list used to display event and subevent data in the Event Manager view.
 */
  events: any[];

  /**
   * the method fetch the Event and Subevent data using service API fetchEvents.
   *  On receiving successful response from server,
   *  method loads the processed server response from local storage and set the component property events.
   */
  getEvents() {
    this.eventManagerService.fetchEvents().subscribe(
      resData => {
        console.log('events fetch successfully');
        const tempData: EventClass[] = JSON.parse(localStorage.getItem('all_events'));
        this.events = tempData;
      },
    );

  }

  /**
   * the method makes an server API call to add a new event using event manager service API addEvent.
   * On receiving successful response from server, method toogles the add event form,
   *  update the data display view with updated data list and shows appropriate notification message
   * 
   * Current use: once the user clicks the submit on the add event form,
   *  the view triggers call to the addEvent method 
   */
  addEvent() {
    console.log('add event called', this.tempevent);
    this.eventManagerService.addEvent(this.tempevent).subscribe(
      resData => {
        this.getEvents();
        console.log(resData);
        this.toastr.show('Event added successfully', 'Success', { status: 'success' });
        // this.toastr.success('Event added successfully', 'Success');
        this.toggleEventCreateForm();
      },
      error => {
        console.log(error);
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else if (error.error != null && error.error.non_field_errors != null) {
          this.toastr.danger(error.error.non_field_errors[0], 'Error');
        } else if (error.error != null && error.error.name != null) {
          this.toastr.danger('name: ' + error.error.name, 'Error');
        } else if (error.error != null && error.error.grade_aggregation_method != null) {
          this.toastr.danger(error.error.grade_aggregation_method, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }

      },
    );
  }

  /**
   * Method toggle the Event creation form by inverting value of the property isOpenCreateForm.
   */
  toggleEventCreateForm() {
    if (!this.isOpenCreateForm) {
      this.initializeTempEvent();
      this.fetchAssignments();
    }
    this.isOpenCreateForm = !this.isOpenCreateForm;
  }

  /**
   * Method toggle the edit Event form by inverting value of the property isOpenEditForm.
   */
  toggleEventEditForm() {
    if (!this.isOpenEditForm) {
      this.fetchAssignments();
    }
    this.initializeTempEvent();
    this.isOpenEditForm = !this.isOpenEditForm;
  }

   /**
   * Method toggle the SubEvent creation form by inverting value of the property isOpenSubeventCreateForm.
   */
  toggleSubEventCreateForm() {
    this.isOpenSubeventCreateForm = !this.isOpenSubeventCreateForm;
  }

     /**
   * Method toggle the edit SubEvent form by inverting value of the property isOpenSubeventEditForm.
   */
  toggleSubEventEditForm() {
    this.isOpenSubeventEditForm = !this.isOpenSubeventEditForm;
  }

  /**
   * the method fetches the list of course assignments from the application database using service API.
   * On receiving successful response from server, method sets the assignments property of component 
   * 
   */
  fetchAssignments() {
    if (localStorage.getItem('assignments') === null) {
      this.assignManagerService.fetchAssignment().subscribe(
        resData => {
          console.log('assignments fetch successfully');
          // for(let i=0;i<resData.assignments.length;i++)
          // {
          this.assignManagerService.fetchQuestionset();
          // }
          console.log('QSETS fetch successfully');
          // const tempData = JSON.parse(localStorage.getItem('assignments'));
          this.assignments = this.assignManagerService.assignData.value;
        },
      );
    } else {
      const tempData = JSON.parse(localStorage.getItem('assignments'));
      this.assignments = tempData;
    }
  }

  /**
   * Once the user clicks the edit button for any event, the view triggers call to the onEditEvent method.
   * The method loads the edit form with the user-selected event data,
   *  then display the edit form by calling the toggleEventEditForm API of the component
   * @param eventidx the list index of the user-selected event
   */
  onEditEvent(eventidx: number) {
    console.log(eventidx);
    this.toggleEventEditForm();
    this.tempevent = this.events[eventidx];
    console.log(this.tempevent);

  }

  /**
   * The method makes an server API request to update the event details using service provided editEvent method.
   * On receiving success response from the server, method hide the event edit form 
   * and update the event list view with updated data. If server returns an error response,
   *  method handles the error and shows the toastr notification with the error message received from the server
   * 
   * Current use: Once the user submit the edit event form for any event,
   *  the view triggers call to the submitEditEvent method 
   */
  submitEditEvent() {
    console.log(this.tempevent);

    this.eventManagerService.editEvent(this.tempevent).subscribe(
      resData => {
        this.getEvents();
        this.toastr.success('Event updated successfully', 'Success');
        this.toggleEventEditForm();
      },
      error => {
        console.log(error);
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else if (error.error != null && error.error.non_field_errors != null) {
          this.toastr.danger(error.error.non_field_errors[0], 'Error');
        } else if (error.error != null && error.error.name != null) {
          this.toastr.danger('name: ' + error.error.name, 'Error');
        } else if (error.error != null && error.error.grade_aggregation_method != null) {
          this.toastr.danger(error.error.grade_aggregation_method, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }

      },
    );
  }

  /**
   * the method calls the server API request to delete the event from the course using the service API deleteEvent.
   * On receiving success response from the server,
   *  method updates the events property of component in order to refresh the view.
   * It also shows apropriate toastr notification is shown based on the received server response
   * 
   * Current use: Once the user clicks the delete button for any event,
   *  the view triggers call to the onDeleteEvent method
   * @param eventidx the list index of user-selected event for deletion
   */
  onDeleteEvent(eventidx: number) {
    this.eventManagerService.deleteEvent(this.events[eventidx]).subscribe(
      resData => {
        // console.log(resData);
        this.getEvents();
        this.toastr.success('Event deleted successfully', 'Success');
      },
      error => {
        console.log(error);
        this.toastr.danger(error.error.detail, 'Error');
      },
    );
  }

    /**
   * the method calls the server API request to delete the subevent from the course using the service API deleteSubEvent.
   * On receiving success response from the server,
   *  method updates the events property of component in order to refresh the view.
   * Apropriate toastr notification is shown based on the received server response
   * 
   *  Current use: Once the user clicks the delete button for any subevent,
   *  the view triggers call to the onDeleteSubEvent method
   * @param eventidx the list index of the event corresponding to the user-selected subevent for deletion
   * @param subeventidx the list index of user-selected subevent for deletion
   * 
   *  
   */
  onDeleteSubEvent(eventidx: number, subeventidx: number) {
    this.eventManagerService.deleteSubEvent(this.events[eventidx].subevents[subeventidx]).subscribe(
      resData => {
        // console.log(resData);
        this.getEvents();
        this.toastr.success('Subevent deleted successfully', 'Success');
      },
      error => {
        console.log(error);
        this.toastr.danger(error.error.detail, 'Error');
      },
    );
  }

  /**
   * the method used to instantiate the tempevent property as 
   *  instance of the EventClass model class with empty data values
   */
  initializeTempEvent() {
    this.tempevent = new EventClass(-1, null, '', null, null, null, false, []);
  }

  /**
   * the method used to instantiate the tempSubEvent property as 
   *  instance of the SubEvent model class with empty data values
   */
  initializeTempSubEvent() {
    this.tempSubEvent = new SubEvent(-1, null, null, '', [new Date(), new Date()], null,
      false, false, new Date(), new Date(), new Date(), 0, null, null, 0, null,
      false, 20, 'pdf', false, 0, null, null, 'rgba(45,208,45,1)', null, [], null, '0', [], 0, null, null);
  }

/**
 * the method used to display the subevent create form view by hiding the main data table view.
 * It fetches the required existing subevent lists based on type for subevent creation, 
 * like list of existing SUPLOAD's, list of existing GUPLOAD's, list of existing RGUPLOAD's in the same corresponding event.
 * 
 * Current Use: Once the user clicks the add new subevent button, view triggers call to openAddSubeventForm method
 * @param eventidx the list index of the event corresponds to the new subevent request
 */
  openAddSubeventForm(eventidx: number) {
    this.initializeTempSubEvent();
    this.tempSubEvent.event_id = this.events[eventidx].main_id;
    this.fetch_list_values(eventidx);
    this.toggleSubEventCreateForm();
    console.log(eventidx);
  }

  /**
  * the method used to hide the subevent create form view by showing the hidden main data table view.
  * It resets the form data object with empty data values.
  * 
  * Current Use: Once the user clicks the cancel on the add new subevent form,
  *  view triggers call to cancelAddSubeventForm method
  */
  cancelAddSubeventForm() {
    this.initializeTempSubEvent();
    this.toggleSubEventCreateForm();
    console.log('subevent create canceled');
  }

  /**
   * Empty function API created such that can be used for future use.
   * the method provides way to perform some functionality while moving to next step in the add subevent form.
   */
  nextAddSubeventForm() {

    // this.toggleSubEventCreateForm();
    console.log('subevent next submitted =', this.tempSubEvent);
    // this.initializeTempSubEvent();
  }
  subeventLoading: boolean = false;

  /**
   * validate the data values of the add subevent form. If the subevent type is SUPLOAD and submission mode is not OLI, 
   * then participant's CSV file must provided else method shows an error notification and returns.  
   * If the subevent type is AVIEW/QVIEW, then participants of subevent must be same as participants of gen_subevent list.
   * If the subevent type is RGUPLOAD and regrading duty scheme is RQN, 
   * then participant's CSV file must provided else method shows an error notification and returns. 
   * The method makes server API request to add the new subevent to the event using the service provided addSubEvent method.
   * On receiving success response from the server, it updates the list of subevents in the view.
   * If server responds error, then method performs error processing and shows the toastr notification with error message received from the server.
   * 
   * Current Use: Once user clicks the submit on the subevent creation form, view triggers call to submitAddSubeventForm method
   */
  submitAddSubeventForm() {

    console.log(this.tempSubEvent.sbm);
    if (this.tempSubEvent.type === 'SUPLOAD') {
     
        if (this.supload_file.length == 0) {
          this.toastr.danger('Upload participants CSV File', 'Error');
          return;
        }
        this.tempSubEvent.participants_spec = '0';
        this.tempSubEvent.plist_csv_file = this.supload_file[0];
    } else if (this.tempSubEvent.type === 'AVIEW' || this.tempSubEvent.type === 'QVIEW') {
      this.tempSubEvent.participants_spec = '1';
      this.tempSubEvent.gen_subevent = this.tempSubEvent.plist_subevents;
      // this.toastr.danger('Verify AVIW, QVIEW doubts', 'Error');
      // return;
    } else if (['SVIEW', 'MVIEW', 'RMVIEW', 'GVIEW', 'RGVIEW'].indexOf(this.tempSubEvent.type) > -1) {
      this.tempSubEvent.plist_csv_file = this.smrmgrg_view_file[0];
    } else if (this.tempSubEvent.type === 'GUPLOAD') {
      this.tempSubEvent.plist_csv_file = this.gupload_file[0];
      // this.toastr.danger('Verify AVIW, QVIEW doubts', 'Error');
      // return;
    } else if (this.tempSubEvent.type === 'RGUPLOAD') {
      if (this.tempSubEvent.rds == 'RQN') {
        if (this.rgupload_file.length == 0) {
          this.toastr.danger('Participants CSV File required', 'Error');
          return;
        }
      }
      this.tempSubEvent.plist_csv_file = this.rgupload_file[0];
    } else if (this.tempSubEvent.type === 'RGREQ') {
      this.tempSubEvent.plist_csv_file = this.rgreq_file[0];
    }

    this.subeventLoading = true;
    this.eventManagerService.addSubEvent(this.tempSubEvent).subscribe(
      resData => {
        console.log(resData);
        this.toastr.success('Subevent created successfully', 'Success');
        this.toggleSubEventCreateForm();
        // console.log('subevent create submitted =', this.tempSubEvent);
        this.initializeTempSubEvent();
        this.getEvents();
        this.subeventLoading = false;

        return;
      },
      error => {
        console.log(error);
        this.subeventLoading = false;
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else if (error.error != null && error.error.non_field_errors != null) {
          this.toastr.danger(error.error.non_field_errors[0], 'Error');
        } else if (error.error != null && error.error.name != null) {
          this.toastr.danger('name: ' + error.error.name, 'Error');
        } else if (error.error != null && error.error.gen_subevent != null) {
          this.toastr.danger('generating subevent: ' + error.error.gen_subevent, 'Error');
        } else if (error.error != null && error.error.NACODE != null) {
          this.toastr.danger(error.error.NACODE, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }
        return;
      },
    );

  }

  /**
 * the method used to display the subevent edit form view by hiding the main data table view.
 * It loads the user-selected subevent details into the edit form. 
 * The details mainly includes time range values like start time, end time, display end time,
 * late end time, displate late end time, and etc.
 * 
 * Current Use: Once the user clicks the edit subevent button, view triggers call to openEditSubeventForm method
 * @param eventidx the list index of the event corresponds to the user-selected subevent
 * @param subeventidx the list index of the user-selected subevent
 */
  openEditSubeventForm(eventidx: number, subeventidx: number) {
    this.tempSubEvent = this.events[eventidx].subevents[subeventidx];
    this.tempSubEvent.time_range = [new Date(this.tempSubEvent.time_range[0]), new Date(this.tempSubEvent.time_range[1])];
    this.tempSubEvent.display_end_time = new Date(this.tempSubEvent.display_end_time);
    this.tempSubEvent.late_end_time = new Date(this.tempSubEvent.late_end_time);
    this.tempSubEvent.display_late_end_time = new Date(this.tempSubEvent.display_late_end_time);

    // this.initializeTempSubEvent();
    this.toggleSubEventEditForm();
    console.log(this.tempSubEvent);
  }

  /**
  * the method used to hide the subevent edit form view by showing the hidden main data table view.
  * It resets the form data object with empty data values.
  * 
  * Current Use: Once the user clicks the cancel on the edit subevent form,
  *  view triggers call to cancelEditSubeventForm method
  */
  cancelEditSubeventForm() {
    this.initializeTempSubEvent();
    this.toggleSubEventEditForm();
    console.log('subevent Edit canceled');
  }

    /**
     * validate the user-provided display end time must greater than end time, else display the
     * toastr notification with error message and returns.
   * The method makes an server API request to update the subevnt details using service provided editSubEvent method.
   * On receiving success response from the server, method hide the subevent edit form 
   * and update the subevent list view with updated data. If server returns an error response,
   *  method handles the error and shows the toastr notification with the error message received from the server
   * 
   * Current use: Once the user submit the edit subevent form for any event,
   *  the view triggers call to the submitEditSubeventForm method 
   */
  submitEditSubeventForm() {

    if(this.tempSubEvent.display_end_time > this.tempSubEvent.time_range[1]){
      this.toastr.danger('Display end time must be less than or equal to end time', 'Error');
      return;
    }
    this.eventManagerService.editSubEvent(this.tempSubEvent).subscribe(
      resData => {
        console.log('response received:',resData);
        this.toastr.success('Subevent updated successfully', 'Success');
        this.toggleSubEventEditForm();
        // console.log('subevent create submitted =', this.tempSubEvent);
        this.initializeTempSubEvent();
        this.getEvents();

        return;
      },
      error => {
        console.log(error);
        if (error.error != null && error.error.detail != null) {
          this.toastr.danger(error.error.detail, 'Error');
        } else if (error.error != null && error.error.non_field_errors != null) {
          this.toastr.danger(error.error.non_field_errors[0], 'Error');
        } else if (error.error != null && error.error.name != null) {
          this.toastr.danger('name: ' + error.error.name, 'Error');
        } else if (error.error != null && error.error.gen_subevent != null) {
          this.toastr.danger('generating subevent: ' + error.error.gen_subevent, 'Error');
        } else {
          this.toastr.danger(error.error, 'Error');
        }
        return;
      },
    );

  }

/**
 * the list object used to store all subevents corresponds to an event. Each list item 
 * is the structure holding value and text, where value is subevent database id and text is subevent name.
 * 
 * Current use: used to show in dropdown( for inherit the participants list)
 *  in Subevent creation form
 *  for subevents of type SVIEW, MVIEW, RMVIEW, GVIEW, RGVIEW 
 */
  public plist_all_subevents: any[] = [];
  /**
 * the list object used to store all GUPLOAD subevents corresponds to an event. Each list item 
 * is the structure holding value and text, where value is subevent database id and text is subevent name.
 * 
 * Current use: used to show as the dropdown list in the subevent creation form
 */
  public list_gupload= [];
  /**
 * the list object used to store all RGUPLOAD subevents corresponds to an event. Each list item 
 * is the structure holding value and text, where value is subevent database id and text is subevent name.
 * 
 * Current use: used to show as the dropdown list in the subevent creation form
 */
  public list_rgupload= [];
  /**
 * the list object used to store all SUPLOAD subevents corresponds to an event. Each list item 
 * is the structure holding value and text, where value is subevent database id and text is subevent name.
 * 
 * Current use: used to show as the dropdown list in the subevent creation form
 */
  public list_supload= [];

  /**
   * the method process the existing subevents corresponds to received event id
   * and set the component properties plist_all_subevents, list_gupload, list_supload and list_rgupload
   * @param eventidx the list index of an event
   */
  fetch_list_values(eventidx: number) {
    this.clear_list_values();

    // gupload related - gensubevent(all suploads of this event), plist(all subevents of this event)
    // qview,sview related - gensubevent & participants_list subevent
    const subevents: SubEvent[] = this.events[eventidx].subevents;
    for (let i = 0; i < subevents.length; i++) {
      if (subevents[i].type == 'SUPLOAD') {
        this.list_supload.push({ value: subevents[i].main_id, text: subevents[i].name });
      } else if (subevents[i].type == 'GUPLOAD') {
        this.list_gupload.push({ value: subevents[i].main_id, text: subevents[i].name });
      } else if (subevents[i].type == 'RGUPLOAD') {
        this.list_rgupload.push({ value: subevents[i].main_id, text: subevents[i].name });
      }
      this.plist_all_subevents.push({ value: subevents[i].main_id, text: subevents[i].name });


    }

  }

  /**
   * the method resets the component properties
   *  plist_all_subevents, list_gupload, list_supload and list_rgupload with an empty list
   */
  clear_list_values() {
    this.plist_all_subevents = [];
    this.list_supload = [];
    this.list_gupload = [];
    this.list_rgupload = [];
  }

  /**
   * method used to dynamically update the form fields of subevent related form based
   *  on user action.
   * For the subevent of type RGUPLOAD, if user selects QRN as regrading duty scheme, method 
   * displays the participant's CSV file input field by setting the participants_spec property
   *  of the subevent to 0
   * 
   * Current USe: once user selects regrading duty scheme for the subevent of type RGUPLOAD,
   * view triggers call to the onSelectRDS method
   */
  onSelectRDS() {
    if (this.tempSubEvent.rds == 'QRN' ) {
      console.log('qrn selected');
      this.tempSubEvent.participants_spec = '0';
      return;
    }
  }

}
