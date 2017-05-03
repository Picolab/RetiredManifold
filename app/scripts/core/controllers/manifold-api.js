; (function() {

	window.Manifold = {},
	

	Manifold.createThing: function(name, postFunction, options)
	{
		var eventAttrs = { "name": name};
		wrangler.createChild(eventAttrs,postFunction,options);//postFunction and options may be undefined
	};

	Manifold.getThings: function()
	{
		return wrangler.children();
	}
})();