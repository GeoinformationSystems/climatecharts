// ############################################################################
// ClimateDataset                                                         Model
// ############################################################################
// Represents one single dataset for raster-based simulated climate data
// ############################################################################

class ClimateDataset
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor()
  {
    this.id =             null
    this.name =           ""
    this.description =    ""
    this.doi =            ""

    this.urlDatasets =    []            // url to temp and prec datasets
    this.metaDatasets =   []

    this.timePeriod =     [null, null]  // start and end year
    this.rasterSize =     [0.0, 0.0]    // size of raster cell (lat / lng degrees)

    this.is_selected =    false         // is the dataset currently selected?
  }

}
