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
    // Setup container
    // ------------------------------------------------------------------------

    let parentDiv = document.getElementById(main.config.charts.container)

    let wrapperDiv = this._domElementCreator.create(
      'div', this._chartMain.container,             // id
      [this._main.config.charts.className, 'box']   // classes
    )
    parentDiv.appendChild(wrapperDiv)

    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------


  }


  // ==========================================================================
  // Update chart
  // ==========================================================================

  update(climateData)
  {
    this._climateData = climateData

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



}
