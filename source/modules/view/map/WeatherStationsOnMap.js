// ############################################################################
// WeatherStationsOnMap                                                    View
// ############################################################################
// Represents one single weather station on the map
// - representation by leaflet circle with station and style
// ############################################################################

class WeatherStationsOnMap
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
    this._map = this._main.modules.map.getMap()
    this._helpers = this._main.modules.helpers

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._activeStations = []

    this._zoom =
    {
      start:  this._map.getZoom(),
      end:    this._map.getZoom()
    }

    this._realMarkerRadius = this._main.config.station.initRadius

    // mixin style configs (highlight -> default style)
    this._main.config.station.style.selected = this._helpers.mixin(
      this._main.config.station.style.selected,
      this._main.config.station.style.default,
    )


    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

    // Map zoom => scale circles with zoom level
    this._map.on('zoomstart', (evt) =>
        this._zoom.start = this._map.getZoom()
    )

    this._map.on('zoomend', (evt) =>
      {
        this._zoom.end = this._map.getZoom()
        let diff = this._zoom.end - this._zoom.start

        // actual mathematical radius of the marker, depending on zoom level
        this._realMarkerRadius *=
          Math.pow(this._main.config.station.scaleFactor, diff)

        // Actually resize circles
        for (var station of this._activeStations)
          station.marker.setRadius(this.cropRadius(this._realMarkerRadius))
      }
    )
  }


  // ==========================================================================
  // Show weather station = add to map
  // ==========================================================================

  show(station)
  {
    // Add to map (in background)
    let stationMarker = L.circleMarker(
      [station.location.lat, station.location.lng],  // location
      this._main.config.station.style.default        // style
    )
    stationMarker.setRadius(this.cropRadius(this._realMarkerRadius))
    stationMarker.addTo(this._map)

    // Establish link model <-> view
    station.marker = stationMarker
    stationMarker.station = station

    // remember station
    this._activeStations.push(station)


    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

    // Click on station => activate
    stationMarker.addEventListener('click', (evt) =>
      {
        this._main.modules.weatherStationController.select(stationMarker.station)
      }
    )
  }


  // ==========================================================================
  // Hide weather station = remove from map
  // ==========================================================================

  hide(station)
  {
    // Remove from map
    this._map.removeLayer(station.marker)

    // Remove link model <-> view
    station.marker = null

    // Forget station
    let listIdx = this._activeStations.indexOf(station)
    this._activeStations.splice(listIdx, 1)
  }


  // ==========================================================================
  // (De)highlight on map
  // ==========================================================================

  highlight(station)
  {
    station.marker.setStyle(this._main.config.station.style.selected)
  }

  deHighlight(station)
  {
    station.marker.setStyle(this._main.config.station.style.default)
  }


  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

  // ==========================================================================
  // Crop real radius to min / max radius
  // ==========================================================================

  cropRadius(inRadius)
  {
    // visible radius of the marker, always in between min and max radius
    // have to be distinguished to maintain mapping zoom level <-> radius
    let croppedRadius = inRadius
    croppedRadius = Math.min(
      this._main.config.station.maxRadius,
      croppedRadius
    )
    croppedRadius = Math.max(
      this._main.config.station.minRadius,
      croppedRadius
    )
    return croppedRadius
  }
}
