// ############################################################################
// TimeController                                                   Controller
// ############################################################################
// Manages all temporal aspects of the application
// - For the current dataset/station:           min & max year
// - For the current state of the application:  period start & end year
// ############################################################################


class TimeController
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

    // Possible min/max years of dataset / weather station
    this._minYear = main.config.time.minYear;
    this._maxYear = main.config.time.maxYear;

    // Selected time period of dataset
    this._periodStart = 1
      + main.config.time.periodEnd
      - main.config.time.periodLength;
    this._periodEnd = 0
      + main.config.time.periodEnd;
    
  }


  // ==========================================================================
  // Min/Max years of dataset
  // ==========================================================================

  setMinMaxYear(minYear, maxYear)
  {
    // Integrity check: really an integer?
    if ((!this._main.modules.helpers.checkIfInt(minYear)) ||
        (!this._main.modules.helpers.checkIfInt(maxYear)) )
      return console.error("The given years are not integers");

    // Consistency check: minYear < maxYear?
    if (minYear > maxYear)
      [minYear, maxYear] = swapValues([minYear, maxYear]);

    // Set years
    this._minYear = minYear;
    this._maxYear = maxYear;

    // Adapt the period dates
    this._clipPeriod();

    // Tell everyone
    this._main.hub.onMinMaxYearChange(this._minYear, this._maxYear)

  }


  // ==========================================================================
  // Get Min/Max year of dataset
  // ==========================================================================

  getMinYear()
  {
    //this._minYear = this._main.modules.chartController.getMinYear();
    return this._minYear
  }

  getMaxYear()
  {
    //this._maxYear = this._main.modules.chartController.getMaxYear();
    return this._maxYear
  }

  getMinMaxYear()
  {
    return [this._minYear, this._maxYear]
  }


  // ==========================================================================
  // Set Start/End year of selected time period
  // ==========================================================================

  setPeriod(length, endYear)
  {
    // Integrity check: really an integer?
    if ((!this._main.modules.helpers.checkIfInt(length)) ||
        (!this._main.modules.helpers.checkIfInt(endYear)) )
      return console.error("The given years are not integers");

    // Consistency check: periodEnd <= maxYear?
    if ((endYear-1) > this._maxYear)
    {
      // If not, strip to maxYear and move periodStart
      let yearDiff = Math.abs((endYear-1)-this._maxYear);
      this._periodEnd   =   this._maxYear;
      this._periodStart -=  yearDiff;
      // TODO: something missing here?
      // Ensure that periodStart stays within bounds
      this._periodStart = Math.max(this._periodStart, this._minYear)
    }
    else
    {
      this._periodEnd =   endYear;
      this._periodStart = endYear-length
    }

    // Tell everyone
    this._main.modules.chartController.setTimePeriod(this._periodStart, this._periodEnd);
    this._main.hub.onPeriodChange(this._periodStart, this._periodEnd)
  }

  resetPeriod()
  {
    // Get end date from config and clip with max year
    this._periodEnd = this._main.config.time.periodEnd;
    this._periodEnd = Math.min(this._periodEnd, this._maxYear);

    // Get start date from end date and clip with min year
    this._periodStart = 0
      + this._periodEnd
      - this._main.config.time.periodLength;
    this._periodStart = Math.max(this._periodStart, this._minYear);

    // Update
    this._main.modules.chartController.setTimePeriod(this._periodStart, this._periodEnd);
    this._main.hub.onResetPeriod(this._periodStart, this._periodEnd)

  }


  // ==========================================================================
  // Get Start/End year of selected time period
  // ==========================================================================

  getPeriodStart()
  {
    this._periodStart = this._main.modules.chartController.getStartPeriod();
    return this._periodStart
  }

  getPeriodStartDate()
  {
    return (this._periodStart + "-01-01T00:00:00Z")
  }

  getPeriodEnd()
  {
    this._periodEnd = this._main.modules.chartController.getEndPeriod();
    return this._periodEnd
  }

  getPeriodEndDate()
  {
    return ((this._periodEnd-1) + "-12-30T00:00:00Z")
  }

  getPeriod()
  {
    return [this._periodStart, this._periodEnd]
  }

  getPeriodLength()
  {
    return (this._periodEnd - this._periodStart + 1)
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Clip the period years to min / max years
  // ==========================================================================

  _clipPeriod()
  {
    let dist = (this._periodEnd-this._periodStart);
    let periodStart = Math.max(this._periodStart, this._minYear);
    let periodEnd =   Math.min(this._periodEnd,   this._maxYear);

    // Maintain period length
    while ((periodEnd-periodStart) < dist)
    {
      if (periodEnd < this._maxYear)
        periodEnd++;
      else if (periodStart > this._minYear)
        periodStart--;
      else // There is no space to extend the period any more => keep it
        break
    }

    this.setPeriod((periodEnd-periodStart), periodEnd)
  }

}
