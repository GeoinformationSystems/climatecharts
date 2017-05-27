// ############################################################################
// ClimateDataController                                            Controller
// ############################################################################
// Handles the climate data received from weatherstation or climate cell
// and sends it to the chart visualization modules
// ############################################################################

class ClimateDataController
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

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._climateData = new ClimateData()

    this._minYear = this._main.modules.timeController.getPeriodStart()
    this._maxYear = this._main.modules.timeController.getPeriodEnd()

    // Climate data charts
    this._chartsAreActive    = false
    this._climateChart      = null
    this._distributionChart = null
    this._availabilityChart = null

  }


  // ==========================================================================
  // Set new climate data
  // ==========================================================================

  update(tempData, precData, placeName, coords, elev)
  {
    // Fill station with climate data
    this._climateData.temp = this._fillData(tempData, "temp")
    this._climateData.prec = this._fillData(precData, "prec")

    this._calcIndicator("temp")
    this._calcIndicator("prec")

    this._calcMonthlyData()
    this._calcExtremeData()
    this._calcClimateClass()
    this._calcNumYears()

    // Fill meta information
    this._setName(placeName)
    this._setCoords(coords)
    this._calcHemisphere(coords)
    this._setElevation(elev)

    console.log(this._climateData);

    // Update the visualization
    if (!this._chartsAreActive)    // Create new charts
    {
      this._climateChart =
        new ClimateChart(this._main, this._climateData)
      this._distributionChart =
        new DistributionChart(this._main, this._climateData)
      this._availabilityChart =
        new AvailabilityChart(this._main, this._climateData)
      this._chartsAreActive = true
    }
    else                          // Update existing charts
    {
      this._climateChart.update(this._climateData)
      this._distributionChart.update(this._climateData)
      this._availabilityChart.update(this._climateData)
    }
  }


  // ==========================================================================
  // Clear the current climate data
  // ==========================================================================

  clear()
  {
    this._climateData = new ClimateData()
    this._climateChart.remove()
    this._distributionChart.remove()
    this._availabilityChart.remove()
    this._chartsAreActive = false
  }


  // ==========================================================================
  // Return current climate data
  // ==========================================================================

  getClimateData()
  {
    return this._climateData
  }



  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Fill monthly data for prec and temp
  // ==========================================================================

  _fillData(inData, dataType)
  {
    let indicator = (dataType == 'prec') ? 'sum' : 'mean'
    let outData = this._makeEmptyClimateDataObject(indicator)

    // Get data and calculate mean per month
    for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
    {
      // Get raw data
      outData[monthIdx].raw_data = inData[monthIdx]

      // For each year
      let numYears = inData[monthIdx].length
      for (var yearIdx = 0; yearIdx < numYears; yearIdx++)
      {
        // Distinguish: is the value given?
        let dataValue = inData[monthIdx][yearIdx]
        // If yes, account for monthly mean
        if (dataValue != null)
          outData[monthIdx][indicator] += inData[monthIdx][yearIdx]
        // If no, do not account for monthly mean and increase number of gaps
        else
          outData[monthIdx].num_gaps += 1
      }

      // Calculate monthly mean or sum
      // -> Current sum / number of years with data (years without gap)
      let numYearsWithData = numYears-outData[monthIdx].num_gaps
      // Error handling: Division by 0
      if (numYearsWithData == 0)
        outData[monthIdx][indicator] = null
      else
        if (indicator == 'mean')
          outData[monthIdx][indicator] /= numYearsWithData

      // Rounding factor
      outData[monthIdx][indicator] =
        this._main.modules.helpers.roundToDecimalPlace(
          outData[monthIdx][indicator],
          this._main.config.coordinates.decimalPlaces
        )
    }

    return outData
  }


  _makeEmptyClimateDataObject(indicator)
  {
    // Assemble single climate data object for one month
    let singleMonthlyObject =
    {
      raw_data: [],
      num_gaps: 0
    }
    if (indicator == 'mean')
      singleMonthlyObject.mean = 0.0
    else // indicator == 'sum'
      singleMonthlyObject.sum = 0

    // Assemble final climate data object for one year
    let climateDataObject = []
    for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      climateDataObject.push( // deep copy necessary!
        this._main.modules.helpers.deepCopy(singleMonthlyObject)
      )
    return climateDataObject
  }

  // ==========================================================================
  // Calculate yearly mean / sum of monthly data
  // outIndicator is either sum or mean
  // ==========================================================================

  _calcIndicator(dataType)
  {
    let numMonthsWithData = MONTHS_IN_YEAR.length
    let outIndicator = 0
    let indicator = (dataType == 'prec') ? 'sum' : 'mean'

    // Accumulate final yearly mean / sum
    for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
    {
      // Only if at least one year had data
      let monthlyValue = this._climateData[dataType][monthIdx][indicator]
      if (monthlyValue != null)
        outIndicator += monthlyValue
      // Otherwise, do not account for final yearly mean
      else
        numMonthsWithData -= 1
    }

    // Error handling: Division by 0
    if (numMonthsWithData == 0)
      outIndicator = null
    else
      if (indicator == 'mean')
        outIndicator /= numMonthsWithData

    // Rounding factor
    outIndicator =
      this._main.modules.helpers.roundToDecimalPlace(
        outIndicator,
        this._main.config.climateData.decimalPlaces
      )

    // Assign to proper value
    if (dataType == 'prec')
      this._climateData.prec_sum = outIndicator
    else
      this._climateData.temp_mean = outIndicator
  }


  // ==========================================================================
  // Extract the monthly relevant data points for the visualization
  // -> for each month: name of month, precipitation sum and temperature mean
  // ==========================================================================

  _calcMonthlyData()
  {
    for (let monthIdx=0; monthIdx<MONTHS_IN_YEAR.length; monthIdx++)
    {
      this._climateData.monthly_short.push(
        {
          monthIdx :  monthIdx,
          month:      MONTHS_IN_YEAR[monthIdx],
          temp:       this._climateData.temp[monthIdx].mean,
          prec:       this._climateData.prec[monthIdx].sum,
        }
      )
    }
  }


  // ==========================================================================
  // Get total min/max temperature and precipitation
  // ==========================================================================

  _calcExtremeData()
  {
    this._climateData.extreme = {
        minTemp: d3.min(this._climateData.monthly_short, function(data)
          {return data.temp}
        ),
        maxTemp: d3.max(this._climateData.monthly_short, function(data)
          {return data.temp}
        ),
        minPrec: d3.min(this._climateData.monthly_short, function(data)
          {return data.prec}
        ),
        maxPrec: d3.max(this._climateData.monthly_short, function(data)
          {return data.prec}
        ),
      }
  }


  // ==========================================================================
  // Calculate Climate Class
  // ==========================================================================

  _calcClimateClass()
  {
    let climateClass = ""

    // ------------------------------------------------------------------------
    // Get relevant climate data
    // ------------------------------------------------------------------------

    let monthlyData =   this._climateData.monthly_short
    let extremeData =   this._climateData.extreme
    let precSum =       this._climateData.prec_sum
    let tempMean =      this._climateData.temp_mean
    let hemisphere =    this._climateData.hemisphere


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
  		climateClass = "E"
  		if (0 < extremeData.maxTemp < 10)
  			climateClass += "T"
  		else
  			climateClass += "F"
  	}
  	else
    {
  		if (precSum < 10*precDry)
      {
  			climateClass = "B"
  			// 2nd letter
  			if (precSum > 5*precDry)
  				climateClass += "S"
  			else
  				climateClass += "W"
  			// 3rd letter
  			if (tempMean >= 18)
  				climateClass += "h"
  			else
  				climateClass += "k"
  		}
  		else
      {
  			if (extremeData.minTemp >= 18)
        {
  				climateClass = "A"
  				// 2nd letter
  				if (extremeData.minPrec >= 60)
  					climateClass += "f"

  				else if (precSum >= 25*(100 - extremeData.minPrec))
  					climateClass += "m"
  				else if (summerMin < 60)
  					climateClass += "s"
  				else if (winterMin < 60)
  					climateClass += "w"
  			}
  			else if (extremeData.minTemp <= -3)
        {
  				climateClass = "D"
  				// 2nd letter
  				if (summerMin < winterMin &&
              winterMax > 3*summerMin && summerMin < 40)
  					climateClass += "s"
  				else if (winterMin < summerMin && summerMax > 10*winterMin)
  					climateClass += "w"
  				else
  					climateClass += "f"

  				// 3rd letter
  				if (extremeData.maxTemp >= 22)
  					climateClass += "a"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths > 3)
  					climateClass += "b"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp > -38)
  					climateClass += "c"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp <= -38)
  					climateClass += "d"
  			}
  			else if (extremeData.minTemp > -3 && extremeData.minTemp < 18)
        {
  				climateClass = "C"

  				// 2nd letter
  				if (summerMin < winterMin &&
              winterMax > 3*summerMin &&
              summerMin < 40)
  					climateClass = climateClass + "s"
  				else if (
              winterMin < summerMin &&
              summerMax > 10*winterMin)
  					climateClass = climateClass + "w"
  				else
  					climateClass = climateClass + "f"

  				// 3rd letter
  				if (extremeData.maxTemp >= 22)
  					climateClass += "a"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths > 3)
  					climateClass += "b"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp > -38)
  					climateClass += "c"
  				else if (
              extremeData.maxTemp < 22 &&
              numWarmMonths <= 3 &&
              extremeData.minTemp <= -38)
  					climateClass += "d"
  			}
  		}
  	}

    this._climateData.climate_class = climateClass
  }


  // ==========================================================================
  // Calculate number of years
  // ==========================================================================

  _calcNumYears()
  {
    let minYear = this._minYear
    let maxYear = this._maxYear

    let minYearIdx = 0
    let maxYearIdx = maxYear-minYear-1  // N.B: -1 to account for starting at 0

    // TODO: determine if there are data holes in between
    // -> set third return parameter like this

    // Determine minYear
    // => Find earliest data entry in temperature and precipiation data
    for (var yearIdx = minYearIdx; yearIdx < maxYearIdx; yearIdx++)
    {
      let dataFound = false
      // Check for each month in year if there is a data value available
      for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      {
        if( (this._climateData.prec[monthIdx].raw_data[yearIdx] != null) ||
            (this._climateData.temp[monthIdx].raw_data[yearIdx] != null))
        {
          dataFound = true
          break
        }
      }
      if (dataFound == true)
      {
        // Calculate minYear
        minYearIdx = yearIdx
        minYear += yearIdx
        break
      }
    }

    // Determine maxYear
    // => Find latest data entry in temperature and precipiation data
    for (var yearIdx = maxYearIdx; yearIdx > minYearIdx; yearIdx--)
    {
      let dataFound = false
      // Check for each month in year if there is a data value available
      for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      {
        if( (this._climateData.prec[monthIdx].raw_data[yearIdx] != null) ||
            (this._climateData.temp[monthIdx].raw_data[yearIdx] != null))
        {
          dataFound = true
          break
        }
      }
      if (dataFound == true)
      {
        // Calculate maxYear
        maxYear = minYear+yearIdx
        break
      }
    }

    // set years
    this._climateData.years = [minYear, maxYear, null]
  }


  // ==========================================================================
  // Name
  // ==========================================================================

  _setName(locNameArray)
  {
    // Manipulate array: Each element is either a string or null
    for (let idx=0; idx<3; idx++)
      if (!this._main.modules.helpers.checkIfString(locNameArray[idx]))
        locNameArray[idx] = null
    // Remove empty elements
    let nonNullNameParts = locNameArray.filter(
      function(part) {return part!=null}
    )
    // Concatenate to final name string, seperate parts by ", "
    this._climateData.name = nonNullNameParts.join(", ")
  }


  // ==========================================================================
  // Format coordinates to DD or to DMS ("N" = north, "S" = south)
  // ==========================================================================

  _setCoords(coords)
  {
    this._climateData.location.orig = coords

    // Coords to DD
    let lat = new String(
      this._main.modules.helpers.roundToDecimalPlace(
        coords.lat,
        this._main.config.coordinates.decimalPlaces
      )
    )
    let lng = new String(
      this._main.modules.helpers.roundToDecimalPlace(
        coords.lng,
        this._main.config.coordinates.decimalPlaces
      )
    )
    this._climateData.location.DD = ("Lat: " + lat + ", Lng: " + lng)

    // Coords to DMS
    let ns = this._main.modules.helpers.convertDDtoDMS(coords.lat, "N", "S")
    let ew = this._main.modules.helpers.convertDDtoDMS(coords.lng, "E", "W")
    this._climateData.location.DMS = ("Position: " + ns + " " + ew)

  }




  // ==========================================================================
  // Get hemisphere ("N" = north, "S" = south)
  // ==========================================================================

  _calcHemisphere(coords)
  {
    if (coords.lat >= 0)
      this._climateData.hemisphere = "N"
    else
      this._climateData.hemisphere = "S"
  }


  // ==========================================================================
  // Format elevation
  // ==========================================================================

  _setElevation(elevation)
  {
    this._climateData.elevation = null
    if (elevation>0)
      this._climateData.elevation = "Elevation: " + parseInt(elevation) + " m"
  }

}
