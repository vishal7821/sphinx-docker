(function () {
  'use strict';

  angular.module('BlurAdmin.pages.student', [])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider,$urlRouterProvider) {
    $urlRouterProvider.when('/student','/student/events');
    $stateProvider
        .state('student', {
          url: '/student',
          templateUrl: 'app/pages/student/student.html',
          title: 'Student Home',
          sidebarMeta: {
            icon: 'ion-person',
            order: 100,
          },
        })
        .state('student.events', {
          url: '/events',
          title: 'Action on Events',
          resolve:{
             resSubevents:  function(){
                return {'subevents': 'A'};
             },
          },
           views:{
            'studentview@student':{
              controller: 'userEventCtrl',
              templateUrl: 'app/pages/student/events/event.html',
            }
          },
          sidebarMeta: {
            icon: 'ion-person',
            order: 200,
          },
        })
         .state('student.events.subevents', {
          url: '/subevents',
          title: 'Subevents',
          resolve:{
             resSubevent:  function(){
                return {'subevent': 'A'};
             },
          },
          views:{
            'studentview@student':{
              controller: 'SubEventCtrl',
              templateUrl: 'app/pages/student/events/subevents/allSubEvents.html'
            }
          },
          sidebarMeta: {
            icon: 'ion-person',
            order: 300,
          },
        })
         .state('student.events.subevents.supload', {
          url: '/supload',
          title: 'Solution upload',
          views:{
            'studentview@student':{
              controller: 'SuploadCtrl',
              templateUrl: 'app/pages/student/events/subevents/sUpload/supload.html'
            }
          },
          sidebarMeta: {
            icon: 'ion-person',
            order: 400,

          },
        })
      }
})();