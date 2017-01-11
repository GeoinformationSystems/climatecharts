/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 *
 * This file contains the function to define and draw the svg elements of the climate chart with the given arguments. In
 * the first part, some variables like width, height and the climate class are calculated from the input json array. In
 * the second and third part the elements of the chart like axes, gridlines and scales are defined and then added to the
 * svg container. The main framework used for drawing the chart is D3 (Data Driven Documents), see: http://d3js.org.
 *
 * Necessary Parameters to call the function:
 * 	- data: a json array containing objects with the propertys month, tmp and pre
 *  - name: the name for the place the chart is corresponding to
 *  - elevation: the elevation above sea level in meters for the attached coordinates
 *
 *  Please note that the styles for all elements within the graphic are not defined by external CSS but by D3. Otherwise
 *  the styles won´t be saved to file if the user wants use the "saveSVG" or "savePNG" functions from the UI object.
 */

drawChart = function (data, name, elevation){

// Clear the chart container everytime this function is called.
$("#climate-chart").empty();

//Set the basic dimension variables for the SVG element.
var WIDTH = 728,
	HEIGHT = 360,
	min_width = 728,
	MARGINS = {
    top : 70,
		topS: 30,
		right : 220,
		rightS : 30,
		bottom : 90,
		bottomS: 40,
		left : 40
  };

// Append chart element to parent container and set basic styles.


// check if chart already exists, otherwise create it
var chart = d3.select("#climate-chart-wrapper")
			.classed("svg-container", true) //container class to make it responsive
			.append("svg")
			.attr("id", "climate-chart")
			.attr("version", 1.1)
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox" , "0 0 " + WIDTH + " " + HEIGHT)
			.attr('width', '100%')
			.attr('height', '1000px')	// for compatibility with IE, this has to be here. But just forget about the actual number, it is a max value does not matter...
			.classed("svg-content-responsive", true)
			.style("font-size", "15px")
			.style("font-family", "Arial, sans-serif")
			.style("font-style", "normal")
			.style("font-variant", "normal")
			.style("font-weight", "normal")
			.style("text-rendering", "optimizeLegibility")
			.style("shape-rendering", "default")
			.style("background-color", background);

//Set size and position for the chart drawing area and the table.
var chart_width = - MARGINS.left + WIDTH - MARGINS.right,
	chart_height = HEIGHT - MARGINS.top - MARGINS.bottom,
	table_height = 250,
	table_width = 160,
	table_x = WIDTH - MARGINS.right + 1.6*MARGINS.rightS,
	table_y = MARGINS.top
	tableframe_y = table_y - 10;

//Colors
var background = "transparent",
	areaTmp = d3.rgb(255, 233, 15),
	areaPre = d3.rgb(89,131,213),
	colPre = d3.rgb(4,61,183),
	colTmp = d3.rgb(230,20,20),
	colGrid = "lightgrey",
	colTmpBright = d3.rgb(255,150,150),
	colPreBright = d3.rgb(150,150,255),
	black = "black";

//Font sizes of different text classes in the chart.
var tick = "13px",
	info = "15px",
	table = "14px",
	source = "12px";

//Domain reference.
var url = "ClimateCharts.net";

//Placeholder for the specific ticks shown on the vertical axes.
var ticks_y1 = [],
	ticks_y2 = [],
	ticks_y3 = [],
	pre_summer,
	pre_winter;

//Value definition placeholders for the axes.
var y3_height = 0,
	y1_height_negative = 0,
	y1_max = 50,
	y1_min = 0,
	y2_max = 100,
	y2_min = 0,
	y3_max = 0;

/*Set up variables for minimum, maximum etc for temperature and precipiation (especially needed for
 * climate classification).
 */
var tmp_range = 0,
	tmp_min = d3.min(data, function(d) { return d.tmp; }),
	tmp_max = d3.max(data, function(d) { return d.tmp; }),
	pre_min = d3.min(data, function(d) { return d.pre; }),
	pre_max = d3.max(data, function(d) { return d.pre; });

//Create arrays only with precipitation values for winter and summer, depending on the hemisphere.
if (UI.lt >= 0) {
	 pre_summer = (function () {
			var summer = [];
			for (i = 3; i < 9; i++){
				summer.push(data[i].pre);
			}
			return summer;
		})();

	 pre_winter = (function () {
		var winter = [];
			for (var i = 0; i < 12; i++){
				if (i < 3) {
					winter.push(data[i].pre);
				}
				if (i > 8) {
					winter.push(data[i].pre);
				}
			}
			return winter;
		})();
}
else {
	pre_winter = (function () {
		var summer = [];
		for (i = 3; i < 9; i++){
			summer.push(data[i].pre);
		}
		return summer;
	})();

	pre_summer = (function () {
		var winter = [];
		for (var i = 0; i < 12; i++){
			if (i < 3) {
				winter.push(data[i].pre);
			}
			if (i > 8) {
				winter.push(data[i].pre);
			}
		}
		return winter;
	})();
}

//Calculate minimum, maximum, mean and sum values for temperature/precipiation.
var pre_minS = (function (){
						return Math.min.apply(Math, pre_summer);
					})();

var pre_maxS = (function (){
						return Math.max.apply(Math, pre_summer);
					})();

var pre_minW = (function (){
						return Math.min.apply(Math, pre_winter);
					})();

var pre_maxW = (function (){
						return Math.max.apply(Math, pre_winter);
					})();

var tmp_mean = (function () {
					var sum = 0;
					var length = data.length;
					for (i = 0; i < length; i++){
						sum += data[i].tmp;
					}
					return Math.round((sum/length) * 10) / 10 ;
				})();
var pre_sum = (function () {
					var sum = 0;
					for (i = 0; i < data.length; i++){
						sum += data[i].pre;
					}
					return Math.round(sum);
				})();
var count_warmMonths = (function () {
							var count = 0;
							for (i = 0; i < data.length; i++) {
								if (data[i].tmp >= 10){
									count++;
								}
							}
							return count;
						})();

/*Calculate the stepsize between two axis tick marks based on the standard HEIGHT value and the number of ticks,
 * assuming there aren´t any negative tmp values.
 */
var y1_stepsize = (HEIGHT - MARGINS.top - MARGINS.bottom)/5;

setTickValues();

//Change height if precipitation is over 100mm or temperature below 0°C
if (pre_max > 100 || tmp_min < 0){
	adjustHeight();
}

chart.attr("viewBox", "0 0 " + WIDTH + " " +HEIGHT);

//Adjust height of #wrapper to fit to SVG content.
$("#climate-chart-wrapper").css("padding-bottom", 100*(HEIGHT/WIDTH) +"%");

/*The ticks for all y axes have to be calculated manually to make sure that they are in alignment and have the
 * correct ratio.
 */
function setTickValues(){

	if (tmp_min < 0){
		for (i = Math.floor(tmp_min/10); i <= 5; i++){

			if (i < 0){
				var tickValue = i*10;
				ticks_y1.push(tickValue);
			} else {
				var tickValue = i*10;
				ticks_y1.push(tickValue);
				ticks_y2.push(tickValue*2);
			}
		}
	} else {
		//If all temperature values are positive, set base of scale to zero.
		for (i = 0; i <= 5; i++){
				var tickValue = i*10;
				ticks_y1.push(tickValue);
				ticks_y2.push(tickValue*2);
		}
	}

	if (pre_max > 100){
		var y3_tickNumber = Math.ceil((pre_max - 100)/200);

		for (i=1; i <= y3_tickNumber; i++){
			var tickValue = 100 + i*200;
			ticks_y3.push(tickValue);
		}
	}

	y1_min = d3.min(ticks_y1);
	y1_max = d3.max(ticks_y1);
	y3_max = d3.max(ticks_y3);

	//If there are negative tmp values, calculate pre_min in a way so that the zeropoints of both y axes are in alignment.
	y2_min = y1_min*2;
}

//If there are any precipitation values over 100mm or temperature values below 0°C, adjust the height of the svg graphic.
function adjustHeight(){
	y1_height_negative = (ticks_y1.length - 6) * y1_stepsize;
	y3_height = ticks_y3.length * y1_stepsize;

	HEIGHT = HEIGHT + y3_height + y1_height_negative;

	chart_height = chart_height + y1_height_negative + y3_height;
}

//Calculate the climate class for the current position from the data array.
function getClimateClass (){
	var cl = "";
	var pre_dry = getPreDry();

//	console.log("tmp_max: " +tmp_max +", tmp_min: " +tmp_min +", pre_max: " +pre_max +", pre_min: " +pre_min
//			+", pre_minS: " +pre_minS +", pre_minW: " +pre_minW +", pre_maxS: " +pre_maxS +", pre_maxW: "
//			+pre_maxW +", pre_dry: " +pre_dry +", count_warmMonths: " +count_warmMonths);

//	console.log("pre_summer: " +pre_summer.toString());
//	console.log("pre_winter: " +pre_winter.toString());

	if (tmp_max < 10){
		cl = "E";
		if (0 < tmp_max < 10) {
			cl += "T";
		}
		else {
			cl += "F";
		}
	}
	else {
		if (pre_sum < 10*pre_dry){
			cl = "B";
			//2nd letter
			if (pre_sum > 5*pre_dry){
				cl += "S";
			}
			else {
				cl += "W";
			}
			//3rd letter
			if (tmp_mean >= 18){
				cl += "h";
			}
			else {
				cl += "k";
			}

		}
		else {
			if (tmp_min >= 18){
				cl = "A";
				//2nd letter
				if (pre_min >= 60){
					cl += "f";
				}
				else if (pre_sum >= 25*(100 - pre_min)) {
					cl += "m";
				}
				else if (pre_minS < 60) {
					cl += "s";
				}
				else if (pre_minW < 60) {
					cl += "w";
				}
			}
			else if (tmp_min <= -3){
				cl = "D";
				//2nd letter
				if (pre_minS < pre_minW && pre_maxW > 3*pre_minS && pre_minS < 40) {
					cl += "s";
				}
				else if (pre_minW < pre_minS && pre_maxS > 10*pre_minW) {
					cl += "w";
				}
				else {
					cl += "f";
				}
				//3rd letter
				if (tmp_max >= 22){
					cl += "a";
				}
				else if (tmp_max < 22 && count_warmMonths > 3){
					cl += "b";
				}
				else if (tmp_max < 22 && count_warmMonths <= 3 && tmp_min > -38){
					cl += "c";
				}
				else if (tmp_max < 22 && count_warmMonths <= 3 && tmp_min <= -38){
					cl += "d";
				}
			}
			else if (tmp_min > -3 && tmp_min < 18) {
				cl = "C";
				//2nd letter
				if (pre_minS < pre_minW && pre_maxW > 3*pre_minS && pre_minS < 40) {
					cl = cl + "s";
				}
				else if (pre_minW < pre_minS && pre_maxS > 10*pre_minW) {
					cl = cl + "w";
				}
				else {
					cl = cl + "f";
				}
				//3rd letter
				if (tmp_max >= 22){
					cl += "a";
				}
				else if (tmp_max < 22 && count_warmMonths > 3){
					cl += "b";
				}
				else if (tmp_max < 22 && count_warmMonths <= 3 && tmp_min > -38){
					cl += "c";
				}
				else if (tmp_max < 22 && count_warmMonths <= 3 && tmp_min <= -38){
					cl += "d";
				}
			}
		}
	}
	return cl;
}

//Calculate dryness index which is needed for climate classification.
function getPreDry () {

	var pre_dry = 0;

	var sum_summer = (function (){
						var sum = 0;
						$.each(pre_summer,function() {
						    sum += this;
						});
						return sum;
					})();

	var sum_winter = (function (){
							var sum = 0;
							$.each(pre_winter,function() {
							    sum += this;
							});
							return sum;
						})();


	var pre_diff = sum_summer - sum_winter;

//	console.log("sum_summer: " +sum_summer +", sum_winter: " +sum_winter +",
//	2/3*pre_sum: " +2/3*pre_sum);

	if (sum_summer >= 2/3*pre_sum) {
		pre_dry = 2*tmp_mean + 28;
	}
	else if (sum_winter >= 2/3*pre_sum){
		pre_dry = 2*tmp_mean;
	}
	else {
		pre_dry = 2*tmp_mean + 14;
	}

	return pre_dry;
}

//Create the title which is shown above the graph.
function getTitle() {

	var lt = UI.lt;
	var ln = UI.ln;

	if (lt >= 0){
		lt = lt +"N";
	} else {
		lt = Math.abs(lt) +"S";
	}
	if (ln >= 0){
		ln = ln +"E";
	} else {
		ln = Math.abs(ln) +"W";
	}

	var title = name;
	var subtitle = lt + " " + ln;

	if (elevation > -1000){
		subtitle += " | " + elevation + "m";
	}

	subtitle += " | Climate Class: " + getClimateClass() + " | Years: " + UI.start + "-" + UI.end;

	return [title, subtitle];
}

//Fill table column with values of the variable given as an argument.
function fillColumn (col, column, x) {

	for (i = 0; i < 12; i++){
		var obj = data[i];

		for (key in obj){
		    if (key === column){
		    	if(typeof(obj[key]) === "number") {
		    		var number = obj[key].toFixed(1);

			    	col.append('tspan')
				    	.attr("id", column + "_c" + i)
				    	.attr("class", "cell")
				        .attr('x', x)
				        .attr('y', table_y + (table_height/13) * (i + 1))
				    	.style("text-align", "right")
				        .text(number);
		    	}
		    	else {
			    	col.append('tspan')
			    	.attr("id", column + "_c" + i)
			    	.attr("class", "cell")
			        .attr('x', x)
			        .attr('y', table_y + (table_height/13) * (i + 1))
			    	.style("text-align", "right")
			        .text(obj[key]);
		    	}
		    }
		}
	}
}

//Define function for mouseover effect.
function mouseMove(d) {
	var m = d3.mouse(this),
		lowDiff = 1e99,
		xI = null,
		tickPos = xScale.range();

	for (var i = 0; i < tickPos.length; i++) {
		var diff = Math.abs(m[0] - tickPos[i]);
		if (diff < lowDiff) {
			lowDiff = diff;
			xI = i;
		}
	}

	var c1 = chart.select("#c1"),
		c2 = chart.select("#c2"),
		month = "#month_c" + xI,
		tmp = "#tmp_c" + xI,
		pre = "#pre_c" + xI,
		month = chart.select(month),
		tmp = chart.select(tmp),
		pre = chart.select(pre),
		rows = chart.selectAll(".cell");

	rows.attr("fill", black)
		.attr("font-weight", "normal")
		.style("text-shadow", "none");
	month.style("text-shadow", "1px 1px 2px gray")
		.attr("font-weight", "bold");
	tmp.attr("fill", colTmp)
		.attr("font-weight", "bold")
		.style("text-shadow", "1px 2px 2px gray");
	pre.attr("fill", colPre)
		.attr("font-weight", "bold")
		.style("text-shadow", "2px 2px 2px gray");

	c1.attr("transform", "translate(" + tickPos[xI] + ","
			+ yScale1(data[xI].tmp) + ")");

	if ( data[xI].pre <= 100) {
		c2.attr("transform", "translate(" + tickPos[xI] + ","
				+ yScale2(data[xI].pre) + ")");
	}
	if ( data[xI].pre > 100) {
		c2.attr("transform", "translate(" + tickPos[xI] + ","
				+ yScale3(data[xI].pre) + ")");
	}
}

//Get the doi of the dataset reference used to create the chart.
function getSource () {

	var source = "";

	$.each(UI.catalog.dataset, function(i, v) {

		if (v._name == UI.dataset) {
	    	source = v._name +" (" +v.documentation[1].__text +")";
	    }
	});

	return source;
}

//Get the doi link
function getSourceLink () {
	var source = getSource();
  var firstPar = source.indexOf('(');
  var lastPar = source.lastIndexOf(')');
  var url = source.slice(firstPar+1, lastPar);
  // take only first url
  if (url.indexOf(',') > 0)
  {
    url = url.slice(0,url.indexOf(','));
  }
  // append http protocol, if necessary
  if (!url.startsWith('http'))
  {
    url = 'http://' + url;
  }
  return url;
}

//Wrap text input string and split into multiple lines if necessary.
function wrap(text, width, char) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(char).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(char));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(char));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}

//-------------------------------------------------------------------------------------------------------------
// Define features of chart. -----------------------------------------------------------------------------------

var xScale = d3.scale
			.ordinal()
			.range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
			.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
			"Sep", "Oct", "Nov", "Dec"])
			.rangePoints([MARGINS.left, WIDTH - MARGINS.right], 0);

var yScale1 = d3.scale
		   .linear()
		   .range([HEIGHT - MARGINS.bottom, y3_height + MARGINS.top])
		   .domain([y1_min, y1_max]);

var yScale2 = d3.scale
		   .linear()
		   .range([HEIGHT - MARGINS.bottom, y3_height + MARGINS.top])
		   .domain([y2_min, y2_max]);

var yScale3 = d3.scale
		   .linear()
		   .range([y3_height + MARGINS.top, MARGINS.top])
		   .domain([100, y3_max]);
var yScale4 = d3.scale
			.linear()
			.range([HEIGHT - MARGINS.bottom, MARGINS.top])
			.domain([MARGINS.bottom, HEIGHT - MARGINS.top]);
var yScale5 = d3.scale
			.linear()
			.range([y3_height - y1_stepsize + MARGINS.top, MARGINS.top])
			.domain([300, y3_max]);

var xScale_table = d3.scale
				.ordinal()
				.range([0, 1, 2, 3])
				.domain([0, 1, 2, 3])
				.rangePoints([table_x, table_x + table_width], 0);

var yScale_table = d3.scale
				.ordinal()
				.range([tableframe_y + table_height, tableframe_y])
				.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
				.rangePoints([tableframe_y, tableframe_y + table_height], 0);

var xAxis = d3.svg
			.axis()
			.scale(xScale)
			.tickSize(5)
			.tickSubdivide(true)
			.tickPadding(5);
var yAxis1 = d3.svg
			.axis()
			.scale(yScale1)
			.tickValues(ticks_y1)
			.tickSize(5)
			.orient('left');
var yAxis2 = d3.svg
			.axis()
			.scale(yScale2)
			.tickValues(ticks_y2)
			.tickSize(5)
			.orient('right');
var yAxis3 = d3.svg
			.axis()
			.scale(yScale3)
			.tickValues(ticks_y3)
			.tickSize(5)
			.orient('right');
var yAxis4 = d3.svg
			.axis()
			.scale(yScale4)
			.ticks(0)
			.tickSize(5)
			.orient("left");
var grid_x = d3.svg
			.axis()
			.scale(xScale)
			.tickSize(MARGINS.top + MARGINS.bottom - HEIGHT)
			.tickSubdivide(true)
			.tickPadding(5)
			.tickFormat("");
var grid_y1 = d3.svg
			.axis()
			.scale(yScale1)
			.tickValues(ticks_y1)
			.tickSize(-chart_width)
			.orient('left')
			.tickFormat("");
var grid_y2 = d3.svg
			.axis()
			.scale(yScale5)
			.tickValues(ticks_y3)
			.tickSize(chart_width)
			.orient('right')
			.tickFormat("");

var grid_y_table = d3.svg
					.axis()
					.scale(yScale_table)
					.tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
					.tickSize(-table_width)
					.orient('left')
					.tickFormat("");

var lineTmp = d3.svg.line()
				.x(function(d) {return xScale(d.month);})
				.y(function(d) {return yScale1(d.tmp);})
				.interpolate('linear');

var linePre = d3.svg.line()
				.x(function(d) {return xScale(d.month);})
				.y(function(d) {return yScale2(d.pre)})
				.interpolate('linear');

var linePre2 = d3.svg.line()
				.x(function(d) {return xScale(d.month);})
				.y(function(d) {return yScale3(d.pre)})
				.interpolate('linear');

//Polygons for drawing the colored areas below the curves.
var areaBelowTmp = d3.svg.area()
					.x(function(d) {return xScale(d.month);})
					.y0(function(d) {return yScale1(d.tmp);})
					.y1(HEIGHT)
					.interpolate('linear');
var areaBelowPre = d3.svg.area()
					.x(function(d) {return xScale(d.month);})
					.y0(function(d) {return yScale2(d.pre);})
					.y1(HEIGHT)
					.interpolate('linear');
var areaBelowPre2 = d3.svg.area()
					.x(function(d) {return xScale(d.month);})
					.y0(function(d) {return yScale3(d.pre);})
					.y1(yScale2(100))
					.interpolate('linear');

//Polygons used as clipping masks to define the visible parts of the polygons defined above.
var areaTmpTo100 = d3.svg.area()
					.x(function(d) {return xScale(d.month);})
					.y0(function(d) {return yScale1(d.tmp);})
					.y1(yScale2(100))
					.interpolate('linear');
var area100ToMax = d3.svg.area()
					.x(function(d) {return xScale(d.month);})
					.y0(yScale3(101))
					.y1(0)
					.interpolate('linear');
var areaAbovePre = d3.svg.area()
					.x(function(d) {return xScale(d.month);})
					.y0(function(d) {return yScale2(d.pre);})
					.y1(yScale2(100))
					.interpolate('linear');


//-----------------------------------------------------------------------------------------------------------------------
// Append features of chart to the html svg element. ---------------------------------------------------------------------

//Defs contains the paths that are later used for clipping the areas between the temperature and precipitation lines.
var defs = chart.append('defs');

defs.append('clipPath')
  .attr('id', 'clip-tmp')
  .append('path')
  .attr('d', areaTmpTo100(data));

defs.append('clipPath')
	.attr('id', 'clip-tmp2')
	.append('path')
	.attr('d', area100ToMax(data));

defs.append('clipPath')
  .attr('id', 'clip-pre')
  .append('path')
  .attr('d', areaAbovePre(data));

defs.append('clipPath')
	.attr('id', 'rect_bottom')
	.append('rect')
	.attr('x', MARGINS.left)
	.attr('y', MARGINS.top + y3_height)
	.attr('width', WIDTH)
	.attr('height', HEIGHT - y3_height);

defs.append('clipPath')
	.attr('id', 'rect_top')
	.append('rect')
	.attr('x', MARGINS.left)
	.attr('y', MARGINS.top)
	.attr('width', WIDTH)
	.attr('height', y3_height);

//BACKGROUND
chart.append("rect")
	.attr("class", "shadow")
	.attr("width", WIDTH)
	.attr("height", HEIGHT)
	.attr("fill", background);

//GRID ELEMENTS
chart.append('svg:g')
	.attr('class', 'grid')
	.attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
	.call(grid_x);

chart.append('svg:g')
	.attr('class', 'grid')
	.attr('transform','translate('+ MARGINS.left + ',0)')
	.call(grid_y1);

//only add the second horizontal gridlines if necessary
if (y3_height > 0){
	chart.append('svg:g')
		.attr('class', 'grid')
		.attr('transform','translate('+ MARGINS.left + ',0)')
		.call(grid_y2);
}

//COLORED AREAS BETWEEN LINES
chart.append('path')
	.data(data)
	.attr("class", "area")
	.attr('d', areaBelowTmp(data))
	.attr('clip-path', 'url(#clip-pre)')
	.attr('fill', areaTmp)
	.attr('stroke', 'none');

chart.append('path')
	.data(data)
	.attr("class", "area")
	.attr('d', areaBelowPre(data))
	.attr('clip-path', 'url(#clip-tmp)')
	.attr('fill', areaPre)
	.attr('stroke', 'none');

chart.append('path')
	.data(data)
	.attr('d', areaBelowPre2(data))
	.attr('clip-path', 'url(#clip-tmp2)')
	.attr('fill', colPre)
	.attr('stroke', 'none');

//LINES
chart.append('svg:path')
	.attr('class', 'line')
	.attr('d', lineTmp(data))
	.attr('stroke', colTmp)
	.attr('stroke-width', 1.5)
	.attr('fill', 'none');

chart.append('svg:path')
	.attr('class', 'line')
	.attr('d', linePre(data))
	.attr('clip-path', 'url(#rect_bottom)')
	.attr('stroke', colPre)
	.attr('stroke-width', 1.5)
	.attr('fill', 'none');

chart.append('svg:path')
	.attr('class', 'line')
	.attr('d', linePre2(data))
	.attr('clip-path', 'url(#rect_top)')
	.attr('stroke', colPre)
	.attr('stroke-width', 1)
	.attr('fill', 'none');

//AXES
chart.append('svg:g')
	.attr('class', 'y axis')
	.attr('transform','translate(' + MARGINS.left + ',0)')
	.call(yAxis4);

chart.append('svg:g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
	.call(xAxis)
	.style('fill', 'black');

chart.append('svg:g')
	.attr('class', 'y axis')
	.attr('transform','translate(' + MARGINS.left + ',0)')
	.call(yAxis1)
	.style('fill', colTmp);

chart.append('svg:g')
	.attr('class', 'y axis')
	.attr('transform','translate(' + (chart_width + MARGINS.left) + ',0)')
	.call(yAxis2)
	.style('fill', colPre);

chart.append('svg:g')
	.attr('class', 'y axis')
	.attr('transform','translate(' + (chart_width + MARGINS.left) + ',0)')
	.call(yAxis3)
	.style('fill', colPre);

//ADDITIONAL ELEMENTS LIKE TITLE, CLIMATE CLASS, ETC...
chart.append("text")
	.attr("class", "tick")
	.attr("text-anchor", "end")
	.attr("x", MARGINS.left + 10)
	.attr("y", table_y-10)
	.text("[°C]")
	.attr('fill', colTmp);

chart.append("text")
	.attr("class", "tick")
	.attr("text-anchor", "end")
	.attr("x", chart_width + MARGINS.left + 20)
	.attr("y", table_y-10)
	.text("[mm]")
	.attr('fill', colPre);

chart.append("text")
	.attr("class", "info")
	.attr("x", WIDTH*2/5)
    .attr("y", MARGINS.top*1/3-5)
    .attr("width", MARGINS.right - MARGINS.rightS)
    .attr("text-anchor", "middle")
    .text(getTitle()[0])
    .call(wrap, WIDTH*2/3);

chart.append("text")
	.attr("class", "info")
	.attr("x", WIDTH*2/5)
    .attr("y", MARGINS.top*1/3+12)
    .attr("width", MARGINS.right - MARGINS.rightS)
    .attr("text-anchor", "middle")
    .text(getTitle()[1])
    .call(wrap, WIDTH*2/3);

chart.append("text")
	.attr("class", "info")
	.attr("x", MARGINS.left + chart_width/11)
	.attr("y", HEIGHT - MARGINS.bottomS)
	.text("Temperature Mean: " + tmp_mean + "°C");

chart.append("text")
	.attr("class", "info")
	.attr("x", MARGINS.left + chart_width*6/10)
	.attr("y", HEIGHT - MARGINS.bottomS)
	.text("Precipitation Sum: " + pre_sum + "mm");

chart.append("text")
	.attr("class", "source")
	.attr("id", "dataSource")
	.attr("width", WIDTH)
	.attr("x", 10)
	.text("Data Source: " + getSource())
	.call(wrap, WIDTH - 100, " ")
	.attr("y", HEIGHT + 14 - $('#dataSource')[0].getBBox().height)
  .on("click", function() { window.open(getSourceLink()); })
  .style("cursor", "pointer");

chart.append("text")
	.attr("id", "url")
	.attr("class", "source")
	.style("text-anchor", "end")
	.append("tspan")
	.attr("x", WIDTH - 10)
	.attr("y", HEIGHT - 5)
	.text(url);

//TABLE ELEMENTS
chart.append("line")
	.attr("x1", table_x + table_width/3)
	.attr("y1", table_y - 15)
	.attr("x2", table_x + table_width/3)
	.attr("y2", table_y + table_height - 10)
	.attr("shape-rendering", "crispEdges")
	.style("stroke", colGrid);

chart.append("line")
	.attr("x1", table_x + table_width*2/3)
	.attr("y1", table_y - 15)
	.attr("x2", table_x + table_width*2/3)
	.attr("y2", table_y + table_height - 10)
	.attr("shape-rendering", "crispEdges")
	.style("stroke", colGrid);

//Add column titles separately to table.
chart.append('text')
	.attr('id', "month")
	.attr("class", "info")
	.attr('x', table_x + table_width*1/6)
	.attr('y', table_y)
	.attr('text-anchor', 'middle')
	.text("Month");

chart.append('text')
	.attr('id', "tmp")
	.attr("class", "info")
	.attr('x', table_x + table_width*3/6)
	.attr('y', table_y)
	.attr('text-anchor', 'middle')
	.text("Temp");

chart.append('text')
	.attr('id', "pre")
	.attr("class", "info")
	.attr('x', table_x + table_width*5/6)
	.attr('y', table_y)
	.attr('text-anchor', 'middle')
	.text("Precip");

//Add column values to table using fillColumn method.
chart.append('text')
	.attr('id', "month")
	.attr("class", "info")
	.attr('x', table_x + table_width*1/6)
	.attr('y', table_y)
	.attr('text-anchor', 'middle')
	.call(fillColumn, "month", table_x + table_width*1/6);

chart.append('text')
	.attr("class", "info")
	.attr('x', table_x + table_width*3/6)
	.attr('y', table_y)
	.attr('text-anchor', 'end')
	.call(fillColumn, "tmp", table_x + table_width*6/10);

chart.append('text')
	.attr("class", "info")
	.attr('x', table_x + table_width*5/6)
	.attr('y', table_y)
	.attr('text-anchor', 'end')
	.call(fillColumn, "pre", table_x + table_width*19/20);

//SET STYLING FOR DIFFERENT GROUPS OF ELEMENTS
chart.selectAll(".grid")
	.style("fill", "none")
	.style("stroke", colGrid)
	.style("stroke-width", "1px")
	.attr("shape-rendering", "crispEdges");

chart.selectAll(".axis .domain")
	.style("fill", "none")
	.style("stroke", "black")
	.style("stroke-width", "1px")
	.attr("shape-rendering", "crispEdges");

chart.selectAll(".tick")
	.style("font-size", tick);

chart.selectAll(".info")
	.attr("font-weight", "normal")
	.style("font-size", info);

chart.selectAll(".cell")
	.style("font-size", table);

chart.selectAll(".source")
	.style("font-size", source)
	.style("opacity", 0.6);

chart.selectAll(".area")
	.style("opacity", 0.7);

//ADD ELEMENTS FOR MOUSEOVER EFFECT
chart.append("g")
	.attr("class", "focus")
	.attr("visibility", "hidden");

chart.select(".focus")
	.append("circle")
	.attr("id", "c1")
	.attr("r", 4.5)
	.attr("fill", "white")
	.attr("stroke", colTmp)
	.style("stroke-width", 1.5);

chart.select(".focus")
	.append("circle")
	.attr("id", "c2")
	.attr("r", 4.5)
	.attr("fill", "white")
	.attr("stroke", colPre)
	.style("stroke-width", 1.5);

chart.append("rect")
	.attr("class", "overlay")
	.attr("x", MARGINS.left)
	.attr("y", MARGINS.top)
	.attr("width", chart_width)
	.attr("height", chart_height)
	.attr("fill", "none")
	.style("pointer-events", "all")
	.on("mouseover", function() {
		chart.select(".focus")
			 .attr("visibility", "visible");
		})
	.on("mouseout", function() {
		chart.select(".focus")
			 .attr("visibility", "hidden");

		chart.selectAll(".cell")
			 .attr("fill", black)
			 .attr("font-weight", "normal")
			 .style("font-size", table)
			 .style("text-shadow", "none");
		})
	.on("mousemove", mouseMove);
}
