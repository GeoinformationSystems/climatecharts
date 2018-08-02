///////////////////////////////////////////////////////////////////////////////
// ClimateCharts (climatecharts.net)
// Author: Marcus Kossatz and Felix Wiemann
///////////////////////////////////////////////////////////////////////////////


// ############################################################################
// MAIN FILE
// ############################################################################
// This is the first file that is executed on startup of the application.
// Loads the MAIN object of the application that contains all relevant data:
// - Configuration  (sizes, positions, colors, ...)
// - Modules        (initialization of the view and controller classes)
// - Hub            (communication between view and controller classes)
// ############################################################################


let main = {};


// ==========================================================================
// Program Mode: Which kind of climate data is currently loaded?
//  'C':  ClimateCell     -> data from simulated dataset (raster data)
//  'S':  WeatherStation  -> data from weather station dataset (point data)
// ==========================================================================

main.mode = 'C';


// Load configuration, modules and hub

loadConfig(main);    // Source in: source/modules/main/config.js
loadModules(main);   // Source in: source/modules/main/modules.js
loadHub(main);       // Source in: source/modules/main/hub.js


// ############################################################################
// Relicts from old website
// ############################################################################

// Switch between "Home", "Datasets & Software" and "About" tab.
$(".tab-links a").click( function (e)
  {
    let currentAttrValue = $(this).attr('href');
    $('.tabs ' + currentAttrValue).show().siblings().hide();
    $(this).parent('li').addClass('active').siblings().removeClass('active');
    e.preventDefault()
  }
);
