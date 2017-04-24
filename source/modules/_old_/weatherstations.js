/**
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

      // 1) Station had no data befor and now has => show
      if (!stationHadData && stationHasData)
      {
        station.hasData = true;
        station.marker.addTo(Map.map)
        station.marker.bringToBack()
      }

      // 2) Station had data before and now does not have anymore => hide
      else if (stationHadData && !stationHasData)
      {
        station.hasData = false
        Map.map.removeLayer(station.marker)
      }

      // 3) Station had data before and still has
      // 4) Station had no data before and still does not have
      // => no action required

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

**/
