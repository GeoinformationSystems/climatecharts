// ############################################################################
// ClimateDatasetsInList                                                  View
// ############################################################################
// Manages list of Climate datasets in dropdown list
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
    this._main = main

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._datasetList = $('#datasets')
    this._parentContainer = $('#datasets-in-list')

    this._isEnabled = true


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
    )

  }


  // ==========================================================================
  // Enable / Disable list
  // ==========================================================================

  enable()
  {
    if (!this._isEnabled)
      this._parentContainer.show()

    this._isEnabled = true
  }

  disable()
  {
    if (this._isEnabled)
      this._parentContainer.hide()

    this._isEnabled = false
  }


  // ==========================================================================
  // Add / Remove element to / from list
  // ==========================================================================

  add(climateDataset, isFirst)
  {
    this._datasetList.append(
        "<option "
      + "id='"    + climateDataset.id     + "' "
      + "value='" + climateDataset.name   + "' "
      + ">"
      + climateDataset.name
      + "</option>"
    )
  }

  remove(climateDataset)
  {
    $('#'+climateDataset.id).remove()
  }


  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

}
