// ############################################################################
// LocationMarkerOnMap                                                     View
// ############################################################################
// Shows the current location that the user selected in the ClimateCell mode.
// This is the origin of the location of the raster cell that determines the
// climate cell that is loaded from the server.
// The location is visualized by a leaflet marker.
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
    this._main = main;
    this._map = this._main.modules.map.getMap();

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

  set(coords)
  {
    if (!this._marker)
    {
      this._marker = new L.marker([coords.lat, coords.lng]);
      this._marker.addTo(this._map)
    }
    else
      this._marker.setLatLng([coords.lat, coords.lng])
  }

  remove()
  {
    if (this._marker)
    {
      this._map.removeLayer(this._marker);
      this._marker = null
    }
  }

}
