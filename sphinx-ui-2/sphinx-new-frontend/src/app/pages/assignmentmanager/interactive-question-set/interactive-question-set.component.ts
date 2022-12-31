import { Component, OnInit, ViewChild } from '@angular/core';
import { AssignmentManagerService } from '../assignmentmanager.service';
import { NbIconLibraries, NbInputDirective, NbToastrService, NbWindowService } from '@nebular/theme';
import { TreeModel, NodeEvent, Ng2TreeSettings } from 'ng2-tree';
import { Assignment, QuestionSet, Topic } from '../assignmentmanager.model';
import { McqcbQuestionFormComponent } from "../mcqcb-question-form/mcqcb-question-form.component";
import { McqrbQuestionFormComponent } from "../mcqrb-question-form/mcqrb-question-form.component";
/**
 * 
 * Whenever instructor wishes to create an Interactive Exam Mode, they set the assignment type as 
 * Interactive. Then to add questions in the assignment, instructor creates question sets. On clicking
 * of the question set, instructor gets a view of the Interactive Question Set Creation. The interactive
 * question set component holds the responsibility to provide instructor to add/edit/delete the questions of
 * an interactive mode of an assignment.
 * 
 */
@Component({
  selector: 'interactive-question-set',
  templateUrl: './interactive-question-set.component.html',
  styleUrls: ['./interactive-question-set.component.scss']
})
export class InteractiveQuestionSetComponent implements OnInit {
  
  constructor(  iconsLibrary: NbIconLibraries, 
                private assignManagerService: AssignmentManagerService,
                private toastr: NbToastrService,
                private windowService: NbWindowService ) {
        iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
        iconsLibrary.registerFontPack('fa', { iconClassPrefix: 'fa' });
  }
  
  /**
   * treeComponent object is used to access Question Tree from the view of a component.
   */
  @ViewChild('treeComponent', { static: true }) treeComponent;
  
  /**
   * selectQuestionType object is used to access Question Type dropdown from the view in the component.
   */
  @ViewChild('selectQuestionType', { static: true }) selectQuestionType;
  /**
   * List of topics a course contains
   */
  topics: Topic[] = [];
  /**
   * Count variable used to ignore duplicate triggered event by Question Tree from View  
   */
  createdCnt: number = 0;
  /**
   * boolean flag used to toggle question edit form for non-leaf questions
   */
  isOpenForm1 = false;
  /**
   * boolean flag used to toggle question edit form for Actual questions
   */
  isOpenForm2 = false;
  /**
   * A string value used to determine the value of the Question Type dropdown
   */
  selectedItem: string;
  /**
   * A boolean value to determine whether selected question is of TXT type
   */
  isTextQuestionSelected: boolean = false;
  /**
   * A boolean value to determine whether selected question is of MCQRB type
   */
  isMCQRBQuestionSelected: boolean = false;
  /**
   * A boolean value to determine whether selected question is of MCQCB type
   */
  isMCQCBQuestionSelected: boolean = false;
  /**
   * A boolean value to determine the display style of selected question dropdown
   */
  showQuestionSelectOption: boolean = false;
  /**
   * An instance of Mcqcb QuestionForm Component to load the MCQCB layout in the options pane
   */
  loadComponent = McqcbQuestionFormComponent;
  /**
   * An instance of Mcqrb QuestionForm Component to load the MCQRB layout in the options pane
   */
  loadRBComponent = McqrbQuestionFormComponent;

  
  /**
   * Question Tree configuration objects
   */
  public settings: Ng2TreeSettings = {
    rootIsVisible: true,
  };

  /**
  *  Tree object to display till component loads the questions data from server
  */
  public tree: TreeModel = {
    value: 'Loading ...',
    id: 1,
    children: [],
  };

  tempNode: TreeModel = {
    value: '',
    main_id: 0,
    title: '',
    subpart_no: 0,
    type: '',
    text: '',
    filepage: -1,
    file_coords: '',
    solution_list: '',
    marks: -1,
    difficulty_level: -1,
    is_autograded: false,
    is_actual_question: true,
    parent: -1,
    topics: [],
    children: [],
  };

  /**
   * Tree node object used to store user selected question on Question Manager view
   */
  selectedNode: TreeModel = {
    id: -1,
    value: 'Go',
  };

  /**
   * An array to list down the menu item in the Question Type Dropdown
   */
  questionType: any[] = [
    { id: "MCQRB", text: "Multiple Choice Single Answer" },
    { id: "MCQCB", text: "Multiple Choice Multiple Answer" },
    { id: "TXT", text: "Subjective Question" },
  ];

  /**
   * Component lifecycle hook method used to fetch existing list of Questions,
   * questions from Main Question set file corresponding to user selected QuestionSet 
   * on Component initialization. It fetches the associated topics and initialises TinyMCE editors
   * for the question text and solution text.
   */
  ngOnInit() {
    this.fetchTopics();
    this.fetchQuestions();
    this.instantiateTXTEditor(".txt_questionText", "Please Type Your Question Here..");
    this.instantiateTXTEditor(".txt_solutionText", "Please Type Gold Solution Here..");
    this.instantiateEditor(".mcqcb_questionText", "Please Type Your Question Here..");
    this.instantiateEditor(".mcqrb_questionText", "Please Type Your Question Here..");
  }
  
  /**
   *  method add an empty question node to Question tree rooted at selected node from Tree view, 
   *  if not any node selected then node added at root level of Tree
   */
  addChild() {
    let oopNodeController = this.treeComponent.getController();
    if(this.selectedNode.id != -1 && this.selectedNode.id != 0) {
      oopNodeController = this.treeComponent.getControllerByNodeId(this.selectedNode.id);
    }
    const newNode: TreeModel = {
      value: null,
      main_id: null,
      title: null,
      subpart_no: null,
      type: null,
      text: null,
      filepage: null,
      file_coords: null,
      solution_list: null,
      marks: null,
      difficulty_level: null,
      is_autograded: null,
      is_actual_question: null,
      parent: null,
      topics: [],
      children: [],
    };
    oopNodeController.addChild(newNode);
  }

  /**
   * This method changes the view of the question and options pane depending upon the 
   * type of the question user has selected. 
   */
  triggerQuestionChange() {

    if (this.selectedItem != undefined ) {
      if (this.selectedItem === "TXT") {
        this.isTextQuestionSelected = true;
        this.isMCQRBQuestionSelected = false;
        this.isMCQCBQuestionSelected = false;
        this.instantiateEditor(".txt_questionText", "Please Type Your Question Here..");
        this.instantiateEditor(".txt_solutionText", "Please Type Gold Solution Here..");
      }
      else if (this.selectedItem === "MCQRB") {
        this.isMCQRBQuestionSelected = true;
        this.isTextQuestionSelected = false;
        this.isMCQCBQuestionSelected = false;
        this.instantiateEditor(".mcqrb_questionText", "Please Type Your Question Here..");
      } 
      else if (this.selectedItem === "MCQCB") {
        this.isMCQCBQuestionSelected = true;
        this.isTextQuestionSelected = false;
        this.isMCQRBQuestionSelected = false;
        this.instantiateEditor(".mcqcb_questionText", "Please Type Your Question Here..");
      }
    }
  }
  /**
   * This method does the basic setup of TinyMCE Editor and initialises plugins, toolbar and default text of the TinyMCE Editor
   * @param selectorDiv : The template node where the TInyMCE Editor will get attached
   * @param defaultText : The default value which the TinyMCE Editor will contain in the editor pane on load
   */
  instantiateEditor(selectorDiv : String, defaultText : String) {
    var editor = tinymce.init({
      selector: selectorDiv,
      base_url: '/tinymce/', 
      height: 100,
      setup: function (editor) {
        editor.on('init', function (e) {
          editor.setContent(defaultText);
        });
      },
      menubar: 'true',
      plugins: [
        'eqneditor image lists advlist wordcount'
      ],
      toolbar: [
        'eqneditor | undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'
      ],
      branding : false,
      statusbar: false,
    });
  }

  /**
   * This method does the basic setup of TinyMCE Editor for the TXT type of question and initialises plugins, toolbar and default text of the TinyMCE Editor
   * @param selectorDiv : The template node where the TInyMCE Editor will get attached
   * @param defaultText : The default value which the TinyMCE Editor will contain in the editor pane on load
   */
  instantiateTXTEditor(selectorDiv : String, defaultText : String) {
    var editor = tinymce.init({
      selector: selectorDiv,
      base_url: '/tinymce/', 
      height: 300,
      setup: function (editor) {
        editor.on('init', function (e) {
          editor.setContent(defaultText);
        });
      },
      menubar: 'true',
      plugins: [
        'eqneditor image lists advlist wordcount'
      ],
      toolbar: [
        'eqneditor | undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'
      ],
      branding : false,
      statusbar: false,
    });
  }

  /**
   * This method helps instructor to save the TXT/Subjective type of question.
   * The method will take user provided question and option text, checks if they are not empty,
   * then parses the question and option text in Base64 format and saves question data along with
   * title, marks, difficulty level, parent, topics and type. On successful submission of a question,
   * the method shows a successful message toaster.
   * @returns Shows toaster and returns if validations failed for TXT question
   */
  public updateTextQuestionDetails() {
    const tinyMCEEditors = tinymce.editors;
    const data = {};
    for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
      if ( tinyMCEEditors[i].settings.selector == ".txt_questionText" ) {
        let questionText = tinyMCEEditors[i].getContent(); 
        data['text'] = btoa(questionText);
        localStorage.setItem("Question_Text", btoa(tinyMCEEditors[i].getContent()));
        if (tinyMCEEditors[i].getContent().indexOf("img") == -1 ) {
          if ( tinyMCEEditors[i].getContent({format:'text'}).trim().replace(/\s/g,'').length == 0 ) {
            this.toastr.danger('Question Text must not be empty.', 'Error');
            return;
          }
        }
      }
      if ( tinyMCEEditors[i].settings.selector == ".txt_solutionText" ) {
        let solutionText = tinyMCEEditors[i].getContent(); 
        data['options'] = btoa(solutionText);
        localStorage.setItem("Question_Option", btoa(solutionText));
        if (tinyMCEEditors[i].getContent().indexOf("img") == -1 ) {
          if ( tinyMCEEditors[i].getContent({format:'text'}).trim().replace(/\s/g,'').length == 0 ) {
            this.toastr.danger('Solution Text must not be empty.', 'Error');
            return;
          }
        } 
      }
    }
    data['title'] = this.selectedNode.value;
    data['marks'] = this.selectedNode.marks || 0;
    data['difficulty_level'] = this.selectedNode.difficulty_level || 0;
    data['is_autograded'] = this.selectedNode.is_autograded;
    data['parent'] = this.selectedNode.parent;
    data['topics'] = this.selectedNode.topics;
    data['type'] = 'TXT';    

    this.assignManagerService.editQuestion(data,this.selectedNode.main_id).subscribe(
      resData => {
        for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
          if ( tinyMCEEditors[i].settings.selector == ".txt_questionText" ) {
            tinyMCEEditors[i].setContent(atob(resData.question.text));
          }
          if ( tinyMCEEditors[i].settings.selector == ".txt_solutionText" ) {
            tinyMCEEditors[i].setContent(atob(resData.question.options));
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
   * On receiving triggered event from view, method extracts the selected node data from event
   * and sets the component property selectedNode. This method in turn calls fetchInteractiveQuestions API to 
   * get the question details of the currently selected node data.
   * @param e : view triggered event on user selection of tree node
   */
  public onNodeSelected(e: NodeEvent): void {
    this.selectedNode = e.node.node;
    this.showQuestionSelectOption = true;
    if ( e.node.node.value === "root" ) {
      this.isMCQRBQuestionSelected = false;
      this.isTextQuestionSelected = false;
      this.isMCQCBQuestionSelected = false;
      this.showQuestionSelectOption = false;
      return;
    } 
    this.fetchInteractiveQuestions(e.node.node.main_id,e);
  }

  /**
   * On receiving triggered event from view, method sets the question fields parent id, subpart no, isActualQuestion, type for Question to be added.
   * After setting new Question fields, method makes an server api request to add new Question to application database.
   * If server responds error, then method removes newly added question from Tree view and shows appropriate error notification. 
   * @param e view triggered event once user creates tree node
   */
  public onNodeCreated(e: NodeEvent): void {
    this.showQuestionSelectOption = true;
    this.createdCnt++;
    if (this.createdCnt % 2 == 0) {
      const newnode = e.node.node;
      const parent = this.selectedNode;
      if (parent.id == -1) {
        const oopNodeController = this.treeComponent.getController();
        oopNodeController.reloadChildren();
        newnode.subpart_no = this.tree.children.length;
      } else {
        newnode.subpart_no = e.node.parent.children.length;
        newnode.parent = e.node.parent.node.main_id || "";
      }
      newnode.title = e.node.node.value;
      newnode.is_actual_question = 1;
      newnode.filepage = 1;
      newnode.type = "NEW";
      newnode.marks = 0;
      newnode.difficulty_level = 0;
      const tinyMCEEditors = tinymce.editors; 
      this.selectQuestionType.reset();
    
      newnode.text = btoa("Please Type Your Question Here..");
      this.assignManagerService.addQuestion(newnode).subscribe(
        resData => {
          console.log('q added=', resData);
          e.node.node.main_id = resData.question.id;
          this.selectedNode = {
            id: -1,
            value: 'Go',
          };
          this.toastr.success('Question added successfully', 'Success');
        },
        error => {
          const oopNodeController = this.treeComponent.getControllerByNodeId(newnode.id);
          oopNodeController.remove();
          if ( error.error != null && error.error.non_field_errors != null) {
            this.toastr.danger(error.error.non_field_errors, 'Error');
          }else{
            this.toastr.danger(error.error.detail, 'Error');
          }
        },
      );
    }
  }

   /**
    * On removal of tree node, method sets the selected node to dummy object
    * @param e view triggered event once user creates tree node
    */
  public onNodeRemoved(e: NodeEvent): void {
    this.selectedNode = {
      id: 0,
      value: 'Go',
    };
  }
  
  /**
   * Method removes the user selected node from tree view using tree nodeController 
   */
  removeNode() {
    const oopNodeController = this.treeComponent.getControllerByNodeId(this.selectedNode.id);
    oopNodeController.remove();
  }

  /**
   * The method retrives the Question edit form data and makes call to update question details at application server using service api.
   * On receiving server response, method shows appropriate error/success notification message
   */
  updateQDetails() {
    const data = {};
    if (this.tempNode.value !== '') {
      data['title'] = this.tempNode.value;
    }
    if (this.selectedNode.is_actual_question) {
      if (this.tempNode.marks != -1) {
        data['marks'] = this.tempNode.marks;
      }
      if (this.tempNode.difficulty_level == null) {
        this.tempNode.difficulty_level = 0;
      }
      if (this.tempNode.type == null) {
        this.tempNode.type = 3;
      }
      if (this.tempNode.difficulty_level != -1) {
        data['difficulty_level'] = this.tempNode.difficulty_level;
      }
      data['is_autograded'] = this.tempNode.is_autograded;
      data['parent'] = this.selectedNode.parent;
      data['topics'] = this.selectedNode.topics;
      console.log('is_autograded =',this.tempNode.is_autograded);
      if(this.tempNode.is_autograded){
        data['type'] = this.selectedNode.type;
        data['solution_list'] = this.selectedNode.solution_list;      
      }
      data['type'] = this.selectedNode.type;
      data['options'] = localStorage.getItem('Question_Option');
      data['text'] = localStorage.getItem('Question_Text');
      
    }
    this.assignManagerService.editQuestion(data, this.selectedNode.main_id).subscribe(
      resData => {
        if (this.tempNode.value !== '') {
          this.selectedNode.value = this.tempNode.value;
        }
        if (this.selectedNode.is_actual_question) {
          if (this.tempNode.marks != -1) {
            this.selectedNode.marks = this.tempNode.marks;
          }
          if (this.tempNode.difficulty_level != -1) {
            this.selectedNode.difficulty_level = this.tempNode.difficulty_level;
          }
          this.selectedNode.is_autograded = this.tempNode.is_autograded;
        }
        this.toastr.success('Question updated successfully', 'Success');
        this.cancelUpdate();
      },
      error => {
        if(error.error != null && error.error.non_field_errors != null){
          this.toastr.danger(error.error.non_field_errors[0], 'Error');
        }
      },
    );
  }

  /**
   * The method makes the selected node available to any further user actions and close the question edit form
   */
  cancelUpdate() {
    this.selectedNode = {
      id: -1,
      value: 'go',
    };
    this.isOpenForm1 = false;
    this.isOpenForm2 = false;
  }
 
  /**
   * Method checks that whether user selects any question or not before clicking edit button, shows error message and returns if no question selected by user.
   * Shows the respective edit form based on question is non leaf question or actual question
   */
  openForm() {
    if (this.selectedNode.id == -1) {
      this.toastr.primary('please select Question', 'Warning');
      return;
    }
    if (this.selectedNode.is_actual_question == true) {
      this.isOpenForm2 = true;
    } else {
      this.isOpenForm1 = true;
    }
  }

  /**
   * Method checks that whether user selects any question or not before clicking delete button, shows error message and returns if no question selected by user.
   * Check that seleted question must not be non leaf node as user not allowed to delete question having child questions.
   * If all validations passed, then make an server api call to delete the selected question from application database and update the View accordingly  
   */
  deleteQuestion(){
    if (this.selectedNode.id == -1) {
      this.toastr.primary('please select Question', 'Warning');
      return;
    }
    if (this.selectedNode.is_actual_question == false) {
      this.toastr.danger('Question having child questions can not be deleted', 'Error');
      return;
    }
    this.assignManagerService.deleteQuestion(this.selectedNode.main_id).subscribe(
      resData => {
        this.toastr.success('Question deleted successfully', 'Success');
        this.removeNode();
        this.isMCQRBQuestionSelected = false;
        this.isTextQuestionSelected = false;
        this.isMCQCBQuestionSelected = false;
        this.showQuestionSelectOption = false;
    
      
        this.selectedNode = {
          id: -1,
          value: 'go',
        };
      },
      error => {
        this.toastr.danger(error.error.detail, 'Error');
      },
    );
  }

  /**
   * fetch the list of Course Topics from application server and store into comopnent property topics for availability to question view
   */
  fetchTopics() {
    this.assignManagerService.fetchTopics().subscribe(
      resData => {
        this.topics = resData;
      },
      error => {
        // console.log(error);
      },
    );
  }

  
  /**
   * Method fetch the list of Questions corresponding to selected QuestionSet using service API fetchQuestions.
   * On successful retrival of Question list, set the question tree object which used by Question view
   */
  fetchQuestions() {
    this.assignManagerService.fetchQuestions().subscribe(
      resData => {
        const questions_data = JSON.parse(localStorage.getItem('questions'));
        this.tree = questions_data;     
      },
      error => {
        console.log(error);
      },
      );
    }

    /**
     * The method is used to fetch an individual question from the server database.
     * The details of the selected question from the tree node will be populated in the Question's pane.
     * @param question_id The id of the question whose details needs to be fetched
     * @param e view triggered event once user creates tree node 
     */
    fetchInteractiveQuestions(question_id,e) {
      this.assignManagerService.fetchSingleQuestionData(question_id).subscribe(
        resData => {
          const questions_data = JSON.parse(localStorage.getItem('selectedQuestion'));
          this.tempNode.value = e.node.node.value;
          if ( this.tempNode.value === "root" ) {
            this.isMCQRBQuestionSelected = false;
            this.isTextQuestionSelected = false;
            this.isMCQCBQuestionSelected = false;
            this.showQuestionSelectOption = false;
            return;
          } 
          this.tempNode.marks = questions_data.marks;
          this.tempNode.difficulty_level = questions_data.difficulty_level;
          this.tempNode.is_autograded = questions_data.is_autograded;
          this.tempNode.main_id = e.node.node.main_id;
          this.tempNode.solution_list = e.node.node.solution_list;  
          this.selectedItem = questions_data.type;
          this.selectQuestionType.setSelection(this.selectedItem);
          const tinyMCEEditors = tinymce.editors;
          this.tempNode.text = questions_data.text;    
          if( this.selectedItem === "TXT") {
          this.isMCQRBQuestionSelected = false;
          this.isTextQuestionSelected = true;
          this.isMCQCBQuestionSelected = false;
          for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
            if ( tinyMCEEditors[i].settings.selector == ".txt_questionText" ) {
              tinyMCEEditors[i].setContent(atob(questions_data.text));
            }
            if ( tinyMCEEditors[i].settings.selector == ".txt_solutionText" ) {
              tinyMCEEditors[i].setContent(atob(questions_data.options));
            }
          }
        }
      else if( this.selectedItem === "MCQRB") {
        this.isMCQRBQuestionSelected = true;
        this.isTextQuestionSelected = false;
        this.isMCQCBQuestionSelected = false;
        if ( questions_data.options && questions_data.options.length != 1 ) {
          for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
            if ( tinyMCEEditors[i].settings.selector == ".mcqrb_questionText" ) {
              tinyMCEEditors[i].setContent(atob(this.tempNode.text));
            }
          }
        this.assignManagerService.communicateOptionDataMCQRB(JSON.parse(atob(questions_data.options)));
        }
        else {
          this.assignManagerService.communicateOptionDataMCQRB({});
        }
      }
      else if( this.selectedItem === "MCQCB") {
        this.isMCQCBQuestionSelected = true;
        this.isTextQuestionSelected = false;
        this.isMCQRBQuestionSelected = false;
        if ( questions_data.options && questions_data.options.length != 1 ) {        
          for ( var i = 0; i < tinyMCEEditors.length; i++ ) {
            if ( tinyMCEEditors[i].settings.selector == ".mcqcb_questionText" ) {
              tinyMCEEditors[i].setContent(atob(questions_data.text));
            }
          }
          this.assignManagerService.communicateOptionData(JSON.parse(atob(questions_data.options)));
        }
        else {
          this.assignManagerService.communicateOptionData({});
        }
      }
      else {
        this.isMCQCBQuestionSelected = false;
        this.isTextQuestionSelected = false;
        this.isMCQRBQuestionSelected = false;
        this.assignManagerService.communicateOptionData({});
        this.assignManagerService.communicateOptionDataMCQRB({});
      }
    },
    error => {
            console.log(error);
    },
    );
  }
}
