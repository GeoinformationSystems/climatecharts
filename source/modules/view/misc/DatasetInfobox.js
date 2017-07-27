// ############################################################################
// DatasetsInfInfobox                                                     View
// ############################################################################
// This class is responsible simply for showing the metadata about the
// currently selected dataset in the infobox on the right.
// ############################################################################

class DatasetInfobox
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

    this._infobox = $('#dataset-info')
    this.disable()
  }


  // ==========================================================================
  // Enable / Disable infobox
  // ==========================================================================

  enable()
  {
    this._infobox.show()
  }

  disable()
  {
    this._infobox.hide()
  }


  // ==========================================================================
  // Update text for currently selected climate dataset
  // ==========================================================================

  updateDatasetInfo(dataset)
  {
    // Error handling: ensure that the infobox is visible
    this.enable()

    // Clear content
    this._infobox.empty()

    // Set content
    this._infobox.html(''
      + '<p class="datasets-title">'
      + this._main.config.datasetsInfobox.ref
      + '</p>'
      + '<p>'
      + dataset.description
      + '</p>'
      + '<p><a href="'
      + dataset.doi
      + '" target="_blank">'
      + dataset.doi
      + '</a></p>'
      + '<p class="datasets-title">'
      + this._main.config.datasetsInfobox.metadata
      + '</p>'
      + '<p>'
      + this._main.config.datasetsInfobox.resolution
      + ': '
      + dataset.raster_cell_size.lat
      + '° x '
      + dataset.raster_cell_size.lng
      + '°'
      + '</p>'
      + '<p>'
      + this._main.config.datasetsInfobox.time
      + ': '
      + dataset.time_period[0]
      + ' - '
      + dataset.time_period[1]
      + '</p>'
    )
  }


  // ==========================================================================
  // Update text for Weatherstations
  // ==========================================================================

  updateStationInfo(station)
  {
    // Error handling: ensure that the infobox is visible
    this.enable()

    // Clear content
    this._infobox.empty()

    // Set content
    this._infobox.html(''
      + '<p class="datasets-title">'
      + this._main.config.datasetsInfobox.ref
      + '</p>'
      + '<p>'
      + this._main.config.station.source.description
      + '</p>'
      + '<p><a href="'
      + this._main.config.station.source.link
      + '" target="_blank">'
      + this._main.config.station.source.link
      + '</a></p>'
      + '<p class="datasets-title">'
      + this._main.config.datasetsInfobox.metadata
      + '</p>'
      + '<p>'
      + this._main.config.datasetsInfobox.station
      + ': '
      + station.name
      + ', '
      + station.country
      + '</p>'
      + '<p>'
      + this._main.config.datasetsInfobox.time
      + ': '
      + station.min_year
      + ' - '
      + station.max_year
      + '</p>'
      // TODO: make table and distinguish between temp and prec
      // + '<p>'
      // + this._main.config.datasetsInfobox.coverage
      // + ': '
      // + this._main.modules.helpers.roundToDecimalPlace(
      //     station.coverage_rate*100, 1
      //   )
      // + ' %'
      // + '</p>'
      // + '<p>'
      // + this._main.config.datasetsInfobox.gap
      // + ': '
      // + station.largest_gap
      // + ' months'
      // + '</p>'
      // + '<p>'
      // + this._main.config.datasetsInfobox.missingMonths
      // + ': '
      // + station.missing_months
      // + ' months'
      // + '</p>'
    )
  }

}
