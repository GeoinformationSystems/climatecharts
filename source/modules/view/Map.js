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

    // Climate marker:
    // showing the current location the user selected
    // -> Leaflet marker
    this._marker = null

    // Climate cell:
    // showing the raster cell the current climate data originates from
    // -> Leaflet rectangle
    this._cell = null


    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

		// Update coordinate variables if the user clicked on the map.
    this._map.on("click", e =>
      {
        // Get original value from the map
        // -> where the user clicked and the marker will be placed
        let coords = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        }

        // Tell controller that location has changed
        this._main.modules.locationController.setLocation(coords)
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


  // ==========================================================================
  // Handle marker position on the map (set, reset, remove)
  // ==========================================================================

  setMarker(coords)
  {
    this._marker = new L.marker()
    this._marker.setLatLng([coords.lat, coords.lng])
    this._marker.addTo(this._map)
  }

  resetMarker(coords)
  {
    this._marker.setLatLng([coords.lat, coords.lng])
  }

  removeMarker()
  {
    this._map.removeLayer(this._marker)
    this._marker = null
  }


  // ==========================================================================
  // Handle climate cell on the map (set, reset, remove)
  // ==========================================================================

  setCell(bounds)
  {
    this._cell = new L.rectangle(bounds, main.config.cellSytle)
    this._cell.addTo(this._map)
  }

  resetCell(bounds)
  {
    this._cell.setBounds(bounds)
  }

  removeCell()
  {
    this._map.removeLayer(this._cell)
    this._cell = null
  }

  // ==========================================================================
  // Add / remove layer on map
  // ==========================================================================

  addLayer(layer)
  {
    layer.addTo(this._map)
  }

  removeLayer(layer)
  {
    this._map.removeLayer(layer)
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  _makeCellVisible()
  {
    this._cell.bringToBack()

    // Idea: The user should always see the full extent of the climate cell
    // => determine if the bounds of the cell are fully visible in the viewport
    let mapBounds = this._map.getBounds()
    let cellBounds = this._cell.getBounds()

    // If the climate cell is completely in the viewport
    // i.e. no bound of the cell is visible
    // => zoom out to fit the bounds
    if (cellBounds.contains(mapBounds))
      this._map.fitBounds(cellBounds)

    // If not, check if the cell is partially covered by the map
    // i.e. the map does not contain the full extent of the cell
    // => move the map so the cell is completely visible
    else if (!mapBounds.contains(cellBounds))
      this._map.fitBounds(cellBounds)

    // otherwise the cell is completely visible, so there is nothing to do
  }

}
