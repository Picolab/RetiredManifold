; (function()

{
    window.manifoldAuth = {};

  

    // ========================================================================
    // OAuth functions
    // ========================================================================

    // ------------------------------------------------------------------------
    manifoldAuth.getOAuthURL = function(fragment)
    {
        if (typeof manifoldAuth.login_server === "undefined") {
            manifoldAuth.login_server = manifoldAuth.host;
        }
        var current_client_state = window.localStorage.getItem("manifoldAuth_CLIENT_STATE");
        var client_state = current_client_state || Math.floor(Math.random() * 9999999);
        if (!current_client_state) {
            window.localStorage.setItem("manifoldAuth_CLIENT_STATE", client_state.toString());
        }
        var url = 'http://' + manifoldAuth.login_server +
        '/authorize?response_type=code' +
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


        var current_client_state = window.localStorage.getItem("manifoldAuth_CLIENT_STATE");
        console.log("current_client_state ",current_client_state);
        var client_state = current_client_state || Math.floor(Math.random() * 9999999);
        if (!current_client_state) {
            window.localStorage.setItem("manifoldAuth_CLIENT_STATE", client_state.toString());
        }
        var url = 'http://' + manifoldAuth.login_server +
        '/authorize/newuser?response_type=code' +
        '&redirect_uri=' + encodeURIComponent(manifoldAuth.callbackURL + (fragment || "")) +
        '&client_id=' + manifoldAuth.clientKey +
        '&state=' + client_state;
        console.log("client_state ",client_state);

        return (url)
    };

    // ------------------------------------------------------------------------
    manifoldAuth.getOAuthAccessToken = function(code, state, $cookies, callback, error_func)
    {
        var returned_state = parseInt(state);
        var expected_state = parseInt(window.localStorage.getItem("manifoldAuth_CLIENT_STATE"));
        if (returned_state !== expected_state) {
            console.warn("OAuth Security Warning. Client states do not match. (Expected %d but got %d)", manifoldAuth.client_state, returned_state);
        }
        console.log("getting access token with code: ", code);
        if (typeof (callback) !== 'function') {
            callback = function() { };
        }
        var url = 'http://' + manifoldAuth.login_server + '/token';
        var data = {
            "grant_type": "authorization_code",
            "redirect_uri": manifoldAuth.callbackURL,
            "client_id": manifoldAuth.clientKey,
            "code": code,
            "client_secret": manifoldAuth.clientSecret
        };

        return $.ajax({
            type: 'POST',
            url: url,
            data: data,
            dataType: 'json',
            success: function(json)
            {
                str = JSON.stringify(json, null, 4); // (Optional) beautiful indented output.
                console.log(str); // Logs output to dev tools console.
                console.log("Recieved following authorization object from access token request: ", JSON.stringify(json));
                if (!json.access_token) {
                    console.error("Received invalid OAUTH_ECI. Not saving session.");
                    callback(json);
                    return;
                };
                manifoldAuth.saveSession(json,$cookies);
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
    manifoldAuth.retrieveSession = function($cookies)
    {
        var TokenValue = $cookies.__SkySessionToken;

        console.log("Retrieving session ", TokenValue);
        if (typeof TokenValue !== "undefined") {
            manifoldAuth.defaultECI = TokenValue;
        } else {
            manifoldAuth.defaultECI = "none";
        }
        return manifoldAuth.defaultECI;
    };

    // ------------------------------------------------------------------------
    manifoldAuth.saveSession = function(token_json,$cookies)
    {
       var Session_ECI = token_json.access_token;
       var access_token = token_json.access_token;
       console.log("Saving session for ", Session_ECI);
       manifoldAuth.defaultECI = Session_ECI;
       manifoldAuth.access_token = access_token;
       $cookies["token_type"] = token_json.token_type;
       $cookies["__SkySessionToken"] = Session_ECI;
       $cookies["access_token"] = access_token;
       manifold.updateSession();
   };
    // ------------------------------------------------------------------------
    manifoldAuth.removeSession = function(hard_reset,$cookies)
    {
        console.log("Removing session ", manifoldAuth.defaultECI);
        if (hard_reset) {
            var cache_breaker = Math.floor(Math.random() * 9999999);
            var reset_url = 'https://' + manifoldAuth.login_server + "/login/logout?" + cache_breaker;
            $.ajax({
                type: 'POST',
                url: reset_url,
                success: function(json)
                {
                    console.log("Hard reset on " + manifoldAuth.login_server + " complete");
                }
            });
        }
        manifoldAuth.defaultECI = "none";
        delete $cookies.__SkySessionToken;
        delete $cookies.access_token;
    };

    // ------------------------------------------------------------------------
    manifoldAuth.authenticatedSession = function()
    {
        var authd = manifoldAuth.defaultECI != "none";
        if (authd) {
            console.log("Authenticated session");
        } else {
            console.log("No authenicated session");
        }
        return (authd);
    };

    manifoldAuth.clean = function(obj) {
       delete obj._type;
       delete obj._domain;
       delete obj._async;

   };

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
