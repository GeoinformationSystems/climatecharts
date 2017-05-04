// ############################################################################
// StationController                                                Controller
// ############################################################################
// Manages all weather stations in the system
// - Load and stations from the database
// - Manage (de)active weather station based on availability of data in system
// - Tell StationsOnMap about (de)active weather stations
// ############################################################################

class WeatherStationController
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

    this._stations = []             // all stations
    this._activeStations = []       // all stations that currently have data
    this._selectedStation = null    // the one station that is (maybe) selected


    // initial station loading
    this._loadStations()

  }


  // ==========================================================================
  // (De)Select weatherstation
  // ==========================================================================

  select(station)
  {
    if (station.is_active)
    {
      // cleanup currently selected station
      this.deselect()

      // model
      station.is_selected = true
      this._loadDataForStation(station)

      // view
      this._main.modules.weatherStationsOnMap.highlight(station)

      // controller
      this._selectedStation = station
    }
  }

  deselect()
  {
    if (this._selectedStation)
    {
      // model
      this._selectedStation.is_selected = false

      // view
      this._main.modules.weatherStationsOnMap.deHighlight(this._selectedStation)

      // controller
      this._selectedStation = null
    }
  }


  // ==========================================================================
  // Cleanup: deselect current station
  // ==========================================================================

  cleanup()
  {
    this.deselect()
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // (De)Activate station
  // ==========================================================================

  _activate(station)
  {
    // model
    station.is_active = true

    // view
    this._main.modules.weatherStationsOnMap.show(station)
    // TODO: add coordinates to infobox

    // controller
    this._activeStations.push(station)
  }

  _deactivate(station)
  {
    // model
    station.is_active = false

    // view
    this._main.modules.weatherStationsOnMap.hide(station)

    // controller (remove from list)
    listIdx = this._activeStations.indexOf(station)
    this._activeStations.splice(listIdx, 1)
  }


  // ==========================================================================
  // Load all stations from database
  // ==========================================================================

  _loadStations()
  {
    $.get
    (''
      + ENDPOINTS.weatherstations
      + "/getAllStations",
      (allStationsData) =>
      {
        // for each station
        for (var stationData of allStationsData)
        {
          var station =           new WeatherStation()

          // fill general data
          station.id =              stationData.id
          station.name =            stationData.name
          station.country =         stationData.country
          station.position =
          {
              lat:                  stationData.lat,
              lng:                  stationData.lng,
          }
          station.elev =            stationData.elev
          station.min_year =        stationData.min_year
          station.max_year =        stationData.max_year
          station.coverage_rate =   stationData.complete_data_rate
          station.largest_gap =     stationData.largest_gap
          station.missing_months =  stationData.missing_months

          // put markers on the map, if it has data in the current time range
          // initially ensure only available stations are shown
          this._activate(station)

          // make station accessible
          this._stations.push(station)

          // clicking on the marker => get climate data
          // using JavaScript anonymous-functions-and-bind-magic :)
          // credits: http://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters
        }
      }
    );
  }


  // ==========================================================================
  // Load climate data for one specific station from database
  // ==========================================================================

  _loadDataForStation(station)
  {
    // TODO: years
    let minYear = 1970
    let maxYear = 2000
    $.get(
      (''
        + ENDPOINTS.weatherstations
        + '/getStationData'
        + '?stationId='
        + station.id
        + '&minYear='
        + minYear
        + '&maxYear='
        + maxYear
      ),
      climateData =>
        {
          // initialize empty climate data object
          station.climateData = new ClimateData()

          // fill station with climate data
          station.climateData.fillTemp(climateData.temp)
          station.climateData.fillPrec(climateData.prec)

          // calculate number of years
          // TODO: check for reasonability
          station.climateData.calcNumYears(minYear, maxYear)
        }
    )
  }

  _fillClimateData(station, climateData)
  {

  }



  // ==========================================================================
  // Ensure that a station is only shown if it actually has data
  // in the current time period
  // ==========================================================================

  _isActiveInTimeRange(station)
  {
    // idea: two time perions (A and B), two time points (0 = start, 1 = end)
    // A and B overlap if A0 < B1 and B0 < A1
    //                A0 < B1              B0 < A1
    if (station.min_year < UI.end && UI.start < station.max_year)
      return true
    else
      return false
  }
}
