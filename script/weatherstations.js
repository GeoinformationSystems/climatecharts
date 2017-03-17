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
  strokeColor:        '#999999',
  strokeColor_active: '#2e6c97',
  strokeOpacity:      0.75,
  fillColor:          '#666666',
  fillColor_active:   '#2b83cb',
  fillOpacity:        1.0,
}


var WeatherStations = {

	// Initialize the stations on the map
	"init": function()
  {
    $.get
    (''
      + ENDPOINTS.weatherstations
      + "/getAllStations",
      function(allStationsData)
      {
        markers = []

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
                fill:         true,
                fillColor:    MARKER_STYLE.fillColor,
                fillOpacity:  MARKER_STYLE.fillOpacity,
                className:    'weatherstation-marker'
              }
            )
          // TODO: support title -> extra div? mouseover? ...
          // station.name + ", " + station.country + " (elevation:" + station.elev + ")",
          marker.addTo(UI.map)
          markers.push(marker)
          station.marker = marker   // cross-reference data <-> visualization

          // clicking on the marker => get climate data
          // using JavaScript anonymous-functions-and-bind-magic :)
          // credits: http://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters
          marker.addEventListener('click',
            function(station, evt)
            {
              UI.setPosition(station.lat, station.lng)
              // decide: activate or deactivate?

              if (UI.activeWeatherStation == station)  // deactivate clicked station
              {
                WeatherStations.deactivateStation();
                UI.removeCharts();
              }

              else                          // activate clicked station
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

        // scale circles with zoom level
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
            for (var markerIdx in markers)
              markers[markerIdx].setRadius(visibleMarkerRadius)
          }
        )
      }
    );
  },

  "loadData": function()
  {
    // get data from weatherstation and visualize
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
      UI.activeWeatherStation = null;
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
