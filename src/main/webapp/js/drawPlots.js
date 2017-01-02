/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann
 * 
 * This file contains the function to define and draw the svg elements of the plots showing the distribution of
 * temperature and precipitation data underneath the climate charts
 * 
 * Necessary Parameters to call the function:
 * 	- data: a json array containing objects with the properties month, tmp and pre

 */

drawPlots = function(data, name, elevation) {

	// =============================================================================
	// GLOBAL CONSTANTS
	// =============================================================================

	MONTHS_IN_YEAR = [
	        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
	        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

	// Plots
	PLOTS = [ { // temperature
		data : data.temperature,
		container : 'plot-tmp',
		title : "Distribution of Temperature [&deg;C]",
		color : 'rgb(230, 20, 20)',
		max_range : [ -40, +40 ],
	}, { // precipitation
		data : data.precipitation,
		container : 'plot-pre',
		title : "Distribution of Precipitation [mm]",
		color : 'rgb(4, 61, 186)',
		max_range : [ 0, +1000 ],
	}, ]

	// styling options
	XAXIS_RANGE = [ -1, 12 ]
	// ugly hack, because I don't understand the margin options towards the axes
	// should actually be: [0,11] ) [Jan, ... , Dec]
	PLOT_MARGIN = 40
	PLOT_HEIGHT = 500

	// important elements
	TITLE_CONTAINER = 		$('#plot-title')[0];
	SOURCE_CONTAINER = 		$('#plot-source')[0];
	REFERENCE_CONTAINER = 	$('#plot-reference')[0];
	SCALE_SWITCH = 			$("#plot-scale-switch")[0];
	SCALE_LABEL = 			$("#plot-scale-label")[0];

	// Plotly layout options and internally used attributes
	SCALE_STATI = [ { // default
		id : 'fixed',
		name : "Fixed Scale",
	}, {
		id : 'optimal',
		name : "Optimal Scale"
	} ]
	// can be further advanced to follow MVC pattern

	SCALE_STATE = 0 // initial scale state must be 0!


	// =============================================================================
	// HELPER FUNCTIONS
	// =============================================================================

	function getMonthName(monthNum) {
		return MONTHS_IN_YEAR[monthNum];
	}

	// =============================================================================
	// MAIN FUNCTION
	// =============================================================================

	/* LABEL THE SWITCH STATES */
	SCALE_LABEL.setAttribute('data-off', SCALE_STATI[0].name)
	SCALE_LABEL.setAttribute('data-on', SCALE_STATI[1].name)

	/* GET DATA */

	var traces = new Array();

	// for each plot
	for (i = 0; i < PLOTS.length; i++) {
		// create array for each trace
		traces[i] = new Array();

		// fill with values for each month
		for (j = 0; j < 12; j++) {
			traces[i].push({
				y : PLOTS[i].data[j],
				type : 'box',
				name : getMonthName(j),
				marker : {
					color : PLOTS[i].color
				}
			});
		}
	}

	/* SET LAYOUT */

	// [[]] -> outer array: data [tmp, pre], inner array: layout [fixed,
	// optimal]
	var layouts = new Array();

	// for each plot
	for (i = 0; i < PLOTS.length; i++) {
		
		  // layout for fixed scale
		  fixScaleLayout = {
		    title:        PLOTS[i].title,
		    xaxis:
		    {
		      range:      XAXIS_RANGE,
		      fixedrange: true,
		      showgrid:   true,
		      showline:   true,
		      mirror:     'ticks',
		      linecolor:  '#636363',
		      linewidth:  1
		    },
		    yaxis:
		    {
		      range:      PLOTS[i].max_range,
		      fixedrange: true,
		      autorange:  false,
		      rangemode:  'normal',
		      showline:   true,
		      mirror:     'ticks',
		      linecolor:  '#636363',
		      linewidth:  1
		    },
		    margin:
		    {
		      l:          PLOT_MARGIN,
		      r:          PLOT_MARGIN
		    },
		    showlegend:   false
		  };

		  // layout for optimal y-scale
		  optScaleLayout = JSON.parse(JSON.stringify(fixScaleLayout)); // deep copy
		  optScaleLayout.yaxis = {
		    range:        PLOTS[i].max_range,
		    fixedrange:   true,
		    autorange:    true,
		    rangemode:    PLOTS[i].max_range[0] < 0 ? 'normal' : 'nonnegative',
		    showline:     true,
		    mirror:       'ticks',
		    linecolor:    '#636363',
		    linewidth:    1
		  }

		// set layouts
		layouts[i] = [ fixScaleLayout, optScaleLayout ]
	}

	var configOptions = {
		displayModeBar : false
	}


	// layout the graphs
	function layoutPlots()
	{
	  for (i=0; i<PLOTS.length; i++)
	  {
	    Plotly.relayout(PLOTS[i].container, layouts[i][SCALE_STATE]);
	  }
	}

	// change layout onClick on scale button
	SCALE_SWITCH.onchange = function()
	{
	  // toggle status  (if 0 -> 1, else 1 -> 0)
	  SCALE_STATE = (SCALE_STATE == 0 ? 1 : 0);
	  layoutPlots();
	}

	// resize graph on window resize
	$(window).resize(function(e)
	{
	  for (i=0; i<PLOTS.length; i++)
	  {
	    Plotly.Plots.resize(PLOTS[i].graphD3);
	  }
	});

	// finally plot graphs
	var d3 = Plotly.d3;
	for (i=0; i<PLOTS.length; i++)
	{
	  var container = document.getElementById(PLOTS[i].container);
	  var graphD3 = d3.select(container)
	                  .style(
	                    {
	                        width: 100/PLOTS.length + '%',
	                        height: PLOT_HEIGHT + "px",
	                        'margin-top': "15px"
	                    }
	                  );
	  PLOTS[i].graphD3 = graphD3.node();
	  Plotly.plot(PLOTS[i].graphD3, traces[i], {}, configOptions);
	  // Plotly.newPlot(PLOTS[i].container, traces[i], {}, configOptions);
	}
	layoutPlots();
	
	// set title
	var title = name,
		subtitle = '';
	
	var lt = UI.lt,
		ln = UI.ln;
	
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
	
	var subtitle = lt + " " + ln;
	
	if (elevation > -1000){
		subtitle += " | " + elevation + "m";
	}
	
	subtitle += " | Years " + UI.start + "-" + UI.end;
	
	TITLE_CONTAINER.innerHTML = '<p>' + title + '</p><p>' + subtitle + '</p>';

	// set source
	
	var source = "";
	
	$.each(UI.catalog.dataset, function(i, v) {
		if (v._name == UI.dataset) {
	    	source = v._name +" (" +v.documentation[1].__text +")";
	    }
	});
	
	SOURCE_CONTAINER.innerHTML = "Data Source: " + source;
	
	// set reference
	
	REFERENCE_CONTAINER.innerHTML = "ClimateCharts.net";
}
