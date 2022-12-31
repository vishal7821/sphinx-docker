import { Component, OnInit, ViewChild } from '@angular/core';
import { AssignmentManagerService } from '../assignmentmanager.service';
import { NbIconLibraries, NbToastrService } from '@nebular/theme';
import { ImageCroppedEvent } from 'ngx-image-cropper';

import { TreeModel, NodeEvent, Ng2TreeSettings } from 'ng2-tree';
import { Assignment, QuestionSet, Topic } from '../assignmentmanager.model';

/**
 * Question Manager component provides the capabilities to perform all Question related operations in the Course.
 * 
 * 
 * Question Manager view mainly divides into two parts Question File view and Question Tree view.
 * Question file view display the main question set file with area select box for each page of file.
 * Question Tree view shows all questions of corresponding question set using the tree representation with action buttons at the top of view.
 * Control action buttons provide user accessibility to add new question, edit/delete existing question, select name/roll number/question area coordinates on the Question file page.
 * In order to perform add question operation user need to select parent question from tree and then click on the add button, after that view adds new node in the tree rooted at the selected question and provides input text box to enter new question title. User need to press enter key by providing non empty question title in order to add Question successfully. If user provided empty title then newly added question node is removed from tree and appropriate error message displayed.
 * For adding / editing question details user must select the question and click on edit button. After that form will be shown with corresponding question fields and appropriate action buttons.
 * For setting question area coordinates on file page, user must select the question, then click on set Question coords action button. After that as soon as user updates box position, view triggers call to update coordinates at server database.
 * For setting the name/roll number coordinates, user must click on respective action button.  After that as soon as user updates box position, view triggers call to update coordinates at server database.   
 * 
 * Question manager component contains properties and method API's to perform frontend application logic for Question management of corresponding Question set.
 * method API's of component provide functionalities like fetch Question data, add/edit/delete question to Question set.
 * 
 * The Assignment manager Service provides necessary API methods which does all server communication to perform necessary modifications for Question set and Questions at application database.  
 * 
 */
@Component({
  selector: 'question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
})
export class QuestionComponent implements OnInit {
  /**
   * Event object triggered from view once user updates box corners on question file page 
   */
  // imageChangedEvent: any = '';
  // croppedImage: any = '';
  /**
   * Array consist the pages of Question set file
   */
  images: any[] = [];

  /**
   * Image Carousel configuration setting object
   */
  mySlideOptions = {
    items: 1, loop: true, mouseDrag: false, touchDrag: false,
    pullDrag: false, freeDrag: false,
    dots: true, nav: true, navText: ['PREV', 'NEXT']
  };
  /**
   * File object to hold selected area region of file 
   */
  croppeddata: any = '';



  // slides: { image: string }[] = [];
  // activeSlideIndex = 0;
  // myInterval = 0;
  /**
   * Boolean flag which presents whether Question set main file is uploaded or not by user
   */
  isFilepresent: boolean = false;
  /**
   * list of Course Topics
   */
  topics: Topic[] = [];

  /**
   * boolean flag used to toggle question edit form for non leaf questions
   */
  isOpenForm1 = false;
  /**
   * boolean flag used to toggle question edit form for Actual questions
   */
  isOpenForm2 = false;

  /**
   * Component constructor initializes the service object of assignManagerService, nebular iconsLibrary, nebular ToastrService required for component API methods
   * @param iconsLibrary object of Nebular Icons Library
   * @param assignManagerService object of Assignment manager service
   * @param toastr object of Nebular Toastr Service
   */
  constructor(iconsLibrary: NbIconLibraries, private assignManagerService: AssignmentManagerService, private toastr: NbToastrService) {
    iconsLibrary.registerFontPack('ion', { iconClassPrefix: 'ion' });
    iconsLibrary.registerFontPack('fa', { iconClassPrefix: 'fa' });
    // this.dataSource = this.dataSourceBuilder.create(this.data);
  }


  /**
   * Component lifecycle hook method used to fetch existing list of Questions, Main Question set file corresponding to user selected QuestionSet on Component initialization
   */
  ngOnInit() {

    this.assignManagerService.fetchQuestionSetImages().subscribe(
      resData => {
        console.log(resData);
        const file_images: any = resData.question_file_images;
        for (const key of Object.keys(file_images)) {
          this.addSlide(file_images[key]);
        }

        this.isFilepresent = true;
      },
      error => {
        console.log(error);
      },
    );
    this.fetchTopics();
    this.fetchQuestions();
  }

    /**
   * Add the recieved page image object to array of Question set file pages
   * @param imageval File page object in image format
   */
  addSlide(imageval: string): void {
    // this.slides.push({
    //   image: imageval,
    // });
    this.images.push("data:image/jpg;base64," + imageval);
  }

  /**
   * fetch the list of Course Topics from application server and store into comopnent property topics for availability to question view
   */
  fetchTopics() {
    this.assignManagerService.fetchTopics().subscribe(
      resData => {
        this.topics = resData;
        console.log(this.topics);
      },
      error => {
        console.log(error);
      },
    );
  }



  // removeSlide(index?: number): void {
  //   const toRemove = index ? index : this.activeSlideIndex;
  //   this.slides.splice(toRemove, 1);
  // }

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
   * Question Tree configuration objects
   */
  public settings: Ng2TreeSettings = {
    rootIsVisible: true,
  };

  /**
   * Tree object to display till component loads the questions data from server
   */
  public tree: TreeModel = {
    value: 'Loading ...',
    id: 1,
    children: [],
  };

  /**
   * Tree node object used to hold edit form data or to temporarily store selected question details
   */
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
   * Count variable used to ignore duplicate triggered event by Question Tree from View  
   */
  createdCnt: number = 0;


  /**
   * On receiving triggered event from view, method extracts the selected node data frm event and sets the component property selectedNode
   * @param e view triggered event on user selection of tree node
   */
  public onNodeSelected(e: NodeEvent): void {
    console.log(e);
    this.selectedNode = e.node.node;
    console.log('selected node=', e.node.node);
    console.log('selected node title=', e.node.node.value);
    this.tempNode.value = e.node.node.value;
    this.tempNode.marks = e.node.node.marks;
    this.tempNode.difficulty_level = e.node.node.difficulty_level;
    this.tempNode.is_autograded = e.node.node.is_autograded;
    this.tempNode.main_id = e.node.node.main_id;
    this.tempNode.solution_list = e.node.node.solution_list;
  }


  /**
   *  On receiving triggered event from view, method sets the question fields parent id, subpart no, isActualQuestion, filepage for Question to be added.
   * After setting new Question fields, method makes an server api request to add new Question to application database. If server responds error, then method removes newly added question from Tree view and shows appropriate error notification 
   * @param e view triggered event once user creates tree node
   */
  public onNodeCreated(e: NodeEvent): void {
    this.createdCnt++;
    if (this.createdCnt % 2 == 0) {
      console.log('node created event=', e);
      const newnode = e.node.node;
      const parent = this.selectedNode;
      if (parent.id == -1) {
        const oopNodeController = this.treeComponent.getController();
        oopNodeController.reloadChildren();
        console.log('childrens =', this.tree.children);
        newnode.subpart_no = this.tree.children.length;
      } else {
        newnode.subpart_no = e.node.parent.children.length - 1;
        newnode.parent = e.node.parent.node.main_id;
      }
      newnode.title = newnode.value;
      newnode.is_actual_question = 1;
      newnode.filepage = 1;

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
          console.log(error);
          console.log(error.error);
          console.log(error.error.non_field_errors);
          if ( error.error != null && error.error.non_field_errors != null) {
            this.toastr.danger(error.error.non_field_errors, 'Error');
          }else{
            this.toastr.danger(error.error.detail, 'Error');
          }
          console.log(error);
        },
      );
    }

  }
  
  /**
   * On removal of tree node, method sets the selected node to dummy object
   * @param e view triggered event once user delete tree node
   */
  public onNodeRemoved(e: NodeEvent): void {
    console.log('node deleted event=', e);
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
   * treeComponent object used to access question tree from view in component
   */
  @ViewChild('treeComponent', { static: true }) treeComponent;
  
  /**
   * method add an empty question node to Question tree rooted at selected node from Tree view, if not any node selected then node added at root level of Tree
   */
  addChild() {
    let oopNodeController = this.treeComponent.getController();
    console.log(oopNodeController);
    if (this.selectedNode.id != -1 && this.selectedNode.id != 0) {
      console.log(this.selectedNode);
      oopNodeController = this.treeComponent.getControllerByNodeId(this.selectedNode.id);
      console.log(oopNodeController);
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
   * updateQDetails retrives the Question edit form data and makes call to update question details at application server using service api.
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
        console.log('solution_list =',data['solution_list']);
        console.log('solution_list =',this.selectedNode.solution_list);
        
      }
      data['type'] = this.selectedNode.type;
    }

    // if (this.tempNode.topics !== '') {
    //   data['topics'] = this.tempNode.topics;
    // }
    this.assignManagerService.editQuestion(data, this.selectedNode.main_id).subscribe(
      resData => {
        console.log(resData);
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
        console.log(error);
        if(error.error != null && error.error.non_field_errors != null){
          this.toastr.danger(error.error.non_field_errors[0], 'Error');
        }
      },
    );
  }
/**
 * method makes the selected node available to any further user actions and close the question edit form
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
      // console.log('please select node');
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
  deleteQuestion() {
    if (this.selectedNode.id == -1) {
      this.toastr.primary('please select Question', 'Warning');
      // console.log('please select node');
      return;
    }
    if (this.selectedNode.is_actual_question == false) {
      this.toastr.danger('Question having child questions can not be deleted', 'Error');
      // console.log('please select node');
      return;
    }
    this.assignManagerService.deleteQuestion(this.selectedNode.main_id).subscribe(
      resData => {
        this.toastr.success('Question deleted successfully', 'Success');
        this.removeNode();
        this.selectedNode = {
          id: -1,
          value: 'go',
        };
      },
      error => {
        console.log(error);
        this.toastr.danger(error.error.detail, 'Error');
      },
    );
  }

  // fileChangeEvent(event: any): void {
  //   this.imageChangedEvent = event;
  // }

  /**
   * QuestionManager View calls this method once area box position updated by user on question file page.
   *  imageCropped method find the area update mode( Question page area, roll number area, user name area) and call the respective component api method to update area coordinates at application database
   * @param event 
   * @param pageIdx 
   */
  imageCropped(event: ImageCroppedEvent, pageIdx: any) {
    this.croppeddata = event.file;
    if (this.selectedNode.id != -1 && this.selectedNode.id != 0) {
      console.log(this.selectedNode);
      const coord: string = event.imagePosition.x1 + ',' + event.imagePosition.y1 + ',' + event.imagePosition.x2 + ','
        + event.imagePosition.y2 + ',' + event.height + ',' + event.width;
      console.log(coord);
      console.log(pageIdx);
      this.updateQCoords(coord, pageIdx);

    } else if (this.selectedNode.id == -1 && this.selectedNode.value == 'name_coord') {
      console.log(this.selectedNode);
      const coord: string = event.imagePosition.x1 + ',' + event.imagePosition.y1 + ',' + event.imagePosition.x2 + ','
        + event.imagePosition.y2 + ',' + event.height + ',' + event.width;
      console.log(coord);
      this.updateQSetNameCoords(coord);

    } else if (this.selectedNode.id == -1 && this.selectedNode.value == 'roll_coord') {
      console.log(this.selectedNode);
      const coord: string = event.imagePosition.x1 + ',' + event.imagePosition.y1 + ',' + event.imagePosition.x2 + ','
        + event.imagePosition.y2 + ',' + event.height + ',' + event.width;
      console.log(coord);
      this.updateQSetRollCoords(coord);
    }
  }

  /**
   * method sets the area select mode to user name mode
   */
  setQsetNameCoordMode() {
    this.selectedNode = {
      id: -1,
      value: 'name_coord',
    };
  }


  /**
   * method sets the area select mode to user roll number mode
   */
  setQsetRollCoordMode() {
    this.selectedNode = {
      id: -1,
      value: 'roll_coord',
    };
  }

  /**
   * method makes an server api request to update user name coordinates for corresponding questin set at application database
   * @param coords area coordinates of user name on question set file page
   */
  updateQSetNameCoords(coords: string) {

    const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
    const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));
    selectedQset.name_coords = coords;
    this.assignManagerService.editQuestionSet(selectedAssign.main_id, selectedQset).subscribe(
      resData => {
        console.log(resData);
        this.selectedNode.file_coords = coords;
        localStorage.setItem('selectedQset', JSON.stringify(selectedQset));
        this.toastr.success('Name coordinates updated successfully', 'Success');
      },
      error => {
        console.log(error);
      },
    );
  }

  /**
   * method makes an server api request to update user roll number coordinates for corresponding questin set at application database
   * @param coords area coordinates of user roll number on question set file page
   */
  updateQSetRollCoords(coords: string) {

    const selectedAssign: Assignment = JSON.parse(localStorage.getItem('selectedAssign'));
    const selectedQset: QuestionSet = JSON.parse(localStorage.getItem('selectedQset'));
    selectedQset.roll_coords = coords;
    this.assignManagerService.editQuestionSet(selectedAssign.main_id, selectedQset).subscribe(
      resData => {
        console.log(resData);
        this.selectedNode.file_coords = coords;
        localStorage.setItem('selectedQset', JSON.stringify(selectedQset));
        this.toastr.success('Roll Number coordinates updated successfully', 'Success');
      },
      error => {
        console.log(error);
      },
    );
  }

    /**
   * Function required for Cropper.js library
   */
  imageLoaded() {
    // show cropper
  }
  /**
   * Function required for Cropper.js library
   */
  cropperReady() {
    // cropper ready
  }
    /**
   * Function required for Cropper.js library
   */
  loadImageFailed() {
    // show message
  }

  /**
   * method makes an server api request to update question coordinates and page no for user selected question at application database
   * @param coords area coordinates of question on question set file page
   * @param page_no question corresponding file page number
   */
  updateQCoords(coords: string, page_no: any) {
    const data = {};
    data['file_cords'] = coords;
    data['file_page'] = page_no;

    data['title'] = this.selectedNode.value;
    // data['marks'] = this.selectedNode.marks;
    // data['difficulty_level'] = this.selectedNode.difficulty_level;
    // data['is_autograded'] = this.selectedNode.is_autograded;
    data['parent'] = this.selectedNode.parent;
    // if (this.tempNode.topics !== '') {
    //   data['topics'] = this.tempNode.topics;
    // }
    this.assignManagerService.editQuestion(data, this.selectedNode.main_id).subscribe(
      resData => {
        console.log(resData);
        this.selectedNode.file_coords = coords;
        this.selectedNode.filepage = page_no;
        this.toastr.success('Question coordinates updated successfully', 'Success');
      },
      error => {
        console.log(error);
      },
    );
  }

}


