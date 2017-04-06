/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 *
 * This file is loaded at the end of the document and only contains the initialization of the
 * map object and the select input fields, as well as button listeners for every element the
 * user can interact with.
 */

// RUN_LOCALLY = server-side apps (gazetteer and thredds) development options
//  true:   running on localhost  (tomcat8 -> localhost:10080)
//  false:  running on the server (tomcat8 -> https://climatecharts.net)
RUN_LOCALLY =
{
  'thredds':          false,
  'gazetteer':        false,
  'weatherstations':  true
}

// port on which tomcat8 runs on the localhost and / or on the server
TOMCAT_PORT = 8080

URL =
{
  'local':      window.location.protocol + "//" + window.location.host + ":" + TOMCAT_PORT,
  'server':     "https://climatecharts.net"
}

APP_LOCATION =
{
  'thredds':          "/thredds",
  'gazetteer':        "/gazetteer/api",
  'weatherstations':  "/weatherstations-api",
}

ENDPOINTS =
{
  'thredds':          (RUN_LOCALLY.thredds          ? URL.local : URL.server) + APP_LOCATION.thredds,
  'gazetteer':        (RUN_LOCALLY.gazetteer        ? URL.local : URL.server) + APP_LOCATION.gazetteer,
  'weatherstations':  (RUN_LOCALLY.weatherstations  ? URL.local : URL.server) + APP_LOCATION.weatherstations,
}

MONTHS_IN_YEAR =
[
  "Jan", "Feb", "Mar",
  "Apr", "May", "Jun",
  "Jul", "Aug", "Sep",
  "Oct", "Nov", "Dec"
];


////////////////////////////////////////////////////////////////////////////////


UI.createMap();
UI.listDatasets();
WeatherStations.init();

// initially hide plot-wrapper
$('#plot-wrapper').css('visibility', 'hidden');

$('.form-group').trigger("reset");
$("#datasets").change(UI.getMetadata);
$("#lat").change(UI.createChart);
$("#lng").change(UI.createChart);
$("#period-checkbox").change(UI.resetSliderHandles);
$("#set-diagram-title").click(UI.setDiagramTitle);
$(".tab-links a").click(UI.selectTab);
$(window).resize(function()
  {
    UI.setSliderLabels();
    UI.activatePanning();
  }
);
