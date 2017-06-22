// ############################################################################
// ClimateChart                                                           View
// ############################################################################
// ############################################################################

class ClimateChart extends Chart
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Construct chart
  // ==========================================================================

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

  _drawChart()
  {
    // Dimensions of actual climate chart
    this._chartDimensions = {
      left: ( 0
        + this._mainDimensions.left
        + this._chartsMain.structure.full.padding
        + this._chartMain.diagram.margin.left
      ),
      top: ( 0
        + this._mainDimensions.top
        + this._chartsMain.structure.full.padding
        + this._chartMain.diagram.margin.top
      ),
      right: ( 0
        + this._mainDimensions.left
        + Math.round(this._mainDimensions.width
          * this._chartMain.diagram.widthRatio)
        - this._chartsMain.structure.full.padding
        - this._chartMain.diagram.margin.right
      ),
      bottom: ( 0
        + this._mainDimensions.bottom
        - this._chartsMain.structure.full.padding
        - this._chartMain.diagram.margin.bottom
      ),
    }

    this._chartDimensions.width = 0
      + this._chartDimensions.right
      - this._chartDimensions.left
    this._chartDimensions.height = 0
      + this._chartDimensions.bottom
      - this._chartDimensions.top

    // Dimensions of table next to climate chart
    this._tableDimensions = {
      left: ( 0
        + this._mainDimensions.left
        + Math.round(this._mainDimensions.width
          * this._chartMain.diagram.widthRatio)
        + this._chartsMain.structure.full.padding
      ),
      top: ( 0
        + this._mainDimensions.top
        + this._chartsMain.structure.full.padding
      ),
      right: ( 0
        + this._mainDimensions.right
        - this._chartsMain.structure.full.padding
      ),
      bottom: ( 0
        + this._mainDimensions.bottom
        - this._chartsMain.structure.full.padding
      ),
    }

    this._tableDimensions.width = 0
      + this._tableDimensions.right
      - this._tableDimensions.left
    this._tableDimensions.height = 0
      + this._tableDimensions.bottom
      - this._tableDimensions.top

    // Does the precipitation value exceed the break line?
    // => is there a break line?
    let maxPrec = this._climateData.extreme.maxPrec
    let breakValue = this._chartMain.diagram.prec.breakValue
    this._isBreakLine = (maxPrec < breakValue) ? false : true

    console.log(this._isBreakLine);

    // Placeholder for the specific ticks shown on the vertical axes.
    this._ticksYTemp = []
    this._ticksYPrecBelowBreak = []
    this._ticksYPrecAboveBreak = []

    // Value definition placeholders for the axes.
    this._heightPrecBreakLine = 0
    this._negativeHeightY1 = 0

    // Calculate the stepsize between two axis tick marks based on the
    // standard height value and the number of ticks
    // -> assuming there aren´t any negative temp values.
    this._stepSizeY1 = ( 0
        + this._chartDimensions.height
      ) / 5

      // The ticks for all y axes have to be calculated manually to make sure
      // that they are in alignment and have the correct ratio.
    this._setTickValues()

    // Value domains for temp and prec values
    // [min, breakLine, max)]
    // -> will be changed later on
    this._tempScale =
      [
        this._ticksYTemp[0],
        this._chartMain.diagram.tempMaxValue,
        this._chartMain.diagram.tempMaxValue,
      ]
    this._precScale =
      [
        0,
        this._chartMain.diagram.prec.breakValue,
        this._chartMain.diagram.prec.breakValue,
      ]


    // =======================================================================
    // Preparation: functions to calculate position / range / intervals / ...
    // for visualization elements in the graph
    // =======================================================================

    // ------------------------------------------------------------------------
    // Scales: map input data interval (domain) to visualized interval (range)
    // ------------------------------------------------------------------------


    // X-Axis: Scale for months
    let xScale = d3.scale
      .ordinal()
      .domain(MONTHS_IN_YEAR)
      .range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .rangePoints(
        [
          this._chartDimensions.left,
          this._chartDimensions.right
        ], 0
      )

    // Y-Axis: temp scale below break line
    // from 0 to maximum temperature (50°C)
    let yScaleTempBelowBreak = d3.scale
      .linear()
      .domain(
        [
          this._tempScale[0],
          this._tempScale[1]
        ]
      )
      .range(
        [
          this._chartDimensions.bottom,
          this._chartDimensions.top + this._heightPrecBreakLine
        ]
      )

    // Y-Axis: temp scale above break
    let yScaleTempAboveBreak = d3.scale
      .linear()
      .domain(
        [
          this._tempScale[1],
          this._tempScale[2]
        ]
      )
      .range(
        [
          this._chartDimensions.top + this._heightPrecBreakLine,
          this._chartDimensions.top
        ]
      )

    // Y-Axis: prec scale below break line
    let yScalePrecBelowBreak = d3.scale
      .linear()
      .domain(
        [
          this._tempScale[0],
          this._tempScale[1]
        ]
      )
      .range(
        [
          this._chartDimensions.bottom,
          this._chartDimensions.top + this._heightPrecBreakLine
        ]
      )

    // Y-Axis: prec scale above break line
    let yScalePrecAboveBreak = d3.scale
      .linear()
      .domain(
        [
          this._tempScale[1],
          this._tempScale[2]
        ]
      )
      .range(
        [
          this._chartDimensions.top + this._heightPrecBreakLine,
          this._chartDimensions.top
        ]
      )

    // TODO
    // let yScale5 = d3.scale
    //   .linear()
    //   .domain(
    //     [
    //       300,
    //       this._maxYPrecAboveBreak
    //     ]
    //   )
    //   .range(
    //     [
    //       this._heightPrecBreakLine - this._stepSizeY1 + this._margins.top,
    //       this._margins.top
    //     ]
    //   )

    // TODO
    // let xScaleTable = d3.scale
    //   .ordinal()
    //   .domain([0, 1, 2, 3])
    //   .range( [0, 1, 2, 3])
    //   .rangePoints(
    //     [
    //       this._tableDimensions.left,
    //       this._tableDimensions.left + this._dimensions.tableWidth
    //     ], 0
    //   )
    //
    // let yScaleTable = d3.scale
    //   .ordinal()
    //   .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    //   .range(
    //     [
    //       this._tableDimensions.top - 10 + this._dimensions.tableHeight,
    //       this._tableDimensions.top - 10
    //     ]
    //   )
    //   .rangePoints(
    //     [
    //       this._tableDimensions.top - 10,
    //       this._tableDimensions.top - 10 + this._dimensions.tableHeight
    //     ], 0
    //   )


    //-------------------------------------------------------------------------
    // Axes: Visualized interval (range)
    // ------------------------------------------------------------------------

    let xAxis = d3.svg
      .axis()
      .scale(xScale)
      .tickSize(5)
      .tickSubdivide(true)
      .tickPadding(5)

    let yAxisTempBelowBreak = d3.svg
      .axis()
      .scale(yScaleTempBelowBreak)
      .tickValues(this._ticksYTemp)
      .tickSize(5)
      .orient('left')

    // No values, because there is no temperature above the maximum
    let yAxisTempAboveBreak = d3.svg
      .axis()
      .scale(yScaleTempAboveBreak)
      .ticks(0)
      .tickSize(5)
      .orient('left')

    let yAxisPrecBelowBreak = d3.svg
      .axis()
      .scale(yScalePrecBelowBreak)
      .tickValues(this._ticksYPrecBelowBreak)
      .tickSize(5)
      .orient('right')

    let yAxisPrecAboveBreak = d3.svg
      .axis()
      .scale(yScalePrecAboveBreak)
      .tickValues(this._ticksYPrecAboveBreak)
      .tickSize(5)
      .orient('right')


    //-------------------------------------------------------------------------
    // Grids of the chart (x and y)
    // ------------------------------------------------------------------------

    let gridX = d3.svg
      .axis()
      .scale(xScale)
      // .tickSize(+this._chartDimensions.height)
      .tickSubdivide(true)
      .tickPadding(5)
      .tickFormat("")

    let gridYBelowBreak = d3.svg
      .axis()
      .scale(yScaleTempBelowBreak)
      .tickValues(this._ticksYTemp)
      // .tickSize(-this._chartDimensions.width)
      .orient('left')
      .tickFormat("")

    // let gridY2 = d3.svg
    //   .axis()
    //   .scale(yScale5)
    //   .tickValues(this._ticksYPrecAboveBreak)
    //   .tickSize(this._chartWidth)
    //   .orient('right')
    //   .tickFormat("")

    // let tableGridY = d3.svg
    //   .axis()
    //   .scale(yScaleTable)
    //   .tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    //   .tickSize(-this._dimensions.tableWidth)
    //   .orient('left')
    //   .tickFormat("")


    //-------------------------------------------------------------------------
    // Lines of temp and prec
    // ------------------------------------------------------------------------

    // let lineTemp = d3.svg.line()
    //   .x( (d) => {return xScale(d.month)})
    //   .y( (d) => {return yScaleTempBelowBreak(d.temp)})
    //   .interpolate('linear')
    //
    // let linePrecBelowBreak = d3.svg.line()
    //   .x( (d) => {return xScale(d.month)})
    //   .y( (d) => {return yScalePrecBelowBreak(d.prec)})
    //   .interpolate('linear')
    //
    // let linePrecAboveBreak = d3.svg.line()
    //   .x( (d) => {return xScale(d.month)})
    //   .y( (d) => {return yScalePrecAboveBreak(d.prec)})
    //   .interpolate('linear')


    //-------------------------------------------------------------------------
    // Polygons for drawing the colored areas below the curves.
    // ------------------------------------------------------------------------

    // let areaTemp = d3.svg.area()
    //   .x( (d) => {return xScale(d.month)})
    //   .y0((d) => {return yScaleTempBelowBreak(d.temp)})
    //   .y1(this._height)
    //   .interpolate('linear')
    //
    // let areaPrecBelowBreak = d3.svg.area()
    //   .x( (d) => {return xScale(d.month)})
    //   .y0((d) => {return yScalePrecBelowBreak(d.prec)})
    //   .y1(this._height)
    //   .interpolate('linear')
    //
    // let areaPrecAboveBreak = d3.svg.area()
    //   .x( (d) => {return xScale(d.month)})
    //   .y0((d) => {return yScalePrecAboveBreak(d.prec)})
    //   .y1(yScalePrecBelowBreak(this._chartMain.diagram.prec.breakValue))
    //   .interpolate('linear')


    // ------------------------------------------------------------------------
    // Polygons used as clipping masks
    // -> define the visible parts of the polygons defined above.
    // ------------------------------------------------------------------------

    // let areaTempTo100 = d3.svg.area()
    //   .x( (d) => {return xScale(d.month)})
    //   .y0((d) => {return yScaleTempBelowBreak(d.temp)})
    //   .y1(yScalePrecBelowBreak(this._chartMain.diagram.prec.breakValue))
    //   .interpolate('linear')
    //
    // let area100ToMax = d3.svg.area()
    //   .x( (d) => {return xScale(d.month)})
    //   .y0(yScalePrecAboveBreak(101))
    //   .y1(0)
    //   .interpolate('linear')
    //
    // let areaAbovePrec = d3.svg.area()
    //   .x( (d) => {return xScale(d.month)})
    //   .y0((d) => {return yScalePrecBelowBreak(d.prec)})
    //   .y1(yScalePrecBelowBreak(this._chartMain.diagram.prec.breakValue))
    //   .interpolate('linear')


    // ========================================================================
    // Finally draw chart features
    // ========================================================================


    //-------------------------------------------------------------------------
    // Axes
    //-------------------------------------------------------------------------

    // X-Axis
    this._chart.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate('
        + 0
        + ', '
        + this._chartDimensions.bottom
        + ')'
      )
      .call(xAxis)
      .style('fill', 'black')

    // Y-Axis left: temp below break line
    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartDimensions.left
        + ','
        + 0
        + ')'
      )
      .call(yAxisTempBelowBreak)
      .style('fill', this._chartMain.colors.tempLine)

    // Y-Axis left: temp above break line
    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartDimensions.left
        + ','
        + this._heightPrecBreakLine
        + ')'
      )
      .call(yAxisTempAboveBreak)
      .style('fill', this._chartMain.colors.tempLine)

    // Y-Axis right: prec below break line
    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartDimensions.right
        + ', '
        + 0
        + ')'
      )
      .call(yAxisPrecBelowBreak)
      .style('fill', this._chartMain.colors.precLine)

    // Y-Axis right: prec above break line
    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform', 'translate('
        + this._chartDimensions.right
        + ', '
        + this._heightPrecBreakLine
        + ')'
      )
      .call(yAxisPrecAboveBreak)
      .style('fill', this._chartMain.colors.precLine)


  //-------------------------------------------------------------------------
  // Grids
  //-------------------------------------------------------------------------

  this._chart.append('svg:g')
    .attr('class', 'grid')
    .attr('transform',
      'translate('+ '0,' + (this._chartDimensions.bottom) + ')')
    .call(gridX)

  this._chart.append('svg:g')
    .attr('class', 'grid')
    .attr('transform','translate('+ this._chartDimensions.left + ',0)')
    .call(gridYBelowBreak)


  //-------------------------------------------------------------------------
  // Lines for temp and prec
  //-------------------------------------------------------------------------




/***
    // Defs contains the paths that are later used for clipping the areas
    // between the temperature and precipitation lines.
    let defs = this._chart.append('defs')

    defs.append('clipPath')
      .attr('id', 'clip-temp')
      .append('path')
      .attr('d', areaTempTo100(this._climateData.monthly_short))

    defs.append('clipPath')
      .attr('id', 'clip-temp2')
      .append('path')
      .attr('d', area100ToMax(this._climateData.monthly_short))

    defs.append('clipPath')
      .attr('id', 'clip-prec')
      .append('path')
      .attr('d', areaAbovePrec(this._climateData.monthly_short))

    defs.append('clipPath')
      .attr('id', 'rect_bottom')
      .append('rect')
      .attr('x',      this._margins.left)
      .attr('y',      this._margins.top + this._heightPrecBreakLine)
      .attr('width',  this._width)
      .attr('height', this._height - this._heightPrecBreakLine)

    defs.append('clipPath')
      .append('rect')
      .attr('id',     'rect_top')
      .attr('x',      this._margins.left)
      .attr('y',      this._margins.top)
      .attr('width',  this._width)
      .attr('height', this._heightPrecBreakLine)

    //BACKGROUND
    this._chart.append("rect")
      .attr("class",  "shadow")
      .attr("width",  this._width)
      .attr("height", this._height)
      .attr("fill",   "transparent")

    //GRID ELEMENTS
    this._chart.append('svg:g')
      .attr('class', 'grid')
      .attr(
        'transform',
        'translate('
          + '0,'
          + (this._height - this._margins.bottom)
          + ')'
      )
      .call(gridX)

    this._chart.append('svg:g')
      .attr('class', 'grid')
      .attr('transform','translate('+ this._margins.left + ',0)')
      .call(gridYBelowBreak)

    // Only add the second horizontal gridlines if necessary
    if (this._heightPrecBreakLine > 0)
    {
      this._chart.append('svg:g')
        .attr('class', 'grid')
        .attr('transform','translate('+ this._margins.left + ',0)')
        .call(gridY2)
    }

    // COLORED AREAS BETWEEN LINES
    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr("class", "area")
      .attr('d', areaTemp(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-prec)')
      .attr('fill', this._chartMain.colors.tempArea)
      .attr('stroke', 'none')

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr("class", "area")
      .attr('d', areaPrecBelowBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-temp)')
      .attr('fill', this._chartMain.colors.precArea)
      .attr('stroke', 'none')

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr('d', areaPrecAboveBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-temp2)')
      .attr('fill', this._chartMain.colors.precLine)
      .attr('stroke', 'none')

    // LINES
    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', lineTemp(this._climateData.monthly_short))
      .attr('stroke', this._chartMain.colors.tempLine)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', linePrecBelowBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#rect_bottom)')
      .attr('stroke', this._chartMain.colors.precLine)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', linePrecAboveBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#rect_top)')
      .attr('stroke', this._chartMain.colors.precLine)
      .attr('stroke-width', 1)
      .attr('fill', 'none')

    this._chart.append("text")
      .attr("class", "tick")
      .attr("text-anchor", "end")
      .attr("x",    this._margins.left + 10)
      .attr("y",    this._tableDimensions.top-10)
      .attr('fill', this._chartMain.colors.tempLine)
      .text("[°C]")

    this._chart.append("text")
      .attr("class", "tick")
      .attr("text-anchor", "end")
      .attr("x",    this._chartWidth + this._margins.left + 20)
      .attr("y",    this._tableDimensions.top-10)
      .attr('fill', this._chartMain.colors.precLine)
      .text("[mm]")

    this._chart.append("text")
      .attr("class", "info")
      .attr("x", this._margins.left + this._chartWidth/11)
      .attr("y", this._height - this._margins.bottomS)
      .text("Temperature Mean: " + this._climateData.temp_mean + "°C")

    this._chart.append("text")
      .attr("class", "info")
      .attr("x", this._margins.left + this._chartWidth*6/10)
      .attr("y", this._height - this._margins.bottomS)
      .text("Precipitation Sum: " + this._climateData.prec_sum + "mm")

    //TABLE ELEMENTS
    this._chart.append("line")
      .attr("x1", this._tableDimensions.left + this._dimensions.tableWidth/3)
      .attr("y1", this._tableDimensions.top - 15)
      .attr("x2", this._tableDimensions.left + this._dimensions.tableWidth/3)
      .attr("y2", this._tableDimensions.top + this._dimensions.tableHeight - 10)
      .attr("shape-rendering", "crispEdges")
      .style("stroke", this._chartMain.colors.grid)

    this._chart.append("line")
      .attr("x1", this._tableDimensions.left + this._dimensions.tableWidth*2/3)
      .attr("y1", this._tableDimensions.top - 15)
      .attr("x2", this._tableDimensions.left + this._dimensions.tableWidth*2/3)
      .attr("y2", this._tableDimensions.top + this._dimensions.tableHeight - 10)
      .attr("shape-rendering", "crispEdges")
      .style("stroke", this._chartMain.colors.grid)

    //Add column titles separately to table.
    this._chart.append('text')
      .attr('id', "month")
      .attr("class", "info")
      .attr('x', this._tableDimensions.left + this._dimensions.tableWidth*1/6)
      .attr('y', this._tableDimensions.top)
      .attr('text-anchor', 'middle')
      .text("Month")

    this._chart.append('text')
      .attr('id', "temp")
      .attr("class", "info")
      .attr('x', this._tableDimensions.left + this._dimensions.tableWidth*3/6)
      .attr('y', this._tableDimensions.top)
      .attr('text-anchor', 'middle')
      .text("Temp")

    this._chart.append('text')
      .attr('id', "prec")
      .attr("class", "info")
      .attr('x', this._tableDimensions.left + this._dimensions.tableWidth*5/6)
      .attr('y', this._tableDimensions.top)
      .attr('text-anchor', 'middle')
      .text("Precip")

    // Add column values to table using fillColumn method.
    this._chart.append('text')
      .attr('id', "month")
      .attr("class", "info")
      .attr('x', this._tableDimensions.left + this._dimensions.tableWidth*1/6)
      .attr('y', this._tableDimensions.top)
      .attr('text-anchor', 'middle')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tableDimensions.top,
        this._dimensions.tableHeight/13,
        "month",
        this._tableDimensions.left + this._dimensions.tableWidth*1/6
      )

    this._chart.append('text')
      .attr("class", "info")
      .attr('x', this._tableDimensions.left + this._dimensions.tableWidth*3/6)
      .attr('y', this._tableDimensions.top)
      .attr('text-anchor', 'end')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tableDimensions.top,
        this._dimensions.tableHeight/13,
        "temp",
        this._tableDimensions.left + this._dimensions.tableWidth*6/10
      )

    this._chart.append('text')
      .attr("class", "info")
      .attr('x', this._tableDimensions.left + this._dimensions.tableWidth*5/6)
      .attr('y', this._tableDimensions.top)
      .attr('text-anchor', 'end')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tableDimensions.top,
        this._dimensions.tableHeight/13,
        "prec",
        this._tableDimensions.left + this._dimensions.tableWidth*19/20
      )

    //SET STYLING FOR DIFFERENT GROUPS OF ELEMENTS
    this._chart.selectAll(".grid")
      .style("fill", "none")
      .style("stroke", this._chartMain.colors.grid)
      .style("stroke-width", "1px")
      .attr("shape-rendering", "crispEdges")

    this._chart.selectAll(".axis .domain")
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .attr("shape-rendering", "crispEdges")

    this._chart.selectAll(".tick")
      .style("font-size", this._chartMain.fontSizes.tick + "px")

    this._chart.selectAll(".info")
      .attr("font-weight", "normal")
      .style("font-size", this._chartMain.fontSizes.info + "px")

    this._chart.selectAll(".cell")
      .style("font-size", this._chartMain.fontSizes.table + "px")

    this._chart.selectAll(".area")
      .style("opacity", 0.7)

    //ADD ELEMENTS FOR MOUSEOVER EFFECT
    this._chart.append("g")
      .attr("class", "focus")
      .attr("visibility", "hidden")

    this._chart.select(".focus")
      .append("circle")
      .attr("id", "c1")
      .attr("r", 4.5)
      .attr("fill", "white")
      .attr("stroke", this._chartMain.colors.tempLine)
      .style("stroke-width", 1.5)

    this._chart.select(".focus")
      .append("circle")
      .attr("id", "c2")
      .attr("r", 4.5)
      .attr("fill", "white")
      .attr("stroke", this._chartMain.colors.precLine)
      .style("stroke-width", 1.5)

    this._chart.append("rect")
      .attr("id", "climate-chart-plot-area")
      .attr("class", "overlay")
      .attr("x", this._margins.left)
      .attr("y", this._margins.top)
      .attr("width", this._chartWidth)
      .attr("height", this._chartHeight)
      .attr("fill", "none")
      .style("pointer-events", "all")


***/
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

    // ------------------------------------------------------------------------
    // Event Handling
    // ------------------------------------------------------------------------

    // this._wrapperDiv.mouseover( (e) =>
    //   {
    //     this._chart.select(".focus")
    //       .attr("visibility", "visible")
    //   }
    // )
    //
    // this._wrapperDiv.mouseout( (e) =>
    //   {
    //     this._chart.select(".focus")
    //       .attr("visibility", "hidden")
    //
    //     this._chart.selectAll(".cell")
    //       .attr("fill", "black")
    //       .attr("font-weight", "normal")
    //       .style("font-size", this._chartMain.fontSizes.table)
    //       .style("text-shadow", "none")
    //   }
    // )
    //
    // this._wrapperDiv.mousemove( (e) =>
    //   {
    //     // Get click position inside svg canvas
    //     let svg = this._chart[0][0]
    //     let clickPtReal = svg.createSVGPoint()
    //     clickPtReal.x = e.clientX
    //     clickPtReal.y = e.clientY
    //     let clickPtSVG = clickPtReal.matrixTransform(
    //       svg.getScreenCTM().inverse()
    //     )
    //
    //     // Calculate closest distance between mouse position and tick
    //     let posX =    clickPtSVG.x
    //     let lowDiff = 1e99
    //     let xI =      null
    //     let tickPos = xScale.range()
    //
    //     for (let i=0; i<tickPos.length; i++)
    //     {
    //       let diff = Math.abs(posX - tickPos[i])
    //       if (diff < lowDiff)
    //       {
    //         lowDiff = diff
    //         xI = i
    //       }
    //     }
    //
    //     let c1 =    this._chart.select("#c1")
    //     let c2 =    this._chart.select("#c2")
    //     let month = this._chart.select("#month_c" + xI)
    //     let temp =  this._chart.select("#temp_c" + xI)
    //     let prec =  this._chart.select("#prec_c" + xI)
    //     let rows =  this._chart.selectAll(".cell")
    //
    //     // Highlight closest month in chart and table
    //     rows.attr("fill", "black")
    //       .attr("font-weight", "normal")
    //       .style("text-shadow", "none")
    //     month.style("text-shadow", "1px 1px 2px gray")
    //       .attr("font-weight", "bold")
    //     temp.attr("fill", this._chartMain.colors.tempLine)
    //       .attr("font-weight", "bold")
    //       .style("text-shadow", "1px 2px 2px gray")
    //     prec.attr("fill", this._chartMain.colors.precLine)
    //       .attr("font-weight", "bold")
    //       .style("text-shadow", "2px 2px 2px gray")
    //
    //     c1.attr("transform",
    //       "translate("
    //         + tickPos[xI] + ","
    //         + yScaleTempBelowBreak(this._climateData.monthly_short[xI].temp) + ")"
    //     )
    //
    //     if (this._climateData.monthly_short[xI].prec <= 100)
    //     {
    //       c2.attr("transform",
    //         "translate("
    //           + tickPos[xI] + ","
    //           + yScalePrecBelowBreak(this._climateData.monthly_short[xI].prec) + ")"
    //       )
    //     }
    //     if (this._climateData.monthly_short[xI].prec > 100)
    //     {
    //       c2.attr("transform",
    //         "translate("
    //           + tickPos[xI] + ","
    //           + yScalePrecAboveBreak(this._climateData.monthly_short[xI].prec) + ")"
    //       )
    //     }
    //   }
    // )

    // ------------------------------------------------------------------------
    // Adapt height of svg
    // ------------------------------------------------------------------------

    // TODO
    // if (this._climateData.prec_sum > 100 ||
    //     this._climateData.temp_mean < 0)
    //   this._adjustHeight()
    //
    // this._chart.attr("viewBox",
    //   "0 0 " + this._width + " " + this._height
    // )
    //
    // //Adjust height of #wrapper to fit to SVG content.
    // this._wrapperDiv.css(
    //   "padding-bottom",
    //   100 * (this._height/this._width) + "%"
    // )


  }


  // ==========================================================================
  // Helper functions
  // ==========================================================================

  _setTickValues()
  {
    // If there are temperature values below zero
    if (this._climateData.extreme.minTemp < 0)
    {
      // Ground zero: minimum temperature, floored to multiples of 10°C
      let minTemp = this._climateData.extreme.minTemp
      let startIdx = Math.floor(minTemp / this._chartMain.diagram.temp.dist)
      for (let i = startIdx; i <= 5; i++)
      {
        this._ticksYTemp.push(i * this._chartMain.diagram.temp.dist)
        if (i > 0)
          this._ticksYPrecBelowBreak.push(i * this._chartMain.diagram.prec.distBelowBreak)
      }

    // If all temperature values are positive, ground zero is 0°C
    } else {
      for (let i = 0; i <= 5; i++)
      {
        this._ticksYTemp.push(i * this._chartMain.diagram.temp.dist)
        this._ticksYPrecBelowBreak.push(i * this._chartMain.diagram.prec.distBelowBreak)
      }
    }

    // If precipitation is above the break value
    let maxPrec = this._climateData.extreme.maxPrec
    if (maxPrec > this._chartMain.diagram.prec.breakValue)
    {
      let y3_tickNumber = Math.ceil(
        (maxPrec - this._chartMain.diagram.prec.breakValue)
        / this._chartMain.diagram.prec.distAboveBreak
      )
      for (let i=1; i <= y3_tickNumber; i++)
      {
        let tickValue =
          this._chartMain.diagram.prec.breakValue +
          i * this._chartMain.diagram.prec.distAboveBreak
        this._ticksYPrecAboveBreak.push(tickValue)
      }
    }

    this._minYTempBelowBreak = d3.min(this._ticksYTemp)
    this._maxYTempBelowBreak = d3.max(this._ticksYTemp)
    this._maxYPrecAboveBreak = d3.max(this._ticksYPrecAboveBreak)

    // Error handling
    if (this._maxYTempBelowBreak == undefined)
      this._maxYTempBelowBreak = 0
    if (this._maxYPrecAboveBreak == undefined)
      this._maxYPrecAboveBreak = 0

    // If there are negative temp values, calculate prec_min in a way so that
    // the zeropoints of both y axes are in alignment.
    let ratioPrecToTemp =
      this._chartMain.diagram.prec.distBelowBreak /
      this._chartMain.diagram.temp.dist
    // factor should be 2 (dist of prec ticks: 20, dist of temp ticks: 10 -> 2)
    this._minYPrecBelowBreak = this._minYTempBelowBreak*ratioPrecToTemp
  }

  //If there are any precipitation values over 100mm or temperature values below 0°C, adjust the height of the svg graphic.
  _adjustHeight()
  {
    this._negativeHeightY1 = 0
      + (this._ticksYTemp.length - 6)
      * this._stepSizeY1

    this._heightPrecBreakLine = 0
      + this._ticksYPrecAboveBreak.length
      * this._stepSizeY1

    this._height = 0
      + this._height
      + this._heightPrecBreakLine
      + this._negativeHeightY1

    this._chartHeight = 0
      + this._chartHeight
      + this._negativeHeightY1
      + this._heightPrecBreakLine
  }

  // Fill table column with values of the variable given as an argument.
  _fillColumn (col, data, tableOffset, tableHeight, column, x)
  {
    for (let i=0; i<MONTHS_IN_YEAR.length; i++)
    {
      let obj = data[i]

      for (let key in obj)
      {
        if (key === column)
        {
          if (typeof(obj[key]) === "number")
          {
            let number = obj[key].toFixed(1)
            col.append('tspan')
              .attr("id", column + "_c" + i)
              .attr("class", "cell")
              .attr('x', x)
              .attr('y', (tableHeight * (i+1)) + tableOffset)
              .style("text-align", "right")
              .text(number)
          }
          else
          {
            col.append('tspan')
              .attr("id", column + "_c" + i)
              .attr("class", "cell")
              .attr('x', x)
              .attr('y', (tableHeight * (i+1)) + tableOffset)
              .style("text-align", "right")
              .text(obj[key])
          }
        }
      }
    }
  }
}
