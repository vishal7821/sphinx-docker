## The Grade sheet Manager Component

### Capabilities
	
The GradeSheet manager component provides the below capabilities to the user,

- View the graded marks for each answered question in the submission and total graded marks of the submission
- Navigate to the Main GradeView page for any question on the grade sheet dashboard to view the submission copy with the grading details like the applied rubrics, grader’s comment, etc.

### View Design
	
The GradeSheet view contains the list of questions answered by the student during the submission in the event. Each list item contains the question title, the graded marks, and the total marks of the corresponding question. The view displays the total obtained marks as the last row item of the list. Each list item displays the question title as the hyperlink, which navigates the user to the Main Grade view page for the corresponding question. The view uses the Nebular List component of the Nebular theme library to show the data in the list format

### The component functionality

On component Initialization, the component fetches the list of graded questions and grading details corresponding to the submission made by the user in the event. The component fetches the below-mentioned grading details of the graded submission,

- The list of grading duties in case the question is graded by multiple graders. Each grading duty contains the applied rubrics, point adjustment, the grader’s comment, and the total graded marks
- The main submission file corresponding to the submission in the event
- The communication messages corresponding to the regrade requests
- The regrading duty contains the applied rubrics, point adjustment, the re-grader comment, and the total re-graded marks

The component stores the above details and the list of questions using the model class MyMarksQuestion, and the MyMarksGradingDuty class. While formatting the above details from the server response, The component computes the total graded marks and set the corresponding component properties. Once the user clicks on any question title the component redirects the user to the main grade view page for the respective question. Before navigation, the component stores the required data like the list index of the respective graded question, the list of questions, and corresponding grading details in the local storage
