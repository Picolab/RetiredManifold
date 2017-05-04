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
	*  @return array of thing objects
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
			callback(things);
		}
		wrangler.children(null,getThingsCallback);
	};
})();





