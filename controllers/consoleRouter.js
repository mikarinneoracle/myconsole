var app = angular
  .module('myConsole', [
    'ngRoute',
  ])

  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '../views/jobs.html',
        controller: 'jobController'
      })
      .when('/add', {
        templateUrl: '../views/addJob.html',
        controller: 'jobController'
      })
      .when('/:id', {
        templateUrl: '../views/editJob.html',
        controller: 'jobController'
      })

      .otherwise({
        redirectTo: '/'
      });
  });
