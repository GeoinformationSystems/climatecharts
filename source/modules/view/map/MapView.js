// ############################################################################
// Map                                                                     View
// ############################################################################
// Manages the map in the main part of the UI using Leaflet.js.
// Handles with user interactions on the maps.
// ############################################################################


class MapView
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
    this._title = null;
    this._drawPopup = false;
    this._noLinesOnMap = true;
    this._lastLocationCounter= 0;
    this._lastCoords =
      {
        lat: null,
        lng: null
      };  
    this._profileCoordCollection=[];

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

    this._profileGroup = L.layerGroup().addTo(this._map);

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
        this._drawPopup = true;

        //  update current location
        this._main.modules.mapController.setLocation(
          {
            lat: evt.latlng.lat,
            lng: evt.latlng.lng
          });  

        this._lastCoords = evt.latlng; 
    })
  }

  
  // ==========================================================================
  // create popup
  // ==========================================================================
  createPopup(container, climateD, isStation) {
    let name = climateD.name;

    var popupContainer = L.DomUtil.create('div', 'popup-container', container);
;
    var infotextHeader = L.DomUtil.create('h2', 'popup-header', popupContainer);
    infotextHeader.setAttribute('id', 'ihead1');
    if(!isStation){
      if(name.length < 3){
        infotextHeader.textContent = "Climate Cell";
      }
      else{
        infotextHeader.innerHTML = "Climate Cell Near:" + "</br><strong>" + climateD.name + "</strong>";
      }
    }else{
      infotextHeader.innerHTML = "Climate Station In:" + "</br><strong>" + climateD.name+ "</strong>";
    }

    var infotext = L.DomUtil.create('p', 'popup-text', popupContainer);
    infotext.innerHTML = 
    "<strong>Elevation:</strong> " + climateD.elevation +"</br>" 
    + "<strong>Climate Class:</strong> " + climateD.climate_class +"</br>" 
    + "<strong>Years:</strong> " + climateD.years[0] +" - " + climateD.years[1]  +"</br>";

    var addbtn = L.DomUtil.create('button', 'popup-button addbtn', popupContainer);
    addbtn.setAttribute('type', 'button');
    addbtn.setAttribute('id', 'addbtn1');
    addbtn.setAttribute('text-align', 'right');
    addbtn.innerHTML = 'Create Charts';
    addbtn.onclick= () =>{
      this._drawCharts(false);
    }

  }

  // ==========================================================================
  // draw popup
  // ==========================================================================
  drawPopup(climateData){
    if(!this._drawPopup){
      return;
    }
    var container = L.DomUtil.create('div');
    // get current mode 
     
    var mode = this._main.modules.weatherStationsOnMap.getMode();

    // draw popup with information
    this.createPopup(container, climateData, mode);
    

    var infoPopup = L.popup({classname: 'info-popup', keepInView: true})
      .setLatLng(this._lastCoords)
      .setContent(container)
      .openOn(this._map);

    this._main.modules.weatherStationsOnMap.setMode(false);
    this._drawPopup=false;

  }

  // ==========================================================================
  // Getter
  // ==========================================================================

  getMap()
  {
    return this._map
  }

  getCoordinateCollection(){
    return this._profileCoordCollection;
  }

  
  addChart(evt){
    let coords = this._main.modules.mapController.setLocation(
      {
        lat: evt.latlng.lat,
        lng: evt.latlng.lng
      });

  }

  _drawCharts(flag){
    this._main.modules.chartController.updateCharts(null, this._lastLocationCounter, flag);
    this._lastLocationCounter = this._lastLocationCounter+1;
  }

}
