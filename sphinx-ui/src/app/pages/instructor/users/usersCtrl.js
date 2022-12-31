(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor')
      .controller('usersCtrl', usersCtrl)
        .controller('ModalInstanceCtrl', ['$scope','$rootScope', '$uibModalInstance','$http','config',
            function($scope,$rootScope, $uibModalInstance,$http,config) {
                $scope.createEnrollment = function(data){
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
                                    url: config.domain+'/course/'+$rootScope.course_id+'/enrollments/',
                                    method:"POST",
                                    data:data,
                                     headers: {
                                      "Content-Type": undefined,
                                      'Access-Control-Allow-Origin': true,
                                      "X-Requested-With": "XMLHttpRequest",
                                      "CSRF-TOKEN": response.data.csrf_token
                                      }
                                  })
                                  .then(function(response) {
                                      console.log("event created successfully")
                                      console.log(response)
                                      $uibModalInstance.close(response.data.enrollments);
                                  }, 
                                  function(response) { // optional
                                      console.log(response)
                                  });
                             }, 
                          function(response) { // optional
                                  console.log(response)
                          });
                }
                $scope.ok = function () {
                  var fd = new FormData()
                  fd.append('enrollment_file',$scope.enrollment_file)
                  $scope.createEnrollment(fd)
                };

                $scope.cancel = function () {
                  $uibModalInstance.dismiss('cancel');
                };
              }]);

  /** @ngInject */
  function usersCtrl($scope,$rootScope,$http, $filter,$location,$uibModal, editableOptions, editableThemes,config) {
    $http({
              url: config.domain+'/course/'+$rootScope.course_id+'/enrollments/',
              method: "GET",
              headers: {
                  'Access-Control-Allow-Origin': true,
                  'Content-Type': 'application/json; charset=utf-8',
                  "X-Requested-With": "XMLHttpRequest"
                  }
            })
            .then(function(response) {
              $scope.enrollment_list = response.data.enrollments;
              console.log($scope.enrollment_list)
            }, 
            function(response) { // optional
                    console.log(response)
            });


    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';
    

    $scope.open = function (page, size) {
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        controller:'ModalInstanceCtrl'
      }).result.then(function (data) {
                    for(var d in data){
                      $scope.enrollment_list.push(data[d]);
                    }
                    console.log('close')
                 }, function () {
                     // action on popup dismissal.
                     console.log("fail")
                 });
      };

    $scope.updateEnrollment = function(index){
      var enrollment = $scope.enrollment_list[index]

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
                url: config.domain+'/course/'+$rootScope.course_id+'/enrollment/'+enrollment.id+'/',
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
                  console.log(response)
              }, 
              function(response) { // optional
                  console.log(response)
              });
            }, 
            function(response) { // optional
                    console.log(response)
            }
      );
      }

    $scope.removeEnrollment = function(index){
       // delete assignment 
      var enrollment = $scope.enrollment_list[index]
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
                      url: config.domain+'/course/'+$rootScope.course_id+'/enrollment/'+enrollment.id+'/',
                      method: "DELETE",
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        $scope.enrollment_list.splice(index, 1);
                        console.log(response)
                    }, 
                    function(response) { // optional
                        console.log(response)
                    });
            }, 
            function(response) { // optional
                    console.log(response)
            });
      };
  }
})();



// #scope: $scope
