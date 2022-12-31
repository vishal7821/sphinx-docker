'use strict';

angular.module('myApp.randApp', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/randApp', {
    templateUrl: 'randapp/randapp.html',
    controller: 'randappCtrl'
  });
}])

.controller('randappCtrl', ['$http','$scope','$location',function($http,$scope,$location) {
		$scope.showbit = 1
		$scope.createRandom = function(){
			$http({
	        url: 'http://localhost:8080/randApp',
	        method: "POST",
	        data: { 'userdata' : $scope.userdata}
		    })
		    .then(function(response) {
		    		$scope.randomdata = response.data
		    		console.log(response)
		    		$scope.showbit = 0
		            console.log('login Successful')
		    }, 
		    function(response) { // optional
		    	$location.path('/login')
		        console.log('login error')
		    });
		}
}]);