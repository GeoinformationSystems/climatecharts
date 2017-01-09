/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 *
 * This file is loaded at the end of the document and only contains the initialization of the
 * map object and the select input fields, as well as button listeners for every element the
 * user can interact with.
 */

// for localhost development
THREDDS_ENDPOINT = "https://climatecharts.net/thredds"
GAZETTEER_ENDPOINT = "https://climatecharts.net/api/gazetteer"

// for deployment
// THREDDS_ENDPOINT = window.location.protocol +"//" +window.location.host + "/thredds"
// GAZETTEER_ENDPOINT = window.location.protocol +"//" +window.location.host + "/api/gazetteer"


UI.createMap();
UI.listDatasets();
UI.initLoader("progressBar");

$('.form-group').trigger("reset");
$("#datasets").change(UI.setDataset);
$("#lt").change(UI.changeButtonStatus);
$("#ln").change(UI.changeButtonStatus);
$("#checkbox").change(UI.resetSliderHandles);
$(".name").click(UI.changeNameInputStatus);
$("#createChart").click(UI.createChart);
$(".tab-links a").click(UI.selectTab);
$(window).resize(function(){
    UI.setSliderLabels();
    UI.activatePanning();
});
