/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann and Marcus Kossatz
 *
 * This file contains everything that is related to the Weatherstations on the map
 *  request handling (client <-> server communication)
 *  interaction
 *  visualization
 */

// initial radius of a circle
INIT_MARKER_RADIUS = 1

// factor with which the station markers are resized with when the map is zoomed
MARKER_SCALE_FACTOR = 1.5

// miminum and maximum radius that will never be undershot / exceeded
MIN_MARKER_RADIUS = 1
MAX_MARKER_RADIUS = 7

// style of markers
MARKER_STYLE =
{
  strokeWidth:        1.5,
  strokeColor:        '#888888',
  strokeColor_active: '#2e6c97',
  strokeOpacity:      0.75,
  fillColor:          '#661323',
  fillColor_active:   '#2b83cb',
  fillOpacity:        1.0,
}


var WeatherStations =
{
  //////////////////////////////////////////////////////////////////////////////
  // Member Variables
  //////////////////////////////////////////////////////////////////////////////

  "stations": [],


  //////////////////////////////////////////////////////////////////////////////
  // Public Member Functions
  //////////////////////////////////////////////////////////////////////////////

	// Initialize the stations on the map
	"init": function()
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
          var station = allStationsData[idx]

          // create marker
          var marker = L.circleMarker
            (
              [station.lat, station.lng],
              {
                radius:       INIT_MARKER_RADIUS,
                stroke:       true,
                color:        MARKER_STYLE.strokeColor,
                opacity:      MARKER_STYLE.strokeOpacity,
                weight:       MARKER_STYLE.strokeWidth,
                fill:         true,
                fillColor:    MARKER_STYLE.fillColor,
                fillOpacity:  MARKER_STYLE.fillOpacity,
                className:    'weatherstation-marker'
              }
            )
          // TODO: support title -> extra div? mouseover? ...
          // station.name + ", " + station.country + " (elevation:" + station.elev + ")",

          // additional attribute: does the station have data in the current
          // time range = can it be shown or must it be hidden?
          station.hasData = false;

          // put markers on the map, if it has data in the current time range
          // initially ensure only available stations are shown
          if (WeatherStations.isActiveInTimeRange(station))
          {
            station.hasData = true;
            marker.addTo(UI.map)
            marker.bringToBack()
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
          start:  UI.map.getZoom(),
          end:    UI.map.getZoom()
        }
        var markerRadius = INIT_MARKER_RADIUS

        UI.map.on('zoomstart', function(e)
          {
            zoom.start = UI.map.getZoom()
          }
        )

        UI.map.on('zoomend', function(e)
          {
            zoom.end = UI.map.getZoom()
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


  // deselect station if out of range
  // show stations that now have data,
  // hide stations that do not have data anymore in the new time range
  "updateStations": function()
  {
    // check for current station if it is out of range
    if (UI.activeWeatherStation &&
        !WeatherStations.isActiveInTimeRange(UI.activeWeatherStation))
    {
      WeatherStations.deactivateStation()
      UI.removeCharts();
    }

    // check for each station if its status changed
    for (var stationIdx in WeatherStations.stations)
    {
      var station = WeatherStations.stations[stationIdx]
      var stationHadData = station.hasData
      var stationHasData = WeatherStations.isActiveInTimeRange(station)

      // Four cases:

      // 1) Station had data before and still has => no action required
      // 2) Station had no data befor and now has => show
      if (!stationHadData && stationHasData)
      {
        station.hasData = true;
        station.marker.addTo(UI.map)
        station.marker.bringToBack()
      }

      // 3) Station had data before and now does not have anymore => hide
      else if (stationHadData && !stationHasData)
      {
        station.hasData = false
        UI.map.removeLayer(station.marker)
      }

      // 4) Station had no data before and still does not have => no action

    }
  },


  //////////////////////////////////////////////////////////////////////////////
  // Private Member / Helper Functions
  //////////////////////////////////////////////////////////////////////////////


  // get data from weatherstation and visualize it
  "loadData": function()
  {
    $.get(
      (''
        + ENDPOINTS.weatherstations
        + '/getStationData'
        + '?stationId='
        + UI.activeWeatherStation.id
        + '&minYear='
        + UI.start
        + '&maxYear='
        + UI.end
      ),
      function(stationClimateData)
      {
        var geoname =
        {
          name:         UI.activeWeatherStation.name,
          adminName1:   '',
          countryName:  UI.activeWeatherStation.country
        }
        var elevation = UI.activeWeatherStation.elev

        UI.visualizeClimate(stationClimateData, geoname, elevation)
      }
    )
  },

  // ensure that the station is only shown if it actually has data
  // in the current time period
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

  // // for each marker: check if current period overlaps with
  // // period of available data for the station
  // for (var stationIdx in WeatherStations.stations)
  // {
  //   var station = WeatherStations.stations[stationIdx];
  //   var isActive =
  //   console.log(station.min_year, station.max_year, UI.start, UI.end);
  // }

  // make current weather station visible
  "activateStation": function(station)
  {
    station.marker.setStyle(
      {
        color:        MARKER_STYLE.strokeColor_active,
        fillColor:    MARKER_STYLE.fillColor_active
      }
    );
    UI.activeWeatherStation = station
  },

  // clear current weather station
  "deactivateStation": function()
  {
    if (UI.activeWeatherStation)
    {
      UI.activeWeatherStation.marker.setStyle(
        {
          color:        MARKER_STYLE.strokeColor,
          fillColor:    MARKER_STYLE.fillColor
        }
      );
      UI.activeWeatherStation = null
    }
  }
}

/* station object
  id:64917244008
  name:"Altinova Duc"
  country:"Turkey"
  lat:38.70000076293945
  lng:32.20000076293945
  elev:1130
  min_year:1961
  max_year:1990
  complete_data_rate:0
  largest_gap:86
  missing_months:139
*/
