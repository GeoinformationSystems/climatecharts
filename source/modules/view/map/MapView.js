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
    this._startEndCoords=[];
    this._profileCoordCollection=[];
    this._drawProfile = false;

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

        if(this._drawProfile){
          /**
           * ? Spatial Profile - WIP
           */
          // let removelines = $('#removeProfileLinebtn');
          // removelines.removeAttr('disabled');
          // this._noLinesOnMap = false;

          // this._profileCoordCollection = [];
          //   let pos2 = [evt.latlng.lat, evt.latlng.lng];
          //   this._startEndCoords.push(pos2);

          //   // draw line between the two set points
          //   var line = L.polyline(this._startEndCoords, 
          //     {color: 'blue',
          //     weight: 2,
          //     lineCap: 'round'
          //     }
          //     ).addTo(this._profileGroup);
            
          //   // zoom in on line
          //   this._map.fitBounds(line.getBounds());

          //   // get coordinates along the line
          //   var line = turf.lineString(this._startEndCoords);
          //   var options = {units: 'kilometers'};
          //   var length = turf.length(line, {units:'kilometers'});
          //   var interval= length / 8;
          //   for(let i = 0; i <= 8; i++){
          //     let along = turf.along(line, i*interval, options);
          //     this._profileCoordCollection.push(along.geometry.coordinates);  

          //     var marker = L.marker(along.geometry.coordinates).addTo(this._profileGroup);  
          //   }
          //   this._main.modules.climateDatasetController.setupGeoProfile(this._profileCoordCollection, this._lastLocationCounter);
          //   this._lastLocationCounter = this._lastLocationCounter+1;
        }
        else{ //  update current location
        this._main.modules.mapController.setLocation(
          {
            lat: evt.latlng.lat,
            lng: evt.latlng.lng
          });  

          this._lastCoords = evt.latlng; 
      }
      // this._drawProfile = false;
      this._startEndCoords =[]

    })
  }

  
  // ==========================================================================
  // create popup
  // ==========================================================================
  createPopup(container, climateD, isStation) {
    let name = climateD.name;

    var popupContainer = L.DomUtil.create('div', 'popup-container', container);

    console.log("Test popup");
    var infotextHeader = L.DomUtil.create('h2', 'popup-header', popupContainer);
    infotextHeader.setAttribute('id', 'ihead1');
    if(!isStation){
      if(name.length < 3){
        infotextHeader.textContent = "climate cell";
      }
      else{
        infotextHeader.innerHTML = "climate cell near:" + "</br><strong>" + climateD.name + "</strong>";
      }
    }else{
      infotextHeader.innerHTML = "climate station in:" + "</br><strong>" + climateD.name+ "</strong>";
    }

    var infotext = L.DomUtil.create('p', 'popup-text', popupContainer);
    infotext.innerHTML = 
    "<strong>elevation:</strong> " + climateD.elevation +"</br>" + "<strong>climate class:</strong> " + climateD.climate_class +"</br>" + 
    "<strong>years:</strong> " + climateD.years[0] +" - " + climateD.years[1]  +"</br>";

    var addbtn = L.DomUtil.create('button', 'popup-button addbtn', popupContainer);
    addbtn.setAttribute('type', 'button');
    addbtn.setAttribute('id', 'addbtn1');
    addbtn.setAttribute('text-align', 'right');
    addbtn.innerHTML = 'Create Charts';
    addbtn.onclick= () =>{
      this._drawCharts(false);
    }

    /**
     * ? Spatial Profile WIP
     */
    // var geoProfile = L.DomUtil.create('p', 'popup-text geoprofiletxt', popupContainer);
    // geoProfile.innerHTML = 
    // "To create a geo-spatial profile from this starting point select an end destination on the map after clicking 'Draw Profile'. The climate data will be simulated data only.";
  
    // var drawLine = L.DomUtil.create('button', 'popup-button drawbtn', popupContainer);
    // drawLine.setAttribute('type', 'button');
    // drawLine.innerHTML = 'Draw Profile';

    // drawLine.onclick= () =>{
    //   let position1 = [this._lastCoords.lat, this._lastCoords.lng]
    //   this._startEndCoords.push(position1);
    //   this._drawProfile = true;
    //   this._map.closePopup();

    // }

    // var removeProfile = L.DomUtil.create('button', 'popup-button removeP', popupContainer);
    // removeProfile.setAttribute('type', 'button');
    // removeProfile.setAttribute('id', 'removeProfileLinebtn');
    // if(this._noLinesOnMap){
    //   removeProfile.setAttribute('disabled', 'true');
    // }
    // // removeProfile.setAttribute('disabled', this._noLinesOnMap);
    // console.log('yeahno', this._noLinesOnMap);
    // removeProfile.innerHTML = 'Remove All Lines';

    // removeProfile.onclick=()=>{
    //   this._profileGroup.clearLayers();
    //   removeProfile.setAttribute('disabled', 'true');
    //   this._noLinesOnMap = true;
    //   console.log('yeahno', this._noLinesOnMap);

    // }
  }

  drawPopup(climateData){
    if(!this._drawPopup){
      return;
    }
    var container = L.DomUtil.create('div');
    // get current mode 
     
    var mode = this._main.modules.weatherStationsOnMap.getMode();

    // draw popup with information
    this.createPopup(container, climateData, mode);
    

    var infoPopup = L.popup({classname: 'info-popup'})
      .setLatLng(this._lastCoords)
      .setContent(container)
      .openOn(this._map);

    this._main.modules.weatherStationsOnMap.setMode(false);
    this._drawPopup=false;

  }
    //}
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
