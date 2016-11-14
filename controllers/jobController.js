app.controller('jobController', function($location, $http, $rootScope, $scope, $routeParams)
{
	if($location.path() == '/')
	{
		$http.get('/jobs').success(function(response, err) {
			$scope.jobs = response['jobs'];
			console.log("FOUND " + $scope.jobs.length + " JOBS");
		});
	}

	$scope.add = function(job) {
		$http.put('/jobs', job)
		.success(function(response, err) {
			var location = '/';
			$location.path(location);
			return;
		})
		.error(function(response, err) {
			alert(response.error);
			return;
		})
	}

	if ($routeParams.id) {
		$http.post('/state/' + $routeParams.id)
		.success(function(response, err) {
			var location = '/';
			$location.path(location);
			return;
		})
		.error(function(response, err) {
			alert(response.error);
			return;
		})
	}

});
