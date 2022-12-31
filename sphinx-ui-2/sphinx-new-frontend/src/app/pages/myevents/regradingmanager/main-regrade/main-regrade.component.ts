import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { MyEventsService } from '../../myevents.service';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';
// import { Router } from '@angular/router';
import { MyReGradingDuty, MyGradingDuty, MyRubric, MyEventClass } from '../../myevents.model';
import { Rubric } from '../../../assignmentmanager/assignmentmanager.model';
import { saveAs } from 'file-saver';
import { PageRouterService } from '../../../page-router.service';

/**
 * see the README for the component description
 */
@Component({
  selector: 'main-regrade',
  templateUrl: './main-regrade.component.html',
  styleUrls: ['./main-regrade.component.scss',
  ],
})
export class MainRegradeComponent implements OnInit {


   /**
   * The array object containing the pages of the user-submission file in image format, 
   * used for the image carousel in the view
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
   * The list contains the list of re-grading duties allocated
   *  to the grader
   */
  myReGDs: MyReGradingDuty[] = JSON.parse(localStorage.getItem('myReGDs'));
   /**
   * The re-grading duty object displayed in the view for the review
   */
  currReGD: MyReGradingDuty = JSON.parse(localStorage.getItem('currReGD'));
  /**
   * The list index of the re-grading duty object displayed in the view for the grading
   */
  currReGDIdx: number = JSON.parse(localStorage.getItem('currReGDIdx'));
  /**
 * The database ID of the event corresponding to the current loaded re-grading duty
 */
  eventId: number = +(localStorage.getItem('myReGradingEventID'));
  /**
 * The database ID of the RGUPLOAD subevent corresponding to the current loaded re-grading duty
 */
  subEventId: number = +(localStorage.getItem('myReGradingSubEventID'));
   /**
   * The number of closed regrading requests
   */
  completed_cnt: number = +(localStorage.getItem('completedRegrading'));
    /**
   * The total number of regrading requests
   */
  tot_cnt: number = +(localStorage.getItem('totalRegrading'));
    /**
   * The boolean flag representing is there currently active RGUPLOAD subevent is going on or not.
   * The flag is used to disable the grading control buttons in the scenario when 
   * the grader is allowed to only view the re-graded copies
   * using active RGVIEW subevent
   */
 isRGUPLOAD: boolean = false;
 assignment_isInteractive = false;
 curr_q:any;
 optionsObject: any;
 textResponse: any;
  reponseTextTXT: '';

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
  ) { }



  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method fetches the current re-grading duty associated information from the local storage,
   * and sets the component properties 
   * myReGDs, currReGDIdx, currReGD, eventId, subEventId, and isRGUPLOAD flag.
   * The method fetches the current re-grading duty details like the applied rubrics
   * , the main submission copy, old grading duties and the regrade request messages
   *  from the server using the component API fetchRegradingDuty
   *
    */
  ngOnInit() {

    this.myReGDs = JSON.parse(localStorage.getItem('myReGDs'));
    this.currReGD = JSON.parse(localStorage.getItem('currReGD'));
    this.currReGDIdx = JSON.parse(localStorage.getItem('currReGDIdx'));
    this.eventId = +(localStorage.getItem('myReGradingEventID'));
    this.subEventId = +(localStorage.getItem('myReGradingSubEventID'));
    this.completed_cnt = +(localStorage.getItem('completedRegrading'));
    this.tot_cnt = +(localStorage.getItem('totalRegrading'));
    const myGradingEvent: MyEventClass = JSON.parse(localStorage.getItem('myReGradingEvent'));
    this.isRGUPLOAD = myGradingEvent.isActiveFlags.RGUPLOAD;
    this.assignment_isInteractive = myGradingEvent.assignment_isInteractive;

    if(this.currReGD.grader_comment == null) {
      this.currReGD.grader_comment = '';
    }

    this.fetchRegradingDuty();
  }
   /**
   * The array object containing the pages of the user-submission file in image format
   */
  submission_images: string[] = [];

  /**
   * The method make the server API request to fetch the regrading duty details using service 
   * method getGradingDutyDetails. On receiving success response from the server,
   * the method takes below actions to extract the details and stored in the component properties,
   * 
   * 1.Call the component API setPrevGradingDuties to store the list of old grading duties
   * 
   * 2.Call the component API setChatboxMessages to store the communication messages corresponding 
   * to regrade requests
   * 
   * 3.Call the component API setCurrGDDetails to store the regrading duty details like 
   * the list of applied rubrics, Point adjustment data, graded marks, etc.
   * 
   * 4.Call the component API setSlides to store the pages of submission file as array of images
   */
  fetchRegradingDuty() {
    // console.log(this.mySlideImages);
    this.myEventsService.getGradingDutyDetails(this.eventId, this.subEventId, this.currReGD.gd_id).subscribe(
      resData => {
        console.log(resData);
        this.setPrevGradingDuties(resData.data.prev_gradingduties, resData.data.question_rubrics);
        this.setChatboxMessages(resData.data.regrading_messages);
        this.setCurrGDDetails(
          resData.data.gradingduty,
          resData.data.gradingduty_has_rubrics,
          resData.data.response,
          resData.data.question_rubrics);
          if (!this.assignment_isInteractive) {
            this.setSlides(resData.data.submission_upload,resData.data.response.upload_page_no);
          }
          else {
            this.setInteractiveData();
          }
      },
      error => {
        console.log(error);

      },
    );

  }
  setInteractiveData() {
    if (this.assignment_isInteractive) {
      this.curr_q = JSON.parse(localStorage.getItem('currentRGDetailsResponse'));
      let responseText = this.curr_q.response;
      
      
      let html = this.curr_q.question_text;
      let div = document.createElement("div");
      div.innerHTML = html;
      let text = div.textContent || div.innerText || "";
      this.curr_q.question_text = text ;
      
      if (this.curr_q.question_type == "TXT") {
        
        /*let div = document.createElement("div");
        div.innerHTML = this.curr_q.question_options;
        let text = div.textContent || div.innerText || "";*/
        this.optionsObject = atob(this.curr_q.question_options);
        this.reponseTextTXT = this.curr_q.response;
      }
      else {
        this.optionsObject = JSON.parse(atob(this.curr_q.question_options));
        for ( let i = 0; i < this.optionsObject.length; i++ ) {
          this.optionsObject[i].optionText = this.optionsObject[i].optionText ;
  
          if ( this.optionsObject[i].is_Correct != "") {
            this.optionsObject[i].is_Correct = true;
          }
        }
      }
      if ( responseText != null ) {
        responseText = responseText.replace(/\"/g,"");
      }
      if (this.curr_q.question_type == 'MCQRB') {
        this.curr_q.responseText = Number(responseText);



        for ( var i = 0; i < this.optionsObject.length; i++ ) {
          if (responseText  == i ) {
            this.optionsObject[i]['response'] = "true";
          }
          else {
            this.optionsObject[i]['response'] = "false";
          }
        }

      }
      else {
        this.curr_q.responseText = responseText.split("");

        let length = this.optionsObject.length;
        for ( var i = 0; i < length; i++ ) {
          if (responseText.indexOf(i) != -1) {
            this.optionsObject[i]['response'] = "true";
          }
          else {
            this.optionsObject[i]['response'] = "false";
          }
        }

      }        
      
    }
  }

  /**
   * The list of the communication messages corresponding to regrade requests.
   * 
   * Current use: the property use to list out all the messages in the
   *  regrade request chatbox in the view
   */
  messages: any[] = [];

  /**
   * The method process the received server response data corresponding to the
   * current regrading duty details and set the below properties,
   * 
   * 1.Re-Grading duty details like grader comment, aggregated marks, point adjustment using the
   * received gd_data parameter values
   * 
   * 2.The complete list of rubrics with the applied rubrics set in checked state using the 
   * parameters question_rubrics and gdhr_data
   * 
   * 3.The start page of submitted answer corresponding to the question using the parameter response
   * 
   * After setting above data, the method calls the initializeKeyBoardShortcuts API to create the keyboard 
   * shortcuts for rubric based grading
   * @param gd_data the Grading duty details
   * @param gdhr_data the structure contains list of applied rubrics
   * @param response the row entry of Response table from the database corresponding 
   * to the regrade request
   * @param question_rubrics The list of rubrics corresponding to the question
   */
  setCurrGDDetails(gd_data: any, gdhr_data: any, response: any, question_rubrics: any[]) {
    this.currReGD.grader_comment = gd_data.grader_comment;
    this.currReGD.aggregate_marks = gd_data.aggregate_marks;
    this.currReGD.marks_adjustment = gd_data.marks_adjustment;
    this.currReGD.upload_page_no = response.upload_page_no;
    this.currReGD.is_completed = gd_data.is_completed;
    this.currReGD.response = response.response_text;
    this.currReGD.question_text = atob(this.currReGD.question_text);
    const rubrics: MyRubric[] = [];
    for (let j = 0; j < question_rubrics.length; j++) {
      const r: MyRubric = new MyRubric(
        j + 1,
        question_rubrics[j].id,
        question_rubrics[j].text,
        question_rubrics[j].marks,
        false,
      );
      for (let k = 0; k < gdhr_data.length; k++) {
        if (gdhr_data[k].rubric == r.main_id) {
          r.is_selected = true;
          break;
        }
      }
      rubrics.push(r);

    }
    this.currReGD.rubrics = rubrics;
    this.initializeKeyBoardShortcuts();
    localStorage.setItem('currentRGDetailsResponse', JSON.stringify(this.currReGD));

  }


  /**
   * The method sets the list of communication messages of regrade requests using the 
   * received server response data. The method sets the each message in the required format
   * by Nebular Chatbox component using the component API sendMessage
   * @param regrading_msg_data The server response containing the list of message structures,
   * Each structure contains the message text and sender of the message i.e. grader or student
   */
  setChatboxMessages(regrading_msg_data: any[]) {
    for (let i = 0; i < regrading_msg_data.length; i++) {
      this.sendMessage(
        regrading_msg_data[i].message,
        regrading_msg_data[i].sender,
        regrading_msg_data[i].sender == 'grader');
    }
  }

  /**
   * The method receive the message structure and set the message in the required
   * structure format by Nebular Chatbox component. After formatting the message, method
   * add it in the message queue represented by the component property messages
   * @param message The message text
   * @param userName The sender of the message, used to display in the chatbox
   * @param reply The boolean flag representing whether the message is sent by the grader or not
   */
  sendMessage(message: any, userName: string, reply: boolean) {
    this.messages.push({
      text: message,
      date: new Date(),
      reply: reply,
      type: 'text',
      user: {
        name: userName,
      },
    });
  }

  /**
   * The method sets the list of old grading duties corresponding to the regrading request.
   * The method process the received grading duty data from the server response,
   * and sets below details for each list item,
   * 
   * 1.Grading duty details like graded marks, point adjustment, grader comment
   * 
   * 2.The list of applied rubrics
   * @param prev_gd_data The list of old grading duties in the server response format
   * @param question_rubrics The list of rubrics corresponding to the questions
   */
  setPrevGradingDuties(prev_gd_data: any[], question_rubrics: any[]) {
    const prev_gds: MyGradingDuty[] = [];
    for (let i = 0; i < prev_gd_data.length; i++) {
      const gd_data: any = prev_gd_data[i].gd;
      const gd_r_data: any[] = prev_gd_data[i].gradingduty_has_rubrics;
      const gd = new MyGradingDuty(
        i + 1,
        gd_data.id,
        gd_data.is_completed,
        gd_data.aggregate_marks,
        '',
        [],
      );
      gd.grader_comment = gd_data.grader_comment;
      gd.marks_adjustment = gd_data.marks_adjustment;
      gd.rubrics = [];

      const rubrics: MyRubric[] = [];
      for (let j = 0; j < question_rubrics.length; j++) {
        const r: MyRubric = new MyRubric(
          j + 1,
          question_rubrics[j].id,
          question_rubrics[j].text,
          question_rubrics[j].marks,
          false,
        );
        for (let k = 0; k < gd_r_data.length; k++) {
          if (gd_r_data[k].rubric == r.main_id) {
            r.is_selected = true;
            break;
          }
        }
        rubrics.push(r);

      }
      gd.rubrics = rubrics;
      prev_gds.push(gd);
    }

    this.currReGD.prev_gds = prev_gds;

  }

   /**
   * The method sets the array of images for the carousel using the
   *  list of submission file pages
   * @param file_images The list of submission file pages
   */
  setSlides(file_images: any[], page_no: number) {
    // this.mySlideImages = [];
    // for (const key of Object.keys(file_images)) {
    //   const img: string = file_images[key];
    //   this.mySlideImages.push(img);
    // }
    // this.activeSlideIndex = page_no - 1;

    this.slides = [];
    for (const key of Object.keys(file_images)) {
      this.addSlide(file_images[key]);
    }
    console.log('selected_q page =', page_no);
    setTimeout(() => { this.activeSlideIndex = page_no; }, 0);
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
   * The array object containing the pages of the user-submission file in image format, 
   * used for the image carousel in the view
   */
  mySlideImages: string[] = [];
  /**
   * The image carousel configuration settings
   */
  mySlideOptions = { items: 1, loop: true, dots: true, nav: true, navText: ['PREV', 'NEXT'] };

 /**
   * The method inititalizes the keyboard shortcuts using the hotkeysService.
   *  The shortcuts are the number keys 1-9 ,where each key assigned to the rubric of the list of question-rubrics
   *  as per the list index
   *
   */
  initializeKeyBoardShortcuts() {
    for (let i = 1; i <= this.currReGD.rubrics.length; i++) {
      this.keyshortcuts.push(
        this._hotkeysService.add(new Hotkey('' + i, (event: KeyboardEvent): boolean => {
          // console.log('Typed hotkey ', 'a' + i);
          if (this.currReGD.rubrics[i - 1].is_selected) {
            this.delRubricGDLink(i - 1);
          } else {
            this.setRubricGDLink(i - 1);
          }

          return false; // Prevent bubbling
        })));

    }
  }
/**
 * The method deletes all the keyboard shortcuts available for the re-grading
 */
  deleteKeyboardShortcuts() {
    for (let i = 0; i < this.keyshortcuts.length; i++) {
      this._hotkeysService.remove(this.keyshortcuts[i]);
    }
  }

  /**
   * The method makes the server API request to create the rubric-grading duty link 
   * on the application server.
   * On receiving success response from the server, the method updates the aggregated
   * graded marks accordingly.
   * @param rubricIdx The request corresponding rubric ID
   */
  setRubricGDLink(rubricIdx: number) {
    const rubricMainId: number = this.currReGD.rubrics[rubricIdx].main_id;
    this.myEventsService.setRubricGradingDutyLink(this.eventId, this.subEventId, this.currReGD.gd_id, rubricMainId).subscribe(
      resData => {
        console.log('link set success');
        this.currReGD.rubrics[rubricIdx].is_selected = !this.currReGD.rubrics[rubricIdx].is_selected;
        this.currReGD.aggregate_marks += this.currReGD.rubrics[rubricIdx].marks;
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
    const rubricMainId: number = this.currReGD.rubrics[rubricIdx].main_id;
    this.myEventsService.delRubricGradingDutyLink(this.eventId, this.subEventId, this.currReGD.gd_id, rubricMainId).subscribe(
      resData => {
        this.currReGD.rubrics[rubricIdx].is_selected = !this.currReGD.rubrics[rubricIdx].is_selected;
        this.currReGD.aggregate_marks -= this.currReGD.rubrics[rubricIdx].marks;
        console.log('link delete success');
      },
      error => {
        console.log(error);
        this.toastr.danger(error, 'API Error');
      },
    );
  }

  /**
   * The method validate whether active regrading subevent is going on or not,
   * if subevent is not going on , then method displays error message and returns.
   * The method check the state for the requested rubric and make the 
   * respective server API request to create/delete the rubric-grading duty link 
   * accordingly on the application server.
   * On receiving success response from the server, the method updates the aggregated
   * graded marks accordingly.
   * @param rubricIdx The request corresponding rubric ID
   */
  rubricSelected(rubricIdx: number) {
    console.log(rubricIdx);
    if(!this.isRGUPLOAD){
      this.toastr.danger('There is no re-grading event going on, please contact the instructor if you feel this is an error', 'NoEvent Error');
        return;
      }
    const rubricMainId: number = this.currReGD.rubrics[rubricIdx].main_id;
    if (!this.currReGD.rubrics[rubricIdx].is_selected) {
      this.myEventsService.setRubricGradingDutyLink(this.eventId, this.subEventId, this.currReGD.gd_id, rubricMainId).subscribe(
        resData => {
          console.log('link set success');
          this.currReGD.aggregate_marks += this.currReGD.rubrics[rubricIdx].marks;
        },
        error => {
          console.log(error);
          this.currReGD.rubrics[rubricIdx].is_selected = !this.currReGD.rubrics[rubricIdx].is_selected;
          this.toastr.danger(error, 'API Error');
        },
      );
    } else {
      this.myEventsService.delRubricGradingDutyLink(this.eventId, this.subEventId, this.currReGD.gd_id, rubricMainId).subscribe(
        resData => {
          this.currReGD.aggregate_marks -= this.currReGD.rubrics[rubricIdx].marks;
          console.log('link delete success');
        },
        error => {
          console.log(error);
          this.currReGD.rubrics[rubricIdx].is_selected = !this.currReGD.rubrics[rubricIdx].is_selected;
          this.toastr.danger(error, 'API Error');
        },
      );
    }
    // console.log('rubric selected');
  }
 /**
   * The method makes the server API request to fetch
   *  the main submission file associated to the re-grading duty.
   * On recieving success response from the server,
   * it downloads the file into the local system using the saveToFileSystem API
   */
  getMainSubmFile() {
    console.log('downloading main file');
    this.myEventsService.getMainSubmissionFile(this.eventId, this.subEventId, this.currReGD.gd_id).subscribe(
      resData => {
        console.log(resData);
        this.saveToFileSystem(resData.data, 'application/pdf');

      },
      error => {
        console.log(error);
      },
    );
  }


   /**
   * The method makes the server API request to fetch
   *  the supplementary submission file associated to the re-grading duty.
   * On recieving success response from the server,
   * it downloads the file into the local system using the saveToFileSystem API
   */
  getSuppSubmFile() {
    console.log('downloading supp file');
    this.myEventsService.getSuppSubmissionFile(this.eventId, this.subEventId, this.currReGD.gd_id).subscribe(
      resData => {
        console.log(resData);
        this.saveToFileSystem(resData.data, 'application/zip');

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

    /**
   * The method takes the value of the point adjustment input box from the adjustment section,
   * then add the value to the total graded marks and 
   * update the aggregated marks of the current re-grading duty 
   */
  marksAdjustChange() {
    if (this.currReGD.marks_adjustment == NaN) {
      this.toastr.danger('Please enter valid Point Adjustment', 'Error');
      return;
    } else {
      let marks = 0;
      for (let i = 0; i < this.currReGD.rubrics.length; i++) {
        if (this.currReGD.rubrics[i].is_selected) {
          marks += this.currReGD.rubrics[i].marks;
        }
      }
      marks += this.currReGD.marks_adjustment;
      this.currReGD.aggregate_marks = marks;
    }

  }

   /**
   * The method submits the grading for current grading duty on the server 
   * with is_completed flag = true and then redirects the user to the re-grading manager.
   * The method uses the gradeSubmission API of the component
   */
  onSubmit() {
    this.gradeSubmission();
  }

  /**
   * The method save the grading for current grading duty on the server 
   * with is_completed flag = false and then redirects the user to the re-grading manager.
   * The method uses the submitSubmission API of the component
   */
  onCancel() {
    this.submitSubmission();
  }


  /**
   * The method make the server API request to upload the grading on the application server 
   * with is_completed = true. On receiving the success response from the server,
   * the method shows success notification to the user and 
   * redirects the user to the Regrading Manager
   */
  gradeSubmission() {
    this.currReGD.is_completed = true;
    this.myEventsService.updateReGradingDutyDetails(this.eventId, this.subEventId, this.currReGD).subscribe(
      resData => {
        console.log(resData);
        this.toastr.primary('Grades submitted successfully', 'Success');
        // move to Regrading manager
        this.gotoReGradingManager();

      },
      error => {
        this.currReGD.is_completed = false;
        console.log(error);

      },
    );
  }

   /**
   * The method make the server API request to save the grading on the application server 
   * with is_completed = false. On receiving the success response from the server,
   * the method redirects the user to the Regrading Manager
   */
  submitSubmission() {
    this.myEventsService.updateReGradingDutyDetails(this.eventId, this.subEventId, this.currReGD).subscribe(
      resData => {
        console.log(resData);
        // move to regrading manager
        this.gotoReGradingManager();
      },
      error => {
        console.log(error);
      },
    );
  }

  /**
   * The method make the server API request to save the grader's review message on the application server 
   * . On receiving the success response from the server,
   * the method add the grader's review message to the chatbox message array using the 
   * sendMessage API of the component
   */
  onChatboxSubmit() {
    this.myEventsService.updateReGradingDutyDetails(this.eventId, this.subEventId, this.currReGD).subscribe(
      resData => {
        console.log(resData);
        // move to regrading manager
        if (this.messages.length > 0) {
          if (this.messages[0].reply) {
            this.messages.pop();
            this.sendMessage(this.currReGD.grader_comment, 'grader', true);
          } else {
            this.sendMessage(this.currReGD.grader_comment, 'grader', true);
          }
        } else {
          this.sendMessage(this.currReGD.grader_comment, 'grader', true);
        }
      },
      error => {
        console.log(error);
      },
    );
  }

    /**
   * The method deletes all the keyboard shortcuts created to perform re-grading using the 
   * component API deleteKeyboardShortcuts
   *  and redirects the user to the ReGrading manager of the course
   */
  gotoReGradingManager() {
    this.deleteKeyboardShortcuts();
    // this.router.navigate(['/pages', 'myevents', 'regradingManager']);
    this.pageRouter.gotoReGradingManager();
  }


  /**
   * The component lifecycle hook gets called before destroying the component.
   * The method deletes all the keyboard shortcuts created to perform re-grading using the 
   * component API deleteKeyboardShortcuts
   */
  ngOnDestroy(): void {
    this.deleteKeyboardShortcuts();
  }


}
