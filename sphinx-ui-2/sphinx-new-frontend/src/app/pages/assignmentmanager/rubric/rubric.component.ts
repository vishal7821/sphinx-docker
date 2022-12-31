
import { Component, OnInit, ViewChild } from '@angular/core';
import { AssignmentManagerService } from '../assignmentmanager.service';
import { NbIconLibraries, NbToastrService } from '@nebular/theme';
import { LocalDataSource } from 'ng2-smart-table';
import { TreeModel, NodeEvent, Ng2TreeSettings } from 'ng2-tree';
import { Question } from '../assignmentmanager.model';


/**
  * Rubric Manager component provides the capabilities to perform all Rubric related operations in the Course.
 * 
 * 
 * Rubric Manager view mainly divides into two parts Question File view and Rubric manager view.
 * Question file view display the main question set file with area select box for each page of file.
 * rubric manager view shows Question with some details and corresponding list of rubrics in Smart table.
 * Smart table provides features to add/edit/delete rubric, searching, sorting and pagination.
 * View stores list of questions in a queue , such that user can navigate through all questions using arrow buttons provided at the top of view
 * 
 * Rubric manager component contains properties and method API's to perform frontend application logic for Rubric management of corresponding Question set.
 * method API's of component provide functionalities like fetch Rubric data, add/edit/delete rubric to Question set.
 * 
 * The Assignment manager Service provides necessary API methods which does all server communication to perform necessary modifications for Rubrics at application database.  
 * 
 */
@Component({
  selector: 'rubric',
  templateUrl: './rubric.component.html',
  styleUrls: ['./rubric.component.scss'],
})
export class RubricComponent implements OnInit {


/**
 * The object contains customized necessary Table component configuration required to display rubric smart table in view.
 *  The object contain properties like,
 * 
 * 1.Columns: Table column settings
 * 
 * 2.add: Add action settings
 * 
 * createConfirm: Event triggered once a Create button clicked, this event is used to trigger call to onCreateConfirm method  
 * 
 * 3.edit: Edit action settings
 * 
 * ConfirmSave: Event triggered once a Edit button clicked, this event is used to trigger call to onEditConfirm method  
 *
 * 4.delete: Delete action settings
 * 
 * ConfirmDelete: Event triggered once a Delete button clicked, this event is used to trigger call to onEditConfirm method  
 
 */
  settings = {
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmCreate: true,
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmSave: true,
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      // id: {
      //   title: 'ID',
      //   type: 'number',
      // },
      text: {
        title: 'Text',
        type: 'string',
        editor:
        {
          type: 'textarea',
        },
      },
      marks: {
        title: 'Marks',
        type: 'number',
        width: '20%',
      },
    },
  };

  /**
   * Rubric Table data, array of Rubric model objects, where each object contains id, text, marks
   */
  source: LocalDataSource = new LocalDataSource();



/**
 * Array consist the pages of Question set file
 */
  slides: { image: string }[] = [];

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
   * Current page index of Question set Image carousel
   */
  activeSlideIndex = 0;
  /**
   * slide show tile interval of Question set Image carousel
   */
  myInterval = 0;
   /**
   * Boolean flag which presents whether Question set main file is present or not at application server
   */
  // isFilepresent: boolean = false;

  /**
   * Array object contains all actual questions corresponding to Question Set
   */
  actual_questions: Question[]= [];

  /**
   * Boolean flag representing whether questions are present in Question Set or not
   */
  q_present= false;
  /**
   * Boolean flag which presents whether Question set main file is present or not at application server
   */
  q_file_present = false;
  /**
   * current Question object displayed on View
   */
  current_q: Question;
  /**
   * current Question index corresponding to Question displayed on View
   */
  q_index= 0;
  selectedAssignment;
  optionsObject: any;

  
  /**
   * Component constructor initializes the service object of assignManagerService, nebular iconsLibrary, nebular ToastrService required for component API methods
   * @param iconsLibrary object of Nebular Icons Library
   * @param assignManagerService object of Assignment manager service
   * @param toastr object of Nebular Toastr Service
   */
  constructor(iconsLibrary: NbIconLibraries, private assignManagerService: AssignmentManagerService, private toastr: NbToastrService) {
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
    iconsLibrary.registerFontPack('fa', { iconClassPrefix: 'fa' });

    const data: any[] = [];
    this.source.load(data);
  }


  /**
   * Component lifecycle hook method used to fetch existing list of Questions, Rubrics and Main Question set file corresponding to user selected QuestionSet on Component initialization
   */
ngOnInit() {

   this.selectedAssignment = JSON.parse(localStorage.getItem('selectedAssign'));
   if ( !this.selectedAssignment.is_interactive )
    this.assignManagerService.fetchQuestionSetImages().subscribe(
      resData => {
        console.log(resData);
        const file_images: any = resData.question_file_images;
        for (const key of Object.keys(file_images)) {
          this.addSlide(file_images[key]);
        }

        this.q_file_present = true;
      },
      error => {
        console.log(error);
      },
    );

    this.assignManagerService.fetchActualQuestions().subscribe(
      _resData => {
        const questions_data = JSON.parse(localStorage.getItem('actual_questions'));
        this.actual_questions = questions_data;
        if ( this.actual_questions.length > 0) {
          this.q_present = true;
          this.current_q = this.actual_questions[0];
          this.q_index = 0;
          this.loadRubrics(this.current_q.main_id);
          this.refreshPageDetails();
        }

      },
      error => {
        console.log(error);
      },
    );
    
  }

  /**
   * Method fetch the list of Rubrics corresponding to question of selected QuestionSet using service API fetchRubrics.
   * @param question_id question database id 
   */
  loadRubrics(question_id: number) {
    this.assignManagerService.fetchRubrics(question_id).subscribe(
      resData => {
        const data = JSON.parse(localStorage.getItem('rubrics') || '[]');
        console.log('this.rubrics=', data);
        this.source.load(data);
    });
  }

  /**
   * Add the recieved page image object to array of Question set file pages
   * @param imageval File page object in image format
   */
  addSlide(imageval: string): void {
    this.slides.push({
      image: imageval,
    });
    this.mySlideImages.push(imageval);
  }

  // removeSlide(index?: number): void {
  //   const toRemove = index ? index : this.activeSlideIndex;
  //   this.slides.splice(toRemove, 1);
  // }

  /**
   * View calls this method once user clicks the forward arrow button to navigate next question
   * method update the current question index and calls the method to refresh page details like current question details, rubric table data
   */
  nextQuestion() {
    this.q_index++;
    if (this.q_index > this.actual_questions.length - 1 ) {
      this.q_index = 0;
    }
    this.refreshPageDetails();
  }

  /**
   * View calls this method once user clicks the backward arrow button to navigate prev question
   * method update the current question index and calls the method to refresh page details like current question details, rubric table data
   */
  prevQuestion() {
    this.q_index--;
    if (this.q_index < 0 ) {
      this.q_index = this.actual_questions.length - 1;
    }
    this.refreshPageDetails();
  }

  /**
   * Method refresh the page details using current question index property of component.
   * The page details include Question details, page no of question and corresponding list of rubrics 
   */
  refreshPageDetails() {
    this.current_q = this.actual_questions[this.q_index];


        /*let html = this.current_q.text;
        let div = document.createElement("div");
        div.innerHTML = html;
        let text = div.textContent || div.innerText || "";*/
        this.current_q.quetionText = atob(this.current_q.text);

        this.current_q.questionType = this.current_q.type;
        let solutionText =this.current_q.options;
        
        if (this.current_q.questionType == "TXT") {
          // this.current_q.options = null;
          /*let div = document.createElement("div");
          div.innerHTML = solutionText;
          let text = div.textContent || div.innerText || "";*/
          this.current_q.solutionText = atob(solutionText);
          
        }
        else {
          this.optionsObject = JSON.parse(atob(this.current_q.options));
          for ( let i = 0; i < this.optionsObject.length; i++ ) {
            this.optionsObject[i].optionText =  this.optionsObject[i].optionText ;
            this.optionsObject[i].labelText = this.optionsObject[i].labelText ;
            if ( this.optionsObject[i].is_Correct != "") {
             this.optionsObject[i].is_Correct = true;
            }
          }
             
        }






    this.activeSlideIndex =  (this.current_q.filepage == null || this.current_q.filepage >= this.slides.length)
                                        ? 0 : this.current_q.filepage;
    this.loadRubrics(this.current_q.main_id);
  }

  /**
   * onCreateConfirm method calls the service api method to create new rubric by passing required rubric data. On successful response, method updates table data and shows appropriate notification message.
   * @param event event triggered by rubric smart table once user clicks the add confirm button
   */
  onCreateConfirm(event): void {
    // console.log('Create');
      // console.log(event);

    this.assignManagerService.createRubric(event.newData, this.current_q.main_id).subscribe(
      resData => {
        console.log('add response=', resData);
        // console.log('addEvent=',this.addEvent);
        event.newData.id = resData.data.id;
        event.confirm.resolve(event.newData);
        this.loadRubrics(this.current_q.main_id);
        this.toastr.success('Rubric added successfully', 'Success');
      }
      , error => {
        console.log('add error=', error);
        // console.log('addEvent=',this.addEvent);
        event.confirm.reject();
        this.toastr.danger('Api Error', 'Error');
      },

    );

  }

  /**
   * onEditConfirm method calls the service api method to edit existing rubric by passing required rubric data. On successful response, method updates table data and shows appropriate notification message.
   * @param event event triggered by rubric smart table once user clicks the edit confirm button
   */
  onEditConfirm(event): void {
    console.log('Edit');
    // console.log(event);

    // this.editEvent = event;
    this.assignManagerService.editRubric(event.newData).subscribe(
      resData => {
        console.log('edit response=', resData);
        // console.log('addEvent=',this.addEvent);
        event.confirm.resolve();
        this.toastr.success('Rubric Updated successfully', 'Success');
      }
      , error => {
        console.log('edit error=', error);
        // console.log('addEvent=',this.addEvent);
        event.confirm.reject();
        this.toastr.danger('Api Error', 'Error');
      },

    );
  }

  /**
   * Method shows confirmation window for rubric deletion, if user selects yes then calls the OnDelete method else simply returns by rejecting event.
   * @param event event triggered by rubric smart table once user clicks the delete button 
   */
  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.OnDelete(event);
    } else {
      event.confirm.reject();
    }
  }

    /**
   * OnDelete method calls the service api method to delete an existing rubric by passing required rubric data. On successful response, method updates table data and shows appropriate notification message.
   * @param event event triggered by rubric smart table once user clicks the delete confirm button
   */
  OnDelete(event) {
    console.log('Delete');
    console.log(event);

    // this.deleteEvent = event;
    this.assignManagerService.deleteRubric(event.data).subscribe(
      resData => {
        console.log('delete response=', resData);
        // console.log('addEvent=',this.addEvent);
        event.confirm.resolve();
        this.toastr.success('Rubric deleted successfully', 'Success');
      }
      , error => {
        console.log('delete error=', error);
        // console.log('addEvent=',this.addEvent);
        event.confirm.reject();
        this.toastr.danger('Api Error', 'Error');
      },

    );

  }
}


