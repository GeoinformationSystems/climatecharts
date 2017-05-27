// ############################################################################
// HELPERS
// ############################################################################

class Helpers
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main)
  {
    this._main = main
  }


  // ==========================================================================
  // Mixin two objects (override A -> default B)
  // ==========================================================================

  mixin(objA, objB)
  {
    let objMixin = this.deepCopy(objB)
    for (var key in objA)
      objMixin[key] = objA[key]
    return objMixin
  }


  // ==========================================================================
  // Deep copy of an object
  // ==========================================================================

  deepCopy(obj)
  {
    return JSON.parse(JSON.stringify(obj));
  }


  // ==========================================================================
  // Check if Integer
  // ==========================================================================

  checkIfInt(num)
  {
    if (num === parseInt(num, 10))
      return true
    else
      return false
  }


  // ==========================================================================
  // Check if String
  // ==========================================================================

  checkIfString(str)
  {
    if ((typeof str) == "string")
      return true
    else
      return false
  }


  // ==========================================================================
  // Swap values
  // ==========================================================================

  swapValues (valArray)
  {
    let tempVal = valArray[0]
    valArray[0] = valArray[1]
    valArray[1] = tempVal
    return valArray
  }


  // ==========================================================================
  // Decimal Degree (dd.ddd "N|S") -> Degree Minute Second (dd°mm'ss" "N|S")
  // ==========================================================================

  convertDDtoDMS(dd, charAboveNull, charBelowNull)
  {
    let deg = Math.floor(dd)
    let minFloat = (dd-deg)*60
    let min = Math.floor(minFloat)
    let secFloat = (minFloat-min)*60
    let sec = Math.round(secFloat)
    // Eliminate rounding errors
    if (sec==60)
    {
      min++
      sec=0
    }
    if (min==60)
    {
      deg++
      min=0
    }
    // Character showing the orientation in cardinal direction
    let char = dd<0 ? charBelowNull : charAboveNull
    return deg + "°" + min + "'" + sec + '"' + char
  }


  // ==========================================================================
  // Rounding to decimal places
  // ==========================================================================

  roundToDecimalPlace(num, decimalPlaces)
  {
    let roundingFactor = Math.pow(10, decimalPlaces)
    return (Math.round(num*roundingFactor) / roundingFactor)
  }

}
