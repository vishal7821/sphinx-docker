import { Component, OnInit } from '@angular/core';
import { McqcbResponseFormComponent } from "../mcqcb-response-form/mcqcb-response-form.component";
import { McqrbResponseFormComponent } from "../mcqrb-response-form/mcqrb-response-form.component";
import { MyEventClass, MyQuestion } from '../myevents.model';
import { MyEventsService } from "../myevents.service";
import { QuestionSet,GroupMember, MySubmissionGroup, SupplementaryFile, MySubEvent } from '../myevents.model';
import { NbToastrService, NbIconLibraries, NbWindowService } from '@nebular/theme';
import { McqcbResponseForm } from '../mcqcb-response-form/mcqcb-response-form.model';
import { McqrbResponseForm } from '../mcqrb-response-form/mcqrb-response-form.model';
import { InteractiveResponseHelpComponent } from "./interactive-response-help/interactive-response-help.component";

/**
 * SphinX provides Interactive and Non Interactive mode of assignments and their submission through the system. 
 * The interactive mode of assignments allows student to record their response question by question in an active way.
 * Depending upon question type in an Interactive Mode, student can select the correct options or write answer in the text input. 
 * On clicking Submit/Edit button for an Interactive Assignment, if student submission event is active for the student, 
 * Interactive Response Manager Component gets triggered and Student’s Response View gets shown to the student.
 */
@Component({
  selector: 'interactive-response-manager',
  templateUrl: './interactive-response-manager.component.html',
  styleUrls: ['./interactive-response-manager.component.scss']
})
export class InteractiveResponseManagerComponent implements OnInit {
  loadComponent = McqcbResponseFormComponent;
  loadRBComponent = McqrbResponseFormComponent;

  isMCQRBQuestionSelected = false;
  isMCQCBQuestionSelected = false;
  isTextQuestionSelected = false;
  isNextDisabled = false;
  isPrevDisabled = true;
  questionTypeString = '';

  my_events: MyEventClass[];
  mySubmissionEvent: MyEventClass = null;
  currentEvent: MyEventClass = null;
  questionsData: MyQuestion[];
  currentQuestion: MyQuestion = null;
  currentQuestionIndex: number = 0;
  isSupload: boolean = false;
  myQuestions: MyQuestion[] = [];
  mcqcbdataarray: any[];
  mcqrbdataarray: any[];
  dataarray: any[];
  username:any;
  htmlEntity: string;
  showQuestionPaper: boolean = true;
  



  constructor(
    public myEventsService: MyEventsService,
    private windowService: NbWindowService,
    public iconsLibrary: NbIconLibraries,
    private toastr: NbToastrService,
  ) { 
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
    iconsLibrary.registerFontPack('fa', { iconClassPrefix: 'fa' });
  }
  /**
   * Component lifecycle hook method which saves the user related data, event related data, current question and
   * submission event related data from local storage to the component variables.
   * The method onload compiles all the questions in the question set in a component variable.
   * The method makes a api call to fetch the response made to the current question and loads the
   * question data, options and student's response to the current question.
   * The method then make a api call to the server to fetch the student's submission to all the questions
   * present in the question set and set the color for the question palette.
   */
  ngOnInit() {
    let userdata = JSON.parse(localStorage.getItem('user'));
    this.username = userdata.firstname;
    this.currentEvent = JSON.parse(localStorage.getItem('currentEvent'));
    this.questionsData = this.currentEvent.questionSets[0].questions;
    this.currentQuestion = this.questionsData[0];  
    this.mySubmissionEvent = JSON.parse(localStorage.getItem('mySubmissionEvent'));
    this.isSupload = this.mySubmissionEvent.isActiveFlags.SUPLOAD;
    this.mySubmissionEvent.isNACReq = false;
    this.mySubmissionEvent.isNACVerified = true;
    this.mySubmissionEvent.isSGCreated = false;
    this.mySubmissionEvent.isQsetSelected = false;
    // Uncomment Following to decide submission groups
    // this.fetchMySubmissionGroup();
    this.mySubmissionEvent.sgrp_form.questionSets = this.mySubmissionEvent.questionSets;
    this.downloadQuestions();
    this.setQuestionPallete(this.currentQuestionIndex);
    this.setQuestionPalleteColors();
  }

  /**
   * This method takes the user's submission for the current question and make a call to sever to save/record student's submission in the 
   * application's database. After saving the response of the user to the application database, the method 
   * loads the previous question. 
   */
  submitandFetchPrevQuestion() {
    this.submitResponse();
    this.fetchPreviousQuestion();
  }

  /**
   * This method takes the user's submission for the current question and make a call to sever to save/record student's submission in the 
   * application's database. After saving the response of the user to the application database, the method 
   * loads the next question. 
   */
  submitandFetchNextQuestion() {  
    this.submitResponse();
    this.fetchNextQuestion(); 
  }

  /**
   * The method on click trigger a view to the Interactive Response Help Component and displays the
   * general instructions to the user.
   */
  showHelpMenu() {
    this.windowService.open(InteractiveResponseHelpComponent, { title: `General Instructions For The Test` });
    return true;
  }

  /**
   * The method compiles all the question of the question set in a HTML file.
   */
  showPaper() {
    if (this.showQuestionPaper == true) {
      this.showQuestionPaper = false;
    }
    else {
      this.showQuestionPaper = true;
      this.downloadQuestions();
    }
  }

  /**
   * The method takes the user's response and makes a api call to a server to record the student's 
   * response. It also updates the color code of the selected question based on the student's response.
   */
  submitResponse() {
    let response = '';
    if ( this.currentQuestion.type == 'TXT' ) {
      response = (<HTMLInputElement>document.getElementById("TXTAnswerPane")).value;
    }
    else if ( this.currentQuestion.type == 'MCQCB') {
      response = this.getMCQCBResponseData();
    }
    else if ( this.currentQuestion.type == 'MCQRB' ) {
      response = this.getMCQRBResponseData();
    }
    let responsedummy = response.trim();
    if ( responsedummy == '' || responsedummy == '-1') {
      if ( this.currentQuestion.type == 'TXT' ) {
        response = responsedummy;
      }
      let currentQuestion = this.currentQuestionIndex.toString();
      (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[currentQuestion]).setAttribute('style','background-color:white;color:black;');
    }
    else {
      let currentQuestion = this.currentQuestionIndex.toString();
      (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[currentQuestion]).setAttribute('style','background-color:green');
    }
    this.myEventsService.setResponsePagination(this.currentEvent.main_id, this.currentQuestion.main_id,response).subscribe(
      resData => {},
      error => {
        console.log('Could Not Save Data..', error);
      },
    );
  }

  /**
   * The method fetches next question from the question set to the user and updates the view with
   * question details of the next question.
   */
  fetchNextQuestion() {
    this.isPrevDisabled = false;
    this.currentQuestionIndex++;
    this.setQuestionPallete(this.currentQuestionIndex);
    if ( this.questionsData.length - 1 == this.currentQuestionIndex ) {
      this.isNextDisabled = true;
    }
    else {
      this.isNextDisabled = false;
    }
  }
  /**
   * The method fetches previous question from the question set to the user and updates the view with
   * question details of the previous question..
   */
  fetchPreviousQuestion() {
    this.isNextDisabled = false;
    this.currentQuestionIndex--;
    if ( 0 == this.currentQuestionIndex ) {
      this.isPrevDisabled = true;
    }
    else {
      this.isPrevDisabled = false;
    }
    this.setQuestionPallete(this.currentQuestionIndex);
  }

  /**
   * This method clears the response of the current question.
   */
  clearResponse() {
    let questionToBeCleared = this.currentQuestion;
    if ( questionToBeCleared.type == 'TXT' ) {
      (<HTMLInputElement>document.getElementById("TXTAnswerPane")).value = "";
    }
    else {
      let objectToSend = JSON.parse(atob(this.currentQuestion.options));
      if ( questionToBeCleared.type == 'MCQRB' ) {
        for ( let i = 0; i < objectToSend.length; i++ ) {
          objectToSend[i].is_Correct = "";
        }
        this.processAndGenerateMCQRBOptionsPane(objectToSend);
      }
      if ( questionToBeCleared.type == 'MCQCB' ) {
        for ( let i = 0; i < objectToSend.length; i++ ) {
          objectToSend[i].is_Correct = false;
        }
        this.processAndGenerateMCQCBOptionsPane(objectToSend);
      }
      
    }
  }


  /**
   *  
   * The method which subscribes to a Multiple Choice Multiple Correct Option row's data to generate the option row. If the question option contains data, 
   * the method will generate the row data otherwise it will generate an empty option row for Multiple Choice Multiple Correct
   * question. 
   * @param optionObject Option data
   */
  processAndGenerateMCQCBOptionsPane(optionObject) {
    this.mcqcbdataarray = []; 
    this.dataarray = []; 
    if ( optionObject.length > 0 ) {
      for ( let i = 0; i < optionObject.length; i++ ) {
        this.mcqcbdataarray.push(new McqcbResponseForm(optionObject[i].labelText,optionObject[i].optionText,optionObject[i].is_Correct));
        this.dataarray.push(new McqcbResponseForm(optionObject[i].labelText,optionObject[i].optionText,optionObject[i].is_Correct));
      }
    }
    else {
      this.mcqcbdataarray.push(new McqcbResponseForm("","",""));
      this.dataarray.push(new McqcbResponseForm("","",""));
    }  
  }

  /** 
   * The method which subscribes to a Multiple Choice Single Correct Option row's data to generate the option row. If the question option contains data, 
   * the method will generate the row data otherwise it will generate an empty option row for Multiple Choice Single Correct
   * question. 
   * @param objectToSend Option data
   */
  processAndGenerateMCQRBOptionsPane(objectToSend: any) {
    this.mcqrbdataarray = [];
    this.dataarray = [];  
    if ( objectToSend.length > 0 ) {
      for ( let i = 0; i < objectToSend.length; i++ ) {
          this.mcqrbdataarray.push(new McqrbResponseForm(objectToSend[i].labelText,objectToSend[i].optionText,objectToSend[i].is_Correct));
          this.dataarray.push(new McqrbResponseForm(objectToSend[i].labelText,objectToSend[i].optionText,objectToSend[i].is_Correct));
      } 
    }
    else {
      this.mcqrbdataarray.push(new McqrbResponseForm("","",""));
      this.dataarray.push(new McqrbResponseForm("","",""));
    }
  }
  /**
   * The method returns the response recorded by a user to a Multiple Choice Multiple Correct Question.
   */
  getMCQCBResponseData() {
    let responseString = "";
    for ( let i = 0; i < this.mcqcbdataarray.length; i++ ) {
      if ( this.mcqcbdataarray[i].is_Correct) {
        responseString = responseString + i;
      }
    }
    /*for ( let i = 0; i < this.dataarray.length; i++ ) {
      if ( this.dataarray[i].is_Correct) {
        responseString = responseString + i;
      }
    }*/
    return responseString; 
  } 

  /**
   * 
   The method returns the response recorded by a user to a Multiple Choice Single Correct Question.
   */
  getMCQRBResponseData(): string {
    let index = -1;
    for ( let i = 0; i < this.mcqrbdataarray.length; i++ ) {
        if ( this.mcqrbdataarray[i]['is_Correct'] == "0" ) {
          return this.mcqrbdataarray[i]['is_Correct'];
        }
        if ( this.mcqrbdataarray[i]['is_Correct'] != false ) {
          index = i;
        }
    }
    /*for ( let i = 0; i < this.dataarray.length; i++ ) {
      if ( this.dataarray[i]['is_Correct'] != false ) {
        index = i;
      }
    }*/
    return index.toString();
  }

  /**
   * This method selects the isCorrect radio button and deselects other isCorrect buttons.
   * @param index Index of the option which user has set as correct
   */
  setIsCorrect(index) { 
    this.mcqrbdataarray[index]['is_Correct'] = index.toString();
    for ( let i = 0; i < this.mcqrbdataarray.length; i++ ) {
      if ( i != index ) {
        this.mcqrbdataarray[i]['is_Correct'] = "";
      }
    }
  }

  /**
   * The method compiles all the questions in the question set in a component variable.
   */
  downloadQuestions() {
    let multilineString = "<br>";
    let line = "<hr style='border: 1px solid;border-radius: 1px;'>";
    let data = "<br><h1 style='text-align:center;'>"  + this.currentEvent.name + "</h1>" + line + multilineString;
    let optionsObject = null;

    for ( let i = 0; i < this.questionsData.length; i++ ) {
      data = data + 
        "<span> Question Title : </span>&nbsp;"  + (this.questionsData[i].title) + 
        "<span> Question Marks : </span>&nbsp;" + (this.questionsData[i].marks) +
        /*"<span> Question Type : </span>&nbsp;" + this.questionsData[i].type +*/
        multilineString + multilineString + "<p>Question Text : &nbsp;</p>" +  atob(this.questionsData[i].text) + multilineString ;
      
      if (this.questionsData[i].type != 'TXT') {
        data = data  + "<p>Options : &nbsp;</p>";      
        optionsObject = JSON.parse((atob(this.questionsData[i].options)));
        data = data + "<table style='table-layout: fixed ;width: 100%;'>";
        for ( let j = 0; j < optionsObject.length; j++ ) {
          data = data + "<tr>";
          data = data  + "<td style='display:inline-flex;'><p>(" + optionsObject[j].labelText + ")</p>&nbsp;&nbsp;" + 
                        optionsObject[j].optionText + "</td>"; 
          data = data + "</tr>";
        }
        data = data + "</table>";
      }
      else {
        data = data  + "<p>The response for this question must be provided in the input box.</p>"; 
      }
      data = data + line + multilineString;
    }
    data = btoa(data);
    this.htmlEntity = atob(data);
    
  }

  /**
   * The method parses the question paper data, creates an HTML file and downloads the file at user system.
   */
  downloadQuestionPaper() {
    let data = btoa(this.htmlEntity);
    const linkSource = 'data:application/octet-stream;charset=utf-8;base64,' + data;
    const link = document.createElement('a');
    link.href = linkSource;
    link.download = this.currentEvent.name + ".html";
    link.click();
    window.URL.revokeObjectURL(link.href);
  }

  /**
   * This method gets called on click of a button from the question palette and loads the view of the 
   * selected question.
   * @param index The index of the question button clicked from the question palette 
   */
  buttonClicked(index) {

    this.currentQuestionIndex = index;
    this.setQuestionPallete(this.currentQuestionIndex);
    if ( 0 == this.currentQuestionIndex ) {
      this.isPrevDisabled = true;
    }
    else {
      this.isPrevDisabled = false;
    }
    if ( this.questionsData.length - 1 == this.currentQuestionIndex ) {
      this.isNextDisabled = true;
    }
    else {
      this.isNextDisabled = false;
    }

    this.setQuestionPallete(this.currentQuestionIndex);

  }

  /**
   * The method makes a api call to the server to fetch the student's submission to all the questions
   * present in the question set and set the color for the question palette.
   */
  setQuestionPalleteColors() {
    
    this.myEventsService.getResponsePagination(this.mySubmissionEvent).subscribe(
      resData => {
        let questionResponseData = resData;
        let studentResponse = "";
        let currentQuestion = "";
        let index = "";
        let questionsData = this.questionsData;
        for ( let i = 0; i < questionsData.length; i++ ) {
          for ( let j = 0; j < questionResponseData.data.length ; j++  ) {
            if ( questionsData[i].main_id == questionResponseData.data[j].question_id ) {
              currentQuestion = j.toString();
              studentResponse = questionResponseData.data[j].reponseText;
              break;
            }
          }

          if (studentResponse.length != 0 ) {
            if ( questionsData[i].type == 'MCQRB' && studentResponse == '-1') {
              (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[i]).setAttribute('style','background-color:white;color:black;');                
            }
            else if (questionsData[i].type == 'MCQCB' && studentResponse == '-1') {
              (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[i]).setAttribute('style','background-color:white;color:black;');                
            }
            else if (questionsData[i].type == 'TXT' ) {
              studentResponse = studentResponse.trim();
              if( studentResponse.length == 0  ) {
                (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[i]).setAttribute('style','background-color:white;color:black;');  
              }
              else {
                (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[i]).setAttribute('style','background-color:green');  
              }
            }
            else {
              (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[i]).setAttribute('style','background-color:green');
            }            
          }
          else {
            (<HTMLInputElement><unknown>document.querySelectorAll('.dynamicButton')[i]).setAttribute('style','background-color:white;color:black;');              
          }
        }
      }, 
      error => {
        console.log('pagination error =', error);
      },
    );
  }
  
  /**
   * The method loads the question that user wishes to see.
   * The method makes an API call to a server to get the student's response and
   * loads the view according to question type and student's submitted response.
   * @param index Index of the question that will be displayed to the user
   */
  setQuestionPallete(index) {
    localStorage.setItem('currentIndexOfQuestion', JSON.stringify(index));
    this.currentQuestion = this.questionsData[index];
    this.currentQuestionIndex = index;
    if ( this.currentQuestion.type != undefined ) {
      if( this.currentQuestion.type === "TXT") {
        this.questionTypeString = "Text-Based Question";
        this.isMCQRBQuestionSelected = false;
        this.isTextQuestionSelected = true;
        this.isMCQCBQuestionSelected = false;
        document.getElementById("questionTextAltId").innerHTML = atob(this.currentQuestion.text);
        this.myEventsService.getResponsePagination(this.mySubmissionEvent).subscribe(
            resData => {
              let questionResponseData = resData;
              let studentResponse = "";
              for ( let i = 0; i < questionResponseData.data.length; i++ ) {
                if ( questionResponseData.data[i].question_id == this.currentQuestion.main_id ) {
                  studentResponse = questionResponseData.data[i].reponseText;
                }
              }
              if (studentResponse != "-1" ) {
                (<HTMLInputElement>document.getElementById("TXTAnswerPane")).value = studentResponse;
              }
              else {
                (<HTMLInputElement>document.getElementById("TXTAnswerPane")).value = "";
              }
            },
            error => {
              console.log('pagination error =', error);
            },
          );
      }
      else if( this.currentQuestion.type === "MCQRB") {
        this.questionTypeString = "Single Choice Correct Option";
        this.isMCQRBQuestionSelected = true;
        this.isTextQuestionSelected = false;
        this.isMCQCBQuestionSelected = false;
        document.getElementById("questionTextAltId").innerHTML = atob(this.currentQuestion.text);
        if ( this.currentQuestion.options && this.currentQuestion.options.length != 1 ) {
          this.myEventsService.getResponsePagination(this.mySubmissionEvent).subscribe(
            resData => {
              let questionResponseData = resData;
              let studentResponse = "";
              for ( let i = 0; i < questionResponseData.data.length; i++ ) {
                if ( questionResponseData.data[i].question_id == this.currentQuestion.main_id ) {
                  studentResponse = questionResponseData.data[i].reponseText;
                }
              }
              let objectToSend = JSON.parse(atob(this.currentQuestion.options));
              for ( let i = 0; i < objectToSend.length; i++ ) {
                objectToSend[i].is_Correct = "";
              }
              if ( studentResponse != null && studentResponse.length != 0 ) {
                studentResponse = studentResponse.replace(/\"/g,"");
              }
              if ( studentResponse != "" && studentResponse != "-1" ) {
                // debugger;
                // console.log("At line 243 : Value is " + studentResponse);
                objectToSend[studentResponse].is_Correct = studentResponse;
              }
              // this.myEventsService.communicateOptionDataMCQRB(objectToSend);
              this.processAndGenerateMCQRBOptionsPane(objectToSend);

            },
            error => {
              console.log('pagination error =', error);
            },
          );
        }
        else {
        }
      }
      else if( this.currentQuestion.type === "MCQCB") {
        this.questionTypeString = "Multiple Choice Correct Option";
        this.isMCQCBQuestionSelected = true;
        this.isTextQuestionSelected = false;
        this.isMCQRBQuestionSelected = false;
        document.getElementById("questionTextAltId").innerHTML = atob(this.currentQuestion.text);
        if ( this.currentQuestion.options && this.currentQuestion.options.length != 1 ) {
            this.myEventsService.getResponsePagination(this.mySubmissionEvent).subscribe(
              resData => {
              let questionResponseData = resData;
              let studentResponse = "";
              for ( let i = 0; i < questionResponseData.data.length; i++ ) {
                if ( questionResponseData.data[i].question_id == this.currentQuestion.main_id ) {
                  studentResponse = questionResponseData.data[i].reponseText;
                }
              }
              let objectToSend = JSON.parse(atob(this.currentQuestion.options));
              
              for ( let i = 0; i < objectToSend.length; i++ ) {
                objectToSend[i].is_Correct = "";
              }
              if ( studentResponse != null  && studentResponse.length != 0 ) {
                studentResponse = studentResponse.replace(/\"/g,"");
                let optionsCorrectArray = studentResponse.split('');
                if ( studentResponse != "" && studentResponse != "-1" ) {
                  for ( let i = 0; i < optionsCorrectArray.length; i++ ) {
                    objectToSend[optionsCorrectArray[i]].is_Correct = true;
                  }
                }
              }
              this.processAndGenerateMCQCBOptionsPane(objectToSend);
        
            },
            error => {
              console.log('pagination error =', error);
            },
          );
        }
        else {
        }
      }
      else {
        this.isMCQCBQuestionSelected = false;
        this.isTextQuestionSelected = false;
        this.isMCQRBQuestionSelected = false;
      }
    }
  }

  verifyNACForm() {
    this.myEventsService.verifyMyNAC(this.mySubmissionEvent).subscribe(
      resData => {
        if (resData.is_NAC_correct) {
          this.mySubmissionEvent.isNACVerified = true;
          this.mySubmissionEvent.isSGCreated = true;
          this.toastr.success('Access code Verified successfully', 'Success');
          this.mySubmissionEvent.submissionGroup.accessCodeSubmitted = this.mySubmissionEvent.sgrp_form.accessCodeSubmitted;
        } else {
          this.toastr.danger('Please submit correct Access code', 'Error');
        }

      },
      error => {
        this.toastr.danger(error.error.detail, 'Error');
      },
    );
  }


  submitCreateJoinForm(idx: number) {
    console.log(this.mySubmissionEvent.sgrp_form);
    if (this.mySubmissionEvent.sgrp_form.choice == '0') {
      this.myEventsService.createSubmissionGroup(this.mySubmissionEvent).subscribe(
        resData => {
          console.log(resData);

          this.fetchMySubmissionGroup();
          this.toastr.success('Submission Group created successfully', 'Success');
        },
        error => {
          console.log(error);
          if (error.error != null && error.error.detail != null)
            this.toastr.danger(error.error.detail, 'Error');
          else
            this.toastr.danger(error.error, 'Error');
        },
      );
    } else {
      if (this.isNumber(this.mySubmissionEvent.sgrp_form.sGroupID) == false) {
        this.toastr.danger('Please provide valid Submission Group ID', 'Error');
        return;
      }

      this.myEventsService.joinSubmissionGroup(this.mySubmissionEvent).subscribe(
        _resData => {
          // fetch submission group details
          this.fetchMySubmissionGroup();
          this.toastr.success('Submission Group joined successfully', 'Success');
        },
        error => {
          this.toastr.danger(error.error.detail, 'Error');
          console.log(error);
        },
      );
    }

  }

  isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0); }

  fetchMySubmissionGroup() {
    this.myEventsService.fetchMySubmissions(this.mySubmissionEvent).subscribe(
      resData3 => {
        const responseData: any = resData3;
        const groupMembers: GroupMember[] = [];

        for (let j = 0; j < responseData.users.length; j++) {
          const grpMember: GroupMember = new GroupMember(
            responseData.users[j].roll_no,
            responseData.users[j].first_name,
            responseData.users[j].last_name,
          );
          groupMembers.push(grpMember);
        }

        const sg: MySubmissionGroup = new MySubmissionGroup(
          responseData.submission_group.id,
          responseData.submission_group.choosen_question_set,
          responseData.submission_group.access_code_submitted,
          responseData.submission_group.is_late_submission,
          groupMembers,
        );

        this.mySubmissionEvent.color = responseData.params.COL;
        this.mySubmissionEvent.isNACReq = false;
        this.mySubmissionEvent.isNACVerified = true;
        this.mySubmissionEvent.sgs = responseData.params.SGS;
        this.mySubmissionEvent.qss = responseData.params.QSS;
        this.mySubmissionEvent.submissionGroup = sg;
        this.mySubmissionEvent.del = responseData.params.DEL;

        if (this.mySubmissionEvent.qss == 'FS' || this.mySubmissionEvent.submissionGroup.choosenQset != null) {
          this.mySubmissionEvent.isQsetSelected = true;
        }
        this.fetchSelectedQSet();
        this.mySubmissionEvent.isSGCreated = true;
        this.mySubmissionEvent.sgrp_form.isOpenSGroupForm = !this.mySubmissionEvent.sgrp_form.isOpenSGroupForm;

      },
      error3 => {
        this.toastr.danger(error3.error.detail, 'Error');
        console.log('fetch mySubmissions failed  and error is =' + error3);
      },
    );
  }

  fetchSelectedQSet() {
    this.myEventsService.fetchMySubmissions(this.mySubmissionEvent).subscribe(
      resData3 => {
        const responseData: any = resData3;
        this.mySubmissionEvent.submissionGroup.choosenQset = responseData.submission_group.choosen_question_set;
        // this.getActualQuestions('onload');
      },
      error3 => {
        console.log('fetch Submission info failed and error is =' + error3);
      },
    );

  }

  getActualQuestions(flag: string) {
    /*
    console.log(this.mySubmissionEvent);
    if (this.mySubmissionEvent.submissionGroup.choosenQset == null) {
      this.fetchMainSubmission(false);
      return false;
    }

    this.myQuestions = null;
    for(let i=0;i<this.mySubmissionEvent.questionSets.length;i++){
      if( +this.mySubmissionEvent.submissionGroup.choosenQset == this.mySubmissionEvent.questionSets[i].main_id ){
        this.myQuestions = this.mySubmissionEvent.questionSets[i].questions;
      }
    }
    if(this.myQuestions == null ){
      this.fetchMainSubmission(false);
    }else{
      if (flag == 'onload') {
        this.fetchMainSubmission(true);

      } 
      return true;
    }*/
  }

  fetchMainSubmission(isQsetPresent: boolean) {

    /*this.myEventsService.getMyMainSubmission(this.mySubmissionEvent.main_id).subscribe(
      resData => {
        console.log('submission present = ' + resData);
        console.log(resData);
        this.mainFile = new SupplementaryFile(resData.data.original_file_name, resData.data.upload_file);
        this.slides = [];
        this.sliderImages = [];
        const file_images: any = resData.data.file_images;
        let size = 0;
        for (const key of Object.keys(file_images)) {
          this.addSlide(file_images[key]);
          size++;
        }
        this.filename = resData.data.original_file_name;
        this.isMainSubmissionPresent = true;
        if (isQsetPresent) {
          this.fetchPagination(this.slides.length);
        }
      },
      error => {
        this.isMainSubmissionPresent = false;
        this.isOpenFileForm = true;
      },
    );*/

  }

}
