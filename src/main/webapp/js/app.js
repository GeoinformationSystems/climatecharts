/* 
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 * 
 * This file is loaded at the end of the document and only contains the initialization of the map object and the 
 * select input fields, as well as button listeners for every element the user can interact with. 
 */

ui.createMap();
ui.listDatasets();
//ui.setTimeRange();

$('.form-group').trigger("reset");
$("#datasets").change(ui.setDataset);
$("#info").popover({
	html: true
});
$("#lt").change(ui.changeButtonStatus);
$("#ln").change(ui.changeButtonStatus);
$(".name").click(ui.changeNameInputStatus);
$("#createChart").click(ui.createChart);
$("#saveSvg").click(ui.saveSvg);
$('#savePng').click(ui.savePng);
$(".tab-links a").click(ui.selectTab);