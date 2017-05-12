// ############################################################################
// ClimateClassCreator                                                   Helper
// ############################################################################
// ClimateClass combines all functions and variables necessary to calculate
// the climate class of a location.
// ############################################################################

class ClimateClassCreator
{

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(climateData)
  {
    this._climateClass = ""

    // ------------------------------------------------------------------------
    // Get relevant climate data
    // ------------------------------------------------------------------------

    let monthlyData =   climateData.getMonthlyData()
    let extremeData =   climateData.getExtremeData()
    let precSum =       climateData.getPrecSum()
    let tempMean =      climateData.getTempMean()
    let hemisphere =    climateData.getHemisphere()


    // ------------------------------------------------------------------------
    // Get precipitation data for summer and winter months
    // depending on the hemisphere.
    // ------------------------------------------------------------------------

    let precSummer = []
    let precWinter = []

    if (hemisphere == 'N')
    {
      for (var monthIdx=0; monthIdx<MONTHS_IN_YEAR.length; monthIdx++)
      {
        if (monthIdx >= SUMMER_MONTHS[0] && monthIdx <= SUMMER_MONTHS[1])
          precSummer.push(monthlyData[monthIdx].prec)
        else
          precWinter.push(monthlyData[monthIdx].prec)
      }
    }
    else if (hemisphere == 'S')
    {
      for (var monthIdx=0; monthIdx<MONTHS_IN_YEAR.length; monthIdx++)
      {
        if (monthIdx >= SUMMER_MONTHS[0] && monthIdx <= SUMMER_MONTHS[1])
          precWinter.push(monthlyData[monthIdx].prec)
        else
          precSummer.push(monthlyData[monthIdx].prec)
      }
    }

    let summerMin = Math.min.apply(Math, precSummer)
    let summerMax = Math.max.apply(Math, precSummer)
    let winterMin = Math.min.apply(Math, precWinter)
    let winterMax = Math.max.apply(Math, precWinter)


    // ------------------------------------------------------------------------
    // Count number of warm months (average temp > 10 °C)
    // ------------------------------------------------------------------------

    let numWarmMonths = 0
    for (monthIdx=0; monthIdx<MONTHS_IN_YEAR.length; monthIdx++)
      if (monthlyData[monthIdx].temp >= 10.0)
        numWarmMonths++


    // ------------------------------------------------------------------------
    // Calculate dryness index
    // ------------------------------------------------------------------------

    let precDry = 0;

    let sumSummer = []
    for (var idx=0; idx<precSummer.length; idx++)
      sumSummer += precSummer[idx]

    let sumWinter = []
    for (var idx=0; idx<precWinter.length; idx++)
      sumWinter += precWinter[idx]

    let precDiff = sumSummer-sumWinter

    if (sumSummer >= 2/3*precSum)
      precDry = 2*tempMean + 28;
    else if (sumWinter >= 2/3*precSum)
      precDry = 2*tempMean;
    else
      precDry = 2*tempMean + 14;


    // ------------------------------------------------------------------------
    // Calculate climate class
    // ------------------------------------------------------------------------

  	if (extremeData.maxTemp < 10)
    {
  		this._climateClass = "E"
  		if (0 < extremeData.maxTemp < 10)
  			this._climateClass += "T"
  		else
  			this._climateClass += "F"
  	}
  	else
    {
  		if (precSum < 10*precDry)
      {
  			this._climateClass = "B"
  			// 2nd letter
  			if (precSum > 5*precDry)
  				this._climateClass += "S"
  			else
  				this._climateClass += "W"
  			// 3rd letter
  			if (tempMean >= 18)
  				this._climateClass += "h"
  			else
  				this._climateClass += "k"
  		}
  		else
      {
  			if (extremeData.minTemp >= 18)
        {
  				this._climateClass = "A"
  				// 2nd letter
  				if (extremeData.minPrec >= 60)
  					this._climateClass += "f"

  				else if (precSum >= 25*(100 - extremeData.minPrec))
  					this._climateClass += "m"
  				else if (summerMin < 60)
  					this._climateClass += "s"
  				else if (winterMin < 60)
  					this._climateClass += "w"
  			}
  			else if (extremeData.minTemp <= -3)
        {
  				this._climateClass = "D"
  				// 2nd letter
  				if (summerMin < winterMin &&
              winterMax > 3*summerMin && summerMin < 40)
  					this._climateClass += "s"
  				else if (winterMin < summerMin && summerMax > 10*winterMin)
  					this._climateClass += "w"
  				else
  					this._climateClass += "f"

  				// 3rd letter
  				if (extremeData.maxTemp >= 22)
  					this._climateClass += "a"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths > 3)
  					this._climateClass += "b"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp > -38)
  					this._climateClass += "c"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp <= -38)
  					this._climateClass += "d"
  			}
  			else if (extremeData.minTemp > -3 && extremeData.minTemp < 18)
        {
  				this._climateClass = "C"

  				// 2nd letter
  				if (summerMin < winterMin &&
              winterMax > 3*summerMin &&
              summerMin < 40)
  					this._climateClass = this._climateClass + "s"
  				else if (
              winterMin < summerMin &&
              summerMax > 10*winterMin)
  					this._climateClass = this._climateClass + "w"
  				else
  					this._climateClass = this._climateClass + "f"

  				// 3rd letter
  				if (extremeData.maxTemp >= 22)
  					this._climateClass += "a"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths > 3)
  					this._climateClass += "b"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp > -38)
  					this._climateClass += "c"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp <= -38)
  					this._climateClass += "d"
  			}
  		}
  	}
  }

  getClimateClass()
  {
    return this._climateClass
  }
}
