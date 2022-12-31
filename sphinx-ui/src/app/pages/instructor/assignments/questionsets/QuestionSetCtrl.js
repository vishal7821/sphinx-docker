(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor')
      .directive('fileModel', ['$parse',
        function ($parse) {
          return {
            restrict: 'A',
            link: function(scope, element, attrs) {
              var model = $parse(attrs.fileModel);
              var modelSetter = model.assign;

              element.bind('change', function(){
                scope.$apply(function(){
                  if (element[0].files.length > 1) {
                    modelSetter(scope, element[0].files);
                  }
                  else {
                    modelSetter(scope, element[0].files[0]);
                  }
                });
              });
            }
          };
        }
      ])
      .controller('QuestionSetCtrl', QuestionSetCtrl);

  /** @ngInject */
  function QuestionSetCtrl($scope,$rootScope,$uibModal,$http, $location, $filter, editableOptions, editableThemes, config , toastr) {
    $http({
              url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_sets/',
              method: "GET",
              headers: {
                  'Access-Control-Allow-Origin': true,
                  'Content-Type': 'application/json; charset=utf-8',
                  "X-Requested-With": "XMLHttpRequest"
                  }
            })
            .then(function(response) {
              $scope.questionsets = response.data.questionsets;
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error(response.detail, 'Serer Error');
            });
    $scope.selectQuestionset = function (index){
      $rootScope.question_set_id = $scope.questionsets[index].id
      $location.path('/instructor/assignments/questionsets/questions')
      }

    $scope.removeQuestionSet = function(index) {
      // delete assignment 
      var questionset = $scope.questionsets[index]
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
                      url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+questionset.id+'/',
                      method: "DELETE",
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        $scope.questionsets.splice(index, 1);
                        toastr.success('Questionset deleted Successfully!');
                        console.log(response)
                    }, 
                    function(response) { // optional
                        console.log(response)
                        toastr.error(response.detail, 'Error');
                    });
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error(response.detail, 'Serer Error');
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


   $scope.selectQuestionset = function (index){
    $rootScope.question_set_id = $scope.questionsets[index].id
    $location.path('/instructor/assignments/questionsets/questions')
    }


    function addQuestionsetFile(question_set_id){
      var postData = new FormData();
      postData.append('question_file_path', $scope.questionset_file);
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
                      url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+question_set_id+'/question_file/',
                      method: "POST",
                      data: postData,
                      headers: {
                          "Content-Type": undefined,
                          'Access-Control-Allow-Origin': true,
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        console.log(response)
                        toastr.success('Questionset File submitted Successfully!');
                    }, 
                    function(response) { // optional
                        console.log(response)
                        toastr.error(response.detail, 'Error');

                    });
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error(response.detail, 'Error');
            });
    }


    $scope.addQuestionset = function() {
      $scope.inserted = {
        id: $scope.questionsets.length+1,
        name: $scope.name,
        total_marks: $scope.total_marks,
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
                      url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_sets/',
                      method: "POST",
                      data: { 'name' : $scope.name , 'total_marks': $scope.total_marks},
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        $scope.questionsets.push(response.data.questionset);
                        addQuestionsetFile(response.data.questionset.id);
                        toastr.success('QuestionSet created Successfully!');
                        console.log(response)
                    }, 
                    function(response) { // optional
                        toastr.error(response.detail, 'Error');
                        console.log(response)
                    });
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error(response.detail, 'Error');
            });
          };




    $scope.updateQuestionset = function($index) {
        var qs = $scope.questionsets[$index]
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
                          url: config.domain+'/course/'+$rootScope.course_id+'/assignment/'+$rootScope.assignment_id+'/question_set/'+qs.id+'/',
                          method: "PUT",
                          data: qs,
                          headers: {
                              'Access-Control-Allow-Origin': true,
                              'Content-Type': 'application/json; charset=utf-8',
                              "X-Requested-With": "XMLHttpRequest",
                              "CSRF-TOKEN": response.data.csrf_token
                              }
                        })
                        .then(function(response) {
                          toastr.success('Questionset updated Successfully!');
                            console.log(response)
                        }, 
                        function(response) { // optional
                            console.log(response)
                            toastr.error(response.detail, 'Error');
                        });
                }, 
                function(response) { // optional
                        console.log(response)
                        toastr.error(response.detail, 'Error');
                });
        };

    editableOptions.theme = 'bs3';
    editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
    editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    $scope.open = function (page, size) {
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
      }).result.then(function (data) {
                    $scope.name = data.name
                    $scope.total_marks = data.total_marks
                    $scope.questionset_file = data.question_file
                    $scope.addQuestionset()
                     console.log('close')
                 }, function () {
                     // action on popup dismissal.
                     console.log("fail")
                 });;};
  }

})();
