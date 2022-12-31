## The Main Grading Component

### Capabilities
	
The main grading component provides the below capabilities to the user,

- Grade the allocated submission copy by using the rubric-based grading system
- View and download the submission copy related files .i.e. the main submission file and the supplementary submission file
- Perform the grading efficiently using two ways, the keyboard shortcuts or using the mouse controls on UI
- The grader can navigate to the next/prev ungraded submission and the next/prev submission in the allocated grading duties of the same question using the keyboard shortcuts or the navigation control buttons
- View the progress bar of the total number of graded submission copies

### View Design
	
The view contains the following view parts,
- The submission copy view
    - The view displays the submission copy to be graded in the nice image carousel, the start page of carousel set as the page containing answer for the corresponding question using user-provided pagination
- The grading panel
    - The grading panel contains the Instructor message for graders, total graded marks, rubrics section, and the adjustment section. In the rubric section, all the rubrics corresponding to question are listed with the corresponding checkboxes. The adjustment section contains the input areas for the point adjustment and the specific comments by the grader
- The submission files panel
	- The panel contains the links to download the main submission file and the supplementary submission file
- The bottom panel
	- The bottom panel contains the grading progress bar, navigation link to the grading manager, and the queue navigation section. The queue navigation section contains the buttons which load the next/prev ungraded submission copy,  the next/prev submission copy in the grading duty queue corresponding to the same question


### The component functionality

On component Initialization, the component takes the following actions,
- Load and store the data from local storage corresponding to the user-selected grading duty on the grading manager. The data contains the grading duty, the corresponding queue index, and the grading duty queue.
- Fetch the main submission file and the supplementary submission file corresponding to the grading duty from the application server
- Fetch and store the existing grading details like the list of applied rubrics, the total graded marks from the application server
- Create the keyboard shortcuts to apply the rubric for grading as per the number of rubrics available to perform grading
- Load the submission file in the submission copy view panel

The component provides the keyboard shortcuts to the grader using the
HotkeysService of the angular2-hotkeys library. The component provides keyboard
shortcuts as below,
- For each rubric in the rubric list, 1-9 keys corresponding as per the list position of the rubric
- [ A, S, D, F ] keys corresponding to grade & prev, prev, next, and grade & next buttons respectively

Whenever the grader check/uncheck the checkbox for any rubric, the component
creates/delete the rubric-grading duty link at the application server to apply the
respective changes for grading. The navigation buttons and corresponding component
action as listed below,
- Grade & Prev: The component submits the grades onto the server and loads the view with next ungraded submission in the opposite direction from the queue
- Prev: The component save the grades onto the server and loads the view with the previous submission from the grading duty queue
- Next: The component save the grades onto the server and loads the view with the next submission from the grading duty queue
- Grade & Next: The component submits the grades onto the server and loads the view with next ungraded submission from the queue

The component provides APIs to provide the above-mentioned functionalities such as apply/remove the rubric for the grading, download submission copies, navigation to other submission copies, etc.

See the API documentation for more detailed information





