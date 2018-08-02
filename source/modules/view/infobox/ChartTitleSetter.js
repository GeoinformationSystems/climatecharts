// ############################################################################
// ChartTitleSetter                                                       View
// ############################################################################
// Manages title of the visualization charts. The title can be set by changing
// the text in the text field and clicking the 'Write'-Button
// ############################################################################


class ChartTitleSetter
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
    // Member variables
    // ------------------------------------------------------------------------

    this._chartTitleDiv = $('#user-title');

    // ------------------------------------------------------------------------
    // Event handling
    // ------------------------------------------------------------------------

    // Type new name => write into diagrams
    this._chartTitleDiv.change( () =>
      {
        this._main.hub.onDiagramTitleChange(this._chartTitleDiv.val())
      }
    )
  }


  // ==========================================================================
  // Update the title in the box
  // ==========================================================================

  update(title)
  {
    this._chartTitleDiv.val(title)
  }
}
