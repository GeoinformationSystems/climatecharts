// ############################################################################
// CoordinatesInInfobox                                                   View
// ############################################################################
// Shows the currently selected coordinates in the infobox on the right side.
// In the ClimateCell mode the user can also set the coordinates manually.
// ############################################################################


class CoordinatesInInfobox
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

    this._latDiv = $('#lat');
    this._lngDiv = $('#lng');

    this._setButton = $('#set-coordinates');

    this._isEnabled = true;


    // ------------------------------------------------------------------------
    // User Interaction: Click on "Set" button
    // Spread the world: new coordinates
    // ------------------------------------------------------------------------

    this._setButton.click( (e) =>
      {
        e.preventDefault();
        let coords =
        {
          lat : parseFloat(this._latDiv.val()),
          lng : parseFloat(this._lngDiv.val())
        };
        if (coords.lat && coords.lng)
          this._main.modules.mapController.setLocation(coords)
      }
    );

    // Trigger click on "Set" button
    // by pressing Enter key in either coordinate box
    this._latDiv.keyup( (evt) =>
      {
        if (evt.keyCode == 13)  // Enter
          this._setButton.click()
      }
    );
    this._lngDiv.keyup( (evt) =>
      {
        if (evt.keyCode == 13)  // Enter
          this._setButton.click()
      }
    )

  }


  // ==========================================================================
  // Enable / Disable coordinate selection
  // ==========================================================================

  enable()
  {
    if (!this._isEnabled)
    {
      this._setButton.show();
      this._latDiv.removeAttr('disabled');
      this._lngDiv.removeAttr('disabled')
    }

    this._isEnabled = true
  }

  disable()
  {
    if (this._isEnabled)
    {
      this._setButton.hide();
      this._latDiv.attr('disabled', 'disabled');
      this._lngDiv.attr('disabled', 'disabled');
    }

    this._isEnabled = false
  }


  // ==========================================================================
  // Write the coordinates in the infobox
  // ==========================================================================

  update(coords)
  {
    this._latDiv.val(this._formatCoordinate(coords.lat));
    this._lngDiv.val(this._formatCoordinate(coords.lng))
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  _formatCoordinate(val)
  {
    let factor = Math.pow(10, this._main.config.coordinates.decimalPlaces);
    let rounded = Math.round(val*factor)/factor;
    return rounded.toString()
  }

}
