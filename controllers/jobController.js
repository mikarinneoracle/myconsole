app.controller('jobController', function($location, $http, $rootScope, $scope, $routeParams)
{
	if($location.path() == '/')
	{
		$http.get('/jobs').success(function(response, err) {
			$scope.jobs = response['jobs'];
			console.log("FOUND " + $scope.jobs.length + " JOBS");
		});
	}

});
