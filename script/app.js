/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 *
 * This file is loaded at the end of the document and only contains the initialization of the
 * map object and the select input fields, as well as button listeners for every element the
 * user can interact with.
 */

// deploy option: if you are developping locally (on localhost) => set false
//                else the website is deployed => set true
DEPLOY = false

// for localhost development
ENDPOINTS = {}

if (DEPLOY)
{
  ENDPOINTS.thredds =   window.location.protocol +"//" +window.location.host + "/thredds",
  ENDPOINTS.gazetteer = window.location.protocol +"//" +window.location.host + "/api/gazetteer"
} else {
  ENDPOINTS.thredds =   "https://climatecharts.net/thredds",
  ENDPOINTS.gazetteer = "https://climatecharts.net/api/gazetteer"
}

// for deployment
// ENDPOINTS =
// {
// }

UI.createMap();
UI.listDatasets();

// initially hide plot-wrapper
$('#plot-wrapper').css('visibility', 'hidden');

$('.form-group').trigger("reset");
$("#datasets").change(UI.getMetadata);
$("#lat").change(UI.createChart);
$("#lng").change(UI.createChart);
$("#checkbox").change(UI.resetSliderHandles);
$(".name").click(UI.changeNameInputStatus);
$(".tab-links a").click(UI.selectTab);
$(window).resize(function(){
    UI.setSliderLabels();
    UI.activatePanning();
});
