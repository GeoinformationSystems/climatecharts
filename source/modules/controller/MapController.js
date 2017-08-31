// ############################################################################
// MapController                                                    Controller
// ############################################################################
// Manages the currently selected location on the map for both main modi:
// - ClimateCell mode:    The user selects a random location on the map
//    -> Select the ClimateCell
//    -> Simulated ClimateData for this ClimateCell is loaded
// - WeatherStation mode: The user selects a weather station on the map
//    -> Select the WeatherStation
//    -> Measured ClimateData for this WeatherStation is loaded
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

    // Staus variable: currently an active weather station?
    this._stationJustActivated = false

    // Current coordinates
    this._coords =
      {
        lat:  null,
        lng:  null
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
    // Handle mode
    // If user has clicked on weather station
    // => Do not enter into ClimateCell mode
    if (this._stationJustActivated)
      this._stationJustActivated = false

    // If user has clicked on map
    // => enter ClimateCell mode => setup marker and cell
    else
      this._main.hub.onModeChange('C')

    // Tell everyone: new coordinates
    this._coords = this._bringCoordsInBounds(origCoords)
    this._main.hub.onLocationChange(this._coords)
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
  // Getter: Receive current coordinates from map
  // ==========================================================================

  getCoordinates()
  {
    return this._coords
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Bring coordinates into bounds of geographic coordinate system
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
