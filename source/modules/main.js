///////////////////////////////////////////////////////////////////////////////
// ClimateCharts (climatecharts.net)
// Author: Marcus Kossatz and Felix Wiemann
///////////////////////////////////////////////////////////////////////////////

// ##########################################################################
// MAIN OBJECT
// -> contains all configuration and modules
// ##########################################################################

let main = {}

loadConfig(main)
loadModules(main)
loadHub(main)


// ############################################################################
// Relicts from old website
// ############################################################################

// Switch between "Home", "Datasets & Software" and "About" tab.
$(".tab-links a").click( function (e)
  {
    let currentAttrValue = $(this).attr('href')
    $('.tabs ' + currentAttrValue).show().siblings().hide()
    $(this).parent('li').addClass('active').siblings().removeClass('active')
    e.preventDefault()
  }
)
