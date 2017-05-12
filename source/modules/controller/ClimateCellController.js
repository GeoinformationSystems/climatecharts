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
    this._cellDimensions =
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
    if (this._cellActive)
      this._main.modules.climateCellOnMap.reset(this._getCellBounds(coords))
    else
    {
      this._main.modules.climateCellOnMap.set(this._getCellBounds(coords))
      this._cellActive = true
    }
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  cleanup()
  {
    if (this._cellActive)
    {
      this._main.modules.climateCellOnMap.remove()
      this._cellActive = false
    }
  }


  // ==========================================================================
  // New dataset => reset dimension of climate cells in lat/lng
  // ==========================================================================

  setCellDimensions(lat, lng)
  {
    this._cellDimensions.lat = lat
    this._cellDimensions.lng = lng
  }
  

  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Calculate the raster cell in which a clicked point is in
  // ==========================================================================

  _getCellBounds(coords)
  {
    // XXX
    this._cellDimensions.lat = 0.5
    // parseFloat(UI.ncML[0].group[0].attribute[6]._value)
    this._cellDimensions.lng = 0.5
    // parseFloat(UI.ncML[0].group[0].attribute[7]._value)

    // determine the cell the current point is in
    // in array format, not object format!
    var minPoint =
    [
      Math.floor(coords.lat/this._cellDimensions.lat)*this._cellDimensions.lat,
      Math.floor(coords.lng/this._cellDimensions.lng)*this._cellDimensions.lng
    ]
    var maxPoint =
    [
      minPoint[0] + this._cellDimensions.lat,
      minPoint[1] + this._cellDimensions.lng
    ]

    return([minPoint, maxPoint])
  }
}
