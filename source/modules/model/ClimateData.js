// ############################################################################
// ClimateData                                                            Model
// ############################################################################
// Represents a dataset containing the relevant data for the climate at one
// specific location in one specific time period.
// ############################################################################


class ClimateData
{
  
  constructor()
  {

    // ------------------------------------------------------------------------
    // Metadata
    // ------------------------------------------------------------------------

    this.name =           "";                  // City, admin region, country
    this.location =
    {
      orig:
      {
        lat:              null,
        lng:              null
      },
      DD:                 "",
      DMS:                "",
    };
    this.hemisphere =     "";                  // Either "N" or "S"
    this.climate_class =  null;                // Max. three-character class name
    this.elevation =      null;                // Height in meter
    this.years =          [null, null, null];  // Min year, Max year, Appendix

    this.source =         null;                // Data source
    this.source_link =    null;                // Link to data source
    this.doi =            null;                // Link to doc. object identifier


    // ------------------------------------------------------------------------
    // Climate data
    // ------------------------------------------------------------------------

    this.has_temp =       false;   // Is there at least one temperature value?
    this.has_prec =       false;   // Is there at least one precipitation value?

    this.temp =           [];
    this.prec =           [];

    this.temp_mean =      null;   // Temperature mean
    this.prec_sum =       null;   // Precipitation sum

    this.temp_list =      [];     // list of temp data values for each month
    this.prec_list =      [];     // list of prec data values for each month

    this.monthly_short =  [];     // short form: temp mean / prec sum per month
    this.extreme =
    {
      minTemp:            null,
      maxTemp:            null,
      minPrec:            null,
      maxPrec:            null,
    }
  }

}
