'use strict';

angular.module('Authentication')

.factory('AuthenticationService',
    [ '$http', '$cookieStore', '$rootScope', '$timeout','$window','$cookies',
    function ( $http, $cookieStore, $rootScope, $timeout, $window,$cookies) {
        var service = {};
        service.plant_authorize_button = function()
        {
            //Oauth
            console.log("plant authorize button");
            //var OAuth_URL = manifoldAuth.getOAuthURL();
            //$('#authorize-link').attr('href', OAuth_URL);
            var OAuth_kynetx_newuser_URL = manifoldAuth.getOAuthNewAccountURL();
            $('#create-link').attr('href', OAuth_kynetx_newuser_URL);
            
            $('#account-link').attr('href', "https://" + manifoldAuth.login_server + "/login/profile");
        };
        return service;
    }]);
