// ############################################################################
// DistributionChart                                                       View
// ############################################################################
// Visualizes the distribution/variation of the temperature and precipitation
// data for each month in the selected time perion using box plots.
// ############################################################################


class DistributionChart extends Chart
{

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main, climateData,id)
  {
    var id = id;
    // Error handling: Only show chart if either prec or temp are given
    if (climateData.has_temp || climateData.has_prec)
      super(main, 'distribution-chart', climateData, id, null);

    else
      super(main, 'distribution-chart', null, id, null)
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Init local members
  // ==========================================================================

  _initMembers(climateData)
  {
    super._initMembers(climateData);

    // Number of subcharts (should be 2 -> temp and prec)
    this._numSubcharts = this._chartMain.subcharts.length;


    // ------------------------------------------------------------------------
    // Preparation: Position values for visualization elements
    // ------------------------------------------------------------------------

    // Position values of actual distribution charts
    // Pos for top and bottom: generic for all
    // Pos for left and right: array, because 2 subcharts

    let subplotWidth = (0
        + this._mainPos.right
        - this._mainPos.left
      ) / this._numSubcharts;

    this._chartPos =
    {
        left: [],
        top: ( 0
          + this._mainPos.top
          + this._chartsMain.padding
          + this._chartMain.margin.top
        ),
        right: [],
        bottom: ( 0
          + this._mainPos.bottom
          - this._chartsMain.padding
          - this._chartMain.margin.bottom
        ),
        width:  [],
        height: null,
    };

    for (let datatypeIdx = 0; datatypeIdx < this._numSubcharts; datatypeIdx++)
    {
      this._chartPos.left[datatypeIdx] = 0
        + this._mainPos.left
        + this._chartMain.margin.left
        + (datatypeIdx * subplotWidth)
        + this._chartsMain.padding;

      this._chartPos.right[datatypeIdx] = 0
        + this._mainPos.right
        - this._chartMain.margin.right
        - (((this._numSubcharts-1)-datatypeIdx) * subplotWidth)
        - this._chartsMain.padding;

      this._chartPos.width[datatypeIdx] = 0
        + this._chartPos.right[datatypeIdx]
        - this._chartPos.left[datatypeIdx]
    }

    this._chartPos.height = 0
      + this._chartPos.bottom
      - this._chartPos.top
  }

  // ========================================================================
  // Draw the whole chart
  // ========================================================================
  // - foreach set of data: distribution of temp|prec
  //    * axes + ticks
  //    * grids
  //    * boxplots
  // - todo: availablity bars: temp|prec
  // - todo: availablity legend
  // ========================================================================

  _setupChart()
  {
    super._setupChart();

    // N.B. Get local copy of climateData
    // This is veeeeeeeeery important! It drove me nuts, because I spent
    // more than 1 hour looking for the problem: Why did the global object
    // this._climateData change? Because it was referenced once instead of
    // copied properly...
    let climateData = this._main.modules.helpers.deepCopy(this._climateData);

    // Create boxplot group
    let svg = this._chart
      .append('g')
      .attr('id', 'boxplot-group'+ this._chartCollectionId);

    // For each subchart
    for (let datatypeIdx = 0; datatypeIdx < this._numSubcharts; datatypeIdx++)
    {
      // Error handling: Only setup the subcharts if there is data available
      if (!climateData['has_' + this._chartMain.subcharts[datatypeIdx].data])
        continue;

      // ----------------------------------------------------------------------
      // Prepare the data
      // Required format: array of arrays with data[m][2]
      //    m =            number of months (12)
      //    data[i][0] =   name of the ith column (month + data type)
      //    data[i][1] =   array of values for this month
      // ----------------------------------------------------------------------

      // Get climate data and min/max values (0: temp, 1: prec)
      let vizData = [];
      let vizMin = +Infinity;
      let vizMax = -Infinity;

      // For each month
      for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      {
        // Create empty array
        vizData[monthIdx] = [];

        // Name of month
        vizData[monthIdx][0] = MONTHS_IN_YEAR[monthIdx];

        // Get data values
        let values = this._main.modules.helpers.deepCopy(climateData
          [this._chartMain.subcharts[datatypeIdx].data + '_list']
          [monthIdx]
        );
        vizData[monthIdx][1] = values;

        // For each value
        for (let valueIdx = 0; valueIdx < values.length; valueIdx++)
        {
          let value = values[valueIdx];
          if (value > vizMax) vizMax = value;
      		if (value < vizMin) vizMin = value
        }
      }

      // Update fixed maxRange, if for some reason it is not enough
      let maxRange = this._main.modules.helpers.deepCopy(
        this._chartMain.subcharts[datatypeIdx].maxRange
      );
      while (maxRange[0] > vizMin)
        maxRange[0] += this._chartMain.subcharts[datatypeIdx].maxRange[0];
      while (maxRange[1] < vizMax)
        maxRange[1] += this._chartMain.subcharts[datatypeIdx].maxRange[1];

      // Manipulation: extend min and max values to make the chart look better
      let stretch = (vizMax - vizMin) * this._chartMain.minMaxStretchFactor;
      vizMin -= stretch;
      vizMax += stretch;

      // For prec: clip min to zero
      if (this._chartMain.subcharts[datatypeIdx].data == 'prec')
        vizMin = Math.max(vizMin, 0);

      // Error handling: if empty month arrays, write value 0
      for (let monthData of vizData)
        if (monthData[1].length == 0)
          monthData[1] = [0];


      // ----------------------------------------------------------------------
      // Draw the visualization elements in the chart
      // ----------------------------------------------------------------------

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // x-Axis
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      let xScale = d3.scale
        .ordinal()
        .domain(MONTHS_IN_YEAR)
        .rangeRoundBands([0 , this._chartPos.width[datatypeIdx]], 0.7, 0.3);

      let xAxis = d3.svg
        .axis()
        .scale(xScale)
        .orient('bottom');



      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // y-Axis
      // -> 2 switch state modi:
      //  0: reative  - adapt scale to data values and distribute perfectly
      //  1: fixed      - always the same scale to make charts comparable
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      let yDomain = null;
      if (this._chartMain.switch.activeState == 0) 
        yDomain = [vizMin, vizMax];
      else if (this._chartMain.switch.activeState == 1)
        yDomain = maxRange;
      else { // No Y-Axis Scaling defined for activeState of switch => set to first option   
        return this._chartMain.switch.activeState = 0;
      }
        

      let yScale = d3.scale
        .linear()
        .domain(yDomain)
        .range(
          [
            this._chartPos.bottom,
            this._chartPos.top
          ]
        );

      let yAxis = d3.svg
        .axis()
        .scale(yScale)
        .orient('left');



      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Grid lines
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      // x-Direction

      let xGrid = d3.svg
      	.axis()
      	.scale(xScale)
      	.tickSize(0
          + this._chartPos.top
          - this._chartPos.bottom
        )
      	.tickSubdivide(true)
      	.tickPadding(5)
      	.tickFormat('');

      svg.append('svg:g')
        .attr('class', 'grid')
        .attr('transform', 'translate('
          + this._chartPos.left[datatypeIdx]
          + ','
          + this._chartPos.bottom
          + ')'
        )
        .call(xGrid);

      // y-Direction

      let yGrid = d3.svg
      	.axis()
      	.scale(yScale)
      	.tickSize(0
          - this._chartPos.width[datatypeIdx]
        )
      	.orient('left')
      	.tickFormat('');

      svg.append('svg:g')
        .attr('class', 'grid')
        .attr('transform','translate('
          + this._chartPos.left[datatypeIdx]
          + ','
          + 0
          + ')'
        )
        .call(yGrid);


      // Styling

      svg.selectAll('.grid')
        .style('fill', 'none')
        .style('stroke', this._chartsMain.colors.grid)
        .style('stroke-width', this._chartMain.style.gridWidth + ' px')
        .attr('shape-rendering', 'crispEdges');


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Boxplots
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      let boxplots = d3.boxplot()
        .whiskers(this._iqr(1.5))
        .height(this._chartPos.height)
        .domain(yDomain)
        .showLabels(false);

      svg.selectAll('.boxplot')
        .data(vizData)
        .enter()
        .append('g')
        .attr('transform', (d) =>
          {
            return ('translate('
              + (xScale(d[0]) + this._chartPos.left[datatypeIdx])
              + ','
              + this._chartPos.top
              + ')'
            )
          }
        )
        .style('font-size', this._chartsMain.fontSizes.large + 'em')
        .style('fill', this._chartMain.subcharts[datatypeIdx].color)
        .style('opacity', this._chartMain.style.boxOpacity)
        .call(boxplots.width(xScale.rangeBand()));


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Draw Scales last 
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate('
          + this._chartPos.left[datatypeIdx]
          + ','
          + this._chartPos.bottom
          + ')'
        )
        .style('font-size', this._chartsMain.fontSizes.small + 'em')
        .call(xAxis);

      svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('
          + this._chartPos.left[datatypeIdx]
          + ','
          + 0
          + ')'
        )
        .call(yAxis);


      // Styling

      svg.selectAll('.axis .domain')
      	.style('fill', 'none')
      	.style('stroke', 'black')
      	.style('stroke-width', this._chartMain.style.axesWidth + 'px')
      	.attr('shape-rendering', 'crispEdges');


      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // Title
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      svg.append('text')
        .attr('x', 0
          + this._chartPos.left[datatypeIdx]
          + (this._chartPos.width[datatypeIdx] / 2)
        )
        .attr('y', 0
          + this._chartPos.top
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
        let q1 = d.quartiles[0];
        let q3 = d.quartiles[2];
        let iqr = (q3 - q1) * k;
        let i = -1;
        let j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j]
      }
  }

}
