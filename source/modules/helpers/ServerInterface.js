// ############################################################################
// ServerInterface                                                      Helper
// ############################################################################
// This class is the one and only class that handles the connection to the
// server apps (send requests, return response)
// - To gazetteer       (getName, getElevation)
// - To thredds         (ncss)
// - To weatherstations (getAllStations, getStationData)
// ############################################################################

class ServerInterface
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
  }


  // ==========================================================================
  // Gazetteer location information
  // ==========================================================================

  requestNameForLocation(coords)
  {

  }

  requestElevationForLocation(coords)
  {

  }


  // ==========================================================================
  // Climate data for datasets
  // ==========================================================================

  requestClimateDataForCell(bounds)
  {

  }

  // ==========================================================================
  // Weatherstations
  // ==========================================================================

  requestAllWeatherStations(successCallback)
  {
    $.get(
      ( ""
        + ENDPOINTS.weatherstations
        + "/getAllStations"
      ),
      successCallback
    )
  }

  requestDataForWeatherStation(stationId, minYear, maxYear, successCallback)
  {
    $.get(
      (
        ""
        + ENDPOINTS.weatherstations
        + '/getStationData'
        + '?stationId='
        + stationId
        + '&minYear='
        + minYear
        + '&maxYear='
        + maxYear
      ),
      successCallback
    )
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################



}
