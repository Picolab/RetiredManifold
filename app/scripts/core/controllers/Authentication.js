'use strict';


var app = angular.module('Authentication');

app.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService','$window','$cookies',
    function ($scope, $rootScope, $location, AuthenticationService,$window,$cookies) {
        console.log("document ready");
        //manifoldAuth.retrieveSession($cookies);
        // only put static stuff here...
        AuthenticationService.plant_authorize_button();
        $scope.removeSession = function(clickEvent) {
            console.log("removing session");
            manifoldAuth.removeSession(true,$cookies); // true for hard reset (log out of login server too)
            window.open("https://" + manifoldAuth.login_server + "/login/logout?" + Math.floor(Math.random() * 9999999), "_blank");
        };
    }]);


app.controller('CodeController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService','$window','$routeParams','$cookies',
    function ($scope, $rootScope, $location, AuthenticationService,$window,$routeParams,$cookies) {
    console.log("CodeController ran, $routeParams", $routeParams);
    var params = $routeParams;
    angular.element(document).ready(function () {

    manifoldAuth.getOAuthAccessToken(params.code, params.state, $cookies,function(oauth_payload)
    {
      if (!oauth_payload.OAUTH_ECI) {
        alert("Authentication failed. We apologize for this inconvenience. Please try again.");
      } else {
             console.log("Authorized");
             $location.path('/'); // redirect to index
             $location.search('code', null); // remove code parameter 
             $location.search('state', null); // remove state parameter 
             $scope.$apply() // updated the scope of our changes 
            /// Devtools.initAccount({}, function(kns_directives){ // bootstraps
            //  console.log("Received directives from bootstrap.execute: ", kns_directives);
            //  $.mobile.loading("hide");
           //   window.location = "index.html";
           // });
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