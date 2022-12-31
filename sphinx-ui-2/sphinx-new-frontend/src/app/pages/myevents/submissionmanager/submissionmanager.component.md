## The Submission Manager Component



### Capabilities
	
The component provides the below-mentioned capabilities through the view and the component APIs,
- Create/Join the submission group
- Access code verification required to perform the submission
- Selection of the question set corresponding to the main submission
- Upload the main submission file, the supplementary submission file and download the respective uploaded files
- View the uploaded main submission file in an image carousel
- Provide the pagination(start page number of the answer in the main submission file) for each question in the question set and submit the assignment


### The Component View design
	
In order to provide the above capabilities, the view contains various form components and data display panels as listed below,

- The Submission Group form (1)
    
    The form provides toggle choice input to create or join the submission group in the event. On selecting the choice, the form displays input
    fields accordingly to create/ join the submission group

- The Access code verification form (2)

- The question set selection form (3)
    
    The form provides the list of question sets corresponding to the event in a dropdown, so the user can select and set the question set for the submission

- The main submission file upload form (4)

	The form provides the file dropzone, such that user can select the file to upload using file directory or by dropping the file into the dropzone

- The supplementary file upload form (5)

	The form structure is similar to the main submission file upload form

- The action panel (6)

	The panel displays the submission associated question set name, the main submission file name, and the supplementary file name with the edit control button to open the respective form to edit the already selected question set or the uploaded files
	
- The file view panel (7) for the user-uploaded main submission file

	The panel displays the user uploaded the main submission file in the image carousel such that user can view the file for providing the pagination for the assignment questions

- The Submission panel (8)

	The panel provides a list of questions with a dropdown to select the pagination for each question of the submission associated question set. The dropdown contains the list of page numbers of the main submission fie. The panel contains control buttons to submit the uploaded file or cancel the submission.  It also displays the submission group details like group ID, and list of group members


### The component functionality

The component provides the above-mentioned functionalities in three stages in a pipelined
manner,the stages are the submission group creation, access code verification, and the other submission related activities. On the component initialization, component fetches below details in order to implement pipelined action flow,

- The submission corresponding SUPLOAD subevent and the event from the local storage
- The submission related details from the server, it mainly includes the selected question set, access code verification status, submission group details (if the submission group is already created)
- The list of question sets in the event from the local storage
- The main submission files from the server (if uploaded any)
- The pagination details for the submission (if uploaded any)

Using the SUPLOAD subevent configuration parameters and the server responses, the component
takes decides the user-submission stage. If the submission group scheme is individual or fixed or the submission group is already created then the component moves the user to the second stage. Else the component displays the submission group form, Once the user creates/joins the submission group then component moves the user to the second stage.

If the access code verification flag is false in the SUPLOAD configuration, then the
component moves the user to the third stage. Else the component displays the access code verification form, Once the user verifies the required access code then component moves the user to the last stage.

The above two stages are kind of the pre-submission stages, which need to be done for a
single time if required. In the last stage, the component allows the user to submit the submission related files, provide the question-pagination, change the question set(if allowed), and make the final submission. If the question set scheme is open, then the user can change the question set associated with the submission multiple times. Once the user changes the question set, the respective list of questions is updated in the question-pagination panel view. The component allows the user to upload the submission files any number of times. Once the submission file uploaded, the component refreshes the file view panel data and resets the question pagination for all the questions in the submission panel. For uploading the submission file at the application server, the component generates the hash of the uploaded file using sha1 API of the external CryptoJS library. The generated hash is sent with the server API request, such that the server verifies the file integrity before storing it in the application server. For the question pagination, whenever the user selects the page number for the question, the component makes an independent server API request to the server. Such that user submission state is persistent even user close the application in between submission. Once the user clicks the submit button, the component checks whether pagination for each question is provided or not. If no error occurred then It displays the success notification and redirects the user to the myEvents dashboard.
	
See the component API documentation for more information.


