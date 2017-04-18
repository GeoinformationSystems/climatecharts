// ############################################################################
// MAP
// ############################################################################
// Manages the map in the viewport
// - Based on Leaflet.js
// - Dealing with user interaction
// ############################################################################

var Map =
{
  // ##########################################################################
  // PRIVATE MEMBER VARIABLES / CONSTANTS
  // ##########################################################################

  "map":              null,   // leaflet map

  "lat_extent":       90,     // min/max value for latitude
  "lng_extent":       180,    // min/max value for longitude


  // ##########################################################################
  // PUBLIC MEMBER FUNCTIONS
  // ##########################################################################

  "construct": function()
  {
		Map.map = new L.map("map");
		Map.map.setView([40,10], 2);
		Map.map.on("click", updatePosition);

		var ESRI = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 20,
			attribution: 'Tiles &copy; ESRI'
    }).addTo(Map.map);

		var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
  			maxZoom: 19,
  			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}
    );

		var baseMaps =
    {
			"ESRI World Map": ESRI,
			"OpenStreetMap": OpenStreetMap_Mapnik
		}

		L.control.layers(baseMaps).addTo(Map.map);
		L.control.scale().addTo(Map.map);

		// Update coordinate variables if the user clicked on the map.
		function updatePosition (e)
    {
      // original value from the map
      // -> where the user clicked and the marker will be placed
      var latOrig = e.latlng.lat;
      var lngOrig = e.latlng.lng;

      // map can be infinitely panned in x-direction
      // => real value stripped to the extend of geographic coordinate system
      var latReal = latOrig;
      while (latReal < -LAT_EXTENT)
        latReal += LAT_EXTENT*2;
      while (latReal > LAT_EXTENT)
        latReal -= LAT_EXTENT*2;

      var lngReal = lngOrig;
      while (lngReal < -LNG_EXTENT)
        lngReal += LNG_EXTENT*2;
      while (lngReal > LNG_EXTENT)
        lngReal -= LNG_EXTENT*2;

      // set lat/lng coordinates
      UI.setPosition(latReal, lngReal);
      // set marker to original position, because it could be on the "next" map
      UI.setMarker(latOrig, lngOrig);

      // cleanup current raster cell or weather station
      UI.deactivateClimateCell();
      WeatherStations.deactivateStation();

      // visualize the current raster cell the climate data is from
      UI.activateClimateCell(latReal, lngReal);

			// create chart immediately
			UI.createCharts();
		};

		// Update coordinate variables if the user typed in coordinate values
		// manually.
		$(".coordinates").change(function ()
    {
      // original lat/lng values that user typed into the box
      var latTyped = parseFloat($("#lat").val());
      var lngTyped = parseFloat($("#lng").val());

      // stop if one of the values is not given
      if (isNaN(latTyped) || isNaN(lngTyped))
        return null;

      // strip to extend of geographic coordinate system
      var latReal = latTyped;
      while (latReal < -LAT_EXTENT)
        latReal += LAT_EXTENT*2;

      while (latReal > LAT_EXTENT)
        latReal -= LAT_EXTENT*2;

      var lngReal = lngTyped;
      while (lngReal < -LNG_EXTENT)
        lngReal += LNG_EXTENT*2;

      while (lngReal > LNG_EXTENT)
        lngReal -= LNG_EXTENT*2;

      // hack "event" object to hand it into updatePosition function
      // act as if user clicked on the map
      var e = {latlng: {lat: latReal, lng: lngReal} };
      UI.updatePosition(e);
		});

    // update chart if user chose to use a different title for the diagrams
    $('#user-title').change(UI.setDiagramTitle);
  },

  // ##########################################################################
  // PRIVATE MEMBER FUNCTIONS
  // ##########################################################################

}
