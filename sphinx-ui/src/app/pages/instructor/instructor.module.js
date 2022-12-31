(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider,$urlRouterProvider) {
    $stateProvider
        .state('instructor', {
          url: '/instructor',
          templateUrl: 'app/pages/instructor/instructor.html',
          title: 'Instructor Home',
          abstract: true,
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 100,
          },
        })
        .state('instructor.assignments', {
          url: '/assignments',
          title: 'Assignments',
           views:{
            'instructorview@instructor':{
              controller: 'AssignmentCtrl',
              templateUrl: 'app/pages/instructor/assignments/assignmentList.html',
            }
          },
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 200,
          },
        })
        .state('instructor.assignments.questionsets', {
          url: '/questionsets',
          title: 'Question Sets',
          views:{
            'instructorview@instructor':{
              controller: 'QuestionSetCtrl',
              templateUrl: 'app/pages/instructor/assignments/questionsets/questionSet.html'
            }
          },
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 300,
          },
        })
        .state('instructor.assignments.questionsets.questions', {
          url: '/questions',
          title: 'Questions',
          views:{
            'instructorview@instructor':{
              controller: 'QuestionCtrl',
              templateUrl: 'app/pages/instructor/assignments/questionsets/questions/question.html',
            }
          },
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 400,
          },
        })
        .state('instructor.events', {
          url: '/events',
          title: 'Events',
          resolve:{
             resSubevents:  function(){
                return {'subevents': 'A'};
             },
          },
           views:{
            'instructorview@instructor':{
              controller: 'EventCtrl',
              templateUrl: 'app/pages/instructor/events/event.html',
            }
          },
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 200,
          },
        })
        .state('instructor.events.subevents', {
          url: '/subevents',
          title: 'Subevents',
          views:{
            'instructorview@instructor':{
              controller: 'SubeventCtrl',
              templateUrl: 'app/pages/instructor/events/subevents/subevent.html'
            }
          },
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 300,
          },
        })
        .state('instructor.events.subevents.createsubevent', {
          url: '/createsubevent',
          title: 'Create Subevent',
          views:{
            'instructorview@instructor':{
              controller: 'CreateSubeventCtrl',
              templateUrl: 'app/pages/instructor/events/subevents/createsubevent.html'
            }
          },
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 300,
          },
        })
        .state('instructor.users', {
          url: '/users',
          title: 'Roster',
           views:{
            'instructorview@instructor':{
              controller: 'usersCtrl',
              templateUrl: 'app/pages/instructor/users/users.html',
            }
          },
          sidebarMeta: {
            icon: 'ion-ios-location-outline',
            order: 100,
          },
        })
        $urlRouterProvider.when('/instructor','/instructor/assignments');
  }

})();