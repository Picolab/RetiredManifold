; (function() {

	window.manifold = {};
	

	manifold.createThing = function(name, postFunction, options)
	{
		if(typeof name === "string"){
			var eventAttrs = { 'name': name};
			wrangler.createChild(eventAttrs,postFunction,options);//postFunction and options may be undefined
		}else{
			console.error("Attribute \"name\" is not a string!");
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
			callback(things);
		}
		wrangler.children(null,getThingsCallback);
	};

	/**
	* @param asyncCallback a function that uses $scope.$apply when setting a $scope variable. This is the callback passed 
	*  		 in when an ajax call is made to the server to retrieve information
	* @param updateFunction a function the does not use $scope.$apply when setting the same $scope variable. This 
	*		 function avoids the "$digest already in progress" error
	*/
	manifold.updateSession = function(asyncCallback, updateFunction, newThing){
		var checkExistence = function(){
      		if(sessionStorage.getItem('things') !== undefined && sessionStorage.getItem('things') !== null){
        		return true;
        	}
        	return false;
      	}

      	if(checkExistence()){
        	var theList = $.parseJSON(sessionStorage.getItem('things'));
        	if(typeof newThing === "object"){//if provided with an object, go ahead and push it/save it
          		theList.push(newThing);
          		sessionStorage.setItem('things', JSON.stringify(theList));
        	}
        	//now assign the value in the controller to this value
        	updateFunction(theList);//dont use the async function... we need to avoid $scope.$apply
      	}else{//perform an ajax call to get the info from the server
        	manifold.getThings(asyncCallback);
      	}
	};
})();





