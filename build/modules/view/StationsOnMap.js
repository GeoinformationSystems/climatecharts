"use strict";

// ############################################################################
// StationOnMap                                                            View
// ############################################################################
// Represents one single weather station on the map
// - representation by leaflet circle with station and style
// ############################################################################

var StationOnMap = {
  // ##########################################################################
  // PRIVATE MEMBER VARIABLES
  // ##########################################################################

  // list of all active weather stations currently on the map
  "stations": [],

  // currently selected station
  "selectedStation": null,

  // initial radius of a station
  "INIT_MARKER_RADIUS": 1,

  // factor with which the station markers are resized with when the map is zoomed
  "MARKER_SCALE_FACTOR": 1.5,

  // miminum and maximum radius that will never be undershot / exceeded
  "MIN_STATION_RADIUS": 1,
  "MAX_STATION_RADIUS": 7,

  // style
  "STATION_STYLE": {
    className: 'weatherstation-marker',
    radius: undefined.INIT_MARKER_RADIUS,
    stroke: true,
    color: '#888888',
    opacity: 0.75,
    weight: 1.5,
    fill: true,
    fillColor: '#661323',
    fillOpacity: 1.0
  },

  "ACTIVE_STYLE": {
    color: '#2e6c97',
    fillColor: '#2b83cb'
  },

  // ##########################################################################
  // PUBLIC MEMBER FUNCTIONS
  // ##########################################################################


  // ==========================================================================
  // Constructor
  // ==========================================================================

  "construct": function construct(coords) {},

  // ==========================================================================
  // Add weather station to the map
  // ==========================================================================

  "addStation": function addStation(station) {
    var station = L.circleMarker([coords.lat, coords.lng], this.STATION_STYLE);
    station.addTo(Map.map);
    station.bringToBack();
    this.activeStations.push(station);
  },

  // ==========================================================================
  // Remove weather station from the map
  // ==========================================================================

  "removeStation": function removeStation(station) {
    Map.map.removeLayer(station);
    // remove from array
  },

  // ==========================================================================
  // Select an existing weather station
  // ==========================================================================

  "selectStation": function selectStation(station) {
    // station. // TODO
  },

  // ==========================================================================
  // Deselect the currently selected weather station
  // ==========================================================================

  "deselectStation": function deselectStation() {

    this.selectedStation = null;
  }

};