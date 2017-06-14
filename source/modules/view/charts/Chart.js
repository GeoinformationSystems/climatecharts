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
    this._chartName = chartName

    this._dimensions =  main.config.charts.dimensions
    this._margins =     main.config.charts.margins
    this._fontSizes =   main.config.charts.fontSizes
    this._chartMain =   main.config.charts[chartName]

    this._width  =      this._dimensions.width
    this._height =      this._dimensions.height

    this._climateData = climateData

    this._domElementCreator = new DOMElementCreator()


    // ------------------------------------------------------------------------
    // Setup chart
    // ------------------------------------------------------------------------

    this._setChartMetadata()
    this._setupContainer()
    this._writeMetadata()
    this._drawChart()
  }


  // ==========================================================================
  // Update climate data of chart
  // ==========================================================================

  updateClimate(climateData)
  {
    // Update model
    this._climateData = climateData

    // Clean view
    this._wrapperDiv.empty()

    // Reset view
    this._setChartMetadata()
    this._setupContainer()
    this._writeMetadata()
    this._drawChart()
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
  // Set Metadata
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
                        + this._climateData.years[0]
                        + "-"
                        + this._climateData.years[1]
      // TODO: gap years (appendix in this._climateData.years[2])

    // Get reference URL
    this._refURL = main.config.charts.refURL
  }


  // ==========================================================================
  // Setup chart container
  // ==========================================================================

  _setupContainer()
  {
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
      .attr("viewBox", ""
        + "0 0 "
        + this._dimensions.width
        + " "
        + this._dimensions.height
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
  }


  // ==========================================================================
  // Write chart-independent meta information
  // ==========================================================================

  _writeMetadata()
  {
    // Title
    this._chart.append("text")
      .attr("id", this._chartName + '-title')
      .attr("class", "info chart-title")
      .attr("x", this._width*2/5)
      .attr("y", this._margins.top*1/3-5)
      .attr("width", 0
        + this._margins.right
        - this._margins.rightS
      )
      .attr("text-anchor", "middle")
      .text(this._title)
      .call(this._wrap, this._width*2/3)

    this._titleDiv = $('#' + this._chartName + '-title')
    this._main.hub.onDiagramTitleChange(this._title)

    // Subtitle
    this._chart.append("text")
      .attr("class", "info chart-subtitle")
      .attr("x", this._width*2/5)
      .attr("y", this._margins.top*1/3+12)
      .attr("width", 0
        + this._margins.right
        - this._margins.rightS
      )
      .attr("text-anchor", "middle")
      .text(this._subtitle)
      .call(this._wrap, this._width*2/3)

    // Caption: Source link
    this._chart.append("text")
      .attr("class", "source")
      .attr("x", 10)
      .attr("y", this._height - 5)
      .attr("width", this._width)
      .style("cursor", "pointer")
      .style("font-size", this._fontSizes.source + "px")
      .style("opacity", 0.6)
      // .attr("link" + this._climateData.source_link)
      .text("Data Source: " + this._climateData.source)
      .call(this._wrap, this._width - 100, " ")
      .on("click", () => { window.open(this.link) })

    // Caption: Reference URL
    this._chart.append("text")
      .append("tspan")
      .attr("class", "source")
      .attr("x", this._width - 10)
      .attr("y", this._height - 5)
      .style("text-anchor", "end")
      .style("font-size", this._fontSizes.source + "px")
      .style("opacity", 0.6)
      .text(this._refURL)
  }


  // ==========================================================================
  // Wrap text input string and split into multiple lines if necessary
  // ==========================================================================

  _wrap(text, width, char)
  {
    // TODO: fix
    return null

    text.each( () =>
      {
        let text = d3.select(this)
        let words = text.text().split(char).reverse()
        let word
        let line = []
        let lineNumber = 0
        let lineHeight = 1.1; // ems
        let x = text.attr("x")
        let y = text.attr("y")
        let dy = 0; //parseFloat(text.attr("dy")),
        let tspan = text.text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
        while (word = words.pop())
        {
          line.push(word)
          tspan.text(line.join(char))
          if (tspan.node().getComputedTextLength() > width)
          {
            line.pop()
            tspan.text(line.join(char))
            line = [word]
            tspan = text.append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word)
          }
        }
      }
    )
  }


}
