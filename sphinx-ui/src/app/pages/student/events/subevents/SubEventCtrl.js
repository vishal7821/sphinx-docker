(function () {
  'use strict';

  angular.module('BlurAdmin.pages.student')
      .controller('SubEventCtrl', SubEventCtrl);

  /** @ngInject */
  function SubEventCtrl($scope,$rootScope,$http, $filter,$location,$uibModal, editableOptions, editableThemes,config,resSubevents,resSubevent,toastr) {

    //get list of events 
    $scope.subevents = resSubevents.subevents

    $scope.subeventsProp = new Array();
            // or var arr = [];
          //arr.push('value1');
    var currTime = new Date();
      var startTime;
      var endTime;
      var allflags = {
        QVIEW : true,
        SUPLOAD : true,
        SVIEW : false,
        GVIEW : false,
        AVIEW : false,
        GUPLOAD : false,
        RGREQ : false,
        RGUPLOAD : false
      };
      //function to compute all subevent info
    $scope.computeSubeventsInfo = function () {
        var currentPercentage;  

        $scope.subevents.forEach(function (subEv) {

        startTime = new Date(subEv.start_time);
        endTime = new Date(subEv.end_time);
        currentPercentage = ((currTime - startTime)/(endTime - startTime))*100;
        allflags[subEv.type] = true;
              $scope.subeventsProp.push({
                startT : startTime.toLocaleString(),
                endT :endTime.toLocaleString() ,
                currPer : currentPercentage,
                flags : allflags
              });
            });

    };
    $scope.computeSubeventsInfo();
     
    
    $scope.uploadSol = function (index){
      $rootScope.sub_event_id = $scope.subevents[index].id
      resSubevent.subevent = $scope.subevents[index]
      $location.path('/student/events/subevents/supload')
      }

  }

})();
