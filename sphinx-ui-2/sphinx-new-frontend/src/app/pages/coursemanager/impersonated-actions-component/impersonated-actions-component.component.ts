import { Component, OnInit } from '@angular/core';
import { MyEventsService } from "../../myevents/myevents.service";
import { MyEventClass, QuestionSet, GroupMember, MySubmissionGroup, MyQuestion } from '../../myevents/myevents.model';
import { AssignmentManagerService } from '../../assignmentmanager/assignmentmanager.service';
import { NbIconLibraries, NbThemeService, NbToastrService } from '@nebular/theme';
import { saveAs } from 'file-saver';
import { PageRouterService } from '../../page-router.service';
import { Assignment } from '../../assignmentmanager/assignmentmanager.model';
import { Subscription } from 'rxjs';
import { RoasterService } from '../roaster/roaster.service';

@Component({
  selector: 'impersonated-actions-component',
  templateUrl: './impersonated-actions-component.component.html',
  styleUrls: ['./impersonated-actions-component.component.scss']
})
export class ImpersonatedActionsComponentComponent implements OnInit {

  useridToImpersonate: string = "";
  eventidToImpersonate: string = "";
  my_events: MyEventClass[];
  allowed_events: MyEventClass[] = [];
  showImpersonatedWindow: boolean = false;
  enrollments: any;
  userInputValue: string;

  constructor(
    public myEventsService: MyEventsService,
    public assignManagerService: AssignmentManagerService,
    private toastr: NbToastrService,
    private pageRouter: PageRouterService,
    public iconsLibrary: NbIconLibraries,
    private themeService: NbThemeService,
    public roasterService: RoasterService,
  ) { 
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
    iconsLibrary.registerFontPack('fa', { iconClassPrefix: 'fa' });
   }

  ngOnInit() {
    /**
      * 1. Fetch the respective submission of the user
      * 2. Display Submission
      * 3. Let instructor resubmit 
      * 4. Show student instructor's submitted response
        * 5. Bypass the timeline for SUPLOAD while instructor is submitting. Allow only Impersonated Role.
        * 6. All the impersonated URLS must be done done __ URLs. 
        * 7. Maintain table entries ( Created by, Updated By ) when Impersonated actions takes place
    */
     this.roasterService.fetchEnrollments().subscribe(resData => {
      
      this.enrollments = resData.enrollments;
    });
  }

  gotToMainView() {
    this.showImpersonatedWindow = false;
  }

  gotoImpersonatedScreen() {

    this.showImpersonatedWindow = true;
   
    this.useridToImpersonate =  (<HTMLInputElement>document.getElementById("userid")).value;
    if ( this.useridToImpersonate == "" ) {
      this.showImpersonatedWindow = false;
      this.toastr.danger('Please enter user id to impersonate', 'Error');
      return;
    }
    for ( let i = 0; i < this.enrollments.length; i++) {
      if ( this.enrollments[i].user.username == this.useridToImpersonate ) {
        this.useridToImpersonate = this.enrollments[i].id;
        this.userInputValue = this.enrollments[i].user.first_name + " " + this.enrollments[i].user.last_name;
        break;
      }
    }
    this.fetchEventDetails();
  }

    fetchEventDetails() {
      this.myEventsService.fetchMyEvents().subscribe(
        resData => {
          const tempData: MyEventClass[] = JSON.parse(localStorage.getItem('my_events'));
          this.my_events = tempData;
          for (let i = 0; i < this.my_events.length; i++) {
            if ( this.my_events[i].assignment_isInteractive ) {
              continue;
            }
            else {
              this.myEventsService.fetchQuestionSets(this.my_events[i]).subscribe(
                resData1 => {
                  const responseData: any = resData1;
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
       
          }
          this.allowed_events = [];
          for ( let i = 0; i < this.my_events.length; i++ ) {
            if ( !this.my_events[i].assignment_isInteractive ) {
              this.allowed_events.push(this.my_events[i]);
            }
          } 
        },
        error => {
          console.log(error);
        },
      );

  
      localStorage.setItem('my_events', JSON.stringify(this.my_events));
    }


    getQuestionFile(eventIdx: number, qsetIdx: number) {
      this.downloadFile(this.my_events[eventIdx].questionSets[qsetIdx].question_file,
        this.my_events[eventIdx].questionSets[qsetIdx].question_name);
    }
  

    getSupplementaryFile(eventIdx: number, qsetIdx: number) {
      this.downloadFile(this.my_events[eventIdx].questionSets[qsetIdx].supplementary_file,
        this.my_events[eventIdx].questionSets[qsetIdx].supplementary_name);
    }
  

    saveToFileSystem(data: any, fileType: string) {
      const filename = data.original_file_name;
      const blob = new Blob([data.main_file], { type: fileType });
      saveAs(blob, filename);
    }

    getSolutionFile(eventIdx: number, qsetIdx: number) {
        this.downloadFile(this.my_events[eventIdx].questionSets[qsetIdx].solution_file,
        this.my_events[eventIdx].questionSets[qsetIdx].solution_name);
    }
  
  

    downloadFile(file: any, filename: any) {
      const linkSource = 'data:application/pdf;base64,' + file;
      const link = document.createElement('a');
      link.href = linkSource;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
      this.toastr.success('File downloaded successfully', 'Success');
    }

    gotoSubmissionManager(idx: number) {
      localStorage.setItem('mySubmissionEvent', JSON.stringify(this.allowed_events[idx]));
      let currentEvent:MyEventClass = null; 
      currentEvent = this.allowed_events[idx];
      localStorage.setItem('currentEvent', JSON.stringify(currentEvent));
      localStorage.setItem('isImpersonated', JSON.stringify(true));
      localStorage.setItem('impersonatedUserId', this.useridToImpersonate);
      this.pageRouter.gotoSubmissionManager();
    }
}

