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
      minYear:      1750,       // Minimum possible year of climate data
      maxYear:      2023,       // Maximum possible year of climate data
      periodLength: 30,         // Number of years in time period (default: 30)
      periodEnd:    2023,       // Initial end year of the period
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
    climateCell:            // map marker: rectangle
    {
      style:
      {
        color:  '#000099',  // stroke and background color
        weight: 2,          // stroke width
      },
    },

    // ========================================================================
    charts:
    {
      parentContainer:  'main-container-charts',
      className:        'chart',
      referenceURL:     'ClimateCharts.net',
      positions:        // [px]
      {
        width:          728,  // Reference: full width
        height:         420,  // Reference: initial full height
        titleTop:       10,   // Top margin for title
        subtitleTop:    35,   // Top margin for subtitle
        mainTop:        65,   // Top margin for main (= height of title area)
        footerTop:      50,   // Margin for footer
      },
      padding:          10,
      fontSizes:    // [em]
      {
        title:          1.5,
        huge:           1.3,
        large:          1.2,
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
        noData:         d3.rgb(70, 71, 73),
      },
      tempcolors:
      {
        t_range1:           d3.rgb(249,231,174),
        t_range2:           d3.rgb(234,196,134),
        t_range3:           d3.rgb(218,156,91),
        t_range4:           d3.rgb(198,109,46),
        t_range5:           d3.rgb(171,56,22),
        t_range6:           d3.rgb(125,0,37),
      },
      precipcolors:
      {
        p_range1:           d3.rgb(215,244,207),
        p_range2:           d3.rgb(154,220,187),
        p_range3:           d3.rgb(24,189,176),
        p_range4:           d3.rgb(0,149,175),
        p_range5:           d3.rgb(0,93,158),
        p_range6:           d3.rgb(38,24,95),
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
            availabilityOpacity: 0.9,  
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
            circleRadius:   4.0,  // [px]
            strokeWidth:    2.0,  // [px]
          },
          switch:
          {
            title:      "",
            // states:     ['Walter-Lieth Chart', 'Bar Chart', 'Step Chart'],
            states:     ['Walter-Lieth Chart', 'Bar Chart'],
            statesDisplay: [
              '<i class="fas fa-chart-area" aria-hidden="true"></i>', 
              '<i class="fas fa-chart-bar" aria-hidden="true"></i>', 
              '<i class="fas fa-map" aria-hidden="true"></i>'
              ],
            activeState: 0,
          }, 
          availabilitybar:{
            // oneMonthPercentage : 3.33,
            colorInterval: 5,  
            temp: "Missing Temperature Data",
            prec: "Missing Precipitation Data",
            avail: "Percentage of Missing Data"
          },   
          availabilitycolors:{
            a_range6:           d3.rgb(249,  249,  249),
            a_range5:           d3.rgb(218,  218,  218),
            a_range4:           d3.rgb(174,  174,  174),
            a_range3:           d3.rgb(126,  126,  126),
            a_range2:           d3.rgb(76 ,  76 ,  76),
            a_range1:           d3.rgb(27 ,  27 ,  27),
            // hardbreak:          d3.rgb(255,0,0)
          },
          infoTextNotEnoughData: "There is not enough data available for the selected station to create a climate chart. Please choose a different time period or take a look at the other charts of your selection which you can find in the sidepanel of this chart's container. Detailed information regarding the availability of the data can be found in the ",
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
            states:     ['relative', 'fixed'],
            statesDisplay: ['Relative', 'Fixed'],
            // statesDisplay: [
            //   '<img class="switch-icons-img" src="data/img/fine1/yscale-relative.png" />', 
            //   '<img class="switch-icons-img" src="data/img/fine1/yscale-fixed.png" />',
            // ],
            activeState: 0,
          },
        },

        // --------------------------------------------------------------------
        {
          name:         'availability-chart',
          margin:         // [px]
          {
            left:         50,
            top:          50,
            right:        50,
            bottom:       0,
          },
          style:
          {
            gridWidth:        1,    // Width of stroke of square
            squareWidth:      26,   // Dimension of cell squares
            rowHeadWidth:     20,   // Width of row "heading" (year number)
            colHeadHeight:    12,   // Height of col heading (month / value)
            titleMargin:      45,   // Margin-bottom for title of the chart
          },
          headings:
          {
            title:        "Availability of Climate Data",
            temp:         "Temp",
            prec:         "Prec",
          },
          legend:
          {
            temp:         "Temperature Scale [°C]",
            prec:         "Precipitation Scale [mm]",
            noData:       "No data available",
          },
          switch:
          {
            title:      "Color Scaling",
            states:     ['relative', 'fixed'],
            statesDisplay: ['Relative', 'Fixed'],
            activeState: 0,
          },
        },
        // --------------------------------------------------------------------
        {
          name:         'map-chart',
          margin:         // [px]
          {
            left :        30,
            top:          30,
            right:        30,
            bottom:       0,
          },
        },
      ],
    },

    // ========================================================================
    climateData:
    {
      decimalPlaces: 1,     // Decimal precision for both temp / prec
      startWithDataset: "CRU Time Series v4.07",
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
        link:       "https://www.ncdc.noaa.gov/ghcnm/",
        description:
          "GHCN-Monthly provides climatological observations for four elements: monthly mean maximum temperature, minimum temperature, mean temperature, and monthly total precipitation. Since the early 1990s the Global Historical Climatology Network-Monthly (GHCN-M) dataset has been an internationally recognized source of data for the study of observed variability and change in land surface air temperature. It provides monthly mean temperature data for 7280 stations from 226 countries and territories, ongoing monthly updates of more than 2000 stations to support monitoring of current and evolving climate conditions, and homogeneity adjustments to remove non-climatic influences that can bias the observed temperature record.",
      },
    }
  }
};
