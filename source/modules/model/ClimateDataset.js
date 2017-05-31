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
    this.metaDatasets =   []            // metadata for temp and prec

    this.timePeriod =     [null, null]  // start and end year
    this.raster_cell_size = {           // size of raster cell
      lat: 0.0,
      lng: 0.0
    }

    this.is_selected =    false         // is the dataset currently selected?
  }

}
