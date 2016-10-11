; (function()

{
    window.manifoldAuth = {};

    // ------------------------------------------------------------------------
    manifoldAuth.clientKey = "CE2C9E4A-85F9-11E6-884F-74B0E71C24E1";
    //manifoldAuth.anonECI = "85255500-0b65-0130-243c-00163ebcdddd"; // used for login not authorization?
    manifoldAuth.callbackURL = "https://burdettadam.github.io/manifoldAuth/code.html";
    manifoldAuth.host = "kibdev.kobj.net"; // change to cs.kobj.net when in production
    manifoldAuth.login_server = "kibdev.kobj.net"; // change to accounts.kobj.net when in production
    //manifoldAuth.defaultECI = "none";
    //manifoldAuth.access_token = "none";

    // ========================================================================
    // OAuth functions
    // ========================================================================

    // ------------------------------------------------------------------------
    manifoldAuth.getOAuthURL = function(fragment)
    {
        if (typeof manifoldAuth.login_server === "undefined") {
            manifoldAuth.login_server = manifoldAuth.host;
        }
        var client_state = Math.floor(Math.random() * 9999999);
        var current_client_state = window.localStorage.getItem("manifoldAuth_CLIENT_STATE");
        if (!current_client_state) {
            window.localStorage.setItem("manifoldAuth_CLIENT_STATE", client_state.toString());
        }
        var url = 'https://' + manifoldAuth.login_server +
        '/oauth/authorize?response_type=code' +
        '&redirect_uri=' + encodeURIComponent(manifoldAuth.callbackURL + (fragment || "")) +
        '&client_id=' + manifoldAuth.clientKey +
        '&state=' + client_state;

        return (url)
    };

    manifoldAuth.getOAuthNewAccountURL = function(fragment)
    {
        if (typeof manifoldAuth.login_server === "undefined") {
            manifoldAuth.login_server = manifoldAuth.host;
        }


        var client_state = Math.floor(Math.random() * 9999999);
        var current_client_state = window.localStorage.getItem("manifoldAuth_CLIENT_STATE");
        if (!current_client_state) {
            window.localStorage.setItem("manifoldAuth_CLIENT_STATE", client_state.toString());
        }
        var url = 'https://' + manifoldAuth.login_server +
        '/oauth/authorize/newuser?response_type=code' +
        '&redirect_uri=' + encodeURIComponent(manifoldAuth.callbackURL + (fragment || "")) +
        '&client_id=' + manifoldAuth.clientKey +
        '&state=' + client_state;

        return (url)
    };

    // ------------------------------------------------------------------------
    manifoldAuth.getOAuthAccessToken = function(code, callback, error_func)
    {
        var returned_state = parseInt(getQueryVariable("state"));
        var expected_state = parseInt(window.localStorage.getItem("manifoldAuth_CLIENT_STATE"));
        if (returned_state !== expected_state) {
            console.warn("OAuth Security Warning. Client states do not match. (Expected %d but got %d)", manifoldAuth.client_state, returned_state);
        }
        console.log("getting access token with code: ", code);
        if (typeof (callback) !== 'function') {
            callback = function() { };
        }
        var url = 'https://' + manifoldAuth.login_server + '/oauth/access_token';
        var data = {
            "grant_type": "authorization_code",
            "redirect_uri": manifoldAuth.callbackURL,
            "client_id": manifoldAuth.clientKey,
            "code": code
        };

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
            success: function(json)
            {
                console.log("Recieved following authorization object from access token request: ", json);
                if (!json.OAUTH_ECI) {
                    console.error("Received invalid OAUTH_ECI. Not saving session.");
                    callback(json);
                    return;
                };
                manifoldAuth.saveSession(json);
                window.localStorage.removeItem("manifoldAuth_CLIENT_STATE");
                callback(json);
            },
            error: function(json)
            {
                console.log("Failed to retrieve access token " + json);
                error_func = error_func || function(){};
                error_func(json);
            }
        });
    };
    // ========================================================================
    // Session Management

    // ------------------------------------------------------------------------
    manifoldAuth.retrieveSession = function()
    {
        var SessionCookie = kookie_retrieve();

        console.log("Retrieving session ", SessionCookie);
        if (SessionCookie != "undefined") {
            manifoldAuth.defaultECI = SessionCookie;
        } else {
            manifoldAuth.defaultECI = "none";
        }
        return manifoldAuth.defaultECI;
    };

    // ------------------------------------------------------------------------
    manifoldAuth.saveSession = function(token_json)
    {
       var Session_ECI = token_json.OAUTH_ECI;
       var access_token = token_json.access_token;
       console.log("Saving session for ", Session_ECI);
       manifoldAuth.defaultECI = Session_ECI;
       manifoldAuth.access_token = access_token;
       kookie_create(Session_ECI);
   };
    // ------------------------------------------------------------------------
    manifoldAuth.removeSession = function(hard_reset)
    {
        console.log("Removing session ", manifoldAuth.defaultECI);
        if (hard_reset) {
            var cache_breaker = Math.floor(Math.random() * 9999999);
            var reset_url = 'https://' + manifoldAuth.login_server + "/login/logout?" + cache_breaker;
            $.ajax({
                type: 'POST',
                url: reset_url,
                headers: { 'Kobj-Session': manifoldAuth.defaultECI },
                success: function(json)
                {
                    console.log("Hard reset on " + manifoldAuth.login_server + " complete");
                }
            });
        }
        manifoldAuth.defaultECI = "none";
        kookie_delete();
    };

    // ------------------------------------------------------------------------
    manifoldAuth.authenticatedSession = function()
    {
        var authd = manifoldAuth.defaultECI != "none";
        if (authd) {
            console.log("Authenicated session");
        } else {
            console.log("No authenicated session");
        }
        return (authd);
    };

    // exchange OAuth code for token
    // updated this to not need a query to be passed as it wasnt used in the first place.
    manifoldAuth.retrieveOAuthCode = function()
    {
        var code = getQueryVariable("code");
        return (code) ? code : "NO_OAUTH_CODE";
    };

    function getQueryVariable(variable)
    {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        console.log('Query variable %s not found', variable);
        return false;
    };

    manifoldAuth.clean = function(obj) {
       delete obj._type;
       delete obj._domain;
       delete obj._async;

   };

   var SkyTokenName = '__SkySessionToken';
   var SkyTokenExpire = 7;

    // --------------------------------------------
    function kookie_create(SkySessionToken)
    {
        if (SkyTokenExpire) {
            // var date = new Date();
            // date.setTime(date.getTime() + (SkyTokenExpire * 24 * 60 * 60 * 1000));
            // var expires = "; expires=" + date.toGMTString();
            var expires = "";
        }
        else var expires = "";
        var kookie = SkyTokenName + "=" + SkySessionToken + expires + "; path=/";
        document.cookie = kookie;
        // console.debug('(create): ', kookie);
    }

    // --------------------------------------------
    function kookie_delete()
    {
        var kookie = SkyTokenName + "=foo; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";
        document.cookie = kookie;
        // console.debug('(destroy): ', kookie);
    }

    // --------------------------------------------
    function kookie_retrieve()
    {
        var TokenValue = 'undefined';
        var TokenName = '__SkySessionToken';
        var allKookies = document.cookie.split('; ');
        for (var i = 0; i < allKookies.length; i++) {
            var kookiePair = allKookies[i].split('=');
            // console.debug("Kookie Name: ", kookiePair[0]);
            // console.debug("Token  Name: ", TokenName);
            if (kookiePair[0] == TokenName) {
                TokenValue = kookiePair[1];
            };
        }
        // console.debug("(retrieve) TokenValue: ", TokenValue);
        return TokenValue;
    }

/*

    // ========================================================================
    // Login functions
    // ========================================================================
    manifoldAuth.login = function(username, password, success, failure) {


       var parameters = {"email": username, "pass": password};

       if (typeof manifoldAuth.anonECI === "undefined") {
           console.error("manifoldAuth.anonECI undefined. Configure manifoldAuth.js in manifoldAuth-config.js; failing...");
           return null;
       }

       return manifoldAuth.skyQuery("manifoldAuth",
        "cloudAuth", 
        parameters, 
        function(res){
                    // patch this up since it's not OAUTH
                    if(res.status) {
                       var tokens = {"access_token": "none",
                       "OAUTH_ECI": res.token
                   };
                   manifoldAuth.saveSession(tokens); 
                   if(typeof success == "function") {
                       success(tokens);
                   }
               } else {
                   console.log("Bad login ", res);
                   if(typeof failure == "function") {
                       failure(res);
                   }
               }
           },
           {eci: manifoldAuth.anonECI,
               errorFunc: failure
           }
           );


   };

*/
})();
