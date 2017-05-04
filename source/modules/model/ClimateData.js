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
    // TODO: Check data for integrity, consistency, ...

    // Set data
    this._temp.raw_data = data

    // TODO

    // Calculate and gaps mean per month
    this._temp_mean = 0
    for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      this._temp_mean += data[monthIdx].mean
    this._temp_mean /= MONTHS_IN_YEAR.length

    // Calculate yearly mean
  }

  fillPrec(data)
  {
    // TODO: Check data for integrity, consistency, ...
    // TODO

    // Set data
    this._prec.raw_data = data

    // Calculate sum and gaps per month

    // Calculate yearly sum
    this._prec_sum = 0
    for (var monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      this._prec_sum += data[monthIdx].sum
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
        if( (this._prec[monthIdx].rawData[yearIdx] != null) ||
            (this._temp[monthIdx].rawData[yearIdx] != null))
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
        if( (this._prec[monthIdx].rawData[yearIdx] != null) ||
            (this._temp[monthIdx].rawData[yearIdx] != null))
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
