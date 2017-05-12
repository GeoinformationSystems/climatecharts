// ############################################################################
// LocationMarkerController                                          Controller
// ############################################################################
// Manages the current location marker
// ############################################################################

class LocationMarkerController
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

    this._markerActive = false

    // Current geographic coordinates (lat and lng)
    this._coords =
    {
      lat: null,
      lng: null,
    }
  }


  // ==========================================================================
  // Setup / Move marker
  // ==========================================================================

  set(coords)
  {
    if (this._markerActive)
      this._main.modules.locationMarkerOnMap.reset(coords)
    else
    {
      this._main.modules.locationMarkerOnMap.set(coords)
      this._markerActive = true
    }
  }


  // ==========================================================================
  // Cleanup
  // ==========================================================================

  cleanup()
  {
    if (this._markerActive)
    {
      this._main.modules.locationMarkerOnMap.remove()
      this._markerActive = false
    }
  }


  // ==========================================================================
  // Get name of current location
  // ==========================================================================

  getName()
  {
    return this._requestGazetteer('N')
  }


  // ==========================================================================
  // Get elevation of current location
  // ==========================================================================

  getElevation()
  {
    return this._requestGazetteer('E')
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Request gazetteer for mode 'N' = name or 'E' = elevation
  // ==========================================================================

  _requestGazetteer(mode)
  {
    let url = ENDPOINTS.gazetteer
    if (mode == 'N')
      url += "/getName"
    else if (mode == 'E')
      url += "/getElevation"
    else // error
      return null

    return($.get(url,
        {
          lat: this._coords.lat,
          lng: this._coords.lng
        }
      ).fail(function(jqXHR, textStatus, errorThrown)
        {
          console.error("No elevation found");
          console.error(jqXHR);
          console.error(textStatus);
          console.error(errorThrown);
        }
      )
    )
  }

}
