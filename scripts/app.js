
    'use strict';

// declare modules
angular.module('Authentication', []);

var app = angular
  .module('manifold', 
    [
    'Authentication',
    'theme',
    'theme.demos',
    'ngRoute',
    'ngCookies'
  ]// dependencies manifold needs
  );
  

  app.config(['$provide', '$routeProvider', function($provide, $routeProvider) {

    $routeProvider 
      .when('/', {
        templateUrl: 'views/index.html',
        resolve: {
          loadCalendar: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load([
              'bower_components/fullcalendar/fullcalendar.js',
            ]);
          }]
        },
      })
      .when('/:templateFile', { // expects a parameter for this route
        templateUrl: function(param) {
          return 'views/' + param.templateFile + '.html';
        },
      })
      .when('#', {
        templateUrl: 'views/index.html',
      })

      .when('/extras-login2', {
        controller: 'LoginController', // authentication module
        templateUrl: 'views/index.html',
      })
      .when('/code.html', {
        controller: 'CodeController',// authentication module
        templateUrl: 'modules/authentication/views/code.html',
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);


  app.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
     $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and need to be authorize
            if ($location.path() !== '/extras-login2' && !manifold.authenticatedSession()) {
                $location.path('/extras-login2');
            }
        });
}]);