// ############################################################################
// DatasetsInfInfobox                                                     View
// ############################################################################
// Shows the metadata of the currently selected dataset or the weather station
// in the infobox on the right.
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
    this._main = main;

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._infobox = $('#dataset-info');
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
    this.enable();

    // Clear content
    this._infobox.empty();

    // Preparing links in case of multiple DOIs for one dataset
    let doiLinks = "";
    // Splitting multiple DOIs in catalog by comma 
    let doiSplit = dataset.doi.split(',');
    for(var doiIDx in doiSplit){
        if (!doiSplit[doiIDx].startsWith('http'))
            doiSplit[doiIDx] = 'http://' + doiSplit[doiIDx].trim();
        doiLinks += '<a href="' + doiSplit[doiIDx] + '" target="_blank">' + doiSplit[doiIDx] + '</a><br />'
    }

    // Set content
    this._infobox.html(''
      + '<p class="datasets-title">'
      + this._main.config.datasetsInfobox.ref
      + '</p>'
      + '<p>'
      + dataset.description
      + '</p>'
      + '<p>'
      + doiLinks
      + '</p>'
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
    this.enable();

    // Clear content
    this._infobox.empty();

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

      // TODO: make table to distinguish between temp and prec
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
