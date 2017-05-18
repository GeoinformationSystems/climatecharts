// ############################################################################
// ClimateCellController                                             Controller
// ############################################################################
// Manages the current climate cell on the map
// ############################################################################

class ClimateCellController
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main)
  {
    this._main = main

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._cellActive = false

    // Dimension of climate cell (extent in lat / lng direction)
    this._cellSize =
    {
      lat: null,
      lng: null,
    }
  }


  // ==========================================================================
  // Setup / Move cell
  // ==========================================================================

  set(coords)
  {
    // View
    if (this._cellActive)
      this._main.modules.climateCellOnMap.reset(this._getCellBounds(coords))
    else
      this._main.modules.climateCellOnMap.set(this._getCellBounds(coords))

    // Controller
    this._cellActive = true
    this._main.modules.climateDatasetController.loadClimateData(coords)
  }


  // ==========================================================================
  // Cleanup
  // ==========================================================================

  cleanup()
  {
    if (this._cellActive)
    {
      // View
      this._main.modules.climateCellOnMap.remove()

      // Controller
      this._cellActive = false
    }
  }


  // ==========================================================================
  // New dataset => reset size of climate cells in lat/lng
  // ==========================================================================

  setCellSize(coordsDim)
  {
    this._cellSize.lat = coordsDim[0]
    this._cellSize.lng = coordsDim[1]
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Calculate the raster cell in which a clicked point is in
  // ==========================================================================

  _getCellBounds(coords)
  {
    // Determine the cell the current point is in
    // -> in array format, not object format!
    let minPoint =
    [
      Math.floor(coords.lat/this._cellSize.lat)*this._cellSize.lat,
      Math.floor(coords.lng/this._cellSize.lng)*this._cellSize.lng
    ]
    let maxPoint =
    [
      minPoint[0] + this._cellSize.lat,
      minPoint[1] + this._cellSize.lng
    ]

    return([minPoint, maxPoint])
  }

}
