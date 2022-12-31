var app = angular.module('BlurAdmin')

app.constant('config',{
	domain:'http://localhost:8000',
	agg_methods:[
                    {value: 'MIN', text: 'Minimum'},
                    {value: 'AVG', text: 'Average'},
                    {value: 'MAX', text: 'Maximum'},
                    {value: 'MED', text: 'Median'},
                  ],
  bool_val : [
          {value: true, text: 'Yes'},
          {value: false, text: 'No'},
        ],

  subevent_types : [
          {value: 'QVIEW', text: 'Question View'},
          {value: 'SUPLOAD', text: 'Submission Upload'},
          {value: 'SVIEW', text: 'Submission View'},
          {value: 'GUPLOAD', text: 'Grading'},
          {value: 'AVIEW', text: 'Solution view'},
          {value: 'RGREQ', text: 'Regrading Request'},
          {value: 'RGUPLOAD', text: 'Regrading'},
        ],
  submission_modes:[
          {value: 'OLS', text: 'Online By Student'},
          {value: 'OLS', text: 'Online By Instructor'},
          {value: 'OSS', text: 'Onsite By Student'}
        ],
  grading_duty_schemes:[
          {value: 'MQS', text: 'Multiple Question By Single Grader(Manual)'},
          {value: 'MQR$rep', text: 'Multiple Questions By Multiple Grader(Manual)'},
          {value: 'RQS', text: 'Multiple Questions By Single Grader(Random)'},
          {value: 'RQR$rep', text: 'Multiple Questions By Multiple Grader(Random)'},
          {value: 'RSS', text: 'Multiple Submissions By Single Grader(Random)'},
          {value: 'RSR$rep', text: 'Multiple Submissions By Mutiple Grader(Random)'}
        ],

  submission_group_scheme:[
          {value: 'IN', text: 'Individual'},
          {value: 'FG', text: 'Fixed Group Submission'},
          {value: 'OG', text: 'Open Group'}
        ],
  question_set_scheme:[
          {value: 'OS', text: 'open question set'},
          {value: 'FS', text: 'Fixed question set'},
        ],
})