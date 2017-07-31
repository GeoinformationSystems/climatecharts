// ##########################################################################
// TIME
// ##########################################################################

// Months
const MONTHS_IN_YEAR =
[
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]
const SUMMER_MONTHS =     [3, 8]    // April (3) until September (8)


// ##########################################################################
// SPACE
// ##########################################################################

// Extent of geographic coordinates (in lat/lng)
const LAT_EXTENT = 90
const LNG_EXTENT = 180

// Hemispheres for lat and lng (1st entry: coord < 0, 2nd entry: coord > 0)
const LAT_HEMISPHERE =    ["S", "N"]
const LNG_HEMISPHERE =    ["W", "E"]


// ##########################################################################
// PHYSICS
// ##########################################################################

// Conversion factors
const KELVIN_TO_CELSIUS = 273.15
const CM_TO_MM =          10

// Null value for data value in climate dataset
// -> If this is the value of a temperature cell it means that for this cell
// there is no data available
const CLIMATE_DATASET_NULL_VALUES =
  [
    9.969209968386869E36,
    -9.969209968386869e+36
  ]


// ##########################################################################
// USABILITY
// ##########################################################################

// Range slider offset: How much does the range slider offset to the left and
// right to fit on the current range?
const RANGE_SLIDER_OFFSET = 5


// ============================================================================
// DATABASE CONNECTION
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
