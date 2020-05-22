// ############################################################################
// ClimateDatasetsInList                                                  View
// ############################################################################
// Manages the Climate datasets in a dropdown list in the ClimateCell mode
// and disables the list in the WeatherStation mode.
// ############################################################################


class ClimateDatasetsInList
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

    this._datasetList = $('#datasets');
    this._datasetsTitle = $('#dataset-name');

    this._isEnabled = true;


    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

    // Click on list item => tell controller to select it
    $(document).on('change', '#datasets', () =>
      {
        this._main.modules.climateDatasetController.selectByName(
          this._datasetList.val()
        )
      }
    );

  }


  // ==========================================================================
  // Enable / Disable list
  // ==========================================================================

  enable()
  {
    if (!this._isEnabled)
      this._datasetList.prop('disabled', false);

    this._isEnabled = true;
  }

  disable()
  {
    if (this._isEnabled)
      this._datasetList.prop('disabled', true);

    this._isEnabled = false;
  }


  // ==========================================================================
  // Set / Remove title for WeatherStations mode
  // ==========================================================================

  setStationsTitle()
  {
    let link = $('<a/>');
    link.attr('href', 'http://' + this._main.config.station.source.link);
    link.attr('target', '_blank');
    link.text(this._main.config.station.source.name);

    this._datasetsTitle.html(link);
  }

  removeStationsTitle()
  {
    this._datasetsTitle.html("");
  }


  // ==========================================================================
  // Add / Remove element to / from list
  // ==========================================================================

  add(climateDataset)
  {
    this._datasetList.append(
        "<option "
      + "id='"    + climateDataset.id     + "' "
      + "value='" + climateDataset.name   + "' "
      + ">"
      + climateDataset.name
      + "</option>"
    );
  }

  remove(climateDataset)
  {
    $('#'+climateDataset.id).remove();
  }

}
