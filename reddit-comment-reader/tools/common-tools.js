class Util {
  /**
   * Returns an Array object, but overrides the push function given the paramaters
  */
  getArrayWithLimitedLength(length, allowDuplicates) {
    let array = new Array();

    array.push = function () {
      if (!allowDuplicates && this.includes(arguments[0])) {
        return null;
      }
      if (this.length > length) {
        this.shift();
      }
      return Array.prototype.push.apply(this,arguments);
    };

    return array;
  }
  
  /**
   * Returns an array Object with methods overriden
   *
   * On push, delete the existing duplicate entry & replace with new
   * get & includes methods overriden to match by property 'id'
  */
  getUniqueArray(maxSize) {
    let array = new Array();

    array.push = function () {
      for (let i=0; i<this.length; i++) {
        if (this[i].id === arguments[0].id) {
          // delete the item in the array
          this.splice(i, 1);
          break;
        }
      }
      if (maxSize && this.length > maxSize) {
        this.shift();
      }
      return Array.prototype.push.apply(this,arguments);
    };
    
    array.get = function(otherObject) {
      for (let i=0; i<this.length; i++) {
        if (this[i].id === otherObject.id) {
          return this[i];
        }
      }
      
      return null;
    };
    
    array.includes = function(otherObject) {
      for (let i=0; i<this.length; i++) {
        if (this[i].id === otherObject.id) {
          return true;
        }
      }
      
      return false;
    };

    return array;
  }

  getSecondsSinceUTCTimestamp(utcTimestamp) {
    return (Date.now() - new Date(utcTimestamp * 1000).getTime()) / 1000;
  }

  getSecondsSinceTimeInSeconds(timeInSeconds) {
    let distance = new Date().getTime() - timeInSeconds;
    return Math.floor((distance % (1000 * 60)) / 1000);
  }
}

module.exports = new Util();