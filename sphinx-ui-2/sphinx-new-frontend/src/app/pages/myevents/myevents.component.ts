import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
import { MyEventsService } from './myevents.service';
import { MyEventClass, QuestionSet, GroupMember, MySubmissionGroup, MyQuestion } from './myevents.model';
import { AssignmentManagerService } from '../assignmentmanager/assignmentmanager.service';
import { NbToastrService } from '@nebular/theme';
import { saveAs } from 'file-saver';
import { PageRouterService } from '../page-router.service';
import { Assignment } from '../assignmentmanager/assignmentmanager.model';
import { Subscription } from 'rxjs';
/**
 * Go to README for the description
 */
@Component({
  selector: 'myevents',
  templateUrl: './myevents.component.html',
  styleUrls: ['./myevents.component.scss']
})
export class MyeventsComponent implements OnInit {

/**
 * The list of MyEventClass model objects, each object holds the user corresponding event
 */
  my_events: MyEventClass[];


  public assignments: Assignment[] = [];

  assignLoading: boolean = false;
  qsetLoading: boolean = false;
  /**
   * Subscription object used to set Course assignment data once data retrived from server
   */
  public assignSubscription: Subscription;

  /**
   * The constructor injects the required services like myEvents Service,
   *  Nebular toastr service, and the PageRouter service
   * @param myEventsService The object of the myEvents Service
   * @param assignManagerService The object of the assignment manager service
   * @param toastr The object of the nebular toastr service
   * @param pageRouter The object of the PageRouter service
   */
  constructor(
    // private router: Router,
    public myEventsService: MyEventsService,
    public assignManagerService: AssignmentManagerService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
  ) {

  }
/**
 * The component lifecycle hook, get called on every component initialization. 
 * It used to make required API calls to fetch all user-corresponding event and subevent data,
 *  initialize the properties which binds to view forms present for the event and subevent.
 */
  ngOnInit() {
    this.getMyEvents();
    // this.fetchAssignments();
  }


  /*fetchAssignments(assignmentId) {
    this.myEventsService.fetchAssignmentMode(assignmentId).subscribe(
      resData => {
        
          if ( resData.assignments.is_interactive == true ) {
            this.pageRouter.gotoInteractiveSubmissionManager();
          } 
          else {
            this.pageRouter.gotoSubmissionManager();
          }
        });
        
      }*/
  

  // toggleSGroupForm(idx: number) {
  //   if (this.my_events[idx].sgrp_form.isOpenSGroupForm == false) {
  //     //fetch qsets
  //     this.myEventsService.getAssignQuestionSets(this.my_events[idx].assignment_id).subscribe(
  //       resData => {
  //         let questionsets: any = resData;
  //         questionsets = questionsets.questionsets;
  //         const extractedQsets: QuestionSet[] = [];
  //         for (let i = 0; i < questionsets.length; i++) {
  //           const qset = new QuestionSet(
  //             i + 1,
  //             questionsets[i].id,
  //             questionsets[i].name,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //             null,
  //           );

  //           extractedQsets.push(qset);
  //         }
  //         this.my_events[idx].sgrp_form.questionSets = extractedQsets;
  //       },
  //       error => {

  //       },
  //     );
  //   }
  //   this.my_events[idx].sgrp_form.isOpenSGroupForm = !this.my_events[idx].sgrp_form.isOpenSGroupForm;
  // }



   /**
   * The method fetch the user corresponding Event and Subevent data using the service API fetchMyEvents.
   *  On receiving successful response from the server,
   *  method loads the processed response data from local storage and set the component property my_events.
   * For each event in the event list, the method fetch the event associated question set information
   * like the question set details, the question set files, the solution file,
   *  and the list of questions belongs to the question set
   */
  getMyEvents() {
    this.myEventsService.fetchMyEvents().subscribe(
      resData => {
        console.log('events fetch successfully');
        const tempData: MyEventClass[] = JSON.parse(localStorage.getItem('my_events'));
        this.my_events = tempData;

        for (let i = 0; i < this.my_events.length; i++) {
          this.myEventsService.fetchQuestionSets(this.my_events[i]).subscribe(
            resData1 => {

              //task to set qsets data
              const responseData: any = resData1;
              // console.log('aaaaa');
              const questionSets: QuestionSet[] = [];
              for (let j = 0; j < responseData.data.length; j++) {

                const qset: QuestionSet = new QuestionSet(
                  j + 1,
                  responseData.data[j].id,
                  responseData.data[j].name,
                  responseData.data[j].total_marks,
                  responseData.data[j].question_file,
                  responseData.data[j].supplementary_file,
                  null,
                  responseData.data[j].original_question_file_name,
                  responseData.data[j].original_supplementary_file_name,
                  null,
                  [],
                );
                const extractedMyQuestions: MyQuestion[] = [];
                const questions: any[] = responseData.data[j].questions;
                for (let p = 0; p < questions.length; p++) {
                  const question = new MyQuestion(p + 1,
                    questions[p].id,
                    questions[p].title,
                    questions[p].text,
                    questions[p].marks,
                    0,
                    [],
                    questions[p].type,
                    questions[p].options
                    );
                  extractedMyQuestions.push(question);
                }

                qset.questions = extractedMyQuestions;
                questionSets.push(qset);
              }
              this.my_events[i].questionSets = questionSets;
              console.log('qqqqqqqqq=',questionSets);
              //fetching solution sets
              this.myEventsService.fetchSolutionSets(this.my_events[i]).subscribe(
                resData2 => {
                  for (let j = 0; j < resData2.data.length; j++) {
                    let isQsetPresent: boolean = false;
                    for (let k = 0; k < this.my_events[i].questionSets.length; k++) {
                      if (this.my_events[i].questionSets[k].main_id == resData2.data[j].id) {
                        isQsetPresent = true;
                        this.my_events[i].questionSets[k].solution_file = resData2.data[j].solution_file;
                        this.my_events[i].questionSets[k].solution_name = resData2.data[j].original_solution_file_name;
                      }
                    }
                    if (!isQsetPresent) {
                      const qset: QuestionSet = new QuestionSet(
                        this.my_events[i].questionSets.length + 1,
                        resData2.data[j].id,
                        resData2.data[j].name,
                        resData2.data[j].total_marks,
                        null,
                        null,
                        resData2.data[j].solution_file,
                        null,
                        null,
                        resData2.data[j].original_solution_file_name,
                        [],
                      );
                      this.my_events[i].questionSets.push(qset);
                    }
                  }
                },
                error2 => {
                  console.log('fetch mysolutionsets failed for i=' + i + ' and error is =' + error2);
                },
              );

            },
            error1 => {
              console.log('fetch myquestionsets failed for i=' + i + ' and error is =' + error1);
            },
          );
        }
      },
      error => {
        console.log(error);
      },
    );
    localStorage.setItem('my_events', JSON.stringify(this.my_events));
  }

  /**
   * The method download the user requested main question file of the
   *  question set in the local system
   * 
   * @param eventIdx The event ID corresponding to the user-selected file
   * @param qsetIdx The question set ID corresponding to the user-selected file
   */
  getQuestionFile(eventIdx: number, qsetIdx: number) {
    // console.log('eventIdx=', eventIdx);
    // console.log('qsetIdx=', qsetIdx);

    this.downloadFile(this.my_events[eventIdx].questionSets[qsetIdx].question_file,
      this.my_events[eventIdx].questionSets[qsetIdx].question_name);

  }

  /**
   * The method download the user requested supplementary file of the
   *  question set in the local system
   * 
   * @param eventIdx The event ID corresponding to the user-selected file
   * @param qsetIdx The question set ID corresponding to the user-selected file
   */
  getSupplementaryFile(eventIdx: number, qsetIdx: number) {
    // console.log('eventIdx=', eventIdx);
    // console.log('qid=', qsetIdx);


    this.downloadFile(this.my_events[eventIdx].questionSets[qsetIdx].supplementary_file,
      this.my_events[eventIdx].questionSets[qsetIdx].supplementary_name);

  }

  /**
   * The method download the received file in the local system using
   *  the saveAs API of the FileSaver javascript library
   * @param data The file data
   * @param fileType The file extension
   */
  saveToFileSystem(data: any, fileType: string) {
    const filename = data.original_file_name;
    const blob = new Blob([data.main_file], { type: fileType });
    saveAs(blob, filename);
  }

  /**
   * The method download the user requested solution file of the
   *  question set in the local system
   * 
   * @param eventIdx The event ID corresponding to the user-selected file
   * @param qsetIdx The question set ID corresponding to the user-selected file
   */
  getSolutionFile(eventIdx: number, qsetIdx: number) {
    // console.log('eventIdx=', eventIdx);
    // console.log('qid=', qsetIdx);

    this.downloadFile(this.my_events[eventIdx].questionSets[qsetIdx].solution_file,
      this.my_events[eventIdx].questionSets[qsetIdx].solution_name);
  }


  /**
   * The method download the received file data with received file name in the local system
   * of the user
   * 
   * @param file The file data
   * @param filename The filename associated with the file to be download
   * 
   * Current Use: The component API's like getSolutionFile, getSupplementaryFile, 
   * and getQuestionFile used downloadFile API internally to download the user-requested file
   * in the local system
   */
  downloadFile(file: any, filename: any) {
    const linkSource = 'data:application/pdf;base64,' + file;
    const link = document.createElement('a');
    link.href = linkSource;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
    this.toastr.success('File downloaded successfully', 'Success');
  }

  /**
   * The method stores the event object corresponding to received ID in the local storage
   * and redirects the user to the Submission manager
   * @param idx The list index of event associated with the user's action on the view
   * 
   * Current use: Once the user clicks the submit button on myEvents dashboard,
   * the view triggers call to this method with respective event id
   */
  gotoSubmissionManager(idx: number) {
    // console.log(this.my_events[idx] + ',' + idx);
    localStorage.setItem('mySubmissionEvent', JSON.stringify(this.my_events[idx]));

    let currentEvent:MyEventClass = null; 
    currentEvent = this.my_events[idx];
    localStorage.setItem('currentEvent', JSON.stringify(currentEvent));

    console.log(this.my_events[idx]);
    
    if ( this.my_events[idx].assignment_isInteractive == true ) {
      this.pageRouter.gotoInteractiveSubmissionManager();
    } 
    else {
      this.pageRouter.gotoSubmissionManager();
    }
    // this.fetchAssignments(this.my_events[idx].assignment_id);
    // this.router.navigate(['/pages', 'myevents', 'submission']);
    // this.pageRouter.gotoSubmissionManager();
  }
 
  /**
   * The method stores the event object and database id's of the event & subevent 
   * corresponding to the user selected grading subevent in the local storage
   * and redirects the user to the Grading manager
   * @param eventIndex The list index of event associated with the user's action on the view
   * @param subeventIndex The list index of subevent associated with the user's action on the view
   * 
   * Current use: Once the user clicks the View grading duties button on myEvents dashboard,
   * the view triggers call to this method with respective event id and subevent id
   */
  gotoGradingManager(eventIndex: number, subeventIndex: number) {
    // console.log(eventIndex , ' , ', this.my_events[eventIndex]);
    // console.log(subeventIndex , ' , ', this.my_events[eventIndex].subevents[subeventIndex]);
    const eventId: number = this.my_events[eventIndex].main_id;
    const subEventId: number = this.my_events[eventIndex].subevents[subeventIndex].main_id;
    this.my_events[eventIndex].isActiveFlags.GUPLOAD =
      this.myEventsService.isSubeventActiveAtMoment(this.my_events[eventIndex].subevents[subeventIndex]);
    localStorage.setItem('myGradingEventID', eventId.toString());
    localStorage.setItem('myGradingSubEventID', subEventId.toString());
    localStorage.setItem('myGradingEvent', JSON.stringify(this.my_events[eventIndex]));
    // this.router.navigate(['/pages', 'myevents', 'gradingManager']);
    this.pageRouter.gotoGradingManager();
  }

  /**
   * The method stores the event object and database id's of the event & subevent 
   * corresponding to the user selected re-grading subevent in the local storage
   * and redirects the user to the Re-Grading manager
   * @param eventIndex The list index of event associated with the user's action on the view
   * @param subeventIndex The list index of subevent associated with the user's action on the view
   * 
   * Current use: Once the user clicks the View regrading duties button on myEvents dashboard,
   * the view triggers call to this method with respective event id and subevent id
   */
  gotoReGradingManager(eventIndex: number, subeventIndex: number) {
    // console.log(eventIndex , ' , ', this.my_events[eventIndex]);
    // console.log(subeventIndex , ' , ', this.my_events[eventIndex].subevents[subeventIndex]);
    const eventId: number = this.my_events[eventIndex].main_id;
    const subEventId: number = this.my_events[eventIndex].subevents[subeventIndex].main_id;
    this.my_events[eventIndex].isActiveFlags.RGUPLOAD =
      this.myEventsService.isSubeventActiveAtMoment(this.my_events[eventIndex].subevents[subeventIndex]);
    localStorage.setItem('myReGradingEventID', eventId.toString());
    localStorage.setItem('myReGradingSubEventID', subEventId.toString());
    localStorage.setItem('myReGradingEvent', JSON.stringify(this.my_events[eventIndex]));
    // this.router.navigate(['/pages', 'myevents', 'regradingManager']);
    this.pageRouter.gotoReGradingManager();
  }

/**
 * The method calls the server API to fetch the grading duties allocated to the user using the
 * service API fetchMyGradingDuties
  * @param eventIndex The list index of event associated with the user's action on the view
   * @param subeventIndex The list index of subevent associated with the user's action on the view
 */
  fetchMyGradingDuties(eventIndex: number, subeventIndex: number) {
    const eventId: number = this.my_events[eventIndex].main_id;
    const subEventId: number = this.my_events[eventIndex].subevents[subeventIndex].main_id;
    this.myEventsService.getMyGradingDuties(eventId, subEventId).subscribe(
      resData => {
        console.log('grading duties are =', resData);
      },
      error => {
        console.log('error in fetching grading duties are =', error);
      },
    );

  }

/**
 * The method checks whether user corresponding MVIEW subevent is going on at the moment, if not 
 * then method shows error notificaction and returns. 
 * It stores the event object corresponding to received ID in the local storage
 * and redirects the user to the Grade sheet view manager
 * @param eventIndex The list index of event associated with the user's action on the view
 *  
 * Current use: Once the user clicks the view grades button on myEvents dashboard,
 * the view triggers call to this method with respective event id
 */
  goToGradeViewManager(eventIndex: number) {
    console.log('open view grades');
    if(!this.my_events[eventIndex].isActiveFlags.MVIEW){
      const error_msg = 'There is no event going on at the moment that permits this action - please contact the instructor if you feel this is an error';
      this.toastr.primary(error_msg, 'NoEvent Error');
      return;
    }
    const eventId: number = this.my_events[eventIndex].main_id;
    localStorage.setItem('myEventID', eventId.toString());
    localStorage.setItem('myGradeViewEvent', JSON.stringify(this.my_events[eventIndex]));
    // this.router.navigate(['/pages', 'myevents', 'gradeView']);
    this.pageRouter.gotoGradeViewManager();
  }


}
