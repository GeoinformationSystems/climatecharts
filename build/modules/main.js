"use strict";

/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann and Marcus Kossatz
 *
 * This file contains the user interface object for the website. The variables defined at
 * the beginning are necessary to query the server for temperature and precipitation data
 * and subsequently draw the chart. The UI functions are triggered, if the corresponding
 * html element is clicked or it´s value changes (see file app.js).
 */

// ##########################################################################
// CONSTANTS
// ##########################################################################

// Extent of geographic coordinates (in lat/lng)
var LAT_EXTENT = 90;
var LNG_EXTENT = 180;

// ##########################################################################
// MAIN OBJECT -> containing all configuration and modules !!!
// ##########################################################################

var main = {};

// ============================================================================
// Init main configurations
// ============================================================================

main.configs = {
  mapContainer: "map",
  startPos: [50, 10], // initial map center [lat, lng]
  startZoom: 2 };

// ============================================================================
// Init main modules
// ============================================================================

main.modules = {};

// --------------------------------------------------------------------------
// Controller
// --------------------------------------------------------------------------

main.modules.locationController = new LocationController(main),

// --------------------------------------------------------------------------
// View
// --------------------------------------------------------------------------

main.modules.map = new Map(main);

///////////////////////////////////////////////////////////////////////////////

// RUN_LOCALLY =
// {
//   'thredds':          false,
//   'gazetteer':        false,
//   'weatherstations':  true
// }
//
// // port on which tomcat8 runs on the localhost and / or on the server
// TOMCAT_PORT = 8080
//
// URL =
// {
//   'local':      window.location.protocol + "//" + window.location.host + ":" + TOMCAT_PORT,
//   'server':     "https://climatecharts.net"
// }
//
// APP_LOCATION =
// {
//   'thredds':          "/thredds",
//   'gazetteer':        "/gazetteer/api",
//   'weatherstations':  "/weatherstations-api",
// }
//
// ENDPOINTS =
// {
//   'thredds':          (RUN_LOCALLY.thredds          ? URL.local : URL.server) + APP_LOCATION.thredds,
//   'gazetteer':        (RUN_LOCALLY.gazetteer        ? URL.local : URL.server) + APP_LOCATION.gazetteer,
//   'weatherstations':  (RUN_LOCALLY.weatherstations  ? URL.local : URL.server) + APP_LOCATION.weatherstations,
// }
//
// MONTHS_IN_YEAR =
// [
//   "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
// ]

// Map.construct();
// UI.listDatasets();
//
// // initially hide plot-wrapper
// $('#plot-wrapper').css('visibility', 'hidden');
//
// $('.form-group').trigger("reset");
// $("#datasets").change(UI.getMetadata);
// $("#lat").change(UI.createChart);
// $("#lng").change(UI.createChart);
// $("#period-checkbox").change(UI.resetSliderHandles);
// $("#set-diagram-title").click(UI.setDiagramTitle);
// $(".tab-links a").click(UI.selectTab);
// $(window).resize(function()
//   {
//     UI.setSliderLabels();
//     UI.activatePanning();
//   }
// );
//
// UI.initStuff();