(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor')
      .controller('EventCtrl', EventCtrl)
        .controller('EventModalInstanceCtrl', ['$scope','$rootScope', '$uibModalInstance','$http','config','toastr',
            function($scope,$rootScope, $uibModalInstance,$http,config,toastr) {

                // $scope.items = items;
                // $scope.selected = {
                //   item: $scope.items[0]
                // };


                $http({
                      url: config.domain+'/course/'+$rootScope.course_id+'/assignments/',
                      method: "GET",
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest"
                          }
                    })
                    .then(function(response) {
                      $scope.assignment_list = response.data.assignments;
                      $scope.assign = {selected:$scope.assignment_list[0]}

                      console.log($scope.assignment_list)
                    }, 
                    function(response) { // optional
                            toastr.error('please contact administrator', 'Serer Error');
                            console.log(response)
                    });

                $scope.createEvent = function(data){
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
                                    url: config.domain+'/course/'+$rootScope.course_id+'/events/',
                                    method:"POST",
                                    data:data,
                                    headers: {
                                        'Content-Type': 'application/json; charset=utf-8',
                                        'Access-Control-Allow-Origin': true,
                                        "X-Requested-With": "XMLHttpRequest",
                                        "CSRF-TOKEN": response.data.csrf_token
                                        }
                                  })
                                  .then(function(response) {
                                      console.log(response)
                                      toastr.success('event created Successfully!');
                                      $uibModalInstance.close(response.data.event);

                                  }, 
                                  function(response) { // optional
                                      toastr.error(response.data, 'Error');
                                      console.log(response)
                                  });
                             }, 
                          function(response) { // optional
                                  toastr.error(response.data, 'Error');
                                  console.log(response)
                          });
                }
    
                $scope.agg_methods = config.agg_methods
                $scope.bool_val = config.bool_val

                $scope.agg_method ={selected:$scope.agg_methods[0]}
                $scope.is_external = {selected:$scope.bool_val[1]}
                $scope.name = ""

                $scope.ok = function () {
                  console.log($scope.assign)
                  var data = {'name':$scope.name, 'assignment_id':$scope.assign.selected['id'],
                          'grade_aggregation_method': $scope.agg_method.selected['value']}
                  $scope.createEvent(data)
                };

                $scope.cancel = function () {
                  $uibModalInstance.dismiss('cancel');
                };
              }]);

  /** @ngInject */
  function EventCtrl($scope,$rootScope,$http, $filter,$location,$uibModal, editableOptions, editableThemes,config,resSubevents,toastr) {
    $scope.agg_methods = config.agg_methods
    $scope.bool_val = config.bool_val

    $http({
              url: config.domain+'/course/'+$rootScope.course_id+'/all_events/',
              method: "GET",
              headers: {
                  'Access-Control-Allow-Origin': true,
                  'Content-Type': 'application/json; charset=utf-8',
                  "X-Requested-With": "XMLHttpRequest"
                  }
            })
            .then(function(response) {
              $scope.events = response.data.events;
              console.log($scope.events)
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error(response.data, 'Error');
            });

    

    $scope.selectevent = function (index){
      $rootScope.event_id = $scope.events[index].id
      resSubevents.subevents = $scope.events[index].subevents
      $rootScope.subevents = $scope.events[index].subevents
      $location.path('/instructor/events/subevents')
    }  

    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';
    

    $scope.open = function (page, size) {
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope:$scope,
        controller:'EventModalInstanceCtrl'
      }).result.then(function (data) {
                    $scope.events.push(data);
                    console.log('close')
                 }, function () {
                     // action on popup dismissal.
                     console.log("fail")
                 });
  };

    $scope.updateEvent = function(index){
      var event = $scope.events[index]
      // put assignment

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
                      url: config.domain+'/course/'+$rootScope.course_id+'/event/'+event.id+'/',
                      method: "PUT",
                      data: event,
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        toastr.success('event updated Successfully!');
                        console.log(response)
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
    }

    $scope.removeEvent = function(index){
       // delete assignment 
      var event = $scope.events[index]
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
                      url: config.domain+'/course/'+$rootScope.course_id+'/event/'+event.id+'/',
                      method: "DELETE",
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        $scope.events.splice(index, 1);
                        toastr.success('event deleted Successfully!');
                        console.log(response)
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



// #scope: $scope
