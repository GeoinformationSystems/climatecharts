/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 *
 * This file is loaded at the end of the document and only contains the initialization of the
 * map object and the select input fields, as well as button listeners for every element the
 * user can interact with.
 */

// for localhost development
ENDPOINTS =
{
  'thredds':  "https://climatecharts.net/thredds",
  'gazetteer': "https://climatecharts.net/api/gazetteer"
}

// for deployment
// ENDPOINTS =
// {
//   'thredds':  window.location.protocol +"//" +window.location.host + "/thredds",
//   'gazeteer': window.location.protocol +"//" +window.location.host + "/api/gazetteer"
// }

UI.createMap();
UI.listDatasets();

// initially hide plot-wrapper
$('#plot-wrapper').css('visibility', 'hidden');

$('.form-group').trigger("reset");
$("#datasets").change(UI.setDataset);
$("#lat").change(UI.createChart);
$("#lng").change(UI.createChart);
$("#checkbox").change(UI.resetSliderHandles);
$(".name").click(UI.changeNameInputStatus);
$(".tab-links a").click(UI.selectTab);
$(window).resize(function(){
    UI.setSliderLabels();
    UI.activatePanning();
});
