// ############################################################################
// TIMELINE                                                               View
// ############################################################################
// Manages the timeline in the list
// - Use jQuery UI Slider
// - Receive absolute min and max year and set up slider
// - Manage selected time period (min and max year)
// ############################################################################


class Timeline
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main)
  {
    this._main = main

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._sliderDiv = $('#slider')


    // ------------------------------------------------------------------------
    // Setup Slider
    // ------------------------------------------------------------------------

    let currentDatasetPeriod = this._main.modules.climateDatasetController.getSelectedDataset().timePeriod
    let minYear = this._main.modules.timeController.getMinYear()
    let maxYear = this._main.modules.timeController.getMaxYear()

    this._slider = this._sliderDiv.slider(
      {
        range:  true,
        min:    currentDatasetPeriod[0],
        max:    currentDatasetPeriod[0],
        values: [minYear, maxYear]
      }

    )



  }

/*
  // =========================== H E A D E R =========================== //

  // MEMBER FUNCTIONS

  // constructor
  Timeline.initTimeline = initTimeline;
  Timeline.initRange = initRange;
  Timeline.initNowMarker = initNowMarker;

  // nowMarker control
  Timeline.setNowMarker = setNowMarker;

  // animation control
  Timeline.playAni = playAni;
  Timeline.pauseAni = pauseAni;
  Timeline.toggleAni = toggleAni;
  Timeline.clickAni = clickAni;
  Timeline.changeSpeed = changeSpeed;
  Timeline.changeDirection = changeDirection;


  // MEMBER VARIABLES

  // important elements
  var myTimeline = $('#tlMain');
  var myPlayButt = $('#playButt');
  var myDirectVal = $('#directionVal');
  var mySpeedVal = $('#speedVal');
  var myNowMarker = null;

  // timeline
  var myDecadePos = [];             // array containing positions of decade year markers
  var myTlWidth = 0;              // width of timeline
  var myYearDist = 0;             // distance between two years on timeline [px]
  var myMinYear = 0;

  // animation
  var myDestPos = 0;            	// current destination position in timeline for animation
  var myAni = null;               // reference to interval animation
  var myAniRun = false;           // is animation running?
  var myAniSpeedValues;           // array containing range of possible animation speed values
  var myAniSpeed = 2;             // current animation speed (position in speed range array), normal = 2
  var myAniDirect = 1;            // current animation direction (forward or backward)


  // =================== I M P L E M E N T A T I O N =================== //


  //CONSTRUCTOR

  function initTimeline()
  {
    // initially set nowMarker
    myTimeline.append($('<div id="nowMarker"></div>'));
    myNowMarker = $('#nowMarker');
    // initialise animation
    myAniSpeedValues = new Array (0.15, 0.3, 0.75, 1.5, 2.75);
    myDestPos = myTlWidth;
    // set speed and direction name in boxes
    mySpeedVal.html(loc('aniSpeed'+myAniSpeed));
    myDirectVal.html(loc('aniDirection'+myAniDirect));
  }

  function initRange(inMinYear, inMaxYear)
  {
    myMinYear = inMinYear;
    myTlWidth = myTimeline.width();                       // total width of timeline [px]
    myYearDist = myTlWidth / (inMaxYear-inMinYear);       // distance between two years on timeline [px/year]
    var numMarkers = Math.floor((inMaxYear-inMinYear)/10);
    // set each 10-year marker yearDist*10 px further
    for (var i=0; i<=numMarkers; i++)
    {
      var markerYear = (i*10)+inMinYear;
      var id = markerYear;
      var pos = i*myYearDist*10;
      myTimeline.append($('<div id="'+id+'" class="yearMarker"><p>'+markerYear+'</p></div>'));
      $('#'+id).css('left', pos);
      myDecadePos.push(pos);
    }
  }

  function initNowMarker(inYear)
  {
    setNowMarker(yearToPos(inYear));
  }

  //NOW MARKER

  function setNowMarker(inPos, convert)
  {
    if (convert)
      inPos = toTlPos(inPos);

    // clip nowMarker position to tlMain and stop animation there
    if (inPos < 0)
    {
      inPos = 0;
      pauseAni();
    }
    if (inPos > myTlWidth)
    {
      inPos = myTlWidth;
      pauseAni();
    }

    // reset marker
    myNowMarker.css('left', inPos);

    // if at the beginning or end of timeline, reset animation direction
    if (inPos == 0)
    {
      changeDirection(1);     // ani at beginning -> move forward
      pauseAni();
    }
    else if (inPos == myTlWidth)
    {
      changeDirection(-1)     // ani at end -> move backward
      pauseAni();
    }

    // tell controller which year is now
    Controller.setNowYear(posToYear(inPos));
  }


  //ANIMATION CONTROL

  function playAni(inToInf)
  {
    // if animation shall run to infinity, check what the current direction is and set extreme values as destination position
    if (inToInf)
    {
      if (myAniDirect == -1)
        myDestPos = 0;
      else
        myDestPos = myTlWidth;
    }
    myAni = setInterval( function()
      {
        var oldPos = parseFloat(myNowMarker.css('left'));

        // stop animation when ani destionation reached
        if (Math.abs(oldPos-myDestPos)<3)
        {
          pauseAni();
          setNowMarker(myDestPos);
        }
        // add new position onto old position
        var outPos = oldPos + (myAniDirect*myAniSpeedValues[myAniSpeed]);
        setNowMarker(outPos);
      }, 20);
    myAniRun = true;

    // toggle player
    myPlayButt.css('background-image','url(graphics/pause.png)');
  }

  function pauseAni()
  {
    clearInterval(myAni);
    myAniRun = false;
    if (myAniDirect == 1)  myPlayButt.css('background-image','url(graphics/playForw.png)');
    else                   myPlayButt.css('background-image','url(graphics/playBack.png)');
  }

  function toggleAni()
  {
    // if animation pauses -> play it
    if (!myAniRun)  playAni(true);
    // if animation plays -> pause it
    else            pauseAni();
  }


  function clickAni(inPos)
  {
    // pause current animation, make a new one to the desired position
    pauseAni();

    // determine destination and direction of animation
    myDestPos = panToDecade(inPos);
    var oldPos = parseFloat(myNowMarker.css('left'));
    changeDirection((myDestPos >= oldPos) ? 1 : -1);

    // start animating nowMarker towards destination
    playAni();
  }

  function changeSpeed(inSpeed)
  {
    // pause ani first
    var state = myAniRun;
    if (state) pauseAni();
    // change animation speed
    myAniSpeed += inSpeed;
    // clip to min/max
    myAniSpeed = Math.min(myAniSpeed, myAniSpeedValues.length-1);
    myAniSpeed = Math.max(myAniSpeed, 0);
    // set speed value text
    mySpeedVal.html(loc('aniSpeed'+myAniSpeed));
    // restart animation
    if (state) playAni();
  }

  function changeDirection(inDirection)
  {
    // pause ani first
    var state = myAniRun;
    if (state) pauseAni();
    // change animation direction
    myAniDirect = inDirection;
    // set speed value text
    myDirectVal.html(loc('aniDirection'+myAniDirect));
    // possibly toggle play button
    if (myAniDirect == 1)
      myPlayButt.css('background-image','url(graphics/playForw.png)');
    else
      myPlayButt.css('background-image','url(graphics/playBack.png)');
    // restart animation
    if (state) playAni();
  }


  //AUXILIARY FUNCTIONS

  function panToDecade(inPos)
  {
    // check if close to decade year markers
    for (var i in myDecadePos)
      if (Math.abs(inPos-myDecadePos[i]) < 12)
        inPos = myDecadePos[i];
    return inPos;
  }

  function posToYear(inPos)
  {
    // year ~ clickPos in tlMain
    return Math.round((inPos/myYearDist)+myMinYear);
  }

  function yearToPos (inYear)
  {
    return Math.round(myYearDist*(inYear-myMinYear));
  }

  return Timeline;
*/

}
