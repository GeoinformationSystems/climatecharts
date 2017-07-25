// ############################################################################
// TIMELINE                                                               View
// ############################################################################
// Manages the timeline in the list
// - Use jQuery UI Slider and properly set up slider
// - Receive absolute min and max year (dimension of slider)
// - Manage selected time period (periodStart and periodEnd) with a time slider
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

    this._sliderDiv =       $('#slider')
    this._periodStartDiv =  $('#period-start')
    this._periodEndDiv =    $('#period-end')

  }


  // ==========================================================================
  // Init after all controllers are fully loaded
  // ==========================================================================

  init(minYear, maxYear, periodStart, periodEnd)
  {
    // ------------------------------------------------------------------------
    // Event Handling
    // ------------------------------------------------------------------------

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
                let periodStart = this._sliderDiv.slider("values", 0)
                let periodEnd =   this._sliderDiv.slider("values", 1)
                this.updatePeriod(periodStart, periodEnd)
              },10
            )
          },

        // When bar or min/max handle finished dragging
        change: (evt) =>
          {
            if (!this._clickedOnRange)
              this._periodChanged()
            this._updateRangeSliderPosition()
          },

        // When slider is completely created
        create: (evt) =>
          {
            // Click on slider bar -> move it
            // There is no simple way to stop the current slider
            // implementation from working with their event handlers
            // => Create own invisible bar above that can be changed
            let rangeSlider = $("<div id='range-slider'></div>")
            $("body").append(rangeSlider)

            // Determine drag movement of range slider
            let xPos = null
            let leftRangePos = null
            let yearDist = null
            let yearsPerPx = null
            let sliderHandles = $('.ui-slider-handle')

            rangeSlider.on('mousedown touchstart', (evt) =>
              {
                this._clickedOnRange = true
                xPos = evt.clientX
                yearsPerPx = (maxYear-minYear) / this._sliderDiv.width()
                leftRangePos =  sliderHandles.first().position().left
                yearDist = 1
                  + this._sliderDiv.slider("values", 1)
                  - this._sliderDiv.slider("values", 0)
              }
            )

            $(window.document).on('mousemove touchmove', (evt) =>
              {
                // Peform moving of the range slider
                if (this._clickedOnRange)
                {
                  // Prevent selection of other elements
                  if (evt.stopPropagation)
                    evt.stopPropagation()
                  if (evt.preventDefault)
                    evt.preventDefault()
                  evt.cancelBubble = true
                  evt.returnValue = false

                  // Calculate move distance
                  let newXPos = evt.clientX
                  let moveDistance = newXPos-xPos

                  // Apply move distance on range slider
                  let rangeSliderOldXPos = rangeSlider.position().left
                  rangeSlider.css('left', rangeSliderOldXPos+moveDistance)

                  // Apply move distance on actual slider
                  let newLeftRangePos = leftRangePos + moveDistance
                  let leftRangeValue = Math.abs(
                    yearsPerPx*newLeftRangePos + minYear
                  )
                  this._sliderDiv.slider("values", 0, leftRangeValue)

                  let rightRangeValue = leftRangeValue+yearDist
                  this._sliderDiv.slider("values", 1, rightRangeValue)

                  // Clip to min / max year
                  if (leftRangeValue < minYear)
                    leftRangeValue = minYear
                  if (rightRangeValue > maxYear)
                    rightRangeValue = maxYear

                  // Round to full year
                  leftRangeValue = Math.round(leftRangeValue)
                  rightRangeValue = Math.round(rightRangeValue)

                  // Update view
                  this.updatePeriod(leftRangeValue, rightRangeValue)

                  // Reset variable
                  xPos = newXPos
                  leftRangePos = newLeftRangePos
                }
              }
            )

            $(window.document).on('mouseup touchend', (evt) =>
              {
                // Fire change event
                if (this._clickedOnRange)
                  this._periodChanged()

                // Reset variables
                this._clickedOnRange = false
                xPos = null
                leftRangePos  = null
                yearDist = null
              }
            )


            // Hack: Ensure that slider range has always the correct position
            setTimeout(this._updateRangeSliderPosition, 1000)
            setTimeout(this._updateRangeSliderPosition, 2000)
            setTimeout(this._updateRangeSliderPosition, 5000)
          }
      }
    )

    // Initially setup dimension of timeline and initially selected period
    this.updateMinMaxYear(minYear, maxYear)
    this.updatePeriod(periodStart, periodEnd)

    // Ensure that slider range has always the correct position
    $(window).resize(this._updateRangeSliderPosition)
  }


  // ==========================================================================
  // Update period and min/max years
  // ==========================================================================

  updatePeriod(start, end)
  {
    this._periodStartDiv.html(start)
    this._periodEndDiv.html(end)
  }

  updateMinMaxYear(min, max)
  {
    this._sliderDiv.slider("option", "min", min)
    this._sliderDiv.slider("option", "max", max)
  }



  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // After finish dragging range slider or min/max handles change period dates
  // ==========================================================================

  _periodChanged()
  {
    let leftYear = this._sliderDiv.slider("values", 0)
    let rightYear = this._sliderDiv.slider("values", 1)
    this._main.modules.timeController.setPeriod(
      (rightYear-leftYear), rightYear
    )
  }


  // ==========================================================================
  // Update position of range slider
  // ==========================================================================

  _updateRangeSliderPosition()
  {
    let rangeDiv = $('.ui-slider-range')
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
