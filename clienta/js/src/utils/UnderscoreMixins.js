define(['underscore'], function(_) {
	_.mixin({
		// Clamp numeric value
		clamp: function(value, min, max) {
			return Math.min(max, Math.max(min, value));
		},

		// Positive modulo: returns a positive result from a negative modulo operation
		pmod: function(a, b) {
			return a - (b * Math.floor(a/b));
		},

		// Return a number interpolated between from and to by t
		// When t=0 returns from, when t=1 returns to, when t=0.5 returns the average of a and b, etc.
		lerp: function(from, to, t) {
			return from + (to - from) * t;
		},

		// Returns a number along one scale in another scale
		// inputFrom/To specify the input scale, and outputFrom/To specify the output scale
		// value is a number along the input scale to return in the output scale
		lerpRange: function(inputFrom, inputTo, outputFrom, outputTo, value) {
			return outputFrom + ((value - inputFrom) / (inputTo - inputFrom)) * (outputTo - outputFrom);
		},

		// Returns the maximum value of a specified property in a collection of objects
		maxPropertyValue: function(obj, property) {
			return _.max(obj, function(value) {
				return value[property];
			})[property];
		},

		// Returns the minimum value of a specified property in a collection of objects
		minPropertyValue: function(obj, property) {
			return _.min(obj, function(value) {
				return value[property];
			})[property];
		},

		removeAll: function(arr, item){
			if(!item)
			{
				arr.splice(0, arr.length);
			}
			else
			{
				for (var i = arr.length - 1; i >= 0; i--)
				{
					if(arr[i] === item)
					{
						arr.splice(i, 1);
					}
				}
			}
		},

		remove: function(arr, item, onlyRemoveFirstOccurence)
		{
			if(onlyRemoveFirstOccurence)
			{
				arr.splice(_.indexOf(arr, item), 1);
			}
			else
			{
				for (var i = arr.length - 1; i >= 0; i--)
				{
					if(arr[i] === item)
					{
						arr.splice(i, 1);
					}
				}
			}
		}
	});
});
