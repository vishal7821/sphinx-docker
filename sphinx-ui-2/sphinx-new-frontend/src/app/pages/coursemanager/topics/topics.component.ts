import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
// import { CourseManagerService } from '../coursemanager.service';
import { TopicsService } from './topics.service';
import { NbToastrService } from '@nebular/theme';

/**
 * TopicComponent provides all capabilities to perform the Topic management of Course.
 * 
 * The view uses the ng2-smart-table library which represents topic data in the smart table.
 *  The smart table provides different features like sorting, searching, pagination,
 *  inline add/edit/delete capabilities. ng2-smart-table triggers event on user actions
 *  like add/edit/delete topic which gives the way to perform application logic on such
 *  user actions.
 * 
 * The application gives the capability to create a tree of topics by providing super-topic
 *  detail. For the super-topic column, The customized configuration is provided in component
 *  as a dropdown list needs to be used for edit/create mode.  The component provides function
 *  APIs to fetch course topics data from the server, facilitate user performed actions like
 *  adding a new topic to course, edit/delete existing topics in the course
 * 
 * The Topic manager Service provides the necessary API methods which does all server
 *  communication to perform necessary modifications at the application database
 */
@Component({
  selector: 'topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
})
export class TopicsComponent implements OnInit {

/**
 * The object contains customized necessary Table component configuration required to display topic table in view.
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
      id: {
        title: 'id',
        type: 'number',
      },
      name: {
        title: 'Name',
        type: 'string',
      },
      description: {
        title: 'Description',
        type: 'string',
      },
      super_topic: {
        title: 'Super Topic',
        type: 'html',
        editor: {
          type: 'list',
          config: {
            list: [],
          },
        },
      },
    },
    // mode: 'external',
  };
  /**
   * Map contains topic id - name as key - value pairs
   */
  topicMap = new Map();
  /**
   * Topic Table data represented by the array of topic structure, where each topic structure contains id, name, description, super-topic
   */
  source: LocalDataSource = new LocalDataSource();
  // sectionList: any[] = [];
  /**
   * the component constructor method used to inject the topic manager service and NbToastrService
   * @param topicService TopicService Object used to call service API methods
   * @param toastr NbToastrService Object used to show toastr notification messages
   */
  constructor(private topicService: TopicsService, private toastr: NbToastrService) {
  }

  /**
   * The component lifecycle hook method used to fetch course topics data from the server. 
   * The method sets the following things on receiving a successful server response
   * 
   *  1.Topic table data to be displayed in the view 
   * 
   *  2.Topic list data object which used to show on the dropdown in the edit form
   * 
   *  3.The super-topic name for each retrieved topic using the component property topicMap
   */
  ngOnInit() {

    this.topicService.fetchTopics().subscribe(resData => {
      this.topicMap.clear();
      let topics: any[];
      const dropdownData: any[] = [];
      topics = resData.data;
      for (let i = 0; i < topics.length; i++) {
        const val = {
          value: topics[i].id,
          title: topics[i].name,
        };
        this.topicMap.set(val.value, val.title);
        dropdownData.push(val);
      }

      const data = JSON.parse(localStorage.getItem('topics') || '[]');

      for (let i = 0; i < data.length; i++) {
        if (data[i].super_topic != null) {
          data[i].super_topic = this.topicMap.get(data[i].super_topic);
        }
      }

      console.log('this.topicsList=', data);
      console.log('this.dropdowndata=', dropdownData);

      this.settings.columns.super_topic.editor.config.list = dropdownData;
      this.settings = Object.assign({}, this.settings);
      this.source.load(data);
    });
  }

  /**
   * The method shows a confirmation window for topic deletion. If the user clicks yes, the method triggers a call to the OnDelete method
   * @param event event triggered by topic smart table once user clicks the delete button 
   */
  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.OnDelete(event);
    } else {
      event.confirm.reject();
    }
  }

  /**
   * The method makes the server request to add a new topic using the service API method.
   *  On receiving a successful response from the server,
   *  the method updates table data and shows an appropriate notification message
   * @param event event triggered by topic smart table once user clicks the add confirm button
   */
  onCreateConfirm(event): void {
    console.log('Create');
    console.log(event);

    this.topicService.createTopic(event.newData).subscribe(
      resData => {
        this.topicMap.set(resData.data.id, resData.data.name);
        console.log(resData);
        // let newdata = event.newData;
        // currData.main_id = resData.data.id;
        // currData.super_topic = this.topicMap.get(resData.data.super_topic);
        // this.source.update(currData,currData);
        event.newData.main_id = resData.data.id;
        event.newData.super_topic = this.topicMap.get(resData.data.super_topic);

        console.log('event data=', event);
        event.confirm.resolve(event.newData);


        this.toastr.success('Topic added successfully', 'Success');
      }
      , error => {
        event.confirm.reject();
        this.toastr.danger('Api Error', 'Error');
      },

    );

  }
  
  /**
   * onEditConfirm method calls the service API method to edit the existing topic by
   *  sending the required topic data. On receiving a successful response from the server,
   *  the method updates topic table data and shows the appropriate notification message
   * @param event event triggered by topic smart table once user clicks the edit confirm button
   */
  onEditConfirm(event): void {
    console.log('Edit');
    console.log(event);
    this.topicService.editTopic(event.newData).subscribe(
      resData => {
        console.log('edit response=', resData);
        // console.log('addEvent=',this.addEvent);
        event.newData.main_id = resData.data.id;
        event.newData.super_topic = this.topicMap.get(resData.data.super_topic);

        event.confirm.resolve(event.newData);
        this.toastr.success('Topic Updated successfully', 'Success');
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
   * The method makes the server request to delete the user-selected topic using 
   * the service API method. On receiving a successful response from the server,
   *  the method updates table data and shows an appropriate notification message
   * @param event event triggered by topic smart table once user clicks the delete confirm button
   */
  OnDelete(event: any) {
    console.log('Delete');
    console.log(event);

    this.topicService.deleteTopic(event.data).subscribe(
      resData => {
        console.log('delete response=', resData);
        // console.log('addEvent=',this.addEvent);
        event.confirm.resolve();
        this.toastr.success('Topic deleted successfully', 'Success');
        this.ngOnInit();

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
