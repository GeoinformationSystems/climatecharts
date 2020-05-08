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
    this._drawPopupNow = false;
    this._popupExists = false;
    this._noLinesOnMap = true;
    this._lastLocationCounter= 0;
    this._lastCoords =
      {
        lat: null,
        lng: null
      };  
    this._profileCoordCollection=[];
    this._climateData = new ClimateData();

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
        this._drawPopupNow = true;

        //  update current location
        this._main.modules.mapController.setLocation(
          {
            lat: evt.latlng.lat,
            lng: evt.latlng.lng
          });  

        this._lastCoords = evt.latlng; 
      })

    this._map.on("popupclose", evt=>{
      this._popupExists = false;
    });

    }

  
  // ==========================================================================
  // fill popup with content
  // ==========================================================================
  _fillPopup(container, isStation) {
    let name = this._climateData.name;

    var popupContainer = L.DomUtil.create('div', 'popup-container', container);

    var infotextHeader = L.DomUtil.create('h2', 'popup-header', popupContainer);
    infotextHeader.setAttribute('id', 'ihead1');
    if(!isStation){
      if(name.length < 3){
        infotextHeader.textContent = "Climate Cell";
      }
      else{
        infotextHeader.innerHTML = "Climate Cell Near:" + "</br><strong>" + this._climateData.name + "</strong>";
      }
    }else{
      infotextHeader.innerHTML = "Climate Station In:" + "</br><strong>" + this._climateData.name+ "</strong>";
    }

    var infotext = L.DomUtil.create('p', 'popup-text', popupContainer);
    infotext.innerHTML = 
    "<p><strong>Elevation: </strong> " + this._climateData.elevation +"</p>" 
    + "<p><strong>Climate Class: </strong> " + this._climateData.climate_class + "</p>"
    + "<p id='pYears'><strong>Years: </strong>" + this._climateData.years[0] +" - " + this._climateData.years[1]  + "</p>";

    // var infotext2 = L.DomUtil.create('table', 'popup-text2', popupContainer);
    // infotext2.innerHTML = 
    // "<tr>"+
    //   "<td><strong>Elevation: </strong></td>"+
    //   "<td class='2ndrow'>" +  climateD.elevation +"</td>"+
    // "</tr>" +
    // "<tr>"+
    //   "<td><strong>Climate Class: </strong></td>" +
    //   "<td class='2ndrow' >" + climateD.climate_class + "</td>" +
    // "</tr>" +
    // "<tr>"+
    //   "<td><strong>Years: </strong></td>"+
    //   "<td class='2ndrow' id='pYears'>" + climateD.years[0] +" - " + climateD.years[1]  + "</td>"
    // "</tr>";


    var addbtn = L.DomUtil.create('button', 'popup-button addbtn', popupContainer);
    addbtn.setAttribute('type', 'button');
    addbtn.setAttribute('id', 'addbtn1');
    addbtn.setAttribute('text-align', 'right');
    addbtn.innerHTML = 'Create Charts';
    addbtn.onclick= () =>{
      this._drawCharts();
    }



  }

  // ==========================================================================
  // draw popup
  // ==========================================================================
  drawPopup(climateD){
    if(!this._drawPopupNow){
      return;
    }
    if(this._popupExists){
      this._map.closePopup();
    }

    // this._climateData = this._main.modules.climateDataController.getClimateData();
    this._climateData = climateD;

    var container = L.DomUtil.create('div');
    // get current mode 
     
    var mode = this._main.modules.weatherStationsOnMap.getMode();

    // draw popup with information
    this._fillPopup(container, mode);
    

    var infoPopup = L.popup({classname: 'info-popup', keepInView: false, autopan: true})
      .setLatLng(this._lastCoords)
      .setContent(container)
      .openOn(this._map);

    this._main.modules.weatherStationsOnMap.setMode(false);
    this._drawPopupNow= false;
    this._popupExists = true;
  }

  _addChart(evt){
    let coords = this._main.modules.mapController.setLocation(
      {
        lat: evt.latlng.lat,
        lng: evt.latlng.lng
      });

  }

  _drawCharts(){
    this._main.modules.chartController.updateCharts(this._lastLocationCounter);
    this._lastLocationCounter = this._lastLocationCounter+1;
  }

  /**
  * Update Popup after Time Slider changed
  */
  updatePopupTime(start, end){
    if(this._popupExists){
      var newPeriod = document.getElementById("pYears");
      newPeriod.innerHTML = "<strong>Years: </strong>" + start + " - " + end;
    }
  }
   
  /**
  * Update Popup after Location was changed using the Infobox
  */
  updatePopup(){
    this._drawPopupNow = true;
    L.popup().update();
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

  /**
   * Setter 
   */
 
  setLastCoords(coords){
    this._lastCoords = coords; 
  }

}
