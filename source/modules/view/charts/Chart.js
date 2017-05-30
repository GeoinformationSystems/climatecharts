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

    this._chartMain = main.config.charts[chartName]
    this._climateData = climateData
    this._setChartMetadata()


    // ------------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------------

    this._domElementCreator = new DOMElementCreator()


    // ------------------------------------------------------------------------
    // Setup container
    // ------------------------------------------------------------------------

    let parentDiv = document.getElementById(main.config.charts.parentContainer)

    let wrapperDiv = this._domElementCreator.create(
      'div', this._chartMain.container+"-wrapper",  // id
      [main.config.charts.className, 'box']         // classes
    )
    parentDiv.appendChild(wrapperDiv)

    this._wrapperDiv = $(wrapperDiv)

    console.log("created " + this._chartMain.container);
  }


  // ==========================================================================
  // Update chart
  // ==========================================================================

  update(climateData)
  {
    // Update model
    this._climateData = climateData
    this._setChartMetadata()

    // Clear current container
    this._wrapperDiv.empty()

    console.log("updated " + this._chartMain.container);
  }


  // ==========================================================================
  // Remove chart
  // ==========================================================================

  remove()
  {
    this._climateData = null

    console.log("removed " + this._chartMain.container);
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
