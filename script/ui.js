/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann and Marcus Kossatz
 *
 * This file contains the user interface object for the website. The variables defined at
 * the beginning are necessary to query the server for temperature and precipitation data
 * and subsequently draw the chart. The UI functions are triggered, if the corresponding
 * html element is clicked or it´s value changes (see file app.js).
 */

// constant configs
COORD_PRECISION = 4     // precision of lat/lng coordinates shown
LAT_EXTENT      = 90    // min/max value for latitude
LNG_EXTENT      = 180   // min/max value for longitude

RASTER_CELL_STYLE =     // style options of the raster cell the climate data is from
{
  color:        '#000099',  // background color
  stroke_width:  2          // width [px] of the outline / stroke around the rectangle
}

var UI  = {

	// Query parameter for the data request.
	"lat":   null,
	"lng":   null,
	"start": 0,
	"end":   0,

	// Properties for the current climatechart.
	"title": "",
	"data":  [],
	"srtm":  0,

	// Name of the currently selected datasets.
	"dataset": "",

	// THREDDS catalog and ncML of the currently selected datasets in JSON format.
	"catalog": {},
	"ncML": [],

  // leaflet map
  "map": null,

  // currently active raster cell from which the data originates
  "climateCell": null,

  // did user just click the default-period checkbox?
  // store the dates before the period change
  // only reload the diagram if period has really changed!
  "periodChange": null,

	// Initialize the leaflet map object with two baselayers and a scale.
	"createMap": function(){

		var marker = new L.marker();

		UI.map = new L.map("map");
		UI.map.setView([40,10], 2);
		UI.map.on("click", updatePosition);

		var ESRI = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 20,
			attribution: 'Tiles &copy; ESRI'
    }).addTo(UI.map);

		var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			});

		var baseMaps = {
				"ESRI World Map": ESRI,
				"OpenStreetMap": OpenStreetMap_Mapnik
		}

		L.control.layers(baseMaps).addTo(UI.map);
		L.control.scale().addTo(UI.map);

		// Update coordinate variables if the user clicked on the map.
		function updatePosition (e){

        // original value from the map
        // -> where the user clicked and the marker will be placed
        var latOrig = e.latlng.lat;
        var lngOrig = e.latlng.lng;

        // real value stripped to the extend of the geographic coordinate system
        var latReal = latOrig;
        while (latReal < -LAT_EXTENT)
        {
          latReal += LAT_EXTENT*2;
        }
        while (latReal > LAT_EXTENT)
        {
          latReal -= LAT_EXTENT*2;
        }

        var lngReal = lngOrig;
        while (lngReal < -LNG_EXTENT)
        {
          lngReal += LNG_EXTENT*2;
        }
        while (lngReal > LNG_EXTENT)
        {
          lngReal -= LNG_EXTENT*2;
        }

        // visualized value shown in the information box on the right
        var factor = Math.pow(10, COORD_PRECISION);
				var latViz = (Math.round(latReal*factor)/factor);
				var lngViz = (Math.round(lngReal*factor)/factor);

				$("#lat").val(latViz.toString());
				$("#lng").val(lngViz.toString());

        // set marker to the original position
				marker.setLatLng([latOrig, lngOrig]).addTo(UI.map);

        // visualize the current raster cell the climate data is from
        UI.showClimateCell(latReal, lngReal);

				// create chart immediately
				UI.createChart();
			};

		// Update coordinate variables if the user typed in coordinate values
		// manually.
		$(".coordinates").change(function () {

      // original lat/lng values that user typed into the box
      var latTyped = parseFloat($("#lat").val());
      var lngTyped = parseFloat($("#lng").val());

      // stop if one of the values is not given
      if (isNaN(latTyped) || isNaN(lngTyped))
      {
        return null;
      }

      // strip to extend of geographic coordinate system
      var latReal = latTyped;
      while (latReal < -LAT_EXTENT)
      {
        latReal += LAT_EXTENT*2;
      }
      while (latReal > LAT_EXTENT)
      {
        latReal -= LAT_EXTENT*2;
      }

      var lngReal = lngTyped;
      while (lngReal < -LNG_EXTENT)
      {
        lngReal += LNG_EXTENT*2;
      }
      while (lngReal > LNG_EXTENT)
      {
        lngReal -= LNG_EXTENT*2;
      }

      // hack "event" object to hand it into updatePosition function
      // act as if user clicked on the map
      var e = {latlng: {lat: latReal, lng: lngReal} };
      updatePosition(e);
		});

    // update chart if user chose to use a different title for the diagrams
    $('#user-title').change(UI.setDiagramTitle);
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
	"createChart": function ()
  {
			// Pick the current values of time slider and position.
			UI.start = $("#slider").slider("values", 0);
			UI.end = $("#slider").slider("values", 1);
			UI.lat = $("#lat").val();
			UI.lng = $("#lng").val();

      // stop if one of the values is not given
      if (isNaN(parseFloat(UI.lat)) || isNaN(parseFloat(UI.lng)))
      {
        return null;
      }

			UI.dataset = $("#datasets").val();

      // activate plot wrapper
      $('#plot-wrapper').css('visibility', 'visible');

      // set loader divs
      var chartLoader = document.createElement('div');
      chartLoader.className = 'loader';
      document.getElementById('climate-chart-wrapper').appendChild(chartLoader);

      var plotLoader = document.createElement('div');
      plotLoader.className = 'loader';
      document.getElementById('plot-wrapper').appendChild(plotLoader);

      var loaders = $('.loader')
      loaders.waitMe({
        effect: 'progressBar',
        text:   'Loading! Please Wait...',
        bg:     '',
        color:  'gray',
        sizeW:  '',
        sizeH:  '',
        source: '',
        onClose: function() {}
      });

			loaders.css("visibility", "visible");
			$("#info").fadeTo("slow", 0.0);
			$("#climate-chart").fadeTo("slow", 0.3);
			$("#plots-container").fadeTo("slow", 0.3);
			$(".nodata").css("opacity", 0.4);

			// Draw the chart when all four ajax calls have received a response.
			$.when(getData(0), getData(1), getName(), getElevation())
			 	.done(
          function(a1, a2, a3, a4)
          {
            // Convert xml response to JSON.
            var x2js = new X2JS();
            var rawDataTemp = x2js.xml2json(a1[0]).grid;
            var rawDataPrec = x2js.xml2json(a2[0]).grid;

            var geoname = a3[0];
            var elevation = a4[0].srtm3;

            UI.visualizeClimate(rawDataTemp, rawDataPrec, geoname, elevation)
          }
        );

			//Query NetCdf data for a single dataset from the TDS server.
			function getData(Index)
      {
				var url = "";
				var variable = "";

				for (var key in UI.catalog.dataset)
        {
          if (UI.catalog.dataset[key]._name == UI.dataset)
          {
            // Detect the climate variable in the netcdf dataset by using the
            // dimensions as an indicator.
            for (var name in UI.ncML[Index].variable)
              if (UI.ncML[Index].variable[name]._shape == "time lat lon")
                variable = UI.ncML[Index].variable[name]._name;

            url += ""
                + ENDPOINTS.thredds
                + "/ncss/"
                + UI.catalog.dataset[key].dataset[Index]._urlPath
                + "?var=" +variable
                + "&latitude=" +  UI.lat
                + "&longitude=" + UI.lng
                + "&time_start=" +UI.start +  "-01-01T00:00:00Z"
                + "&time_end=" +  UI.end +    "-12-30T00:00:00Z";
          }
				}

				return $.get(url)
  				.fail(function(jqXHR, textStatus, errorThrown)
            {
  						alert("Error occured: " +errorThrown);
  					}
          );
			};

      // Query geonames.org gazetteer for placename.
      function getName()
      {
        var url = ""
          + ENDPOINTS.gazetteer
          + "/getName"
        return $.get(url,
          {
            lat: UI.lat,
            lng: UI.lng
          })
          .fail(function(jqXHR, textStatus, errorThrown)
            {
              $(".loader").css("visibility", "hidden");
              $("#climate-chart").empty();
              $("#climate-chart-wrapper").append("<div class='nodata'></div>");
              $("#plots-svg-container").empty();
              $("#plot-wrapper").append("<div class='nodata'></div>");
              $(".nodata").text("External Service not responding: " +errorThrown);
              $(".nodata").fadeTo("slow", 1);
            }
          );
      };

      //Query geonames.org gazetteer for srtm elevation.
      function getElevation()
      {
        var url = ""
          + ENDPOINTS.gazetteer
          + "/getElevation"
        return $.get(url,
            {
              lat: UI.lat,
              lng: UI.lng
            })
            .fail(function(jqXHR, textStatus, errorThrown){
              $(".loader").css("visibility", "hidden");
              $("#climate-chart").empty();
              $("#climate-chart-wrapper").append("<div class='nodata'></div>");
              $("#plots-svg-container").empty()
              $("#plot-wrapper").append("<div class='nodata'></div>");
              $(".nodata").text("External Service not responding: " +errorThrown);
              $(".nodata").fadeTo("slow", 1);
            });
      };
	},

  // visualize the climate using climate chart and boxplots

  "visualizeClimate": function(rawDataTemp, rawDataPrec, geoname, elevation)
  {
 		// Get actual grid cell (from a1)
 		// document: a1[0]

		UI.data = [
      {month: "Jan"},
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
      {month: "Dec"}
    ];

		var place = "";
    var admin = "";
    var country = "";
    var name = "";
    var elevation = "";

    var dataTemp = calculateMeans(rawDataTemp);
    var dataPrec = calculateMeans(rawDataPrec);

		// If temperature values are in Kelvin units, convert them to Celsius.
		for (var key in dataTemp)
			if (dataTemp[key] >= 200)
				dataTemp[key] = dataTemp[key] - 273.15;

		// Workaround for the precipitation dataset created by Uni Delaware.
    // Convert values from cm to mm.
		if (UI.dataset === "University of Delaware Air Temperature and Precipitation v4.01")
			for (var key in dataPrec)
				dataPrec[key] = dataPrec[key]*10;

		for (var i = 0; i < UI.data.length; i++)
    {
			UI.data[i].tmp = dataTemp[i];
			UI.data[i].pre = dataPrec[i];
		}

		// Only continue if there are realistic data values for this
		// place and time, otherwise show an error message.
		if ( Math.max.apply(null, dataTemp) <   100
			&& Math.min.apply(null, dataTemp) >  -100
			&& Math.max.apply(null, dataPrec) <   10000
			&& Math.min.apply(null, dataPrec) >=  0)
    {
			// Create the name string from gazetteer values or user input.
      var title = "";

			if (typeof geoname !== 'undefined')
      {
				if (geoname.name !== "" && typeof geoname.name !== "undefined")
					place = geoname.name +", ";

				if (geoname.adminName1 !== "" && typeof geoname.adminName1 !== "undefined")
					admin = geoname.adminName1 +", ";

				if (geoname.countryName !== "" && typeof geoname.countryName !== "undefined")
					country = geoname.countryName + ", ";

        title = place + admin + country;
			}

			// truncate the last ", "
			if (title.substring(title.length-2, title.length) == ', ')
				title = title.substring(0, title.length-2);

	  	UI.title = title;
	  	UI.srtm = elevation;

      // put name in diagram title box
      $('#user-title').val(title);

			$(".loader").css("visibility", "hidden");
			$(".nodata").empty();
			$("#climate-chart-wrapper").empty();
			$("#plot-wrapper").empty();

			// Finally draw the chart.
			drawChart(UI.data, title, elevation);

			$(".loader").css("visibility", "hidden");
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
		 	 * |-> plots-container   // main svg canvas, contains plots, will be printed
		 	 * |-> plot-options			 // buttons for changing / saving plots, will not be printed
		 	 * |   |-> plot-scale-switch   // optimal <-> fixed scale
		 	 * |   |-> plot-save-buttons   // save as svg and png
       * |-> .loader
		 	 */

		 	// level 0
			var plotWrapper = document.getElementById('plot-wrapper');

			// level 1 - main container
			var plotsContainer = document.createElement('div');
			plotsContainer.id = 'plots-container';
			plotWrapper.appendChild(plotsContainer);

			// level 1 - options
      var plotOptions = document.createElement('div');
      plotOptions.id = 'plot-options';
      plotWrapper.appendChild(plotOptions);

      // level 2 - switch
      var plotSwitch = document.createElement('div');
			plotSwitch.id = 'plot-scale-switch'
			plotOptions.appendChild(plotSwitch);

			// level 3 - inside the switch
      // label      '.switch-light switch-candy'
      // |-> input  'plot-switch-input' (!!! <input> tag does not have children!)
      // |-> div    'plot-switch-title'
      // |-> span   'plot-switch-options'
      //     |-> span 'plot-switch-option-l'
      //     |-> span 'plot-switch-option-r'
      //     |-> a    'plot-switch-button'
      var switchLabel = document.createElement('label');
      switchLabel.className += 'switch-light switch-candy ';
      switchLabel.setAttribute('onclick', ' ');
      plotSwitch.appendChild(switchLabel);

      var switchInput = document.createElement('input');
      switchInput.id = 'plot-switch-input';
      switchInput.setAttribute('type', 'checkbox');
      switchLabel.appendChild(switchInput);

      var switchTitle = document.createElement('div');
      switchTitle.id = 'plot-switch-title';
      switchLabel.appendChild(switchTitle);

      var switchOptions = document.createElement('span');
      switchOptions.id = 'plot-switch-options';
      switchLabel.appendChild(switchOptions);

      var switchOptionL = document.createElement('span');
      switchOptionL.id = 'plot-switch-option-l';
      switchOptionL.className += 'plot-switch-option ';
      switchOptions.appendChild(switchOptionL);

      var switchOptionR = document.createElement('span');
      switchOptionR.id = 'plot-switch-option-r';
      switchOptionR.className += 'plot-switch-option ';
      switchOptions.appendChild(switchOptionR);

      var switchButton = document.createElement('a');
      switchButton.id = 'plot-switch-button';
      switchOptions.appendChild(switchButton);


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
			var numElems = rawDataTemp.point.length;
			for (var i = 0; i < numElems; i++)
			{
				// 1) Temperature

				// get actual data object (safe, instead of for .. in loop)
				dataObj = rawDataTemp.point[i].data;

				// get month time stamp of the current data object
				date = new Date(dataObj[0].__text);
				month = date.getMonth();

				// get actual temperature value
				tmp = parseFloat(dataObj[3].__text);

				// if temperature values are in Kelvin, convert them to Celsius.
				if (tmp >= 200)
					tmp -= 273.15;

				// put temperature data point in the correct Array
				// month in JS Date object: month number - 1 (Jan = 0, Feb = 1, ... , Dec = 11)
				// => getMonth() value can be used directly as Array index
				climateData.temperature[month].push(tmp);

				// 2) Precipitation
				// TODO: make nicer ;)

				dataObj = rawDataPrec.point[i].data;
				date = new Date(dataObj[0].__text);
				month = date.getMonth();
				pre = parseFloat(dataObj[3].__text);

				// workaround for the precipitation dataset created by University of Delaware
				// -> Values are converted from cm to mm.
				if (UI.dataset === "University of Delaware Air Temperature and Precipitation v4.01")
					pre *= 10;

				climateData.precipitation[month].push(pre);
			}

			drawPlots(climateData, title, elevation);

    } else {
    	// Show error message if there is no data available.
    	$(".loader").css("visibility", "hidden");
    	$("#climate-chart").empty();
    	$("#climate-chart-wrapper").append("<div class='nodata'></div>");
      $("#plots-svg-container").empty()
    	$("#plot-wrapper").append("<div class='nodata'></div>");
    	$(".nodata").text("No data available for this area!");
    	$(".nodata").fadeTo("slow", 1);
    }

    //Calculate the average values for each month of the input data array.
    function calculateMeans(dataIn)
    {
      var avg = [];

      for (var j = 0; j < 12; j++)
      {
        var sum = 0;
        var len = dataIn.point.length;
        for (var i = 0 + j; i < len; i += 12)
        {
          sum += Number(dataIn.point[i].data[3].__text);
        }
        avg[j] = sum/(dataIn.point.length/12);
      }

      return avg;
    }
  },

	// List all the datasets available on the server-side.
	"listDatasets": function ()
  {
		var catalogUrl = ""
      + ENDPOINTS.thredds
		  + "/catalog.xml";

		$ .get(catalogUrl)
			.done(function (data)
      {
				var x2js = new X2JS();

				UI.catalog = x2js.xml2json(data).catalog;

				//List all datasets contained in the catalog.
				for (var key in UI.catalog.dataset)
        {
					$("#datasets").append("<option "
									+"id='" +UI.catalog.dataset[key]._ID
									+"' value='" +UI.catalog.dataset[key]._name +"'>"
									+UI.catalog.dataset[key]._name +"</option>");
				}

				// Set the first pair of datasets in the catalogue as default.
				UI.dataset = $("#datasets").val();

				$.each(UI.catalog.dataset, function (index, value)
        {
					$("#source").append("<p> <b>" +UI.catalog.dataset[index]._name +": </b> <br>"
											+UI.catalog.dataset[index].documentation[0].__text +", <br>"
											+UI.catalog.dataset[index].documentation[1].__text
											+"</p>")
				})

				UI.getMetadata();

			})
			.fail(function(jqXHR, textStatus, errorThrown)
      {
				console.error("Error occured: " +errorThrown);
      });
	},

	//Initialize slider to set the time frame.
	"setTimeFrame": function (min, max){

	    $("#slider").slider(
        {
	        range: true,
	        min: min,
	        max: max,
	        values: [max - 30, max],
	        slide: function(event, ui)
            {
        	    var checked = $("#period-checkbox").is(":checked");
        	    if (checked === true)
              {
                var delay = function()
                {
                  UI.setSliderLabels();
                };
              }
	        	  else
              {
                var delay = function()
                {
                  $("#slider").slider("values", 0, $("#slider").slider("values", 1) - 30);
                  UI.setSliderLabels();
	              };
	        	  }

              // Wait for the ui.handle to set its position
  	          setTimeout(delay, 10);
	          },
          change: function(event, ui)
            {
              // has the user clicked the periodChanged button?
              if (UI.periodChange != null)
              {
                // if so, have the dates changed?
                oldLeft = UI.periodChange.oldLeft;
                oldRight = UI.periodChange.oldRight;
                newLeft = $('#slider').slider("values", 0);
                newRight = $('#slider').slider("values", 1);
                if ((oldLeft != newLeft) | (oldRight != newRight))
                {
                  UI.createChart();

                  // prevent bug of loading it twice: manually set the stored old values
                  UI.periodChange.oldLeft = newLeft;
                  UI.periodChange.oldRight = newRight;
                }
              }
              // if not, the dates must have changed
              // => reload!
              else
              {
                UI.createChart();
              }
            }
	      }
      );

	    //Set default values on page load.
      UI.setSliderLabels();

      $(".ui-slider-horizontal").css(
        {
          "height": "10px"
        }
      );
      $(".ui-slider .ui-slider-handle").css(
        {
          "height": "18px",
          "width": "18px",
          "margin-top": "-1px",
          "border-radius": "10px",
          "background": "white",
          "color": "black"
        }
      );
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

	// Use ncML service from TDS to get the metadata for the currently selected
	// dataset.
	"getMetadata": function () {

		$.each(UI.catalog.dataset, function(i, v) {
		    if (v._name == $("#datasets").val()) {

		    	var urlTmp = ""
            + ENDPOINTS.thredds
		    		+ "/ncml/"
            + v.dataset[0]._urlPath;
		    	var urlPre = ""
            + ENDPOINTS.thredds
		    		+ "/ncml/"
            + v.dataset[1]._urlPath;

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


						if ($("#slider").is(":empty"))
            {
							UI.setTimeFrame(parseInt(v.timeCoverage.start),
									parseInt(v.timeCoverage.end));
						}
						else
            {
							UI.updateSlider(parseInt(v.timeCoverage.start),
									parseInt(v.timeCoverage.end));
						}

            // finally create the chart
            UI.createChart();
				 });
		    }
		});
	},

	// Enable/disable text input field if the user wants to type in an
	// individual title for the chart or use a gazetteer.
	"setDiagramTitle": function ()
  {
    UI.title = $('#user-title').val();

    // reset titles
    $('#climate-chart-title').text(UI.title);
    $('#climate-plots-title').text(UI.title);
	},

	//Reset handles of time slider if a fixed time range is activated.
	"resetSliderHandles": function ()
  {
    UI.periodChange =
    {
      oldLeft:  $("#slider").slider("values", 0),
      oldRight: $("#slider").slider("values", 1)
    };

		$("#slider").slider("values", [
      $("#slider").slider("values", 1) - 30,
      $("#slider").slider("values", 1)
    ]);

    UI.setSliderLabels();

    UI.periodChange = null;
	},

	// Reset position of svg if it is not centered due to panning/zooming.
	"resetSVG": function () {
		$("#climate-chart").panzoom("reset");
	},

	"activatePanning": function ()
  {
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
		else
    {
			// Disable panning if screensize is large enough.
			if ($('#reset').length && $("#panzoomText").length)
      {
				UI.resetSVG();
				$("#climate-chart").panzoom("destroy");
				$('#reset').remove();
				$("#panzoomText").remove();
			}
		}
	},

	// Switch between "Home" and "About" tab.
	"selectTab": function (e)
  {
        var currentAttrValue = $(this).attr('href');
        $('.tabs ' + currentAttrValue).show().siblings().hide();
        $(this).parent('li').addClass('active').siblings().removeClass('active');
        e.preventDefault();
	},

  // Show the raster cell of the current climate data on the map
  // and make obvious that the climate data is for that cell, not for this point
  "showClimateCell": function(latReal, lngReal)
  {
    // clear current raster cell
    if (UI.climateCell)
    {
      UI.map.removeLayer(UI.climateCell);
      UI.climateCell = null;
    }

    // get resolution of current dataset
    var latResolution = parseFloat(UI.ncML[0].group[0].attribute[6]._value);
    var lngResolution = parseFloat(UI.ncML[0].group[0].attribute[7]._value);

    // determine the cell the current point is in
    var minLat = Math.floor(latReal/latResolution)*latResolution;
    var minLng = Math.floor(lngReal/lngResolution)*lngResolution;
    var maxLat = minLat + latResolution;
    var maxLng = minLng + lngResolution;

    // create a raster cell as rectangle
    var rectBounds = [[minLat, minLng], [maxLat, maxLng]];
    var rectStyle =
    {
      color:  RASTER_CELL_STYLE.color,
      weight: RASTER_CELL_STYLE.stroke_width,
    }
    UI.climateCell = L.rectangle(rectBounds, rectStyle)
    UI.climateCell.addTo(UI.map);

    // Idea: The user should always see the full extent of the climate cell
    // => determine if the bounds of the cell are fully visible in the viewport
    var mapBounds = UI.map.getBounds();
    var cellBounds = UI.climateCell.getBounds();

    // Decision tree
    // If the climate cell is completely in the viewport
    // i.e. no bound of the cell is visible
    // => zoom out to fit the bounds
    if (cellBounds.contains(mapBounds))
    {
      UI.map.fitBounds(cellBounds);
    }
    // If not, check if the cell is partially covered by the map
    // i.e. the map does not contain the full extent of the cell
    // => move the map so the cell is completely visible
    else if (!mapBounds.contains(cellBounds))
    {
      UI.map.fitBounds(cellBounds);
    }
    // otherwise the cell is completely visible, so there is nothing to do
  }
}
