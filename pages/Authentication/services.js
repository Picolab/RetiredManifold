'use strict';

angular.module('Authentication')

.factory('AuthenticationService',
    [ '$http', '$cookieStore', '$rootScope', '$timeout','$window',
    function ( $http, $cookieStore, $rootScope, $timeout, $window) {
        var service = {};
        service.plant_authorize_button = function()
        {
            //Oauth through kynetx
            console.log("plant authorize button");
            var OAuth_kynetx_URL = manifoldAuth.getOAuthURL();
            $('#authorize-link').attr('href', OAuth_kynetx_URL);
            var OAuth_kynetx_newuser_URL = manifoldAuth.getOAuthNewAccountURL();
            $('#create-link').attr('href', OAuth_kynetx_newuser_URL);
            
            $('#account-link').attr('href', "https://" + manifoldAuth.login_server + "/login/profile");
            $('#account-link-2').attr('href', "https://" + manifoldAuth.login_server + "/login/profile");
            
            $('#logout-link').off('tap').on('tap', function(event) {
                window.open("https://" + manifoldAuth.login_server + "/login/logout?" + Math.floor(Math.random() * 9999999), "_blank");
                manifoldAuth.removeSession(true); // true for hard reset (log out of login server too)
                $.mobile.changePage('#page-authorize', {
                    transition: 'slide'
                }); // this will go to the authorization page.
            });
        };
        return service;
    }]);
