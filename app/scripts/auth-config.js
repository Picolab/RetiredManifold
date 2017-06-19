    // productions ------------------------------------------------------------------------
    //manifoldAuth.clientKey = "701FA2C0-04FC-11E7-B4DC-51DDE71C24E1";
    //manifoldAuth.callbackURL = "https://picolab.github.io/manifold/#/code";

    // localhost ------------------------------------------------------------------------
    // 
    manifoldAuth.clientKey = "7001E532-04FC-11E7-B4DC-51DDE71C24E1";
    manifoldAuth.anonECI = "85255500-0b65-0130-243c-00163ebcdddd"; // used for login not authorization?
    

    manifoldAuth.callbackURL = "http://localhost:9000/#/code";
    manifoldAuth.clientSecret = "cj3kdsqfp00037toijvewcybj";//change this to whatever secret is given in oauth_server
    manifoldAuth.host = "localhost:8080";
    manifoldAuth.customHost = "none";
    manifoldAuth.login_server = "localhost:8080";

    manifold.eventPath = "sky/event";
    manifold.functionPath = "sky/cloud";
    manifold.defaultHost = "localhost:8080";
    manifold.customHost = "none";

    manifoldAuth.defaultECI = "none";
    manifoldAuth.access_token = "none";
    wrangler.eventPath = "sky/event";
    wrangler.functionPath = "sky/cloud";
    wrangler.host = "kibdev.kobj.net";