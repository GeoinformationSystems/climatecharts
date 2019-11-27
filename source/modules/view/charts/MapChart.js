// ############################################################################
// MapChart                                                           View
// ############################################################################
// Visualizes spatial temperature profile along individually drawn line. 
// ############################################################################


class MapChart extends Chart
{

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################
  

  // ==========================================================================
  // Constructor
  // ==========================================================================


  constructor(main, climateData, id, profileCol)
  {
        // Error handling: Only show chart if both prec and temp are given
    if (climateData.has_temp && climateData.has_prec){
      super(main, 'map-chart', climateData, id, profileCol);
    }

    else{
      super(main, 'map-chart', null, id);
    }

    
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Init local members
  // ==========================================================================

  _initMembers(climateData)
  {
    super._initMembers(climateData);
    this._chartPos = {
        left:
        ( 0
         + this._mainPos.left
         + this._chartsMain.padding
         + this._chartMain.margin.left
       ),
       top: ( 0
         + this._mainPos.top
         + this._chartsMain.padding
         + this._chartMain.margin.top
       ),
       right:
       ( 0
         + this._mainPos.left
         + this._mainPos.width
         - this._chartsMain.padding
         - this._chartMain.margin.right
       ),
       bottom: ( 0
         + this._mainPos.bottom
         - this._chartsMain.padding
         - this._chartMain.margin.bottom
       ),
     };
     this._chartPos.width =  this._chartPos.right - this._chartPos.left;
     this._chartPos.height = this._chartPos.bottom - this._chartPos.top;

    this._WIDTH = $('#chartcollection' + this._chartCollectionId + '-tabContent').width();
    
    this._ASPECT = 2;

    this._HEIGHT = this._WIDTH / this._ASPECT;

    this._scene, this._camera, this._renderer, this._drawCount, this._raycaster;

    this._coordinateCollection = this._geoProfile;

    var startlat = this._climateData.location.orig.lat;
    var startlng = this._climateData.location.orig.lng;
    this._coordinateCollection.sort((a,b)=>{
     let lat1 = a.location.orig.lat;
     let long1 = a.location.orig.lng;
     let lat2 =  b.location.orig.lat;
     let long2 = b.location.orig.lng;

     let dista =calculateDistance(startlat,startlng, lat2, long2, 'K');
     let distb =calculateDistance(lat1,long1, startlat, startlng, 'K');
     
     if(dista > distb){
       return 1;
     }
     if(dista < distb){
       return -1;
     }
     return 0;
    })

    /**
     * * source: https://www.geodatasource.com/developers/javascript
     */

    function calculateDistance(lat1, lon1, lat2, lon2, unit) {
      if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
      }
      else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
          dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist;
      }
    }

    this._coordList =[];


     this._meshes = [];
     this._meshes2 = [];
     this._line;
     this._lineMin;
     this._group;

  }



  // ========================================================================
  // Draw the whole chart
  // - left side: diagram
  //    * axes + ticks
  //    * grids
  //    * lines and areas for temp and prec
  //    * caption for temp and prec
  // - right side: table
  // ========================================================================

  // ==========================================================================
  // Draw the whole chart
  // ==========================================================================

  _setupChart()
  {
    //super._setupChart();
    // this._setupHeader();
    this._chart = d3.select(this._chartWrapper[0]);
    this._setupHeader();
    let canvas = this._createScene();
    this._createColumnsAndTooltips();
    
    
    this._chartWrapper[0].append(canvas);

    this._chart.select('canvas')
      .attr('id', this._chartName + this._chartCollectionId + '-canvas')
      .attr('class', this._chartName + '-container');

    //   this._chartWrapper[0].append(canvas);
    var can = document.getElementById('#'+ this._chartName + this._chartCollectionId + '-canvas');
    this._createMap(canvas);

    // Define the div for the tooltip
    var div = this._chart.append("div")	
    .attr("class", "tooltip")			
    .attr("id", this._chartName + this._chartCollectionId + '-tooltip')	
    .style("opacity", 0)
    .html("!");

    // canvas.addEventListener('mouseover', this._onMouseDown, false);
    // this._chart.on('mousemove', (evt)=>{
    d3.select('#'+this._chartName + this._chartCollectionId + '-canvas').on('mousemove', (evt)=>{
     this._onMouseHover(evt);
    // this._resizeEvent();
    });
  }

   // ==========================================================================
  // setup Header
  // ==========================================================================

  _setupHeader()
  {

    let grid = d3.select('#chartcollection'+this._chartCollectionId+ '-menu');
    var percentage;
    if(grid.classed('col-md-6')){
      percentage = 70;
    }
    else{
      percentage= 100;
    }
    var from, to;
    var size= Object.keys(this._coordinateCollection).length-1;

    if(this._coordinateCollection[0].name.length < 3){
      from = this._coordinateCollection[0].location.DD;
    }else{from = this._coordinateCollection[0].name}

    if(this._coordinateCollection[size].name.length < 3){
      to = this._coordinateCollection[size].location.DD;
    }else{to = this._coordinateCollection[0].name}
    // Title
    this._chart.append('div')
      .attr('id', this._chartName + this._chartCollectionId + '-title')
      .attr('class', 'chart-header chart-title maphf')
      .style('text-align', 'center')
      .attr('text-anchor', 'middle')
      .style('font-size', this._chartsMain.fontSizes.title* percentage + '%')
      .text('From ' + from + ' to ' + to);

    this._titleDiv = $('#' + this._chartName +  this._chartCollectionId + '-title');

    // Subtitle
    this._chart.append('div')
      .attr('class', 'chart-header chart-subtitle maphf')
      .attr('id', this._chartName + this._chartCollectionId + '-subtitle')
      .style('text-align', 'center')
      .attr('text-anchor', 'middle')
      .style('font-size', this._chartsMain.fontSizes.large*percentage + '%')
      .text(this._subtitle);
  }

    // ==========================================================================
  // Setup Footer
  // ==========================================================================

  _setupHeaderFooter()
  {

    let grid = d3.select('#chartcollection'+this._chartCollectionId+ '-menu');
    var percentage;
    if(grid.classed('col-md-6')){
      percentage = 75;
    }
    else{
      percentage= 100;
    }
    // Footer: Source link
    this._footerElems = [2];
    this._footerElems[0] = this._chart.append('div')
      .attr('class', 'footer-source maphf')
      .attr('id', this._chartName + this._chartCollectionId + '-footersrc')
      .style('text-align', 'left')
      .style('cursor', 'pointer')
      .style('font-size', this._chartsMain.fontSizes.small*percentage + '%')
      .style('opacity', this._chartsMain.footerOpacity)
      .text('Data Source: ' + this._climateData.source)
      .on('click', () =>
        {
          window.open(this._climateData.source_link)
        }
      );

    // Footer: Reference URL
    this._footerElems[1] = this._chart.append('div')
      .attr('class', 'footer ref-url maphf')
      .style('margin-top', '-' + this._chartsMain.padding + 'px' )
      .style('text-align', 'right')
      .style('text-anchor', 'end')
      .style('font-size', this._chartsMain.fontSizes.small*percentage + '%')
      .style('opacity', this._chartsMain.footerOpacity)
      .text('\u00A9 ' + this._refURL)
  }

  // ==========================================================================
  // create Threejs scene
  // ==========================================================================

  _createScene(){
    var canvas;

    // create scene
    const VIEW_ANGLE = 75;
    const FAR = 1000;
    const NEAR = 0.1;

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera( VIEW_ANGLE, this._ASPECT, NEAR, FAR );
    this._raycaster = new THREE.Raycaster();

    this._renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas});

    // create canvas for map
    canvas = this._renderer.domElement;

    //set up camera
    this._camera.position.z = 300;
    this._scene.add(this._camera);
    this._renderer.setSize( this._WIDTH, this._HEIGHT);

    // set up light source
    let light = new THREE.PointLight(0xffffff, 1.2);
    light.position.set(50, 50, 50);
    this._scene.add(light);

    // Configure a material
    this._material = new THREE.MeshLambertMaterial({ color: new THREE.Color(0x66c2a5), side: 2, shading: THREE.FlatShading });

   this._animate();

    d3.select(window).on('resize', () => {
      this._resizeEvent();
    })
    return canvas;
  }

  // resize
  _resizeEvent(){

    // var resizeTimer;
    // clearTimeout(resizeTimer);
    // var wrapper = d3.select('#' + this._chartMain.name + this._chartCollectionId + '-wrapper'); 
    // // if(wrapper.classed('active')){
    //   resizeTimer = setTimeout(() => {
    //     let f =   d3.select('#' + this._chartName + this._chartCollectionId + '-title').node().getBoundingClientRect().width;
    //     let test = d3.select('#climate-chart' + this._chartCollectionId + '-wrapper').node().getBoundingClientRect().width;
    //     // let test2 = $('#climate-chart' + this._chartCollectionId + '-wrapper').getBoundingClientRect().width;

    //     let scale = window.innerWidth / window.innerHeight;
    //     let height= f/2;
    //     this._camera.aspect = scale;
    //     this._camera.updateProjectionMatrix();

    //     wrapper.style('width', test + 'px');
    //     // let canvas = d3.selectAll('.mapboxgl-map').each(
    //     //   function(){
    //     //     let w =  $('#' + this._chartName + this._chartCollectionId + '-title').width();
    //     //     let height= w/2;
    //     //     this.style.width = w + 'px';
    //     //     this.style.height = height + 'px';
    //     //   }
    //     // )
    //     this._renderer.setSize( f, height );


    //   }, 250);
    // }
  }

      // animate loop: called whenever the screen refreshes
  _animate() {

        requestAnimationFrame( ()=> {
          this._animate();
        } );
        this._renderer.render( this._scene, this._camera );
    }

  // ==========================================================================
  // create map
  // ==========================================================================

  _createMap(canvas){
    // API Key for Mapboxgl (private account key!)
    var key = 'pk.eyJ1IjoicmljYXJkb2xhbmduZXIiLCJhIjoiY2pxano2enh2MG1qazN4bm5lajIzeDl3eiJ9.wK0MtuxLgJxDcGUksKMeKg'

    var options = {
      container: $('#' + this._chartName+ this._chartCollectionId+ '-canvas'),
      lat: this._coordinateCollection[0].location.orig.lat,
      lng: this._coordinateCollection[0].location.orig.lng,
      zoom: 4,
      pitch: 50,
      bearing: 0,
      // preserveDrawingBuffer: true to save to png
      style: "mapbox://styles/mapbox/streets-v10"
    }

    var mappa = new Mappa('MapboxGL', key);
    this._myMap = mappa.tileMap(options);
    this._myMap.overlay(canvas);

    //on interaction with the map
    $('#' + this._chartName+ this._chartCollectionId+ '-canvas').resize();
    this._myMap.onChange(()=>{
      this._line.geometry.vertices = [];
      this._lineMin.geometry.vertices = [];

      this._meshes.forEach((mesh) => {
          this._positionColumn(mesh);
      
    }); 
  })
}

  // ==========================================================================
  // Creating Columns and Tooltips
  // ==========================================================================

_createColumnsAndTooltips() {
  //create a LineBasicMaterial for maximum temperature
  
var lineMaterial = new THREE.LineBasicMaterial( { color: 0x7D0025, linewidth: 6, linecap: "round", linejoin: "round" } );
var lineGeometry = new THREE.Geometry();
this._line = new THREE.Line( lineGeometry, lineMaterial );

//create a LineBasicMaterial for minimum temperature
var lineMaterialMin = new THREE.LineBasicMaterial( { color: 0xC66D2E, linewidth: 6, linecap: "round", linejoin: "round" } );
var lineGeometryMin = new THREE.Geometry();
this._lineMin = new THREE.Line( lineGeometryMin, lineMaterialMin);

// iterate over all locations of the set
  this._coordinateCollection.forEach((station, s_index) => {

        var z = +station.realextreme.maxTemp;

        const columnWidth = 1;
        // create columns
        var geometry = new THREE.CylinderGeometry( columnWidth, //radius top
          columnWidth, //radius bottom
          z, //height
         );

        geometry.translate(0,0.5*z,0);

        var mesh = new THREE.Mesh(geometry, this._material);
        let name;

        //set info for tooltip
        if(station.name.length < 3){
          name = station.location.DD;
        }else{ 
          name = '<b>'+station.name + '</br> Coords: </b>' + station.location.DD;
          
        }
        mesh.userData = {
          locName : name,
          minTemp : station.realextreme.minTemp,
          maxTemp : station.realextreme.maxTemp
        }
        mesh.name = s_index;
        this._meshes[s_index] =mesh;


        this._scene.add(mesh);
 
      });

  }

  // ==========================================================================
  // position columns based on the current camera position and direction
  // ==========================================================================
// mesh:    the mesh of the column
// item:    the data item for the column which contains the latitude and longitude

_positionColumn(mesh) {
  var dataItem = this._coordinateCollection[+mesh.name];
  
  // reposition columns
  var pos = this._myMap.latLngToPixel(+dataItem.location.orig.lat, +dataItem.location.orig.lng);
  
  const vector = new THREE.Vector3();
  vector.set((pos.x / this._WIDTH) * 2 - 1, -(pos.y / this._HEIGHT) * 2 + 1, 0.5);
  vector.unproject(this._camera);

  const dir = vector.sub(this._camera.position).normalize();
  
  const distance = -this._camera.position.z / dir.z;
  const newPos = this._camera.position.clone().add(dir.multiplyScalar(distance));

  mesh.position.set(newPos.x, newPos.y, newPos.z);
  this._scene.add(mesh);


  //set new min&max lines
  let rotatedLine = new THREE.Vector3(newPos.x, newPos.y+ dataItem.realextreme.maxTemp, newPos.z);
  let newLineMin = new THREE.Vector3(newPos.x, newPos.y + dataItem.realextreme.minTemp, newPos.z);
  this._line.geometry.vertices.push(rotatedLine);

  this._line.geometry.verticesNeedUpdate = true;
  this._scene.add(this._line);


  this._lineMin.geometry.vertices.push(newLineMin);
  this._lineMin.geometry.verticesNeedUpdate = true;

  this._scene.add(this._lineMin);


  d3.select('#'+ this._chartName + this._chartCollectionId + '-tooltip').transition()		
    .duration(100)		
    .style("opacity", 0);	
}

  // ==========================================================================
  // gets position of mouse and displays tooltip when mouse hits a column
  // ==========================================================================
_onMouseHover(event) {

    var x = d3.event.layerX;
    var y= d3.event.layerY;

    // calculate mouse pos in normalized device coordinates
    // (-1 to +1 for both components)

    var mouseX = ( x / d3.event.target.clientWidth ) * 2 - 1;
    var mouseY = - ( y / d3.event.target.clientHeight ) * 2 + 1;

    var mouse = new THREE.Vector2(mouseX,mouseY);

    let tooltip = d3.select('#'+ this._chartName + this._chartCollectionId + '-tooltip');
    // what's on the line from mouse to camera
    this._raycaster.setFromCamera(mouse, this._camera);
    var intersects = this._raycaster.intersectObjects(this._scene.children);

    // test for intersection with column and find closest column
    if (intersects.length > 0) {
        var intersection = {distance: 1000000, name: "", object: null};
        intersects.forEach((object, item) => {

            if (object.distance < intersection.distance) {
                intersection.distance = object.distance;
                intersection.name = object.object.name;
                intersection.object = object.object;
            }
        });

        // make tooltip visible or invisible
        var locationMeta = this._meshes[+intersection.name];
        tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
        tooltip.html(locationMeta.userData.locName + '</br>' 
        + '<b>' +'Temperature Max: '+ '</b>' + locationMeta.userData.maxTemp+ '</br>'
        + '<b>' +'Temperature Min: '+ '</b>' + locationMeta.userData.minTemp);


        var widthHalf = this._WIDTH / 2, heightHalf = this._HEIGHT / 2;

        var tpos = intersection.object.position.clone();
        tpos.project(this._camera);
        tpos.x = ( tpos.x * widthHalf ) + widthHalf;
        tpos.y = - ( tpos.y * heightHalf ) + heightHalf;

        tooltip.style("top", (tpos.y - 15)+"px")
            .style("left", (tpos.x )+"px");
    } else{
      // tooltip.transition()		
      // .duration(500)		
      // .style("opacity", 0);	

    }
}

}
