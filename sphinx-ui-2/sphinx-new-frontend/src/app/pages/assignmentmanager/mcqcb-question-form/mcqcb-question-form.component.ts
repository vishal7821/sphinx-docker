import { Component, OnInit } from '@angular/core';
import { McqcbQuestionForm } from "./mcqcb-question-form.model";
import { AssignmentManagerService } from '../assignmentmanager.service';
import { NbIconLibraries, NbInputDirective, NbToastrService, NbWindowService } from '@nebular/theme';
/**
 * When user selects a question type as 'MCQCB' or loads a saved 'MCQCB' question, the view triggers
 * MCQCB Question Form Component. This component shares model view with Mcqcb Question Form model.
 * The component helps to generate Multiple Choice Multiple Correct Option row for user. 
 * The Multiple Choice Multiple Correct Option row contains a rich text editor for option text, textbox for option label,
 * a is_correct checkbox button and a remove button to remove the row.
 */
@Component({
  selector: 'mcqcb-question-form',
  templateUrl: './mcqcb-question-form.component.html',
  styleUrls: ['./mcqcb-question-form.component.scss']
})
export class McqcbQuestionFormComponent implements OnInit {

  mcqcbquestionform = new McqcbQuestionForm("","","");
  dataarray=[];
  optionsData : any;
  constructor( private assignManagerService: AssignmentManagerService,
    private toastr: NbToastrService ) { }

  /**
   * Component lifecycle hook method which subscribes to a Multiple Choice Multiple Correct
   * Option row's data to generate the option row. If the question option contains data, the 
   * method will generate the row data otherwise it will generate an empty option row for Multiple Choice Multiple Correct
   * question.
   */  
  ngOnInit() {
    
    this.mcqcbquestionform = new McqcbQuestionForm("","","");
    this.dataarray.push(this.mcqcbquestionform);

    this.assignManagerService.optionData.subscribe(obj => {
      this.dataarray = [];  
      
      const questions_data = JSON.parse(localStorage.getItem('selectedQuestion'));
      if ( questions_data.options ) {
        let optionsCount = JSON.parse(atob(questions_data.options)).length;
      for ( let i = 0; i < optionsCount; i++ ) {
        this.dataarray.push(new McqcbQuestionForm(obj[i].labelText,obj[i].optionText,obj[i].is_Correct));
      }
      }
      else {
        this.dataarray.push(new McqcbQuestionForm("","",""));
      }
      
    });

  }

  /**
   * This method adds a row to the Multiple Choice Multiple Correct options object.
   */
  addOption() {
    this.mcqcbquestionform = new McqcbQuestionForm("","","");
    this.dataarray.push(this.mcqcbquestionform);
  }

  /**
   * This method checks for validations of :
   *  - Question Option Text must not be empty.
   *  - Selected question must have at least one valid options.
   *  - Option Labels/Text must not be empty.
   *  - Add "None of the above" option if you do not wish to select any correct option.
   *  - Two Options should not have similar Option Labels.
   *  - Two Options should not have similar Option Text.
   * @returns True if form row is valid else shows an error message and returns false. 
   */
  checkForValidOptionsAndQuestionText() {

    const tinyMCEEditors = tinymce.editors;
    for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
      if ( tinyMCEEditors[i].settings.body_class == "mcqcboptionseditor" ) {
        if (tinyMCEEditors[i].getContent().indexOf("img") == -1 ) {
          if ( tinyMCEEditors[i].getContent({format:'text'}).trim().replace(/\s/g,'').length == 0 ) {
            this.toastr.danger('Question Option Text must not be empty.', 'Error');
            return;
          }
        }
      }

      if ( tinyMCEEditors[i].settings.selector == ".mcqcb_questionText" ) {
        if (tinyMCEEditors[i].getContent().indexOf("img") == -1 ) {
          if ( tinyMCEEditors[i].getContent({format:'text'}).trim().replace(/\s/g,'').length == 0 ) {
            this.toastr.danger('Question Text must not be empty.', 'Error');
            return;
          }
        }
      }
      
    }

    if ( this.dataarray.length <= 0 ) {
      this.toastr.danger('Selected question must have at least one valid options.','Error');
      return false;
    }
    let labelTextValues = new Set();
    let optionTextValues = new Set();
    let isCorrectCount = 0;
    for ( var i = 0; i < this.dataarray.length; i++ ) {
      let valueToAdd = this.dataarray[i].labelText.toLowerCase().replace(/\s/g,'');
      let optionToAdd = this.dataarray[i].optionText.toLowerCase().replace(/\s/g,'');
      let isCorrectValue = this.dataarray[i].is_Correct;
      if ( isCorrectValue != true ) {
        isCorrectCount = isCorrectCount + 1;
      }
      if ( valueToAdd.length == 0 || optionToAdd.length == 0 ) {
        this.toastr.danger('Option Labels/Text must not be empty.','Error');
        return false;
      }
      labelTextValues.add(valueToAdd);
      optionTextValues.add(optionToAdd);
    }
    if ( isCorrectCount == this.dataarray.length ) {
      console.log(btoa(JSON.stringify(this.dataarray)));
      this.toastr.danger('Add "None of the above" option if you do not wish to select any correct option.','Error');
      return false;
    }
    if ( labelTextValues.size != this.dataarray.length ) {
      this.toastr.danger('Two Options should not have similar Option Labels.','Error');
      return false;
    } 
    if ( optionTextValues.size != this.dataarray.length ) {
      this.toastr.danger('Two Options should not have similar Option Text.','Error');
      return false;
    }
    return true;
  }

  /**
   * This method checks validation for the form row of Multiple Choice Multiple Correct question.
   * If found valid, the method converts question text and options into Base64 format and submits the question data
   * of title, marks, difficulty_level, parent, topics and type to the server api to save the selected question data to the 
   * application database.
   */
  onsubmit() {
    if ( !this.checkForValidOptionsAndQuestionText() ) {
      return;
    }
    const questions_data = JSON.parse(localStorage.getItem('selectedQuestion'));
    const tinyMCEEditors = tinymce.editors;
    const data = {};
    for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
      if ( tinyMCEEditors[i].settings.selector == ".mcqcb_questionText" ) {
        data['text'] = btoa(tinyMCEEditors[i].getContent());
        localStorage.setItem("Question_Text", btoa(tinyMCEEditors[i].getContent()));
      }
    }
    data['options'] = btoa(JSON.stringify(this.dataarray));
    
    localStorage.setItem("Question_Option", btoa(JSON.stringify(this.dataarray)));
    data['title'] = questions_data.title;
    data['marks'] = questions_data.marks;
    data['difficulty_level'] = questions_data.difficulty_level;
    data['is_autograded'] = questions_data.is_autograded;
    data['parent'] = questions_data.parent;
    data['topics'] = questions_data.topics;
    data['type'] = 'MCQCB';    

    this.assignManagerService.editQuestion(data,questions_data.id).subscribe(
      resData => {
        for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
          if ( tinyMCEEditors[i].settings.selector == ".mcqcb_questionText" ) {
             tinyMCEEditors[i].setContent(atob(resData.question.text));
          }
        }
        this.toastr.success('Question updated successfully.','Success');
      },
      error => {
        console.log(error);
        this.toastr.danger('Question updation failed with.' + error,'Error');
      },
    );
  }


  /**
   * This method removes the selected row.
   * @param index The index of the row that needs to be deleted.
   * @returns False if there is only single row.
   */
  removeOption(index){
    console.log("DataArray Length: " + this.dataarray.length);
    if ( this.dataarray.length == 1 ) {
      this.toastr.danger('Selected question must have at least one valid option.','Error');
      return;
    }
    this.dataarray.splice(index,1);
  }

}