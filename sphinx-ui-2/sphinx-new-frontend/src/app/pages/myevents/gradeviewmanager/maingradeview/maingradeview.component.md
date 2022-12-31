## The Main Grade View Component

### Capabilities
	
The main Grade View component provides the below capabilities to the user,

- View the main submission file corresponding to the submission in the event
- View the total graded marks and the grade aggregation method in case the copy is graded by multiple graders
- View the list of grading duties( in case the answer copy is graded by multiple graders) and regrading duty corresponding to the question, Each grading duty contains grading details like the list of applied rubrics, the point adjustment, and the grader’s comment submitted by the respective grader 
- View the communication messages regarding existing re-grading requests and Submit the new regrade request

### View Design
	
The view contains the following view parts,
- The submission copy view

	The view displays the submission copy to be graded in the nice image carousel, the start page of carousel set as the page containing answer for the corresponding question using user-provided pagination

- The Question-GradeSheet panel

	The panel consists of two tabs representing the grades panel and the regrading request chatbox. The grades panel provides the list of grading duties( in case the answer copy is graded by multiple graders) and regrading duty corresponding to the question, Each grading duty contains grading details like the list of applied rubrics, the point adjustment, and the grader’s comment submitted by the respective grader. The chatbox tab list out all the communication messages between grader and student. The tab provides text-area to submit the new regrade request for the student

- The bottom panel

	The bottom panel contains the control buttons to navigate to the other graded questions in the grade sheet. The panel provides the navigation link to the GradeSheet dashboard page


### The component functionality

On component Initialization, the component takes the following actions,
- Load and store the list index of the user-selected question and the list of the questions of grade-sheet from the local storage
- Using the user-selected question and corresponding grading details, the component sets the properties for the Question-GradeSheet panel like the list of grading duties, the chatbox messages of regrading requests, etc.
- Load the submission file in the submission copy view panel

The component provides the navigation controls to the user such that the user can move to the other questions to view the respective grading details. The component uses the list of MyMarksQuestion model objects and the list index of the current question to provide the navigation capability. Whenever the user clicks the right/left arrow on the view, component moves the current question index to forward/backward in the question queue and loads the view with the respective MyMarksQuestion object data at the updated index.
		
The component provides the API’s to raise the new regrade request using the chatbox provided in the view, so once the user clicks the submit button by entering the regrade request message, the component calls the necessary server API to raise the new regrade request at the application server.

See the API documentation for more detailed information


