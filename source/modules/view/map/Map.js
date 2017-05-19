// ############################################################################
// MAP                                                                     View
// ############################################################################
// Manages the map in the viewport
// - Based on Leaflet.js
// - Dealing with user interaction
// ############################################################################


class Map
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

    // Leaflet map with initial position / zoom
    this._map = new L.Map(main.config.mapContainer)
    this._map.setView(main.config.startPos, main.config.startZoom)

    // First base map
    main.config.tileLayers[0].addTo(this._map)

    // Map interaction controls: layer selection and scale
    L.control.layers(main.config.tileLayers).addTo(this._map)
    L.control.scale().addTo(this._map)

    // Problem: for some reason this code only leads tiles from the northern
    // hemisphere. Only after window resize everything loads
    // Hack: manual resize event :/ -> not nice, but works!
    // TODO: fix it...
    this._map._onResize()


    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

		// Handle click event on map
    // distinguish between click on station or directly on map
    this._map.on("click", evt =>
      {
        let coords =
        this._main.modules.mapController.setLocation(
          {
            lat: evt.latlng.lat,
            lng: evt.latlng.lng
          }
        )
      }
    )
  }

  // ==========================================================================
  // Getter
  // ==========================================================================

  getMap()
  {
    return this._map
  }
}
