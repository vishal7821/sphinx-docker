The MyEventsService is the important injectable provided by the MyEvents module, the service contains a large number of APIs as it performs all the necessary server communication for the MyEvents Dashboard, the submission manager, the grading manager, the grade sheet view manager, and the regrading manager. The service provided API’s mainly perform server communication for below activities( grouped by the major corresponding component),

- MyEvents Dashboard
    - Fetch the event and subevent list corresponding to the user
    - Fetch event associated files like the main question file, the supplementary file, and the     solution file

- The Submission Manager
    - Fetch the user submission details in the event
    - create/ join the submission group in the event
    - Perform pre-submission activities like access code verification, change the submission associated question set
    - Fetch/upload the submission related files, like the main submission file and supplementary submission file
    - fetch/update/delete the pagination for the submitted main file

- The Grading Manager, The Regrading manager
    - Fetch all user associated grading duties in the event
    - Update grading duty details at the server - it covers the total grade submission, review regrade requests
    - fetch/add/delete grading duty - rubric association

- The Grade Sheet view manager
    - Fetch user grade sheet in the event
    - fetch/create the regrading requests

Read the Service API’s documentation for more detailed information
