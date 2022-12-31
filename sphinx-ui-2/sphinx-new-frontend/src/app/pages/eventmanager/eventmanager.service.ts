import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../Shared/constants';
import { catchError, tap, concatMap } from 'rxjs/operators';
import { Course } from '../../auth/auth.model';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { EventClass, SubEvent } from './eventmanager.model';


/**
 * The Event Manager service contains the method API's to perform all necessary
 *  server communication required for the Event Management in the Course.
 * It provides method API's mainly for view, create, edit, and delete operations related to events and subevents
 * As the event and subevent related server API's required large number of parameters,
 *  The service methods performs necessary data extraction and type conversions of
 *  various data properties of received model objects.
 * The service performs the server error response handling and returns appropriate error message 
 */
@Injectable({ providedIn: 'root' })
export class EventManagerService {


    /**
     * The constructor used to initialize http object of HttpClient class provided by Angular
     * @param http the object of HttpClient class , used to make server API calls
     */
    constructor(private http: HttpClient) {
    }


    /**
     * the method fetches all the events present in the course.
     *  It makes the get API request to application server using http object.
     *  On receiving successful response from server,
     *  method taps the server response and performs data formatting in order to store it.
     * The server response mainly consist of list of events and nested list of corresponding subevents in json format.
     * During data formatting, the method mainly create the list of EventClass model objects 
     * using response data. Where each EventClass model object contains event information 
     * and corresponding list of SubEvents. 
     * Then method stores the extracted event list in localstorage to make it available to application components.
     * @returns the observable of http GET request
     */
    fetchEvents() {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/events/')
            .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
                tap(responseData => {
                    // console.log(responseData);
                    let events: any[];
                    events = responseData.events;

                    const extractedEvents: EventClass[] = [];
                    for (let i = 0; i < events.length; i++) {
                        const event = new EventClass(
                            i + 1,
                            events[i].id,
                            events[i].name,
                            events[i].assignment_id,
                            '',
                            events[i].grade_aggregation_method,
                            events[i].is_external,
                            [],
                        );
                        const subevents: any[] = events[i].subevents;
                        const extractedSubevents: SubEvent[] = [];
                        for (let j = 0; j < subevents.length; j++) {
                            const tmpstartdt = new Date(subevents[j].start_time);
                            const tmpenddt = new Date(subevents[j].end_time);
                            const subevent = new SubEvent(
                                j + 1,
                                subevents[j].id,
                                events[i].id,
                                subevents[j].name,
                                [new Date(subevents[j].start_time),
                                new Date(subevents[j].end_time)],
                                subevents[j].type,
                                subevents[j].is_blocking,
                                subevents[j].allow_late_ending,
                                new Date(subevents[j].display_end_time),
                                new Date(subevents[j].late_end_time),
                                new Date(subevents[j].display_late_end_time),
                                20,
                                null, null, 0, null, false, 0, null, false, 0, null, null, null, null, [], null, null, [], 0, null, null,
                            );
                            const currtime = new Date();
                            let temptime: number = ((currtime.getTime() - subevent.time_range[0].getTime()) /
                                ( subevent.time_range[1].getTime() - subevent.time_range[0].getTime())) * 100;
                            if (temptime > 100) {
                                temptime = 100;
                            }else if (temptime < 0) {
                                temptime = 0;
                            }else {
                                temptime = Math.round(temptime * 100) / 100;
                            }
                            subevent.time = temptime;
                            extractedSubevents.push(subevent);
                        }
                        event.subevents = extractedSubevents;
                        extractedEvents.push(event);
                        // this.assignmentData.push(assign);
                        // console.log('assignaa fetch id=',this.assignmentData[i].main_id);
                    }
                    // this.assignmentData=extractedAssigns;
                    console.log('extracted data=',extractedEvents);
                    // this.sendAssignData(extractedAssigns);

                    localStorage.setItem('all_events', JSON.stringify(extractedEvents));

                },
                ));
    }
    /**
     * the method handles the server error response and takes appropriate actions according to error
     * @param errorRes the http error response object
     */
    handleLoginError(errorRes: any): any {
        throw new Error('Method not implemented.');
    }


    /**
     * the method makes the server API request to add the event at the application database.
     * @param data The EventClass model object contains the event to be created. 
     *  Model holds event information like name, corresponding assignment id, grade aggregation method and the is_external flag 
     *  @returns the observable of http POST request
     */
    addEvent(data: EventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/events/'
            , {
                name: data.name,
                assignment: data.assignment_id,
                grade_aggregation_method: data.grade_aggregation_method,
                is_external: data.is_external,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

    /**
     * The method makes server API request to update the existing event details with new provided data  
     * @param data The EventClass model object contains the event details to be updated 
     *  Model holds event information like event id, name, corresponding assignment id, grade aggregation method and the is_external flag 
     * @returns the observable of http PUT request
     */
    editEvent(data: EventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + data.main_id + '/'
            , {
                name: data.name,
                assignment: data.assignment_id,
                grade_aggregation_method: data.grade_aggregation_method,
                is_external: data.is_external,
            },
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

    /**
     *  The method makes server API request to delete the existing event from the course database.   
     * @param data The EventClass model object contains the event's corresponding event id
     * @returns the observable of http DELETE request
     */
    deleteEvent(data: EventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + data.main_id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

    /**
     * The method makes a server API call to create new subevent at the application database.
     * The server API for subevent creation required many parameters representing various subevent properties.
     * Using the received SubEvent object, method set the required parameters of server API in the angular formData object.
     * 
     * @param data The object of SubEvent Model class
     * @returns the observable of http POST request for subevent creation
     */
    addSubEvent(data: SubEvent) {

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('start_time', data.time_range[0].toISOString());
        formData.append('end_time', data.time_range[1].toISOString());
        formData.append('display_end_time', data.display_end_time.toISOString());
        formData.append('type', data.type);
        formData.append('is_blocking', String(data.is_blocking));
        formData.append('allow_late_ending', String(data.allow_late_ending));
        formData.append('late_end_time', data.late_end_time.toISOString());
        formData.append('display_late_end_time', data.display_late_end_time.toISOString());
        formData.append('SBM', data.sbm);
        if(data.sbm !='OLI'){
            formData.append('SGS', data.sgs);
            formData.append('SGS_OG_max', data.sgs_og_max.toString());
            formData.append('QSS', data.qss);
        }
        
        formData.append('NAC', String(data.nac));
        formData.append('MUS', data.mus.toString());
        formData.append('MUT', data.mut);
        formData.append('SUP', String(data.sup));
        formData.append('SUS', data.sus.toString());
        formData.append('SUT', data.sut);
        formData.append('DEL', data.del);
        formData.append('COL', data.col);
        if (data.plist_csv_file != null || data.plist_csv_file != undefined)
            formData.append('plist_CSV_FILE', data.plist_csv_file , data.plist_csv_file.name );
        formData.append('gen_subevent', JSON.stringify(data.gen_subevent));
        formData.append('GDS', data.gds);
        formData.append('participants_spec', data.participants_spec);
        formData.append('plist_subevents', JSON.stringify(data.plist_subevents) );
        formData.append('RDS', data.rds);
        formData.append('parent_subevent', data.parent_subevent);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + data.event_id + '/subevents/'
            , formData,
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

    /**
     * The method makes a server API call to edit the existing subevent at the application database.
     * While making request, method sending the multiple required parameters as the angular FormData object.
     * For the date related parameters, method converts the received subevent properties into ISO string formats. 
     * 
     * @param data The object of SubEvent Model class, used to send server API request parameters
     * @returns the observable of http PUT request for subevent updation
     */
    editSubEvent(data: SubEvent) {
        console.log('updated data=', data);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('start_time', data.time_range[0].toISOString());
        formData.append('end_time', data.time_range[1].toISOString());
        formData.append('display_end_time', data.display_end_time.toISOString());
        formData.append('is_blocking', String(data.is_blocking));
        formData.append('allow_late_ending', String(data.allow_late_ending));
        formData.append('late_end_time', data.late_end_time.toISOString());
        formData.append('display_late_end_time', data.display_late_end_time.toISOString());

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
        '/event/' + data.event_id + '/subevent/' + data.main_id + '/'
            , formData,
        )
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

/**
  * The method makes a server API call to delete the existing subevent from the application server

     * @param data The object of SubEvent Model class to be deleted from the application server
     * @returns the observable of http DELETE request for subevent deletion
 */
    deleteSubEvent(data: SubEvent) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
                            '/event/' + data.event_id + '/subevent/' + data.main_id + '/')
            .pipe(
                // catchError(errorRes => this.handleSectionError(errorRes))
            );
    }

}
