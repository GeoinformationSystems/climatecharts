// ############################################################################
// TimeController                                                   Controller
// ############################################################################
// Manages the temporal aspect of the information system
// - Set and get min and max year
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
    this._main = main


    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    // Possible min/max years of dataset
    this._minYear = main.config.time.minYear
    this._maxYear = main.config.time.maxYear

    // Selected time period of dataset
    this._periodStart = 1
      + main.config.time.periodEnd
      - main.config.time.periodLength
    this._periodEnd =   main.config.time.periodEnd


    // ------------------------------------------------------------------------
    // Setup View
    // ------------------------------------------------------------------------

    this._main.modules.timeline.init(
      this._minYear, this._maxYear, this._periodStart, this._periodEnd
    )
  }


  // ==========================================================================
  // Min/Max years of dataset
  // ==========================================================================

  setMinYear(year)
  {
    // Integrity check: really an integer?
    if (!this._main.modules.helpers.checkIfInt(year))
      return console.error("The given year is not an integer");

    // Ensure that minYear <= maxYear
    year = Math.min(year, this._maxYear)

    // Set year
    this._minYear = year

    // Adapt the period dates
    this._clipPeriod()

    // Tell everyone
    this._main.hub.onMinMaxYearChange(this._minYear, this._maxYear)
  }

  setMaxYear(year)
  {
    // Integrity check: really an integer?
    if (!this._main.modules.helpers.checkIfInt(year))
      return console.error("The given year is not an integer");

    // Ensure that minYear <= maxYear
    year = Math.max(year, this._minYear)

    // Set year
    this._maxYear = year

    // Adapt the period dates
    this._clipPeriod()

    // Tell everyone
    this._main.hub.onMinMaxYearChange(this._minYear, this._maxYear)
  }

  setMinMaxYear(minYear, maxYear)
  {
    // Integrity check: really an integer?
    if ((!this._main.modules.helpers.checkIfInt(minYear)) ||
        (!this._main.modules.helpers.checkIfInt(maxYear)) )
      return console.error("The given years are not integers");

    // Consistency check: minYear < maxYear?
    if (minYear > maxYear)
      [minYear, maxYear] = swapValues([minYear, maxYear])

    // Set years
    this._minYear = minYear
    this._maxYear = maxYear

    // Adapt the period dates
    this._clipPeriod()

    // Tell everyone
    this._main.hub.onMinMaxYearChange(this._minYear, this._maxYear)

  }

  getMinYear()
  {
    return this._minYear
  }

  getMaxYear()
  {
    return this._maxYear
  }

  getMinMaxYear()
  {
    return [this._minYear, this._maxYear]
  }


  // ==========================================================================
  // Start/End year of selected time period
  // ==========================================================================

  setPeriodStart(year)
  {
    // Integrity check: really an integer?
    if (!this._main.modules.helpers.checkIfInt(year))
      return console.error("The given year is not an integer");

    // Consistency check: periodStart >= minYear?
    if (year < this._minYear)
    {
      // If not, strip to minYear and move periodEnd
      let yearDiff = Math.abs(year-this._minYear)
      this._periodStart = this._minYear
      this._periodEnd += yearDiff
      // Ensure that periodEnd stays within bounds
      this._periodEnd = Math.min(this._periodEnd, this._maxYear)
    }
    else
    {
      // Consistency check: periodStart < periodEnd
      if (year > periodEnd)
        year = periodEnd

      this._periodStart = year
    }

    // Tell everyone
    this._main.hub.onPeriodChange(this._periodStart, this._periodEnd)
  }

  setPeriodEnd(year)
  {
    // Integrity check: really an integer?
    if (!this._main.modules.helpers.checkIfInt(year))
      return console.error("The given year is not an integer");

    // Consistency check: periodEnd <= maxYear?
    if (year > this._maxYear)
    {
      // If not, strip to maxYear and move periodStart
      let yearDiff = Math.abs(year-this._maxYear)
      this._periodEnd = this._maxYear
      this._periodStart -= yearDiff
      // Ensure that periodStart stays within bounds
      this._periodStart = Math.max(this._periodStart, this._minYear)
    }
    else
    {
      // Consistency check: periodStart < periodEnd
      if (year > periodEnd)
        year = periodEnd

      this._periodStart = year
    }

    // Tell everyone
    this._main.hub.onPeriodChange(this._periodStart, this._periodEnd)
  }

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
      let yearDiff = Math.abs((endYear-1)-this._maxYear)
      this._periodEnd   =   this._maxYear
      this._periodStart -=  yearDiff
      // TODO: something missing here?
      // Ensure that periodStart stays within bounds
      this._periodStart = Math.max(this._periodStart, this._minYear)
    }
    else
    {
      this._periodEnd =   endYear
      this._periodStart = endYear-length
    }

    // Tell everyone
    this._main.hub.onPeriodChange(this._periodStart, this._periodEnd)
  }

  getPeriodStart()
  {
    return this._periodStart
  }

  getPeriodStartDate()
  {
    return (this._periodStart + "-01-01T00:00:00Z")
  }

  getPeriodEnd()
  {
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

  // Clip the period years to min / max years
  _clipPeriod()
  {
    let dist = (this._periodEnd-this._periodStart)
    let periodStart = Math.max(this._periodStart, this._minYear)
    let periodEnd =   Math.min(this._periodEnd,   this._maxYear)

    // Maintain period length
    while ((periodEnd-periodStart) < dist)
    {
      if (periodEnd < this._maxYear)
        periodEnd++
      else if (periodStart > this._minYear)
        periodStart--
      else // There is no space to extend the period any more => keep it
        break
    }

    this.setPeriod((periodEnd-periodStart), periodEnd)
  }
}
