// ############################################################################
// ClimateChart                                                           View
// ############################################################################
//
// ############################################################################

class ClimateChart extends Chart
{

  constructor(main, climateData)
  {
    // ------------------------------------------------------------------------
    // Call super class for setting up the div container and climate data
    // ------------------------------------------------------------------------
    super(main, 'climate-chart', climateData)
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Init local members
  // ==========================================================================

  _initMembers(climateData)
  {
    super._initMembers(climateData)

    // ------------------------------------------------------------------------
    // Preparation: Position values for visualization elements
    // ------------------------------------------------------------------------

    // Position values of actual climate chart
    // -> Horizontal: left, right
    // -> Vertical: top, max, break, min, bottom
    this._chartPos = {
      left: ( 0
        + this._mainPos.left
        + this._chartsMain.padding
        + this._chartMain.margin.left
      ),
      top: ( 0
        + this._mainPos.top
        + this._chartsMain.padding
        + this._chartMain.margin.top
      ),
      right: ( 0
        + this._mainPos.left
        + Math.round(this._mainPos.width
          * this._chartMain.widthRatio)
        - this._chartsMain.padding
        - this._chartMain.margin.right
      ),
      bottom: ( 0
        + this._mainPos.bottom
        - this._chartsMain.padding
        - this._chartMain.margin.bottom
      ),
    }
    this._chartPos.width =  this._chartPos.right - this._chartPos.left
    this._chartPos.height = this._chartPos.bottom - this._chartPos.top

    // Init missing vertical position values (will be set later)
    this._chartPos.max = null
    this._chartPos.break = null
    this._chartPos.min = null

    // Position values of table next to climate chart
    this._tablePos = {
      left: ( 0
        + this._mainPos.left
        + Math.round(this._mainPos.width
          * this._chartMain.widthRatio)
        + this._chartsMain.padding
      ),
      top: ( 0
        + this._mainPos.top
        + this._chartsMain.padding
      ),
      right: ( 0
        + this._mainPos.right
        - this._chartsMain.padding
      ),
      bottom: ( 0
        + this._mainPos.bottom
        - this._chartsMain.padding
      ),
    }
    this._tablePos.width =  this._tablePos.right - this._tablePos.left

    // Limit height of table
    let height = Math.min(
      this._tablePos.bottom - this._tablePos.top,
      this._chartMain.table.maxHeight
    )
    this._tablePos.bottom = this._tablePos.top + height
    this._tablePos.height = height
  }


  // ========================================================================
  // Draw the whole chart
  // - left side: diagram
  //    * axes + ticks
  //    * grids
  //    * lines and areas for temp and prec
  //    * caption for temp and prec
  // - right side: table
  // ========================================================================

  _drawChart()
  {
    // ------------------------------------------------------------------------
    // Setup axes (1 x-axis, 2 y-axes for prec and temp and ticks)
    // ------------------------------------------------------------------------

    // Ticks for the y-axis: markers next to the axis showing the values
    // four representative points:
    // min:   Tick showing the absolute minimum value (optional)
    // zero:  Tick showing 0 (always at same position)
    // break: Tick at the break value (100 mm prec / 50 °C)
    // max:   Tick at the maximum prec value (optional)
    // -> temp ticks are between min and break value (no emp > 50 °C)
    // -> prec ticks are divided in two sections:
    //      humid zone between zero and break
    //      perhumid zone between break and max

    let ticks =
    {
      temp:
      {
        min:    null,
        zero:   null,
        break:  null,
        max:    null,
        values:
        {
          belowBreak: [],
          aboveBreak: [],
        },
      },
      prec:
      {
        min:    null,
        zero:   null,
        break:  null,
        max:    null,
        values:
        {
          belowBreak: [],
          aboveBreak: [],
        },
      }
    }

    // Status variable: is there a break value at which the chart
    // switches between the humid and the perhumid zone?
    let breakExists = false

    // Defs contains the paths that are later used for clipping the areas
    // between the temperature and precipitation lines.
    let defs = this._chart.append('defs')


    // ------------------------------------------------------------------------
    // Determine characteristic positions for temp and prec scale
    // (min, zero, break, max)
    // ------------------------------------------------------------------------

    // Scale ratios (below break): scale temp <-> scale prec => should be 2
    let scaleRatiobelowBreak =
      this._chartMain.prec.distBelowBreak /
      this._chartMain.temp.dist

    // 1) Zero: (0 for both)
    ticks.temp.zero = 0
    ticks.prec.zero = 0

    // 2) Min:
    // Temp: either (minimum value floored to multiples of 10 °C) or (0 °C)
    // -> avoid min temp above 0°C
    ticks.temp.min = Math.min(
      0,
      Math.floor(
        this._climateData.extreme.minTemp /
        this._chartMain.temp.dist
      ) * this._chartMain.temp.dist
    )

    // Prec: If there are negative temp values, the zeropoints of both y axes
    // must be in alignment => adapt
    ticks.prec.min = ticks.temp.min * scaleRatiobelowBreak

    // 3) Break: breakValue for prec, in ratio for temp
    ticks.prec.break = this._chartMain.prec.breakValue
    ticks.temp.break = ticks.prec.break / scaleRatiobelowBreak

    // 4) Max:
    // If prec exceeds the break line
    if (this._climateData.extreme.maxPrec > ticks.prec.break)
    {
      // Status: yes, break value exists
      breakExists = true

      // Preparation
      let breakValue = this._chartMain.prec.breakValue
      let precDistAbove = this._chartMain.prec.distAboveBreak
      let maxPrec = this._climateData.extreme.maxPrec
      let tempDist = this._chartMain.temp.dist
      let maxTemp = ticks.temp.break

      // Calculate max prec tick: Ceiled to distance above break line (200)
      // shifted by breakValue (100)
      ticks.prec.max = Math.ceil(
        (maxPrec - breakValue) / precDistAbove
      ) * precDistAbove + breakValue

      // Calculate max temp tick
      ticks.temp.max =
        ((ticks.prec.max - breakValue) / precDistAbove) *
        tempDist + maxTemp
    }

    // If prec does not exceed the break line, it is also the max line
    else
    {
      ticks.prec.max = ticks.prec.break
      ticks.temp.max = ticks.temp.break
    }


    // ------------------------------------------------------------------------
    // Fill up tick values
    // ------------------------------------------------------------------------

    // Temp below break: all from min to break value
    for (
      let tickValue =   ticks.temp.min;
      tickValue     <=  ticks.temp.break;
      tickValue     +=  this._chartMain.temp.dist
    )
      ticks.temp.values.belowBreak.push(tickValue)

    // Temp above break: non-existing

    // Prec below break: all from zero to break value
    for (
      let tickValue =   ticks.prec.zero;
      tickValue     <=  ticks.prec.break;
      tickValue     +=  this._chartMain.prec.distBelowBreak
    )
      ticks.prec.values.belowBreak.push(tickValue)

    // Prec above break: all from first after break to max
    // -> do not include the one at the break value since it already exists
    // in the tick values from below the break value
    for (
      let tickValue =   ticks.prec.break +
                        this._chartMain.prec.distAboveBreak;
      tickValue     <=  ticks.prec.max;
      tickValue     +=  this._chartMain.prec.distAboveBreak
    )
      ticks.prec.values.aboveBreak.push(tickValue)


    // ------------------------------------------------------------------------
    // Set vertical position values for climate chart visualization
    // Additive from top (max) to bottom (min) via min and zero line
    // ------------------------------------------------------------------------

    // Save initial bottom position
    let initBottomPos = this._chartPos.bottom

    // Idea: Make cells quadratic => get horizontal width of one cell
    let cellWidth = this._chartPos.width / (MONTHS_IN_YEAR.length-1)

    // Max position: top of diagram + space for diagram heading
    this._chartPos.max = 0
      + this._chartPos.top
      + this._chartMain.diagramMargin.max

    // Break position: initially same as max value
    this._chartPos.break = this._chartPos.max
    // If break value exists: set lower by number of cells above break line
    // Get Number of ticks (100, 300, 700, ...)
    // -> one was omitted to prevent duplicate tick at break line
    // => mentally add 1 to get correct number of ticks
    // -> cells are in between two ticks => one tick has to be omitted
    // => mentally subtract one => stay with number of tick values
    if (breakExists)
      this._chartPos.break += (cellWidth * ticks.prec.values.aboveBreak.length)

    // min position: between break and min (>=5 cells)
    this._chartPos.min = this._chartPos.break
      + cellWidth * (ticks.temp.values.belowBreak.length-1)

    // bottom position: min position + space for heading
    this._chartPos.bottom = 0
      + this._chartPos.min
      + this._chartMain.diagramMargin.min

    // Adapt chart size: final bottom position - initial bottom position
    this._resizeChartHeight(this._chartPos.bottom - initBottomPos)


    // ------------------------------------------------------------------------
    // Setup axes
    // ------------------------------------------------------------------------

    // x-Axis

    let xScale = d3.scale
      .ordinal()
      .domain(MONTHS_IN_YEAR)
      .range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .rangePoints(
        [
          this._chartPos.left,
          this._chartPos.right
        ], 0
      )

    let xAxis = d3.svg
      .axis()
      .scale(xScale)
      .tickSize(this._chartMain.style.tickSize)
      .tickSubdivide(true)
      .tickPadding(5)

    this._chart.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate('
        + 0
        + ', '
        + this._chartPos.min
        + ')'
      )
      .call(xAxis)


    // y-Axis left: temperature (below break value)

    let yScaleTempBelowBreak = d3.scale
      .linear()
      .domain(
        [
          ticks.temp.min,
          ticks.temp.break
        ]
      )
      .range(
        [
          this._chartPos.min,
          this._chartPos.break
        ]
      )

    let yAxisTempBelowBreak = d3.svg
      .axis()
      .scale(yScaleTempBelowBreak)
      .tickValues(ticks.temp.values.belowBreak)
      .tickSize(this._chartMain.style.tickSize)
      .orient('left')

    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartPos.left
        + ','
        + 0
        + ')'
      )
      .call(yAxisTempBelowBreak)
      .style('fill', this._chartsMain.colors.temp)


    // y-Axis left: temperature (above break value)
    // -> no ticks, because there are no values above 50 °C

    let yScaleTempAboveBreak = d3.scale
      .linear()
      .domain(
        [
          ticks.temp.break,
          ticks.temp.max
        ]
      )
      .range(
        [
          this._chartPos.max,
          this._chartPos.break,
        ]
      )

    let yAxisTempAboveBreak = d3.svg
      .axis()
      .scale(yScaleTempAboveBreak)
      .tickValues(ticks.temp.values.aboveBreak)
      .tickSize(this._chartMain.style.tickSize)
      .orient('left')

    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartPos.left
        + ','
        + 0
        + ')'
      )
      .call(yAxisTempAboveBreak)
      .style('fill', this._chartsMain.colors.temp)


    // y-Axis right: precipitation (below break value)

    let yScalePrecBelowBreak = d3.scale
      .linear()
      .domain(
        [
          ticks.prec.min,
          ticks.prec.break
        ]
      )
      .range(
        [
          this._chartPos.min,
          this._chartPos.break
        ]
      )

    let yAxisPrecBelowBreak = d3.svg
      .axis()
      .scale(yScalePrecBelowBreak)
      .tickValues(ticks.prec.values.belowBreak)
      .tickSize(this._chartMain.style.tickSize)
      .orient('right')

    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartPos.right
        + ', '
        + 0
        + ')'
      )
      .call(yAxisPrecBelowBreak)
      .style('fill', this._chartsMain.colors.prec)


    // y-Axis right: precipitation (above break value)

    let yScalePrecAboveBreak = d3.scale
      .linear()
      .domain(
        [
          ticks.prec.break,
          ticks.prec.max
        ]
      )
      .range(
        [
          this._chartPos.break,
          this._chartPos.max,
        ]
      )

    let yAxisPrecAboveBreak = d3.svg
      .axis()
      .scale(yScalePrecAboveBreak)
      .tickValues(ticks.prec.values.aboveBreak)
      .tickSize(this._chartMain.style.tickSize)
      .orient('right')

    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartPos.right
        + ', '
        + 0
        + ')'
      )
      .call(yAxisPrecAboveBreak)
      .style('fill', this._chartsMain.colors.prec)


    // Description of axes: units
    // TODO: fix deg sign

    this._chart.append('text')
      .attr('class', 'tick')
      .attr('text-anchor', 'start')
      .attr('x',    this._chartPos.left)
      .attr('y',    this._chartPos.top)
      .attr('fill', this._chartsMain.colors.temp)
      .text('[' + this._chartMain.temp.unit + ']')

    this._chart.append('text')
      .attr('class', 'tick')
      .attr('text-anchor', 'end')
      .attr('x',    this._chartPos.right)
      .attr('y',    this._chartPos.top)
      .attr('fill', this._chartsMain.colors.prec)
      .text('[' + this._chartMain.prec.unit + ']')


    // Styling for all axes and ticks

    this._chart.selectAll('.axis .domain')
    	.style('fill', 'none')
    	.style('stroke', 'black')
    	.style('stroke-width', this._chartMain.style.axesWidth + 'px')
    	.attr('shape-rendering', 'crispEdges');

    this._chart.selectAll('.tick')
    	.style('font-size', this._chartsMain.fontSizes.small + 'em');


    // ------------------------------------------------------------------------
    // Grid lines
    // concept: one line with one tick per value. The size of the tick is the
    // width / height of the chart => tick stretches all the way through the
    // chart and therefore serves as grid.
    // ------------------------------------------------------------------------

    // Grid in x-direction

    let xGrid = d3.svg
    	.axis()
    	.scale(xScale)
    	.tickSize(this._chartPos.max - this._chartPos.min)
    	.tickSubdivide(true)
    	.tickFormat('')

    this._chart.append('svg:g')
      .attr('class', 'grid')
      .attr('transform', 'translate('
        + 0
        + ','
        + this._chartPos.min
        + ')'
      )
      .call(xGrid)


    // Grid in y-direction (below break line)

    let yGridBelowBreak = d3.svg
    	.axis()
    	.scale(yScaleTempBelowBreak)
    	.tickValues(ticks.temp.values.belowBreak)
    	.tickSize(-(this._chartPos.width))
    	.orient('left')
    	.tickFormat('')

    this._chart.append('svg:g')
      .attr('class', 'grid')
      .attr('transform','translate('
        + this._chartPos.left
        + ','
        + 0
        + ')'
      )
      .call(yGridBelowBreak)


    // Grid in y-direction (above break line)

    if (breakExists)
    {
      let yGridAboveBreak = d3.svg
        .axis()
        .scale(yScalePrecAboveBreak)
        .tickValues(ticks.prec.values.aboveBreak)
        .tickSize(-this._chartPos.width)
        .orient('left')
        .tickFormat('')

      this._chart.append('svg:g')
        .attr('class', 'grid')
        .attr('transform','translate('
          + this._chartPos.left
          + ','
          + 0
          + ')'
        )
        .call(yGridAboveBreak)
    }


    // Styling
    this._chart.selectAll('.grid')
      .style('fill', 'none')
      .style('stroke', this._chartsMain.colors.grid)
      .style('stroke-width', this._chartMain.style.gridWidth + ' px')
      .attr('shape-rendering', 'crispEdges')


    // ------------------------------------------------------------------------
    // Lines for temp and prec
    // ------------------------------------------------------------------------

    // Temperature line

    let lineTemp = d3.svg
      .line()
      .x( (d) => {return xScale(d.month)} )
      .y( (d) => {return yScaleTempBelowBreak(d.temp)} )
      .interpolate('linear')

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', lineTemp(this._climateData.monthly_short))
      .attr('fill', 'none')
      .attr('stroke', this._chartsMain.colors.temp)
      .attr('stroke-width', this._chartMain.style.lineWidth)


    // Precipitation line below break

    let linePrecBelowBreak = d3.svg
      .line()
      .x( (d) => {return xScale(d.month)})
      .y( (d) => {return yScalePrecBelowBreak(d.prec)})
      .interpolate('linear')

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', linePrecBelowBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#rect-bottom)')
      .attr('fill', 'none')
      .attr('stroke', this._chartsMain.colors.prec)
      .attr('stroke-width', this._chartMain.style.lineWidth)


    // Precipitation line abovebreak

    if (breakExists)
    {
      let linePrecAboveBreak = d3.svg.line()
        .x( (d) => {return xScale(d.month)})
        .y( (d) => {return yScalePrecAboveBreak(d.prec)})
        .interpolate('linear')

      this._chart.append('svg:path')
        .attr('class', 'line')
        .attr('d', linePrecAboveBreak(this._climateData.monthly_short))
        .attr('clip-path', 'url(#rect-top)')
        .attr('fill', 'none')
        .attr('stroke', this._chartsMain.colors.prec)
        .attr('stroke-width', this._chartMain.style.lineWidth)
    }


    // ------------------------------------------------------------------------
    // Areas showing temp and prec
    // ------------------------------------------------------------------------

    // Area below temperature line

    let areaTemp = d3.svg
      .area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScaleTempBelowBreak(d.temp)})
      .y1(this._chartPos.min)
      .interpolate('linear')

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr('class', 'area')
      .attr('d', areaTemp(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-prec)')
      .attr('fill', this._chartsMain.colors.arid)
      .attr('stroke', 'none')


    // Area below precipitation line

    let areaPrecBelowBreak = d3.svg
      .area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScalePrecBelowBreak(d.prec)})
      .y1(this._chartPos.min)
      .interpolate('linear')

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr('class', 'area')
      .attr('d', areaPrecBelowBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-temp)')
      .attr('fill', this._chartsMain.colors.humid)
      .attr('stroke', 'none')

    let areaPrecAboveBreak = d3.svg
      .area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScalePrecAboveBreak(d.prec)})
      .y1(this._chartPos.break)
      .interpolate('linear')

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr('class', 'area')
      .attr('d', areaPrecAboveBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-temp2)')
      .attr('fill', this._chartsMain.colors.perhumid)
      .attr('stroke', 'none')


    // Areas functioning as clipping paths
    // -> Clip the areas defined above
    // -> Make the relevant parts for the climate chart visible

    let areaTempTo100 = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScaleTempBelowBreak(d.temp)})
      .y1(this._chartPos.break)
      .interpolate('linear')

    defs.append('clipPath')
      .attr('id', 'clip-temp')
      .append('path')
      .attr('d', areaTempTo100(this._climateData.monthly_short))

    let area100ToMax = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0(yScalePrecAboveBreak(this._chartMain.prec.breakValue))
      .y1(0)
      .interpolate('linear')

    defs.append('clipPath')
      .attr('id', 'clip-temp2')
      .append('path')
      .attr('d', area100ToMax(this._climateData.monthly_short))

    let areaAbovePrec = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScalePrecBelowBreak(d.prec)})
      .y1(this._chartPos.break)
      .interpolate('linear')

    defs.append('clipPath')
      .attr('id', 'clip-prec')
      .append('path')
      .attr('d', areaAbovePrec(this._climateData.monthly_short))


    // Cover overlapping prec lines resulting from break value

    if (breakExists)
    {
      defs.append('clipPath')
        .attr('id',     'rect-bottom')
        .append('rect')
        .attr('x',      this._chartPos.left)
        .attr('y',      this._chartPos.break)
        .attr('width',  this._chartPos.width)
        .attr('height', (this._chartPos.break - this._chartPos.max))

      defs.append('clipPath')
        .attr('id',     'rect-top')
        .append('rect')
        .attr('x',      this._chartPos.left)
        .attr('y',      this._chartPos.top)
        .attr('width',  this._chartPos.width)
        .attr('height', (this._chartPos.break - this._chartPos.max))
    }


    // Styling

    this._chart.selectAll('.area')
      .style('opacity', this._chartMain.style.areaOpacity)


    // ------------------------------------------------------------------------
    // Caption: prec sum and temp mean
    // ------------------------------------------------------------------------

    this._chart.append('text')
      .attr('class', 'info')
      .attr('x', 0
        + this._chartPos.left
        + this._chartPos.width / 2
        - this._chartMain.captionDist / 2
        - this._chartsMain.padding * 2
      )
      .attr('y', this._chartPos.bottom)
      .attr('text-anchor', 'end')
      .style('font-size', this._chartsMain.fontSizes.huge + 'em')
      .text( ''
        + this._chartMain.temp.caption
        + ': '
        + this._climateData.temp_mean
        + ' '
        + this._chartMain.temp.unit
      )

    this._chart.append('text')
      .attr('class', 'info')
      .attr('x', 0
        + this._chartPos.left
        + this._chartPos.width / 2
        - this._chartMain.captionDist / 2
        + this._chartsMain.padding * 2
      )
      .attr('y', this._chartPos.bottom)
      .attr('text-anchor', 'begin')
      .style('font-size', this._chartsMain.fontSizes.huge + 'em')      
      .text( ''
        + this._chartMain.prec.caption
        + ': '
        + this._climateData.prec_sum
        + ' '
        + this._chartMain.prec.unit
      )


    // ------------------------------------------------------------------------
    // Data Table
    // ------------------------------------------------------------------------

    // Y-domain: 1 heading + 12 months = 13
    let yDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

    // X-Positions: col 1-3, separators between 1|2 and 2|3
    let xPos = []
    for (let idx=1; idx<=6; idx++)
    {
      xPos.push( 0
        + this._tablePos.left
        + this._chartsMain.padding
        + this._tablePos.width * idx/6
      )
    }

    // X-direction (Month | Temp | Prec)

    let xScaleTable = d3.scale
      .ordinal()
      .domain([0, 1, 2, 3])
      .range( [0, 1, 2, 3])
      .rangePoints(
        [
          this._tablePos.left,
          this._tablePos.right
        ], 0
      )


    // Y-direction (Jan .. Dec)

    let yScaleTable = d3.scale
      .ordinal()
      .domain(yDomain)
      .range(
        [
          this._tablePos.top,
          this._tablePos.bottom
        ]
      )
      .rangePoints(
        [
          this._tablePos.top,
          this._tablePos.bottom
        ], 0
      )


    // Vertical column separators
    this._chart.append('line')
      .attr('x1', xPos[1])
      .attr('y1', this._tablePos.top - this._chartMain.table.margin.top)
      .attr('x2', xPos[1])
      .attr('y2', this._tablePos.bottom)
      .attr('shape-rendering', 'crispEdges')
      .style('stroke', this._chartsMain.colors.grid)

    this._chart.append('line')
      .attr('x1', xPos[3])
      .attr('y1', this._tablePos.top - this._chartMain.table.margin.top)
      .attr('x2', xPos[3])
      .attr('y2', this._tablePos.bottom)
      .attr('shape-rendering', 'crispEdges')
      .style('stroke', this._chartsMain.colors.grid)


    // Headings
    this._chart.append('text')
      .attr('x', xPos[0])
      .attr('y', this._tablePos.top)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text(this._chartMain.table.heading.month)

    this._chart.append('text')
      .attr('x', xPos[2])
      .attr('y', this._tablePos.top)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text(this._chartMain.table.heading.temp)

    this._chart.append('text')
      .attr('x', xPos[4])
      .attr('y', this._tablePos.top)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .text(this._chartMain.table.heading.prec)


    // Cell values: month
    this._chart.append('text')
      .attr('y', this._tablePos.top)
      .attr('text-anchor', 'start')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tablePos.top,
        this._tablePos.height / MONTHS_IN_YEAR.length,
        'month',
        xPos[0]-this._chartMain.table.margin.left
      )

    // Cell values: temp
    this._chart.append('text')
      .attr('y', this._tablePos.top)
      .attr('text-anchor', 'end')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tablePos.top,
        this._tablePos.height / MONTHS_IN_YEAR.length,
        'temp',
        xPos[3]-this._chartMain.table.margin.right
      )

    // Cell values: prec
    this._chart.append('text')
      .attr('y', this._tablePos.top)
      .attr('text-anchor', 'end')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tablePos.top,
        this._tablePos.height / MONTHS_IN_YEAR.length,
        'prec',
        xPos[5]-this._chartMain.table.margin.right
      )

    // Style for cell values
    this._chart.selectAll('.cell')
      .style('font-size', this._chartsMain.fontSizes.large + 'em')


    // ------------------------------------------------------------------------
    // Interaction: Mouseover effect
    // ------------------------------------------------------------------------

    this._chart.append('g')
      .attr('class', 'focus')
      .attr('visibility', 'hidden')

    this._chart.select('.focus')
      .append('circle')
      .attr('id', 'c1')
      .attr('r', this._chartMain.mouseover.circleRadius)
      .attr('fill', 'white')
      .attr('stroke', this._chartsMain.colors.temp)
      .style('stroke-width', this._chartMain.mouseover.strokeWidth)

    this._chart.select('.focus')
      .append('circle')
      .attr('id', 'c2')
      .attr('r', this._chartMain.mouseover.circleRadius)
      .attr('fill', 'white')
      .attr('stroke', this._chartsMain.colors.prec)
      .style('stroke-width', this._chartMain.mouseover.strokeWidth)


    // Event handling
    let showCircles = () =>
      {
        this._chart.select('.focus')
          .attr('visibility', 'visible')
      }

    let hideCircles = () =>
      {
        this._chart.select('.focus')
          .attr('visibility', 'hidden')
      }

    let defocusMonth = () =>
      {
        this._chart.selectAll('.cell')
          .attr('fill', 'black')
          .attr('font-weight', 'normal')
          .style('font-size', this._chartsMain.fontSizes.large + 'em')
          .style('text-shadow', 'none')
      }

    this._chartWrapper.mouseover(hideCircles)

    this._chartWrapper.mouseout(hideCircles)
    this._chartWrapper.mouseout(defocusMonth)

    this._chartWrapper.mousemove( (e) =>
      {
        // Get click position inside svg canvas
        let svg = this._chart[0][0]
        let clickPtReal = svg.createSVGPoint()
        clickPtReal.x = e.clientX
        clickPtReal.y = e.clientY
        let clickPtSVG = clickPtReal.matrixTransform(
          svg.getScreenCTM().inverse()
        )

        // Calculate closest distance between mouse position and tick
        let posX =    clickPtSVG.x
        let lowDiff = 1e99
        let xI =      null
        let tickPos = xScale.range()

        for (let i=0; i<tickPos.length; i++)
        {
          let diff = Math.abs(posX - tickPos[i])
          if (diff < lowDiff)
          {
            lowDiff = diff
            xI = i
          }
        }

        // Hack: for december, disable hover when far away
        // faw away = further than half distance between two ticks + a bit more
        if (lowDiff > ((tickPos[1]-tickPos[0])/2)*1.1)
        {
          hideCircles()
          defocusMonth()
          return
        }
        showCircles()

        let c1 =    this._chart.select('#c1')
        let c2 =    this._chart.select('#c2')
        let month = this._chart.select('#month_c' + xI)
        let temp =  this._chart.select('#temp_c' + xI)
        let prec =  this._chart.select('#prec_c' + xI)
        let rows =  this._chart.selectAll('.cell')

        // Highlight closest month in chart and table
        rows.attr('fill', 'black')
          .attr('font-weight', 'normal')
          .style('text-shadow', 'none')
        month.style('text-shadow', '1px 1px 2px gray')
          .attr('font-weight', 'bold')
        temp.attr('fill', this._chartsMain.colors.temp)
          .attr('font-weight', 'bold')
          .style('text-shadow', '1px 2px 2px gray')
        prec.attr('fill', this._chartsMain.colors.prec)
          .attr('font-weight', 'bold')
          .style('text-shadow', '2px 2px 2px gray')

        c1.attr('transform',
          'translate('
            + tickPos[xI] + ','
            + yScaleTempBelowBreak(this._climateData.monthly_short[xI].temp) + ')'
        )

        if (
          this._climateData.monthly_short[xI].prec <=
          this._chartMain.prec.breakValue
        )
        {
          c2.attr('transform',
            'translate('
              + tickPos[xI] + ','
              + yScalePrecBelowBreak(this._climateData.monthly_short[xI].prec) + ')'
          )
        }
        if (
          this._climateData.monthly_short[xI].prec >
          this._chartMain.prec.breakValue
        )
        {
          c2.attr('transform',
            'translate('
              + tickPos[xI] + ','
              + yScalePrecAboveBreak(this._climateData.monthly_short[xI].prec) + ')'
          )
        }
      }
    )

  }


  // ========================================================================
  // Helper function: Resize the height of the chart by x px
  // ========================================================================

  _resizeChartHeight(shiftUp)
  {
    // Resize whole container and footer
    super._resizeChartHeight(shiftUp);
  }


  // ========================================================================
  // Helper function: fill the columns of the data table
  // ========================================================================

  _fillColumn (col, data, tableOffset, tableHeight, column, x)
  {
    for (let i=0; i<MONTHS_IN_YEAR.length; i++)
    {
      let obj = data[i]

      for (let key in obj)
      {
        if (key === column)
        {
          let text = obj[key]
          if (typeof(obj[key]) === 'number')
            text = obj[key].toFixed(1)

          col.append('tspan')
            .attr('id', column + '_c' + i)
            .attr('class', 'cell')
            .attr('x', x)
            .attr('y', (tableHeight * (i+1)) + tableOffset)
            .style('text-align', 'right')
            .text(text)
        }
      }
    }
  }
}
