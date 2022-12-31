import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../Shared/constants';
import { catchError, tap } from 'rxjs/operators';
import { Course } from '../../auth/auth.model';
import { MyEventClass, MySubEvent, EventFlags, MyGradingDuty, MyReGradingDuty, SubEventTime } from './myevents.model';
import { saveAs } from 'file-saver';
import { Subject } from 'rxjs';

/**
 *go to the README for the description
 */
@Injectable({ providedIn: 'root' })
export class MyEventsService {

    /**
     * The constructor used to initialize http object of HttpClient class provided by Angular.
     * @param http the object of HttpClient class , used to make server API calls
     */
    constructor(private http: HttpClient) {
    }

    public optionData = new Subject();
    public optionDataMCQRB = new Subject();
    
    communicateOptionData(optionObject) {
        this.optionData.next(optionObject);
    }

    communicateOptionDataMCQRB(optionObjectMCQRB) {
        this.optionDataMCQRB.next(optionObjectMCQRB);
    }

    /**
     * the method checks whether the received event is active at the moment by using start and end time,
     *  then returns the boolean value accordingly
     * @param subevent the subevent object
     */
    isSubeventActiveAtMoment(subevent: MySubEvent) {
        const currTime = new Date();
        if(subevent.allow_late_ending){
          if(currTime < subevent.late_end_time){
            // console.log('1111111111111');
            return true;
          }
        }else if(currTime <  new Date(Date.parse(subevent.time_range[1]))){
          // console.log('22222222222');
          return true;
        }
        // console.log('3333333333');
        return false;
      }
      

      fetchAssignmentMode( assignmentId ) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/assignment/' + assignmentId )
        .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
         tap(responseData => {

        }));
      }  

      /**
       * the method calls the server API to get all the events and corresponding subevents associated with the logged-in user.
       * On receiving successful response from the server, method iterate through JSON list and extract the event properties.
       * It stores the extracted data as list of MyEventClass model objects, where each object stores the
       * event properties and corresponding subevents as list of MySubevent model objects.
       * For each event, method also sets the event flags(for each subevent,showing whether subevent is present or not),
       * progress bar values for the subevent timeline, active subevent flags, etc.
       * the method stores the extracted list of MyEventClass model objects in the local storage,
       * such that extracted data is available to the all components
       * @returns the observable of http GET request
       */
    fetchMyEvents() {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/myevents/')
            .pipe(catchError(errorRes => this.handleLoginError(errorRes)),
                tap(responseData => {
                    // console.log(responseData);
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
                            events[i]['assignment.is_interactive'],
                        );
                        const subevents: any[] = events[i].subevents;
                        const eventFlags: EventFlags = new EventFlags();
                        const isActiveFlags: EventFlags = new EventFlags();
                        const extractedSubevents: MySubEvent[] = [];
                        for (let j = 0; j < subevents.length; j++) {
                            const tmpstartdt = new Date(subevents[j].start_time);
                            const tmpenddt = new Date(subevents[j].display_end_time);
                            const subevent = new MySubEvent(
                                j + 1,
                                subevents[j].id,
                                events[i].id,
                                subevents[j].name,
                                [new Date(subevents[j].start_time).toString(),
                                new Date(subevents[j].display_end_time).toString()],
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
                            let temptime: number = ((currtime.getTime() - starttime.getTime()) /
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
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.SUPLOAD = true;
                                    }
                                    break;
                                case 'GUPLOAD':
                                    eventFlags.GUPLOAD = true;
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.GUPLOAD = true;
                                    }
                                    break;
                                case 'RGUPLOAD':
                                    eventFlags.RGUPLOAD = true;
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.RGUPLOAD = true;
                                    }
                                    break;
                                case 'RGREQ':
                                    eventFlags.RGREQ = true;
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.RGREQ = true;
                                    }
                                    break;
                                case 'QVIEW':
                                    eventFlags.QVIEW = true;
                                    break;
                                case 'GVIEW':
                                    eventFlags.GVIEW = true;
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.GVIEW = true;
                                    }
                                    break;
                                case 'RGVIEW':
                                    eventFlags.RGVIEW = true;
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.RGVIEW = true;
                                    }
                                    break;
                                case 'MVIEW':
                                    event.mview_time = new SubEventTime(subevent.time_range[0], subevent.time_range[1], subevent.time);
                                    eventFlags.MVIEW = true;
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.MVIEW = true;
                                    }
                                    break;
                                case 'RMVIEW':
                                    eventFlags.RMVIEW = true;
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.RMVIEW = true;
                                    }
                                    break;
                                case 'AVIEW':
                                    eventFlags.AVIEW = true;
                                    break;
                                case 'SVIEW':
                                    eventFlags.SVIEW = true;
                                    event.sview_time = new SubEventTime(subevent.time_range[0], subevent.time_range[1], subevent.time);
                                    if(this.isSubeventActiveAtMoment(subevent)){
                                        isActiveFlags.SVIEW = true;
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                        event.isActiveFlags = isActiveFlags;
                        event.subEventFlags = eventFlags;
                        event.subevents = extractedSubevents;
                        extractedEvents.push(event);
                        console.log('event =',event);

                        // this.assignmentData.push(assign);
                        // console.log('assignaa fetch id=',this.assignmentData[i].main_id);
                    }
                    // this.assignmentData=extractedAssigns;
                    // console.log('extracted data=',extractedAssigns);
                    // this.sendAssignData(extractedAssigns);
                    
                    localStorage.setItem('my_events', JSON.stringify(extractedEvents));

                },
                ));
    }

        /**
     * the method handles the server error response and takes appropriate actions according to error
     * @param errorRes the http error response object
     */
    handleLoginError(errorRes: any): any {
        throw new Error('Error in myevent service...fetch events');
    }


    /**
     * the method makes the server API request to fetch the user-allowed questions sets
     *  and corresponding files in the requested event.There must QVIEW subevent present
     *  corresond to the logged-in user in the event, else server returns an empty response
     * @param myEvent the event object of which question sets data to be fetched
     * @returns the observable of http GET request
     */
    public fetchQuestionSets(myEvent: MyEventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/myQuestions/');

    }

/**
     * the method makes the server API request to fetch the gold solution of questions sets
     *  and corresponding files in the requested event.There must AVIEW subevent present
     *  corresond to the logged-in user in the event, else server returns an empty response
     * @param myEvent the event object of MyEventClass model
     * @returns the observable of http GET request
 */
    public fetchSolutionSets(myEvent: MyEventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/mySolutions/');

    }

    /**
     * the method makes an server API request to fetch the user-submission details in the received event
     * 
     * @param myEvent the request corresponding event object of MyEventClass model
     * @returns the observable of http GET request
     */
    public fetchMySubmissions(myEvent: MyEventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/mySubmissions/');

    }

    public fetchImpersonatedSubmissions(myEvent: MyEventClass, userid: Number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/mySubmissions/' + userid);


    }

      /**
     * the method makes an server API request to fetch the list of 
     * question sets in the received assignment
     * 
      * @param idx the request corresponding event id
     * @returns the observable of http GET request
     */
    getAssignQuestionSets(idx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/assignment/' + idx + '/question_sets/');
    }


     /**
     * the method makes an server API request to create the submission group
     * for the logged-in user in the given event
     * 
       * @param myEvent the request corresponding event object of MyEventClass model
     * @returns the observable of http POST request
     */
    public createSubmissionGroup(myEvent: MyEventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/mySubmissions/'
            , {
                choosen_question_set: myEvent.sgrp_form.selectedQSet,
            },
        );
    }

     /**
     * the method makes an server API request to join the user-provided submission group
     * for the logged-in user in the given event. It uses the user-selected submission group id
     * from the received event model object to make the server request
     * 
       * @param myEvent the request corresponding event object of MyEventClass model
     * @returns the observable of http POST request
     */
    public joinSubmissionGroup(myEvent: MyEventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/mySubmissions/' + myEvent.sgrp_form.sGroupID + '/join/'
            , {},
        );
    }

        /**
     * the method makes an server API request to update the submission group details like 
     * associated question set, the access code in the given event.
     * It uses the sgrp_form property of the received event to retrieve the 
     * required parameters for API request
     * 
      * @param myEvent the request corresponding event object of MyEventClass model
     * @returns the observable of http PUT request
     */
    public updateMyPreSubmission(myEvent: MyEventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/mySubmissions/'
            , {
                access_code_submitted: myEvent.sgrp_form.accessCodeSubmitted,
                choosen_question_set: myEvent.sgrp_form.selectedQSet,
            },
        );
    }

         /**
     * the method makes an server API request to verify the access code for the submission in the given event.
     * It uses the sgrp_form property of the received event to retrieve the 
     * required parameters for API request
     * 
     * @param myEvent the request corresponding event object of MyEventClass model
     * @returns the observable of http PUT request
     */
    public verifyMyNAC(myEvent: MyEventClass) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/mySubmission/verifyNAC/'
            , {
                access_code_submitted: myEvent.sgrp_form.accessCodeSubmitted,
            },
        );
    }

        /**
     * the method makes an server API request to fetch all the question sets
     *  in the requested assignment
     * 
       * @param myEvent the request corresponding event object of MyEventClass model
     * @returns the observable of http GET request
     */
    fetchMyQuestions(myEvent: MyEventClass) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const AssignmentId: number = myEvent.assignment_id;
        const selectedQset: string = myEvent.submissionGroup.choosenQset;

        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/assignment/' + AssignmentId + '/question_set/' + selectedQset + '/questions/');
    }

        /**
     * the method makes an server API request to fetch the main submission file 
     * uploaded by the user in the given event
     * 
     * @param idx the request corresponding event id
     * @returns the observable of http GET request
     */
    getMyMainSubmission(idx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + idx + '/mySubmissions/main/');
    }

    getImpersonatedMainSubmission(idx: number,userid: Number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + idx + '/mySubmissions/main/' + + userid);
    }

          /**
     * the method makes an server API request to fetch the supplementary submission file 
     * uploaded by the user in the given event
     * 
     * @param idx the request corresponding event id
     * @returns the observable of http GET request
     */
    getMySupplSubmission(idx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + idx + '/mySubmissions/supplementary/');
    }

    /**
     * the method makes an server API request to upload the main submission file 
     * submitted by the user in the given event. the method sends the file and file hash
     *  to the server, So the server verify that no data tampering happen 
     * during the communication
     * 
     * @param myEvent the request corresponding event object of MyEventClass model
     * @param file the user submitted file
     * @param file_hash  hash code of the file
     * @returns the observable of http PUT request
     */
    public uploadMainSubmission(myEvent: MyEventClass, file: File, hash: string) {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('file_hash', hash);
        formData.append('access_code', myEvent.submissionGroup.accessCodeSubmitted);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + myEvent.main_id + '/mySubmissions/main/'
            , formData,
        );
    }

    public uploadImpersonatedMainSubmission(myEvent: MyEventClass, file: File, hash: string, userid: Number) {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('file_hash', hash);
        formData.append('access_code', myEvent.submissionGroup.accessCodeSubmitted);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + myEvent.main_id + '/mySubmissions/main/' + userid + '/'
            , formData,
        );
    }

    /**
     * the method makes an server API request to upload the supplementary submission file 
     * submitted by the user in the given event. the method sends the file and file hash
     *  to the server, So the server verify that no data tampering happen 
     * during the communication
     * 
     * @param myEvent the request corresponding event object of MyEventClass model
     * @param file the user submitted supplementary file
     * @param file_hash  hash code of the file
     * @returns the observable of http PUT request
     */
    public uploadSuppSubmission(myEvent: MyEventClass, file: File, hash: string) {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('file_hash', hash);
        formData.append('access_code', myEvent.submissionGroup.accessCodeSubmitted);

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id + '/event/' + myEvent.main_id + '/mySubmissions/supplementary/'
            , formData,
        );
    }

    /**
     * the method makes an server API request to fetch the question pagination for all questions 
     * submitted by the user
     * during the main submission in the given event.
     * 
     * @param myEvent the request corresponding event object of MyEventClass model
     * @returns the observable of http GET request
     */
    getResponsePagination(myEvent: MyEventClass) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/myResponses/');
    }

    
    getImpersonatedResponsePagination(myEvent: MyEventClass, userid: Number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEvent.main_id + '/impersonatedResponses/' + userid);         
    }

     /**
     * the method makes an server API request to add the question pagination link
     * updated by the user in the given event.
     * 
     * @param eventIdx the request corresponding event ID
     * @param questionIdx the question ID
     * @param pageNo the user-selected page number
     * @returns the observable of http POST request
     */
    public setResponsePagination(eventIdx: number, questionIdx: number, response: any) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + eventIdx + '/myResponses/' + questionIdx + '/'
            , {response : response},
        );
    }


    public setInteractiveResponseOptions(eventIdx: number, questionIdx: number, optionNumber: number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + eventIdx + '/myResponses/' + questionIdx + '/' + optionNumber + '/'
            , {},
        );
    }

    setImpersonatedResponsePagination(eventIdx: number, questionIdx: number, response: any, userid: Number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + eventIdx + '/impersonatedResponses/' + questionIdx + '/' + 
+ userid + '/'
            , {response : response},
        );
            
    }

    public setInteractiveResponseText(eventIdx: number, questionIdx: number, text: string) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + eventIdx + '/myResponses/' + questionIdx + '/' + text + '/'
            , {},
        );
    }


     /**
     * the method makes an server API request to delete the question pagination link
     * submitted by the user in the given event.
     * 
     * @param eventIdx the request corresponding event ID
     * @param questionIdx the question ID
     * @param pageNo the user-selected page number
     * @returns the observable of http DELETE request
     */
    public delResponsePagination(eventIdx: number, questionIdx: number, pageNo: number) {

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + eventIdx + '/myResponses/' + questionIdx + '/' + pageNo + '/'
            , {},
        );
    }

    // public graderAssignment(myEventIdx: number, subEventIdx: number) {

    //     const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
    //     return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
    //         '/event/' + myEventIdx + '/subevent/' + subEventIdx + '/doGraderAssignment/'
    //         , {},
    //     );
    // }

       /**
     * the method makes an server API request to fetch the list of grading duties 
     * allocated to the user in the given subevent & event
     * 
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http GET request
     */
    getMyGradingDuties(myEventIdx: number, subEventIdx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/');
    }

    getAutoGradingDuties(myEventIdx: number, subEventIdx: number, questionIdx:number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/subevent/' + subEventIdx + 
            '/question/' + questionIdx + '/autoGrade/');
    }

    submitAutoGradingDuties(myEventIdx: number, subEventIdx: number, questionIdx:number, 
        gd_ids: any[], subquestion_ids: any[], rec_chars: any[]) {
        
        const formData = new FormData();
        formData.append('gd_ids', JSON.stringify(gd_ids) );
        formData.append('subquestion_ids', JSON.stringify(subquestion_ids) );
        formData.append('rec_chars', JSON.stringify(rec_chars) );
        
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/subevent/' + subEventIdx + 
            '/question/' + questionIdx + '/autoGrade/'
            ,formData
            );
    }
      /**
     * the method makes an server API request to fetch the grading duty details
     * of the requested grading duty ID in the given subevent & event
     * 
     * @param gdIdx the request corresponding Grading duty ID
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http GET request
     */
    // api 47.a
    getGradingDutyDetails(myEventIdx: number, subEventIdx: number, gdIdx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/gradingDuty/' + gdIdx + '/');
    }

      /**
     * the method makes an server API request to update the grading duty details
     * of the requested grading duty ID in the given subevent & event
     * 
     * @param gd the request corresponding Grading duty object
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http PUT request
     */
    // api 47.b
    updateGradingDutyDetails(myEventIdx: number, subEventIdx: number, gd: MyGradingDuty) {
        const formData = new FormData();
        formData.append('grader_comment', gd.grader_comment);
        formData.append('marks_adjustment', gd.marks_adjustment.toString());
        formData.append('is_completed', gd.is_completed.toString());

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/gradingDuty/' + gd.main_id + '/'
            , formData,
        );
    }

     /**
     * the method makes an server API request to update the grading duty details
     * of the requested regrading duty ID in the given subevent & event
     * 
     * @param gd the request corresponding Re-Grading duty object
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http PUT request
     */
    // api 47.b
    updateReGradingDutyDetails(myEventIdx: number, subEventIdx: number, gd: MyReGradingDuty) {
        const formData = new FormData();
        formData.append('grader_comment', gd.grader_comment);
        formData.append('marks_adjustment', gd.marks_adjustment.toString());
        formData.append('is_completed', gd.is_completed.toString());

        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.put<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/gradingDuty/' + gd.gd_id + '/'
            , formData,
        );
    }

      /**
     * the method makes an server API request to get the main submission file related to 
     * the requested grading duty ID in the given subevent & event
     * 
     * @param gdIdx the request corresponding grading duty ID
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http PUT request
     */
    // api 48.a
    getMainSubmissionFile(myEventIdx: number, subEventIdx: number, gdIdx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/gradingDuty/' + gdIdx + '/main/');
    }

       /**
     * the method makes an server API request to get the supplementary
     *  submission file related to 
     * the requested grading duty ID in the given subevent & event
     * 
     * @param gdIdx the request corresponding grading duty ID
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http PUT request
     */
    // api 49.a
    getSuppSubmissionFile(myEventIdx: number, subEventIdx: number, gdIdx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/gradingDuty/' + gdIdx + '/supplementary/');
    }

       /**
     * the method makes an server API request to apply the rubric to
     * the requested grading duty ID in the given subevent & event
     * 
     * @param gdIdx the request corresponding grading duty ID
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http PUT request
     */
    // api 50.a
    setRubricGradingDutyLink(myEventIdx: number, subEventIdx: number, gdIdx: number, rubricIdx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/gradingDuty/' + gdIdx + '/' + rubricIdx + '/'
            , {},
        );
    }

       /**
     * the method makes an server API request to remove the applied rubric to
     * the requested grading duty ID in the given subevent & event
     * 
     * @param rubricIdx the request corresponding rubric ID
     * @param gdIdx the request corresponding grading duty ID
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http PUT request
     */
    // api 50.b
    delRubricGradingDutyLink(myEventIdx: number, subEventIdx: number, gdIdx: number, rubricIdx: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.delete<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/myGrading/' + subEventIdx + '/gradingDuty/' + gdIdx + '/' + rubricIdx + '/'
            , {},
        );
    }

       /**
     * the method makes an server API request to fetch the grade sheet of
     *  the submission associated to the given event
     * 
     * @param eventId the request corresponding event ID
     * @returns the observable of http GET request
     */
    getMyGrades(eventId: number) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        return this.http.get<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + eventId + '/mySubmissionMarks/');
    }


       /**
     * the method makes an server API request to raise a regrade request for the
     * user selected question in the grade sheet, the grade sheet and question must exist in the 
     * provided subevent and the event, else server returns the error
     * 
     * @param responseIdx the request corresponding response ID
     * @param stud_comment the request corresponding student comment
     * @param myEventIdx the request corresponding event ID
     * @param subEventIdx the request corresponding subevent ID
     * @returns the observable of http POST request
     */
    submitRegradeRequest(myEventIdx: number, subEventIdx: number, responseIdx: number, stud_comment: string) {
        const selectedCourse: Course = JSON.parse(localStorage.getItem('selectedCourse'));
        const formData = new FormData();
        formData.append('student_comment', stud_comment);
        return this.http.post<any>(AppSettings.API_ENDPOINT + '/course/' + selectedCourse.id +
            '/event/' + myEventIdx + '/subevent/' + subEventIdx + '/response/' + responseIdx + '/regrading/'
            , formData,
        );
    }

    /**
     * the method download the received file in the local system with provided file name
     * @param file the file object
     * @param filename the file name of file to be downloaded
     */
    downloadFile(file: any, filename: any) {
        const linkSource = 'data:application/pdf;base64,' + file;
        const link = document.createElement('a');
        link.href = linkSource;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
    }

}
