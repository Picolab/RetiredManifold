
    'use strict';

// declare modules
angular.module('Authentication', []);

var manifold = angular
  .module('manifold', 
    [
    'Authentication',
    'theme',
    'theme.demos',
    'ngRoute',
    'ngCookies'
  ]// dependencies manifold needs
  );
  

  manifold.config(['$provide', '$routeProvider', function($provide, $routeProvider) {

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
        requireLogin: false
      })
      .when('/:templateFile', { // expects a parameter for this route
        templateUrl: function(param) {
          return 'views/' + param.templateFile + '.html';
        },
        requireLogin: false
      })
      .when('#', {
        templateUrl: 'views/index.html',
        requireLogin: false
      })

      .when('/extras-login2', {
        controller: 'LoginController', // authentication module
        templateUrl: 'views/index.html',
        requireLogin: false
      })
      .when('/code.html', {
        controller: 'CodeController',// authentication module
        templateUrl: 'modules/authentication/views/code.html',
        requireLogin: false
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);


  manifold.run(['$rootScope', '$location', '$cookieStore', '$http',
    function ($rootScope, $location, $cookieStore, $http) {
     $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and need to be authorize
            if (requireLogin && !wrangler.authenticatedSession()) {
                $location.path('/extras-login2');
            }
        });
}]);