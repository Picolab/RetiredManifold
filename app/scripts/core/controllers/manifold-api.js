; (function() {

	window.manifold = {};
	

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





