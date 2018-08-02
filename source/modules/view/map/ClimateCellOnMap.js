// ############################################################################
// ClimateCellOnMap                                                       View
// ############################################################################
// Manages the currently selected climate raster cell on the map which is the
// origin of the current ClimateData from the ClimateDataset.
// The cell is visualized by a leaflet rectangle.
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
    this._main = main;


    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._map = this._main.modules.map.getMap();

    // Raster cell the current climate data originates from
    // -> Leaflet rectangle
    this._cell = null
  }


  // ==========================================================================
  // Set climate cell on the map
  // ==========================================================================

  set(coords)
  {
    // ------------------------------------------------------------------------
    // Calculate raster cell which contain the current coordinates
    // ------------------------------------------------------------------------

    let cellSize = this._main.modules.climateDatasetController.getSelectedDataset().raster_cell_size;

    // Determine the cell the current point is in
    // -> in array format, not object format!
    let minPoint =
    [
      Math.floor(coords.lat/cellSize.lat)*cellSize.lat,
      Math.floor(coords.lng/cellSize.lng)*cellSize.lng
    ];
    let maxPoint =
    [
      minPoint[0] + cellSize.lat,
      minPoint[1] + cellSize.lng
    ];

    let bounds = [minPoint, maxPoint];


    // ------------------------------------------------------------------------
    // Put cell on the map
    // ------------------------------------------------------------------------

    // If cell does not exist yet => create it
    if (!this._cell)
    {
      this._cell = new L.rectangle(bounds, this._main.config.climateCell.style);
      this._cell.addTo(this._map)
    }

    // If cell already exists => update it
    else
      this._cell.setBounds(bounds);


    // ------------------------------------------------------------------------
    // Make cell visible
    // Idea: The user should always see the full extent of the climate cell
    // => determine if the bounds of the cell are fully visible in the viewport
    // ------------------------------------------------------------------------

    this._cell.bringToBack();

    let mapBounds = this._map.getBounds();
    let cellBounds = this._cell.getBounds();

    // Is the climate cell completely in the viewport?
    // i.e. no bound of the cell is visible
    // => zoom out to fit the bounds
    if (cellBounds.contains(mapBounds))
      this._map.fitBounds(cellBounds);

    // Is the cell partially covered by the map?
    // i.e. the map does not contain the full extent of the cell
    // => move the map so the cell is completely visible
    if (!mapBounds.contains(cellBounds))
      this._map.fitBounds(cellBounds)

    // TODO: make it sophisticated: distinguish between fitBounds and panTo

    // Otherwise the cell is completely visible, so there is nothing to do
  }


  // ==========================================================================
  // Remove climate cell from the map
  // ==========================================================================

  remove()
  {
    if (this._cell)
    {
      this._map.removeLayer(this._cell);
      this._cell = null
    }
  }


}
