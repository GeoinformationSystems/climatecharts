// ############################################################################
// MAIN CONFIGURATIONS
// ############################################################################
// Defines configuration data for the modules of the program..
// Tweak the values here without changing the actual source code.
// ############################################################################


let loadConfig = (main) =>
{
  main.config =
  {

    // ========================================================================
    time :
    {
      minYear:      1900,       // Minimum possible year of climate data
      maxYear:      2014,       // Maximum possible year of climate data
      periodLength: 30,         // Number of years in time period (default: 30)
      periodEnd:    2014,       // Initial end year of the period
    },

    // ========================================================================
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

    // ========================================================================
    coordinates:
    {
      decimalPlaces: 3,  // Visualized coordinate precision (lat/lng)
    },

    // ========================================================================
    climateCell:
    {
      style:
      {
        color:  '#000099',  // background color
        weight: 2,          // stroke width
      },
    },

    // ========================================================================
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
        tiny:           0.75,
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
        noData:         d3.rgb(240,240,240),
      },
      footerOpacity:    0.4,
      saveOptions:
      {
        png:
        {
          buttonName:     "PNG",
          fileExtension:  ".png",
          scaleFactor:    3,
          imageQuality:   0.9,
          fontDecreaseFactor: 0.85,  // To get proper font size for saved image
        },
        svg:
        {
          buttonName:     "SVG",
          fileExtension:  ".svg",
        },
      },
      charts:
      [

        // --------------------------------------------------------------------
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
            lineWidthBar:   0,
            areaOpacity:    0.7,  // For the areas between prec/temp lines
            barOpacity:    0.8,  // For the areas between prec/temp lines      
            barWidth: 26,
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
          },
          switch:
          {
            activeState: 0,
          },    
        },

        // --------------------------------------------------------------------
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

        // --------------------------------------------------------------------
        {
          name:         'availability-chart',
          margin:         // [px]
          {
            left:         50,
            top:          50,
            right:        20,
            bottom:       0,
          },
          style:
          {
            gridWidth:        1,    // Width of stroke of square
            squareWidth:      25,   // Dimension of cell sqares
            rowHeadWidth:     20,   // Width of row "heading" (year number)
            colHeadHeight:    12,   // Height of col heading (month / value)
            titleMargin:      45,   // Margin-bottom for title of the chart
            legendEntryMargin:3,    // Margin-top for entry in legend
            cellOpacity:      0.5,  // Opacity value for colored cells
          },
          headings:
          {
            title:        "Availability of Climate Data",
            temp:         "Temp",
            prec:         "Prec",
          },
          legend:
          {
            temp:         "Temperature data available",
            prec:         "Precipitation data available",
            noData:       "No data available",
          },
        },
      ],
    },

    // ========================================================================
    climateData:
    {
      decimalPlaces: 1,     // Decimal precision for both temp / prec
    },

    // ========================================================================
    datasetsInfobox:
    {
      ref:            "Data Reference",
      metadata:       "Metadata",
      resolution:     "Spatial Resolution",
      time:           "Temporal Coverage",
      station:        "Weather Station",
      coverage:       "Data Coverage Rate",
      gap:            "Largest Gap",
      missingMonths:  "Missing Months",
    },

    // ========================================================================
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
      source:
      {
        name:       "Global Historical Climatology Network",
        link:       "www.ncdc.noaa.gov/ghcnm/",
        description:
          "GHCN-Monthly provides climatological observations for four elements: monthly mean maximum temperature, minimum temperature, mean temperature, and monthly total precipitation. Since the early 1990s the Global Historical Climatology Network-Monthly (GHCN-M) dataset has been an internationally recognized source of data for the study of observed variability and change in land surface air temperature. It provides monthly mean temperature data for 7280 stations from 226 countries and territories, ongoing monthly updates of more than 2000 stations to support monitoring of current and evolving climate conditions, and homogeneity adjustments to remove non-climatic influences that can bias the observed temperature record.",
      },
    }
  }
}
