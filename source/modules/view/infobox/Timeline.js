// ############################################################################
// Timeline                                                               View
// ############################################################################
// Manages the timeline in the infobox on the right using the jQuery UI Slider.
// It receives the dimension of the slider (absolute min & max year) and
// handles the selected time period (periodStart & periodEnd) with the slider.
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
    this._main = main;

    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._sliderDiv =       $('#slider');
    this._periodStartDiv =  $('#period-start');
    this._periodEndDiv =    $('#period-end');

    this._minYear = null;
    this._maxYear = null;

    this._sliderExists = false
  }


  // ==========================================================================
  // Init timeline (after all controllers are fully loaded)
  // ==========================================================================

  init(minYear, maxYear, periodStart, periodEnd)
  {
    this._minYear = minYear;
    this._maxYear = maxYear;

    // ------------------------------------------------------------------------
    // Event Handling
    // ------------------------------------------------------------------------

    this._sliderExists = true;

    this._sliderDiv.slider(
      {
        range:  true,
        min:    minYear,
        max:    maxYear,
        values: [periodStart, periodEnd],

        // When bar or min/max handle is dragged
        slide:  (evt) =>
          {
            setTimeout( () =>
              {
                let periodStart = this._sliderDiv.slider("values", 0);
                let periodEnd =   this._sliderDiv.slider("values", 1);
                this.updatePeriod(periodStart, periodEnd)
              }, 10
            )
          },

        // When bar or min/max handle finished dragging
        change: (evt) =>
          {
            if (!this._clickedOnRange)
              this._periodChanged();
            this._updateRangeSliderPosition()
          },

        // When slider is completely created
        create: (evt) =>
          {
            // Click on slider bar -> move it
            // There is no simple way to stop the current slider
            // implementation from working with their event handlers
            // => Create own invisible bar above that can be changed
            this._rangeSlider = $("<div id='range-slider'></div>");
            $("body").append(this._rangeSlider);

            // range slider background bar for maximum range of all datasets
            this._backgroundSlider = $("<div id='background-slider'></div>");
            this._backgroundSlider.insertBefore($("#slider"));

            // Determine drag movement of range slider
            let xPos = null;
            let leftRangePos = null;
            let yearDist = null;
            let yearsPerPx = null;
            let sliderHandles = $('.ui-slider-handle');

            // append some spans on slider handles for labels
            sliderHandles.first().append('<span id="sliderHandleMinYear">' + minYear + '</span>');
            sliderHandles.last().append('<span id="sliderHandleMaxYear">' + maxYear + '</span>');

            this._updateRangeSliderPosition();

            this._rangeSlider.on('mousedown touchstart', (evt) =>
              {
                this._clickedOnRange = true;
                xPos = evt.clientX;
                yearsPerPx = (maxYear-minYear) / this._sliderDiv.width();
                leftRangePos =  sliderHandles.first().position().left;
                yearDist = 0
                  + this._sliderDiv.slider("values", 1)
                  - this._sliderDiv.slider("values", 0)
              }
            );

            $(window.document).on('mousemove touchmove', (evt) =>
              {
                // Peform moving of the range slider
                if (this._clickedOnRange)
                {
                  // Prevent selection of other elements
                  if (evt.stopPropagation)
                    evt.stopPropagation();
                  if (evt.preventDefault)
                    evt.preventDefault();
                  evt.cancelBubble = true;
                  evt.returnValue = false;

                  // Calculate move distance
                  let newXPos = evt.clientX;
                  let moveDistance = newXPos-xPos;

                  // Apply move distance on range slider
                  let rangeSliderOldXPos = this._rangeSlider.position().left;
                  this._rangeSlider.css('left',
                    rangeSliderOldXPos + moveDistance
                  );

                  // Apply move distance on actual slider
                  let newLeftRangePos = leftRangePos + moveDistance;
                  let leftRangeValue = Math.abs(
                    yearsPerPx*newLeftRangePos + minYear
                  );
                  this._sliderDiv.slider("values", 0, leftRangeValue);

                  let rightRangeValue = leftRangeValue+yearDist;
                  this._sliderDiv.slider("values", 1, rightRangeValue);

                  // Clip to min / max year
                  if (leftRangeValue < minYear)
                    leftRangeValue = minYear;
                  if (rightRangeValue > maxYear)
                    rightRangeValue = maxYear;

                  // Round to full year
                  leftRangeValue = Math.round(leftRangeValue);
                  rightRangeValue = Math.round(rightRangeValue);

                  // Update view
                  this.updatePeriod(leftRangeValue, rightRangeValue);

                  // Reset variable
                  xPos = newXPos;
                  leftRangePos = newLeftRangePos
                }
              }
            );

            $(window.document).on('mouseup touchend', (evt) =>
              {
                // Fire change event
                if (this._clickedOnRange)
                  this._periodChanged();

                // Reset variables
                this._clickedOnRange = false;
                xPos = null;
                leftRangePos  = null;
                yearDist = null
              }
            );


            // Hack: Ensure that slider range has always the correct position
            setTimeout(this._updateRangeSliderPosition, 1000);
            setTimeout(this._updateRangeSliderPosition, 2000);
            setTimeout(this._updateRangeSliderPosition, 5000)
          }
      }
    );

    // Initially setup dimension of timeline and initially selected period
    this.updateMinMaxYear(minYear, maxYear);
    this.updatePeriod(periodStart, periodEnd);

    // Ensure that slider range has always the correct position
    $(window).resize(this._updateRangeSliderPosition);

    // ------------------------------------------------------------------------
    // Reset the timeline to the original position
    // ------------------------------------------------------------------------

    $('#reset-timeline').click( (e) =>
    {
        e.preventDefault();
        this._main.modules.timeController.resetPeriod()
    }
    )
  }


  // ==========================================================================
  // Update period and min/max years
  // ==========================================================================

  updatePeriod(start, end)
  {
    // Clip to min/max year
    start = Math.max(start, this._minYear);
    start = Math.min(start, this._maxYear);
    end =   Math.max(end, this._minYear);
    end =   Math.min(end, this._maxYear);
    this._periodStartDiv.html(start);
    this._periodEndDiv.html(end);
    $('#sliderHandleMinYear').text(start);
    $('#sliderHandleMaxYear').text(end);
  }

  updateMinMaxYear(min, max)
  {
    this._minYear = min;
    this._maxYear = max;
    this._sliderDiv.slider("option", "min", min);
    this._sliderDiv.slider("option", "max", max)
  }


  // ==========================================================================
  // Reinit the whole timeline
  // ==========================================================================

  update(minYear, maxYear, periodStart, periodEnd)
  {
    // Cleanup
    if (this._sliderExists)
    {
      this._sliderDiv.slider("destroy");
      this._rangeSlider.remove()
      this._backgroundSlider.remove()
    }
    // Init again
    this.init(minYear, maxYear, periodStart, periodEnd)
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // After finish dragging range slider or min/max handles change period dates
  // ==========================================================================

  _periodChanged()
  {
    let leftYear = this._sliderDiv.slider("values", 0);
    let rightYear = this._sliderDiv.slider("values", 1);
    this._main.modules.timeController.setPeriod(
      (rightYear-leftYear), rightYear
    )
  }


  // ==========================================================================
  // Update position of range slider
  // ==========================================================================

  _updateRangeSliderPosition()
  {
    let infoboxDiv = $('#box-input-timeline');
    $('#slider').css(
      {
        'width':      (infoboxDiv.width()*(main.modules.timeController.getMaxYear() - main.modules.timeController.getMinYear())) / (main.config.time.maxYear - main.config.time.minYear),
        'left':       (infoboxDiv.width()*(main.modules.timeController.getMinYear() - main.config.time.minYear)) / (main.config.time.maxYear - main.config.time.minYear),
      }
    )
    $('#background-slider').css(
      {
        'width':        infoboxDiv.width(),
      }
    )
    
    let rangeDiv = $('.ui-slider-range');
    $('#range-slider').css(
      {
        'top':        rangeDiv.offset().top,
        'left':       rangeDiv.offset().left + RANGE_SLIDER_OFFSET,
        'width':      rangeDiv.width() - RANGE_SLIDER_OFFSET*2,
        'height':     rangeDiv.height(),
      }
    )
    
  }

}
