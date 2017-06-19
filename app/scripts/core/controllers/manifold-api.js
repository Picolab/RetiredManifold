; (function() {

	window.manifold = {};
	

    var check_eci = function(eci) {
       var res = eci || manifoldAuth.defaultECI;
       if (res === "none") {
           throw "No manifold event channel identifier (ECI) defined";
       }
       return res;
    };

    var mkEsl = function(parts,host) {
    	if (manifold.host === "none") { // I dont think this will ever be true.....
        	throw "No manifold host defined";
    	}
    	parts.unshift(host); // adds host to beginning of array
    	var res = 'http://'+ parts.join("/"); // returns a url structure string
    	return res;
    };

    manifold.raiseEvent = function(eventDomain, eventType, eventAttributes, callback, options)
    {
     try {

       options = options || {};
       options.eci = options.eci || manifoldAuth.defaultECI; //<-- is this vallid?
       callback = callback || function(){};

      var timeoutWrapper = function(){
        var delayTime = options.delayTime || 500;//see prelude for more info on delayTime
        if(Number.isInteger(delayTime)){
          if(delayTime >= 0){
            if(delayTime < 5001){//5001 prevents someone trying a timeout that is ridiculously long
              setTimeout(callback,delayTime);
            }else{
              throw "options.delayTime must be < 5001";
            }
          }else{
            throw "options.delayTime must be >= 0";
          }
        }else{
          throw "Invalid timeout parameter under options.delayTime";
        }
      }

       var eci = check_eci(options.eci);
           var eid = Math.floor(Math.random() * 9999999); 
           //url constructor
           var esl = mkEsl(
            //['sky/event',
            [  options._path || manifold.eventPath ,
            eci,
            eid,
            eventDomain,
            eventType
            ],options._host || manifold.host);

         console.log("manifold.raise ESL: ", esl);
         console.log("event attributes: ", eventAttributes);

         return $.ajax({
          type: 'POST',
          url: esl,
          data: $.param(eventAttributes),
          dataType: 'json',
      		success: timeoutWrapper,
      		error: options.errorFunc || function(res) { console.error(res) }
        });
       } catch(error) {
         console.error("[raise]", error);
         return null;
       }
     };

    manifold.skyQuery = function(ruleset, func_name, parameters, getSuccess, options)
    {
      //put options stuff here.
    	try {
          options = options || {};
          options.eci = options.eci || manifoldAuth.defaultECI; //<-- is this vallid?
          parameters = parameters || {};
          var retries = 2;

          if (typeof options.repeats !== "undefined") {
              console.warn("This is a repeated request: ", options.repeats);
              if (options.repeats > retries) {
                throw "terminating repeating request due to consistent failure.";
            }
        }
        console.log("ManifoldAuthECI", manifoldAuth.defaultECI);
        var eci = check_eci(options.eci);
        //url constructor
        var esl = mkEsl(
          //['sky/cloud',
          [ options._path || manifold.functionPath ,
            eci,
            ruleset,
            func_name
            ], options._host || manifold.defaultHost);


        var process_error = function(res)
        {
          console.error("skyQuery Server Error with esl ", esl, res);
          if (typeof options.errorFunc === "function") {
            options.errorFunc(res);
        }
    };

    var process_result = function(res) // whats this for???
    {
      console.log("Seeing res ", res, " for ", esl);
      var sky_cloud_error = typeof res === 'Object' && typeof res.skyQueryError !== 'undefined';
      if (! sky_cloud_error ) {
        getSuccess(res);
    } else {
        console.error("skyQuery Error (", res.skyQueryError, "): ", res.skyQueryErrorMsg);
        if (!!res.httpStatus && 
         !!res.httpStatus.code && 
         (parseInt(res.httpStatus.code) === 400 || parseInt(res.httpStatus.code) === 500)) 
        {
         console.error("The request failed due to an ECI error. Going to repeat the request.");
         var repeat_num = (typeof options.repeats !== "undefined") ? ++options.repeats : 0;
         options.repeats = repeat_num;
    			// I don't think this will support promises; not sure how to fix
    			manifold.skyQuery(ruleset, func_name, parameters, getSuccess, options);
            }
        }
    };

    	console.log("sky cloud call to ", func_name, " on ", esl, " with token ", eci);

    	return $.ajax({
      	type: 'GET',
      	url: esl,
      	dataType: 'json',
    		success: process_result
        });
    	} catch(error) {
       		console.error("[skyQuery]", error);
       		if (typeof options.errorFunc === "function") {
          	options.errorFunc();
      		} 
      		return null;
    	}
	};


	manifold.createThing = function(name, callback)
	{
		if(typeof name === "string"){
			var eventAttrs = { 'name': name};
			var updateCallback = function(){
				manifold.updateSession(callback,true);//force refresh
			}
			wrangler.createChild(eventAttrs,updateCallback);
		}else{
			console.error("Attribute \"name\" is not a string!");
		}
	};

	manifold.deleteThing = function(name, callback){
		if(typeof name === "string"){
			var eventAttrs = {'pico_name': name};
			var updateCallback = function(){
				manifold.updateSession(callback,true);
			}
			wrangler.deleteChild(eventAttrs,updateCallback);
		}
	};

   /**
	*  Takes the given callback method and inserts the array of things into it as the sole parameter
	*  thing object: {
	*	 'name': "name",
	*	 'eci': "eci",
	*	 'communities': [array of communities]
	*   }
	*/
	manifold.getThings = function(callback)
	{
		var getThingsCallback = function(res){
			children = res.children;
			console.log("Children", children);
			var things = [];
			for (var i = 0; i < children.length; i++) {
				var thing = {
					'name': children[i].name,
					'eci': children[i].eci
					//add more info into the "thing" object here to set it apart from the array of children
				}
				things.push(thing);
			}
			console.log("Things", things);
			sessionStorage.setItem('things', JSON.stringify(things));
			if(callback !== undefined){
				callback(things);
			}
		}
		wrangler.children(null,getThingsCallback);
	};

	manifold.updateSession = function(optionalCallback, override){
		if(override === undefined){
			override = false;
		}

		var isCached = function(){
      		if(sessionStorage.getItem('things') !== undefined && sessionStorage.getItem('things') !== null){
        		return true;
        	}
        	return false;
      	}

      	var setSessionStorage = function(result){
      		sessionStorage.setItem('things', JSON.stringify(result));
      		if(optionalCallback !== undefined && optionalCallback !== null){
      			if(typeof optionalCallback === "function"){
      				optionalCallback();
      			}else{
      				console.error("Invalid optionalCallback.");
      			}
      		}
      		console.log("Result in setSessionStorage", result);
      	}

      	if(typeof override === "boolean"){
      		if(!isCached()){//if not cached, go get info from the server
        		manifold.getThings(setSessionStorage);
      		}else if(override){//override can force a refresh
      			manifold.getThings(setSessionStorage);
      		}
      	}else{
      		console.error("Invalid \"override\" parameter");
      	}
	};
})();





