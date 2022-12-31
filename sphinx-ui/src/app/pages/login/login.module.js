(function () {
  'use strict';

  angular.module('BlurAdmin.pages.login', [])
      .config(routeConfig)
      .controller('loginCtrl', ['$http','$scope','$location','config','toastr',function($http,$scope,$location,config,toastr) {

        $scope.login = function(){
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
                      url:  config.domain+'/auth/login/',
                      method: "POST",
                      data: { 'username' : $scope.username , 'password': $scope.password},
                      headers: {
                          'Access-Control-Allow-Origin': true,
                          'Content-Type': 'application/json; charset=utf-8',
                          "X-Requested-With": "XMLHttpRequest",
                          "CSRF-TOKEN": response.data.csrf_token
                          }
                    })
                    .then(function(response) {
                        $location.path('/course')
                        console.log(response)
                        toastr.success('user logged-in successfully!');
                    }, 
                    function(response) { // optional
                        console.log(response)
                        toastr.error(response.data.detail, 'Error');
                    });
            }, 
            function(response) { // optional
                    console.log(response)
                    toastr.error('issue with csrf-token', 'Error');
            });
          }
        }]);

          

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('login', {
          url: '/login',
          templateUrl: 'app/pages/login/login.html',
          controller: 'loginCtrl',
          title: 'login',
          sidebarMeta: {
            order: 800,
          },
        });
  }

})();