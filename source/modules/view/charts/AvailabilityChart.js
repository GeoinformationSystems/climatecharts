// ############################################################################
// AvailabilityChart                                                       View
// ############################################################################
// Visualizes the coverage/availability of the current ClimateData in a table:
// For each year, for each month show if temperature and/or precipitation data
// is available by coloring the taable cell gray or with the color.
// ############################################################################


class AvailabilityChart extends Chart {

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Construct chart
  // ==========================================================================

  constructor(main, climateData, id) {
    var id = id;
    // Error handling: Only show chart if either prec or temp are given
    if (climateData.has_temp || climateData.has_prec)
      super(main, 'availability-chart', climateData, id, null, true);

    else
      super(main, 'availability-chart', null, id, null, false)


  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Init local members
  // ==========================================================================

  _initMembers(climateData) {
    super._initMembers(climateData);

    // ------------------------------------------------------------------------
    // Preparation: Position values for visualization elements
    // ------------------------------------------------------------------------

    // Position values of actual climate chart
    // Pos from top, bottom, left, right and position of horizontal break bar
    this._chartPos = {
      left: (0
        + this._mainPos.left
        + this._chartsMain.padding
        + this._chartMain.margin.left
      ),
      top: (0
        + this._mainPos.top
        + this._chartsMain.padding
        + this._chartMain.margin.top
      ),
      right: (0
        + this._mainPos.left
        + this._mainPos.width
        - this._chartsMain.padding
        - this._chartMain.margin.right
      ),
      bottom: (0
        + this._mainPos.bottom
        - this._chartsMain.padding
        - this._chartMain.margin.bottom
      ),
    };
    this._chartPos.width = this._chartPos.right - this._chartPos.left;
    this._chartPos.height = this._chartPos.bottom - this._chartPos.top;

  }


  // ========================================================================
  // Draw the whole chart
  // ========================================================================
  // - availability grid
  // - legend
  // ========================================================================

  _setupChart() {
    super._setupChart();

    this._setupIntervals();
    this._drawCaption();
    this._drawGrid();
    this._drawGridHeadings();
    this._drawLegends();

  }

  _setupIntervals() {
    // Set up color intervals for temperature
    if (this._chartMain.switch.activeState == 0) {
      let minTemp = this._climateData.realextreme.minTemp;
      let maxTemp = this._climateData.realextreme.maxTemp;
      let range = maxTemp - minTemp;
      let interval = range / 6;

      this.range1 = minTemp + interval;
      this.range2 = minTemp + 2 * interval;
      this.range3 = minTemp + 3 * interval;
      this.range4 = minTemp + 4 * interval;
      this.range5 = minTemp + 5 * interval;
    }
    else if (this._chartMain.switch.activeState == 1) {
      this.range1 = 5;
      this.range2 = 10;
      this.range3 = 20;
      this.range4 = 30;
      this.range5 = 35;
    }
    else { // No Color Scaling defined for activeState of switch => set to first option
      return this._chartMain.switch.activeState = 0;
    }

    // Set up color intervals for precipitation
    if (this._chartMain.switch.activeState == 0) {
      let minPrec = this._climateData.realextreme.minPrec;
      let maxPrec = this._climateData.realextreme.maxPrec;
      let p_range = maxPrec - minPrec;
      let p_interval = p_range / 6;
      this.p_range1 = minPrec + p_interval;
      this.p_range2 = minPrec + 2 * p_interval;
      this.p_range3 = minPrec + 3 * p_interval;
      this.p_range4 = minPrec + 4 * p_interval;
      this.p_range5 = minPrec + 5 * p_interval;
    }
    else if (this._chartMain.switch.activeState == 1) {
      this.p_range1 = 40;
      this.p_range2 = 80;
      this.p_range3 = 120;
      this.p_range4 = 160;
      this.p_range5 = 200;
    }
    else { // No Color Scaling defined for activeState of switch => set to first option
      return this._chartMain.switch.activeState = 0;
    }


  }

  _drawGrid() {
    // ------------------------------------------------------------------------
    // Setup grid
    // ------------------------------------------------------------------------

    // Actual data: 2d array gridData[year][2*month]
    // 1) temp, 2) prec
    // => [0] = Jan temp, [1] = Jan prec, [2] = Feb temp, ... , [23] = Dec prec
    let gridData = [];

    // Inital values for calculating svg rect positions
    let xPos = this._chartPos.left;
    let yPos = this._chartPos.top;

    // Save initial yPos to calculate how much height must be added
    let lowtemp = false;
    let lowprecip = false;

    // For each year
    for (let yearIdx = 0; yearIdx < (this._climateData.years[1] - this._climateData.years[0] + 1); yearIdx++) {
      gridData.push([]);

      // For each month
      for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++) {
        let tempValue = this._climateData.temp[monthIdx].raw_data[yearIdx];

        // Assign temp color
        let tempColor;
        if (!this._main.modules.helpers.checkIfNumber(tempValue)) {
          tempColor = this._chartsMain.colors.noData;
        }
        else if (tempValue <= this.range1) {
          tempColor = this._chartsMain.tempcolors.t_range1;
          lowtemp = true;
        }
        else if (this.range1 < tempValue && tempValue <= this.range2) {
          tempColor = this._chartsMain.tempcolors.t_range2;
          lowtemp = true;
        }
        else if (this.range2 < tempValue && tempValue <= this.range3) {
          tempColor = this._chartsMain.tempcolors.t_range3;
          lowtemp = false;
        }
        else if (this.range3 < tempValue && tempValue <= this.range4) {
          tempColor = this._chartsMain.tempcolors.t_range4;
          lowtemp = false;
        }
        else if (this.range4 < tempValue && tempValue <= this.range5) {
          tempColor = this._chartsMain.tempcolors.t_range5;
          lowtemp = false;
        }
        else if (this.range5 < tempValue) {
          tempColor = this._chartsMain.tempcolors.t_range6;
          lowtemp = false;
        }

        // Add temp grid cell to gridData
        gridData[yearIdx].push(
          {
            x: xPos,
            y: yPos,
            width: this._chartMain.style.squareWidth,
            color: tempColor,
            value: tempValue,
            flag: lowtemp,
          }
        );
        // Increment the x position => move it over
        xPos += this._chartMain.style.squareWidth;


        // Same procedure for prec value
        let precValue = this._climateData.prec[monthIdx].raw_data[yearIdx];

        // Assign prec color
        let precColor;
        if (!this._main.modules.helpers.checkIfNumber(precValue)) {
          precColor = this._chartsMain.colors.noData;
          lowprecip = false;
        }
        else if (precValue <= this.p_range1) {
          precColor = this._chartsMain.precipcolors.p_range1;
          lowprecip = true;
        }
        else if (this.p_range1 < precValue && precValue <= this.p_range2) {
          precColor = this._chartsMain.precipcolors.p_range2;
          lowprecip = true;
        }
        else if (this.p_range2 < precValue && precValue <= this.p_range3) {
          precColor = this._chartsMain.precipcolors.p_range3;
          lowprecip = false;
        }
        else if (this.p_range3 < precValue && precValue <= this.p_range4) {
          precColor = this._chartsMain.precipcolors.p_range4;
          lowprecip = false;
        }
        else if (this.p_range4 < precValue && precValue <= this.p_range5) {
          precColor = this._chartsMain.precipcolors.p_range5;
          lowprecip = false;
        }
        else if (this.p_range5 < precValue) {
          precColor = this._chartsMain.precipcolors.p_range6;
          lowprecip = false;
        }

        // Add prec grid cell to gridData
        gridData[yearIdx].push(
          {
            x: xPos,
            y: yPos,
            width: this._chartMain.style.squareWidth,
            color: precColor,
            value: precValue,
            flag: lowprecip,
          }
        );

        // Increment the x position => move it over
        xPos += this._chartMain.style.squareWidth

      }

      // Reset the x position after a row is complete
      xPos = this._chartPos.left;
      // Increment the y position for the next row => Move it down
      yPos += this._chartMain.style.squareWidth
    }

    let row = this._chart.selectAll('.ac-row')
      .data(gridData)
      .enter()
      .append('g')
      .classed('ac-row', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true);

    row.selectAll('.square')
      .data((d) => { return d })
      .enter()
      .append('rect')
      .attr('class', 'grid')
      .attr('x', (d) => { return d.x })
      .attr('y', (d) => { return d.y })
      .attr('width', (d) => { return d.width })
      .attr('height', (d) => { return d.width })
      .style('fill', (d) => { return d.color })
      .style('stroke', this._chartsMain.colors.grid)
      .style('stroke-width', this._chartMain.style.gridWidth + ' px')
      .attr('shape-rendering', 'crispEdges');

    // Create text containing the actual value
    row.selectAll('.square')
      .data((d) => { return d })
      .enter()
      .append('text')
      .attr('class', 'ac-active-cell-text')
      .attr('x', (d) => { return (d.x + d.width / 2) })
      .attr('y', (d) => { return (d.y + d.width / 2) })
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('fill', (d) => {
        if (d.flag) { return 'black' }
        else { return 'white' }
      }
      )
      .attr('font-size', this._main.config.charts.fontSizes.tiny + 'em')
      .text((d) => {
        return (
          this._main.modules.helpers.roundToDecimalPlace
            (
              d.value, this._main.config.climateData.decimalPlaces, true
            )
        )
      }
      );

    // Add height: (final y pos - start y pos - start height)
    this._resizeChartHeight(yPos - this._chartPos.top - this._chartPos.height);
  }

  _drawGridHeadings() {

    // Make row headings: year number
    let yPos = 0
      + this._chartPos.top
      + this._chartMain.style.squareWidth / 2;

    for (let yearIdx = 0; yearIdx < (this._climateData.years[1] - this._climateData.years[0] + 1); yearIdx++) {
      let year = this._climateData.years[0] + yearIdx;
      // Place heading
      this._chart.append('text')
        .classed('ac-year', true)
        .classed(this._chartName + this._chartCollectionId + '-ac', true)
        .attr('text-anchor', 'end')
        .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
        .attr('alignment-baseline', 'middle')
        .attr('x', 0
          + this._chartPos.left
          - this._chartsMain.padding
        )
        .attr('y', yPos)
        .text(year);
      // Go to next y position
      yPos += this._chartMain.style.squareWidth
    }


    // Make column headings:
    // 1) month (12) 2) data type prec/temp (12*2=24)
    //   Jan     Feb     Mar    ...
    //  T   P   T   P   T   P   ...
    let xPos = 0
      + this._chartPos.left
      + this._chartMain.style.squareWidth;

    for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++) {
      let month = MONTHS_IN_YEAR[monthIdx];

      // Place 1st heading: month
      this._chart.append('text')
        .classed('ac-year', true)
        .classed(this._chartName + this._chartCollectionId + '-ac', true)
        .attr('text-anchor', 'middle')
        .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
        .attr('x', xPos)
        .attr('y', 0
          + this._chartPos.top
          - this._chartMain.style.colHeadHeight * 2
        )
        .text(month);

      // Place 2nd heading: T | P
      this._chart.append('text')
        .classed('ac-year', true)
        .classed(this._chartName + this._chartCollectionId + '-ac', true)
        .attr('text-anchor', 'middle')
        .attr('font-size', (this._chartsMain.fontSizes.tiny + 'em'))
        .attr('x', 0
          + xPos
          - this._chartMain.style.squareWidth / 2
        )
        .attr('y', 0
          + this._chartPos.top
          - this._chartMain.style.colHeadHeight
        )
        .text(this._chartMain.headings.temp);

      this._chart.append('text')
        .classed('ac-year', true)
        .classed(this._chartName + this._chartCollectionId + '-ac', true)
        .attr('text-anchor', 'middle')
        .attr('font-size', (this._chartsMain.fontSizes.tiny + 'em'))
        .attr('x', 0
          + xPos
          + this._chartMain.style.squareWidth / 2
        )
        .attr('y', 0
          + this._chartPos.top
          - this._chartMain.style.colHeadHeight
        )
        .text(this._chartMain.headings.prec);

      // Increment to next month
      xPos += (2 * this._chartMain.style.squareWidth)
    }
  }

  _drawCaption() {
    // ------------------------------------------------------------------------
    // Caption: Availability Chart
    // ------------------------------------------------------------------------
    this._chart.append('text')
      .attr('text-anchor', 'middle')
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('font-size', (this._chartsMain.fontSizes.huge + 'em'))
      .attr('x', (this._mainPos.width / 2))
      .attr('y', 0
        + this._chartPos.top
        - this._chartMain.style.titleMargin
      )
      .text(this._chartMain.headings.title);
  }

  _drawSingleLegend(colorKeys, heading, minValue, maxValue) {

    this._resizeChartHeight(this._chartMain.style.squareWidth + this._chartsMain.padding);

    // Legend cells
    var index = 0;
    for (let color of Object.keys(colorKeys)) {
      this._chart.append('rect')
        .classed('ac-legend-cell', true)
        .classed(this._chartName + this._chartCollectionId + '-ac', true)
        .attr('x', this._chartPos.left + index * this._chartMain.style.squareWidth)
        .attr('y', this._chartPos.bottom - this._chartMain.style.squareWidth)
        .attr('width', this._chartMain.style.squareWidth)
        .attr('height', this._chartMain.style.squareWidth)
        .style('fill', colorKeys[color])
        .style('stroke', this._chartsMain.colors.grid)
        .style('stroke-width', this._chartMain.style.gridWidth + ' px');

      index++;
    }

    // Legend title
    this._chart.append('text')
      .classed('ac-text', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
      .attr('x', 0
        + this._chartPos.left
        + this._chartsMain.padding
        + Object.keys(colorKeys).length * this._chartMain.style.squareWidth
      )
      .attr('y', 0
        + this._chartPos.bottom
        - 0.5 * this._chartMain.style.squareWidth
      )
      .text(heading)

    // Legend min value
    this._chart.append('text')
      .classed('ac-text', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (this._chartsMain.fontSizes.tiny + 'em'))
      .attr('fill', 'black')
      .attr('x', 0
        + this._chartPos.left
        + 0.5 * this._chartMain.style.squareWidth
      )
      .attr('y', 0
        + this._chartPos.bottom
        - 0.66 * this._chartMain.style.squareWidth
      )
      .text('<');

    this._chart.append('text')
      .classed('ac-text', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (this._chartsMain.fontSizes.tiny + 'em'))
      .attr('fill', 'black')
      .attr('x', 0
        + this._chartPos.left
        + 0.5 * this._chartMain.style.squareWidth
      )
      .attr('y', 0
        + this._chartPos.bottom
        - 0.33 * this._chartMain.style.squareWidth
      )
      .text(minValue);

    // Legend max value
    this._chart.append('text')
      .classed('ac-text', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (this._chartsMain.fontSizes.tiny + 'em'))
      .attr('fill', 'white')
      .attr('x', 0
        + this._chartPos.left
        + (Object.keys(colorKeys).length - 0.5) * this._chartMain.style.squareWidth
      )
      .attr('y', 0
        + this._chartPos.bottom
        - 0.66 * this._chartMain.style.squareWidth
      )
      .text('>');

    this._chart.append('text')
      .classed('ac-text', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (this._chartsMain.fontSizes.tiny + 'em'))
      .attr('fill', 'white')
      .attr('x', 0
        + this._chartPos.left
        + (Object.keys(colorKeys).length - 0.5) * this._chartMain.style.squareWidth
      )
      .attr('y', 0
        + this._chartPos.bottom
        - 0.33 * this._chartMain.style.squareWidth
      )
      .text(maxValue);
  }

  _drawLegends() {

    // Temperature Legend
    this._drawSingleLegend(this._chartsMain.tempcolors, this._chartMain.legend.temp, this.range1.toFixed(1), this.range5.toFixed(1));

    // Precipitation Legend
    this._drawSingleLegend(this._chartsMain.precipcolors, this._chartMain.legend.prec, this.p_range1.toFixed(1), this.p_range5.toFixed(1));

    // ------------------------------------------------------------------------
    // No Data Legend
    // ------------------------------------------------------------------------

    this._resizeChartHeight(this._chartsMain.padding);
    // No data legend cell
    this._chart.append('rect')
      .classed('ac-legend-cell', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('x', this._chartPos.left)
      .attr('y', this._chartPos.bottom)
      .attr('width', this._chartMain.style.squareWidth)
      .attr('height', this._chartMain.style.squareWidth)
      .style('fill', this._chartsMain.colors.noData)
      .style('stroke', this._chartsMain.colors.grid)
      .style('stroke-width', this._chartMain.style.gridWidth + ' px');

    // No data legend title
    this._chart.append('text')
      .classed('ac-text', true)
      .classed(this._chartName + this._chartCollectionId + '-ac', true)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
      .attr('x', 0
        + this._chartPos.left
        + this._chartMain.style.squareWidth
        + this._chartsMain.padding
      )
      .attr('y', 0
        + this._chartPos.bottom
        + 0.5 * this._chartMain.style.squareWidth
      )
      .text(this._chartMain.legend.noData)
  }

  // ========================================================================
  // Helper function: Resize the height of the chart by x px
  // ========================================================================

  _resizeChartHeight(shiftUp) {
    // Resize whole container and footer
    super._resizeChartHeight(shiftUp);

    // Resize model:
    this._chartPos.bottom += shiftUp

  }
}
