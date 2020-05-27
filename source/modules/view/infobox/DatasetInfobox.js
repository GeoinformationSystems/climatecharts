// ############################################################################
// DatasetsInfInfobox                                                     View
// ############################################################################
// Shows the metadata of the currently selected dataset or the weather station
// in a popup/tooltip - toggled by an info button.
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

    this._datasetTooltip = $('#dataset-tooltip');

    //Setup info button and related Bootstrap popover 
    this._setupTooltip();
    
  }

  // ==========================================================================
  // Update text for currently selected climate dataset
  // ==========================================================================

  updateDatasetInfo(dataset)
  {
    // Preparing links in case of multiple DOIs for one dataset
    let doiLinks = "";
    // Splitting multiple DOIs in catalog by comma 
    let doiSplit = dataset.doi.split(',');
    for(var doiIDx in doiSplit){
        if (!doiSplit[doiIDx].startsWith('http'))
            doiSplit[doiIDx] = 'http://' + doiSplit[doiIDx].trim();
        doiLinks += '<a href="' + doiSplit[doiIDx] + '" target="_blank">' + doiSplit[doiIDx] + '</a><br />'
    }

    // If popover is visible: close popover tooltip 
    if(this._datasetTooltip.data('bs.popover').tip().hasClass('in'))
      this._datasetTooltip.click();

    // retrieve display of metadata from tab "Dataset & Software"
    this._datasetTooltip.attr('data-content',''
      + $('#' + dataset.id + '-info').html()
    );
  }


  // ==========================================================================
  // Update text for Weatherstations
  // ==========================================================================

  updateStationInfo(station)
  {
    // If popover is visible: close popover tooltip 
    if(this._datasetTooltip.data('bs.popover').tip().hasClass('in'))
      this._datasetTooltip.click();

    // Set tooltip content
    $('#dataset-tooltip').attr('data-content',''
      + '<p class="datasets-name">'
      + this._main.config.station.source.name
      + '</p>'
      + '<p class="datasets-title">'
      + this._main.config.datasetsInfobox.ref
      + '</p>'
      + '<p class="datasets-text">'
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
      + '<br />'
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

  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Setup info button and related Bootstrap popover  
  // ==========================================================================

  _setupTooltip()
  {
    // Initialize popover for display of dataset info in tooltip & bind to main-container
    this._datasetTooltip.popover({
      container: '#main-container'
    });

    this._datasetTooltip.on("click", () => {

      if(this._datasetTooltip.data('bs.popover').tip().hasClass('in')) 
      {
        this._datasetTooltip.attr('class', 'tooltip-active');
        // this._datasetTooltip.addClass('tooltip-active');
        this._datasetTooltip.html('<i class="fas fa-times-circle" aria-hidden="true"></i>');
      }
      else
      {
        this._datasetTooltip.attr('class', 'tooltip-inactive');
        // this._datasetTooltip.removeClass('tooltip-active');
        this._datasetTooltip.html('<i class="fas fa-info-circle" aria-hidden="true"></i>');
      }
    });
  }

}
