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

var UI  =
{
	// Query parameter for the data request.
	"lat":   null,
	"lng":   null,
	"start": 0,
	"end":   0,

	// Properties for the current climatechart.
	"title": "",
	"data":  [],
	"elevation":  0,

	// Name of the currently selected datasets.
	"dataset": "",

	// THREDDS catalog and ncML of the currently selected datasets in JSON format.
	"catalog": {},
	"ncML": [],

  // leaflet map
  "map": null,

  // currently active marker on the map
  "marker": null,

  // currently active raster cell or weather station for climate data
  "activeClimateCell": null,
  "activeWeatherStation": null,

  // did user just click the default-period checkbox?
  // store the dates before the period change
  // only reload the diagram if period has really changed!
  "periodChange": null,

	// Initialize the leaflet map object with two baselayers and a scale.
	"createMap": function()
  {
		UI.map = new L.map("map");
		UI.map.setView([40,10], 2);
		UI.map.on("click", updatePosition);

		var ESRI = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 20,
			attribution: 'Tiles &copy; ESRI'
    }).addTo(UI.map);

		var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
  			maxZoom: 19,
  			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}
    );

		var baseMaps =
    {
			"ESRI World Map": ESRI,
			"OpenStreetMap": OpenStreetMap_Mapnik
		}

		L.control.layers(baseMaps).addTo(UI.map);
		L.control.scale().addTo(UI.map);

		// Update coordinate variables if the user clicked on the map.
		function updatePosition (e)
    {
      // original value from the map
      // -> where the user clicked and the marker will be placed
      var latOrig = e.latlng.lat;
      var lngOrig = e.latlng.lng;

      // map can be infinitely panned in x-direction
      // => real value stripped to the extend of geographic coordinate system
      var latReal = latOrig;
      while (latReal < -LAT_EXTENT)
        latReal += LAT_EXTENT*2;
      while (latReal > LAT_EXTENT)
        latReal -= LAT_EXTENT*2;

      var lngReal = lngOrig;
      while (lngReal < -LNG_EXTENT)
        lngReal += LNG_EXTENT*2;
      while (lngReal > LNG_EXTENT)
        lngReal -= LNG_EXTENT*2;

      // set lat/lng coordinates
      UI.setPosition(latReal, lngReal);
      // set marker to original position, because it could be on the "next" map
      UI.setMarker(latOrig, lngOrig);

      // cleanup current raster cell or weather station
      UI.deactivateClimateCell();
      WeatherStations.deactivateStation();

      // visualize the current raster cell the climate data is from
      UI.activateClimateCell(latReal, lngReal);

			// create chart immediately
			UI.createCharts();
		};

		// Update coordinate variables if the user typed in coordinate values
		// manually.
		$(".coordinates").change(function ()
    {
      // original lat/lng values that user typed into the box
      var latTyped = parseFloat($("#lat").val());
      var lngTyped = parseFloat($("#lng").val());

      // stop if one of the values is not given
      if (isNaN(latTyped) || isNaN(lngTyped))
        return null;

      // strip to extend of geographic coordinate system
      var latReal = latTyped;
      while (latReal < -LAT_EXTENT)
        latReal += LAT_EXTENT*2;

      while (latReal > LAT_EXTENT)
        latReal -= LAT_EXTENT*2;

      var lngReal = lngTyped;
      while (lngReal < -LNG_EXTENT)
        lngReal += LNG_EXTENT*2;

      while (lngReal > LNG_EXTENT)
        lngReal -= LNG_EXTENT*2;

      // hack "event" object to hand it into updatePosition function
      // act as if user clicked on the map
      var e = {latlng: {lat: latReal, lng: lngReal} };
      updatePosition(e);
		});

    // update chart if user chose to use a different title for the diagrams
    $('#user-title').change(UI.setDiagramTitle);
	},

  "setPosition": function(lat, lng)
  {
    UI.lat = lat;
    UI.lng = lng;

    // visualized value shown in the information box on the right
    var factor = Math.pow(10, COORD_PRECISION);
    var latViz = (Math.round(lat*factor)/factor);
    var lngViz = (Math.round(lng*factor)/factor);

    $("#lat").val(latViz.toString());
    $("#lng").val(lngViz.toString());
  },

  "setMarker": function(lat, lng)
  {
    // decision: set initially or update?

    if (UI.marker)  // update
      UI.marker.setLatLng([lat, lng]);
    else            // create
    {
      UI.marker = new L.marker();
      UI.marker.setLatLng([lat, lng]).addTo(UI.map);
    }
  },

  "removeMarker": function()
  {
    if (UI.marker)
    {
      UI.map.removeLayer(UI.marker);
      UI.marker = null;
    }
  },

	// Save SVG inline code to a svg file.
	"saveToSvg": function (rootDivId, filename) {
		var rootDiv = $('#'+rootDivId);
		var body = $('body');

		rootDiv.panzoom("reset");

	    try
      {
        var isFileSaverSupported = !!new Blob();
	    }
      catch (e)
      {
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
	"createCharts": function ()
  {
		// Pick the current values of time slider and position.
		UI.start = $("#slider").slider("values", 0);
		UI.end = $("#slider").slider("values", 1);
		UI.lat = $("#lat").val();
		UI.lng = $("#lng").val();

    // stop if one of the values is not given
    if (isNaN(parseFloat(UI.lat)) || isNaN(parseFloat(UI.lng)))
      return null;

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

    // decide if weather station or climate cell data should be loaded
    if (UI.activeClimateCell)
      UI.loadDataForClimateCell();
    else if (UI.activeWeatherStation)
      WeatherStations.loadData();
  },

  "removeCharts": function()
  {
    $('#plot-wrapper').css('visibility', 'hidden');
  },

  "loadDataForClimateCell": function()
  {
			// Draw the chart when all four ajax calls have received a response.
			$.when(getData(0), getData(1), getName(), getElevation())
			 	.done(
          function(a1, a2, a3, a4)
          {
            // Convert xml response to JSON.
            var x2js = new X2JS();
            var origDataTemp = x2js.xml2json(a1[0]).grid;
            var origDataPrec = x2js.xml2json(a2[0]).grid;

            /**
        		 *  data structure:
        		 *  {
        		 *  	numYears:          number of years
        		 *  	prec:					     for each dataset
        		 *  	[                  for each month
        		 *  		{
        		 *  			rawData: []    data for each year
        		 *  			mean:          data mean by month
        		 *  			numGaps:       number of missing years
        		 *  		},
        		 *  		{...}            for each month
        		 *  	],
        		 *  	temp:
        		 *  	[...]              for each dataset
        		 *  }
        		 */
            var climateData =
            {
              numYears: UI.end-UI.start,
              temp: [],
              prec: [],
            }
            for (var monthIdx=0; monthIdx<12; monthIdx++)
            {
              climateData.temp.push(
                {
                  rawData:  [],
                  mean:     null,
                  numGaps:  0,
                }
              );
              climateData.prec.push(
                {
                  rawData:  [],
                  mean:     null,
                  numGaps:  0,
                }
              );

              // init rawData with null (instead of undefined)
              for (var yearIdx=0; yearIdx<climateData.numYears; yearIdx++)
              {
                climateData.temp[monthIdx].rawData[yearIdx] = null
                climateData.prec[monthIdx].rawData[yearIdx] = null
              }
            }

            // convert data into data structure
            for (var ds=0; ds<2; ds++)
            {
              var dataset     = (ds==0) ? origDataTemp : origDataPrec
              var outputData  = (ds==0) ? climateData.temp : climateData.prec
              var len = dataset.point.length
              for (var i=0; i<len; i++)
              {
                var dataPoint = dataset.point[i].data
                var yearIdx = Number(dataPoint[0].__text.substring(0,4))-UI.start
                var monthIdx= Number(dataPoint[0].__text.substring(5,7))-1
                var value   = Number(dataPoint[3].__text)

                // If temperature values are in Kelvin units
                // => convert to Celsius.
                if ((ds == 0) && (value >= 200))
                  value -= 273.15;

                // Workaround for the precipitation dataset created by Uni Delaware.
                // Convert values from cm to mm.
                if ((UI.dataset === "University of Delaware Air Temperature and Precipitation v4.01") && (ds == 1))
                  value *= 10;

                outputData[monthIdx].rawData[yearIdx] = value
              }
            }

            // calculate mean for climate chart
            // and gaps for data quality assessment
        		for (var monthIdx=0; monthIdx<12; monthIdx++)
        		{
        			// for each dataset
        			for (var ds=0; ds<2; ds++)
        			{
        				var dataset = null;
        				if (ds==0)	// temperature
        					dataset = climateData.temp;
        				else		    // precipitation
        					dataset = climateData.prec;


        				// sum up values for each year in this month
        				// count the gaps and values to calculate mean and determine the quality
        				var sum = 0;
        				var numValues = 0;
        				var numGaps = 0;
        				for (var yearIdx=0; yearIdx<climateData.numYears; yearIdx++)
        				{
        					var value = dataset[monthIdx].rawData[yearIdx];
        					if (value == null)
        						numGaps++;
        					else
        					{
        						sum += value;
        						numValues++;
        					}
        				}

        				// write data
        				if (numValues > 0)
        					dataset[monthIdx].mean = sum/numValues;
                dataset[monthIdx].numGaps = numGaps
        			}
        		}

            var geoname = a3[0];
            var elevation = a4[0].srtm3;

            UI.visualizeClimate(climateData, geoname, elevation)
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
                + "&time_start=" +UI.start   + "-01-01T00:00:00Z"
                + "&time_end=" +  (UI.end-1) + "-12-30T00:00:00Z";
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
  "visualizeClimate": function(climateData, geoname, elevation)
  {
 		// Get actual grid cell (from a1)
 		// document: a1[0]

		UI.data = climateData;

		// Only continue if there are realistic data values for this
		// place and time, otherwise show an error message.
		if ( Math.max.apply(null, climateData.temp[0].rawData) <   100
			&& Math.min.apply(null, climateData.temp[0].rawData) >  -100
			&& Math.max.apply(null, climateData.prec[0].rawData) <   10000
			&& Math.min.apply(null, climateData.prec[0].rawData) >=  0)
    {
			// Create the name string from gazetteer values or user input.
      var title = "";
      var place = "";
      var admin = "";
      var country = "";
      var name = "";

      // parse title
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
	  	UI.elevation = elevation;

      // put name in diagram title box
      $('#user-title').val(title);

			$(".loader").css("visibility", "hidden");
			$(".nodata").empty();
			$("#climate-chart-wrapper").empty();
			$("#plot-wrapper").empty();

			// Finally draw the climate chart.
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
  			}
      );
		 	$('#save-chart-to-png').click(function()
 			  {
 				  UI.saveToPng('climate-chart', 'climate-chart');
				}
      );

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
        }
      );
		 	$('#save-plots-to-png').click(function()
   			{
  		 		var dataSourceDiv = $('#plots-footer-wrapper').children().first();
  		 		var oldX = dataSourceDiv.attr('x');
  		 		dataSourceDiv.attr('x', dataSourceDiv.width()/2);
  		 		$('.draglayer').hide();
   				UI.saveToPng('plots-svg-container', 'climate-plots');
   				dataSourceDiv.attr('x', oldX);
   				$('.draglayer').show();
				}
      );

      drawPlots(climateData, title, elevation);
		}
    else
    {
    	// no data available => show error message
    	$(".loader").css("visibility", "hidden");
    	$("#climate-chart").empty();
    	$("#climate-chart-wrapper").append("<div class='nodata'></div>");
      $("#plots-svg-container").empty()
    	$("#plot-wrapper").css('visibility', 'hidden');
    	$(".nodata").text("No data available for this area!");
    	$(".nodata").fadeTo("slow", 1);
    }
  },

	// List all the datasets available on the server-side.
	"listDatasets": function ()
  {
		var catalogUrl = ""
      + ENDPOINTS.thredds
		  + "/catalog.xml";

		$.get(catalogUrl)
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
                  UI.createCharts();

                  // prevent bug of loading it twice: manually set the stored old values
                  UI.periodChange.oldLeft = newLeft;
                  UI.periodChange.oldRight = newRight;
                }
              }
              // if not, the dates must have changed
              // => reload!
              else
              {
                UI.createCharts();
                WeatherStations.updateStations();
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
	"setSliderLabels": function ()
  {
        $('#min').html($('#slider')
        		.slider('values', 0));

        $('#max').html($('#slider')
        		.slider('values', 1));

        $("#min #max").addClass("unselectable");
	},

	//Set both slider handles to the min/max values.
	"updateSlider": function (min, max)
  {
		$("#slider").slider("option", "min", min);
		$("#slider").slider("option", "max", max);
    UI.setSliderLabels();
	},

	// Use ncML service from TDS to get the metadata for the currently selected
	// dataset.
	"getMetadata": function ()
  {
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
            UI.createCharts();
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
  "activateClimateCell": function(latReal, lngReal)
  {
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
      color:      RASTER_CELL_STYLE.color,
      weight:     RASTER_CELL_STYLE.stroke_width,
      clickable:  false,
    }
    UI.activeClimateCell = L.rectangle(rectBounds, rectStyle)
    UI.activeClimateCell.addTo(UI.map);
    UI.activeClimateCell.bringToBack();  // below weatherstation

    // Idea: The user should always see the full extent of the climate cell
    // => determine if the bounds of the cell are fully visible in the viewport
    var mapBounds = UI.map.getBounds();
    var cellBounds = UI.activeClimateCell.getBounds();

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
  },

  // clear current raster cell
  "deactivateClimateCell": function()
  {
    if (UI.activeClimateCell)
    {
      UI.map.removeLayer(UI.activeClimateCell);
      UI.activeClimateCell = null;
    }
  }
}
