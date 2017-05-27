// ############################################################################
// WeatherStation                                                         Model
// ############################################################################
// Station represents one single WeatherStation in the system
// - A bit more detailed
// - So that everybody understands what this is for
// ############################################################################

class WeatherStation
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
    // General data
    // ------------------------------------------------------------------------

    this.id =             null
    this.name =           ""
    this.country =        ""
    this.coords =
    {
      'lat':              0.0,
      'lng':              0.0
    }
    this.elev =           0.0
    this.min_year =       0
    this.max_year =       9999
    this.coverage_rate =  1.0
    this.largest_gap =    0
    this.missing_months = 0

    this.climateData =    null


    // ------------------------------------------------------------------------
    // Visualization data
    // ------------------------------------------------------------------------

    this.marker =         null    // map marker
    this.is_active =      false   // is the marker currently active on the map
                                  // = does the station currently have data?
    this.is_selected =    false   // is the marker currently selected?
  }

}
