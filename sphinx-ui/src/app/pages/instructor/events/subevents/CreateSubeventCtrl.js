(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor')
      .controller('CreateSubeventCtrl', CreateSubeventCtrl)
      .directive('fileModel', ['$parse', function ($parse) {
            return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                  var model = $parse(attrs.fileModel);
                  var modelSetter = model.assign;
                  
                  element.bind('change', function() {
                     scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                     });
                  });
               }
            };
         }]);


  /** @ngInject */
  function CreateSubeventCtrl($scope, $filter,$http,$rootScope, editableOptions, editableThemes, resSubevents,config,toastr) {

    //get list of events 
    $scope.subevent = {}

    $scope.types = config.subevent_types
    $scope.allow_late_ending_values = config.bool_val
    
    $scope.type ={selected:$scope.types[0]}
    $scope.subevent.allow_late_ending = $scope.allow_late_ending_values[1]
    
    $scope.sbms = config.submission_modes
    $scope.subevent.SBM = $scope.sbms[0]

    $scope.sgss = config.submission_group_scheme
    $scope.subevent.SGS = $scope.sgss[0]

    $scope.qsss = config.question_set_scheme
    $scope.subevent.QSS = $scope.qsss[0]
    $scope.nacs = $scope.allow_late_ending_values = config.bool_val
    $scope.subevent.NAC =$scope.nacs[0]
    $scope.subevent.SUP =$scope.nacs[1]

    //gupload parameters
    $scope.gdss = config.grading_duty_schemes
    $scope.subevent.GDS = $scope.gdss[0]
    $scope.subevent.REP =0
    $scope.subevent.gen_subevent = null;
    //var subeventIdArr = new Array();

    function process_subevent_elements(subevent,fd){
      for (var property in subevent) {
        if(property === 'gen_subevent'){
            if($scope.subevent.type.value ==='GUPLOAD'){
              fd.append(property, subevent[property])
            }
        }else{
          if(['start_time','end_time','late_end_time','display_end_time', 'display_late_end_time'].indexOf(property) >= 0){
            format_time_fields(subevent,property)
          }
          if (subevent && subevent[property] && subevent.hasOwnProperty(property) && typeof subevent[property] == "object" && subevent[property].hasOwnProperty('value') ) {
              fd.append(property, subevent[property].value)
          }
          else{
              fd.append(property, subevent[property]) 
          }
        }
          
      }
    }

    // function process_all_subevents(){


    //       if($scope.type ==='GUPLOAD'){
    //           $scope.subevent.gen_subevent = subeventIdArr;
    //       }
    //       if($rootScope.subevents != null || $rootScope.subevents.length>0){
    //         $rootScope.subevents.forEach(function (subEv) {
    //           subeventIdArr.push(Number.parseInt(subEv.id));
    //         });
    //       }
    //       $scope.subevent.gen_subevent = subeventIdArr;
    // }

    function format_time_fields(subevent,field){
      subevent[field] = new Date(subevent[field]).toISOString()
    }

    $scope.createSubevent = function(){
      var fd = new FormData();
      var subevent = $scope.subevent

      //process_all_subevents();
      process_subevent_elements(subevent,fd)
      for (var key of fd.entries()) {
              console.log(key[0] + ', ' + key[1]);
            }
      // do post request for subevent



      $http({
            url:  config.domain+'/auth/csrf_token',
            method: "GET",
            headers: {
                'Access-Control-Allow-Origin': true,
                'Content-Type': 'application/json; charset=utf-8',
                "X-Requested-With": "XMLHttpRequest"
                }
            })
            .then(function(response) {
                $http({
                      url: config.domain+'/course/'+$rootScope.course_id+'/event/'+$rootScope.event_id+'/subevents/',
                      method: "POST",
                      data:fd,
                      headers: {
                          "Content-Type": undefined,
                          'Access-Control-Allow-Origin': true,
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        console.log(response)
                        toastr.success('subevent created Successfully!');
                    }, 
                    function(response) { // optional
                        console.log(response)
                        toastr.error(response.data, 'Error');
                    });
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error(response.data, 'Error');
            });
          };
  }

})();
