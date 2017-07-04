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

    // Get charts main -> generic information for all charts
    // get initial dimensions as a deep copy to change them later on
    this._chartsMain = main.config.charts

    // Get chart main -> specific information for this chart
    this._chartName = chartName
    this._chartMain = null
    for (let chart of main.config.charts.charts)
      if (chart.name == chartName)
        this._chartMain = chart

    // Actual chart data
    this._climateData = climateData

    // Helper
    this._domElementCreator = new DOMElementCreator()


    // ------------------------------------------------------------------------
    // Setup chart
    // ------------------------------------------------------------------------

    this._setChartMetadata()
    this._setupContainer()
    this._setupHeaderFooter()
    // this._drawChart()
  }


  // ==========================================================================
  // Update climate data of chart
  // ==========================================================================

  updateClimate(climateData)
  {
    // Update model
    this._climateData = climateData

    // Clean view
    this._wrapperDiv.remove()

    // Reset view
    this._setChartMetadata()
    this._setupContainer()
    this._setupHeaderFooter()
    // this._drawChart()
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
    this._title = this._climateData.name

    // Assemble subtitle (location | elevation | climate class | years)
    this._subtitle = this._climateData.location.DD
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
    this._refURL = this._chartsMain.referenceURL
  }


  // ==========================================================================
  // Setup chart container
  // ==========================================================================

  _setupContainer()
  {
    /**
      STRUCTURE:
      climate-chart, distribution-chart or availability-chart
      main-container                    // parent div for all charts
      |- #climate-chart-wrapper         // div wrapper for climate chart
        |- #climate-chart .chart-root   // svg root
          |- .chart-header .chart-title
          |- .chart-header .chart-subtitle
          |- .chart-buttons
          |- .chart-main
          |- .chart-source
          |- .chart-reference
    **/


    // Parent container in which chart wrapper is embedded
    let parentDiv = document.getElementById(
      this._chartsMain.parentContainer
    )

    // Wrapper that directly contains the svg root of the chart
    let wrapperDiv = this._domElementCreator.create(
      'div',                              // element
      this._chartMain.name + '-wrapper',  // id
      [this._chartMain.name, 'box']       // classes
    )
    parentDiv.appendChild(wrapperDiv)
    this._wrapperDiv = $('#' + this._chartMain.name + '-wrapper')
    this._wrapperDiv.css('height', this._chartsMain.structure.full.height)

    // Append chart element to parent container and set basic styles.
    // -> check if chart already exists, otherwise create it
    this._chart = d3.select(wrapperDiv)
      .append('svg')
      .attr('id', this._chartMain.name)
      .attr('version', 1.1)
      .attr('xmlns', "http://www.w3.org/2000/svg")
      .attr('preserveAspectRatio', 'xMinYMin meet')
      // .attr('viewBox', ''
      //   + '0 0 '  + this._chartsMain.structure.full.width
      //   + ' '     + this._chartsMain.structure.full.height
      // )
      .attr('width',  this._chartsMain.structure.full.width)
      .attr('height', this._chartsMain.structure.full.height)
      // for compatibility with IE, this has to be here. But just forget about the actual number, it is a max value, it does not matter...
      // .classed('svg-container', true) //container class to make it responsive
      // .classed('svg-content-responsive', true)
      .style('font-size',       '15px')
      .style('font-family',     'Arial, sans-serif')
      .style('font-style',      'normal')
      .style('font-variant',    'normal')
      .style('font-weight',     'normal')
      .style('text-rendering',  'optimizeLegibility')
      .style('shape-rendering', 'default')
      .style('background-color','transparent')

    // Final dimensions of the main chart area
    this._mainDimensions = {
      left : ( 0
        + this._chartsMain.structure.main.left
      ),
      top : ( 0
        + this._chartsMain.structure.main.top
      ),
      right : ( 0
        + this._chartsMain.structure.full.width
      ),
      bottom : ( 0
        + this._chartsMain.structure.full.height
        - this._chartsMain.structure.main.top
        - this._chartsMain.structure.main.bottom
      ),
    }

    this._mainDimensions.width = 0
      + this._mainDimensions.right
      - this._mainDimensions.left
    this._mainDimensions.height = 0
      + this._mainDimensions.bottom
      - this._mainDimensions.top
  }


  // ==========================================================================
  // Write chart-independent meta information
  // ==========================================================================

  _setupHeaderFooter()
  {
    // Title
    this._chart.append("text")
      .attr("id", this._chartName + '-title')
      .attr("class", "chart-header chart-title")
      .attr("x", this._chartsMain.structure.title.left)
      .attr("y", this._chartsMain.structure.title.top)
      .attr("text-anchor", "middle")
      .text(this._title)
      // .call(this._wrap, this._width*2/3)

    this._titleDiv = $('#' + this._chartName + '-title')
    this._main.hub.onDiagramTitleChange(this._title)

    // Subtitle
    this._chart.append("text")
      .attr("class", "chart-header chart-subtitle")
      .attr("x", this._chartsMain.structure.subtitle.left)
      .attr("y", this._chartsMain.structure.subtitle.top)
      .attr("text-anchor", "middle")
      .text(this._subtitle)
      // .call(this._wrap, this._width*2/3)

    // Caption: Source link
    this._chart.append("text")
      .attr("class", "source")
      .attr("x", 0
        + this._chartsMain.structure.source.left
        + this._chartsMain.structure.full.padding
      )
      .attr("y", this._chartsMain.structure.source.top)
      .style("cursor", "pointer")
      .style("font-size", this._chartsMain.fontSizes.source + "px")
      .style("opacity", this._chartsMain.footerOpacity)
      // .attr("link" + this._climateData.source_link)
      .text("Data Source: " + this._climateData.source)
      // .call(this._wrap, this._width - 100, " ")
      .on("click", () => { window.open(this.link) })

    // Caption: Reference URL
    this._chart.append("text")
      .append("tspan")
      .attr("class", "source")
      .attr("x", 0
        + this._chartsMain.structure.reference.right
        - this._chartsMain.structure.full.padding
      )
      .attr("y", this._chartsMain.structure.reference.top)
      .style("text-anchor", "end")
      .style("font-size", this._chartsMain.fontSizes.source + "px")
      .style("opacity", this._chartsMain.footerOpacity)
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
