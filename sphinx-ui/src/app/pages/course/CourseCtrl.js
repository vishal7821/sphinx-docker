(function () {
  'use strict';

  angular.module('BlurAdmin.pages.instructor')
      .controller('CourseCtrl', CourseCtrl);

  /** @ngInject */
  function CourseCtrl($location, $scope,$rootScope, $filter,$http, editableOptions, editableThemes,config) {
      $scope.courses_as_instructor = [];
      $scope.courses_as_student = [];
      $scope.courses_as_grader = [];
      $scope.courses_as_tutor = [];
      $http({
                url:  config.domain+'/courses/',
                method: "GET",
                headers: {
                    'Access-Control-Allow-Origin': true,
                    'Content-Type': 'application/json; charset=utf-8',
                    "X-Requested-With": "XMLHttpRequest"
                    }
              })
              .then(function(response) {
                var courses = response.data.courses;
                $scope.courses_as_student = get_courses_by_roles(courses,1);
                $scope.courses_as_grader = get_courses_by_roles(courses,2);
                $scope.courses_as_tutor = get_courses_by_roles(courses,3);
                $scope.courses_as_instructor = get_courses_by_roles(courses,4);
              }, 
              function(response) { // optional
                      console.log(response)
              });
       $scope.select_course = function (course_id,role){
          $rootScope.course_id = course_id
          if(role === 'instructor'){
            $location.path('/instructor/assignments')
          }
         else if(role === 'student'){
            $location.path('/student/events')
          }
        }
  }

  function get_courses_by_roles(courses, roleid) {
        var course_list = [];
        for(var c in courses){
          var x = courses[c];
          if(x.enrollment_role_id == roleid){
            course_list.push(x)
          }
        }
        return course_list
      }
 

})();
