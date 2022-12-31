import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { CourseManagerService } from '../coursemanager.service';
import { NbToastrService } from '@nebular/theme';
import { CourseDetail } from '../coursemanager.model';
// import { Ng2SmartTableComponent } from 'ng2-smart-table/lib/ng2-smart-table.component';


/**
 * SectionsComponent provides capabilities to perform Course information management
 *  and Section management of course.
 * 
 * SectionsComponent View contains two parts that correspond to Course detail management
 *  and Course section management respectively. The course detail management view displays
 *  all course details in editable input boxes. The view provides a way to update the course
 *  directory path, which stores user submission files and other course data. The Section
 *  management view uses the ng2-smart-table library which represents section data in the
 *  smart table. The smart table provides different features like sorting, searching,
 *  pagination, inline add/edit/delete capabilities. ng2-smart-table triggers an event on
 *  user actions like add/edit/delete section which gives the way to perform application
 *  logic on such user actions
 * 
 * The Section component provides the settings required for the section smart table.
 *  The setting contains customized settings for add/edit/delete buttons and column details
 *  of the section table. The component provides function API's to fetch course and section
 *  related data from server using Course manager service. The function API's also facilitating
 *  user performed actions like adding new sections to course, edit/delete existing sections
 *  in the course and update course details.
 */
@Component({
  selector: 'sections',
  templateUrl: './sections.component.html',
  styleUrls: ['./sections.component.scss'],
})
export class SectionsComponent implements OnInit {



/**
 * The object contains the necessary customized configuration required to display
 *  the section smart table in view. The object contains properties like,
 * 
 * 1.Columns: Table column settings
 * 
 * 2.add: Add action settings
 * 
 * createConfirm:  Event-triggered once a Create button clicked,
 *  this event is used to trigger a call to onCreateConfirm method
 * 
 * 3.edit: Edit action settings
 * 
 * ConfirmSave: Event-triggered once an Edit button clicked,
 *  this event is used to trigger a call to onEditConfirm method
 * 
 * 4.delete: Delete action settings
 * 
 * ConfirmDelete: Event-triggered once a Delete button clicked,
 *  this event is used to trigger a call to onEditConfirm method

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
      id: {
        title: 'id',
        type: 'number',
      },
      name: {
        title: 'name',
        type: 'string',
      },
    },
    // mode: 'external',
  };
  /**
   * property to hold an event triggered once user clicks on Create
   */
  addEvent: any;
  /**
   * property to hold an event triggered once user clicks on Edit
   */
  editEvent: any;
  /**
   * property to hold an event triggered once user clicks on delete
   */
  deleteEvent: any;
  /**
   * Section Table data object containing an array of section structures, where each section structure contains id, name of the section
   */
  source: LocalDataSource = new LocalDataSource();
  /**
   * the array contains the existing sections data in the course
   */
  sectionList: any[] = [];
  /**
   * The CourseDetail model object stores the course details. The Object used for two way data binding with course details view
   */
  coursedetail: CourseDetail = new CourseDetail('', '', '', '', null, '', '', '');

  /**
   * The component constructor used to fetch and initializes the course details and list of course sections 
   * @param cmService The course manager Service object
   * @param toastr The NbToastrService manager service object used to show toastr notification messages
   */
  constructor(private cmService: CourseManagerService, private toastr: NbToastrService) {
    cmService.fetchSections().subscribe(resData => {

      const data = JSON.parse(localStorage.getItem('sections') || '[]');
      console.log('this.sectionList=', data);
      this.source.load(data);

    });

    cmService.fetchCourseDetails().subscribe(resData => {

      const data = JSON.parse(localStorage.getItem('courseDetail'));
      console.log('this.course detail=', data);
      this.coursedetail = data;

    });
  }

  /**
   * An empty component lifecycle hook, created for future use
   */
  ngOnInit() {
  }

    /**
   * The method shows a confirmation window for section deletion. If the user
   *  clicks YES then method triggers a call to delete the section, else reject the received event
   * @param event event triggered by section smart table once user clicks delete 
   */
  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.OnDelete(event);
    } else {
      event.confirm.reject();
    }
  }

    /**
   * onCreateConfirm method calls the service api method to create new section by passing required section data. On successful response, method updates table data and shows appropriate notification message.
   * @param event event triggered by section smart table once user clicks the add confirm button
   */
  onCreateConfirm(event): void {
    // console.log('Create');
    //   console.log(event);

    this.cmService.createSection(event.newData).subscribe(
      resData => {
        // console.log('add response=',resData);
        // console.log('addEvent=',this.addEvent);
        event.newData.main_id = resData.data.id;
        event.confirm.resolve(event.newData);
        this.toastr.success('Section added successfully', 'Success');
      }
      , error => {
        // console.log('add error=',error);
        // console.log('addEvent=',this.addEvent);
        event.confirm.reject();
        this.toastr.danger('Api Error', 'Error');
      },

    );

  }

    /**
   * The method calls the service API method to edit existing section details.
   *  On receiving a successful response, the method updates section table data and shows the success notification message
   * @param event event triggered by section smart table once user clicks the edit confirm button
   */
  onEditConfirm(event): void {
    console.log('Edit');
    console.log(event);

    this.editEvent = event;
    this.cmService.editSection(this.editEvent.newData).subscribe(
      resData => {
        console.log('edit response=', resData);
        // console.log('addEvent=',this.addEvent);
        this.editEvent.confirm.resolve();
        this.toastr.success('Section Updated successfully', 'Success');
      }
      , error => {
        console.log('edit error=', error);
        // console.log('addEvent=',this.addEvent);
        this.editEvent.confirm.reject();
        this.toastr.danger('Api Error', 'Error');
      },

    );

  }

    /**
   * OnDelete method calls the service api method to delete an existing section by passing required section data. On successful response, method updates table data and shows appropriate notification message.
   * @param event event triggered by section smart table once user clicks the delete confirm button
   */
  OnDelete(event: Event) {
    console.log('Delete');
    console.log(event);

    this.deleteEvent = event;
    this.cmService.deleteSection(this.deleteEvent.data).subscribe(
      resData => {
        console.log('delete response=', resData);
        // console.log('addEvent=',this.addEvent);
        this.deleteEvent.confirm.resolve();
        this.toastr.success('Section deleted successfully', 'Success');
      }
      , error => {
        console.log('delete error=', error);
        // console.log('addEvent=',this.addEvent);
        this.deleteEvent.confirm.reject();
        this.toastr.danger('Api Error', 'Error');
      },

    );

  }

  /**
   * method calls the service API method to update the course details.
   *  On receiving a successful response,
   *  the method shows an appropriate notification message to the user
   */
  onUpdateCourse() {
    console.log('update course=', this.coursedetail);

    this.cmService.editCourseDetails(this.coursedetail).subscribe(
      resData => {
        console.log('course updated =', resData);
        this.toastr.success('Course details updated successfully', 'Success');
      },
      error => {
        console.log('error raised =', error);
        this.toastr.danger('Api Error', 'Error');
      },
    );
  }

}
