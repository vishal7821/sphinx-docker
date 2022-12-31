## The GradingManager Component

### Capabilities

The grading manager component provides the below capabilities to the user,

- View the Grading duties allocated to the user in the user-selected GUPLOAD subevent on the MyEvents dashboard
- View the grading statistics data like Total number of graded submission copies and the total rewarded grades of each submission copy
- Navigate to the Main Grading page for any grading duty to grade the submission copy

### View Design

The view is the nested two-level table representation of the user grading duty data in the
GUPLOAD subevent. In the upper-level table, each row corresponds to the question for which the grading duties are allocated. Each row contains the question title, total marks, the number of graded copies, and an action button to perform grading for ungraded copies in this question. The table view is created using the list component provided by the nebular theme library.

While the child table represents the list of allocated copies for which corresponding
question to be graded. Each row contains the submission group ID/group member names, the grading status, and the graded marks. Each inner table is wrapped into a nebular list item in order to provide the nested list view

### The component functionality

On component Initialization, the component fetches the grading duties data and format the
data into the grading duties queues and store with the corresponding question data. While formatting the server response, the component computes the total number of graded copies for each question and sets the grading status for each grading duty. Once the user clicks the perform grading button then the component iterates through the corresponding grading queue, finds the ungraded copy and redirects the user to the main grading page for the ungraded copy. Before navigation, the component stores the required data like the queue index of ungraded copy and corresponding grading duty queue into local storage. The grading duty queues are used on the main grading page to provide the navigation capability to the prev/next grading duties in the same question. The component contains the list of APIs to provide the above mentioned functionalities. See the API documentation for detailed information

