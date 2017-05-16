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

    this._minYear = main.config.endYear-main.config.periodLength
    this._maxYear = main.config.endYear-1
  }


  // ==========================================================================
  // Setter
  // ==========================================================================

  setMinYear(year)
  {
    // TODO: consistency check:
    // - really a year?
    // - smaller than max year?
    this._minYear = year
  }

  setMaxYear(year)
  {
    // TODO: consistency check:
    // - really a year?
    // - larger than min year?
    this._maxYear = year
  }


  // ==========================================================================
  // Getter
  // ==========================================================================

  getMinYear()
  {
    return this._minYear
  }

  getMaxYear()
  {
    return this._maxYear
  }

  getMinDate()
  {
    return (this._minYear + "-01-01T00:00:00Z")
  }

  getMaxDate()
  {
    return ((this._maxYear-1) + "-12-30T00:00:00Z")
  }

  getNumYears()
  {
    return this._maxYear - this._minYear
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

}
