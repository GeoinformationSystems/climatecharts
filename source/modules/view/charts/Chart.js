// ############################################################################
// Chart                                                                  View
// ############################################################################
// Is the base class for all visualization charts
// - Create the div container
// - Provide d3 as the visualization library
// - Provide title, subtitle, data reference
// - Provide functionality for exporting in SVG and PNG
// ############################################################################

class Chart
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Construct chart
  // ==========================================================================

  constructor(main, chartName, climateData)
  {
    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._main = main
    this._chartMain = main.config.charts[chartName]
    this._climateData = climateData

    this._domElementCreator = new DOMElementCreator()


    // ------------------------------------------------------------------------
    // Setup metadata
    // ------------------------------------------------------------------------

    this._setChartMetadata()


    // ------------------------------------------------------------------------
    // Setup container
    // ------------------------------------------------------------------------

    // Parent container in which chart is embedded
    let parentDiv = document.getElementById(main.config.charts.parentContainer)

    // Wrapper container which directly contains the chart
    let wrapperDiv = this._domElementCreator.create(
        'div',                                  // element
        this._chartMain.container+"-wrapper",   // id
        [main.config.charts.className, 'box']   // classes
      )
    parentDiv.appendChild(wrapperDiv)

    this._wrapperDiv = $(wrapperDiv)

    // Append chart element to parent container and set basic styles.
    // -> check if chart already exists, otherwise create it
    this._chart = d3.select("#" + this._chartMain.container + "-wrapper")
      .append("svg")
      .attr("id", this._chartMain.container)
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox",
        "0 0 " + this._chartMain.width + " " + this._chartMain.height
      )
      .attr('width', '100%')
      .attr('height', '1000px')	// for compatibility with IE, this has to be here. But just forget about the actual number, it is a max value, it does not matter...
      .classed("svg-container", true) //container class to make it responsive
      .classed("svg-content-responsive", true)
      .style("font-size",       "15px")
      .style("font-family",     "Arial, sans-serif")
      .style("font-style",      "normal")
      .style("font-variant",    "normal")
      .style("font-weight",     "normal")
      .style("text-rendering",  "optimizeLegibility")
      .style("shape-rendering", "default")
      .style("background-color","transparent")

    //Set size and position for the chart drawing area and the table.
    this._width  = this._chartMain.width
    this._height = this._chartMain.height

    this._chartWidth = 0
      - this._chartMain.margins.left
      + this._width
      - this._chartMain.margins.right
    this._chartHeight = 0
      + this._height
      - this._chartMain.margins.top
      - this._chartMain.margins.bottom
    this._tableX = 0
      + this._width
      - this._chartMain.margins.right
      + 1.6 * this._chartMain.margins.rightS
    this._tableY = 0
      + this._chartMain.margins.top
    this._tableframeY = 0
      + this._tableY
      - 10


    // ------------------------------------------------------------------------
    // Write title, subtitle and caption
    // ------------------------------------------------------------------------

    // Title
    this._titleDiv = null
    this._main.hub.onDiagramTitleChange(this._title)
    // TODO: continue here

    // Subtitle

    // Caption


    // ------------------------------------------------------------------------
    // Draw chart itself
    // ------------------------------------------------------------------------

    this._drawChart()

  }


  // ==========================================================================
  // Update climate data of chart
  // ==========================================================================

  updateClimate(climateData)
  {
    // Update model
    this._climateData = climateData
    this._setChartMetadata()

    // Clear current container and redraw
    this._wrapperDiv.empty()
    this._drawChart()

    // Reset the diagram title
    this._main.hub.onDiagramTitleChange(this._title)
  }


  // ==========================================================================
  // Update title of chart
  // ==========================================================================

  updateTitle(title)
  {
    this._title = title
    this._titleDiv.text(title)
  }


  // ==========================================================================
  // Remove chart
  // ==========================================================================

  remove()
  {
    // Clean model
    this._climateData = null

    // Clean view
    this._wrapperDiv.remove()
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Remove chart
  // ==========================================================================

  _setChartMetadata()
  {
    // Set title
    this._title =     this._climateData.name

    // Assemble Subtitle
    this._subtitle =  this._climateData.location.DD
    if (this._climateData.elevation)
      this._subtitle += " | Elevation: "     + this._climateData.elevation
    if (this._climateData.climate_class)
      this._subtitle += " | Climate Class: " + this._climateData.climate_class
    this._subtitle +=   " | Years: "
                        + this._climateData.years[0] + "-"
                        + this._climateData.years[1]
      // TODO: gap years (appendix in this._climateData.years[2])

    // Get reference URL
    this._refURL = main.config.charts.refURL
  }

}
