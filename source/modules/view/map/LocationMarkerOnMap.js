// ############################################################################
// LocationMarkerOnMap                                                     View
// ############################################################################
// Shows the current location the user selected
// -> Origin of name and information of current location
// ############################################################################

class LocationMarkerOnMap
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
    this._map = this._main.modules.map.getMap()

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    // Show the current location the user selected
    // -> Leaflet marker
    this._marker = null
  }

  // ==========================================================================
  // Handle marker position on the map (set, reset, remove)
  // ==========================================================================

  isActive()
  {
    if (this._marker != null)
      return true
    else
      return false
  }

  set(coords)
  {
    this._marker = new L.marker()
    this._marker.setLatLng([coords.lat, coords.lng])
    this._marker.addTo(this._map)
  }

  reset(coords)
  {
    this._marker.setLatLng([coords.lat, coords.lng])
  }

  remove()
  {
    this._map.removeLayer(this._marker)
    this._marker = null
  }
}
