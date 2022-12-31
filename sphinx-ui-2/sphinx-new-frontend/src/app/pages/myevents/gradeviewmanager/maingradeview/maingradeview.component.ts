import { Component, OnInit } from '@angular/core';
import { MyMarks, MyMarksQuestion, MyMarksGradingDuty, MyEventClass } from '../../myevents.model';
// import { Router } from '@angular/router';
import { MyEventsService } from '../../myevents.service';
import { NbToastrService } from '@nebular/theme';
import { PageRouterService } from '../../../page-router.service';

/**
 * see the README for the component description
 */
@Component({
  selector: 'maingradeview',
  templateUrl: './maingradeview.component.html',
  styleUrls: ['./maingradeview.component.scss']
})
export class MaingradeviewComponent implements OnInit {
  is_interactive: boolean;


   /**
   *  The constructor injects the required services like myEvents Service,
   *  Nebular toastr service, and the PageRouter service
   * @param myEventsService The object of the myEvents Service
   * @param toastr The object of the nebular toastr service
   * @param pageRouter The object of the PageRouter services
   */
  constructor(
    // private router: Router,
    public myEventsService: MyEventsService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
  ) { }

   /**
   * the pause time for each image slide in image carousel, set to 0 for setting slide show in off mode
   */
  myInterval = 0;

    /**
   * The MyMarks model object holds the information of user submission marksheet.
   *  The information contains the main submission file, the total graded marks and the list of
   * MyMarksQuestion model objects corresponding to each question in the submission
   */
  my_marks: MyMarks;
  /**
   * The MyMarksQuestion model object holds the detail properties corresponding to the
   * question shown in the view
   */
  curr_q: MyMarksQuestion;
  /**
   * The list index of the
   * question shown in the view
   */
  curr_q_idx: number = 0;
   /**
   * The index of start page in the image carousel of the main submission file
   */
  activeSlideIndex: number = 0;
    /**
   * The array object containing the pages of the user-submission file in image format, 
   * used for the image carousel in the view
   */
  slides: { image: string }[] = [];
   /**
 * The database ID of the event corresponding to the graded submission
 */
  eventId: number;
  /**
   * The regrading duty object, holds the re-grading details in case the question is re-graded
   */
  rgd: any = null;
  /**
   *  The boolean flag representing is there currently active RGREQ subevent is going on or not.
   * The flag is used to enable/disable regrade request capability in the view
   */
  isRGREQ: boolean = false;
  optionsObject: any;

  /**
   * The component lifecycle hook, get called on every component initialization. 
   * The method fetches the user-selected graded question associated information from the local storage,
   * and sets the component properties 
   * ,which used to render the data in the view.
   * The method set the submission file carousel images using the setSlides API.
   * The method sets the The Question-GradeSheet panel data 
   * corresponding to the user-selected question using the loadCurrQ API.
   *
    */
  ngOnInit() {
    this.eventId = + localStorage.getItem('myEventID');
    this.my_marks = JSON.parse(localStorage.getItem('myMarks'));
    const my_gv_event: MyEventClass = JSON.parse(localStorage.getItem('myGradeViewEvent'));
    this.is_interactive = my_gv_event.assignment_isInteractive;
    if ( !this.is_interactive ) {
      this.setSlides();
    } 
    this.curr_q_idx = +localStorage.getItem('currQuestionIdx');
    this.loadCurrQ();
    
    this.isRGREQ = my_gv_event.isActiveFlags.RGREQ;
  }

  /**
   * The method sets the The Question-GradeSheet panel data 
   *  using the value of curr_q_idx and my_marks property of the component.
   * Then method load the regrade request messages of the chatbox using the setChatboxMessages API
   * of the component 
   */
  loadCurrQ() {
    this.curr_q = this.my_marks.questions[this.curr_q_idx];
    if (this.is_interactive) {
      let index = -1;
      for (let i = 0; i < this.my_marks.responseData.length; i++ ) {
        if ( this.curr_q.question_id == this.my_marks.responseData[i].question_id) {
          index = i;
        }
      }

      let responseText = this.my_marks.responseData[index].reponseText;
      /*let html = this.curr_q.text;
      let div = document.createElement("div");
      div.innerHTML = html;
      let text = div.textContent || div.innerText || "";*/
      this.curr_q.optionText = atob(this.curr_q.text)  ;
      let solutionText = this.curr_q.options;
      if (this.curr_q.type == "TXT") {
        this.curr_q.responseText = responseText;
        /*let div = document.createElement("div");
        div.innerHTML = solutionText;
        let text = div.textContent || div.innerText || "";*/
        this.curr_q.solutionText = atob(solutionText);
      }
      else {
        this.optionsObject = JSON.parse(atob(this.curr_q.options));
        for ( let i = 0; i < this.optionsObject.length; i++ ) {
          /*let temp = this.optionsObject[i].optionText;
          let div = document.createElement("div");
          div.innerHTML = temp;
          let text = div.textContent || div.innerText || "";*/
          this.optionsObject[i].optionText =  this.optionsObject[i].optionText ;
  
          if ( this.optionsObject[i].is_Correct != "") {
            this.optionsObject[i].is_Correct = true;
          }
        }
        if ( responseText != null ) {
          responseText = responseText.replace(/\"/g,"");
        }
        if (this.curr_q.type == 'MCQRB') {
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
    // console.log(this.my_marks.questions[this.curr_q_idx].regrading_duty);
    this.rgd = this.my_marks.questions[this.curr_q_idx].regrading_duty;
    this.setChatboxMessages(this.curr_q.regrading_messages);
  }

  /**
   * The method moves the current question pointer to forward direction and load the grading details of the
   * next question in the queue using the loadCurrQ API of the component
   */
  onNext() {
    const len: number = this.my_marks.questions.length;
    this.curr_q_idx = (this.curr_q_idx + 1) % len;
    this.loadCurrQ();
  }

    /**
   * The method moves the current question pointer to backward direction and load the grading details of the
   * previous question in the queue using the loadCurrQ API of the component
   */
  onPrev() {
    const len: number = this.my_marks.questions.length;
    this.curr_q_idx = (len + this.curr_q_idx - 1) % len;
    this.loadCurrQ();
  }

    /**
   * The method sets the array of images for the carousel using the
   *  list of submission file pages
   * @param file_images The list of submission file pages
   */
  setSlides() {
    this.slides = [];
    const file_images: any[] = this.my_marks.submission_images;
    for (const key of Object.keys(file_images)) {
      this.addSlide(file_images[key]);
    }
    // this.activeSlideIndex = page_no - 1;
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
   * The new regrade request message
   */
  student_comment: string = '';

  /**
   * The method checks is there currently active RGREQ subevent is going on or not. 
   * If not going, then method shows the error notification and returns.
   * The method makes the server API request to submit the regrade request on the application server.
   * On receiving success response from the server, 
   * the method add the regrade request message to the chatbox using the sendMessage API of the 
   * component and redirects the user to the gradesheet manager page
   */
  addRegradeRequest() {
    // console.log(this.curr_q.response_id);
    // console.log(this.student_comment);

    if (!this.isRGREQ) {
      const err_msg = 'There is no grading event going on,please contact the instructor if you feel this is an error';
       this.toastr.danger(err_msg, 'NoEvent Error');
      return;
    }


    this.myEventsService.submitRegradeRequest(
      this.eventId, this.curr_q.subevent_id, this.curr_q.response_id, this.student_comment).subscribe(
        resData => {
          console.log(resData);
          this.sendMessage(this.student_comment, 'student', true);
          this.toastr.success('Regrade request submitted successfully', 'Success');
          this.gotoGradeViewManager();
        },
        error => {
          console.log(error);
          this.toastr.danger(error.error.detail, 'Error');
        },
      );
  }

    /**
   * The list of the communication messages corresponding to regrade requests.
   * 
   * Current use: the property use to list out all the messages in the
   *  regrade request chatbox in the view
   */
  messages: any[] = [];

  /**
   * The method sets the list of communication messages of regrade requests using the 
   * received server response data. The method sets the each message in the required format
   * by Nebular Chatbox component using the component API sendMessage
   * @param regrading_msg_data The server response containing the list of message structures,
   * Each structure contains the message text and sender of the message i.e. grader or student
   */
  setChatboxMessages(regrading_msg_data: any[]) {
    this.messages = [];
    for (let i = 0; i < regrading_msg_data.length; i++) {
      this.sendMessage(
        regrading_msg_data[i].message,
        regrading_msg_data[i].sender,
        regrading_msg_data[i].sender == 'student');
    }
  }

   /**
   * The method receive the message structure and set the message in the required
   * structure format by Nebular Chatbox component. After formatting the message, method
   * add it in the message queue represented by the component property messages
   * @param message The message text
   * @param userName The sender of the message, used to display in the chatbox
   * @param reply The boolean flag representing whether the message is sent by the student or not
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
   * The method redirects the user to the GradeSheet manager of the event
   */
  gotoGradeViewManager() {
    // this.router.navigate(['/pages', 'myevents', 'gradeView']);
    this.pageRouter.gotoGradeViewManager();
  }

}
