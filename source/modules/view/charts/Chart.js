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
    // Setup visualization
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

    // Chart title container
    this._titleDiv = null

    // Finally draw the chart
    this._drawChart()

    // Reset the diagram title
    this._main.hub.onDiagramTitleChange(this._title)
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
