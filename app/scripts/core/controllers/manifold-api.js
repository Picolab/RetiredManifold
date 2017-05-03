; (function() {

	window.manifold = {};
	

	manifold.createThing = function(name, postFunction, options)
	{
		var eventAttrs = { "name": name};
		wrangler.createChild(eventAttrs,postFunction,options);//postFunction and options may be undefined
	};

	manifold.getThings = function()
	{
		return wrangler.children();
	}
})();