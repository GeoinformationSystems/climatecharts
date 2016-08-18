/* 
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 * 
 * This file is loaded at the end of the document and only contains the initialization of the 
 * map object and the select input fields, as well as button listeners for every element the 
 * user can interact with. 
 */

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
$("#saveSvg").click(UI.saveSvg);
$('#savePng').click(UI.savePng);
$(".tab-links a").click(UI.selectTab);
$(window).resize(function(){
    UI.setSliderLabels();
    UI.activatePanning();
});