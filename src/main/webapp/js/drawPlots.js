/*
 * ClimateCharts (climatecharts.net)
 * Author: Flix Wiemann and Marcus Kossatz
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
  PLOT =
    {
      title:      name,
      subtitle:   null,
      data_source:null,
      reference:  "ClimateCharts.net",
      container:  document.getElementById('plots-container'),
      graphD3:    null,
      subplots:
      [
        {             // temperature
          data:       data.temperature,
          title:      "Distribution of Temperature [&deg;C]",
          color:      'rgb(230, 20, 20)',
          max_range:  [-40, +40],
        },
        {             // precipitation
          data:       data.precipitation,
          title:      "Distribution of Precipitation [mm]",
          color:      'rgb(4, 61, 186)',
          max_range:  [0, +1000],
        }
      ],
      scale_states:
      [
        "Fixed Scale",
        "Optimal Scale"
      ]
    }

  // styling options
  PLOT_HEIGHT =             500; // px
  PLOT_MARGIN_HORIZONTAL =  30;  // px
  PLOT_MARGIN_VERTICAL =    80;  // px
  PLOT_PADDING =            5;   // px
  SUBPLOT_DISTANCE =        10;  // distance between temperature and precipitation plot [px]
  LINE_COLOR =              'grey';

  // important div containers
  SCALE_SWITCH =  document.getElementById("plot-scale-switch");
  SCALE_INPUT =   document.getElementById("plot-scale-input");
  SCALE_LABEL =   document.getElementById("plot-scale-label");

  SCALE_STATE = 0   // initial scale state must be 0!

	// ===========================================================================
	// MAIN FUNCTION
	// ===========================================================================

  /* D3 preparation */
  var d3 = Plotly.d3;
  var graphD3 = d3.select(PLOT.container)
  .style(
    {
      width: 100 + '%',
      height: PLOT_HEIGHT + 'px',
    }
  );
  PLOT.graphD3 = graphD3.node();

  /* LABEL THE SWITCH STATES */
  SCALE_LABEL.setAttribute('data-off', PLOT.scale_states[0])
  SCALE_LABEL.setAttribute('data-on',  PLOT.scale_states[1])


  // =========================================================================
  /* GET DATA */

  // data structure: array of objects, each object for one data field per month
  // -> temperature Jan, temperature Feb, ... , precipitation Dec => 24 objects
  var data = [];

  // for each plot
  for (i=0; i<PLOT.subplots.length; i++)
  {
    // for each month
    for (j=0; j<12; j++)
    {
      data.push(
        {
          xaxis: 'x'+(i+1),
          yaxis: 'y'+(i+1),
          y:    PLOT.subplots[i].data[j],
          type: 'box',
          name:	MONTHS_IN_YEAR[j],
          marker:
          {
            color: PLOT.subplots[i].color
          }
        }
      );
    }
  }

  // get subtitle
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

  PLOT.subtitle = lt + " " + ln;

  if (elevation > -1000){
    PLOT.subtitle += " | " + elevation + "m";
  }

  PLOT.subtitle += " | Years " + UI.start + "-" + UI.end;

  // get data source
  $.each(UI.catalog.dataset, function(i, v) {
	  if (v._name == UI.dataset) {
	    PLOT.data_source = v._name +" (" +v.documentation[1].__text +")";
	  }
	});
  PLOT.data_reference = null;

  // ===========================================================================
  /* SET LAYOUTS AND CONFIG OPTIONS */

  var layouts = [];
  layouts[0] =  // fixed scale layout
  {
    title:      PLOT.title,
    showlegend: false,
    margin:
    {
      l:        PLOT_MARGIN_HORIZONTAL,
      r:        PLOT_MARGIN_HORIZONTAL,
      b:        PLOT_MARGIN_VERTICAL,
      t:        PLOT_MARGIN_VERTICAL+20,
      pad:      PLOT_PADDING
    },
    xaxis:      {},
    yaxis:      {},
    xaxis2:     {},
    yaxis2:     {},
  };

  var axes =
  [
    layouts[0].xaxis,  layouts[0].yaxis,    // temperature
    layouts[0].xaxis2, layouts[0].yaxis2    // precipitation
  ]
  var numAxes = axes.length;

  // default style for all axes
  for (var i=0; i<numAxes; i++)
  {
    axes[i].rangemode =   'normal';
    axes[i].fixedrange =  true;
    axes[i].showgrid =    true;
    axes[i].showline =    true;
    axes[i].mirror =      'ticks';
    axes[i].linecolor =   LINE_COLOR;
    axes[i].linewidth =   1;
  }

  // special style / content for axes
  axes[0].title =     PLOT.subplots[0].title;
  axes[0].domain =    [0, 0.5-SUBPLOT_DISTANCE/100/2],  // left part of the plot
  axes[1].anchor =    'x1';
  axes[1].range =     PLOT.subplots[0].max_range;
  axes[1].autorange = false;

  axes[2].title =     PLOT.subplots[1].title;
  axes[2].domain =    [0.5+SUBPLOT_DISTANCE/100/2, 1],  // right part of the plot
  axes[3].anchor =    'x2';
  axes[3].range =     PLOT.subplots[1].max_range;
  axes[3].autorange = false;

  // optimal layout: same as fixed layout, just with different range on y-axis
  layouts[1] = JSON.parse(JSON.stringify(layouts[0])); // deep copy
  layouts[1].yaxis.autorange =  true;
  layouts[1].yaxis2.autorange = true;
  layouts[1].yaxis.rangemode =  PLOT.subplots[0].max_range[0] < 0 ? 'normal' : 'nonnegative';
  layouts[1].yaxis2.rangemode = PLOT.subplots[1].max_range[0] < 0 ? 'normal' : 'nonnegative';

  // configuration options for plotly
  var configOptions = {
    displayModeBar : false
  }

  // ===========================================================================
  /* PLOT OPERATIONS */

  // layout the graphs
  function layoutPlots()
  {
    // clean the graph
    Plotly.purge(PLOT.graphD3);

    // replot it
    Plotly.plot(PLOT.graphD3, data, layouts[SCALE_STATE], configOptions);

    // this is the brute force method
    // it would be nicer to plot it only once and then to relayout it:
    // Plotly.relayout(PLOT.graphD3, layouts[SCALE_STATE]);
    // but that did not work since I used subplots.

    // get title wrapper
    var titleWrapper = $('.g-gtitle')

    // add subtitle
    var titleDiv = $(titleWrapper.children()[0]);
    titleDiv.clone().appendTo(titleWrapper);

    var subtitleDiv = $(titleWrapper.children()[1]);
    subtitleDiv.text(PLOT.subtitle);

    // move title and subtitle
    titleDiv.attr('y', 20);
    subtitleDiv.attr('y', 45);

    // move xaxis title on top of the plots
    $('.xtitle').attr('y', 85);
    $('.x2title').attr('y', 85);

    // add data source and reference
    var footerWrapper = titleWrapper.clone();
    footerWrapper.removeClass('g-gtitle');
    footerWrapper.addClass('g-gfooter');
    footerWrapper.appendTo(titleWrapper.parent());

    var dataSourceDiv = $(footerWrapper.children()[0]);
    dataSourceDiv.text("Data Source: " + PLOT.data_source);
    dataSourceDiv.css('font-size', 12);
    dataSourceDiv.css('fill', 'grey');
    dataSourceDiv.attr('text-anchor', 'left');
    dataSourceDiv.attr('x', 0);
    dataSourceDiv.attr('y', PLOT_HEIGHT-20);

    var referenceDiv = $(footerWrapper.children()[1]);
    referenceDiv.text(PLOT.reference);
    referenceDiv.css('font-size', 12);
    referenceDiv.css('fill', 'grey');
    referenceDiv.attr('text-anchor', 'right');
    referenceDiv.attr('x', $('.main-svg').width()-130); // why 130
    referenceDiv.attr('y', PLOT_HEIGHT-20);
    
 	/* add id to actual svg container */
 	var plotsSVG = $('#plots-container').children().children()[0];
 	plotsSVG.id = 'plots-svg-container';
 	
 	/* hack: move info layer from meta svg to main svg in order to create one svg with all data in it */
 	var infoLayer = $('.infolayer').first();
 	infoLayer.detach();
 	var mainSvg = $('.main-svg').first();
 	mainSvg.append(infoLayer);
  }

  // change layout onClick on scale button
  SCALE_SWITCH.onchange = function(evt)
  {
    // toggle status  (if 0 -> 1, else 1 -> 0)
    SCALE_STATE = (SCALE_STATE == 0 ? 1 : 0);
    layoutPlots();
  }

  // resize graph on window resize
  $(window).resize(function(evt)
  {
    layoutPlots();
    // this is the brute force method
    // it would be nicer to plot it only once and then to resize it:
    // Plotly.Plots.resize(PLOT.graphD3);
    // but that did not work since I used subplots.
  });



  // =============================================================================
  /* MAIN */

  // initially drawing the chart
  layoutPlots();
}