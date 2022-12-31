## Event Manager Module

Using the Events and SubEvents, The SphinX system provides a nice way to perform detailed customization of many possible activities related to the assignment or the exam. The Event Manager module mainly provides all the capabilities to perform CRUD operations related to the events and corresponding sub-events.

&nbsp;

In order to release the assignment, the user needs to create an event associated with the assignment. Users can set the time window, only during that period, the assignment is active and visible to corresponding users. The subevents provides a way to set the customized configuration for various things related to the event. The subevent basically represents the type of activities possible in the event. Such that users can set the activity related setting using subevent.

&nbsp;

The common configuration options available for all subevents are,
- Participant list: the set of users which allow performing the corresponding subevent activity
- Start and end time: the time window during which activity is available to perform on the         MyEvents dashboard of users

&nbsp;

The detailed list of subevents, corresponding activity, and the possible setting configurations are listed below,

- **QVIEW**: view and download the Main question file, supplementary file related to the assignment
    - generating subevent: these must be one or more subevents of this event of type SUPLOAD, GUPLOAD, or RGUPLOAD. However, either all these subevents must be of type SUPLOAD or else all these subevents must be of type GUPLOAD or RGUPLOAD (i.e. can create a QVIEW subevent either for students or graders but not both). Thus, the instructor must first create a subevent of at least one of these types before creating a QVIEW type subevent.
- **SVIEW**: Submission view activity
- **GVIEW**: View the submitted grades
- **MVIEW**: View the Grades and graded submission copy
- **AVIEW**: view and download the solution file of the assignment
    - generating subevent: these must be one or more subevents of this event of type SUPLOAD, GUPLOAD, or RGUPLOAD. Thus, the instructor must first create a subevent of at least one of these types before creating an AVIEW type subevent.
- **RGVIEW**: view the submitted regrades
- **RMVIEW**: view the regraded marks and regraded submission copy
- **SUPLOAD**: Submission upload activity
    - Submission mode: this must be one of the following, 
        - Online by student(OLS)
        - Onsite by student(OSS)
        - Online by instructor(OLI).
    If the mode is OLI, then the following params are not required. However, if the mode is OLS or OSS, then the following parameters must be specified as one of their valid values.

    - Question set scheme: If the assignment contains multiple question sets, then scheme to        decide which question set should be assigned to the user for submission
    <table style="border: 1px solid black">
    <tr style="border: 1px solid black">
        <th> QSS </th>
        <th> Description </th>
    </tr>
    <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> Open set </td>
        <td> The user can choose any one question set to make a submission </td>
    </tr>
    <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> Fixed set </td>
        <td> The user not allowed to select a question set. the assigned question set for each submission group must be provided in the participant’s CSV file </td>
        
    </tr>
    </table>
        If QSS is Fixed set, then the participant's CSV file that the instructor uploads must have the column having the question_set_name of the question set associated with that submission group
    - Submission group scheme:
    <table style="border: 1px solid black">
    <tr style="border: 1px solid black">
        <th> SGS </th>
        <th> Description </th>
    </tr>
    <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> Individual </td>
        <td> each user need to make submissions individually </td>
    </tr>
    <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> Open Group </td>
        <td> Users can make a group on their own </td> 
    </tr>
       <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> Fixed Group </td>
        <td> group members are mentioned in the CSV file, user not allowed to make own group </td>
    </tr>
    </table>
    Unless SBM is OLI, the instructor must also upload a participant's CSV file with each row denoting a submission group and giving us a pipe-separated (i.e. separated by the symbol |) list of roll numbers/user names which belong to that group.
    - main upload size: how large can the main submission file be (in MB)?
    - main upload type: what file types are allowed as the main submission? (Allow only PDF in general). The file extensions should be specified as a pipe separated list e.g. PDF|ZIP|TXT.
    - User allowed to submit the supplementary file or not
    - supplementary upload size: how large can the supplementary file be (in MB)?
    - supplementary upload type: what file types are allowed as the supplementary upload? The file extensions should be specified as a pipe separated list e.g. PDF|ZIP|TXT.
    - need access code: does every submission in this event need a secret code for the system to  accept submissions
    - delay parameter: specify a mean and standard deviation (in seconds) for the amount of time the frontend must artificially delay the upload of a submission after the student clicks the submit button.
    - background color: specify a color for the background color of the submission page for this assignment. 
- **GUPLOAD**: Grading activity
    - Grading duty scheme: 

    <table style="border: 1px solid black">
    <tr style="border: 1px solid black">
        <th> GDS </th>
        <th> Description </th>
    </tr>
    <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> MQS </td>
        <td> For every (question set,question) tuple, specify >=1 graders, each submission graded by just one grader </td>
    </tr>
    <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> MQR $ rep </td>
        <td> For every set,question, specify >= rep graders, each submission graded independently by rep graders </td> 
    </tr>
    <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> RQS </td>
        <td> MQS but with random assignment with one grader assigned as few questions as few as possible </td>
    </tr>
     <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> RQR $ rep </td>
        <td> MQR but with random assignment with one grader assigned as few questions as few as possible </td>
    </tr>
     <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> RSS </td>
        <td> all questions corresponding to each upload is entirely graded by one grader </td>
    </tr>
     <tr style="border: 1px solid black">
        <td style="border: 1px solid black"> RSR $ rep </td>
        <td> all questions corresponding to each upload is entirely graded independently by rep graders </td>
    </tr>
    </table>
    - generationg subevent: this must be a list of one or more existing and non-soft deleted       SUPLOAD-type subevents of this same event. This cannot be empty at the time of creation      of this GUPLOAD subevent
    - repeatation factor: maximum number of allowed graders for one submission, in case selected grading duty scheme involves multiple graders for one submission
- **RGREQ**: re-grading request activity
    - parent subevent: this must be a subevent of this event of type GUPLOAD. Thus, the instructor must first create an GUPLOAD event and only then can the instructor create an RGREQ event linking to that GUPLOAD event. There must be a 1-to-1 mapping from RGREQ subevents to GUPLOAD subevents
    - corresponding RGUPLOAD subevent: this must be a subevent of this event of type RGUPLOAD. Thus, the instructor must first create an RGUPLOAD event and only then can the instructor create an RGREQ event linking to that RGUPLOAD event. There must be a 1-to-1 mapping from RGREQ subevents to RGUPLOAD subevents
- **RGUPLOAD**: grade the regrade requests and upload grades
    - RDS (regrading duty scheme): this must be one of the following:
        - SOR (same or random): the same person who graded the response will regrade it. If there were multiple graders of a question, a random one will be chosen to regrade it 
        - RAN: from a list of regraders, choose a random one for every regrading request
        - QRN: same as RAN but specify the list separately for each question
        If the choice is QRN, the instructor must specify in a CSV file, the list of regraders every (question_set, question) tuple




       




