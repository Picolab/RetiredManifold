'use strict';


var app = angular.module('Authentication');

app.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService','$window',
    function ($scope, $rootScope, $location, AuthenticationService,$window) {
        console.log("document ready");
        wrangler.retrieveSession();
        // only put static stuff here...
        AuthenticationService.plant_authorize_button();
    }]);


app.controller('CodeController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService','$window',
    function ($scope, $rootScope, $location, AuthenticationService,$window) {

    wrangler.getOAuthAccessToken(wrangler.retrieveOAuthCode(), function(oauth_payload)
    {
      if (!oauth_payload.OAUTH_ECI) {
        alert("Authentication failed. We apologize for this inconvenience. Please try again.");
      } else {
             console.log("Authorized");            // display authorization 
            /// Devtools.initAccount({}, function(kns_directives){ // bootstraps
            //  console.log("Received directives from bootstrap.execute: ", kns_directives);
            //  $.mobile.loading("hide");
           //   window.location = "index.html";
           // });
             window.location = "index.html";
           }
         },
         function(json){
          console.log("something went wrong with the OAuth authorization " + json);
          alert("Something went wrong with your authorization. Please try again. ");
          // not ideal, but...
          window.location = "https://kibdev.kobj.net/login";
        }
        );
    }]);