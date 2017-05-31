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
    super(main, 'climateChart', climateData)

    this._drawChart()
  }


  // ==========================================================================
  // Update chart
  // ==========================================================================

  update(climateData)
  {
    super.update(climateData)

    this._drawChart()
  }


  // ==========================================================================
  // Remove chart
  // ==========================================================================

  remove()
  {
    super.remove()
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  _drawChart()
  {
    // Append chart element to parent container and set basic styles.
    // -> check if chart already exists, otherwise create it
    this._chart = d3.select("#" + this._chartMain.container + "-wrapper")
      .append("svg")
      .attr("id", this._chartMain.container)
      .attr("version", 1.1)
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox",
        "0 0 " + this._chartMain.width + " " + this._chartMain.height
      )
      .attr('width', '100%')
      .attr('height', '1000px')	// for compatibility with IE, this has to be here. But just forget about the actual number, it is a max value, it does not matter...
      .classed("svg-container", true) //container class to make it responsive
      .classed("svg-content-responsive", true)
      .style("font-size",       "15px")
      .style("font-family",     "Arial, sans-serif")
      .style("font-style",      "normal")
      .style("font-variant",    "normal")
      .style("font-weight",     "normal")
      .style("text-rendering",  "optimizeLegibility")
      .style("shape-rendering", "default")
      .style("background-color","transparent")

    //Set size and position for the chart drawing area and the table.
    this._width  = this._chartMain.width
    this._height = this._chartMain.height

    this._chartWidth = 0
      - this._chartMain.margins.left
      + this._width
      - this._chartMain.margins.right
    this._chartHeight = 0
      + this._height
      - this._chartMain.margins.top
      - this._chartMain.margins.bottom
    this._tableX = 0
      + this._width
      - this._chartMain.margins.right
      + 1.6 * this._chartMain.margins.rightS
    this._tableY = this._chartMain.margins.top
    this._tableframeY =  this._tableY - 10

    // Placeholder for the specific ticks shown on the vertical axes.
    this._ticksY1 = []
    this._ticksY2 = []
    this._ticksY3 = []

    // Value definition placeholders for the axes.
    this._heightY3 = 0
    this._negativeHeightY1 = 0
    this._maxY1 = 50
    this._minY1 = 0
    this._maxY2 = 100
    this._minY2 = 0
    this._maxY3 = 0

    // Calculate the stepsize between two axis tick marks based on the
    // standard height value and the number of ticks
    // -> assuming there aren´t any negative temp values.
    this._stepSizeY1 = ( 0
      + this._height
      - this._chartMain.margins.top
      - this._chartMain.margins.bottom
    ) /5

    this._setTickValues()

    // The ticks for all y axes have to be calculated manually to make sure
    // that they are in alignment and have the correct ratio.

    //-------------------------------------------------------------------------
    // Define features of chart
    // ------------------------------------------------------------------------

    let xScale = d3.scale
      .ordinal()
      .range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .domain(MONTHS_IN_YEAR)
      .rangePoints(
        [
          this._chartMain.margins.left,
          this._width - this._chartMain.margins.right
        ], 0
      )

    let yScale1 = d3.scale
      .linear()
      .range(
        [
          this._height - this._chartMain.margins.bottom,
          this._heightY3 + this._chartMain.margins.top
        ]
      )
      .domain([this._minY1, this._maxY1])

    let yScale2 = d3.scale
      .linear()
      .range(
        [
          this._height - this._chartMain.margins.bottom,
          this._heightY3 + this._chartMain.margins.top
        ]
      )
      .domain([this._minY2, this._maxY2])

    let yScale3 = d3.scale
      .linear()
      .range(
        [
          this._heightY3 + this._chartMain.margins.top,
          this._chartMain.margins.top
        ]
      )
      .domain([100, this._maxY3])

    let yScale4 = d3.scale
      .linear()
      .range(
        [
          this._height - this._chartMain.margins.bottom,
          this._chartMain.margins.top
        ]
      )
      .domain(
        [
          this._chartMain.margins.bottom,
          this._height - this._chartMain.margins.top
        ]
      )

    let yScale5 = d3.scale
      .linear()
      .range(
        [
          this._heightY3 - this._stepSizeY1 + this._chartMain.margins.top,
          this._chartMain.margins.top
        ]
      )
      .domain([300, this._maxY3])

    let xScaleTable = d3.scale
      .ordinal()
      .range([0, 1, 2, 3])
      .domain([0, 1, 2, 3])
      .rangePoints(
        [
          this._tableX,
          this._tableX + this._chartMain.tableWidth
        ], 0
      )

    let yScaleTable = d3.scale
      .ordinal()
      .range(
        [
          this._tableframeY + this._chartMain.tableHeight,
          this._tableframeY
        ]
      )
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
      .rangePoints(
        [
          this._tableframeY,
          this._tableframeY + this._chartMain.tableHeight
        ], 0
      )

    let xAxis = d3.svg
      .axis()
      .scale(xScale)
      .tickSize(5)
      .tickSubdivide(true)
      .tickPadding(5)

    let yAxis1 = d3.svg
      .axis()
      .scale(yScale1)
      .tickValues(this._ticksY1)
      .tickSize(5)
      .orient('left')

    let yAxis2 = d3.svg
      .axis()
      .scale(yScale2)
      .tickValues(this._ticksY2)
      .tickSize(5)
      .orient('right')

    let yAxis3 = d3.svg
      .axis()
      .scale(yScale3)
      .tickValues(this._ticksY3)
      .tickSize(5)
      .orient('right')

    let yAxis4 = d3.svg
      .axis()
      .scale(yScale4)
      .ticks(0)
      .tickSize(5)
      .orient("left")

    let gridX = d3.svg
      .axis()
      .scale(xScale)
      .tickSize(this._chartMain.margins.top + this._chartMain.margins.bottom - this._height)
      .tickSubdivide(true)
      .tickPadding(5)
      .tickFormat("")

    let gridY1 = d3.svg
      .axis()
      .scale(yScale1)
      .tickValues(this._ticksY1)
      .tickSize(-this._chartWidth)
      .orient('left')
      .tickFormat("")

    let gridY2 = d3.svg
      .axis()
      .scale(yScale5)
      .tickValues(this._ticksY3)
      .tickSize(this._chartWidth)
      .orient('right')
      .tickFormat("")

    let tableGridY = d3.svg
      .axis()
      .scale(yScaleTable)
      .tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
      .tickSize(-this._chartMain.tableWidth)
      .orient('left')
      .tickFormat("")

    let lineTemp = d3.svg.line()
      .x( (d) => {return xScale(d.month)})
      .y( (d) => {return yScale1(d.temp)})
      .interpolate('linear')

    let linePrec = d3.svg.line()
      .x( (d) => {return xScale(d.month)})
      .y( (d) => {return yScale2(d.prec)})
      .interpolate('linear')

    let linePrec2 = d3.svg.line()
      .x( (d) => {return xScale(d.month)})
      .y( (d) => {return yScale3(d.prec)})
      .interpolate('linear')

    //Polygons for drawing the colored areas below the curves.
    let areaBelowTemp = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScale1(d.temp)})
      .y1(this._height)
      .interpolate('linear')

    let areaBelowPrec = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScale2(d.prec)})
      .y1(this._height)
      .interpolate('linear')

    let areaBelowPrec2 = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScale3(d.prec)})
      .y1(yScale2(100))
      .interpolate('linear')

    // Polygons used as clipping masks to define the visible parts of the
    // polygons defined above.
    let areaTempTo100 = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScale1(d.temp)})
      .y1(yScale2(100))
      .interpolate('linear')

    let area100ToMax = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0(yScale3(101))
      .y1(0)
      .interpolate('linear')

    let areaAbovePrec = d3.svg.area()
      .x( (d) => {return xScale(d.month)})
      .y0((d) => {return yScale2(d.prec)})
      .y1(yScale2(100))
      .interpolate('linear')


    //---------------------------------------------------------------------------
    // Append features of chart to the html svg element.
    //---------------------------------------------------------------------------

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
      .attr('x',      this._chartMain.margins.left)
      .attr('y',      this._chartMain.margins.top + this._heightY3)
      .attr('width',  this._width)
      .attr('height', this._height - this._heightY3)

    defs.append('clipPath')
      .attr('id', 'rect_top')
      .append('rect')
      .attr('x',      this._chartMain.margins.left)
      .attr('y',      this._chartMain.margins.top)
      .attr('width',  this._width)
      .attr('height', this._heightY3)

    //BACKGROUND
    this._chart.append("rect")
      .attr("class", "shadow")
      .attr("width",  this._width)
      .attr("height", this._height)
      .attr("fill", "transparent")

    //GRID ELEMENTS
    this._chart.append('svg:g')
      .attr('class', 'grid')
      .attr(
        'transform',
        'translate('
        + '0,'
        + (this._height - this._chartMain.margins.bottom)
        + ')'
      )
      .call(gridX)

    this._chart.append('svg:g')
      .attr('class', 'grid')
      .attr('transform','translate('+ this._chartMain.margins.left + ',0)')
      .call(gridY1)

    //only add the second horizontal gridlines if necessary
    if (this._heightY3 > 0)
    {
      this._chart.append('svg:g')
        .attr('class', 'grid')
        .attr('transform','translate('+ this._chartMain.margins.left + ',0)')
        .call(gridY2)
    }

    //COLORED AREAS BETWEEN LINES
    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr("class", "area")
      .attr('d', areaBelowTemp(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-prec)')
      .attr('fill', this._chartMain.colors.areaTemp)
      .attr('stroke', 'none')

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr("class", "area")
      .attr('d', areaBelowPrec(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-temp)')
      .attr('fill', this._chartMain.colors.areaPrec)
      .attr('stroke', 'none')

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr('d', areaBelowPrec2(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-temp2)')
      .attr('fill', this._chartMain.colors.colPrec)
      .attr('stroke', 'none')

    //LINES
    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', lineTemp(this._climateData.monthly_short))
      .attr('stroke', this._chartMain.colors.colTemp)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', linePrec(this._climateData.monthly_short))
      .attr('clip-path', 'url(#rect_bottom)')
      .attr('stroke', this._chartMain.colors.colPrec)
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', linePrec2(this._climateData.monthly_short))
      .attr('clip-path', 'url(#rect_top)')
      .attr('stroke', this._chartMain.colors.colPrec)
      .attr('stroke-width', 1)
      .attr('fill', 'none')

    //AXES
    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform','translate(' + this._chartMain.margins.left + ',0)')
      .call(yAxis4)

    this._chart.append('svg:g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (this._height - this._chartMain.margins.bottom) + ')')
      .call(xAxis)
      .style('fill', 'black')

    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr('transform','translate(' + this._chartMain.margins.left + ',0)')
      .call(yAxis1)
      .style('fill', this._chartMain.colors.colTemp)

    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr(
        'transform',
        'translate('
        + (this._chartWidth + this._chartMain.margins.left)
        + ',0)'
      )
      .call(yAxis2)
      .style('fill', this._chartMain.colors.colPrec)

    this._chart.append('svg:g')
      .attr('class', 'y axis')
      .attr(
        'transform',
        'translate('
        + (this._chartWidth + this._chartMain.margins.left)
        + ',0)'
      )
      .call(yAxis3)
      .style('fill', this._chartMain.colors.colPrec)

    //ADDITIONAL ELEMENTS LIKE TITLE, CLIMATE CLASS, ETC...
    this._chart.append("text")
      .attr("class", "tick")
      .attr("text-anchor", "end")
      .attr("x", this._chartMain.margins.left + 10)
      .attr("y", this._tableY-10)
      .text("[°C]")
      .attr('fill', this._chartMain.colors.colTemp)

    this._chart.append("text")
      .attr("class", "tick")
      .attr("text-anchor", "end")
      .attr("x", this._chartWidth + this._chartMain.margins.left + 20)
      .attr("y", this._tableY-10)
      .text("[mm]")
      .attr('fill', this._chartMain.colors.colPrec)

    this._chart.append("text")
      .attr("id", "climate-chart-title")
      .attr("class", "info")
      .attr("x", this._width*2/5)
      .attr("y", this._chartMain.margins.top*1/3-5)
      .attr(
        "width",
        this._chartMain.margins.right - this._chartMain.margins.rightS
      )
      .attr("text-anchor", "middle")
      .text(this._title)
      .call(this._wrap, this._width*2/3)

    this._chart.append("text")
      .attr("class", "info")
      .attr("x", this._width*2/5)
      .attr("y", this._chartMain.margins.top*1/3+12)
      .attr("width",
        this._chartMain.margins.right - this._chartMain.margins.rightS
      )
      .attr("text-anchor", "middle")
      .text(this._subtitle)
      .call(this._wrap, this._width*2/3)

    this._chart.append("text")
      .attr("class", "info")
      .attr("x", this._chartMain.margins.left + this._chartWidth/11)
      .attr("y", this._height - this._chartMain.margins.bottomS)
      .text("Temperature Mean: " + this._climateData.temp_mean + "°C")

    this._chart.append("text")
      .attr("class", "info")
      .attr("x", this._chartMain.margins.left + this._chartWidth*6/10)
      .attr("y", this._height - this._chartMain.margins.bottomS)
      .text("Precipitation Sum: " + this._climateData.prec_sum + "mm")

    this._chart.append("text")
      .attr("class", "source")
      .attr("id", "dataSource")
      .attr("width", this._width)
      .attr("x", 10)
      .attr("y", this._height - 5)
      // .attr("link" + this._climateData.source_link)
      .text("Data Source: " + this._climateData.source)
      .call(this._wrap, this._width - 100, " ")
      .on("click", () => { window.open(this.link) })
      .style("cursor", "pointer")

    this._chart.append("text")
      .attr("id", "url")
      .attr("class", "source")
      .style("text-anchor", "end")
      .append("tspan")
      .attr("x", this._width - 10)
      .attr("y", this._height - 5)
      .text(this._refURL)

    //TABLE ELEMENTS
    this._chart.append("line")
      .attr("x1", this._tableX + this._chartMain.tableWidth/3)
      .attr("y1", this._tableY - 15)
      .attr("x2", this._tableX + this._chartMain.tableWidth/3)
      .attr("y2", this._tableY + this._chartMain.tableHeight - 10)
      .attr("shape-rendering", "crispEdges")
      .style("stroke", this._chartMain.colors.colGrid)

    this._chart.append("line")
      .attr("x1", this._tableX + this._chartMain.tableWidth*2/3)
      .attr("y1", this._tableY - 15)
      .attr("x2", this._tableX + this._chartMain.tableWidth*2/3)
      .attr("y2", this._tableY + this._chartMain.tableHeight - 10)
      .attr("shape-rendering", "crispEdges")
      .style("stroke", this._chartMain.colors.colGrid)

    //Add column titles separately to table.
    this._chart.append('text')
      .attr('id', "month")
      .attr("class", "info")
      .attr('x', this._tableX + this._chartMain.tableWidth*1/6)
      .attr('y', this._tableY)
      .attr('text-anchor', 'middle')
      .text("Month")

    this._chart.append('text')
      .attr('id', "temp")
      .attr("class", "info")
      .attr('x', this._tableX + this._chartMain.tableWidth*3/6)
      .attr('y', this._tableY)
      .attr('text-anchor', 'middle')
      .text("Temp")

    this._chart.append('text')
      .attr('id', "prec")
      .attr("class", "info")
      .attr('x', this._tableX + this._chartMain.tableWidth*5/6)
      .attr('y', this._tableY)
      .attr('text-anchor', 'middle')
      .text("Precip")

    // Add column values to table using fillColumn method.
    this._chart.append('text')
      .attr('id', "month")
      .attr("class", "info")
      .attr('x', this._tableX + this._chartMain.tableWidth*1/6)
      .attr('y', this._tableY)
      .attr('text-anchor', 'middle')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tableY,
        this._chartMain.tableHeight/13,
        "month",
        this._tableX + this._chartMain.tableWidth*1/6
      )

    this._chart.append('text')
      .attr("class", "info")
      .attr('x', this._tableX + this._chartMain.tableWidth*3/6)
      .attr('y', this._tableY)
      .attr('text-anchor', 'end')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tableY,
        this._chartMain.tableHeight/13,
        "temp",
        this._tableX + this._chartMain.tableWidth*6/10
      )

    this._chart.append('text')
      .attr("class", "info")
      .attr('x', this._tableX + this._chartMain.tableWidth*5/6)
      .attr('y', this._tableY)
      .attr('text-anchor', 'end')
      .call(this._fillColumn,
        this._climateData.monthly_short,
        this._tableY,
        this._chartMain.tableHeight/13,
        "prec",
        this._tableX + this._chartMain.tableWidth*19/20
      )

    //SET STYLING FOR DIFFERENT GROUPS OF ELEMENTS
    this._chart.selectAll(".grid")
      .style("fill", "none")
      .style("stroke", this._chartMain.colors.colGrid)
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

    this._chart.selectAll(".source")
      .style("font-size", this._chartMain.fontSizes.source + "px")
      .style("opacity", 0.6)

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
      .attr("stroke", this._chartMain.colors.colTemp)
      .style("stroke-width", 1.5)

    this._chart.select(".focus")
      .append("circle")
      .attr("id", "c2")
      .attr("r", 4.5)
      .attr("fill", "white")
      .attr("stroke", this._chartMain.colors.colPrec)
      .style("stroke-width", 1.5)

    this._chart.append("rect")
      .attr("id", "climate-chart-plot-area")
      .attr("class", "overlay")
      .attr("x", this._chartMain.margins.left)
      .attr("y", this._chartMain.margins.top)
      .attr("width", this._chartWidth)
      .attr("height", this._chartHeight)
      .attr("fill", "none")
      .style("pointer-events", "all")


    // ------------------------------------------------------------------------
    // Event Handling
    // ------------------------------------------------------------------------

    this._wrapperDiv.mouseover( (e) =>
      {
        this._chart.select(".focus")
          .attr("visibility", "visible")
      }
    )

    this._wrapperDiv.mouseout( (e) =>
      {
        this._chart.select(".focus")
          .attr("visibility", "hidden")

        this._chart.selectAll(".cell")
          .attr("fill", "black")
          .attr("font-weight", "normal")
          .style("font-size", this._chartMain.fontSizes.table)
          .style("text-shadow", "none")
      }
    )

    this._wrapperDiv.mousemove( (e) =>
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

        let c1 =    this._chart.select("#c1")
        let c2 =    this._chart.select("#c2")
        let month = this._chart.select("#month_c" + xI)
        let temp =  this._chart.select("#temp_c" + xI)
        let prec =  this._chart.select("#prec_c" + xI)
        let rows =  this._chart.selectAll(".cell")

        // Highlight closest month in chart and table
        rows.attr("fill", "black")
          .attr("font-weight", "normal")
          .style("text-shadow", "none")
        month.style("text-shadow", "1px 1px 2px gray")
          .attr("font-weight", "bold")
        temp.attr("fill", this._chartMain.colors.colTemp)
          .attr("font-weight", "bold")
          .style("text-shadow", "1px 2px 2px gray")
        prec.attr("fill", this._chartMain.colors.colPrec)
          .attr("font-weight", "bold")
          .style("text-shadow", "2px 2px 2px gray")

        c1.attr("transform",
          "translate("
            + tickPos[xI] + ","
            + yScale1(this._climateData.monthly_short[xI].temp) + ")"
        )

        if (this._climateData.monthly_short[xI].prec <= 100)
        {
          c2.attr("transform",
            "translate("
              + tickPos[xI] + ","
              + yScale2(this._climateData.monthly_short[xI].prec) + ")"
          )
        }
        if (this._climateData.monthly_short[xI].prec > 100)
        {
          c2.attr("transform",
            "translate("
              + tickPos[xI] + ","
              + yScale3(this._climateData.monthly_short[xI].prec) + ")"
          )
        }
      }
    )

    // ------------------------------------------------------------------------
    // Adapt height of svg
    // ------------------------------------------------------------------------
    if (this._climateData.prec_sum > 100 ||
        this._climateData.temp_mean < 0)
      this._adjustHeight()

    this._chart.attr("viewBox",
      "0 0 " + this._width + " " + this._height
    )

    //Adjust height of #wrapper to fit to SVG content.
    this._wrapperDiv.css(
      "padding-bottom",
      100 * (this._height/this._width) + "%"
    )


  }


  // ==========================================================================
  // Helper functions
  // ==========================================================================

  _setTickValues()
  {
    if (this._climateData.extreme.minTemp < 0)
    {
      let startIdx = Math.floor(this._climateData.extreme.minTemp/10)
      for (let i = startIdx; i <= 5; i++)
      {
        if (i < 0)
        {
          let tickValue = i*10
          this._ticksY1.push(tickValue)
        } else {
          let tickValue = i*10
          this._ticksY1.push(tickValue)
          this._ticksY2.push(tickValue*2)
        }
      }
    } else {
      //If all temperature values are positive, set base of scale to zero.
      for (let i = 0; i <= 5; i++)
      {
        let tickValue = i*10
        this._ticksY1.push(tickValue)
        this._ticksY2.push(tickValue*2)
      }
    }

    if (this._climateData.extreme.maxPrec > 100)
    {
      let y3_tickNumber = Math.ceil(
        (this._climateData.extreme.maxPrec - 100)/200
      )
      for (let i=1; i <= y3_tickNumber; i++)
      {
        let tickValue = 100 + i*200
        this._ticksY3.push(tickValue)
      }
    }

    this._minY1 = d3.min(this._ticksY1)
    this._maxY1 = d3.max(this._ticksY1)
    this._maxY3 = d3.max(this._ticksY3)

    // error handling
    if (this._maxY1 == undefined)
      this._maxY1 = 0
    if (this._maxY3 == undefined)
      this._maxY3 = 0

    // If there are negative temp values, calculate prec_min in a way so that
    // the zeropoints of both y axes are in alignment.
    this._minY2 = this._minY1*2
  }

  //If there are any precipitation values over 100mm or temperature values below 0°C, adjust the height of the svg graphic.
  _adjustHeight()
  {
    this._negativeHeightY1 = 0
      + (this._ticksY1.length - 6)
      * this._stepSizeY1

    this._heightY3 = 0
      + this._ticksY3.length
      * this._stepSizeY1

    this._height = 0
      + this._height
      + this._heightY3
      + this._negativeHeightY1

    this._chartHeight = 0
      + this._chartHeight
      + this._negativeHeightY1
      + this._heightY3
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

  //Wrap text input string and split into multiple lines if necessary.
  _wrap(text, width, char)
  {
    // TODO: fix
    return null

    text.each( () =>
      {
        let text = d3.select(this)
        let words = text.text().split(char).reverse()
        let word
        let line = []
        let lineNumber = 0
        let lineHeight = 1.1; // ems
        let x = text.attr("x")
        let y = text.attr("y")
        let dy = 0; //parseFloat(text.attr("dy")),
        let tspan = text.text(null)
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", dy + "em")
        while (word = words.pop())
        {
          line.push(word)
          tspan.text(line.join(char))
          if (tspan.node().getComputedTextLength() > width)
          {
            line.pop()
            tspan.text(line.join(char))
            line = [word]
            tspan = text.append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word)
          }
        }
      }
    )
  }
}
