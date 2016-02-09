/* 
 * ClimateCharts (--final URL--) (04.02.2016)
 * Author: Felix Wiemann
 * 
 * This file contains the user interface object for the website. The variables defined at the beginning are necessary to 
 * query the server for temperature and precipitation data and subsequently draw the chart. The ui functions are triggered,
 * if the corresponding html element is clicked or it´s value changes.
 */

var ui  = {
	
	"lt": 0,
	
	"ln": 0,
	
	"start": 1984,
	
	"end": 2014,
	
	"name": "",
	
	"data": [],
	
	"srtm": 0,
	
	//Initialize the leaflet map object with two baselayers and a scale.
	"createMap": function(){
		
		var marker = new L.marker();
		
		var map = new L.map("map");
		map.setView([40,10], 2);
		map.on("click", updatePosition);
		
		var OpenMapSurfer_Roads = L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
			maxZoom: 20,
			attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(map);
		
		var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19,
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			});
		
		var baseMaps = {
				"OpenMapSurfer": OpenMapSurfer_Roads,
				"OpenStreetMap": OpenStreetMap_Mapnik
		}
		
		L.control.layers(baseMaps).addTo(map);
		L.control.scale().addTo(map);
		
		//Update coordinate variables if the user clicked on the map.
		function updatePosition (e){
				ui.lt = (Math.round(e.latlng.lat*100)/100).toString();
				ui.ln = (Math.round(e.latlng.lng*100)/100).toString();
				marker.setLatLng([ui.lt, ui.ln]).addTo(map);
				$("#lt").val(ui.lt);
				$("#ln").val(ui.ln);
				$("#createChart").prop("disabled", false);
			};
		
		//Update coordinate variables if the user typed in coordinate values manually.
		$(".coordinates").change(function () {
			ui.lt = $("#lt").val();
			ui.ln = $("#ln").val();
			map.setView([ui.lt, ui.ln], 5);
			marker.setLatLng([ui.lt, ui.ln]).addTo(map);
			$("#createChart").prop("disabled", false);
		});
	},

	/*Query function to get the data for temperature and precipitation for the corresponding position and time and draw 
	  the chart.*/
	"createChart": function (){
			
			//Show loading animation.
			run_waitMe("progressBar");
			
			var id = "chart";

			$("#loader").css("visibility", "visible");
			$("#info").fadeOut();
			$("#info").remove();
			$("#" +id).fadeTo("slow", 0.3);
			$("#nodata").css("opacity", 0.4);
			
			//Draw the chart when all three ajax have calls received there answer.
			$.when(getValues(), getName(), getHeight())
			 	.done(function(a1, a2, a3){
					
					var dataArray = [],
						place = "",
						admin = "",
						country = "",
						name = "";
					
					//Only continue if there are realistic data values for this place and time, otherwise show an error message.
					if (a1[0][0].tmp < 10000) {
						for (var i=0; i < a1[0].length; i++){
							dataArray.push(a1[0][i]);
						}
						//Create the name string from gazetteer values or user input.
						if ($("#name1").is(':checked') === true) {
							if (a2[0].geonames[0]){
								if (a2[0].geonames[0].name !== ""){
									place = a2[0].geonames[0].name +", ";
								}
								if (a2[0].geonames[0].adminName1 !== ""){
									admin = a2[0].geonames[0].adminName1 +", ";
								}
								if (a2[0].geonames[0].countryName !== ""){
									country = a2[0].geonames[0].countryName + ", ";
								}
							}
							name = place + admin + country;
						}
						else {
							name = $("#userName").val() +", ";
						}
						
			    	  	var height = a3[0].srtm3;
			    	  	
			    	  	ui.data = dataArray.slice();
			    	  	ui.name = name;
			    	  	ui.srtm = height;
			    	  	
						$("#loader").css("visibility", "hidden");
						$("#nodata").empty();
						$("#save").css("visibility", "visible");
						$("#" +id).remove();
						
						drawChart(id, dataArray, name, height);
						
						$("#loader").remove();
						
						//If the screenwidth of the chart container is smaller than a minimum width, activate panning.
						if ($("#wrapper").width() < 728) {
							$("#" +id).panzoom();
							
							if ($('#reset').length === 0) {
								var reset = $("<button></button>").attr("id", "reset")
																.attr("class", "btn btn-primary")
																.text("Reset Chart");
								$("#save").prepend(reset);
								$("#save").prepend("<p>Pan/zoom the chart to change viewing area.");
								$("#reset").click(ui.resetSVG);
							}
						}
							
					} else {
						//Show error message if there is no data available.
						$("#loader").css("visibility", "hidden");
						$("#chart").empty();
						$("#wrapper").append("<h3 id='nodata'>");
						$("#nodata").text("No data available for this area!");
						$("#nodata").fadeTo("slow", 1);
					}
			 });

			//Query NetCdf data from server.
			function getValues(){
				var url = "" +window.location.protocol +"//" +window.location.host +"/climatecharts/api/ServeData";
				
				return $.get(url, {lat: ui.lt, lng: ui.ln, t1: ui.start, t2: ui.end})
						.fail(function(jqXHR, textStatus, errorThrown){
							console.log("Error occured: " +errorThrown)
						});
			};

			//Query geonames.org gazetteer for placename .
			function getName (){
				if ($("#name1").is(':checked') === true){
					return $.get("/climatecharts/api/gazetteer/findNearbyPlaceNameJSON", 
							{lat: ui.lt, lng: ui.ln, username: "climatediagrams"})
							.fail(function(jqXHR, textStatus, errorThrown){
								console.log("Error occured: " +errorThrown)
							});
					}
			};

			//Query geonames.org gazetteer for srtm elevation.
			function getHeight (){
				return $.get("/climatecharts/api/gazetteer/srtm3JSON", 
						{lat: ui.lt, lng: ui.ln, username: "climatediagrams"}
					)
					.fail(function(jqXHR, textStatus, errorThrown){
						console.log("Error occured: " +errorThrown)
				});
			};
			
			//Run loading Animation from "WaitMe" plugin.
			function run_waitMe(effect){
				$("#wrapper").append("<div id=loader></div>");
				
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
			};
		},

	// Fill select items with years. The start variable of his method might have to be updated if the 
	// dataset is changed.
	"populateLists": function (){
		var list = new Array(114),
			start = 1901,
			sel1 = document.getElementsByTagName('select')[0],
			sel2 = document.getElementsByTagName('select')[1];
		
		for (var i = 0; i < list.length; i++){
			var opt = document.createElement('option');
		    opt.innerHTML = start + i;
		    opt.value = start + i;
		    sel1.add(opt);
		}
	    for (var i = 0; i < list.length; i++){
			var opt = document.createElement('option');
		    opt.innerHTML = start + i;
		    opt.value = start + i;
		    sel2.add(opt);
		}
	    
	    $("#start").val(ui.start);
	    $("#end").val(ui.end);
	},
	
	/*Calculate the end year of time reference based on the first select input field. Values for the years 
	 * might have to be updated, when the dataset on the server is exchanged.
	 */
	"updateYear": function () {
		ui.end = parseInt($("#end").val());
		ui.start = parseInt($("#start").val());
		var checked = $("#checkbox").is(":checked");
		
		if (checked === false){
			ui.start = ui.end - 30;
			if (ui.start < 1901){
				ui.start = 1901;
			}
			$("#start").val(ui.start );
		} 
		if (checked === true){
			if (ui.end < ui.start){
				ui.start = ui.end;
			}
			if (ui.start < 1901){
				ui.start = 1901;
			}
			$("#start").val(ui.start );
		}
	},
	
	//Enable/disable the second time select field if the user wants to choose an individual time span or not.
	"changeTimeSelectStatus": function () {
		var checked = $("#checkbox").is(":checked");
		
		if (checked === true){
			$("#start").prop("disabled", false );
		} 
		else {
			$("#start").prop("disabled", true);
		}
	},
	
	//Enable/disable text input field if the user wants to type in an individual title for the chart or use 
	//a gazetteer.
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
	
	//Only enable button for creating the chart if the necessary variables are defined.
	"changeButtonStatus": function () {
		ui.lt = $("#lt").val();
		ui.ln = $("#ln").val();
		
		if (ui.lt !== 0 && ui.ln !== 0){
			$("#createChart").prop("disabled", false);
		}
	},
	
	//Reset position of svg if it is not centered due to panning/zooming.
	"resetSVG": function () {
		$("#chart").panzoom("reset");
	},
	
	//Save svg graphic to a svg file.
	"saveSvg": function () {
		$("#chart").panzoom("reset");
		
	    try {
	        var isFileSaverSupported = !!new Blob();
	    } catch (e) {
	        alert("This function is not supported by your browser!");
	    }

	    var html = d3.select("#chart")
	        .attr("title", "ClimateCharts")
	        .node().parentNode.innerHTML;

	    var blob = new Blob([html], {type: "image/svg+xml"});
	    saveAs(blob, "climatechart.svg");
	},
	
	//Clone the original svg graphic, upscale and rasterize the clone and finally save it to a png file.
	"savePng": function() {
		$("#chart").panzoom("reset");
		
		$("#chart").clone()
					.attr("id", "clone")
					.appendTo("#wrapper");
		
		$("#wrapper").append("<canvas>")
		
		/* Set hardcoded width value for raster graphic and scale height dynamically by 
		 * newWidth/originalWidth - factor. The chosen fixed width is twice the size of the original svg object,
		 * insuring that it stays sharp when it is scaled up.
		 */
		var clone = d3.select("#clone"),
			width_svg = clone.attr("width"),
			width_png = 1456,
			height_png = Math.floor(clone.attr("height")*(width_png/width_svg));
		
		clone.attr("width", width_png)
		   .attr("height", height_png)
		   .attr("viewbox", "0 0 " + width_png + " " + height_png);
		
		var svg = $("#clone")[0],
			canvas = $("canvas")[0],
			serializer = new XMLSerializer(),
			svgString = serializer.serializeToString(svg);
		
		canvas.width = svg.width;
		canvas.height = svg.height;
		
		canvg(canvas, svgString);
		
		var dataURL = canvas.toDataURL('image/png'),
			data = atob(dataURL.substring('data:image/png;base64,'.length));
		
		$("#clone").remove();
		$("canvas").remove();
		
		asArray = new Uint8Array(data.length);
		
		for (var i = 0; i < data.length; ++i) {
			asArray[i] = data.charCodeAt(i); 
			} 
		
		var blob = new Blob([asArray.buffer], {type: 'image/png'}); 
		saveAs(blob, 'climatechart.png'); 
	},
	
	//Switch between "Home" and "About" tab.
	"selectTab": function (e) {
	        var currentAttrValue = $(this).attr('href');
	        
	        $('.tabs ' + currentAttrValue).show().siblings().hide();
	 
	        $(this).parent('li').addClass('active').siblings().removeClass('active');
	 
	        e.preventDefault();
	}
}