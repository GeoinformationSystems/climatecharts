"use strict";

// ############################################################################
// ClimateData                                                         Model
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

MONTHS_IN_YEAR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ClimateData() {
  // ==========================================================================
  // Raw data
  // ==========================================================================

  this.climate_data = {
    num_years: 0,
    prec: [],
    temp: []
  };

  // ==========================================================================
  // Constructor
  // Init data object with empty / default values
  // ==========================================================================

  this.construct = function () {
    var numMonths = MONTHS_IN_YEAR.length;
    for (var monthIdx = 0; monthIdx < numMonths; monthIdx++) {
      // ugly duplicate, but cloning an object in JavaScript is ugly as (h)well
      this.climate_data.prec.push({
        raw_data: [],
        mean: 0.0,
        num_gaps: 0
      });
      this.climate_data.temp.push({
        raw_data: [],
        mean: 0.0,
        num_gaps: 0
      });
    }
  };
}