"use strict";

// ############################################################################
// CellOnMap                                                            View
// ############################################################################
// Represents one single climate cell on the map
// - representation by leaflet rectangle with bounds and style
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
  // Create new rectangle to the map
  // ==========================================================================

  "createCell": function createCell(bounds) {
    this.cell = new L.rectangle(bounds, this.CELL_STYLE);
    this.cell.addTo(Map.map);
    this.makeCellVisible();
  },

  // ==========================================================================
  // Update position of the rectangle to the map
  // ==========================================================================

  "updateCell": function updateCell(bounds) {
    this.cell.setBounds(bounds);
    this.makeCellVisible();
  },

  // ==========================================================================
  // Remove rectangle from the map
  // ==========================================================================

  "removeCell": function removeCell() {
    Map.map.removeLayer(this.cell);
    this.cell = null;
  }

};