"use strict";

// ############################################################################
// MarkerOnMap                                                            View
// ############################################################################
// Represents the marker on the map that the user clicks on
// - representation by leaflet marker with position and style
// ############################################################################

var CellOnMap = {
  // ##########################################################################
  // PRIVATE MEMBER VARIABLES
  // ##########################################################################

  // currently active cell (there can only be one)
  "cell": null,

  // style
  "CELL_STYLE": {
    color: '#000099', // background color
    weight: 2, // width [px] of the outline around the rectangle
    clickable: false
  },

  // ##########################################################################
  // PUBLIC MEMBER FUNCTIONS
  // ##########################################################################


  // ==========================================================================
  // Constructor
  // ==========================================================================

  "construct": function construct(coords) {},

  // ==========================================================================
  // Create new marker to the map
  // ==========================================================================

  "createMarker": function createMarker(coords) {
    this.marker = new L.marker([coords.lat, coords.lng]);
    this.marker.addTo(Map.map);
  },

  // ==========================================================================
  // Update marker position on the map
  // ==========================================================================

  "updateMarker": function updateMarker(coords) {
    this.marker.setLatLng([coords.lat, coords.lng]);
  },

  // ==========================================================================
  // Remove marker from the map
  // ==========================================================================

  "removeMarker": function removeMarker() {
    Map.map.removeLayer(this.marker);
    this.marker = null;
  }

};