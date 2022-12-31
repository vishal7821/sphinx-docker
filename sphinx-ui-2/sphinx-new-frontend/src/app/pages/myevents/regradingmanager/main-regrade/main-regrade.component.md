## ReGradingManager Component

### Capabilities
	
The main regrading component provides the below capabilities to the user,

- Grade the allocated regrade request by using the rubric-based grading system
- View and download the submission copy related files .i.e. the main submission file and the supplementary submission file
- Perform the grading efficiently using two ways, the keyboard shortcuts or using the mouse controls on UI
- View the old grading duties(applied rubrics and graded marks) corresponding to the regrade request
- View the communication messages regarding re-grading requests and Submit the grader’s review comment


### View Design

The view contains the following view parts,
- The submission copy view
    - The view displays the submission copy to be graded in the nice image carousel, the start page of carousel set as the page containing answer for the corresponding question using user-provided pagination
- The grading panel
    - The grading panel consists of 3 tabs representing the new re-grading panel, Old grade panel, and the regrading request chatbox. The new grading panel provides the list of rubrics having a checkbox associated with each rubric and adjustment section to perform the re-grading. The old grade tab contains the list of old grading duties corresponding to the regrade request, where each list item contains the list of applied rubrics and the corresponding adjustment section. The chatbox tab list out all the communication messages between grader and student. The tab provides text-area to submit the grader review message for the regrade request
- The submission files panel
	- The panel contains the links to download the main submission file and the supplementary submission file
- The bottom panel
	- The bottom panel contains the control buttons to submit the grades for the regrade request or cancel the regrading and returns to the regrading manager



### The component functionality

On component Initialization, the component takes the following actions,
- Load and store the re-grading duty from local storage corresponding to the user-selected re-grading request on the grading manager.
- Fetch the main submission file and the supplementary submission file corresponding to the regrade request from the application server
- Fetch and store the existing grading details like the list of applied rubrics, the total graded marks, list of old grading duties from the application server
- Create the keyboard shortcuts to apply the rubric for grading as per the number of rubrics available to perform grading
- Load the submission file in the submission copy view panel

The component provides the keyboard shortcuts to the grader using the
HotkeysService of the angular2-hotkeys library. The component provides keyboard
shortcuts for each rubric in the rubric list, 1-9 numeric keys corresponding as per the list position of the rubric.
	
The component API’s provides similar functionalities to the MainGrade component APIs for rubric-based grading. In addition, the component provides the API’s to 
- fetch old grading duties and the list of regrading request communication messages from the application server
- Submit the review comment for the corresponding regrade request to the server

See the API documentation for more detailed information
