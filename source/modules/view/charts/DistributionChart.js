// ############################################################################
// DistributionChart                                                       View
// ############################################################################
// Credits to: "Box Plots",Jens Grubert & Mike Bostock, access: 14.07.2017
// http://bl.ocks.org/jensgrubert/7789216
// ############################################################################

class DistributionChart extends Chart
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

    super(main, 'distribution-chart', climateData)
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Init local members
  // ==========================================================================

  _initMembers()
  {
    // Initial switch state -> must be 0 !!!
    this._switchState = 0

    // Number of subcharts (should be 2 -> temp and prec)
    this._numSubcharts = this._chartMain.subcharts.length


    // ------------------------------------------------------------------------
    // Preparation: Position values for visualization elements
    // ------------------------------------------------------------------------

    // Position values of actual distribution charts
    // array, because 2 subcharts
    // Pos from top, bottom, left, right and position of horizontal break bar

    let subplotWidth = (0
        + this._mainPos.right
        - this._mainPos.left
      ) / this._numSubcharts

    this._chartPos = []
    for (let datatypeIdx = 0; datatypeIdx < this._numSubcharts; datatypeIdx++)
    {
      this._chartPos[datatypeIdx] =
      {
        left: ( 0
          + this._mainPos.left
          + this._chartMain.margin.left
          + (datatypeIdx * subplotWidth)
          + this._chartsMain.padding
        ),
        top: ( 0
          + this._mainPos.top
          + this._chartsMain.padding
          + this._chartMain.margin.top
        ),
        right: ( 0
          + this._mainPos.right
          - this._chartMain.margin.right
          - (((this._numSubcharts-1)-datatypeIdx) * subplotWidth)
          - this._chartsMain.padding
        ),
        bottom: ( 0
          + this._mainPos.bottom
          - this._chartsMain.padding
          - this._chartMain.margin.bottom
        ),
      }
      this._chartPos[datatypeIdx].width = 0
        + this._chartPos[datatypeIdx].right
        - this._chartPos[datatypeIdx].left
      this._chartPos[datatypeIdx].height = 0
        + this._chartPos[datatypeIdx].bottom
        - this._chartPos[datatypeIdx].top
    }


    // ------------------------------------------------------------------------
    // Create structure
    // dc = distribution chart
    // _wrapperDiv
    // |-> _chart         // main svg canvas contains charts, printed
    // _toolbar			      // buttons for changing/saving charts, not printed
    // |-> dc-switch      // switch optimal <-> fixed scale
    // |   |-> label      '.switch-light switch-candy'
    // |   |-> input      'dc-switch-input'
    // |   |-> div        'dc-switch-title'
    // |   |-> span       'dc-switch-options'
    // |   |   |-> span   'dc-switch-option-l'
    // |   |   |-> span   'dc-switch-option-r'
    // |   |   |-> a      'dc-switch-button'
    // ------------------------------------------------------------------------

    // Level 1@_toolbar - dc-switch
    let dcSwitch = this._domElementCreator.create('div', 'dc-switch')
    this._toolbar.appendChild(dcSwitch)

    let switchLabel = this._domElementCreator.create(
      'label', null, ['switch-light', 'switch-candy'], [['onClick', '']]
    )
    dcSwitch.appendChild(switchLabel)

    let switchInput = this._domElementCreator.create(
      'input', 'dc-switch-input', null, [['type', 'checkbox']]
    )
    switchLabel.appendChild(switchInput)

    let switchTitle = this._domElementCreator.create(
      'div', 'dc-switch-title'
    )
    switchLabel.appendChild(switchTitle)

    let switchOptions = this._domElementCreator.create(
      'span', 'dc-switch-options'
    )
    switchLabel.appendChild(switchOptions)

    let switchOptionL = this._domElementCreator.create(
      'span', 'dc-switch-option-l', ['dc-switch-option']
    )
    switchOptions.appendChild(switchOptionL)

    let switchOptionR = this._domElementCreator.create(
      'span', 'dc-switch-option-r', ['dc-switch-option']
    )
    switchOptions.appendChild(switchOptionR)

    let switchButton = this._domElementCreator.create(
      'a', 'dc-switch-button'
    )
    switchOptions.appendChild(switchButton)


    // ------------------------------------------------------------------------
    // Label switch title and switch states
    // ------------------------------------------------------------------------

    switchTitle.innerHTML = this._chartMain.switch.title
    switchOptionL.innerHTML = ""
      + this._chartMain.switch.states[0].charAt(0).toUpperCase()
      + this._chartMain.switch.states[0].slice(1)
    switchOptionR.innerHTML = ""
      + this._chartMain.switch.states[1].charAt(0).toUpperCase()
      + this._chartMain.switch.states[1].slice(1)


    // ------------------------------------------------------------------------
    // Interaction: click on toggle switch to change the layout
    // ------------------------------------------------------------------------

    $(switchOptions).click((e) =>
      {
        this._switchState = (this._switchState+1) % 2
        this._drawChart()
      }
    )


    // ------------------------------------------------------------------------
    // Resize graph on window resize
    // -> this is the brute force method. It would be nicer to plot it only
    // once and then to resize it, but that did not work cuz I used subcharts.
    // ------------------------------------------------------------------------

    // TODO
    // $(window).resize(this._drawChart)

  }


  // ==========================================================================
  // Draw the whole chart
  // ==========================================================================

  _drawChart()
  {
    // Clean charts
    $('#boxplot-group').remove()

    // Create boxplot group
    let svg = this._chart
      .append('g')
      .attr('id', 'boxplot-group')

    // For each subchart
    for (let datatypeIdx = 0; datatypeIdx < this._numSubcharts; datatypeIdx++)
    {
      // ----------------------------------------------------------------------
      // Prepare the data
      // Required format: array of arrays with data[m][2]
      //    m =            number of months (12)
      //    data[i][0] =   name of the ith column (month + data type)
      //    data[i][1] =   array of values for this month
      // ----------------------------------------------------------------------

      // Get climate data and min/max values (0: temp, 1: prec)
      let vizData = []
      let vizMin = +Infinity
      let vizMax = -Infinity

      // For each month
      for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      {
        // Create empty array
        vizData[monthIdx] = []

        // Name month
        vizData[monthIdx][0] = MONTHS_IN_YEAR[monthIdx]

        // Get data values
        let values = this._climateData
          [this._chartMain.subcharts[datatypeIdx].data + '_long']
          [monthIdx]
        vizData[monthIdx][1] = values

        // For each value
        for (let valueIdx = 0; valueIdx < values.length; valueIdx++)
        {
          let value = values[valueIdx]
          if (value > vizMax) vizMax = value
      		if (value < vizMin) vizMin = value
        }
      }

      // Manipulation: extend min and max values to make the chart look better
      let stretch = (vizMax - vizMin) * this._chartMain.minMaxStretchFactor
      vizMin -= stretch
      vizMax += stretch

      // For prec: clip min to zero
      if (this._chartMain.subcharts[datatypeIdx].data == 'prec')
        vizMin = Math.max(vizMin, 0)


      // ----------------------------------------------------------------------
      // Draw the visualization elements in the chart
      // ----------------------------------------------------------------------

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // x-Axis
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      let xScale = d3.scale
        .ordinal()
        .domain(MONTHS_IN_YEAR)
        .rangeRoundBands([0 , this._chartPos[datatypeIdx].width], 0.7, 0.3)

      let xAxis = d3.svg
        .axis()
        .scale(xScale)
        .orient('bottom')

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('
          + this._chartPos[datatypeIdx].left
          + ','
          + this._chartPos[datatypeIdx].bottom
          + ')'
        )
        .style('font-size', this._chartsMain.fontSizes.small + 'em')
        .call(xAxis)


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // y-Axis
      // -> 2 switch state modi:
      //  0: automatic  - adapt scale to data values and distribute perfectly
      //  1: fixed      - always the same scale to make charts comparable
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      let yDomain = null
      if (this._switchState == 0) //  => automatic
        yDomain = [vizMin, vizMax]
      else // switchState == 1        => fixed
        yDomain = this._chartMain.subcharts[datatypeIdx].maxRange

      let yScale = d3.scale
        .linear()
        .domain(yDomain)
        .range(
          [
            this._chartPos[datatypeIdx].bottom,
            this._chartPos[datatypeIdx].top
          ]
        )

      let yAxis = d3.svg
        .axis()
        .scale(yScale)
        .orient('left')

      svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('
          + this._chartPos[datatypeIdx].left
          + ','
          + 0
          + ')'
        )
        .call(yAxis)


      // Styling

      svg.selectAll('.axis .domain')
      	.style('fill', 'none')
      	.style('stroke', 'black')
      	.style('stroke-width', this._chartMain.style.axesWidth + 'px')
      	.attr('shape-rendering', 'crispEdges');


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Grid lines
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // x-Direction

      let xGrid = d3.svg
      	.axis()
      	.scale(xScale)
      	.tickSize(0
          + this._chartPos[datatypeIdx].top
          - this._chartPos[datatypeIdx].bottom
        )
      	.tickSubdivide(true)
      	.tickPadding(5)
      	.tickFormat('')

      svg.append('svg:g')
        .attr('class', 'grid')
        .attr('transform', 'translate('
          + this._chartPos[datatypeIdx].left
          + ','
          + this._chartPos[datatypeIdx].bottom
          + ')'
        )
        .call(xGrid)

      // y-Direction

      let yGrid = d3.svg
      	.axis()
      	.scale(yScale)
      	.tickSize(0
          - this._chartPos[datatypeIdx].width
        )
      	.orient('left')
      	.tickFormat('')

      svg.append('svg:g')
        .attr('class', 'grid')
        .attr('transform','translate('
          + this._chartPos[datatypeIdx].left
          + ','
          + 0
          + ')'
        )
        .call(yGrid)


      // Styling

      svg.selectAll('.grid')
        .style('fill', 'none')
        .style('stroke', this._chartsMain.colors.grid)
        .style('stroke-width', this._chartMain.style.gridWidth + ' px')
        .attr('shape-rendering', 'crispEdges')


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Boxplots
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      let boxplots = d3.boxplot()
        .whiskers(this._iqr(1.5))
        .height(this._chartPos[datatypeIdx].height)
        .domain(yDomain)
        .showLabels(false)

      svg.selectAll('.boxplot')
        .data(vizData)
        .enter()
        .append('g')
        .attr('transform', (d) =>
          {
            return ('translate('
              + (xScale(d[0]) + this._chartPos[datatypeIdx].left)
              + ','
              + this._chartPos[datatypeIdx].top
              + ')'
            )
          }
        )
        .style('font-size', this._chartsMain.fontSizes.large + 'em')
        .style('fill', this._chartMain.subcharts[datatypeIdx].color)
        .style('opacity', this._chartMain.style.boxOpacity)
        .call(boxplots.width(xScale.rangeBand()))


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Title
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      svg.append('text')
        .attr('x', 0
          + this._chartPos[datatypeIdx].left
          + (this._chartPos[datatypeIdx].width / 2)
        )
        .attr('y', 0
          + this._chartPos[datatypeIdx].top
          - this._chartMain.margin.top
        )
        .attr('text-anchor', 'middle')
        .style('font-size', this._chartsMain.fontSizes.large + 'em')
        .text(this._chartMain.subcharts[datatypeIdx].title)

    }
  }


  // ==========================================================================
  // Compute the interquartile range (IQR)
  // ==========================================================================

  _iqr(k)
  {
    return (d) =>
      {
        let q1 = d.quartiles[0]
        let q3 = d.quartiles[2]
        let iqr = (q3 - q1) * k
        let i = -1
        let j = d.length
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j]
      }
  }

}
