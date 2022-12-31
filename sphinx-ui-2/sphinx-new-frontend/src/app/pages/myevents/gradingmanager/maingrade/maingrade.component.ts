import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssignmentManagerService } from '../../../assignmentmanager/assignmentmanager.service';
// import { Router } from '@angular/router';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
import { MyGradingDuties, MyGradingDuty, MyRubric, MyEventClass } from '../../myevents.model';
import { MyEventsService } from '../../myevents.service';
import { NbToastrService } from '@nebular/theme';
import 'rxjs/add/operator/toPromise';
import { saveAs } from 'file-saver';
import { PageRouterService } from '../../../page-router.service';

/**
 * see the README for the component description
 */
@Component({
  selector: 'maingrade',
  templateUrl: './maingrade.component.html',
  styleUrls: ['./maingrade.component.scss']
})
export class MaingradeComponent implements OnInit {


   /**
   * The array object containing the user-submission file in image format
   */
  slides: { image: string }[] = [];
   /**
   * The index of start page in the image carousel of the main submission file
   */
  activeSlideIndex = 0;
  /**
   * the pause time for each image slide in image carousel, set to 0 for setting slide show in off mode
   */
  myInterval = 0;
  /**
   * The boolean flag representing whether the main submission file is present or not
   */
  isFilepresent = false;
  /**
   * The array to hold all the keyboard shortcuts
   */
  keyshortcuts: any[] = [];
  /**
   * The grading duty queue contains the list of grading duties allocated
   *  to the grader for the same question
   */
  currGDs: MyGradingDuties = JSON.parse(localStorage.getItem('currGDs'));
  /**
   * The grading duty object displayed in the view for grading
   */
  currGD: MyGradingDuty = JSON.parse(localStorage.getItem('currGD'));
  /**
   * The queue index of the grading duty object displayed in the view for the grading
   */
  currGDIdx: number = JSON.parse(localStorage.getItem('currGDIdx'));
/**
 * The database ID of the event corresponding to the current loaded grading duty
 */
  eventId: number = +(localStorage.getItem('myGradingEventID'));
  /**
 * The database ID of the GUPLOAD subevent corresponding to the current loaded grading duty
 */
  subEventId: number = +(localStorage.getItem('myGradingSubEventID'));
  /**
   * The variable to hold the progress bar value representing percentage 
   * of the grading completion w.r.t the total number of copies in the grading queue
   */
  progress_val: number = 0;
  /**
   * The boolean flag representing is there currently active GUPLOAD subevent is going on or not.
   * The flag is used to disable the grading control buttons in the scenario when 
   * the grader is allowed to only view the graded copies
   * using active GVIEW subevent
   */
  isGUPLOAD: boolean = false;

  loading: boolean = false;

  /**
   *  The constructor injects the required services like myEvents Service,
   *  Nebular toastr service, the PageRouter service, and the hotkeysService
   * @param myEventsService The object of the myEvents service
   * @param _hotkeysService The object of the hotkeys service
   * @param toastr The object of the nebular toastr service
   * @param pageRouter The object of the PageRouter service
   */
  constructor(
    // private router: Router,
    private _hotkeysService: HotkeysService,
    public myEventsService: MyEventsService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
  ) {
  }

  /**
   * The component lifecycle hook gets called before destroying the component.
   * The method deletes all the keyboard shortcuts created to perform grading using the 
   * component API deleteKeyboardShortcuts
   */
  ngOnDestroy(): void {
    this.deleteKeyboardShortcuts();
  }

  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method fetches the current grading duty associated information from the local storage,
   * then set the component properties 
   * currGDs, currGDIdx, currGD, eventId, subEventId, and isGUPLOAD flag.
   * The method fetches the current grading duty details like the applied rubrics
   * , the main submission copy from the server using the component API fetchGradingDutyDetails
   * . Method sets the grading progress bar value w.r.t. the grading queue using the component API 
   * setProgressBarValue
   *
    */
  ngOnInit() {

    // fetch currGDs, GD, gdIDx
    // fetch gd related details like submission,
    // applied rubrics, all rubrics, starting page number for question, grader comment, student comment,
    // mark adjustment, is_completed, aggr this.currMarks, is_late grading

    this.currGDs = JSON.parse(localStorage.getItem('currGDs'));
    this.currGD = JSON.parse(localStorage.getItem('currGD'));
    this.currGDIdx = JSON.parse(localStorage.getItem('currGDIdx'));
    this.eventId = +(localStorage.getItem('myGradingEventID'));
    this.subEventId = +(localStorage.getItem('myGradingSubEventID'));
    const myGradingEvent: MyEventClass = JSON.parse(localStorage.getItem('myGradingEvent'));
    this.isGUPLOAD = myGradingEvent.isActiveFlags.GUPLOAD;

    // console.log('fetched currGds =' + currGDs);
    // console.log('fetched currGd =' + currGD);
    // console.log('fetched currGdIDx =' + currGDIdx);
    this.setProgressBarValue();
    this.fetchGradingDutyDetails();
  }

  /**
   * The method makes the server API request to fetch the grading duty details using service method
   * getGradingDutyDetails. On receiving the success response from the server, the method stores the data
   * like the main submission file, graded marks, grader comment, start page index of the answer,
   *  the mark adjustment, and the applied rubrics corresponding to the current grading duty.
   * The method sets the image array for carousel using submission file and sets the rubric 
   * checkbox state for the list of applied rubrics using the component API setRubrics
   * 
   */
  fetchGradingDutyDetails() {
    this.loading = true;

    this.myEventsService.getGradingDutyDetails(this.eventId, this.subEventId, this.currGD.main_id).subscribe(
      resData => {
        console.log(resData);
        // set student submission file images
        this.setSlides(resData.data.submission_upload, resData.data.response.upload_page_no);
        //set grading duty details
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
   *  and the list of all question rubrics. It initializes the keyboard shortcuts corresponding
   * to the rubrics using the component API initializeKeyBoardShortcuts 
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
    this.initializeKeyBoardShortcuts();

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
   * The method inititalizes the keyboard shortcuts using the hotkeysService,
   *  the shortcuts are listed below
   * 
   * 1.The number keys 1-9 ,each key assigned to the rubric of the list of question-rubrics
   *  as per the list index
   * 
   * 2.[ A, S, D, F ] keys corresponding to grade & prev,
   *  prev, next, and grade & next buttons respectively
   */
  initializeKeyBoardShortcuts() {
    for (let i = 1; i <= this.currGD.rubrics.length; i++) {
      this.keyshortcuts.push(
        this._hotkeysService.add(new Hotkey('' + i, (event: KeyboardEvent): boolean => {
          // console.log('Typed hotkey ', 'a' + i);
          if (this.currGD.rubrics[i - 1].is_selected) {
            this.delRubricGDLink(i - 1);
          } else {
            this.setRubricGDLink(i - 1);
          }

          return false; // Prevent bubbling
        })));

    }
    this.keyshortcuts.push(
      this._hotkeysService.add(new Hotkey('a', (event: KeyboardEvent): boolean => {
        console.log('Typed hotkey ', 'a');
        this.onGradeAndPrev();
        return false; // Prevent bubbling
      })));

    this.keyshortcuts.push(
      this._hotkeysService.add(new Hotkey('s', (event: KeyboardEvent): boolean => {
        console.log('Typed hotkey ', 's');
        this.onPrev();
        return false; // Prevent bubbling
      })));

    this.keyshortcuts.push(
      this._hotkeysService.add(new Hotkey('d', (event: KeyboardEvent): boolean => {
        console.log('Typed hotkey ', 'd');
        this.onNext();
        return false; // Prevent bubbling
      })));

    this.keyshortcuts.push(
      this._hotkeysService.add(new Hotkey('f', (event: KeyboardEvent): boolean => {
        console.log('Typed hotkey ', 'f');
        this.onGradeAndNext();
        return false; // Prevent bubbling
      })));
  }


/**
 * The method deletes all the keyboard shortcuts available for the grading
 */
  deleteKeyboardShortcuts() {
    for (let i = 0; i < this.keyshortcuts.length; i++) {
      this._hotkeysService.remove(this.keyshortcuts[i]);
    }
  }

  /**
   * The method sets the array of images for the carousel using the list of submission file pages
   * @param file_images The list of submission file pages
   * @param page_no The start page index of the answer
   */
  setSlides(file_images: any[], page_no: number) {
    this.slides = [];
    for (const key of Object.keys(file_images)) {
      this.addSlide(file_images[key]);
    }
    console.log('selected_q page =', page_no);
    // this.activeSlideIndex = page_no;
    setTimeout(() => { this.activeSlideIndex = page_no; }, 0);
    this.isFilepresent = true;
  }


  /**
   * The method append the received page image to the file image array used
   *  for the submission file view panel
   * @param imageval the received page image
   */
  addSlide(imageval: string): void {
    this.slides.push({
      image: imageval,
    });
  }

  /**
   * The nebular card configuration parameter, used to present nebular card in window mode
   */
  winmode: boolean = false;
   /**
   * The method delete the page image of the received index from the file image array used
   *  for the submission file view panel
   * @param index the page index
   */
  removeSlide(index?: number): void {
    const toRemove = index ? index : this.activeSlideIndex;
    this.slides.splice(toRemove, 1);
  }

    /**
   * The method redirects the user to the MyEvents Dashboard of the course
   */
  gotoMyEvents() {
    // this.router.navigate(['/pages', 'myevents']);
    this.pageRouter.gotoMyEvents();
  }

  /**
   * The method redirects the user to the Grading manager of the course
   */
  gotoGradingManager() {
    // this.router.navigate(['/pages', 'myevents', 'gradingManager']);
    this.pageRouter.gotoGradingManager();
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
   * The method makes the server API request to apply the rubric-grading duty link 
   * on the application server.
   * On receiving success response from the server, the method updates the aggregated
   * graded marks accordingly.
   * @param rubricIdx The request corresponding rubric ID
   */
  setRubricGDLink(rubricIdx: number) {
    const rubricMainId: number = this.currGD.rubrics[rubricIdx].main_id;
    this.myEventsService.setRubricGradingDutyLink(this.eventId, this.subEventId, this.currGD.main_id, rubricMainId).subscribe(
      resData => {
        console.log('link set success');
        this.currGD.rubrics[rubricIdx].is_selected = !this.currGD.rubrics[rubricIdx].is_selected;
        this.currGD.aggregate_marks += this.currGD.rubrics[rubricIdx].marks;
      },
      error => {
        console.log(error);
        this.toastr.danger(error, 'API Error');
      },
    );
  }

  /**
   * The method makes the server API request to delete the rubric-grading duty link 
   * on the application server.
   * On receiving success response from the server, the method updates the aggregated
   * graded marks accordingly.
   * @param rubricIdx The request corresponding rubric ID
   */
  delRubricGDLink(rubricIdx: number) {
    const rubricMainId: number = this.currGD.rubrics[rubricIdx].main_id;
    this.myEventsService.delRubricGradingDutyLink(this.eventId, this.subEventId, this.currGD.main_id, rubricMainId).subscribe(
      resData => {
        this.currGD.rubrics[rubricIdx].is_selected = !this.currGD.rubrics[rubricIdx].is_selected;
        this.currGD.aggregate_marks -= this.currGD.rubrics[rubricIdx].marks;
        console.log('link delete success');
      },
      error => {
        console.log(error);
        this.toastr.danger(error, 'API Error');
      },
    );
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
   * 4.Make call to the fetchGradingdutydetails method which calls -> setimages, setrubrics -> initialize keyboard shortcuts
   */
  onGradeAndNext() {
    // this function submit grading for curr gd with is_completed=true and 
  //fetch next ungraded Grading duty
  // if no next ungraded duty found then show message "GD completed for this question"
  // and redirect to gradingManager
  // 1.call api to update grading
  // 2.update completed_cnt of curr gd question
  // 4.delete current keyboard shortcuts
  // 3.fetch next ungraded gd
  // 5.call fetchGradingdutydetails method which calls -> setimages, setrubrics -> initialize keyboard shortcuts
    this.gradeSubmission(1);

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
   * 4.Make call to the fetchGradingdutydetails method which calls -> setimages, setrubrics -> initialize keyboard shortcuts
   */
  onGradeAndPrev() {
    this.gradeSubmission(-1);
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
   * with is_completed flag = false and load the next grading duty from the CurrGDs queue
   * in backward direction. The method internally uses the component API submitSubmission 
   */
  onPrev() {
    this.submitSubmission(-1);
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
        this.deleteKeyboardShortcuts();
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
        // this.toastr.primary('Grades submitted successfully', 'Success');
        this.deleteKeyboardShortcuts();
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
      // this.toastr.primary('Grading Completed for Question ' + this.currGDs.question_title, 'Success');
      this.gotoGradingManager();
    } else {
      this.currGDIdx = nextId;
      this.currGD = this.currGDs.grading_duties[nextId];
      this.setProgressBarValue();
      this.fetchGradingDutyDetails();
    }
  }

  /**
   * The method calculate the percentage of grading duty completion w.r.t. the total number of 
   * grading duties in the queue and set the percentage value as the progress bar value
   */
  setProgressBarValue(){
    // console.log(this.progress_val);
    this.progress_val = (this.currGDs.completed_cnt / this.currGDs.tot_cnt) *100;
    // console.log(this.progress_val);
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
      // console.log(i);
      if (this.currGDs.grading_duties[i].is_completed == false) {
        return i;
      }
    }
    return -1;

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
      // console.log(i);
      if (this.currGDs.grading_duties[i].is_completed == false) {
        return i;
      }
    }
    return -1;

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
   * The method makes the server API request to fetch
   *  the main submission file associated to the grading duty.
   * On recieving success response from the server,
   * it downloads the file into the local system using the service API downloadFile
   */
  getMainSubmFile() {
    console.log('downloading main file');
    this.myEventsService.getMainSubmissionFile(this.eventId, this.subEventId, this.currGD.main_id).subscribe(
      resData => {
        console.log(resData);
        // this.saveToFileSystem(resData.data, 'application/pdf');
        this.myEventsService.downloadFile(resData.data.main_file, resData.data.original_file_name);

      },
      error => {
        console.log(error);
      },
    );
  }

   /**
   * The method makes the server API request to fetch
   *  the supplementary submission file associated to the grading duty.
   * On recieving success response from the server,
   * it downloads the file into the local system using the service API downloadFile
   */
  getSuppSubmFile() {
    console.log('downloading supp file');
    this.myEventsService.getSuppSubmissionFile(this.eventId, this.subEventId, this.currGD.main_id).subscribe(
      resData => {
        console.log(resData);
        this.myEventsService.downloadFile(resData.data.main_file, resData.data.original_file_name);

      },
      error => {
        console.log(error);
        this.toastr.info(error.error.detail, 'File NotExist');
      },
    );
  }

  /**
   *  The method downloads the received file into the local system
 * @param data the file Object to be downloaded
 * @param fileType the filetype of the corresponding file
   */
  saveToFileSystem(data: any, fileType: string) {
    // const contentDispositionHeader: string = response.headers.get('Content-Disposition');
    // const parts: string[] = contentDispositionHeader.split(';');
    const filename = data.original_file_name;
    // const chunk = data.main_file.read(fileType.minimumBytes);
    // console.log(fileType(chunk));
    const blob = new Blob([data.main_file], { type: fileType });
    saveAs(blob, filename);
  }

}
