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

    this.name =           ""                  // city, admin region, country
    this.location =
    {
      orig: {lat: null, lng: null},
      DD:   "",
      DMS:  ""
    }
    this.hemisphere =     ""                  // either "N" or "S"
    this.elevation =      null                // d "m"
    this.climate_class =  null                // max. three-character class name
    this.years =          [null, null, null]  // min year, max year, appendix

    this.source =         null                // data source
    this.doi =            null                // document object identifier (link)


    // ------------------------------------------------------------------------
    // Climate data
    // ------------------------------------------------------------------------

    this.prec =          []
    this.temp =          []

    this.temp_mean =     null    // temperature mean
    this.prec_sum =      null    // precipitation sum

    this.monthly_short = []      // short form: temp mean / prec sum per month
    this.extreme =
    {
      minTemp: null, maxTemp: null,
      minPrec: null, maxPrec: null,
    }
  }
}
