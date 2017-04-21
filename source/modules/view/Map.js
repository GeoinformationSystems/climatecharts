// ############################################################################
// MAP                                                                     View
// ############################################################################
// Manages the map in the viewport
// - Based on Leaflet.js
// - Dealing with user interaction
// ############################################################################

var Map =
{
  // ##########################################################################
  // PRIVATE MEMBER VARIABLES
  // ##########################################################################

  // leaflet base map
  "map": null,

  // leaflet marker
  // showing the current location the user selected
  "marker": null,

  // leaflet rectangle
  // showing the raster cell the current climate data originates
  "cell": null,

  // leaflet station
  // shows a weather station that can be (de)selected
  "station": null,


  // ##########################################################################
  // PUBLIC MEMBER FUNCTIONS
  // ##########################################################################


  // ==========================================================================
  // Constructor
  // ==========================================================================
  "construct": function()
  {
    // ------------------------------------------------------------------------
    // Initialization
    // ------------------------------------------------------------------------

    // Leaflet map
		this.map = new L.map("map");
		this.map.setView([40,10], 2);
		this.map.on("click", updatePosition);

    // Base map styles: ESRI and OSM
		var ESRI = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 20,
			attribution: 'Tiles &copy; ESRI'
    }).addTo(this.map);

		var OpenStreetMapMapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
  			maxZoom: 19,
  			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}
    );

		var baseMaps =
    {
			"ESRI World Map": ESRI,
			"OpenStreetMap": OpenStreetMapMapnik
		}

    // Map interaction controls
		L.control.layers(baseMaps).addTo(this.map);

    // Map scale
		L.control.scale().addTo(this.map);

    // ------------------------------------------------------------------------
    // User Interaction
    // ------------------------------------------------------------------------

		// Update coordinate variables if the user clicked on the map.
		function updatePosition (e)
    {
      // Get original value from the map
      // -> where the user clicked and the marker will be placed
      var coords = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }

      // Tell controller that location has changed
      LocationController.setPosition(coords)
    };

  },


  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

  "makeCellVisible": function()
  {
    this.cell.bringToBack()

    // Idea: The user should always see the full extent of the climate cell
    // => determine if the bounds of the cell are fully visible in the viewport
    var mapBounds = this.map.getBounds();
    var cellBounds = this.cell.getBounds();

    // Decision tree
    // If the climate cell is completely in the viewport
    // i.e. no bound of the cell is visible
    // => zoom out to fit the bounds
    if (cellBounds.contains(mapBounds))
    {
      this.map.fitBounds(cellBounds);
    }
    // If not, check if the cell is partially covered by the map
    // i.e. the map does not contain the full extent of the cell
    // => move the map so the cell is completely visible
    else if (!mapBounds.contains(cellBounds))
    {
      this.map.fitBounds(cellBounds);
    }
    // otherwise the cell is completely visible, so there is nothing to do
  }

}
