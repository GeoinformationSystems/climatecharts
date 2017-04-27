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
    // Current mode:
    // null = none
    // R = random location -> User clicks on map -> climate data from cell
    // W = weather station -> User clicks on station -> data from station
    this._mode = null

    // R) Current geographic coordinates (lat and lng)
    this._coords =
    {
      lat: null,
      lng: null,
    }

    // R) Dimension of climate cell (extent in lat / lng direction)
    this._cellDimensions =
    {
      lat: null,
      lng: null,
    }

    // W) Current weather station
    this._station = null
  }


  // ==========================================================================
  // New location => Marker and Climate cell
  // ==========================================================================

  setPosition (origCoords)
  {
    console.log("MUH!");
    // origCoords: corrdinates the user has clicked on the map -> unlimited map
    //             => lat can be outside of the geographic coordinate system
    // coords:     translated coordinates definitely inside coordinate system
    this._coords = this.bringCoordsInBounds(origCoords)

    // if already in random location mode => update marker and cell
    if (this._mode == 'R')
    {
      Map.updateMarker(origCoords)
      Map.updateCell(this.getCellBounds(origCoords))
      this.showCoords(realCoords)
    }

    // else: switch into R mode and setup marker and cell
    // TODO
  }


  // ==========================================================================
  // New dataset => reset dimension of climate cells in lat/lng
  // ==========================================================================

  setCellDimensions (lat, lng)
  {
    this._cellDimensions.lat = lat
    this._cellDimensions.lng = lng
  }


  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

  // ==========================================================================
  // Switch the location mode
  // ==========================================================================

  switchMode (newMode)
  {
    // get old and new mode
    var oldMode = this._mode

    // test: mode must be either null, R or W
    if (newMode != null || newMode != 'R' || newMode != 'W')
    {
      console.error("The location mode " + newMode + " does not exist!")
      return null
    }

    // leave random location mode: reset coords
    if (oldMode == 'R')
    {
      this._coords = {lat: null, lng: null}
      Map.removeMarker()
      Map.removeCell()
    }

    // leave weather station mode: reset station
    else if (oldMode == 'W')
    {
      this._station = null
      Map.DeselectStation()
    }

    // set new mode
    this._mode = newMode
  }


  // ==========================================================================
  // Bring clicked coordinates of the user into the bounds of the
  // geographic coordinate system (lat 90, lng 180)
  // ==========================================================================

  bringCoordsInBounds (origCoords)
  {
    let realCoords = {
      lat: origCoords,
      lng: origCoords
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

  getCellBounds (coords)
  {
    // XXX
    this._cellDimensions.lat = parseFloat(UI.ncML[0].group[0].attribute[6]._value)
    this._cellDimensions.lng = parseFloat(UI.ncML[0].group[0].attribute[7]._value)

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
