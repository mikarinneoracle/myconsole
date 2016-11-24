app.controller('jobController', function($location, $http, $rootScope, $scope, $routeParams)
{
	if($location.path() == '/')
	{
		$http.get('/jobs').success(function(response, err) {
			$scope.jobs = response['jobs'];
			$scope.date = response['date'];
		});
	}

	$scope.save = function(job) {
		console.log(job);
		$http.post('/jobs', job)
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
			// Edit job
			$http.get('/job/' + $routeParams.id).success(function(response, err) {
				$scope.job = response['job'];
			});
	} else //if($location.path() == '/add')
	{
		  // Add job defaults
			$scope.job = {};
			$scope.job.type = 'dbcs';
			$scope.job.operation = 'INFO';
	}

	$scope.changeState = function (id) {
		$http.post('/state/' + id)
		.success(function(response, err) {
			$scope.jobs = response['jobs'];
			var location = '/';
			$location.path(location);
			return;
		})
		.error(function(response, err) {
			alert(response.error);
			return;
		})
	}

	$scope.showAlert = function (id) {
			$http.get('/jobs').success(function(response, err) {
				var jobs = response['jobs'];
				alert(jobs[id].message);
			});
  }

});
