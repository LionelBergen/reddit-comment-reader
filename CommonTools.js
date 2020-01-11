
module.exports = function() {
	this.GetArrayWithLimitedLength = getArrayWithLimitedLength;
	this.GetUniqueArray = getUniqueArray;
	this.GetSecondsSinceUTCTimestamp = getSecondsSinceUTCTimestamp;
	this.GetSecondsSinceTimeInSeconds = getSecondsSinceTimeInSeconds;
};

function getArrayWithLimitedLength(length, allowDuplicates) 
{
	var array = new Array();

	array.push = function () {
		if (!allowDuplicates && this.includes(arguments[0]))
		{
			return null;
		}
		if (this.length > length) {
			this.shift();
		}
		return Array.prototype.push.apply(this,arguments);
	}

	return array;
}

/**
 * On push, delete existing duplicate entry, replace with new.
*/
function getUniqueArray(maxSize) 
{
	var array = new Array();

	array.push = function () {
		for (var i=0; i<this.length; i++)
		{
			if (this[i].id === arguments[0].id)
			{
				// delete the item in the array
				this.splice(i, 1);
				break;
			}
		}
		if (maxSize && this.length > maxSize) {
			this.shift();
		}
		return Array.prototype.push.apply(this,arguments);
	}
	
	array.get = function(otherObject) {
		for (var i=0; i<this.length; i++)
		{
			if (this[i].id === otherObject.id)
			{
				return this[i];
			}
		}
		
		return null;
	}
	
	array.includes = function(otherObject) {
		for (var i=0; i<this.length; i++)
		{
			if (this[i].id === otherObject.id)
			{
				return true;
			}
		}
		
		return false;
	}

	return array;
}

function getSecondsSinceUTCTimestamp(utcTimestamp)
{
	return (Date.now() - new Date(utcTimestamp * 1000).getTime()) / 1000;
}

function getSecondsSinceTimeInSeconds(timeInSeconds)
{
	var distance = new Date().getTime() - timeInSeconds;
	return Math.floor((distance % (1000 * 60)) / 1000);
}