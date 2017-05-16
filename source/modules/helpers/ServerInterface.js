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

  /*
    use me like this:
    -----------------
      this._main.modules.serverInterface.requestNameForLocation(
        coords,
        (d) => {name = ([d.name, d.adminName1, d.countryName])}
      )
    }
  */

  requestNameForLocation(coords, successCallback)
  {
    return this._requestGazetteer(coords, "N", successCallback)
  }

  requestElevationForLocation(coords, successCallback)
  {
    return this._requestGazetteer(coords, "E", successCallback)
  }


  // ==========================================================================
  // Simulated climate data for datasets
  // ==========================================================================

  requestAllDatasets(successCallback)
  {
    $.get(
      ( ""
        + ENDPOINTS.thredds
        + "/catalog.xml"
      ),
      successCallback
    )
  }

  requestMetadataForDataset(urlPaths, successCallback)
  {
    let url0 = ""
      + ENDPOINTS.thredds
      + "/ncml/"
      + urlPaths[0]
    let url1 = ""
      + ENDPOINTS.thredds
      + "/ncml/"
      + urlPaths[1]

    $.when($.get(url0), $.get(url1))
      .done(successCallback)
  }


  requestClimateDataForCell(urls, variables, bounds, dates, successCallback)
  {
    $.get(
      ( ""
        + ENDPOINTS.thredds
        + "/ncss/"
        + urls[0]
        + "&latitude=" +    bounds[0]
        + "&longitude=" +   bounds[1]
        + "&time_start=" +  dates[0]
        + "&time_end=" +    dates[1]
      ),
      successCallback
    )
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

  // ==========================================================================
  // Request gazetteer for mode 'N' = name or 'E' = elevation
  // ==========================================================================

  _requestGazetteer(coords, mode, successCallback)
  {
    let url = ENDPOINTS.gazetteer
    if (mode == 'N')
      url += "/getName"
    else if (mode == 'E')
      url += "/getElevation"
    else // error
      return null

    $.get(url,
        {
          lat: coords.lat,
          lng: coords.lng
        },
        successCallback
      )
  }

}
