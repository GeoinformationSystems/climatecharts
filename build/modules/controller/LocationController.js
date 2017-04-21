"use strict";

// ############################################################################
// LocationController                                                Controller
// ############################################################################
// Manages the currently selected location on the map
// - Two different location options:
//  R) The user selects a random location on the map
//    -> The active climate cell is selected
//    -> Simulated climate data for this cell is loaded
//  W) The user selects a given weatherstation on the map
//    -> The weatherstation is selected
//    -> Given climate data for this station is loaded
// - Receiving selection from the map and the info box
// - Sending data of current location to the map and the climate visualizations
// ############################################################################

var LocationController = {
  // ##########################################################################
  // PRIVATE MEMBER VARIABLES
  // ##########################################################################

  // Extent of geographic coordinates (in lat/lng)
  "LAT_EXTENT": 90,
  "LNG_EXTENT": 180,

  // Current mode: null = none, R = random location, W = weather station
  "mode": null,

  // R) Current geographic coordinates (lat and lng)
  "coords": {
    lat: null,
    lng: null
  },

  // R) Dimension of climate cell (extent in lat / lng direction)
  "cellDimensions": {
    lat: null,
    lng: null
  },

  // W) Current weather station
  "station": null,

  // ##########################################################################
  // PUBLIC MEMBER FUNCTIONS
  // ##########################################################################


  // ==========================================================================
  // Constructor
  // ==========================================================================

  "construct": function construct() {},

  // ==========================================================================
  // New location => Marker and Climate cell
  // ==========================================================================

  "setPosition": function setPosition(origCoords) {
    // origCoords: corrdinates the user has clicked on the map -> unlimited map
    //             => lat can be outside of the geographic coordinate system
    // coords:     translated coordinates definitely inside coordinate system
    this.coords = this.translateCoordsInBounds(origCoords);

    // if already in random location mode => update marker and cell
    if (this.mode == 'R') {
      Map.updateMarker(origCoords);
      Map.updateCell(this.getCellBounds(origCoords));
      this.showCoords(realCoords);
    }

    // else: switch into R mode and setup marker and cell

  },

  // ==========================================================================
  // New dataset => reset dimension of climate cells in lat/lng
  // ==========================================================================

  "setCellDimensions": function setCellDimensions(lat, lng) {
    cellDimensions.lat = lat;
    cellDimensions.lng = lng;
  },

  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

  // ==========================================================================
  // Switch the location mode
  // ==========================================================================

  "switchMode": function switchMode(newMode) {
    // get old and new mode
    var oldMode = this.mode;

    // test: mode must be either null, R or W
    if (newMode != null || newMode != 'R' || newMode != 'W') {
      console.error("The location mode " + newMode + " does not exist!");
      return null;
    }

    // leave random location mode: reset coords
    if (oldMode == 'R') {
      this.coords = { lat: null, lng: null };
      Map.removeMarker();
      Map.removeCell();
    }

    // leave weather station mode: reset station
    else if (oldMode == 'W') {
        this.station = null;
        Map.DeselectStation();
      }

    // set new mode
    this.mode = newMode;
  },

  // ==========================================================================
  // Bring clicked coordinates of the user into the bounds of the
  // geographic coordinate system (lat 90, lng 180)
  // ==========================================================================

  "translateCoordsInBounds": function translateCoordsInBounds(origCoords) {
    realCoords = {
      lat: origCoords,
      lng: origCoords
    };

    while (realCoords.lat < -this.LAT_EXTENT) {
      realCoords.lat += this.LAT_EXTENT * 2;
    }while (realCoords.lat > this.LAT_EXTENT) {
      realCoords.lat -= this.LAT_EXTENT * 2;
    }while (realCoords.lng < -this.LNG_EXTENT) {
      realCoords.lng += this.LNG_EXTENT * 2;
    }while (realCoords.lng > this.LNG_EXTENT) {
      realCoords.lng -= this.LNG_EXTENT * 2;
    }return realCoords;
  },

  // ==========================================================================
  // Calculate the raster cell in which a clicked point is in
  // ==========================================================================

  "getCellBounds": function getCellBounds(coords) {
    // XXX
    cellDimensions.lat = parseFloat(UI.ncML[0].group[0].attribute[6]._value);
    cellDimensions.lng = parseFloat(UI.ncML[0].group[0].attribute[7]._value);

    // determine the cell the current point is in
    // in array format, not object format!
    var minPoint = [Math.floor(coords.lat / cellDimensions.lat) * cellDimensions.lat, Math.floor(coords.lng / cellDimensions.lng) * cellDimensions.lng];
    var maxPoint = [minPoint[0] + cellDimensions.lat, minPoint[1] + cellDimensions.lng];

    return [minPoint, maxPoint];
  },

  // ##########################################################################
  // XXX
  "showCoords": function showCoords(coords) {
    //
    var COORD_PRECISION = 4;
    var factor = Math.pow(10, COORD_PRECISION);

    // visualized value shown in the information box on the right
    var vizCoords = {
      lat: Math.round(coords.lat * factor) / factor,
      lng: Math.round(coords.lng * factor) / factor
    };

    $("#lat").val(vizCoords.lat.toString());
    $("#lng").val(vizCoords.lng.toString());
  }

};