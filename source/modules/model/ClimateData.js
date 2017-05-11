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

  constructor()
  {
    // ------------------------------------------------------------------------
    // Metadata
    // ------------------------------------------------------------------------

    this._name =           ["", "", ""]      // city, admin region, country
    this._coords =         ""                // dd.dd"N|S" dd.dd"E|W"
    this._elevation =      ""                // d "m"
    this._climate_class =  ""                // max. three-character class name
    this._years =          [null, null, ""]  // min year, max year, appendix

    this._source =         ""                // data source
    this._doi =            ""                // document object identifier (link)



    // ------------------------------------------------------------------------
    // Climate data
    // ------------------------------------------------------------------------

    this._prec =       []
    this._temp =       []

    this._temp_mean =  null    // temperature mean
    this._prec_sum =   null    // precipitation sum


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

  calcNumYears(minYear, maxYear)
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

}
