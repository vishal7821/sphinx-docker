(function () {
  'use strict';

  angular.module('BlurAdmin.pages.student')
      .controller('userEventCtrl', userEventCtrl)
        
  function userEventCtrl($scope,$rootScope,$http, $filter,$location,$uibModal, editableOptions, editableThemes,config,resSubevents,toastr) {
    $http({
              url: config.domain+'/course/'+$rootScope.course_id+'/events/',
              method: "GET",
              headers: {
                  'Access-Control-Allow-Origin': true,
                  'Content-Type': 'application/json; charset=utf-8',
                  "X-Requested-With": "XMLHttpRequest"
                  }
            })
            .then(function(response) {
              $scope.event_list = response.data.events;
              console.log($scope.event_list)
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error(response.data, 'Error');
            });

    $scope.selectEvent = function (index){
      $rootScope.event_id = $scope.event_list[index].id
      resSubevents.subevents = $scope.event_list[index].subevents
      $location.path('/student/events/subevents')
      }
    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';
  }
})();



// #scope: $scope
