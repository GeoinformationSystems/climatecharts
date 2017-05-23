// ############################################################################
// MapController                                                    Controller
// ############################################################################
// Manages the currently selected location on the map
// - Two different location modi:
//  C) ClimateCell mode
//    The user selects a random location on the map
//    -> The active climate cell is selected
//    -> Simulated climate data for this cell is loaded
//  S) WeatherStation mode
//    The user selects a given weather station on the map
//    -> The weatherstation is selected
//    -> Given climate data for this station is loaded
// - Receiving selection from the map and the info box
// - Sending data of current location to the map and the climate visualizations
// ############################################################################


class MapController
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

    // Current mode: null, 'C' or 'S'
    // Currently in location mode?
    // User clicks on map -> climate data from cell
    this._mode = null

    // Staus variable: currently an active weather station?
    this._stationJustActivated = false

    // Coordinates of currently selected geographic entity
    // -> either weather station or location marker
    this._coords =
    {
      lat: null,
      lng: null,
    }
  }


  // ==========================================================================
  // Click new location => decide if click on weather station or map
  // Problem:
  // - No way to distinguish from Leaflet map (same coordinates)
  // - WeatherStationsOnMap fires click on weather station first
  // Solution:
  // - Recognize click on station through WeatherStationController
  // - Tell MapController that weather station has just been clicked on
  // - MapController can ignore click event from map and reset variable
  // ==========================================================================

  setLocation(origCoords)
  {
    let coords = this._bringCoordsInBounds(origCoords)

    // If user has clicked on weather station
    if (this._stationJustActivated)
    {
      // Switch mode
      this._mode = 'S'

      // Cleanup marker and cell
      this._main.modules.locationMarkerController.cleanup()
      this._main.modules.climateCellController.cleanup()

      // Reset variable for next click on station
      this._stationJustActivated = false

      // Setup of weatherstation handled in WeatherStationsOnMap...
    }

    // If user has clicked on map, setup marker and cell
    else
    {
      // Switch mode
      this._mode = 'C'

      // Cleanup weatherstation
      this._main.modules.weatherStationController.cleanup()

      // Setup marker and cell
      this._main.modules.locationMarkerController.set(coords)
      this._main.modules.climateCellController.set(coords)
    }

    // Show coordinates in infobox
    this._main.modules.coordinatesInInfobox.update(coords)

    // Save coordinates
    this._coords = coords
  }


  // ==========================================================================
  // Recognize that a weather station has been clicked on
  // -> Important for mechanism to distinguish between click on map or station
  // ==========================================================================

  clickedOnStation()
  {
    this._stationJustActivated = true
  }


  // ==========================================================================
  // Getter
  // ==========================================================================

  getLocation()
  {
    return this._coords
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

}
