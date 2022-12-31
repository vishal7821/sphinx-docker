import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../Shared/constants';
import { catchError, tap } from 'rxjs/operators';
import { Course } from '../../auth/auth.model';
import { MyEventClass, MySubEvent, EventFlags, SubEventTime} from '../myevents/myevents.model';
import { Upload } from './grade-sub-management.model';


@Injectable({ providedIn: 'root' })
export class GradeSubMngmtService {


    constructor(private http: HttpClient) {
    }


    fetchEvents() {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/events/')
            .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
                tap(responseData => {
                    console.log(responseData);
                    let events: any[];
                    events = responseData.events;

                    const extractedEvents: MyEventClass[] = [];
                    for (let i = 0; i < events.length; i++) {
                        const event = new MyEventClass(
                            i + 1,
                            events[i].id,
                            events[i].name,
                            events[i].assignment_id,
                            '',
                            events[i].grade_aggregation_method,
                            events[i].is_external,
                            events[i].is_interactive
                        );
                        const subevents: any[] = events[i].subevents;
                        const eventFlags: EventFlags = new EventFlags();
                        const extractedSubevents: MySubEvent[] = [];
                        for (let j = 0; j < subevents.length; j++) {
                            const tmpstartdt = new Date(subevents[j].start_time);
                            const tmpenddt = new Date(subevents[j].display_end_time);
                            const subevent = new MySubEvent(
                                j + 1,
                                subevents[j].id,
                                events[i].id,
                                subevents[j].name,
                                [new Date(subevents[j].start_time).toLocaleString(),
                                new Date(subevents[j].display_end_time).toLocaleString()],
                                subevents[j].type,
                                subevents[j].is_blocking,
                                subevents[j].allow_late_ending,
                                new Date(subevents[j].display_end_time),
                                null,
                                new Date(subevents[j].display_late_end_time),
                                20,
                                null, null, 0, null, false, 0, null, false, 0, null, null, null, null, [], null, null, [], 0, null, null,
                            );
                            const currtime = new Date();
                            const starttime = new Date(subevents[j].start_time);
                            const endtime = new Date(subevents[j].display_end_time);
                            let temptime: number = ((currtime.getTime() -starttime.getTime()) /
                                (endtime.getTime() - starttime.getTime())) * 100;
                            if (temptime > 100) {
                                temptime = 100;
                            } else if (temptime < 0) {
                                temptime = 0;
                            } else {
                                temptime = Math.round(temptime * 100) / 100;
                            }
                            subevent.time = temptime;
                            extractedSubevents.push(subevent);
                            switch (subevents[j].type) {
                                case 'SUPLOAD':
                                event.supload_time = new SubEventTime(subevent.time_range[0], subevent.time_range[1], subevent.time);
                                eventFlags.SUPLOAD = true;
                                break;
                                case 'GUPLOAD':
                                    eventFlags.GUPLOAD = true;
                                    break;
                                case 'RGUPLOAD':
                                    eventFlags.RGUPLOAD = true;
                                    break;
                                case 'RGREQ':
                                    eventFlags.RGREQ = true;
                                    break;
                                case 'QVIEW':
                                    eventFlags.QVIEW = true;
                                    break;
                                case 'GVIEW':
                                    eventFlags.GVIEW = true;
                                    break;
                                case 'RGVIEW':
                                    eventFlags.RGVIEW = true;
                                    break;
                                case 'MVIEW':
                                    eventFlags.MVIEW = true;
                                    break;
                                case 'RMVIEW':
                                    eventFlags.RMVIEW = true;
                                    break;
                                case 'AVIEW':
                                    eventFlags.AVIEW = true;
                                    break;
                                case 'SVIEW':
                                    eventFlags.SVIEW = true;
                                    break;
                                default:
                                    break;
                            }
                        }
                        event.subEventFlags = eventFlags;
                        event.subevents = extractedSubevents;
                        extractedEvents.push(event);
                        // this.assignmentData.push(assign);
                        // console.log('assignaa fetch id=',this.assignmentData[i].main_id);
                    }
                    // this.assignmentData=extractedAssigns;
                    // console.log('extracted data=',extractedAssigns);
                    // this.sendAssignData(extractedAssigns);

                    localStorage.setItem('all_events', JSON.stringify(extractedEvents));

                },
                ));
    }

   
    fetchUploads() {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        let submissionEventID = JSON.parse(localStorage.getItem('AdminSubmissionEventID'));
        let submissionSubeventID = JSON.parse(localStorage.getItem('AdminSubmissionSubEventID'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + 
        '/event/' + submissionEventID + '/subevent/'+submissionSubeventID+'/bulkUpload/')
            .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
              );
    }

    recognizeStudents(){
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        let submissionEventID = JSON.parse(localStorage.getItem('AdminSubmissionEventID'));
        let submissionSubeventID = JSON.parse(localStorage.getItem('AdminSubmissionSubEventID'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + 
        '/event/' + submissionEventID + '/subevent/'+submissionSubeventID+'/recognizeUsers/')
            .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
              );
    }

    public graderAssignment(myEventIdx: number, subEventIdx: number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/subevent/' + subEventIdx + '/doGraderAssignment/'
            , {},
        );
    }

    public delBulkUploadSubmission(myEventIdx: number, subEventIdx: number, uploadIdx: number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/subevent/' + subEventIdx + 
            '/upload/' + uploadIdx + 
            '/bulkUploadDetail/'
            , {},
        );
    }
    public getBulkUploadSubmission(myEventIdx: number, subEventIdx: number, uploadIdx: number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/subevent/' + subEventIdx + 
            '/upload/' + uploadIdx + 
            '/bulkUploadDetail/'
            , {},
        );
    }

    /**
     * the method makes an server API request to upload the bulk submission file 
     * submitted by the user in the given event. 
     * 
     * @param event the request corresponding event object of MyEventClass model
     * @param file the user submitted file
     * @returns the observable of http PUT request
     */
    public uploadBulkSubmission(eventId: number, subeventId:number,file: File) {
        const formData = new FormData();
        formData.append('file', file, file.name);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + 
        '/event/' + eventId + '/subevent/'+subeventId+'/bulkUpload/'
            , formData,
        );
    }

    /**
     * the method makes an server API request to upload the bulk submission file 
     * submitted by the user in the given event. 
     * 
     * @param event the request corresponding event object of MyEventClass model
     * @param file the user submitted file
     * @returns the observable of http PUT request
     */
    public mapSubmission(eventId: number, subeventId:number,uploads: number[], roll_nos:string[]) {
        
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const formData = new FormData();
        formData.append('uploads', JSON.stringify(uploads) );
        formData.append('roll_numbers', JSON.stringify(roll_nos) );
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + 
        '/event/' + eventId + '/subevent/'+subeventId+'/recognizeUsers/'
            , formData,
        );
    }
    
    handleLoginError(errorRes: any): any {
        throw new Error('Error in myevent service...fetch events');
    }


}
