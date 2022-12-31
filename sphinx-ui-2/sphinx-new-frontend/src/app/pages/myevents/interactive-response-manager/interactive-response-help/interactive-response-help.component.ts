import { Component, OnInit } from '@angular/core';
import { McqcbResponseFormComponent } from "../../mcqcb-response-form/mcqcb-response-form.component";
import { McqrbResponseFormComponent } from "../../mcqrb-response-form/mcqrb-response-form.component";
import { MyEventClass, MyQuestion } from '../../myevents.model';
import { MyEventsService } from "../../myevents.service";
import { QuestionSet,GroupMember, MySubmissionGroup, SupplementaryFile, MySubEvent } from '../../myevents.model';
import { NbToastrService, NbIconLibraries, NbWindowService, NbWindowRef } from '@nebular/theme';
import { McqcbResponseForm } from '../../mcqcb-response-form/mcqcb-response-form.model';
import { McqrbResponseForm } from '../../mcqrb-response-form/mcqrb-response-form.model';
/**
 * Instructions Menu is present on the Header Menu of Student’s Submission view.  
 * When student clicks on the Instructions Menu, the Interactive Response Help component gets triggered. 
 * The component helps student to get accustomed to the user interface of the student submission view.
 * The instructions menu has ’General Instructions’, ’Navigating to a question’, ’Answering toa question’ and ’Instructor’s instructions’ about the Interactive Assignment.
 */
@Component({
  selector: 'interactive-response-help',
  templateUrl: './interactive-response-help.component.html',
  styleUrls: ['./interactive-response-help.component.scss']
})
export class InteractiveResponseHelpComponent implements OnInit {
  currentEvent: any;
  questionsData: any;
  currentQuestion: any;
  file: any;
  htmlObj: any;

  constructor(
    private windowRef: NbWindowRef,
  ) { }
  
  /**
   * Lifecycle hook method which saves current event, all questions data and current question
   * data in the component's variables.
   */
  ngOnInit() {
    this.currentEvent = JSON.parse(localStorage.getItem('currentEvent'));
    this.questionsData = this.currentEvent.questionSets[0].questions;
    this.currentQuestion = this.questionsData[0];  
  }
  /**
   * Close the Help Dialog Pane.
   */
  onSubmit() {
      this.close();
  }

  /**
   * Close the Help Dialog Pane.
   */
  close() {
    this.windowRef.close();
  }

  /**
   * The method compiles all the questions in the question set in a component variable.
   */
  downloadQuestions() {
    let multilineString = "<br>";
    let data = "-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------" + multilineString;
    let line = "-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------";
    let options = "";
    for ( let i = 0; i < this.questionsData.length; i++ ) {
      data = data + "Question Title : "  + (this.questionsData[i].title) + " " + "Question Marks : " + (this.questionsData[i].marks) + " Question Type : " + this.questionsData[i].type + multilineString + 
                  atob(this.questionsData[i].text) + multilineString ;
      let optionsObject = null;
      if (this.questionsData[i].type != 'TXT') {
        optionsObject = JSON.parse((atob(this.questionsData[i].options)));
        data = data + "<table style='border: 1px solid #999;'>" + "<thead><th style='border: 1px solid #999;'> Option Label </th><th style='border: 1px solid #999;'> Option Text </th>";
        for ( let j = 0; j < optionsObject.length; j++ ) {
          data = data + "<tr>" + "<td style='border: 1px solid #999;'>";
          data = data  + "(" + optionsObject[j].labelText + ")" + "</td>" + "<td style='border: 1px solid #999;'>" +  optionsObject[j].optionText + "</td>";
          data = data + "</tr>";
        }
        data = data + "</table>";
      }
      else {
        data = data + "Option Text: "  + atob(this.questionsData[i].options) + multilineString;
      }
      /*if (this.questionsData[i].type != 'TXT') {
        optionsObject = JSON.parse((atob(this.questionsData[i].options)));
        
        for ( let j = 0; j < optionsObject.length; j++ ) {
          data = data  + "(" + optionsObject[j].labelText + ")" + optionsObject[j].optionText;
        }
      }
      else {
        data = data + "Option Text: "  + atob(this.questionsData[i].options) + multilineString;
      }*/

      data = data + line + multilineString;
      
   

    }
    data = btoa(data);
    // this.htmlObj = data;
    // alert(this.htmlObj);
    const linkSource = 'data:application/octet-stream;charset=utf-8;base64,' + data;
    const link = document.createElement('a');
    link.href = linkSource;
    link.download = this.currentEvent.name + ".html";
    link.click();
    window.URL.revokeObjectURL(link.href);
  }


}
