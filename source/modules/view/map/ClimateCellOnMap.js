// ############################################################################
// ClimateCellOnMap                                                       View
// ############################################################################
// Represents the current climate raster cell on the map
// -> Origin of simulated climate data from datasets
// - representation by leaflet circle with station and style
// ############################################################################

class ClimateCellOnMap
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
    this._map = this._main.modules.map.getMap()

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    // Raster cell the current climate data originates from
    // -> Leaflet rectangle
    this._cell = null
  }

  // ==========================================================================
  // Handle climate cell on the map (set, reset, remove)
  // ==========================================================================

  set(bounds)
  {
    this._cell = new L.rectangle(bounds, main.config.climateCell.sytle)
    this._cell.addTo(this._map)
    this._cell.bringToBack()
    this._makeCellVisible()
  }

  reset(bounds)
  {
    this._cell.setBounds(bounds)
    this._cell.bringToBack()
    this._makeCellVisible()
  }

  remove()
  {
    this._map.removeLayer(this._cell)
    this._cell = null
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  _makeCellVisible()
  {
    // Idea: The user should always see the full extent of the climate cell
    // => determine if the bounds of the cell are fully visible in the viewport
    let mapBounds = this._map.getBounds()
    let cellBounds = this._cell.getBounds()

    // If the climate cell is completely in the viewport
    // i.e. no bound of the cell is visible
    // => zoom out to fit the bounds
    if (cellBounds.contains(mapBounds))
      this._map.fitBounds(cellBounds)

    // If not, check if the cell is partially covered by the map
    // i.e. the map does not contain the full extent of the cell
    // => move the map so the cell is completely visible
    else if (!mapBounds.contains(cellBounds))
      this._map.fitBounds(cellBounds)

    // otherwise the cell is completely visible, so there is nothing to do
  }
}
