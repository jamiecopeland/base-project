define(
	[
		'underscore'
	],
	function(
		_
	)
	{
		var BaseClass = function(){
			
		};

		BaseClass.extend = function(newPrototype)
		{
			var output = function()
			{
				this.initialize.apply(this, arguments);
			};
			_.extend(output.prototype, this.prototype, newPrototype);
			return output;
		};

		return BaseClass;
	}
);