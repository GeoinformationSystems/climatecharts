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

    this.url_datasets =   []            // Url to temp and prec datasets
    this.meta_datasets =   []            // Metadata for temp and prec

    this.time_period =    [null, null]  // Start and end year
    this.raster_cell_size =             // Size of raster cell
    {
      lat: 0.0,
      lng: 0.0
    }

    this.is_selected =    false         // Is the dataset currently selected?
  }

}
