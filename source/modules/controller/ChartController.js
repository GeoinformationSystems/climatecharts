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
    };

  }

  // ==========================================================================
  // Update the climate data either from click on new weather station or
  // from click on a new climate cell on the map
  // ==========================================================================

  updateClimate(climateData)
  {

    this._climatedata = climateData;
 
    // Only update user defined title input
    main.modules.chartTitleSetter.update(climateData.name)

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
    
  }

  // ==========================================================================
  // Update the title of the charts
  // ==========================================================================

  updateTitle(title)
  {
    for (let chart of this._charts)
    {
      chart.updateTitle(title);
      let chartobject = this._chartobject;
      chartobject.customTitle = title;
      this._chartsCollection.set(this._locationKey, chartobject);
    }
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

    this._chartobject.startPeriod = periodStart;
    this._chartobject.endPeriod = periodEnd

  }


  setCoords(coordinates){

    this._chartobject.latitude = coordinates.lat;
    this._chartobject.longitude = coordinates.lng;

  }

}
