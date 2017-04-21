// ############################################################################
// StationController                                                Controller
// ############################################################################
// Manages all weather stations in the system
// - Load and stations from the database
// - Manage (de)active weather station based on availability of data in system
// - Tell StationsOnMap about (de)active weather stations
// ############################################################################

var StationContoller =
{
  // ##########################################################################
  // PRIVATE MEMBER VARIABLES
  // ##########################################################################

  // description
  "stations": [],


  // ##########################################################################
  // PUBLIC MEMBER FUNCTIONS
  // ##########################################################################


  // ==========================================================================
  // Constructor
  // ==========================================================================

  "construct": function()
  {
    this.loadStations()
  },


  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

  "loadStations": function()
  {
    $.get
    (''
      + ENDPOINTS.weatherstations
      + "/getAllStations",
      function(allStationsData)
      {
        // for each station
        for (var idx in allStationsData)
        {
          var station = new WeatherStation()
          station.populate(allStationsData[idx])



          // put markers on the map, if it has data in the current time range
          // initially ensure only available stations are shown
          if (WeatherStations.isActiveInTimeRange(station))
          {
            station.hasData = true
            StationsOnMap.addStation(station)
          }

          // make station accessible
          station.marker = marker   // cross-reference data <-> visualization
          WeatherStations.stations.push(station)

          // clicking on the marker => get climate data
          // using JavaScript anonymous-functions-and-bind-magic :)
          // credits: http://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters
          marker.addEventListener('click',
            function(station, evt)
            {
              UI.setPosition(station.lat, station.lng)
              // decide: activate or deactivate?

              if (UI.activeWeatherStation == station)   // deactivate station
              {
                WeatherStations.deactivateStation();
                UI.removeCharts();
              }

              else                                      // activate station
              {
                // cleanup current climate cell or weatherstation
                UI.deactivateClimateCell();
                WeatherStations.deactivateStation();

                // activate current weatherstation
                WeatherStations.activateStation(station);
                UI.setMarker(station.lat, station.lng);
                UI.createCharts();
              }
            }.bind(marker, station),
            false
          );
        }

        // Event Handling
        // --------------

        // Zoom: scale circles with zoom level
        var zoom =
        {
          start:  Map.map.getZoom(),
          end:    Map.map.getZoom()
        }
        var markerRadius = INIT_MARKER_RADIUS

        Map.map.on('zoomstart', function(e)
          {
            zoom.start = Map.map.getZoom()
          }
        )

        Map.map.on('zoomend', function(e)
          {
            zoom.end = Map.map.getZoom()
            var diff = zoom.end - zoom.start

            // actual mathematical radius of the marker, depending on zoom level
            markerRadius *= Math.pow(MARKER_SCALE_FACTOR, diff)

            // visible radius of the marker, always in between min and max radius
            // have to be distinguished to maintain mapping zoom level <-> radius
            var visibleMarkerRadius = markerRadius
            visibleMarkerRadius = Math.min(MAX_MARKER_RADIUS, visibleMarkerRadius)
            visibleMarkerRadius = Math.max(MIN_MARKER_RADIUS, visibleMarkerRadius)
            for (var stationIdx in WeatherStations.stations)
              WeatherStations.stations[stationIdx].marker.setRadius(visibleMarkerRadius)
          }
        )
      }
    );
  },


  // ==========================================================================
  // Ensure that a station is only shown if it actually has data
  // in the current time period
  // ==========================================================================

  "isActiveInTimeRange": function(station)
  {
    // idea: two time perions (A and B), two time points (0 = start, 1 = end)
    // A and B overlap if A0 < B1 and B0 < A1
    //                A0 < B1              B0 < A1
    if (station.min_year < UI.end && UI.start < station.max_year)
      return true
    else
      return false
  },


}
