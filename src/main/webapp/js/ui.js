/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 *
 * This file contains the user interface object for the website. The variables defined at
 * the beginning are necessary to query the server for temperature and precipitation data
 * and subsequently draw the chart. The UI functions are triggered, if the corresponding
 * html element is clicked or it´s value changes (see file app.js).
 */

var UI  = {

	// Query parameter for the data request.
	"lt": null,
	"ln": null,
	"start": 0,
	"end": 0,

	// Properties for the current climatechart.
	"name": "",
	"data": [],
	"srtm": 0,

	// Name of the currently selected datasets.
	"dataset": "",

	// THREDDS catalog and ncML of the currently selected datasets in JSON format.
	"catalog": {},
	"ncML": [],

	// Initialize the leaflet map object with two baselayers and a scale.
	"createMap": function(){

		var marker = new L.marker();

		var map = new L.map("map");
		map.setView([40,10], 2);
		map.on("click", updatePosition);

		var ESRI = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 20,
			attribution: 'Tiles &copy; ESRI'
			}).addTo(map);

		var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			});

		var baseMaps = {
				"ESRI World Map": ESRI,
				"OpenStreetMap": OpenStreetMap_Mapnik
		}

		L.control.layers(baseMaps).addTo(map);
		L.control.scale().addTo(map);

		// Update coordinate variables if the user clicked on the map.
		function updatePosition (e){
				var lat = (Math.round(e.latlng.lat*100)/100).toString(),
					lon = (Math.round(e.latlng.lng*100)/100).toString();

				$("#lt").val(lat);
				$("#ln").val(lon);

				marker.setLatLng([lat, lon]).addTo(map);
				$("#createChart").prop("disabled", false);

				// create chart immediately
				UI.createChart();
			};

		// Update coordinate variables if the user typed in coordinate values
		// manually.
		$(".coordinates").change(function () {
			map.setView([$("#lt").val(), $("#ln").val()], 5);
			marker.setLatLng([$("#lt").val(), $("#ln").val()]).addTo(map);
			$("#createChart").prop("disabled", false);

			// create chart immediately
			UI.createChart();
		});
	},
	
	// Save SVG inline code to a svg file.
	"saveToSvg": function (rootDivId, filename) {
		var rootDiv = $('#'+rootDivId);
		var body = $('body');

		rootDiv.panzoom("reset");

	    try {
	        var isFileSaverSupported = !!new Blob();
	    } catch (e) {
	        alert("This function is not supported by your browser!");
	    }

	    // create new temporary div where the to print is copied in
	    // -> use like a workbench
	    body.append("<div id=\"temp\">");
	    var workbench = $('#temp');
	    workbench.append(rootDiv.clone());

	    var html = workbench.html();

	    var blob = new Blob([html], {type: "image/svg+xml"});
	    saveAs(blob, filename+".svg");

	    workbench.remove();
	},

	// Clone the original svg graphic, upscale and rasterize the clone and
	// finally save it to a png file.
	"saveToPng": function(rootDivId, filename) {
	
		// get root element
		var rootDiv = $('#'+rootDivId);
		var body = $('body');

		rootDiv.panzoom("reset");

		rootDiv.clone()
			   .attr("id", "clone")
			   .appendTo(body);

		body.append("<canvas>");

		/*
		 * Set hardcoded width value for raster graphic and scale height
		 * dynamically by newWidth/originalWidth - factor. The chosen fixed
		 * width is x (scaleFactor) times the size of the original svg object,
		 * insuring that it stays sharp when it is scaled up.
		 */
		var scaleFactor = 2;
		
		var clone = d3.select("#clone"),
			width_png = Math.floor($(rootDiv).width()*scaleFactor),
			height_png = Math.floor($(rootDiv).height()*scaleFactor);

		clone.attr("width", width_png)
		   .attr("height", height_png)
		   .attr("viewbox", "0 0 " + width_png + " " + height_png)
		   .attr("preserveAspectRatio", "xMinYMin meet");
			
		var svg = $("#clone")[0],
			canvas = $("canvas")[0],
			serializer = new XMLSerializer(),
			svgString = serializer.serializeToString(svg);

		canvas.width = width_png;
		canvas.height = height_png;

		canvg(canvas, svgString);

		var dataURL = canvas.toDataURL('image/png'),
			data = atob(dataURL.substring('data:image/png;base64,'.length));

		asArray = new Uint8Array(data.length);

		for (var i = 0; i < data.length; ++i) {
			asArray[i] = data.charCodeAt(i);
		}

		var blob = new Blob([asArray.buffer], {type: 'image/png'});

		saveAs(blob, filename+".png");

		$("#clone").remove();
		$("canvas").remove();
	},

	/*
	 * Query function to get the data for temperature and precipitation for the
	 * corresponding position and time and draw the chart.
	 */
	"createChart": function (){

			//Pick the current values of time slider and position.
			UI.start = $("#slider").slider("values", 0);
			UI.end = $("#slider").slider("values", 1);
			UI.lt = $("#lt").val();
			UI.ln = $("#ln").val();

			UI.dataset = $("#datasets").val();

			$("#loader").css("visibility", "visible");
			$("#info").fadeTo("slow", 0.0);
			$("#climate-chart").fadeTo("slow", 0.3);
			$("#nodata").css("opacity", 0.4);

			// Draw the chart when all four ajax calls have received a response.
			$.when(getData(0), getData(1), getName(), getElevation())
			 	.done(function(a1, a2, a3, a4){

			 		// Get actual grid cell (from a1)
			 		// document: a1[0]

					UI.data = [ {month: "Jan"},
					            {month: "Feb"},
					            {month: "Mar"},
					            {month: "Apr"},
					            {month: "May"},
					            {month: "Jun"},
					            {month: "Jul"},
					            {month: "Aug"},
					            {month: "Sep"},
					            {month: "Oct"},
					            {month: "Nov"},
					            {month: "Dec"}];

					var place = "",
						admin = "",
						country = "",
						name = "",
						height = "";

					//Convert xml response to JSON.
					var x2js = new X2JS(),
						rawDataA1 = x2js.xml2json(a1[0]).grid,
						rawDataA2 = x2js.xml2json(a2[0]).grid;
					var dataTmp = calculateMeans(rawDataA1),
						dataPre = calculateMeans(rawDataA2);

					//If temperature values are in Kelvin units, convert them to Celsius.
					for (var key in dataTmp) {
						if (dataTmp[key] >= 200) {
							dataTmp[key] = dataTmp[key] - 273.15;
						}
					}

					//Workaround for the precipitation dataset created by University of Delaware. Values
					//are converted from cm to mm.
					if (UI.dataset === "University of Delaware Air Temperature and Precipitation v4.01") {
						for (var key in dataPre) {
							dataPre[key] = dataPre[key]*10;
						}
					}

					for (var i = 0; i < UI.data.length; i++) {
						UI.data[i].tmp = dataTmp[i];
						UI.data[i].pre = dataPre[i];
					}

					// Only continue if there are realistic data values for this
					// place and time, otherwise show an error message.
					if (Math.max.apply(null, dataTmp) < 100
						&& Math.min.apply(null, dataTmp) > -100
						&& Math.max.apply(null, dataPre) < 10000
						&& Math.min.apply(null, dataPre) >= 0) {

						// Create the name string from gazetteer values or user input.
						if ($("#name1").is(':checked') === true) {
							if (typeof a3[0].geonames[0] !== 'undefined'){
								if (a3[0].geonames[0].name !== ""){
									place = a3[0].geonames[0].name +", ";
								}
								if (a3[0].geonames[0].adminName1 !== ""){
									admin = a3[0].geonames[0].adminName1 +", ";
								}
								if (a3[0].geonames[0].countryName !== ""){
									country = a3[0].geonames[0].countryName + ", ";
								}
							}
							name = place + admin + country;
						}
						else {
							name = $("#userName").val();

							if (name !== "") {
								name += ", ";
							}
						}

						if (typeof a4 !== 'undefined') {
				    	  	height = a4[0].srtm3;
						}

						// truncate the last ", "
						if (name.substring(name.length-2, name.length) == ', ')
						{
							name = name.substring(0, name.length-2);
						}


			    	  	UI.name = name;
			    	  	UI.srtm = height;

						$("#loader").css("visibility", "hidden");
						$("#nodata").empty();
						$("#climate-chart").remove();
						$("#plot-wrapper").remove();

						// Finally draw the chart.
						drawChart(UI.data, name, height);

						$("#loader").css("visibility", "hidden");
						$("#info").remove();

						UI.activatePanning();

						// add the save buttons
						var saveButtonArea = document.createElement('div');
					 	saveButtonArea.className += "save-button-area ";
					 	saveButtonArea.innerHTML = "" +
					 			"<button id='save-chart-to-svg' class='btn btn-primary save-button'>SVG</button>" +
					 			"<button id='save-chart-to-png' class='btn btn-primary save-button'>PNG</button>";
					 	document.getElementById('climate-chart-wrapper').appendChild(saveButtonArea);

					 	// bind save functionality to button
					 	$('#save-chart-to-svg').click(function()
					 			{
					 				UI.saveToSvg('climate-chart', 'climate-chart');
				 				});
					 	$('#save-chart-to-png').click(function()
					 			{
					 				UI.saveToPng('climate-chart', 'climate-chart');
				 				});

						// CREATE BOXPLOT
						// --------------

						// create structure
					 	/* plot-wrapper
					 	 * |-- plots-container   // main svg canvas, contains plots, will be printed
					 	 * |-- plot-options			 // buttons for changing / saving plots, will not be printed
					 	 *     |-- plot-scale-switch   // optimal <-> fixed scale
					 	 *     |-- plot-save-buttons   // save as svg and png
					 	 */

					 	// level 0
						var parentWrapper = document.getElementById('climate-chart-wrapper').parentNode;
						var plotWrapper = document.createElement('div');
						plotWrapper.id = 'plot-wrapper';
						plotWrapper.className += 'box ';
						parentWrapper.appendChild(plotWrapper);

						// level 1 - main container
						var plotsContainer = document.createElement('div');
						plotsContainer.id = 'plots-container';
						plotWrapper.appendChild(plotsContainer);

						// level 1 - options
			            var plotOptions = document.createElement('div');
			            plotOptions.id = 'plot-options';
			            plotWrapper.appendChild(plotOptions);

			            // level 2 - switch
			            var plotSwitch = document.createElement('label');
						plotSwitch.id = 'plot-scale-switch'
						plotSwitch.className += 'switch ';
						plotOptions.appendChild(plotSwitch);

						// level 3 - inside the switch (ugly, but works)
						plotSwitch.innerHTML += '<input id="plot-scale-input" class="switch-input" type="checkbox" />';
						plotSwitch.innerHTML += '<span id="plot-scale-label" class="switch-label"></span>';
						plotSwitch.innerHTML += '<span class="switch-handle"></span>';

						// level 2 - save buttons
						var saveButtonArea = document.createElement('div');
					 	saveButtonArea.className += "save-button-area ";
					 	saveButtonArea.innerHTML = "" +
				 			"<button id='save-plots-to-svg' class='btn btn-primary save-button'>SVG</button>" +
				 			"<button id='save-plots-to-png' class='btn btn-primary save-button'>PNG</button>";
					 	plotOptions.appendChild(saveButtonArea);

						/* functionality */
					 	/* hacks
					 	 * 1) 	problem: draglayer causes artifacts in the svg
					 	 * 		solution: disable before saving
					 	 * 2) 	problem: 'text-anchor: begin' does not work in the external library
					 	 * 		for creating the png (text is always centered)
					 	 * 		manual setting of x-position does not work properly cross-browser
					 	 * 		solution: manually set the x-position only for saving purpose
					 	 */
					 	
					 	$('#save-plots-to-svg').click(function()
			 			{
					 		$('.draglayer').hide();
				 			UI.saveToSvg('plots-svg-container', 'climate-plots');
				 			$('.draglayer').show();
		 				});
					 	$('#save-plots-to-png').click(function()
			 			{
					 		var dataSourceDiv = $('#plots-footer-wrapper').children().first();
					 		var oldX = dataSourceDiv.attr('x');
					 		dataSourceDiv.attr('x', dataSourceDiv.width()/2);
					 		$('.draglayer').hide();
			 				UI.saveToPng('plots-svg-container', 'climate-plots');
			 				dataSourceDiv.attr('x', oldX);
			 				$('.draglayer').show();
		 				});

						// create data structure for temperature / precipitation: [[Jan],[Feb],...,[Dec]]
						var climateData =
						{
							temperature: 	[],
							precipitation:	[]
						}

						for (var i = 0; i < 12; i++)
						{
							climateData.temperature[i] = 	[];
							climateData.precipitation[i] = 	[];
						}
						
						// sort temperature and precipitation data by month
						// -> all data for one Month in one Array
						var numElems = rawDataA1.point.length;
						for (var i = 0; i < numElems; i++)
						{
							// 1) Temperature

							// get actual data object (safe, instead of for .. in loop)
							dataObj = rawDataA1.point[i].data;

							// get month time stamp of the current data object
							date = new Date(dataObj[0].__text);
							month = date.getMonth();

							// get actual temperature value
							tmp = parseFloat(dataObj[3].__text);
							
							// if temperature values are in Kelvin, convert them to Celsius.
							if (tmp >= 200) {
								tmp -= 273.15;
							}

							// put temperature data point in the correct Array
							// month in JS Date object: month number - 1 (Jan = 0, Feb = 1, ... , Dec = 11)
							// => getMonth() value can be used directly as Array index
							climateData.temperature[month].push(tmp);


							// 2) Precipitation
							// TODO: make nicer ;)

							dataObj = rawDataA2.point[i].data;
							date = new Date(dataObj[0].__text);
							month = date.getMonth();
							pre = parseFloat(dataObj[3].__text);
							
							// workaround for the precipitation dataset created by University of Delaware
							// -> Values are converted from cm to mm.
							if (UI.dataset === "University of Delaware Air Temperature and Precipitation v4.01") {
								pre *= 10;
							}
						
							climateData.precipitation[month].push(pre);
						}

						drawPlots(climateData, name, height);

					} else {
						// Show error message if there is no data available.
						$("#loader").css("visibility", "hidden");
						$("#climate-chart").empty();
						$("#climate-chart-wrapper").append("<h3 id='nodata'>");
						$("#nodata").text("No data available for this area!");
						$("#nodata").fadeTo("slow", 1);
					}
			 });

			//Query NetCdf data for a single dataset from the TDS server.
			function getData(Index){
				var url = "".
					variable = "";

				for (var key in UI.catalog.dataset) {

					 if (UI.catalog.dataset[key]._name == UI.dataset) {

						 //Detect the climate variable in the netcdf dataset by using the dimensions as an
						 //indicator.
						 for (var name in UI.ncML[Index].variable) {

							 if (UI.ncML[Index].variable[name]._shape == "time lat lon") {

								 variable = UI.ncML[Index].variable[name]._name;
							 }
						 }

						 url += window.location.protocol +"//" +window.location.host +"/thredds/ncss/"
						 	+UI.catalog.dataset[key].dataset[Index]._urlPath
						 	+"?var=" +variable
						 	+"&latitude=" +UI.lt
						 	+"&longitude=" +UI.ln
						 	+"&time_start=" +UI.start +"-01-01T00:00:00Z"
						 	+"&time_end=" +UI.end +"-12-30T00:00:00Z";
					 }
				}


				return $.get(url)
						.fail(function(jqXHR, textStatus, errorThrown){
							alert("Error occured: " +errorThrown);
						});
			};

			//Query geonames.org gazetteer for placename.
			function getName (){
				if ($("#name1").is(':checked') === true){
					return $.get("/climatecharts/api/gazetteer/findNearbyPlaceNameJSON",
							{lat: UI.lt, lng: UI.ln})
							.fail(function(jqXHR, textStatus, errorThrown){
								$("#loader").css("visibility", "hidden");
								$("#climate-chart").empty();
								$("#climate-chart-wrapper").append("<h3 id='nodata'>");
								$("#nodata").text("External Service not responding: " +errorThrown);
								$("#nodata").fadeTo("slow", 1);
							});
					}
			};

			//Query geonames.org gazetteer for srtm elevation.
			function getElevation (){
				return $.get("/climatecharts/api/gazetteer/srtm3JSON",
						{lat: UI.lt, lng: UI.ln})
						.fail(function(jqXHR, textStatus, errorThrown){
							$("#loader").css("visibility", "hidden");
							$("#climate-chart").empty();
							$("#climate-chart-wrapper").append("<h3 id='nodata'>");
							$("#nodata").text("External Service not responding: " +errorThrown);
							$("#nodata").fadeTo("slow", 1);
						});
			};

			//Calculate the average values for each month of the input data array.
			function calculateMeans(dataIn) {

				var avg = [];

				for (var j = 0; j < 12; j++) {
					var sum = 0;

					for (var i = 0 + j; i < dataIn.point.length; i += 12) {
						sum += Number(dataIn.point[i].data[3].__text);
					}
					avg[j] = sum/(dataIn.point.length/12);
				}

				return avg;
			}
	},

	 // Run loading Animation from "WaitMe" plugin.
	"initLoader": function initLoader(effect){

		var loader = $('#loader').waitMe({
			effect: effect,
			text: 'Please Wait...',
			bg: '',
			color: 'gray',
			sizeW: '',
			sizeH: '',
			source: '',
			onClose: function() {
			}
		});
	},

	// List all the datasets available on the server-side.
	"listDatasets": function () {

		var catalogUrl = "" +window.location.protocol +"//" +window.location.host
							+"/thredds/catalog.xml";

		$.get(catalogUrl)
			.done(function (data) {
				var x2js = new X2JS();

				UI.catalog = x2js.xml2json(data).catalog;

				//List all datasets contained in the catalog.
				for (var key in UI.catalog.dataset) {
					$("#datasets").append("<option "
									+"id='" +UI.catalog.dataset[key]._ID
									+"' value='" +UI.catalog.dataset[key]._name +"'>"
									+UI.catalog.dataset[key]._name +"</option>");
				}

				// Set the first pair of datasets in the catalogue as default.
				UI.dataset = $("#datasets").val();


				$.each(UI.catalog.dataset, function (index, value) {
					$("#source").append("<p> <b>" +UI.catalog.dataset[index]._name +": </b> <br>"
											+UI.catalog.dataset[index].documentation[0].__text +", <br>"
											+UI.catalog.dataset[index].documentation[1].__text
											+"</p>")
				})

				UI.getMetadata();

//				console.log(UI.catalog);
			})
			.fail(function(jqXHR, textStatus, errorThrown){
				console.log("Error occured: " +errorThrown);
		});
	},

	//Initialize slider to set the time frame.
	"setTimeFrame": function (min, max){

	    $("#slider").slider({
	        range: true,
	        min: min,
	        max: max,
	        values: [max - 30, max],
	        slide: function(event, ui) {

	        	var checked = $("#checkbox").is(":checked");

	        	if (checked === true) {

		            var delay = function() {

		                UI.setSliderLabels();
		            };
	        	}
	        	else {
	        		var delay = function() {
		                $("#slider").slider("values", 0, $("#slider").slider("values", 1) - 30);

		                UI.setSliderLabels();
		            };
	        	}

	            //Wait for the ui.handle to set its position
	            setTimeout(delay, 8);
	        }
	    });

	    //Set default values on page load.
        UI.setSliderLabels();

        $(".ui-slider-horizontal").css({"height": "10px"});

        $(".ui-slider .ui-slider-handle").css({"height": "18px",
        										"width": "18px",
        										"margin-top": "-1px",
        										"border-radius": "10px",
        										"background": "white",
        										"color": "black"
        										});


	},

	//Display the labels for the slider under the slider handles.
	"setSliderLabels": function () {

        $('#min').html($('#slider')
        		.slider('values', 0));

        $('#max').html($('#slider')
        		.slider('values', 1));

        $("#min #max").addClass("unselectable");
	},

	//Set both slider handles to the min/max values.
	"updateSlider": function (min, max) {
		$("#slider").slider("option", "min", min);
		$("#slider").slider("option", "max", max);

        UI.setSliderLabels();
	},

	// If the user selects another dataset fetch the corresponding metadata from
	// the server.
	"setDataset": function () {
		UI.getMetadata();
	},

	// Use ncML service from TDS to get the metadata for the currently selected
	// dataset.
	"getMetadata": function () {

		$.each(UI.catalog.dataset, function(i, v) {
		    if (v._name == $("#datasets").val()) {

		    	var urlTmp = "" +window.location.protocol +"//" +window.location.host
		    			+"/thredds/ncml/" +v.dataset[0]._urlPath,
		    		urlPre = "" +window.location.protocol +"//" +window.location.host
		    			+"/thredds/ncml/" +v.dataset[1]._urlPath;

		    	$.when($.get(urlTmp), $.get(urlPre))
				 	.done(function(a1, a2){

				 		var x2js = new X2JS();
						UI.ncML[0] = x2js.xml2json(a1[0]).netcdf;
						UI.ncML[1] = x2js.xml2json(a2[0]).netcdf;

						var metadata = "Spatial Resolution: "
										+ UI.ncML[0].group[0].attribute[6]._value +"° x "
										+ UI.ncML[0].group[0].attribute[7]._value +"°"+"<br>"
										+ "Temporal Coverage: "
										+ parseInt(v.timeCoverage.start)
										+ " - "
										+ parseInt(v.timeCoverage.end);


						$("#datasetInfo").empty();
						$("#datasetInfo").css("display", "block");
						$("#datasetInfo").html("<b>Data reference:</b><br>"
												+v.documentation[0].__text +", <br> "
												+v.documentation[1].__text  +"<br><br>"
												+metadata);


						if ($("#slider").is(":empty")) {

							UI.setTimeFrame(parseInt(v.timeCoverage.start),
									parseInt(v.timeCoverage.end));

						}
						else {

							UI.updateSlider(parseInt(v.timeCoverage.start),
									parseInt(v.timeCoverage.end));

						}

//						console.log(UI.ncML);
				 });
		    }
		});
	},

	// Enable/disable text input field if the user wants to type in an
	// individual title for the chart or use a gazetteer.
	"changeNameInputStatus": function () {
		var checked = $("#name2").is(":checked");

		if (checked === true){
			$("#userName").prop("disabled", false );
			$("#userName").val("");
		}
		else {
			$("#userName").prop("disabled", true);
			$("#userName").val("");
		}
	},

	// Only enable button for creating the chart if the necessary variables are
	// defined.
	"changeButtonStatus": function () {
		this.lt = $("#lt").val();
		this.ln = $("#ln").val();

		if (this.lt !== null && this.ln !== null){
			$("#createChart").prop("disabled", false);
		}
	},

	//Reset handles of time slider if a fixed time range is activated.
	"resetSliderHandles": function () {
		var checked = $("#name2").is(":checked");

		if (checked === false) {
			$("#slider").slider("values", [$("#slider").slider("values", 1) - 30,
			                               $("#slider").slider("values", 1)]);

	        UI.setSliderLabels();
		}
	},

	// Reset position of svg if it is not centered due to panning/zooming.
	"resetSVG": function () {
		$("#climate-chart").panzoom("reset");
	},

	"activatePanning": function () {

		// If the screenwidth of the chart container is smaller
		// than a minimum width, activate panning.
		if ($("#climate-chart-wrapper").width() < 500) {
			$("#climate-chart").panzoom();

			if ($('#reset').length === 0) {
				var reset = $("<button></button>").attr("id", "reset")
												.attr("class", "btn btn-primary")
												.text("Reset Chart");
				$("#save").prepend(reset);
				$("#save").prepend("<p id=\"panzoomText\">Pan/zoom the chart to change viewing area.");
				$("#reset").click(UI.resetSVG);
			}
		}
		else {

			//Disable panning if screensize is large enough.
			if ($('#reset').length && $("#panzoomText").length) {

				UI.resetSVG();
				$("#climate-chart").panzoom("destroy");
				$('#reset').remove();
				$("#panzoomText").remove();

			}
		}
	},

	// Switch between "Home" and "About" tab.
	"selectTab": function (e) {
        var currentAttrValue = $(this).attr('href');

        $('.tabs ' + currentAttrValue).show().siblings().hide();

        $(this).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();
	}
}
