The MyEvents Dashboard view displays the list of user corresponding events. For each list item, the view process the list of subevents associated with the respective event and provide the action items to the user. If the subevent is active( start time<= current time<= end time) then based on the subevent type, the view designed as below,

- QVIEW:

    The view list out the event associated question sets and their corresponding files in the table format. Each row contains the question set name, main question file name, and supplementary file name. The view provides file names as hyperlinks, which user can use to download the files on the local system

- AVIEW:

	If the subevent active then view provides the capability to view and download the gold solution file for all the question sets associated with the event. The view displays the solution file name as the hyperlink, which user can use to download the file on the local system

- SUPLOAD/ SVIEW:

    The view displays the timeline progress bar for the subevent. If the SUPLOAD or SVIEW subevent active, then the view provides a navigation button to the submission manager. Once the user clicks the submit button, the component saves the corresponding event object & the SUPLOAD subevent object in the local storage before navigating to the submission manager

- MVIEW:

    The view displays the timeline progress bar for the subevent. If the MVIEW subevent active, then the view provides a navigation button to the gradeview manager. Once the user clicks the view grades button, the component saves the corresponding event object & the MVIEW subevent object in the local storage before navigating to the gradeview manager

- GUPLOAD/GVIEW:

    As the user may have associated with multiple GUPLOAD subevents in the event, the view displays all the GUPLOAD subevents in table format. If the GUPLOAD / GVIEW is active, then the view provides a navigation button to the grading manager. Once the user clicks the view grading duty button, the component saves the corresponding event object & the GUPLOAD subevent object in the local storage before navigating to the grading manager

- RGUPLOAD/RGVIEW:

    As the user may have associated with multiple RGUPLOAD subevents in the event, the view displays all the RGUPLOAD subevents in table format. If the RGUPLOAD / RGVIEW is active, then the view provides a navigation button to the re-grading manager. Once the user clicks the view regrading duty button, the component saves the corresponding event object & the RGUPLOAD subevent object in the local storage before navigating to the re-grading manager

On initialization, the component fetches the events data from the server and performs data formatting, so data is available to view in the required format. During data formatting, component iterate through the event list and set the event properties like subevent flags, progress bar values which help to render the view correctly. The component provides the navigation method APIs which handle user-triggered requests and redirects the user to respective view by saving required information into the local storage. It also provides the APIs, which download the user-requested files from the server to the local system. See the component API’s documentation for more details.
