// ############################################################################
// LocationController                                                Controller
// ############################################################################
// Manages the currently selected location on the map
// - Two different location options:
//  R) The user selects a random location on the map
//    -> The active climate cell is selected
//    -> Simulated climate data for this cell is loaded
//  W) The user selects a given weatherstation on the map
//    -> The weatherstation is selected
//    -> Given climate data for this station is loaded
// - Receiving selection from the map and the info box
// - Sending data of current location to the map and the climate visualizations
// ############################################################################


class LocationController
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

    // Currently in location mode?
    // User clicks on map -> climate data from cell
    this._inLocationMode = false

    // Current geographic coordinates (lat and lng)
    this._coords =
    {
      lat: null,
      lng: null,
    }

    // Dimension of climate cell (extent in lat / lng direction)
    this._cellDimensions =
    {
      lat: null,
      lng: null,
    }
  }


  // ==========================================================================
  // Click new location => (re)set marker and climate cell
  // ==========================================================================

  setLocation(origCoords)
  {
    // origCoords: corrdinates the user has clicked on the map -> unlimited map
    //             => lat can be outside of the geographic coordinate system
    // coords:     translated coordinates definitely inside coordinate system
    this._coords = this._bringCoordsInBounds(origCoords)

    // if already in random location mode => update marker and cell
    if (this._inLocationMode)
    {
      this._main.modules.map.resetMarker(origCoords)
      this._main.modules.map.resetCell(this._getCellBounds(origCoords))
    }

    // else: switch into R mode and setup marker and cell
    else
    {
      this._inLocationMode = true
      this._main.modules.map.setMarker(origCoords)
      this._main.modules.map.setCell(this._getCellBounds(origCoords))
    }
  }

  // ==========================================================================
  // Cleanup location: remove location marker and cell
  // ==========================================================================

  cleanup()
  {
    this._coords = {lat: null, lng: null}
    this._main.modules.map.removeMarker()
    this._main.modules.map.removeCell()
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
  // Bring clicked coordinates of the user into the bounds of the
  // geographic coordinate system (lat 90, lng 180)
  // ==========================================================================

  _bringCoordsInBounds(origCoords)
  {
    let realCoords =
    {
      lat: origCoords.lat,
      lng: origCoords.lng
    }

    while (realCoords.lat < -LAT_EXTENT)
      realCoords.lat += LAT_EXTENT*2
    while (realCoords.lat > LAT_EXTENT)
      realCoords.lat -= LAT_EXTENT*2

    while (realCoords.lng < -LNG_EXTENT)
      realCoords.lng += LNG_EXTENT*2
    while (realCoords.lng > LNG_EXTENT)
      realCoords.lng -= LNG_EXTENT*2

    return(realCoords)
  }


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


  // ##########################################################################
  // XXX
  // "showCoords": function(coords)
  // {
  //   //
  //   var COORD_PRECISION = 4
  //   var factor = Math.pow(10, COORD_PRECISION)
  //
  //   // visualized value shown in the information box on the right
  //   var vizCoords =
  //   {
  //     lat: (Math.round(coords.lat*factor)/factor),
  //     lng: (Math.round(coords.lng*factor)/factor),
  //   }
  //
  //   $("#lat").val(vizCoords.lat.toString());
  //   $("#lng").val(vizCoords.lng.toString());
  // },

}
