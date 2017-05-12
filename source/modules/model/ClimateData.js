// ############################################################################
// ClimateData                                                            Model
// ############################################################################
// ClimateData represents a dataset containing the relevant data for the
// climate of one specific location in the following format:
//  {
//  	num_years:         number of years
//  	prec:					     for each dataset
//  	[                  for each month
//  		{                month 1 (Jan)
//  			raw_data: []   data values for each year
//  			mean:          data mean of all values of this month
//  			num_gaps:      number of missing years
//  		},
//  		{...},           month 2 (Feb) ...
//  	],
//  	temp:              same structure as above
//  }
//
// ############################################################################


class ClimateData
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main)
  {
    // ------------------------------------------------------------------------
    // Metadata
    // ------------------------------------------------------------------------

    this._name =           [null, null, null]  // city, admin region, country
    this._position =       {lat:null,lng:null}
    this._elevation =      null                // d "m"
    this._climate_class =  null                // max. three-character class name
    this._years =          [null, null, null]  // min year, max year, appendix

    this._source =         null                // data source
    this._doi =            null                // document object identifier (link)


    // ------------------------------------------------------------------------
    // Climate data
    // ------------------------------------------------------------------------

    this._prec =          []
    this._temp =          []

    this._temp_mean =     null    // temperature mean
    this._prec_sum =      null    // precipitation sum


    // ------------------------------------------------------------------------
    // Init empty climate data
    // ------------------------------------------------------------------------

    let numMonths = MONTHS_IN_YEAR.length
    for (var monthIdx = 0; monthIdx < numMonths; monthIdx++)
    {
      // ugly duplicate, but cloning an object in JavaScript is ugly as (h/w)ell
      this._prec.push(
        {
          raw_data: [],
          sum:      0.0,
          num_gaps: 0
        }
      )
      this._temp.push(
        {
          raw_data: [],
          mean:     0.0,
          num_gaps: 0
        }
      )
    }
  }


  // ==========================================================================
  // Fill monthly data for prec and temp
  // Calculate yearly mean / sum of monthly data
  // ==========================================================================

  fillTemp(data)
  {
    let numMonthsWithData = MONTHS_IN_YEAR.length

    // Get data and calculate mean per month
    for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
    {
      // Get raw data
      this._temp[monthIdx].raw_data = data[monthIdx]

      // For each year
      let numYears = data[monthIdx].length
      for (var yearIdx = 0; yearIdx < numYears; yearIdx++)
      {
        // Distinguish: is the value given?
        let tempValue = data[monthIdx][yearIdx]
        // If yes, account for monthly mean
        if (tempValue != null)
          this._temp[monthIdx].mean += data[monthIdx][yearIdx]
        // If no, do not account for monthly mean and increase number of gaps
        else
          this._temp[monthIdx].num_gaps += 1
      }

      // Calculate monthly mean
      // -> Current sum / number of years with data (years without gap)
      let numYearsWithData = numYears-this._temp[monthIdx].num_gaps
      // Error handling: Division by 0
      if (numYearsWithData > 0)
        this._temp[monthIdx].mean /= numYearsWithData
      else
        this._temp[monthIdx].mean = null

      // Accumulate final yearly mean
      // Only if at least one year had data
      if (this._temp[monthIdx].mean != null)
        this._temp_mean += this._temp[monthIdx].mean
      // Otherwise, do not account for final yearly mean
      else
        numMonthsWithData -= 1
    }

    // Calculate yearly mean
    // Error handling: Division by 0
    if (numMonthsWithData > 0)
      this._temp_mean /= numMonthsWithData
    else
      this._temp_mean = null
  }


  fillPrec(data)
  {
    let numMonthsWithData = MONTHS_IN_YEAR.length

    // Calculate sum per month
    for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
    {
      // Get raw data
      this._prec[monthIdx].raw_data = data[monthIdx]

      // For each year
      let numYears = data[monthIdx].length
      for (var yearIdx = 0; yearIdx < numYears; yearIdx++)
      {
        // Distinguish: is the value given?
        let tempValue = data[monthIdx][yearIdx]
        // If yes, account for monthly sum
        if (tempValue != null)
          this._prec[monthIdx].sum += data[monthIdx][yearIdx]
        // If not, do not account for monthly sum and increase number of gaps
        else
          this._prec[monthIdx].num_gaps += 1
      }

      // For monthly sum: write null instead of 0.0 if no data
      let numYearsWithData = numYears-this._prec[monthIdx].num_gaps
      // Error handling: Division by 0
      if (numYearsWithData == 0)
        this._prec[monthIdx].sum = null

      // Accumulate final yearly mean
      // Only if at least one year had data
      if (this._prec[monthIdx].sum != null)
        this._prec_sum += this._prec[monthIdx].sum
      // If not, do not account for final yearly mean
      else
        numMonthsWithData -= 1
    }

    // For yearly sum: write null instead of 0.0 if no data
    if (numMonthsWithData == 0)
      this._prec_sum = null
  }


  // ==========================================================================
  // Calculate number of years
  // ==========================================================================

  setNumYears(minYear, maxYear)
  {
    let minYearIdx = 0
    let maxYearIdx = maxYear-minYear-1  // N.B: -1 to account for starting at 0

    // TODO: determine if there are data holes in between

    // Determine minYear
    // => Find earliest data entry in temperature and precipiation data
    for (var yearIdx = minYearIdx; yearIdx < maxYearIdx; yearIdx++)
    {
      let dataFound = false
      // Check for each month in year if there is a data value available
      for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      {
        if( (this._prec[monthIdx].raw_data[yearIdx] != null) ||
            (this._temp[monthIdx].raw_data[yearIdx] != null))
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
        if( (this._prec[monthIdx].raw_data[yearIdx] != null) ||
            (this._temp[monthIdx].raw_data[yearIdx] != null))
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
    this._years[minYear, maxYear, null]
  }


  // ==========================================================================
  // Handle location name
  // ==========================================================================

  setName(part1=null, part2=null, part3=null)
  {
    this._name = [part1, part2, part3]
  }

  getName()
  {
    // remove empty elements
    nonNullNameParts = this._name.filter(function(part){return part!=null})
    // concatenate to final name string, seperate parts by ", "
    return nonNullNameParts.join(", ")
  }


  // ==========================================================================
  // Handle GPS location
  // ==========================================================================

  setPosition(coords)
  {
    this._position = coords
  }

  getPosition()
  {
    let ns = this._convertDDtoDMS(coords.lat, "N", "S")
    let ew = this._convertDDtoDMS(coords.lng, "E", "W")
    return (ns + " " + ew)
  }


  // ==========================================================================
  // Handle elevation
  // ==========================================================================

  setElevation(value)
  {
    if (value>0)
      this._elevation = elevation + " m"
    else
      this._elevation = null
  }

  getElevation()
  {
    return this._elevation
  }

  setClimateClass()
  {
    let ccCreator = new ClimateClassCreator(this)
  	this._climate_class = ccCreator.getClimateClass()
    console.log(this._climate_class);
  }

  getClimateClass()
  {
    return this._climate_class
  }


  // ==========================================================================
  // Extract the monthly relevant data points for the visualization
  // -> for each month: name of month, precipitation sum and temperature mean
  // ==========================================================================

  getMonthlyData()
  {
    let monthlyData = []
    for (var monthIdx=0; monthIdx<MONTHS_IN_YEAR.length; monthIdx++)
    {
      monthlyData[monthIdx] = {
        monthIdx :  monthIdx,
        month:      MONTHS_IN_YEAR[monthIdx],
        temp:       this._temp[monthIdx].mean,
        prec:       this._prec[monthIdx].sum,
      }
    }
    return monthlyData
  }


  // ==========================================================================
  // Get total min/max temperature and precipitation
  // ==========================================================================

  getExtremeData()
  {
    let monthlyData = this.getMonthlyData()
    return {
        minTemp: d3.min(monthlyData, function(d) { return d.temp; }),
        maxTemp: d3.max(monthlyData, function(d) { return d.temp; }),
        minPrec: d3.min(monthlyData, function(d) { return d.prec; }),
        maxPrec: d3.max(monthlyData, function(d) { return d.prec; }),
      }
  }


  // ==========================================================================
  // Get temperature mean / precipitation sum
  // ==========================================================================

  getTempMean()
  {
    return this._temp_mean
  }

  getPrecSum()
  {
    return this._prec_sum
  }


  // ==========================================================================
  // Get hemisphere ("N" = north, "S" = south)
  // ==========================================================================

  getHemisphere()
  {
    if (this._position.lat >= 0)
      return "N"
    else
      return "S"
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Decimal Degree (dd.ddd "N|S") -> Degree Minute Second (dd°mm'ss" "N|S")
  // ==========================================================================

  _convertDDtoDMS(dd, charAboveNull, charBelowNull)
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
    return deg + "° " + min + "'' " + sec + '" ' + char
  }
}
