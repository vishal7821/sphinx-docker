(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor')
      .controller('AssignmentCtrl', AssignmentCtrl);

  /** @ngInject */
  function AssignmentCtrl($scope,$rootScope,$http, $filter,$location, editableOptions, editableThemes,config,toastr) {
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
                $scope.assignments = response.data.assignments;
              }, 
              function(response) { // optional
                      toastr.error('please contact administrator', 'Serer Error');
                      console.log(response)
              });
    $scope.selectassignment = function (index){
      $rootScope.assignment_id = $scope.assignments[index].id
      $location.path('/instructor/assignments/questionsets')
      }

    $scope.removeAssignment = function(index) {
      // delete assignment 
      var assign = $scope.assignments[index]
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
                      url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+assign.id,
                      method: "DELETE",
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        $scope.assignments.splice(index, 1);
                        toastr.success('assignment deleted Successfully!');
                    }, 
                    function(response) { // optional
                        console.log(response)
                        toastr.error(response.detail, 'Error');
                    });
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error('please contact administrator', 'Serer Error');
            });

    };

  function make_assignment_name(length) {
     var result           = '';
     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     var charactersLength = characters.length;
     for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
     }
     return result;
  }
    $scope.addAssignment = function() {
      var assign_name = 'Assign '+make_assignment_name(5)
      $scope.inserted = {
        id: $scope.assignments.length+1,
        name: assign_name,
        comments: null,
      };
      // post assignment

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
                      url: config.domain+'/course/'+$rootScope.course_id+'/assignments/',
                      method: "POST",
                      data: { 'name' : assign_name , 'comments': null},
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        $scope.assignments.push(response.data.assignment);
                        console.log(response)
                        toastr.success('assignment created successfully!');

                    }, 
                    function(response) { // optional
                        console.log(response)
                        toastr.error(response.detail, 'Error');
                    });
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error('please contact administrator', 'Serer Error');
            });
    };


    $scope.updateAssignment = function($index) {
        var assign = $scope.assignments[$index]
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
                          url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+assign.id+'/',
                          method: "PUT",
                          data: assign,
                          headers: {
                              'Access-Control-Allow-Origin': true,
                              'Content-Type': 'application/json; charset=utf-8',
                              "X-Requested-With": "XMLHttpRequest",
                              "CSRF-TOKEN": response.data.csrf_token
                              }
                        })
                        .then(function(response) {
                            console.log(response)
                            toastr.success('assignment updated successfully!');
                        }, 
                        function(response) { // optional
                            console.log(response)
                            toastr.error(response.detail, 'Error');
                        });
                }, 
                function(response) { // optional
                        console.log(response)
                        toastr.error('please contact administrator', 'Serer Error');
                });
        };

    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';


  }

})();
