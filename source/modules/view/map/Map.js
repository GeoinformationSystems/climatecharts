// ############################################################################
// Map                                                                     View
// ############################################################################
// Manages the map in the main part of the UI using Leaflet.js.
// Handles with user interactions on the maps.
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
    this._main = main;

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    // Leaflet map with initial position / zoom
    this._map = new L.Map(
      main.config.map.container,
      {
        center:     main.config.map.startPos,
        zoom:       main.config.map.startZoom,
        maxBounds:  [[-LAT_EXTENT, -LNG_EXTENT], [LAT_EXTENT, LNG_EXTENT]],
        maxBoundsViscosity: main.config.map.maxBoundsViscosity,
      }
    );

    // First base map
    let tileLayers = main.config.map.tileLayers;
    tileLayers[Object.keys(tileLayers)[0]].addTo(this._map);

    // Map interaction controls: layer selection and scale
    L.control.layers(tileLayers).addTo(this._map);
    L.control.scale().addTo(this._map);

    // Problem: for some reason this code only loads tiles from the northern
    // hemisphere. Only after window resize everything loads
    // Hack: manual resize event :/ -> not nice, but works!
    // TODO: fix it...
    this._map._onResize();


    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

		// Handle click event on map
    // -> distinguish between click on station or directly on map
    this._map.on("click", evt =>
      {
        let coords = this._main.modules.mapController.setLocation(
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
