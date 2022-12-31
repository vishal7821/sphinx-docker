'use strict';

angular.module('myApp.loginApp', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'loginapp/loginapp.html',
    controller: 'loginCtrl'
  });
}])

.controller('loginCtrl', ['$http','$scope','$location',function($http,$scope,$location) {

	$scope.login = function(){
		console.log($scope.username)
		console.log($scope.password)

		$http({
        url: 'http://localhost:8080/login',
        method: "POST",
        data: { 'username' : $scope.username , 'password': $scope.password}
	    })
	    .then(function(response) {
	    		$location.path('/randApp')
	            console.log('login Successful')
	    }, 
	    function(response) { // optional
	            console.log('login error')
	    });
	}
}]);