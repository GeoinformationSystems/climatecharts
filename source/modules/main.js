/*
 * ClimateCharts (climatecharts.net)
 * Author: Marcus Kossatz and Felix Wiemann
 *
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

// Null value for data value in climate dataset
// -> If this is the value of a temperature cell it means that for this cell
// there is no data available
const CLIMATE_DATASET_NULL_VALUE = 9.969209968386869E36

// Range slider offset: How much does the range slider offset to the left and
// right to fit on the current range?
const RANGE_SLIDER_OFFSET = 5


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
    + "/weatherstations-api",
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
    maxYear:      2014,       // Maximum possible year of climate data
    periodLength: 30,         // Number of years in time period (default: 30)
    periodEnd:    2014,       // Initial end year of the period
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
    positions:        // [px]
    {
      width:          728,  // Reference: full width
      height:         420,  // Reference: initial full height
      titleTop:       5,    // Top margin for title
      subtitleTop:    25,   // Top margin for subtitle
      mainTop:        55,   // Top margin for main (= height of title area)
      footerTop:      50,   // Margin for footer
    },
    padding:          10,
    fontSizes:    // [em]
    {
      title:          1.4,
      huge:           1.2,
      large:          1.1,
      normal:         1.0,
      small:          0.9,
      tiny:           0.8,
    },
    colors:
    {
      temp:           d3.rgb(230,20, 20 ),
      prec:           d3.rgb(4,  61, 183),
      arid:           d3.rgb(255,233,15 ),
      humid:          d3.rgb(89, 131,213),
      perhumid:       d3.rgb(4,  61, 183),
      grid:           d3.rgb(211,211,211),
      axes:           d3.rgb(255,255,255),
      notAvailable:   d3.rgb(240,240,240),
    },
    footerOpacity:    0.4,
    charts:
    [
      {
        name:           'climate-chart',
        widthRatio:     0.75, // [%] of full width for diagram -> rest: table
        margin:         // [px]
        {
          left:         30,
          top:          0,
          right:        30,
          bottom:       0,
        },
        diagramMargin:  // [px]
        {
          max:          10, // vertical distance from top to max line
          min:          50, // vertical distance from bottom to min line
        },
        style:
        {
          tickSize:       5,
          gridWidth:      1,
          axesWidth:      2,
          lineWidth:      1.5,  // Lines for prec and temp
          areaOpacity:    0.7,  // For the areas between prec/temp lines
        },
        prec:
        {
          caption:        "Precipitation Sum",
          unit:           "mm",
          breakValue:     100,  // [mm] at which prec scale breaks
          distBelowBreak:  20,  // Humid: distance between two ticks
          distAboveBreak: 200,  // Perhumid: distance between two ticks
        },
        temp:
        {
          caption:        "Temperature Mean",
          unit:           "°C",
          dist:            10,  // Distance between two ticks
        },
        table:
        {
          heading:
          {
            month:        "Month",
            temp:         "Temp",
            prec:         "Precip",
          },
          margin:         // [px]
          {
            top:          12,   // Downshift from top line
            right:        10,   // Right margin for right-aligned cell values
            left:         15,   // Right margin for left-aligned cell values
          },
          maxHeight:      250,  // [px]
        },
        captionDist:      20,   // [px] distance between caption text fields
        mouseover:
        {
          circleRadius:   5.0,  // [px]
          strokeWidth:    2.0,  // [px]
        }
      },

      {
        name:           'distribution-chart',
        margin:         // [px]
        {
          left :        30,
          top:          30,
          right:        30,
          bottom:       0,
        },
        style:
        {
          boxOpacity:   0.7,  // For the boxplots
          axesWidth:    2.0,  // [px]
          gridWidth:    0.5,  // [px]
        },
        minMaxStretchFactor: 0.1,   // How much to stretch min/max values
        subcharts:
        [
          {
            data:       'temp',
            title:      "Distribution of Temperature [°C]",
            color:      'rgb(230, 20, 20)',
            maxRange:   [-40, +40]
          },
          {
            data:       'prec',
            title:      "Distribution of Precipitation [mm]",
            color:      'rgb(4, 61, 186)',
            maxRange:   [0, +1000]
          },
        ],
        switch:
        {
          title:      "Y-Axis Scaling",
          states:     ['automatic', 'fixed'],
        },
      },

      {
        name:         'availability-chart',
        margin:         // [px]
        {
          left:         50,
          top:          30,
          right:        20,
          bottom:       0,
        },
        style:
        {
          gridWidth:        1,
          squareWidth:      25,   // Dimension of cell sqares
          rowHeadWidth:     20,   // Width of row "heading" (year number)
          colHeadHeight:    12,   // Height of col heading (month / value)
          cellOpacity:      0.5,  // Opacity value for colored cells
          emphResizeFactor: 1.7,  // OnHover on cell, resize to
        },
        headings:
        {
          temp:         "Temp",
          prec:         "Prec",
        }
      },
    ],
  },

  climateData:
  {
    decimalPlaces: 2,     // Decimal precision for both temp / prec
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
    sourceName:       "Global Historical Climatology Network",
    sourceLink:       "www.ncdc.noaa.gov/ghcnm/",
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

    // Error handling: Can only be 'C' or 'S'
    if (!(newMode=="C" || newMode=="S"))
      newMode = 'C' // Default: cell

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

    // New mode ClimateCell: restore climate datasets and coordinates
    if (newMode == 'C')
    {
      main.modules.climateDatasetsInList.enable()
      main.modules.climateDatasetsInList.removeStationsTitle()
      main.modules.coordinatesInInfobox.enable()
    }

    // New mode WeatherStation: set datasets title and disable coordinates
    if (newMode == 'S')
    {
      main.modules.climateDatasetsInList.disable()
      main.modules.climateDatasetsInList.setStationsTitle()
      main.modules.coordinatesInInfobox.disable()
    }

    // Set new mode
    main.mode = newMode
  }


// --------------------------------------------------------------------------
// Location changes
// --------------------------------------------------------------------------

// Coords format: coords = {lat: Float, lng: Float}
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

main.hub.onMinMaxYearChange = (min, max) =>
  {
    // Update timeline
    main.modules.timeline.updateMinMaxYear(min, max)
  }

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
