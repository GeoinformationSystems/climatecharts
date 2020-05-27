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

    this._userTitle = $('#user-title');

    //this._chartTitleDiv = $('#user-title');
    this._setButton = $('#set-diagram-title');

    // ------------------------------------------------------------------------
    // Event handling
    // ------------------------------------------------------------------------

    this._setButton.click( (e) =>
      {
        e.preventDefault();
        let title = this._userTitle.val();
        
        if (this._main.modules.helpers.checkIfString(title)){
          this._main.hub.onDiagramTitleChange(title);
        }
      }
    );
  }


  // ==========================================================================
  // Update the title in the box
  // ==========================================================================

  update(title)
  {
    this._userTitle.val(title)
  }
}
