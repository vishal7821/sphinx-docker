import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { PageRouterService } from '../../../page-router.service';
import { MyEventClass, MyGradingDuties, MyGradingDuty, MyRubric } from '../../myevents.model';
import { MyEventsService } from '../../myevents.service';

/**
 * The main grading interactive manager component provides the below capabilities to the user,
 * - Grade the allocated submission copy by using the rubric-based grading system
 * - View the response given by the student and instructor's gold solution
 * - The grader can navigate to the next/prev ungraded submission and the next/prev submission in the allocated grading duties of the same question using 
 *  the navigation control buttons
 *  - View the progress bar of the total number of graded submission copies
 */
@Component({
  selector: 'maingrade-interactive-manager',
  templateUrl: './maingrade-interactive-manager.component.html',
  styleUrls: ['./maingrade-interactive-manager.component.scss']
})
export class MaingradeInteractiveManagerComponent implements OnInit {

  isGUPLOAD: boolean = false;
  currGDs: MyGradingDuties = JSON.parse(localStorage.getItem('currGDs'));
  currGD: MyGradingDuty = JSON.parse(localStorage.getItem('currGD'));
  currGDIdx: number = JSON.parse(localStorage.getItem('currGDIdx'));
  eventId: number = +(localStorage.getItem('myGradingEventID'));
  subEventId: number = +(localStorage.getItem('myGradingSubEventID'));
  progress_val: number = 0;
  loading: boolean = false;
  mcqcbdataarray: any[];
  mcqrbdataarray: any[];
  

  constructor(
    public myEventsService: MyEventsService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
  ) { }
  
  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method fetches the current grading duty associated information from the local storage,
   * then set the component properties currGDs, currGDIdx, currGD, eventId, subEventId, and isGUPLOAD flag.
   * The method fetches the current grading duty details like the applied rubrics, the submission made by 
   * student from the server using the component API fetchGradingDutyDetails.
   * Method sets the grading progress bar value w.r.t. the grading queue using the component API 
   * setProgressBarValue
   *
   */
  ngOnInit() {
    this.currGDs = JSON.parse(localStorage.getItem('currGDs'));
    this.currGD = JSON.parse(localStorage.getItem('currGD'));
    this.currGDIdx = JSON.parse(localStorage.getItem('currGDIdx'));
    this.eventId = +(localStorage.getItem('myGradingEventID'));
    this.subEventId = +(localStorage.getItem('myGradingSubEventID'));
    const myGradingEvent: MyEventClass = JSON.parse(localStorage.getItem('myGradingEvent'));
    this.isGUPLOAD = myGradingEvent.isActiveFlags.GUPLOAD;
    this.mcqcbdataarray = [];
    this.setProgressBarValue();
    this.fetchGradingDutyDetails();
  }

  /**
   * 
   * The method calculate the percentage of grading duty completion w.r.t. the total number of 
   * grading duties in the queue and set the percentage value as the progress bar value
   */
  setProgressBarValue(){
    let progress_val = (this.currGDs.completed_cnt / this.currGDs.tot_cnt) *100;
    this.progress_val = Math.round((progress_val + Number.EPSILON) * 100) / 100;
  }

  /**
   * The method takes the value of the point adjustment input box from the adjustment section,
   * then add the value to the total graded marks and 
   * update the aggregated marks of the current grading duty 
   */  
  marksAdjustChange() {
    if (this.currGD.marks_adjustment.toString() == '-') {
      this.toastr.danger('Please enter valid Point Adjustment', 'Error');
      return;
    } else {
      let marks = 0;
      for (let i = 0; i < this.currGD.rubrics.length; i++) {
        if (this.currGD.rubrics[i].is_selected) {
          marks += this.currGD.rubrics[i].marks;
        }
      }
      marks += this.currGD.marks_adjustment;
      this.currGD.aggregate_marks = marks;
    }

  }

  /**
   * The method check the state for the requested rubric and make the 
   * respective server API request to apply/delete the rubric-grading duty link 
   * accordingly on the application server.
   * On receiving success response from the server, the method updates the aggregated
   * graded marks accordingly.
   * @param rubricIdx The request corresponding rubric ID
   */
  rubricSelected(rubricIdx: number) {
    console.log(rubricIdx);
    if(!this.isGUPLOAD){
    this.toastr.danger('There is no grading event going on, please contact the instructor if you feel this is an error', 'NoEvent Error');
      return;
    }
    const rubricMainId: number = this.currGD.rubrics[rubricIdx].main_id;
    if (!this.currGD.rubrics[rubricIdx].is_selected) {
      this.myEventsService.setRubricGradingDutyLink(this.eventId, this.subEventId, this.currGD.main_id, rubricMainId).subscribe(
        resData => {
          console.log('link set success');
          this.currGD.aggregate_marks += this.currGD.rubrics[rubricIdx].marks;
        },
        error => {
          console.log(error);
          this.currGD.rubrics[rubricIdx].is_selected = !this.currGD.rubrics[rubricIdx].is_selected;
          this.toastr.danger(error, 'API Error');
        },
      );
    } else {
      this.myEventsService.delRubricGradingDutyLink(this.eventId, this.subEventId, this.currGD.main_id, rubricMainId).subscribe(
        resData => {
          this.currGD.aggregate_marks -= this.currGD.rubrics[rubricIdx].marks;
          console.log('link delete success');
        },
        error => {
          console.log(error);
          this.currGD.rubrics[rubricIdx].is_selected = !this.currGD.rubrics[rubricIdx].is_selected;
          this.toastr.danger(error, 'API Error');
        },
      );
    }
    // console.log('rubric selected');
  }
  
  /**
   * The method makes the server API request to fetch the grading duty details using service method
   * getGradingDutyDetails. On receiving the success response from the server, the method stores the data
   * like the responses recorded by students, graded marks, grader comment, gold solution by an instructor,
   * the mark adjustment, and the applied rubrics corresponding to the current grading duty.
   * The method updates the view according to the question type.
   * 
   */
  fetchGradingDutyDetails() {
    this.loading = true;
    this.myEventsService.getGradingDutyDetails(this.eventId, this.subEventId, this.currGD.main_id).subscribe(
      resData => {
        console.log(resData);
        /*let html = resData.data.gradingduty.response.question.text;
        let div = document.createElement("div");
        div.innerHTML = html;
        let text = div.textContent || div.innerText || "";*/
        this.currGD.quetionText = atob(resData.data.gradingduty.response.question.text) ;

        this.currGD.questionType = resData.data.gradingduty.response.question.type;
        let responseText = resData.data.gradingduty.response.response_text;
        let solutionText = atob(resData.data.gradingduty.response.question.options);
        
        if (this.currGD.questionType == "TXT") {
          this.currGD.options = null;
          this.currGD.responseText = responseText;
          // let div = document.createElement("div");
          // div.innerHTML = solutionText;
          // let text = div.textContent || div.innerText || "";
          this.currGD.solutionText = solutionText;

          
        }
        else {
          /*if ( this.mcqcbdataarray != undefined ) {
            this.mcqcbdataarray.pop();
          }*/
          this.currGD.options = JSON.parse(atob(resData.data.gradingduty.response.question.options));
          let optionsObject = JSON.parse(atob(resData.data.gradingduty.response.question.options));
          for ( let i = 0; i < optionsObject.length; i++ ) {
            let temp = optionsObject[i].optionText;
            let div = document.createElement("div");
            div.innerHTML = temp;
            let text = div.textContent || div.innerText || "";
            // optionsObject[i].optionText = text ;
            // optionsObject[i].optionText = optionsObject[i].optionText

            if ( optionsObject[i].is_Correct != "") {
             optionsObject[i].is_Correct = true;
            }
          }
          this.currGD.options = optionsObject;

          // this.mcqcbdataarray.push(optionsObject);

          if ( responseText != null ) {
            responseText = responseText.replace(/\"/g,"");
          }
          if (this.currGD.questionType != 'MCQRB' ) {
            this.currGD.responseText = responseText.split("");
            if ( this.currGD.questionType == 'MCQCB') {
              let length = this.currGD.responseText.length;
              for ( var i = 0; i < this.currGD.options.length; i++ ) {
                if (responseText.indexOf(i) != -1) {
                  this.currGD.options[i]['response'] = "true";
                }
                else {
                  this.currGD.options[i]['response'] = "false";
                }
              }
            }
          }
          else {
            this.currGD.responseText = Number(responseText);
            for ( var i = 0; i < this.currGD.options.length; i++ ) {
              if (this.currGD.responseText  == i ) {
                this.currGD.options[i]['response'] = "true";
              }
              else {
                this.currGD.options[i]['response'] = "false";
              }
            }
            

          }

          
          
        }

        
       
        this.currGD.aggregate_marks = resData.data.gradingduty.aggregate_marks != null ? resData.data.gradingduty.aggregate_marks : 0;
        this.currGD.grader_comment = resData.data.gradingduty.grader_comment != null ? resData.data.gradingduty.grader_comment : '';
        this.currGD.marks_adjustment = resData.data.gradingduty.marks_adjustment != null ? resData.data.gradingduty.marks_adjustment : 0;
        this.currGD.upload_page_no = resData.data.response.upload_page_no;
        this.setRubrics(resData.data.question_rubrics, resData.data.gradingduty_has_rubrics);
      },
      error => {
        this.loading = false;
        console.log(error);
      },
    );
  }

  /**
   * The method sets the rubric list for the grading panel using the received list of applied rubrics
   *  and the list of all question rubrics. 
   * @param question_rubrics The list of rubrics corresponding to the question
   * @param applied_rubrics The list of applied rubrics
   */
  setRubrics(question_rubrics: any[], applied_rubrics: any[]) {
    const rubrics: MyRubric[] = [];
    for (let i = 0; i < question_rubrics.length; i++) {
      const r: MyRubric = new MyRubric(i + 1,
        question_rubrics[i].id,
        question_rubrics[i].text,
        question_rubrics[i].marks,
        false,
      );
      for (let j = 0; j < applied_rubrics.length; j++) {
        if (r.main_id == applied_rubrics[j].rubric) {
          r.is_selected = true;
        }
      }
      rubrics.push(r);
    }
    this.currGD.rubrics = rubrics;
    this.loading = false;
  }

  /**
   * The method redirects the user to the Grading manager of the course
   */
  gotoGradingManager() {
    this.pageRouter.gotoGradingManager();
  }

  /**
   * The method submits the grading for current grading duty on the server 
   * with is_completed flag = true and load the next ungraded grading duty from the CurrGDs queue
   * in the backward direction.
   * The method uses the component API gradeSubmission and performs below mentioned actions,
   * 
   * 1.call the server API to update grading for the current grading duty
   * 
   * 2.update the completed grading count of current grading duty question
   * 
   * 3.fetch next ungraded grading duty from the CurrGDs queue in backward direction
   * 
   * 4.Make call to the fetchGradingdutydetails method which calls -> setrubrics
   */
  onGradeAndPrev() {
    this.gradeSubmission(-1);
  }

  /**
   * The method submits the grading for current grading duty on the server 
   * with is_completed flag = false and load the next grading duty from the CurrGDs queue
   * in backward direction. The method internally uses the component API submitSubmission 
   */
  onPrev() {
    this.submitSubmission(-1);
  }

    /**
   * The method make the server API request to upload the grading on the application server 
   * with is_completed = false. On receiving the success response from the server,
   * the method performs below mentioned actions,
   * 
   * 1.shows success notification to the user
   * 
   * 2.fetch next grading duty from the CurrGDs queue, the looking direction
   * is decided using the received move. For example +1 for forward and -1 for backward direction.
   * Uses the component API's fetchNextDuty and fetchPrevDuty
   * 
   * 3.Make call to the component API takeNextMove which fetch the grading duty details
   * , set rubric data, the submission view panel data for the next grading duty
   * @param move The direction move, For example +1 for forward and -1 for backward direction
   */
  submitSubmission(move: number) {
    this.myEventsService.updateGradingDutyDetails(this.eventId, this.subEventId, this.currGD).subscribe(
      resData => {
        console.log(resData);
        let nextId: number = -1;
        if (move == 1) {
          nextId = this.fetchNextDuty();
          this.takeNextMove(nextId);
        } else {
          nextId = this.fetchPrevDuty();
          this.takeNextMove(nextId);
        }
      },
      error => {
        console.log(error);
      },
    );
  }

  /**
   * The method returns the index position of the next grading duty from the queue w.r.t. 
   * the current grading duty
   */
  fetchNextDuty() {
    const len = this.currGDs.grading_duties.length;
    return (this.currGDIdx + 1) % len;
  }
  
  /**
   * The method returns the index position of the previous grading duty from the queue w.r.t. 
   * the current grading duty
   */
  fetchPrevDuty() {
    const len = this.currGDs.grading_duties.length;
    return (this.currGDIdx - 1 + len) % len;
  }

  /**
   * The method make the server API request to upload the grading on the application server 
   * with is_completed = true. On receiving the success response from the server,
   * the method performs below mentioned actions,
   * 
   * 1.update the grading completion count according to the old status of grading duty
   * 
   * 2.shows success notification to the user
   * 
   * 3.fetch next ungraded grading duty from the CurrGDs queue, the looking direction
   * is decided using the received move. For example +1 for forward and -1 for backward direction.
   * Uses the component API's fetchNextUnGradedDuty and fetchPrevUnGradedDuty
   * 
   * 4.Make call to the component API takeNextMove which fetch the grading duty details
   * , set rubric data, the submission view pane data for the next ungraded grading duty
   * @param move The direction move, For example +1 for forward and -1 for backward direction
   */
  gradeSubmission(move: number) {
    const old_status: boolean = this.currGD.is_completed;
    this.currGD.is_completed = true;
    this.myEventsService.updateGradingDutyDetails(this.eventId, this.subEventId, this.currGD).subscribe(
      resData => {
        console.log(resData);
        if(old_status == false)
          this.currGDs.completed_cnt += 1;
        this.toastr.primary('Grades submitted successfully', 'Success');
        // this.deleteKeyboardShortcuts();
        let nextId: number = -1;
        if (move == 1) {
          nextId = this.fetchNextUnGradedDuty();
          this.takeNextMove(nextId);
        } else {
          nextId = this.fetchPrevUnGradedDuty();
          this.takeNextMove(nextId);
        }
      },
      error => {
        this.currGD.is_completed = false;
        console.log(error);
      },
    );
  }

  /**
   * The method iterate through the grading duty queue in circular manner with the start
   * postion as current grading duty index and 
   * returns the index position of the next first ungraded duty from the queue.
   * If no such grading duty found, method simply returns -1
   */
  fetchNextUnGradedDuty() {
    const len = this.currGDs.grading_duties.length;
    if (this.currGDs.completed_cnt == this.currGDs.tot_cnt)
      return -1;
    for (let i = (this.currGDIdx + 1) % len; i != this.currGDIdx; i = (i + 1) % len) {
      if (this.currGDs.grading_duties[i].is_completed == false) {
        return i;
      }
    }
    return -1;
  }

  /**
   * The method submits the grading for current grading duty on the server 
   * with is_completed flag = false and load the next grading duty from the CurrGDs queue.
   * The method internally uses the component API submitSubmission 
   */
  onNext() {
    this.submitSubmission(1);
  }


  /**
   * The method submits the grading for current grading duty on the server 
   * with is_completed flag = true and load the next ungraded grading duty from the CurrGDs queue.
   * The method uses the component API gradeSubmission and performs below mentioned actions,
   * 
   * 1.call the server API to update grading for the current grading duty
   * 
   * 2.update the completed grading count of current grading duty question
   * 
   * 3.fetch next ungraded grading duty from the CurrGDs queue
   * 
   * 4.Make call to the fetchGradingdutydetails method which calls -> setrubrics
   */
  onGradeAndNext() {
    this.gradeSubmission(1);
  }

  /**
   * The method validate the received list index of grading duty, if -1 then it shows the grading 
   * completion notification for current question and redirects the user to the grading manager page.
   * If received list index is valid, then method takes below actions
   * 
   * 1.updates the component properties currGDIdx as the received list index &
   * currGD with the respective grading duty object
   * 
   * 2.fetch the grading duty details and set the rubric data,
   *  the submission view panel data for the next grading duty
   * @param nextId The list index corresponding to the next grading duty
   */
  takeNextMove(nextId: number) {
    if (nextId == -1) {
      this.gotoGradingManager();
    } 
    else {
      this.currGDIdx = nextId;
      this.currGD = this.currGDs.grading_duties[nextId];
      this.setProgressBarValue();
      this.fetchGradingDutyDetails();
    }
  }

  /**
   * The method iterate through the grading duty queue in circular backward manner with the start
   * postion as current grading duty index and 
   * returns the index position of the first ungraded duty from the queue.
   * If no such grading duty found, method simply returns -1
   */
  fetchPrevUnGradedDuty() {
    const len = this.currGDs.grading_duties.length;
    if (this.currGDs.completed_cnt == this.currGDs.tot_cnt)
      return -1;
    for (let i = (this.currGDIdx - 1 + len) % len; i != this.currGDIdx; i = (len + i - 1) % len) {
      if (this.currGDs.grading_duties[i].is_completed == false) {
        return i;
      }
    }
    return -1;
  }

}
