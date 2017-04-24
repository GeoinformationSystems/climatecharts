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
    // ------------------------------------------------------------------------
    // Variable Declaration & Initialization
    // ------------------------------------------------------------------------

    // Other modules
    this._locationController = main.modules.locationController

    // Leaflet base map
    this._map = new L.map(main.configs.mapContainer)
    this._map.setView(main.configs.startPos, main.configs.startZoom)

    // Leaflet marker
    // showing the current location the user selected
    this._marker = null

    // Leaflet rectangle
    // showing the raster cell the current climate data originates
    this._cell = null

    // Leaflet station
    // shows a weather station that can be (de)selected
    this._station = null

    // Base map styles: ESRI and OSM
		let baseMaps =
    {
			"ESRI_WorldMap": L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
    			maxZoom: 20,
    			attribution: 'Tiles &copy; ESRI'
        }
      ),
	    "OpenStreetMap": L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
    			maxZoom: 19,
    			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  			}
      )
		}
    baseMaps.ESRI_WorldMap.addTo(this._map)

    // Map interaction controls
		L.control.layers(baseMaps).addTo(this._map)

    // Map scale
		L.control.scale().addTo(this._map)


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
        this._locationController.setPosition(coords)
      }
    )
  }


  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

  makeCellVisible()
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
