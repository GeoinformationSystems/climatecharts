// ############################################################################
// CoordinatesInInfobox                                                   View
// ############################################################################
// This class is responsible simply for showing the currently selected
// coordinates in the infobox on the right side.
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
    this._main = main

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------
    this._latDiv = $('#lat')
    this._lngDiv = $('#lng')

    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

    // TODO: also accept writing coordinates in here?
  }


  // ==========================================================================
  // Write the coordinates in the infobox
  // ==========================================================================

  update(coords)
  {
    this._latDiv.val(this._formatCoordinate(coords.lat))
    this._lngDiv.val(this._formatCoordinate(coords.lng))
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  _formatCoordinate(val)
  {
    let factor = Math.pow(10, this._main.config.coordinatesDecimalPlaces)
    let rounded = Math.round(val*factor)/factor
    return rounded.toString()
  }

}
