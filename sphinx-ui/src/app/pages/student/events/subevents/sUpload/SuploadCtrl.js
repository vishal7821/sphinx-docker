(function () {
  'use strict';

  angular.module('BlurAdmin.pages.student')
  .controller('SuploadCtrl', SuploadCtrl)
  .controller('UploadModalInstanceCtrl', ['$scope','$rootScope', '$uibModalInstance','$http','config','toastr',
    function($scope,$rootScope, $uibModalInstance,$http,config,toastr) {

     $scope.createMainSubmission = function(data){
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
          url: config.domain+'/course/'+$rootScope.course_id+'/event/'+$rootScope.event_id+'/submissions/main/',
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
          console.log("solution submitted successfully")
          console.log(response)
          toastr.success('solution submitted successfully!');
          $uibModalInstance.close(response.data.file);
                                      //$uibModalInstance.close(response.data.enrollments);
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

      var reader = new FileReader();
      var file_sha1;
      reader.onload = function (event) {
          file_sha1 = sha1(event.target.result)
          var fd = new FormData()
          fd.append('file',$scope.solution_file)
          fd.append('file_hash',file_sha1)
          fd.append('access_code',$scope.access_code)
          $scope.createMainSubmission(fd)
        };
      reader.readAsArrayBuffer($scope.solution_file);

    
    };


    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);

  /** @ngInject */
  function SuploadCtrl($scope,$rootScope,$http, $filter,$location,$uibModal, editableOptions, editableThemes,config,resSubevent,toastr) {



       $scope.open = function (page, size) {
      $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope:$scope,
        controller:'UploadModalInstanceCtrl'
      }).result.then(function () {//data
                    
                    console.log('close')
                 }, function () {
                     // action on popup dismissal.
                     console.log("fail")
                 });
  };

  }

})();
