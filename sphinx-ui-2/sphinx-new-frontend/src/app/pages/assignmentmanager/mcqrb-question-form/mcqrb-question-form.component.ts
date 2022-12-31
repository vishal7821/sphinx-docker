import { Component, OnInit } from '@angular/core';
import { McqrbQuestionForm } from "./mcqrb-question-form.model";
import { AssignmentManagerService } from '../assignmentmanager.service';
import { NbIconLibraries, NbInputDirective, NbToastrService } from '@nebular/theme';

/**
 * When user selects a question type as 'MCQRB' or loads a saved 'MCQRB' question, the view triggers
 * MCQRB Question Form Component. This component shares model view with Mcqrb Question Form model.
 * The component helps to generate Multiple Choice Single Correct Option row for user. 
 * The Multiple Choice Single Correct Option row contains a rich text editor for option text, textbox for option label,
 * a is_correct radio button and a remove button to remove the row.
 */

@Component({
  selector: 'mcqrb-question-form',
  templateUrl: './mcqrb-question-form.component.html',
  styleUrls: ['./mcqrb-question-form.component.scss']
})
export class McqrbQuestionFormComponent implements OnInit {
  mcqrbquestionform = new McqrbQuestionForm("","","");
  dataarray=[];
  optionDataMCQRB : any;
  constructor(private assignManagerService: AssignmentManagerService,
    private toastr: NbToastrService ) { }

  /**
   * Component lifecycle hook method which subscribes to a Multiple Choice Single Correct
   * Option row's data to generate the option row. If the question option contains data, the 
   * method will generate the row data otherwise it will generate an empty option row for Multiple Choice Single Correct
   * question.
  */  

  ngOnInit() {
    this.mcqrbquestionform = new McqrbQuestionForm("","","");
    this.dataarray.push(this.mcqrbquestionform);
    

    this.assignManagerService.optionDataMCQRB.subscribe(obj => {
      this.dataarray = [];
      const questions_data = JSON.parse(localStorage.getItem('selectedQuestion'));
      if (questions_data.options ) {
        let optionsCount = JSON.parse(atob(questions_data.options)).length;
        for ( let i = 0; i < optionsCount; i++ ) {
          this.dataarray.push(new McqrbQuestionForm(obj[i].labelText,obj[i].optionText,obj[i].is_Correct));
          // console.log("i is" + i + " " + "value is : " +  obj[i].is_Correct);
        }  
      }
      else {
        this.dataarray.push(new McqrbQuestionForm("","",""));
      }

    });

  }

  /**
   * This method adds a row to the Multiple Choice Multiple Correct options object.
   */
  addOption() {
    this.mcqrbquestionform = new McqrbQuestionForm("","","");
    this.dataarray.push(this.mcqrbquestionform);
  }
  
  /**
   * This method checks for validations of :
   *  - Question Option Text must not be empty.
   *  - Selected question must have only one valid options.
   *  - Option Labels/Text must not be empty.
   *  - Two Options should not have similar Option Labels.
   *  - Two Options should not have similar Option Text.
   * @returns True if form row is valid else shows an error message and returns false. 
   */
  checkForValidOptionsAndQuestionText() {
    const tinyMCEEditors = tinymce.editors;
    for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
      if ( tinyMCEEditors[i].settings.body_class == "mcqrboptionseditor" ) {
        let questionText = tinyMCEEditors[i].getContent(); 
        if (tinyMCEEditors[i].getContent().indexOf("img") == -1 ) {
          if ( tinyMCEEditors[i].getContent({format:'text'}).trim().replace(/\s/g,'').length == 0 ) {
            this.toastr.danger('Question Option Text must not be empty.', 'Error');
            return;
          }
        }
      }

      if ( tinyMCEEditors[i].settings.selector == ".mcqrb_questionText" ) {
        if (tinyMCEEditors[i].getContent().indexOf("img") == -1 ) {
          if ( tinyMCEEditors[i].getContent({format:'text'}).trim().replace(/\s/g,'').length == 0 ) {
            this.toastr.danger('Question Text must not be empty.', 'Error');
            return;
          }
        }
      }
    }


    if ( this.dataarray.length <= 1 ) {
      this.toastr.danger('Selected question must have at least two valid options.','Error');
      return false;
    }
    let labelTextValues = new Set();
    let optionTextValues = new Set();
    let isCorrectCount = 0;
    let isCorrectNotSelectedCount = 0;
    for ( var i = 0; i < this.dataarray.length; i++ ) {
      let valueToAdd = this.dataarray[i].labelText.toLowerCase().replace(/\s/g,'');
      let optionToAdd = this.dataarray[i].optionText.toLowerCase().replace(/\s/g,'');
      let isCorrectValue = this.dataarray[i].is_Correct.toString().replace(/\s/g,'');
      if ( isCorrectValue.length >= 1 ) {
        isCorrectCount = isCorrectCount + 1;
      }
      if (isCorrectValue == "false" || isCorrectValue == "" ) {
        isCorrectNotSelectedCount = isCorrectNotSelectedCount + 1;
      }
      if ( valueToAdd.length == 0 || optionToAdd.length == 0 ) {
        this.toastr.danger('Option Labels/Text must not be empty.','Error');
        return false;
      }
      labelTextValues.add(valueToAdd);
      optionTextValues.add(optionToAdd);
    }
    if ( isCorrectCount == 0 ) {
      this.toastr.danger('At least one correct option must be selected','Error');
      return false;
    }
    if ( isCorrectNotSelectedCount == this.dataarray.length ) {
      this.toastr.danger('At least one correct option must be selected','Error');
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
   * This method checks validation for the form row of Multiple Choice Single Correct question.
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
    for ( let i = 0; i < tinyMCEEditors.length; i++ ) {
      if ( tinyMCEEditors[i].settings.selector == ".mcqrb_questionText" ) {
        data['text'] = btoa(tinyMCEEditors[i].getContent());
        localStorage.setItem("Question_Text", btoa(tinyMCEEditors[i].getContent()));
      }
    }
    data['options'] = btoa(JSON.stringify(this.dataarray));
    localStorage.setItem("Question_Option", btoa(JSON.stringify(this.dataarray)));
    console.log(this.dataarray);
    data['title'] = questions_data.title;
    data['marks'] = questions_data.marks;
    data['difficulty_level'] = questions_data.difficulty_level;
    data['is_autograded'] = questions_data.is_autograded;
    data['parent'] = questions_data.parent;
    data['topics'] = questions_data.topics;
    data['type'] = 'MCQRB';    

    this.assignManagerService.editQuestion(data,questions_data.id).subscribe(
      resData => {
        for ( let i = 0; i < tinyMCEEditors.length; i++ ) {
          if ( tinyMCEEditors[i].settings.selector == ".mcqrb_questionText" ) {
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
   * @returns False if there are only two rows.
   */
  removeOption(index){
    if ( this.dataarray.length == 2 ) {
      this.toastr.warning('Selected question must have at least two valid options.','Warning');
      return;
    }
    this.dataarray.splice(index,1);
  }

  /**
   * This method selects the isCorrect radio button and deselects other isCorrect buttons.
   * @param index Index of the option which user has set as correct
   */
  setIsCorrect(index) { 
    console.log(index);
    
    this.dataarray[index]['is_Correct'] = true;
    for ( let i = 0; i < this.dataarray.length; i++ ) {
      if ( i != index ) {
        this.dataarray[i]['is_Correct'] = false;
      }
    }
    return this.dataarray;
  }

}