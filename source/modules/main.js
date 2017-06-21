/*
 * ClimateCharts (climatecharts.net)
 * Author: Felix Wiemann and Marcus Kossatz
 *
 * This file contains the user interface object for the website. The variables defined at
 * the beginning are necessary to query the server for temperature and precipitation data
 * and subsequently draw the chart. The UI functions are triggered, if the corresponding
 * html element is clicked or it´s value changes (see file app.js).
 */


// ##########################################################################
// CONSTANTS
// ##########################################################################

// Extent of geographic coordinates (in lat/lng)
const LAT_EXTENT = 90
const LNG_EXTENT = 180

// Months
const MONTHS_IN_YEAR =
[
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]
const SUMMER_MONTHS =     [3, 8]    // April (3) until September (8)

// Conversion factors
const KELVIN_TO_CELSIUS = 273.15
const CM_TO_MM =          10


// ============================================================================
// Database connection information
// ============================================================================

const RUN_LOCALLY =
{
  'thredds':          false,
  'gazetteer':        false,
  'weatherstations':  false
}

// port on which tomcat8 runs on the localhost and / or on the server
const TOMCAT_PORT = 8080

const URL =
{
  'local':      window.location.protocol + "//" + window.location.host + ":" + TOMCAT_PORT,
  'server':     "https://climatecharts.net"
}

const ENDPOINTS =
{
  'thredds':          (RUN_LOCALLY.thredds          ? URL.local : URL.server)
    + "/thredds",
  'gazetteer':        (RUN_LOCALLY.gazetteer        ? URL.local : URL.server)
    + "/gazetteer/api",
  'weatherstations':  (RUN_LOCALLY.weatherstations  ? URL.local : URL.server)
    + "/weatherstations-api_new",
}



// ##########################################################################
// MAIN OBJECT
// -> containing all configuration and modules !!!
// ##########################################################################

let main = {}

// ============================================================================
// Init main configurations
// ============================================================================

main.config =
{
  time :
  {
    minYear:      1900,       // Minimum possible year of climate data
    maxYear:      2010,       // Maximum possible year of climate data
    periodLength: 30,         // Number of years in time period (default: 30)
    periodEnd:    2000,       // Initial end year of the period
  },

  map :
  {
    container:    "map",
    startPos:     [50, 10],   // Initial map center [lat, lng]
    startZoom:    2,          // Discrete zoom level [0 .. 12]
    maxBoundsViscosity: 0.75, // Solidity of the bounds when dragging [0 .. 1]
    tileLayers:
    {
      "ESRI": L.tileLayer(    // ESRI Online
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          id:           'ESRI',
          maxZoom:      20,
          attribution:  'Tiles &copy; ESRI'
        }
      ),
      "OpenStreepMap": L.tileLayer(    // OpenStreetMap
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          id:           'OSM',
          maxZoom:      19,
          attribution:  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
      )
    },
  },

  coordinates:
  {
    decimalPlaces: 3,  // Visualized coordinate precision (lat/lng)
  },

  climateCell:
  {
    style:
    {
      color:  '#000099',  // background color
      weight: 2,          // stroke width
    },
  },

  charts:
  {
    parentContainer:  'main-container',
    className:        'chart',
    referenceURL:     'ClimateCharts.net',
    structure:        // all following units: [px]
    {
      full:
      {
        width:    728,
        height:   480,
        padding:  5,
      },
      title:
      {
        top:      15,
        left:     300,
        maxWidth: 600,
      },
      subtitle:
      {
        top:      35,
        left:     300,
        maxWidth: 600,
      },
      saveButtons:
      {
        top:      0,
        left:     600,
      },
      main:
      {
        top:      70,
        left:     0,
      },
      source:
      {
        top:      290,
        left:     0,
        maxWidth: 600,
      },
      reference:
      {
        top:      290,
        right:    728,
      },
    },
    fontSizes:      // [px]
    {
      title:        15,
      subtitle:     15,
      source:       12,
    },
    footerOpacity:  0.4,
    charts:
    [
      {
        name:           'climate-chart',
        colors:
        {
          areaTemp:     d3.rgb(255,233,15  ),
          areaPrec:     d3.rgb(89, 131,213 ),
          colPrec:      d3.rgb(4,  61, 183 ),
          colTemp:      d3.rgb(230,20, 20  ),
          colGrid:      d3.rgb(211,211,211 ),
        },
        fontSizes:      // [px]
        {
          tick:         13,
          info:         15,
          table:        14,
        }
      },
      {
        name:           'distribution-chart',
      },
      {
        name:           'availability-chart',
      },
    ]
  },

  climateData:
  {
    decimalPlaces: 2,     // Decimal precision for both temp /prec
  },

  // Weather stations (marker: circle)
  station:
  {
    initRadius:  1,      // initial radius of a station [px]
    scaleFactor: 1.5,    // resize factor on map zoom
    minRadius:   1,      // minimum radius that will never be undershot
    maxRadius:   7,      // maximum radius that will never be exceeded
    style:
    {
      default:        // leaflet style for deselected weather station
      {
        className:    'weatherstation-marker',
        stroke:       true,
        opacity:      0.75,
        weight:       1.5,
        fill:         true,
        fillOpacity:  1.0,
        color:        '#888888',
        fillColor:    '#661323',
      },
      selected:       // leaflet style for selected / highlighted station
      {
        color:        '#2e6c97',
        fillColor:    '#2b83cb',
      },
    },
    source:           "www.ncdc.noaa.gov/ghcnm/"
  }
}


// ============================================================================
// Init main modules
// ============================================================================

main.modules = {}


// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

main.modules.helpers =                    new Helpers(main)
main.modules.serverInterface =            new ServerInterface(main)


// --------------------------------------------------------------------------
// View
// --------------------------------------------------------------------------

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


// --------------------------------------------------------------------------
// Controller
// --------------------------------------------------------------------------

main.modules.timeController =             new TimeController(main)
main.modules.mapController =              new MapController(main)
main.modules.weatherStationController =   new WeatherStationController(main)
main.modules.climateDatasetController =   new ClimateDatasetController(main)
main.modules.climateDataController =      new ClimateDataController(main)
main.modules.chartController =            new ChartController(main)



// ############################################################################
// Main interaction hub between modules
// ############################################################################

main.hub = {}

// --------------------------------------------------------------------------
// Mode changes
// --------------------------------------------------------------------------

// Interaction Mode:
//  null: none / no location selected
//  'C':  ClimateCell     -> data from simulated dataset (raster data)
//  'S':  WeatherStation  -> data from weather station dataset (point data)
main.mode = null

main.hub.onModeChange = (newMode) =>
  {
    let oldMode = main.mode

    // No mode change: no action
    if (newMode == oldMode)
      return

    // Old mode ClimateCell: cleanup location marker and climate cell
    if (oldMode == 'C')
    {
      main.modules.locationMarkerOnMap.remove()
      main.modules.climateCellOnMap.remove()
    }

    // Old mode WeatherStation: cleanup weatherstation
    if (oldMode == 'S')
    {
      main.modules.weatherStationController.deselect()
    }

    // Set new mode
    main.mode = newMode
  }


// --------------------------------------------------------------------------
// Location changes
// --------------------------------------------------------------------------

main.hub.onLocationChange = (coords) =>
  {
    // In ClimateCell mode
    if (main.mode == "C")
    {
      main.modules.locationMarkerOnMap.set(coords)
      main.modules.climateCellOnMap.set(coords)
      main.modules.climateDatasetController.update()
    }

    // In WeatherStation mode
    else if (main.mode == "S")
    {
      // Handled directly in WeatherStation controller?
    }

    // Update coordinates in infobox
    main.modules.coordinatesInInfobox.update(coords)
  }


// --------------------------------------------------------------------------
// Time changes
// --------------------------------------------------------------------------

main.hub.onPeriodChange = (start, end) =>
  {
    // Update climate data for ClimateCell
    if (main.mode == 'C')
      main.modules.climateDatasetController.update()

    // Update climate data for WeatherStation
    if (main.mode == 'S')
      main.modules.weatherStationController.updateDataForStation()

    // Update active weather stations on the map
    main.modules.weatherStationController.updateStations()

    // Update period data in timeline
    main.modules.timeline.updatePeriod(start, end)
  }


// --------------------------------------------------------------------------
// Dataset changes
// --------------------------------------------------------------------------

main.hub.onDatasetChange = (dataset) =>
  {
    // Update time bounds (min/max year)
    main.modules.timeController.setMinMaxYear(
      dataset.timePeriod[0], dataset.timePeriod[1]
    )

    // Update climate data for ClimateCell
    if (main.mode == 'C')
      main.modules.climateDatasetController.update()

    // Update climate data for WeatherStation
    if (main.mode == 'S')
      main.modules.weatherStationController.updateDataForStation()

  }

// --------------------------------------------------------------------------
// Diagram title changes
// --------------------------------------------------------------------------

main.hub.onDiagramTitleChange = (title) =>
  {
    // Update all diagrams
    main.modules.chartController.updateTitle(title)

    // Update user defined title
    main.modules.chartTitleSetter.update(title)
  }



///////////////////////////////////////////////////////////////////////////////
// ARCHIVE

// $(window).resize(function()
//   {
//     UI.setSliderLabels();
//     UI.activatePanning();
//   }
// );
