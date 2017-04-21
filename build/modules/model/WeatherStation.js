"use strict";

// ############################################################################
// WeatherStation                                                         Model
// ############################################################################
// Station represents one single WeatherStation in the system
// - A bit more detailed
// - So that everybody understands what this is for
// ############################################################################

function WeatherStation() {

  // ==========================================================================
  // Raw data
  // ==========================================================================

  this.id = null;
  this.name = "";
  this.coords = {
    lat: 0.0,
    lng: 0.0
  };
  this.elev = 0.0;
  this.min_year = 0;
  this.max_year = 9999;
  this.coverage_rate = 1.0;
  this.largest_gap = 0;
  this.data = new ClimateData();

  // ==========================================================================
  // Visualization data
  // ==========================================================================

  this.has_data = false;
  this.is_visible = false;
  this.is_selected = false;
}