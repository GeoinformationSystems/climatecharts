// ############################################################################
// All modules that are initialized with the main module
// ############################################################################

let loadModules = (main) =>
{

  main.modules = {}


  // ==========================================================================
  // Helpers
  // ==========================================================================

  main.modules.helpers =                    new Helpers()
  main.modules.domElementCreator =          new DOMElementCreator()
  main.modules.loading =                    new Loading()
  main.modules.serverInterface =            new ServerInterface()


  // ==========================================================================
  // View
  // ==========================================================================

  // Map
  main.modules.map =                        new Map(main)
  main.modules.locationMarkerOnMap =        new LocationMarkerOnMap(main)
  main.modules.climateCellOnMap =           new ClimateCellOnMap(main)
  main.modules.weatherStationsOnMap =       new WeatherStationsOnMap(main)

  // Timeline
  main.modules.timeline =                   new Timeline(main)

  // Misc
  main.modules.climateDatasetsInList =      new ClimateDatasetsInList(main)
  main.modules.coordinatesInInfobox =       new CoordinatesInInfobox(main)
  main.modules.chartTitleSetter =           new ChartTitleSetter(main)
  main.modules.datasetInfobox =             new DatasetInfobox(main)


  // ==========================================================================
  // Controller
  // ==========================================================================

  main.modules.timeController =             new TimeController(main)
  main.modules.mapController =              new MapController(main)
  main.modules.weatherStationController =   new WeatherStationController(main)
  main.modules.climateDatasetController =   new ClimateDatasetController(main)
  main.modules.climateDataController =      new ClimateDataController(main)
  main.modules.chartController =            new ChartController(main)
}
