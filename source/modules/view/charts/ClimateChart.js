// ############################################################################
// ClimateChart                                                           View
// ############################################################################
// Visualizes temperature and precipitation for each month in a Walter-Lieth
// Climate Chart and a data table for the monthly temperature mean and
// precipitation sum.
// This is the main element of the application and therefore provides its name.
// ############################################################################


class ClimateChart extends Chart
{

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Constructor
  // ==========================================================================


  constructor(main, climateData)
  {
    // Error handling: Only show chart if both prec and temp are given
    if (climateData.has_temp && climateData.has_prec)
      super(main, 'climate-chart', climateData)

    else
      super(main, 'climate-chart', null)
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
    
    this.xScale = null
    
    this.yScaleTempAboveBreak = null
    this.yScaleTempBelowBreak = null
    
    this.yScalePrecAboveBreak = null
    this.yScalePrecBelowBreak = null
    this.ticks = null
    this.defs = null  
    
    
    // Status variable: is there a break value at which the chart
    // switches between the humid and the perhumid zone?
    this.breakExists = false
    
  }


  _setupToolbar()
  {
    super._setupToolbar()

    let graphOptions = this._main.modules.domElementCreator.create(
      'div', 'cc-graph-options'
    )
    this._toolbar[0].appendChild(graphOptions)


    let graphOptionLine = this._main.modules.domElementCreator.create(
      'a', 'cc-graph-option-first',[] , [['title', 'Walter-Lieth Chart']]
    )
    graphOptions.appendChild(graphOptionLine)


    let graphOptionBar = this._main.modules.domElementCreator.create(
      'a', 'cc-graph-option-middle',[] , [['title', 'Bar Chart']]
    )
    graphOptions.appendChild(graphOptionBar)
    
    
    let graphOptionStep = this._main.modules.domElementCreator.create(
      'a', 'cc-graph-option-last',[] , [['title', 'Step Chart']]
    )
    graphOptions.appendChild(graphOptionStep)


    // ------------------------------------------------------------------------
    // Label switch title and switch states
    // ------------------------------------------------------------------------
    graphOptions.childNodes[this._chartMain.switch.activeState].className ='cc-graph-active'
    
    graphOptionLine.innerHTML = '<i class="fa fa-area-chart" aria-hidden="true"></i>'
    graphOptionBar.innerHTML = '<i class="fa fa-bar-chart" aria-hidden="true"></i>'
    graphOptionStep.innerHTML = '<i class="fa fa-map" aria-hidden="true"></i>'



    // ------------------------------------------------------------------------
    // Interaction: click on toggle switch to change the layout
    // ------------------------------------------------------------------------

    $(graphOptions.childNodes).click((e) =>
      {
        // clean chart
        $('#climate-chart').remove()
      
        //set active state and reset other Options
        for (let i = 0; i < e.currentTarget.parentNode.childNodes.length; i++)
        {
            if(e.currentTarget.parentNode.childNodes[i] === e.currentTarget){
                this._chartMain.switch.activeState = i
            }
            else {
                e.currentTarget.parentNode.childNodes[i].className=''
            }    
        }
        
        e.currentTarget.className ='cc-graph-active'

        this._setupChart()
        this._setupHeaderFooter()
      }
    )
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

  _setupChart()
  {
    super._setupChart()
    
    
    this._setupScales()
    this._drawGrid()    
    
   
    
    if (this._chartMain.switch.activeState == 0) {
        this._drawAreas("linear")
        this._drawPrecLine("linear")
    }
    else if(this._chartMain.switch.activeState == 1) {
        
    }
    else if(this._chartMain.switch.activeState == 2) {
        this._drawAreas("step")
        this._drawPrecLine("step")
    }
    
    
    this._drawTempLine() 
    this._drawAxis()
 
    this._drawCaption()
    this._drawTable()

    
    

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

    //this._chartWrapper.mouseover(hideCircles)

    this._chartWrapper.mouseout(hideCircles)
    this._chartWrapper.mouseout(defocusMonth)


    //Todo: change wording from "click" to "mouse" position 
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
        let tickPos = this.xScale.range()

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
            + this.yScaleTempBelowBreak(this._climateData.monthly_short[xI].temp) + ')'
        )

        if (
          this._climateData.monthly_short[xI].prec <=
          this._chartMain.prec.breakValue
        )
        {
          c2.attr('transform',
            'translate('
              + tickPos[xI] + ','
              + this.yScalePrecBelowBreak(this._climateData.monthly_short[xI].prec) + ')'
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
              + this.yScalePrecAboveBreak(this._climateData.monthly_short[xI].prec) + ')'
          )
        }
      }
    )

  }

  _setupScales()
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

    this.ticks =
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

    // Defs contains the paths that are later used for clipping the areas
    // between the temperature and precipitation lines.
    this.defs = this._chart.append('defs')


    // ------------------------------------------------------------------------
    // Determine characteristic positions for temp and prec scale
    // (min, zero, break, max)
    // ------------------------------------------------------------------------

    // Scale ratios (below break): scale temp <-> scale prec => should be 2
    let scaleRatiobelowBreak =
      this._chartMain.prec.distBelowBreak /
      this._chartMain.temp.dist

    // 1) Zero: (0 for both)
    this.ticks.temp.zero = 0
    this.ticks.prec.zero = 0

    // 2) Min:
    // Temp: either (minimum value floored to multiples of 10 °C) or (0 °C)
    // -> avoid min temp above 0°C
    this.ticks.temp.min = Math.min(
      0,
      Math.floor(
        this._climateData.extreme.minTemp /
        this._chartMain.temp.dist
      ) * this._chartMain.temp.dist
    )

    // Prec: If there are negative temp values, the zeropoints of both y axes
    // must be in alignment => adapt
    this.ticks.prec.min = this.ticks.temp.min * scaleRatiobelowBreak

    // 3) Break: breakValue for prec, in ratio for temp
    this.ticks.prec.break = this._chartMain.prec.breakValue
    this.ticks.temp.break = this.ticks.prec.break / scaleRatiobelowBreak

    // 4) Max:
    // If prec exceeds the break line
    if (this._climateData.extreme.maxPrec > this.ticks.prec.break)
    {
      // Status: yes, break value exists
      this.breakExists = true

      // Preparation
      let breakValue = this._chartMain.prec.breakValue
      let precDistAbove = this._chartMain.prec.distAboveBreak
      let maxPrec = this._climateData.extreme.maxPrec
      let tempDist = this._chartMain.temp.dist
      let maxTemp = this.ticks.temp.break

      // Calculate max prec tick: Ceiled to distance above break line (200)
      // shifted by breakValue (100)
      this.ticks.prec.max = Math.ceil(
        (maxPrec - breakValue) / precDistAbove
      ) * precDistAbove + breakValue

      // Calculate max temp tick
      this.ticks.temp.max =
        ((this.ticks.prec.max - breakValue) / precDistAbove) *
        tempDist + maxTemp
    }

    // If prec does not exceed the break line, it is also the max line
    else
    {
      this.ticks.prec.max = this.ticks.prec.break
      this.ticks.temp.max = this.ticks.temp.break
    }


    // ------------------------------------------------------------------------
    // Fill up tick values
    // ------------------------------------------------------------------------

    // Temp below break: all from min to break value
    for (
      let tickValue =   this.ticks.temp.min;
      tickValue     <=  this.ticks.temp.break;
      tickValue     +=  this._chartMain.temp.dist
    )
      this.ticks.temp.values.belowBreak.push(tickValue)

    // Temp above break: non-existing

    // Prec below break: all from zero to break value
    for (
      let tickValue =   this.ticks.prec.zero;
      tickValue     <=  this.ticks.prec.break;
      tickValue     +=  this._chartMain.prec.distBelowBreak
    )
      this.ticks.prec.values.belowBreak.push(tickValue)

    // Prec above break: all from first after break to max
    // -> do not include the one at the break value since it already exists
    // in the tick values from below the break value
    for (
      let tickValue =   this.ticks.prec.break +
                        this._chartMain.prec.distAboveBreak;
      tickValue     <=  this.ticks.prec.max;
      tickValue     +=  this._chartMain.prec.distAboveBreak
    )
      this.ticks.prec.values.aboveBreak.push(tickValue)


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
    if (this.breakExists)
      this._chartPos.break += (cellWidth * this.ticks.prec.values.aboveBreak.length)

    // min position: between break and min (>=5 cells)
    this._chartPos.min = this._chartPos.break
      + cellWidth * (this.ticks.temp.values.belowBreak.length-1)

    // bottom position: min position + space for heading
    this._chartPos.bottom = 0
      + this._chartPos.min
      + this._chartMain.diagramMargin.min

    // Adapt chart size: final bottom position - initial bottom position
    this._resizeChartHeight(this._chartPos.bottom - initBottomPos)
    
    
    // ------------------------------------------------------------------------
    // Setup scales
    // ------------------------------------------------------------------------

    // x-Axis

    this.xScale = d3.scale
      .ordinal()
      .domain(MONTHS_IN_YEAR)
      .range([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      .rangePoints(
        [
          this._chartPos.left,
          this._chartPos.right
        ], 0
      )
    
    // y-Axis left: temperature (below break value)

    this.yScaleTempBelowBreak = d3.scale
      .linear()
      .domain(
        [
          this.ticks.temp.min,
          this.ticks.temp.break
        ]
      )
      .range(
        [
          this._chartPos.min,
          this._chartPos.break
        ]
      )
    
    // y-Axis left: temperature (above break value)

    this.yScaleTempAboveBreak = d3.scale
      .linear()
      .domain(
        [
          this.ticks.temp.break,
          this.ticks.temp.max
        ]
      )
      .range(
        [
          this._chartPos.max,
          this._chartPos.break,
        ]
      )
    
    // y-Axis right: precipitation (below break value)

    this.yScalePrecBelowBreak = d3.scale
      .linear()
      .domain(
        [
          this.ticks.prec.min,
          this.ticks.prec.break
        ]
      )
      .range(
        [
          this._chartPos.min,
          this._chartPos.break
        ]
      )
    
    // y-Axis right: precipitation (above break value)

    this.yScalePrecAboveBreak = d3.scale
      .linear()
      .domain(
        [
          this.ticks.prec.break,
          this.ticks.prec.max
        ]
      )
      .range(
        [
          this._chartPos.break,
          this._chartPos.max,
        ]
      )
}
  
  _drawAxis()
  {
    
    // x-Axis  
      
    let xAxis = d3.svg
      .axis()
      .scale(this.xScale)
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

    let yAxisTempBelowBreak = d3.svg
      .axis()
      .scale(this.yScaleTempBelowBreak)
      .tickValues(this.ticks.temp.values.belowBreak)
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

    let yAxisTempAboveBreak = d3.svg
      .axis()
      .scale(this.yScaleTempAboveBreak)
      .tickValues(this.ticks.temp.values.aboveBreak)
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

    let yAxisPrecBelowBreak = d3.svg
      .axis()
      .scale(this.yScalePrecBelowBreak)
      .tickValues(this.ticks.prec.values.belowBreak)
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

    let yAxisPrecAboveBreak = d3.svg
      .axis()
      .scale(this.yScalePrecAboveBreak)
      .tickValues(this.ticks.prec.values.aboveBreak)
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

    this._chart.selectAll('.axis .tick line')
        .style('stroke', 'black')

  }

  _drawGrid()
  {
    // ------------------------------------------------------------------------
    // Grid lines
    // concept: one line with one tick per value. The size of the tick is the
    // width / height of the chart => tick stretches all the way through the
    // chart and therefore serves as grid.
    // ------------------------------------------------------------------------

    // Grid in x-direction

    let xGrid = d3.svg
    	.axis()
    	.scale(this.xScale)
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
    	.scale(this.yScaleTempBelowBreak)
    	.tickValues(this.ticks.temp.values.belowBreak)
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

    if (this.breakExists)
    {
      let yGridAboveBreak = d3.svg
        .axis()
        .scale(this.yScalePrecAboveBreak)
        .tickValues(this.ticks.prec.values.aboveBreak)
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
  }

  _drawAreas(curveType)
  {
    // ------------------------------------------------------------------------
    // Areas showing temp and prec
    // ------------------------------------------------------------------------

    // Area below temperature line

    if (this._chartMain.switch.activeState == 0) {
 
        let areaTemp = d3.svg
          .area()
          .x( (d) => {return this.xScale(d.month)})
          .y0((d) => {return this.yScaleTempBelowBreak(d.temp)})
          .y1(this._chartPos.min)
          .interpolate('linear')

        this._chart.append('path')
          .data(this._climateData.monthly_short)
          .attr('class', 'area')
          .attr('d', areaTemp(this._climateData.monthly_short))
          .attr('clip-path', 'url(#clip-prec)')
          .attr('fill', this._chartsMain.colors.arid)
          .attr('stroke', 'none')
    }

    // Area below precipitation line

    let areaPrecBelowBreak = d3.svg
      .area()
      .x( (d) => {return this.xScale(d.month)})
      .y0((d) => {return this.yScalePrecBelowBreak(d.prec)})
      .y1(this._chartPos.min)
      .interpolate(curveType)

    this._chart.append('path')
      .data(this._climateData.monthly_short)
      .attr('class', 'area')
      .attr('d', areaPrecBelowBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#clip-temp)')
      .attr('fill', this._chartsMain.colors.humid)
      .attr('stroke', 'none')

    let areaPrecAboveBreak = d3.svg
      .area()
      .x( (d) => {return this.xScale(d.month)})
      .y0((d) => {return this.yScalePrecAboveBreak(d.prec)})
      .y1(this._chartPos.break)
      .interpolate(curveType)

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

    let areaTempTo100 = null
    if (this._chartMain.switch.activeState == 0) {

        areaTempTo100 = d3.svg.area()
          .x( (d) => {return this.xScale(d.month)})
          .y0((d) => {return this.yScaleTempBelowBreak(d.temp)})
          .y1(this._chartPos.break)
          .interpolate('linear')
    }
    else {
        areaTempTo100 = d3.svg.area()
          .x( (d) => {return this.xScale(d.month)})
          .y0((d) => {return this.yScalePrecBelowBreak(0)})
          .y1(this._chartPos.break)
          .interpolate('linear')

        // Adding line on zero y
        
        let zeroLine = d3.svg.line()
            .x( (d) => { return d.x })
            .y( (d) => { return d.y })
            .interpolate('linear')

        this._chart.append("path")
            .attr('class', 'line')
            .attr("d", zeroLine([ { "x": this._chartPos.left,   "y": this.yScalePrecBelowBreak(0)}, { "x": this._chartPos.right,  "y": this.yScalePrecBelowBreak(0)} ]))
            .attr('stroke', d3.rgb("#000"))
            .attr('stroke-width', this._chartMain.style.gridWidth)
            .attr('shape-rendering', 'crispEdges')
    }
    
    this.defs.append('clipPath')
      .attr('id', 'clip-temp')
      .append('path')
      .attr('d', areaTempTo100(this._climateData.monthly_short))
    
    let area100ToMax = d3.svg.area()
      .x( (d) => {return this.xScale(d.month)})
      .y0(this.yScalePrecAboveBreak(this._chartMain.prec.breakValue))
      .y1(0)
      .interpolate('linear')

    this.defs.append('clipPath')
      .attr('id', 'clip-temp2')
      .append('path')
      .attr('d', area100ToMax(this._climateData.monthly_short))

    let areaAbovePrec = d3.svg.area()
      .x( (d) => {return this.xScale(d.month)})
      .y0((d) => {return this.yScalePrecBelowBreak(d.prec)})
      .y1(this._chartPos.break)
      .interpolate(curveType)

    this.defs.append('clipPath')
      .attr('id', 'clip-prec')
      .append('path')
      .attr('d', areaAbovePrec(this._climateData.monthly_short))
    
    // Cover overlapping prec lines resulting from break value
    
    if (this.breakExists)
    {
      this.defs.append('clipPath')
        .attr('id',     'rect-bottom')
        .append('rect')
        .attr('x',      this._chartPos.left)
        .attr('y',      this._chartPos.break)
        .attr('width',  this._chartPos.width)
        .attr('height', (this._chartPos.min-this._chartPos.break))

      this.defs.append('clipPath')
        .attr('id',     'rect-top')
        .append('rect')
        .attr('x',      this._chartPos.left)
        .attr('y',      this._chartPos.max)
        .attr('width',  this._chartPos.width)
        .attr('height', (this._chartPos.break - this._chartPos.max))
    }
    
    // Styling

    this._chart.selectAll('.area')
      .style('opacity', this._chartMain.style.areaOpacity)



  }

  _drawPrecLine(curveType)
  {
    
    // Precipitation line abovebreak
    
        if (this.breakExists)
    {
      let linePrecAboveBreak = d3.svg.line()
        .x( (d) => {return this.xScale(d.month)})
        .y( (d) => {return this.yScalePrecAboveBreak(d.prec)})
        .interpolate(curveType)

      this._chart.append('svg:path')
        .attr('class', 'line')
        .attr('d', linePrecAboveBreak(this._climateData.monthly_short))
        .attr('clip-path', 'url(#rect-top)')
        .attr('fill', 'none')
        .attr('stroke', this._chartsMain.colors.prec)
        .attr('stroke-width', this._chartMain.style.lineWidth)
    }
    
    // Precipitation line below break

    let linePrecBelowBreak = d3.svg
      .line()
      .x( (d) => {return this.xScale(d.month)})
      .y( (d) => {return this.yScalePrecBelowBreak(d.prec)})
      .interpolate(curveType)

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', linePrecBelowBreak(this._climateData.monthly_short))
      .attr('clip-path', 'url(#rect-bottom)')
      .attr('fill', 'none')
      .attr('stroke', this._chartsMain.colors.prec)
      .attr('stroke-width', this._chartMain.style.lineWidth)

  }

  _drawTempLine()
  {
      
    // Temperature line

    let lineTemp = d3.svg
      .line()
      .x( (d) => {return this.xScale(d.month)} )
      .y( (d) => {return this.yScaleTempBelowBreak(d.temp)} )
      .interpolate('linear')

    this._chart.append('svg:path')
      .attr('class', 'line')
      .attr('d', lineTemp(this._climateData.monthly_short))
      .attr('fill', 'none')
      .attr('stroke', this._chartsMain.colors.temp)
      .attr('stroke-width', this._chartMain.style.lineWidth)
      
  }

  _drawCaption()
  {
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
  }

  _drawTable()
  {
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
