// ############################################################################
// StationController                                                Controller
// ############################################################################
// Manages all weather stations in the system
// - Load stations from the database
// - Manage (in)active weather station based on availability of data in system
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
      // Cleanup currently selected station
      this.deselect()

      // Model
      station.is_selected = true
      this._loadDataForStation(station)

      // View
      this._main.modules.weatherStationsOnMap.highlight(station)

      // Controller
      this._selectedStation = station
      this._main.modules.mapController.clickedOnStation()
    }
  }

  deselect()
  {
    if (this._selectedStation)
    {
      // Model
      this._selectedStation.is_selected = false

      // View
      this._main.modules.weatherStationsOnMap.deHighlight(this._selectedStation)

      // Controller
      this._selectedStation = null
    }
  }


  // ==========================================================================
  // Update data for weather station
  // ==========================================================================

  update()
  {
    if (this._selectedStation)
      this._loadDataForStation(this._selectedStation)
  }


  // ==========================================================================
  // Cleanup: deselect current station
  // ==========================================================================

  cleanup()
  {
    this.deselect()
  }


  // ==========================================================================
  // Return currently active weather station
  // ==========================================================================

  getSelectedStation()
  {
    return this._selectedStation
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // (De)Activate station
  // ==========================================================================

  _activate(station)
  {
    // Model
    station.is_active = true

    // View
    this._main.modules.weatherStationsOnMap.show(station)

    // Controller
    this._activeStations.push(station)
  }

  _deactivate(station)
  {
    // Model
    station.is_active = false

    // View
    this._main.modules.weatherStationsOnMap.hide(station)

    // Controller
    // -> remove from list
    listIdx = this._activeStations.indexOf(station)
    this._activeStations.splice(listIdx, 1)
  }


  // ==========================================================================
  // Load all stations from database
  // ==========================================================================

  _loadStations()
  {
    this._main.modules.serverInterface.requestAllWeatherStations(
      (allStationsData) =>
        {
          // For each station
          for (var stationData of allStationsData)
          {
            var station =             new WeatherStation()

            // fill general data
            station.id =              stationData.id
            station.name =            stationData.name
            station.country =         stationData.country
            station.location =
            {
                lat:                  stationData.lat,
                lng:                  stationData.lng,
            }
            station.elevation =       stationData.elev
            station.min_year =        stationData.min_year
            station.max_year =        stationData.max_year
            station.coverage_rate =   stationData.complete_data_rate
            station.largest_gap =     stationData.largest_gap
            station.missing_months =  stationData.missing_months

            // Save station
            this._stations.push(station)

            // Put markers on the map, if it has data in the current time range
            if (this._isActiveInTimeRange(station))
            {
              this._activate(station)
              this._activeStations.push(station)
            }

            // Click on marker => get climate data
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
    this._main.modules.serverInterface.requestDataForWeatherStation(
      station.id,
      this._main.modules.timeController.getPeriodStart(),
      this._main.modules.timeController.getPeriodEnd(),
      (climateData) =>
        {
          this._main.modules.climateDataController.update(
            climateData.temp, climateData.prec,   // Actual climate data
            [station.name, station.country],      // Meta data: location name
            station.location, station.elevation,  // Meta data: geo location
            this._main.config.station.source      // Meta data: source
          )
        }
    )
  }


  // ==========================================================================
  // Ensure that a station is only shown if it actually has data
  // in the current time period
  // ==========================================================================

  _isActiveInTimeRange(station)
  {
    // idea: two time perions (A and B), two time points (0 = start, 1 = end)
    // A and B overlap if A0 < B1 and A1 > B0
    if ((station.min_year < this._main.modules.timeController.getPeriodEnd()) &&
        (station.max_year > this._main.modules.timeController.getPeriodStart()) )
      return true
    else
      return false
  }
}
