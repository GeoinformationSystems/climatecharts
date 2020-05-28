// ############################################################################
// AvailabilityChart                                                       View
// ############################################################################
// Visualizes the coverage/availability of the current ClimateData in a table:
// For each year, for each month show if temperature and/or precipitation data
// is available by coloring the taable cell gray or with the color.
// ############################################################################


class AvailabilityChart extends Chart
{

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Construct chart
  // ==========================================================================

  constructor(main, climateData, id)
  {
    var id = id;
    // Error handling: Only show chart if either prec or temp are given
    if (climateData.has_temp || climateData.has_prec)
      super(main, 'availability-chart', climateData, id, null);

    else
      super(main, 'availability-chart', null, id, null)

    
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

    // ------------------------------------------------------------------------
    // Preparation: Position values for visualization elements
    // ------------------------------------------------------------------------

    // Position values of actual climate chart
    // Pos from top, bottom, left, right and position of horizontal break bar
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
        + this._mainPos.width
        - this._chartsMain.padding
        - this._chartMain.margin.right
      ),
      bottom: ( 0
        + this._mainPos.bottom
        - this._chartsMain.padding
        - this._chartMain.margin.bottom
      ),
    };
    this._chartPos.width =  this._chartPos.right - this._chartPos.left;
    this._chartPos.height = this._chartPos.bottom - this._chartPos.top;
    //window.alert("height: " + this._chartHeight + " width: " + this._chartWidth);
  }


  // ========================================================================
  // Draw the whole chart
  // ========================================================================
  // - availability grid
  // - legend
  // ========================================================================

  _setupChart()
  {
    super._setupChart();

    // ------------------------------------------------------------------------
    // Setup grid
    // ------------------------------------------------------------------------

    // Actual data: 2d array gridData[year][2*month]
    // 1) temp, 2) prec
    // => [0] = Jan temp, [1] = Jan prec, [2] = Feb temp, ... , [23] = Dec prec
    let gridData = [];

    //flag for light color
    let lightColor;

    // Number of years = number of rows
    let numYears = this._climateData.years[1] - this._climateData.years[0] + 1;

    // Inital values for calculating svg rect positions
  	let xPos =   this._chartPos.left;
  	let yPos =   this._chartPos.top;
  	let width =  this._chartPos.width / (MONTHS_IN_YEAR.length*2);

    // Save initial yPos to calculate how much height must be added
    let startYPos = yPos;
    let lowtemp = false;
    let lowprecip = false;
    var range1, range2, range3, range4, range5;
    var p_range1, p_range2, p_range3, p_range4, p_range5;
    // let minTemp, maxTemp, minPrec, maxPrec;


    // For each year
  	for (let yearIdx = 0; yearIdx < numYears; yearIdx++)
    {
  		gridData.push([]);

      // For each month
  		for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
      {
        let tempValue = this._climateData.temp[monthIdx].raw_data[yearIdx];
        
        //set up color intervals
        if(this._chartMain.switch.activeState == 0){
          let minTemp = this._climateData.realextreme.minTemp;
          let maxTemp = this._climateData.realextreme.maxTemp;
          let range = maxTemp - minTemp;
          let interval = range / 6; 
          range1 = minTemp + interval;
          range2 = minTemp + 2*interval;
          range3 = minTemp + 3*interval;
          range4 = minTemp + 4*interval;
          range5 = minTemp + 5*interval;
        }
        else if (this._chartMain.switch.activeState == 1){
          range1 = 5;
          range2 = 10;
          range3 = 20;
          range4 = 30;
          range5 = 35;
        }
        else { // No Color Scaling defined for activeState of switch => set to first option
          return this._chartMain.switch.activeState = 0;
        }

        // assign colors
        let tempColor;
        if (!this._main.modules.helpers.checkIfNumber(tempValue)){
          tempColor = this._chartsMain.colors.noData;
        }
        else if(tempValue <= range1){
          tempColor = this._chartsMain.tempcolors.t_range1;
          lowtemp = true;
        }
        else if( range1 < tempValue && tempValue <= range2){
          tempColor = this._chartsMain.tempcolors.t_range2;
          lowtemp = true;
        }
        else if(range2< tempValue && tempValue <= range3){
          tempColor = this._chartsMain.tempcolors.t_range3;
          lowtemp = false;
        }
        else if( range3< tempValue&& tempValue <= range4){
          tempColor = this._chartsMain.tempcolors.t_range4;
          lowtemp = false;
        }
        else if(range4 < tempValue && tempValue <= range5){
          tempColor = this._chartsMain.tempcolors.t_range5;
          lowtemp = false;
        }
        else if(range5 < tempValue ){
          tempColor = this._chartsMain.tempcolors.t_range6;
          lowtemp = false;
        }

        // Add new grid data
        gridData[yearIdx].push(
          {
            x:                xPos,
            y:                yPos,
            width:            width,
            color:            tempColor,
            value:            tempValue,
            flag:             lowtemp,
          }
        );

        // Increment the x position => move it over
        xPos += width;

        // same procedure for prec value
        let precValue = this._climateData.prec[monthIdx].raw_data[yearIdx];

        // let p_range1, p_range2, p_range3, p_range4, p_range5;
        if(this._chartMain.switch.activeState == 0) {
          let minPrec = this._climateData.realextreme.minPrec;
          let maxPrec = this._climateData.realextreme.maxPrec;
          let p_range = maxPrec - minPrec;
          let p_interval = p_range / 6; 
          p_range1 = minPrec + p_interval;
          p_range2 = minPrec + 2*p_interval;
          p_range3 = minPrec + 3*p_interval;
          p_range4 = minPrec + 4*p_interval;
          p_range5 = minPrec + 5*p_interval;
        }
        else if(this._chartMain.switch.activeState == 1) {
          p_range1 = 40;
          p_range2 = 80;
          p_range3 = 120;
          p_range4 = 160;
          p_range5 = 200;
        }
        else { // No Color Scaling defined for activeState of switch => set to first option
          return this._chartMain.switch.activeState = 0;
        }

        let precColor = this._chartsMain.colors.prec;

        //assign prec values
        if (!this._main.modules.helpers.checkIfNumber(precValue)){
          precColor = this._chartsMain.colors.noData;
          lowprecip = false;
        }
        else if(precValue <= p_range1){
          precColor = this._chartsMain.precipcolors.p_range1;
          lowprecip = true;
        }
        else if( p_range1 < precValue && precValue <= p_range2){
          precColor = this._chartsMain.precipcolors.p_range2;
          lowprecip = true;
        }
        else if(p_range2< precValue && precValue <= p_range3){
          precColor = this._chartsMain.precipcolors.p_range3;
          lowprecip = false;
        }
        else if( p_range3< precValue&& precValue <= p_range4){
          precColor = this._chartsMain.precipcolors.p_range4;
          lowprecip = false;
        }
        else if(p_range4 < precValue && precValue <= p_range5){
          precColor = this._chartsMain.precipcolors.p_range5;
          lowprecip = false;
        }
        else if(p_range5 < precValue ){
          precColor = this._chartsMain.precipcolors.p_range6;
          lowprecip = false;
        }

        gridData[yearIdx].push(
          {
            x:                xPos,
            y:                yPos,
            width:            width,
            color:            precColor,
            value:            precValue,
            flag:             lowprecip,
          }
        );

        // Increment the x position => move it over
        xPos += width

  		}
  		// Reset the x position after a row is complete
  		xPos = this._chartPos.left;
  		// Increment the y position for the next row => Move it down
  		yPos += width
  	}

    let row = this._chart.selectAll('.ac-row')
    	.data(gridData)
    	.enter()
      .append('g')
      .classed( 'ac-row',true)
      .classed(this._chartName+this._chartCollectionId+'-ac', true);

    let column = row.selectAll('.square')
    	.data((d) => { return d })
    	.enter()
      .append('rect')
    	.attr('class',          'grid')
    	.attr('x',              (d) => { return d.x })
    	.attr('y',              (d) => { return d.y })
    	.attr('width',          (d) => { return d.width })
    	.attr('height',         (d) => { return d.width })
    	.style('fill',          (d) => { return d.color })
      .style('stroke',        this._chartsMain.colors.grid)
      .style('stroke-width',  this._chartMain.style.gridWidth + ' px')
      .attr('shape-rendering','crispEdges');

      // Create text containing the actual value
    let value = row.selectAll('.square')
    	.data((d) => { return d })
    	.enter()
      .append('text')
      .attr('class',          'ac-active-cell-text')
      .attr('x',              (d) => { return (d.x + d.width/2) })
      .attr('y',              (d) => { return (d.y + d.width/2) })
      .attr('text-anchor',    'middle')
      .attr('alignment-baseline', 'middle')
      .attr('fill',           (d) => { 
                                    if(d.flag){return 'black'}
                                        else{return 'white'}
                                      }
                                )
      .attr('font-size',      this._main.config.charts.fontSizes.tiny + 'em')
      .text(                  (d) =>
        {
          return (
            this._main.modules.helpers.roundToDecimalPlace
            (
              d.value, this._main.config.climateData.decimalPlaces, true
            )
          )
        }
      );


    // Add height: (final y pos - start y pos - start height)
    this._resizeChartHeight(yPos - startYPos - this._chartPos.height);


    // ------------------------------------------------------------------------
    // Title
    // ------------------------------------------------------------------------

    this._chart.append('text')

      .attr('text-anchor', 'middle')
      .classed(this._chartName+this._chartCollectionId+'-ac', true)
      .attr('font-size', (this._chartsMain.fontSizes.huge + 'em'))
      .attr('x', (this._mainPos.width/2))
      .attr('y', 0
        + this._chartPos.top
        - this._chartMain.style.titleMargin
      )
      .text(this._chartMain.headings.title);


      // ------------------------------------------------------------------------
      // Legend
      // ------------------------------------------------------------------------

      // Legend entry names (chartMain) must ailgn with color names (chartsMain)
      // ------------------------------------------------------------------------
      // Temperature Legend
      // ------------------------------------------------------------------------
      this._resizeChartHeight(this._chartMain.style.squareWidth);
      
      var index = 0;
      for(let color of Object.keys(this._chartsMain.tempcolors)){

      this._chart.append('rect')
        .classed(          'ac-legend-cell',true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
        .attr('x',              this._chartPos.left + index * this._chartMain.style.squareWidth)
        .attr('y',              this._chartPos.bottom)
        .attr('width',          this._chartMain.style.squareWidth)
        .attr('height',         this._chartMain.style.squareWidth)
        .style('fill',          this._chartsMain.tempcolors[color])
        // .style('opacity',       this._chartMain.style.cellOpacity)
        .style('stroke',        this._chartsMain.colors.grid)
        .style('stroke-width',  this._chartMain.style.gridWidth + ' px');

        index++;
      }

      // title
      this._chart.append('text')
        .classed(          'ac-text',true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
        .attr('text-anchor', 'start')
        .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
        .attr('x', 0
          + this._chartPos.left
          + this._chartMain.style.squareWidth
          + this._chartsMain.padding
          + 5 * this._chartMain.style.squareWidth
        )
        .attr('y', 0
        + this._chartPos.bottom
        + (this._chartMain.style.squareWidth/2)
        + this._chartMain.style.legendEntryMargin
      )
      .text(this._chartMain.legend.temp)

      // min value
      this._chart.append('text')
        .classed(          'ac-text',true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
        .attr('text-anchor', 'start')
        .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
        .attr('x', 0
          + this._chartPos.left
        )
        .attr('y', 0
          + this._chartPos.bottom
          + (this._chartMain.style.squareWidth/2)
          + this._chartMain.style.legendEntryMargin
          + this._chartMain.style.squareWidth
        )
        .text('< '+ range1.toFixed(2))

        //max value
        this._chart.append('text')
        .classed(          'ac-text',true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
        .attr('text-anchor', 'start')
        .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
        .attr('x', 0
          + this._chartPos.left
          + 5 * this._chartMain.style.squareWidth
        )
        .attr('y', 0
          + this._chartPos.bottom
          + (this._chartMain.style.squareWidth/2)
          + this._chartMain.style.legendEntryMargin
          + this._chartMain.style.squareWidth
        )
        .text('> '+ range5.toFixed(2))
        
 // ------------------------------------------------------------------------
// Precipitation Legend
// ------------------------------------------------------------------------
        this._resizeChartHeight(this._chartMain.style.squareWidth);
        index = 0;
        for(let prec of Object.keys(this._chartsMain.precipcolors)){
  
        this._chart.append('rect')
          .classed(          'ac-legend-cell',true)
          .classed(this._chartName+this._chartCollectionId+'-ac', true)
          .attr('x',              this._chartPos.left + index * this._chartMain.style.squareWidth)
          .attr('y',              this._chartPos.bottom + this._chartMain.style.squareWidth)
          .attr('width',          this._chartMain.style.squareWidth)
          .attr('height',         this._chartMain.style.squareWidth)
          .style('fill',          this._chartsMain.precipcolors[prec])
          // .style('opacity',       this._chartMain.style.cellOpacity)
          .style('stroke',        this._chartsMain.colors.grid)
          .style('stroke-width',  this._chartMain.style.gridWidth + ' px');
  
          index++;
        }
  
        // title
        this._chart.append('text')
        .classed(          'ac-text',true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
          .attr('text-anchor', 'start')
          .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
          .attr('x', 0
            + this._chartPos.left
            + this._chartMain.style.squareWidth
            + this._chartsMain.padding
            + 5 * this._chartMain.style.squareWidth
          )
          .attr('y', 0
          + this._chartPos.bottom
          + (this._chartMain.style.squareWidth/2)
          + this._chartMain.style.legendEntryMargin
          + this._chartMain.style.squareWidth
        )
        .text(this._chartMain.legend.prec)
  
        // min value
        this._chart.append('text')
        .classed(          'ac-text',true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
          .attr('text-anchor', 'start')
          .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
          .attr('x', 0
            + this._chartPos.left
          )
          .attr('y', 0
            + this._chartPos.bottom
            + (this._chartMain.style.squareWidth/2)
            + this._chartMain.style.legendEntryMargin
            + 2* this._chartMain.style.squareWidth
          )
          .text('< '+ p_range1.toFixed(2))
  
          //max value
          this._chart.append('text')
          .classed(          'ac-text',true)
          .classed(this._chartName+this._chartCollectionId+'-ac', true)
          .attr('text-anchor', 'start')
          .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
          .attr('x', 0
            + this._chartPos.left
            + 5 * this._chartMain.style.squareWidth
          )
          .attr('y', 0
            + this._chartPos.bottom
            + (this._chartMain.style.squareWidth/2)
            + this._chartMain.style.legendEntryMargin
            + 2* this._chartMain.style.squareWidth
          )
          .text('> '+ p_range5.toFixed(2))

 // ------------------------------------------------------------------------
// No Data Legend
// ------------------------------------------------------------------------
          this._resizeChartHeight(this._chartMain.style.squareWidth);
          this._chart.append('rect')
          .classed('ac-legend-cell', true)
          .classed(this._chartName+this._chartCollectionId+'-ac', true)
          .attr('x',              this._chartPos.left)
          .attr('y',              this._chartPos.bottom +  2* this._chartMain.style.squareWidth)
          .attr('width',          this._chartMain.style.squareWidth)
          .attr('height',         this._chartMain.style.squareWidth)
          .style('fill',          this._chartsMain.colors.noData)
          // .style('opacity',       this._chartMain.style.cellOpacity)
          .style('stroke',        this._chartsMain.colors.grid)
          .style('stroke-width',  this._chartMain.style.gridWidth + ' px');

          this._chart.append('text')
          .classed(          'ac-text', true)
          .classed(this._chartName+this._chartCollectionId+'-ac', true)
          .attr('text-anchor', 'start')
          .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
          .attr('x',  0
          + this._chartPos.left
          + this._chartMain.style.squareWidth
          + this._chartsMain.padding
          )
          .attr('y', 0
            + this._chartPos.bottom
            + (this._chartMain.style.squareWidth/2)
            + this._chartMain.style.legendEntryMargin
            + 2 * this._chartMain.style.squareWidth
          )
          .text(this._chartMain.legend.noData)

          this._resizeChartHeight(2* this._chartMain.style.squareWidth);
    //}

  // }
    // ------------------------------------------------------------------------
    // Table heading (months) and 1st column (year)
    // ------------------------------------------------------------------------

    // Make row headings: year number
    yPos = 0
      + this._chartPos.top
      + width/2;

    for (let yearIdx = 0; yearIdx < numYears; yearIdx++)
    {
      let year = this._climateData.years[0]+yearIdx;
      // Place heading
      this._chart.append('text')
        .classed( 'ac-year', true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
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
      yPos += width
    }


    // Make column headings:
    // 1) year (12) 2) data type prec/temp (12*2=24)
    //   Jan     Feb     Mar    ...
    //  T   P   T   P   T   P   ...
    xPos = 0
      + this._chartPos.left
      + width;

    for (let monthIdx = 0; monthIdx < MONTHS_IN_YEAR.length; monthIdx++)
    {
      let month = MONTHS_IN_YEAR[monthIdx];

      // Place 1st heading: month
      this._chart.append('text')
        .classed( 'ac-year', true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
        .attr('text-anchor', 'middle')
        .attr('font-size', (this._chartsMain.fontSizes.normal + 'em'))
        .attr('x', xPos)
        .attr('y', 0
          + this._chartPos.top
          - this._chartMain.style.colHeadHeight*2
        )
        .text(month);

      // Place 2nd heading: T | P
      this._chart.append('text')
        .classed( 'ac-year', true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
        .attr('text-anchor', 'middle')
        .attr('font-size', (this._chartsMain.fontSizes.tiny + 'em'))
        .attr('x', 0
          + xPos
          - width/2
        )
        .attr('y', 0
          + this._chartPos.top
          - this._chartMain.style.colHeadHeight
        )
        .text(this._chartMain.headings.temp);

      this._chart.append('text')
        .classed( 'ac-year', true)
        .classed(this._chartName+this._chartCollectionId+'-ac', true)
        .attr('text-anchor', 'middle')
        .attr('font-size', (this._chartsMain.fontSizes.tiny  + 'em'))
        .attr('x', 0
          + xPos
          + width/2
        )
        .attr('y', 0
          + this._chartPos.top
          - this._chartMain.style.colHeadHeight
        )
        .text(this._chartMain.headings.prec);

      // Increment to next month
      xPos += (2*width)
    }

  }


  // ========================================================================
  // Helper function: Resize the height of the chart by x px
  // ========================================================================

  _resizeChartHeight(shiftUp)
  {
    // Resize whole container and footer
    super._resizeChartHeight(shiftUp);

    // Resize model:
    this._chartPos.bottom += shiftUp
    
  }

}
