"use strict";

/*
 * ClimateCharts (climatecharts.net)
 * Author: Flix Wiemann and Marcus Kossatz
 *
 * This file contains the function to define and draw the svg elements of the plots showing the distribution of
 * temperature and precipitation data underneath the climate charts
 *
 */

drawPlots = function drawPlots(climateData, name, elevation) {
  // =============================================================================
  // GLOBAL CONSTANTS
  // =============================================================================

  // hack: restore old data structure
  // prec: 12*[30*[]], temp: 12*[30*[]]
  // erase null values
  var tempData = [];
  var precData = [];
  for (var monthIdx = 0; monthIdx < 12; monthIdx++) {
    tempData[monthIdx] = climateData.temp[monthIdx].rawData.filter(Number);
    precData[monthIdx] = climateData.prec[monthIdx].rawData.filter(Number);
  }

  // error handling: if no name, make XXX string that will be removed later
  if (name == "") name = 'XXX';

  // Plots
  PLOT = {
    title: name,
    subtitle: null,
    data_source: null,
    reference: "ClimateCharts.net",
    container: document.getElementById('plots-container'),
    graphD3: null,
    subplots: [{ // temperature
      data: tempData,
      title: "Distribution of Temperature [&deg;C]",
      color: 'rgb(230, 20, 20)',
      max_range: [-40, +40]
    }, { // precipitation
      data: precData,
      title: "Distribution of Precipitation [mm]",
      color: 'rgb(4, 61, 186)',
      max_range: [0, +1000]
    }]
  };

  // styling options
  STYLE = {
    plot_height: 500, // px
    plot_margin_horizontal: 30, // px
    plot_margin_vertical: 80, // px
    plot_padding: 0, // px
    subplot_distance: 10, // distance between temperature and precipitation plot [px]
    line_color: 'grey'
  };

  // important div containers
  SWITCH = {
    title: document.getElementById('plot-switch-title'),
    option: [document.getElementById('plot-switch-option-l'), document.getElementById('plot-switch-option-r')],
    button: document.getElementById('plot-switch-options')
    // not "-button", because that is just setting the bg color
  };

  SWITCH_TITLE = 'Y-Axis Scaling';
  // possible switch states
  // N.B. must be same names as layout.xxx
  SWITCH_STATES = ['automatic', 'fixed'];
  // initial switch state
  // must be 0 (!!!)
  SWITCH_STATE = 0;

  // ===========================================================================
  // MAIN FUNCTION
  // ===========================================================================

  /* D3 preparation */
  var d3 = Plotly.d3;
  var graphD3 = d3.select(PLOT.container).style({
    width: 100 + '%',
    height: STYLE.plot_height + 'px'
  });
  PLOT.graphD3 = graphD3.node();

  /* LABEL THE SWITCH TITLE AND STATES */
  SWITCH.title.innerHTML = SWITCH_TITLE;
  SWITCH.option[0].innerHTML = "" + SWITCH_STATES[0].charAt(0).toUpperCase() + SWITCH_STATES[0].slice(1);
  SWITCH.option[1].innerHTML = "" + SWITCH_STATES[1].charAt(0).toUpperCase() + SWITCH_STATES[1].slice(1);

  // =========================================================================
  /* GET DATA */

  // data structure: array of objects, each object for one data field per month
  // -> temperature Jan, temperature Feb, ... , precipitation Dec => 24 objects
  var data = [];

  // for each plot
  for (i = 0; i < PLOT.subplots.length; i++) {
    // for each month
    for (j = 0; j < 12; j++) {
      data.push({
        xaxis: 'x' + (i + 1),
        yaxis: 'y' + (i + 1),
        y: PLOT.subplots[i].data[j],
        type: 'box',
        name: MONTHS_IN_YEAR[j],
        marker: {
          color: PLOT.subplots[i].color
        }
      });
    }
  }

  // get subtitle
  var lat = UI.lat,
      lng = UI.lng;

  var factor = Math.pow(10, 2);
  lat = Math.round(lat * factor) / factor;
  lng = Math.round(lng * factor) / factor;

  if (lat >= 0) {
    lat = lat + "N";
  } else {
    lat = Math.abs(lat) + "S";
  }
  if (lng >= 0) {
    lng = lng + "E";
  } else {
    lng = Math.abs(lng) + "W";
  }

  PLOT.subtitle = lat + " " + lng;

  if (elevation > -1000) {
    PLOT.subtitle += " | " + elevation + " m";
  }

  PLOT.subtitle += " | Years " + UI.start + "-" + UI.end;

  // get data source
  $.each(UI.catalog.dataset, function (i, v) {
    if (v._name == UI.dataset) {
      PLOT.data_source = v._name + " (" + v.documentation[1].__text + ")";
    }
  });
  PLOT.data_reference = null;

  // ===========================================================================
  /* SET LAYOUTS AND CONFIG OPTIONS */

  var layouts = {};
  layouts.fixed = // fixed scale layout
  {
    title: PLOT.title,
    showlegend: false,
    margin: {
      l: STYLE.plot_margin_horizontal,
      r: STYLE.plot_margin_horizontal,
      b: STYLE.plot_margin_vertical,
      t: STYLE.plot_margin_vertical + 20,
      pad: STYLE.plot_padding
    },
    xaxis: {},
    yaxis: {},
    xaxis2: {},
    yaxis2: {}
  };

  var axes = [layouts.fixed.xaxis, layouts.fixed.yaxis, // temperature
  layouts.fixed.xaxis2, layouts.fixed.yaxis2 // precipitation
  ];
  var numAxes = axes.length;

  // default style for all axes
  for (var i = 0; i < numAxes; i++) {
    axes[i].rangemode = 'normal';
    axes[i].fixedrange = true;
    axes[i].showgrid = true;
    axes[i].showline = true;
    axes[i].mirror = 'ticks';
    axes[i].linecolor = STYLE.line_color;
    axes[i].linewidth = 1;
  }

  // special style / content for axes
  axes[0].title = PLOT.subplots[0].title;
  axes[0].domain = [0, 0.5 - STYLE.subplot_distance / 100 / 2], // left part of the plot
  axes[1].anchor = 'x1';
  axes[1].range = PLOT.subplots[0].max_range;
  axes[1].autorange = false;

  axes[2].title = PLOT.subplots[1].title;
  axes[2].domain = [0.5 + STYLE.subplot_distance / 100 / 2, 1], // right part of the plot
  axes[3].anchor = 'x2';
  axes[3].range = PLOT.subplots[1].max_range;
  axes[3].autorange = false;

  // optimal layout: same as fixed layout, just with different range on y-axis
  layouts.automatic = JSON.parse(JSON.stringify(layouts.fixed)); // deep copy
  layouts.automatic.yaxis.autorange = true;
  layouts.automatic.yaxis2.autorange = true;
  layouts.automatic.yaxis.rangemode = PLOT.subplots[0].max_range[0] < 0 ? 'normal' : 'nonnegative';
  layouts.automatic.yaxis2.rangemode = PLOT.subplots[1].max_range[0] < 0 ? 'normal' : 'nonnegative';

  // configuration options for plotly
  var configOptions = {
    displayModeBar: false
  };

  // ===========================================================================
  /* PLOT OPERATIONS */

  // layout the graphs
  function layoutPlots() {
    // clean the graph
    Plotly.purge(PLOT.graphD3);

    // get current layout
    var currLayout = null;
    Object.keys(layouts).forEach(function (key, index) {
      if (key == SWITCH_STATES[SWITCH_STATE]) {
        currLayout = layouts[key];
      }
    });

    // replot it
    Plotly.plot(PLOT.graphD3, data, currLayout, configOptions);

    // this is the brute force method
    // it would be nicer to plot it only once and then to relayout it:
    // Plotly.relayout(PLOT.graphD3, layouts[SWITCH_STATE]);
    // but that did not work since I used subplots.

    // get main svg container and attach id
    var mainSvg = $('.main-svg').first();
    mainSvg.attr('id', 'plots-svg-container');

    // get width and height from parent div
    var width = mainSvg.parent().width();
    var height = mainSvg.parent().height();

    // get title wrapper
    var titleWrapper = $('.g-gtitle');

    // give id to title, so it can be changed
    var titleDiv = $(titleWrapper.children()[0]);
    titleDiv.attr('id', 'climate-plots-title');

    // add subtitle
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
    footerWrapper.attr('id', 'plots-footer-wrapper');
    footerWrapper.removeClass('g-gtitle');
    footerWrapper.addClass('g-gfooter');
    footerWrapper.appendTo(titleWrapper.parent());

    var dataSourceDiv = $(footerWrapper.children()[0]);
    dataSourceDiv.text("Data Source: " + PLOT.data_source);
    dataSourceDiv.attr('id', 'plot-link-text');
    dataSourceDiv.attr('data-unformatted', "Data Source: " + PLOT.data_source);
    dataSourceDiv.css('font-size', 12);
    dataSourceDiv.css('fill', 'grey');
    dataSourceDiv.attr('y', STYLE.plot_height - 20);
    dataSourceDiv.attr('x', 0);
    dataSourceDiv.attr('text-anchor', 'begin');

    var referenceDiv = $(footerWrapper.children()[1]);
    referenceDiv.text(PLOT.reference);
    referenceDiv.attr('data-unformatted', PLOT.reference);
    referenceDiv.css('font-size', 12);
    referenceDiv.css('fill', 'grey');
    referenceDiv.attr('x', mainSvg.width() - 80); // why this random number?
    referenceDiv.attr('y', STYLE.plot_height - 20);

    /* hack: move info layer from meta svg to main svg in order to create one svg with all data in it */
    var infoLayer = $('.infolayer').first();
    infoLayer.detach();
    var mainSvg = $('.main-svg').first();
    mainSvg.append(infoLayer);

    // remove title if "XXX"
    if (titleDiv.text().startsWith('XXX')) {
      titleDiv.text("");
    }

    // hack: macke "clickable" hyperlink to source
    $('#plot-wrapper').append('<div id="plot-link"></div>');
    var plotLink = $('#plot-link');
    plotLink.css('width', $('#plot-link-text').width() + 10);
    plotLink.click(function () {
      var source = PLOT.data_source;
      var firstPar = source.indexOf('(');
      var lastPar = source.lastIndexOf(')');
      var url = source.slice(firstPar + 1, lastPar);
      // take only first url
      if (url.indexOf(',') > 0) {
        url = url.slice(0, url.indexOf(','));
      }
      // append http protocol if necessary
      if (!url.startsWith('http')) {
        url = 'http://' + url;
      }
      window.open(url);
    });

    /* add id and important attributes to actual svg container */
    var chart = d3.select("#plots-svg-container").classed("svg-container", true) //container class to make it responsive
    .attr("id", "climate-chart").attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg").attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", "0 0 " + width + " " + height).attr("width", "100%").classed("svg-content-responsive", true).style("font-size", "15px").style("font-family", "Arial, sans-serif").style("font-style", "normal").style("font-variant", "normal").style("font-weight", "normal").style("text-rendering", "optimizeLegibility").style("shape-rendering", "default").style("background-color", "transparent");

    // for some reason the id gets lost in the d3 function call...
    mainSvg.attr('id', 'plots-svg-container');
  }

  function toggleLayout() {
    // toggle switch state (if 0 -> 1, else 1 -> 0)
    SWITCH_STATE = SWITCH_STATE == 0 ? 1 : 0;
    layoutPlots();
  }

  // change layout onClick on scale button
  SWITCH.button.onclick = toggleLayout;

  // resize graph on window resize
  // this is the brute force method
  // it would be nicer to plot it only once and then to resize it:
  // Plotly.Plots.resize(PLOT.graphD3);
  // but that did not work since I used subplots.
  $(window).resize(layoutPlots);

  // =============================================================================
  /* MAIN */

  // initially drawing the chart
  layoutPlots();
};