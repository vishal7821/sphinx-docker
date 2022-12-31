/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
 (function () {
  'use strict';

  angular.module('BlurAdmin.pages.profile')
  .controller('ProfilePageCtrl', ProfilePageCtrl);

  /** @ngInject */
  function ProfilePageCtrl($scope,$rootScope,$uibModal,$http, $filter,$location, editableOptions, editableThemes,config,toastr) {


    $http({
      url: config.domain+'/auth/account/',
      method: "GET",
      headers: {
        'Access-Control-Allow-Origin': true,
        'Content-Type': 'application/json; charset=utf-8',
        "X-Requested-With": "XMLHttpRequest"
      }
    })
    .then(function(response) {
      $scope.account = response.data;
      $scope.name.selectedProgram = response.data.program;
                //$scope.firstName = response.data.first_name;
                $scope.name.lastName = response.data.last_name;
                $scope.name.rollno = response.data.roll_no;
                $scope.name.username = response.data.username;
                $scope.name.department = response.data.department;
                $scope.name.email= response.data.email;
                //$scope.password= response.data.;
                $scope.name.firstName = response.data.first_name;
              }, 
              function(response) { // optional
                console.log(response)
              });


    
    $scope.currentPassword = '';
    $scope.newPassword = '';
    $scope.confirmedPassword='';
    $scope.name = {  firstName: null ,
     lastName: null , 
     rollno: null, 
     username: null , 
     department: null,
     email: null,
     selectedProgram: null,
     currentPassword: null,
     newPassword: null,
     confirmedPassword: null

    };


     $scope.programs =[
     {name : "B.Tech."},
     {name : "B.Tech.Dual"},
     {name : "M.Tech."},
     {name : "PHD"}
     ];

     $scope.update = function (){
      //check if request is came for password and password is not empty
      // if($scope.confirmPassword !="" && $scope.password != $scope.confirmPassword){

      // }else{
      //   alert('New password should not empty and must be different from old password');
      // }
      //validate email

      var paramData={};   
      paramData['first_name'] = $scope.name.firstName;
      paramData['last_name'] = $scope.name.lastName;
      paramData['email'] = $scope.name.email;
      paramData['department'] = $scope.name.department;
      paramData['program'] = $scope.name.selectedProgram;

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
          url: config.domain+'/auth/account/',
          method: "PUT",
          data: paramData,
          headers: {
            'Access-Control-Allow-Origin': true,
            'Content-Type': 'application/json; charset=utf-8',
            "X-Requested-With": "XMLHttpRequest",
            "CSRF-TOKEN": response.data.csrf_token
          }
        })
        .then(function(response) {
          console.log(response);
          toastr.success('General Details updated Successfully!');
          // $scope.apiSuccessText = 'General Details updated successfully.';
          // $scope.apiSuccessFlag = true;
                      //handle api errors
                    }, 
                    function(response) { // optional
                      console.log(response)
                      toastr.error(response.data, 'Error');
                    });
      }, 
            function(response) { // optional
              console.log(response)
            });
    };

    //change password
    $scope.updatePassword = function (){
      //check if request is came for password and password is not empty
      // if($scope.confirmPassword !="" && $scope.password != $scope.confirmPassword){

      // }else{
      //   alert('New password should not empty and must be different from old password');
      // }
      //validate email

      if($scope.name.newPassword !== $scope.name.confirmedPassword ){
        $scope.apiErrorText = 'new password and confirmed password did not match, Try again.';
        $scope.apiErrorFlag = true;
      }else{
        var paramData={};  

        paramData['old_password'] = $scope.name.currentPassword;
        paramData['new_password_1'] = $scope.name.newPassword ;
        paramData['new_password_2'] = $scope.name.confirmedPassword ;



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
            url: config.domain+'/auth/password/change/',
            method: "POST",
            data: paramData,
            headers: {
              'Access-Control-Allow-Origin': true,
              'Content-Type': 'application/json; charset=utf-8',
              "X-Requested-With": "XMLHttpRequest",
              "CSRF-TOKEN": response.data.csrf_token
            }
          })
          .then(function(response) {
            console.log(response);
            toastr.success('Password updated Successfully!');
            // $scope.apiSuccessText = 'Password updated successfully.';
            // $scope.apiSuccessFlag =true;
                      //handle api errors
                    }, 
                    function(response) { // optional
                      if(response.data.old_password.code === 'NOKEY'){
                        toastr.error('current password is invalid/incorrect, Try again.', 'Error');
                        // $scope.apiErrorText = 'current password is invalid/incorrect, Try again.';
                        // $scope.apiErrorFlag = true;
                      }else if(response.data.old_password.code === 'NOVAL'){
                        toastr.error('new password and confirmed password did not match, Try again.', 'Error');
                        // $scope.apiErrorText = 'new password and confirmed password did not match, Try again.';
                        // $scope.apiErrorFlag = true;
                      } 
                      console.log(response)
                    });
        }, 
            function(response) { // optional
              console.log(response)
            });
      }

      
    };
    $scope.unconnect = function (item) {
      item.href = undefined;
    };

    $scope.showModal = function (item) {
      $uibModal.open({
        animation: false,
        controller: 'ProfileModalCtrl',
        templateUrl: 'app/pages/profile/profileModal.html'
      }).result.then(function (link) {
        item.href = link;
      });
    };

    $scope.getFile = function () {
      fileReader.readAsDataUrl($scope.file, $scope)
      .then(function (result) {
        $scope.picture = result;
      });
    };

    $scope.switches = [true, true, false, true, true, false];
  }

})();
