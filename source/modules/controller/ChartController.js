// ############################################################################
// ChartController                                                   Controller
// ############################################################################
// Manages the currently active charts in the visualization. Receives new
// ClimateData from ClimateDataController or a new chart title from
// ChartTitleSetter and updates the visualization.
// Three types of graphs:
// - ClimateChart
// - DistributionChart
// - AvailabilityChart
// ############################################################################


class ChartController
{

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main)
  {
    this._main = main

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    // all charts
    this._charts = []

    // Staus variable: charts currently active?
    this._chartsAreActive   = false

    // Infobox about climate chart
    // -> only visible if charts are not active
    this._chartInfo = $('#chart-info')
  }


  // ==========================================================================
  // Update the climate data either from click on new weather station or
  // from click on a new climate cell on the map
  // ==========================================================================

  updateClimate(climateData)
  {
    // Create new charts
    if (!this._chartsAreActive)
    {
      this._chartInfo.hide()
      this._charts =
        [
          new ClimateChart(this._main, climateData),
          // new DistributionChart(this._main, climateData),
          // new AvailabilityChart(this._main, climateData)
        ]
      this._chartsAreActive = true
    }

    // Update existing charts
    else
      for (let chart of this._charts)
        chart.updateClimate(climateData)
  }


  // ==========================================================================
  // Update the title of the charts
  // ==========================================================================

  updateTitle(title)
  {
    if (this._chartsAreActive)
      for (let chart of this._charts)
        chart.updateTitle(title)
  }


  // ==========================================================================
  // Clear all charts
  // ==========================================================================

  clear()
  {
    if (this._chartsAreActive)
      for (let chart of this._charts)
        chart.remove()

    this._chartsAreActive = false
  }



  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

}
