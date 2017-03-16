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

// miminum and maximum radius that will never be surpassed / exceeded
MIN_MARKER_RADIUS = 1
MAX_MARKER_RADIUS = 7.5

// style of markers
MARKER_STYLE =
{
  strokeColor:    '#999999',
  strokeOpacity:  0.75,
  fillColor:      '#666666',
  fillOpacity:    1.0,
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

          // clicking on the marker => get climate data
          // using JavaScript anonymous-functions-and-bind-magic :)
          // credits: http://stackoverflow.com/questions/10000083/javascript-event-handler-with-parameters
          marker.addEventListener('click',
            function(station, evt)
            {
              $.get(
                (''
                  + ENDPOINTS.weatherstations
                  + '/getStationData'
                  + '?stationId='
                  + station.id
                  + '&minYear='
                  + UI.start
                  + '&maxYear='
                  + UI.end
                ),
                function(stationClimateData)
                {
                  var a1 = 0
                  var a2 = 0

                  var geoname =
                  {
                    name:         station.name,
                    adminName1:   '',
                    countryName:  station.country
                  }
                  var elevation = station.elev

                  console.log(geoname.name, geoname.countryName);

                  // quality of data
                  var numYears = UI.end-UI.start
                  var maxPts = numYears*12*2
                  var covPts = 0
                  // for each year
                  for (var year=0; year<numYears; year++)
                  {
                    // for each month
                    for (var month=0; month<12; month++)
                    {
                      if (stationClimateData[year].prec[month] != 0)
                        covPts++
                      if (stationClimateData[year].temp[month] != 0)
                        covPts++
                    }
                  }
                  console.log(100*covPts/maxPts);
                  console.log(stationClimateData);

                  // UI.visualizeClimate(a1, a2, geoname, elevation)
                }
            )
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
            visibleMarkerRadius = Math.min(MAX_MARKER_RADIUS, markerRadius)
            visibleMarkerRadius = Math.max(MIN_MARKER_RADIUS, markerRadius)
            for (var markerIdx in markers)
              markers[markerIdx].setRadius(visibleMarkerRadius)
          }
        )
      }
    );

		// Update coordinate variables if the user clicked on the map.
		// function localFunction ()

		// Update coordinate variables if the user typed in coordinate values
		// manually.
		$("jQuery selector").change(function ()
      {

	    }
    );

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
