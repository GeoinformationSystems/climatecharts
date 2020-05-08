// ############################################################################
// ChartController                                                   Controller
// ############################################################################
// Manages the currently active charts in the visualization. Receives new
// ClimateData from ClimateDataController or a new chart title from
// ChartTitleSetter and updates the visualization.
// Currentrly there are three different charts in the system:
// - ClimateChart
// - DistributionChart
// - AvailabilityChart
// ############################################################################


class ChartController
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

    // All charts
    this._charts = [];

    // Staus variable: charts currently active?
    this._chartsAreActive = false;

    // Infobox about climate chart
    // -> only visible if charts are not active
    this._chartInfo = $('#chart-info');    
    this._climatedata = null;
    this._locationKey = 0;
    
    // map of all tabbed chart collections
    this._chartsCollection = new Map();
    this._collection = [];

    // chartinfo of one collection

    this._chartobject = {
      location: null,
      latitude: null,
      longitude: null,
      startPeriod: 1
      + main.config.time.periodEnd
      - main.config.time.periodLength,
      endPeriod: 0
      + main.config.time.periodEnd, 
      customTitle: null,
      //id: 1
    };

    // Map(this._chartsCollection);

    //this._chartsCollection.set(this._locationKey, this._chartobject);

  }

  // ChartsController.prototype.chartobject={

  // }
  // ==========================================================================
  // Update the climate data either from click on new weather station or
  // from click on a new climate cell on the map
  // ==========================================================================

  updateClimate(climateData)
  {
    // Prepare for creating new charts
    if (!this._chartsAreActive)
      this._chartInfo.hide();
    // Otherwise cleanup existing charts
    //else // charts are active
      //for (let chart of this._charts)
        //chart.remove()
    this._climatedata = climateData;
    //this._locationKey = null;
    // let addbtn = document.getElementById('addbtn1');
    // addbtn.onclick= () =>{
    // // Create charts all over again
    // this._charts =
    //   [
    //     new ClimateChart(this._main, climateData, 1),
    //     new DistributionChart(this._main, climateData, 1),
    //     new AvailabilityChart(this._main, climateData, 1),
    //   ];
    //this._chartsAreActive = true;
    //}
 
    // Name has propably changed
    this._main.hub.onDiagramTitleChange(climateData.name);
  }

  // ==========================================================================
  // Kickstart drawing of charts
  // ==========================================================================

  updateCharts(counter){
    this._locationKey = counter;
    // Create charts all over again
    let chartobject = this._main.modules.helpers.deepCopy(this._chartobject);
    this._chartsCollection.set(counter, chartobject);
    
    let mapSize = this._chartsCollection.size;

    this._charts =
    [
      new ClimateChart(this._main, this._climatedata, counter),
      new DistributionChart(this._main, this._climatedata, counter),
      new AvailabilityChart(this._main, this._climatedata, counter),
    ];
    this._chartsAreActive = true;
    
    }

  // ==========================================================================
  // Update the title of the charts
  // ==========================================================================

  updateTitle(title)
  {
    if (this._chartsAreActive)
      for (let chart of this._charts)
        chart.updateTitle(title)
        this._chartobject.customTitle = title;

        let chartobject = this._chartobject;
        this._chartsCollection.set(this._locationKey, chartobject);
  }


  // ==========================================================================
  // Clear all charts
  // ==========================================================================

  clear()
  {
    if (this._chartsAreActive)
      for (let chart of this._charts)
        //chart.remove()

    this._chartsAreActive = false;

    this._chartInfo.show()
  }

  // TODO add dimension later
  getStartPeriod(){
    return this._chartobject.startPeriod;
  }

  getEndPeriod(){
    return this._chartobject.endPeriod;
  }

  getCoords(){

    let coords = {
      lat: this._chartobject.latitude,
      lng: this._chartobject.longitude
    };

    return coords;
  }

  getCustomTitle(){
    return this._chartobject.customTitle;
  }

  getID(){
    return this._chartobject.id;
  }

  getChartMap(){
    return this._chartsCollection;
  }

  getMapSize(){
    return this._chartsCollection.size;
  }

  setCounter(counter){
    this._locationKey = counter;
  }

  deleteMapItem(key){
    this._chartsCollection.delete(key);
  }

  setTimePeriod(periodStart, periodEnd){
    
    //this._chartsCollection.get(this._locationKey).startPeriod = periodStart;
    //this._chartsCollection.get(this._locationKey).endPeriod = periodEnd;
    //let current_object = this._chartsCollection.get(this._locationKey);
    //let current_object = this._chartsCollection.get(this._locationKey);

    //  current_object.startPeriod = periodStart;
    //  current_object.endPeriod = periodEnd;

    this._chartobject.startPeriod = periodStart;
    this._chartobject.endPeriod = periodEnd

    
    //this._chartsCollection.set(this._locationKey, current_object);

  }


  setCoords(coordinates){

    // let current_object = this._chartsCollection.get(this._locationKey);

    // current_object.latitude = coordinates.lat;
    // current_object.longitude = coordinates.lng;
    this._chartobject.latitude = coordinates.lat;
    this._chartobject.longitude = coordinates.lng;
    //this._chartsCollection.set(this._chartobject);
    // this._chartsCollection.set(this._locationKey, current_object);
  }

  setDiagramTitle(dtitle){
    // let current_object = this._chartsCollection.get(this._locationKey);

    // current_object.diagramTitle = dtitle;
    this._chartobject.diagramTitle = dtitle;
    // this._chartsCollection.set(this._locationKey, current_object);
  }

  // setID(id){
  //   this._chartobject.id = id;
  // }



}
