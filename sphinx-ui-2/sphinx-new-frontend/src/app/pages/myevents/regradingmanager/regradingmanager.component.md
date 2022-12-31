## ReGradingManager Component

### Capabilities
	
The re-grading manager component provides the below capabilities to the user,

- View the Re-Grading requests allocated to the user in the user-selected RGUPLOAD subevent on the MyEvents dashboard
- View the regrading statistics data like Total number of graded re-grade requests and the total rewarded grades of each submission copy
- Navigate to the Main ReGrading page for any grading request to re-grade the submission copy

### View Design

The view list out all the re-grade requests allocated to the grader in the corresponding RGUPLOAD subevent. each list item contains the regrade request details like the submission group ID/group member names, the review status, the graded marks, the corresponding question, and the question set. The view uses the Nebular List component of the Nebular theme library to show the data in the list format.


### The component functionality

On component Initialization, the component fetches the list of re-grading duties data corresponding to the user-selected RGUPLOAD subevent. It processes the server response data and stored the formatted list of allocated re-grading requests as an array of MyReGradingDuty model objects. While formatting the server response, the component computes the total number of graded regrade requests sets the grading status for each re-grading duty. Once the user clicks on any regrade request the component redirects the user to the main re-grading page for the respective regrade request. Before navigation, the component stores the required data like the list index of the respective regrade request and corresponding grading duty queue into local storage.
