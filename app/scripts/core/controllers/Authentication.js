'use strict';


var app = angular.module('Authentication');

app.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', '$window', '$cookies',
    function ($scope, $rootScope, $location, AuthenticationService, $window, $cookies) {
        console.log("document ready");
        //manifoldAuth.retrieveSession($cookies);
        // only put static stuff here...
        AuthenticationService.plant_authorize_button();
    }]);


app.controller('CodeController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService','$window','$routeParams','$cookies',
    function ($scope, $rootScope, $location, AuthenticationService,$window,$routeParams,$cookies) {
    console.log("CodeController ran, $routeParams", $routeParams);
    var params = $routeParams;
    angular.element(document).ready(function () {

    manifoldAuth.getOAuthAccessToken(params.code, params.state, $cookies,function(oauth_payload)
    {
      if (!oauth_payload.access_token) {
        alert("Authentication failed. We apologize for this inconvenience. Please try again.");
      } else {
             console.log("Authorized");
             $location.path('/'); // redirect to index
             $location.search('code', null); // remove code parameter 
             $location.search('state', null); // remove state parameter 
             $scope.$apply() // updated the scope of our changes 
           }
         },
         function(json){
          console.log("something went wrong with the OAuth authorization " + json);
          alert("Something went wrong with your authorization. Please try again. ");
          // not ideal, but...
          window.location = "https://kibdev.kobj.net/login";
        }
        );
    });
  }]);