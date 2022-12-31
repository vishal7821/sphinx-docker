The module provided major Capabilities are listed below,

&nbsp;

- View all ongoing events corresponding to the logged-in user in the course
- For each event, provide the user allowed capabilities based on subevents configuration
    - View and download event associated files like the Main Question file, the supplementary       file, and the solution file
    - Perform main event submission and other submission related activities
    - Perform Grading of event submission copies
    - View the Grades and the graded copy
    - Submit Regrading requests
    - Review the regrading requests and regrade the copies

&nbsp;

In order to provide the above capabilities in detail, the module is divided into five parts,

- **MyEvents Dashboard**:

    The dashboard shows a list of all ongoing events that correspond to the user in the course.
    Each event item from the list contains the action items allowed to the user, for example, make a submission, view the grading duties, view the regrading duties, etc. The action items provide a way to navigate to the respective activity page. Once a user clicks any action item, the required details for the corresponding activity page are stored in the local storage and redirect the user to the corresponding activity page. If the user corresponding QVIEW / AVIEW subevent present in the event, then the dashboard shows the table of questions sets and file links associated with the event, the user can download files using the file links. For more information, see README of MyEventsManager component

- **The Submission Manager**:

    Once the user clicks the submit button on the event dashboard, the myEvents Manager component stores the corresponding SUPLOAD subevent and the event information to the local storage and redirects the user to the submission manager. The submission manager provides the user interface to upload the submission related files and submit pagination for each question in the assignment. The Pagination form takes the start page index of the answer corresponding to all questions as the user input. The submission manager loads the SUPLOAD subevent info from the local storage, and provide the necessary UI features based upon subevent configuration parameters. The UI features mainly contain create/join the submission group, access code verification, change the submission associated question set, and download uploaded submission files. For more details, see README of the submission manager component. 

- **The Grading Manager**:

    The grading manager consists of two main components, the grading manager dashboard, and the main grade page. Once the user clicks the view grading duties button on the event dashboard, the myEvents Manager component stores the corresponding GUPLOAD subevent & the event information to the local storage then redirects the user to the grading duty dashboard.

    The dashboard loads the subevent & event information from the local storage and fetches the list of grading duties associated with the GUPLOAD subevent from the server. The dashboard displays all the user allocated grading duties according to the grading scheme of the GUPLOAD subevent. It shows the multiple lists of grading duties, where each list corresponds to the question in the event associated assignment. Where each list item contains grading duty details like submission group id, grading status, graded marks. To perform the grading, the user can select any submission group id or click the perform grading button. Once the user selects the submission group id, the dashboard saves the grading duty details in local storage and redirects the user to the main grade page.

	The main grade page loads the user submission and grading duty details and provides access controls to perform the rubric-based grading. The navigation link to the grading dashboard is provided in the view such that the user can navigate to the dashboard in between grading. For more details, see README of the mainGrade component.

- **The grade view Manager**:

	The grade view manager mainly provides capabilities to view the grades with the graded copy and make regrade requests. The manager mainly consists of two components, the grade sheet view component and the main grade view component.
    
    The grade sheet view lists all the answered questions with corresponding graded marks and total marks. To view the graded copy, the user can navigate to the main grade view by clicking on the respective questions. The component saves the required details like submission id, associated grading duties before navigating to the main grade view.

	The main grade view shows the main submission copy and the grading duties associated with the user-selected question. Each grading duty displays all the rubrics with the applied one by the grader in the checked state. Also, the main grade view provides a regrading box to the user. The regrading box contains the previous regrading requests and grader response messages. Users can submit a new regrade request using the provided regrade request window. For more details, see README of the main grade view component.

- **The Regrading Manager**:

	The regrading manager provides the capabilities to view all allocated regrade requests, review and perform regrading for each re-grade request. The regrading manager mainly consists of two components, the regrading duty dashboard, and the main re-grade page. Once the user clicks the view regrading duties button on the myevents dashboard, the component saves the corresponding RGUPLOAD subevent and event details in the local storage, then navigates to the regrading duty dashboard.

	The regrading duty dashboard displays the list of all regrading requests allocated to the user using the corresponding RGUPLOAD subevent. Each list item represents the regrade request details like submission id, review status, and graded marks. By clicking on the regrade request, the user can navigate to the main regrade page to review the regrade request.

	The main regrade page is mostly similar to the main grade page, in addition, it provides the regrade request box and previous grading duties associated with the submission. The regrading box contains the previous regrading requests and grader response messages correspond to the submission. It provides a way to submit the review comment of the regrade request. For more details, see README of main regrade component
