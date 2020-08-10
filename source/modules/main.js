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


// Switch between "Home", "Datasets & Software" and "About" tab.
$(".tab-links a").click( function (e)
  {
    let currentAttrValue = $(this).attr('href');
    $('.tabs ' + currentAttrValue).show().siblings().hide();
    $(this).parent('li').addClass('active').siblings().removeClass('active');
    e.preventDefault()
  }
);

// Standalone switch between content pages (e.g. used in 'more info' Link from Cookie-Overlay-Div) 
function showTabContent(e, currentTab){
    $('.tabs ' + currentTab).show().siblings().hide()
    $(".tab-links [href='" + currentTab + "']").parent('li').addClass('active').siblings().removeClass('active')
    e.preventDefault()
}

// Manage visibilty of 'Cookie Information Box'
function setCookieAndHideDiv( accept ){
  if(accept) {
    _paq.push(['rememberCookieConsentGiven']);
    document.cookie = 'cookie_declined=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    $('label[for=optout] strong').text('You are currently accepting tracking cookies. Click here to opt out.');
  }
  else {
    _paq.push(['forgetCookieConsentGiven']);
    setCookie('cookie_declined','true',365);
    $('label[for=optout] strong').text('You are currently not accepting tracking cookies. Click here to opt in.');
  }
  $("#optout").prop("checked", accept);
  $("#cookieScreen").css('display','none');
}

function setCookie(cname, cvalue, exdays) {
    let d = new Date()
    d.setTime(d.getTime() + (exdays*24*60*60*1000))
    let expires = "expires="+d.toUTCString()
    document.cookie = cname + "=" + cvalue + "; " + expires
}
function getCookie(cname) {
     let name = cname + "="
     let cookieArray = document.cookie.split(';')
     for(let i=0; i<cookieArray.length; i++) {
        let c = cookieArray[i];
        while (c.charAt(0)==' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length)
     }
     return "";
 } 


$(document).ready(function(){
  if( getCookie("mtm_cookie_consent") != "" )
  {
    setCookieAndHideDiv( true );
    $("#cookieScreen").css('display','none')
  }
  else if( getCookie("cookie_declined") == "true")
  {
    setCookieAndHideDiv( false );
    $("#cookieScreen").css('display','none')
  }

  $("#optout").on("click", function() {
    if (this.checked) {
      setCookieAndHideDiv( true );
    } else {
      setCookieAndHideDiv( false );
    }
  });

})
