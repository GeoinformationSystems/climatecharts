// ############################################################################
// Chart                                                                  View
// ############################################################################
// Is the base class for all visualization charts
// - Create the div container
// - Provide d3 as the visualization library
// - Provide title, subtitle, data reference
// - Provide functionality for exporting to SVG and PNG
// ############################################################################

class Chart
{
  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main, chartName, climateData)
  {
    this._main = main

    this._chartExists = true

    // Get charts main -> generic information for all charts
    // get initial dimensions as a deep copy to change them later on
    this._chartsMain = this._main.config.charts

    // Get chart main -> specific information for this chart
    this._chartName = chartName
    this._chartMain = null
    for (let chart of this._main.config.charts.charts)
      if (chart.name == chartName)
        this._chartMain = chart

    // Get helper: Save chart to PNG or SVG
    this._chartSaver = new ChartSaver()

    // Error handling: if no climateData, chart will not be set up
    if (!climateData) return this._chartExists = false

    // Global setup for all chart types
    this._initMembers(climateData)
    this._setChartMetadata()
    this._setupContainer()
    this._setupToolbar()
    this._setupChart()
    this._setupHeaderFooter()
  }


  // ========================================================================
  // Update title of chart
  // ========================================================================

  updateTitle(title)
  {
    if (this._chartExists)
    {
      // Update model
      this._title = title
      // Update view
      this._titleDiv.text(title)
    }
  }


  // ========================================================================
  // Remove chart
  // ========================================================================

  remove()
  {
    if (this._chartExists)
    {
      // Clean model
      this._climateData = null
      // Clean view
      this._chartWrapper.remove()
      this._toolbar.empty()
    }
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Set all member variables
  // ==========================================================================

  _initMembers(climateData)
  {
    // Copy width and height of the chart, to never override main
    this._chartWidth =  this._chartsMain.positions.width
    this._chartHeight = this._chartsMain.positions.height

    // Final dimensions of the main chart area
    this._mainPos = {
      left : 0,
      top : ( 0
        + this._chartsMain.positions.mainTop
      ),
      right : ( 0
        + this._chartWidth
      ),
      bottom : ( 0
        + this._chartHeight
        - this._chartsMain.positions.mainTop
      ),
    }

    this._mainPos.width =   this._mainPos.right   - this._mainPos.left
    this._mainPos.height =  this._mainPos.bottom  - this._mainPos.top

    // Actual chart data
    this._climateData = climateData

    // Helper
    this._domElementCreator = new DOMElementCreator()
  }

  // ==========================================================================
  // Set Metadata
  // ==========================================================================

  _setChartMetadata()
  {
    // Set title
    this._title = this._climateData.name

    // Assemble subtitle (location | elevation | climate class | years)
    this._subtitle = this._climateData.location.DD
    if (this._climateData.elevation)
      this._subtitle += ' | Elevation: '
        + this._climateData.elevation
    if (this._climateData.climate_class)
      this._subtitle += ' | Climate Class: '
        + this._climateData.climate_class
    this._subtitle +=   ' | Years: '
      + this._climateData.years[0]
      + '-'
      + this._climateData.years[1]
      // TODO: gap years (appendix in this._climateData.years[2])

    // Get reference URL
    this._refURL = this._chartsMain.referenceURL
  }


  // ==========================================================================
  // Setup chart container
  // ==========================================================================

  _setupContainer()
  {
    // Get parent container (the one that contains all charts)
    let parentContainer = $('#' + this._chartsMain.parentContainer)

    // Setup wrapper for all chart elements
    let chartWrapper = this._domElementCreator.create(
        'div',                              // Element type
        this._chartMain.name + '-wrapper',  // ID
        ['chart-wrapper', 'box']            // Classes
      )
    parentContainer.append(chartWrapper)
    this._chartWrapper = $('#' + this._chartMain.name + '-wrapper')

    // Adjust "height" of wrapper
    this._chartWrapper.css('padding-bottom',
      100*(this._chartHeight/this._chartWidth) + '%'
    )
  }


  // ==========================================================================
  // Setup toolbar
  // -> Will be placed on top of chart, but will not be printed
  // ==========================================================================

  _setupToolbar()
  {
    // Container
    let toolbar = this._domElementCreator.create(
      'div', this._chartMain.name+'-toolbar', ['toolbar']
    )
    this._chartWrapper[0].appendChild(toolbar)
    this._toolbar = $(toolbar)

    // Save options: PNG
    let pngButton = this._domElementCreator.create(
      'button', '', ['save-to-png', 'btn', 'btn-primary']
    )
    $(pngButton).html(this._chartsMain.saveOptions.png.buttonName)
    this._toolbar.append(pngButton)

    $(pngButton).click(() =>
      {
        let rootDiv =       this._chart[0][0]
        let fileName =      this._chartName+".png"  // TODO: more sophisticated
        let scaleFactor =   this._chartsMain.saveOptions.png.scaleFactor
        let imageQuality =  this._chartsMain.saveOptions.png.imageQuality
        this._chartSaver.toPNG(rootDiv, fileName, scaleFactor, imageQuality)
      }
    )

    // Save options: SVG
    let svgButton = this._domElementCreator.create(
      'button', '', ['save-to-svg', 'btn', 'btn-primary']
    )
    $(svgButton).html(this._chartsMain.saveOptions.svg.buttonName)
    // this._toolbar.append(svgButton)

    $(svgButton).click(() =>
      {
        let rootDiv =       this._chart[0][0]
        let fileName =      this._chartName+".svg"  // TODO: more sophisticated
        this._chartSaver.toSVG(rootDiv, fileName)
      }
    )
  }


  // ==========================================================================
  // Setup chart
  // -> Use svg-canvas
  // ==========================================================================

  _setupChart()
  {
    this._chart = d3.select(this._chartWrapper[0])
      .append('svg')
      .attr('id', this._chartMain.name)
      .attr('version', 1.1)
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('width', '100%')
      .attr('viewBox', ''
        + '0 0 '  + this._chartWidth
        + ' '     + this._chartHeight
      )
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .classed('svg-content-responsive', true)
      .style('font-size',       this._chartsMain.fontSizes.normal + 'em')
      .style('font-family',     'Arial, sans-serif')
      .style('font-style',      'normal')
      .style('font-variant',    'normal')
      .style('font-weight',     'normal')
      .style('shape-rendering', 'default')
      .style('text-rendering',  'optimizeLegibility')
      .style('background-color','transparent')
  }


  // ==========================================================================
  // Write chart-independent meta information into chart header / footer
  // ==========================================================================

  _setupHeaderFooter()
  {
    // Title
    this._chart.append('text')
      .attr('id', this._chartName + '-title')
      .attr('class', 'chart-header chart-title')
      .attr('x', this._chartWidth/2)
      .attr('y', 0
        + this._chartsMain.positions.titleTop
        + this._chartsMain.padding
      )
      .attr('text-anchor', 'middle')
      .style('font-size', this._chartsMain.fontSizes.title + 'em')
      .text(this._title)

    this._titleDiv = $('#' + this._chartName + '-title')

    // Subtitle
    this._chart.append('text')
      .attr('class', 'chart-header chart-subtitle')
      .attr('x', this._chartWidth/2)
      .attr('y', 0
        + this._chartsMain.positions.subtitleTop
        + this._chartsMain.padding
      )
      .attr('text-anchor', 'middle')
      .style('font-size', this._chartsMain.fontSizes.large + 'em')
      .text(this._subtitle)

    // Footer: Source link
    this._footerElems = [2]
    this._footerElems[0] = this._chart.append('text')
      .attr('class', 'footer source')
      .attr('x', 0
        + this._chartsMain.padding
      )
      .attr('y', 0
        + this._chartPos.bottom
        + this._chartsMain.positions.footerTop
        + this._chartsMain.padding
      )
      .style('cursor', 'pointer')
      .style('font-size', this._chartsMain.fontSizes.small + 'em')
      .style('opacity', this._chartsMain.footerOpacity)
      .text('Data Source: ' + this._climateData.source)
      .on('click', () =>
        {
          window.open(this._climateData.source_link)
        }
      )

    // Footer: Reference URL
    this._footerElems[1] = this._chart.append('text')
      .attr('class', 'footer ref-url')
      .attr('x', 0
        + this._chartWidth
        - this._chartsMain.padding
      )
      .attr('y', 0
        + this._chartPos.bottom
        + this._chartsMain.positions.footerTop
        + this._chartsMain.padding
      )
      .style('text-anchor', 'end')
      .style('font-size', this._chartsMain.fontSizes.small + 'em')
      .style('opacity', this._chartsMain.footerOpacity)
      .text(this._refURL)
  }


  // ==========================================================================
  // Resize chart height by x px
  // ==========================================================================

  _resizeChartHeight(shiftUp)
  {
    // Reset model: Shift full height
    this._chartHeight += shiftUp
    this._mainPos.bottom += shiftUp
    this._mainPos.height += shiftUp

    // Reset view: svg view box
    this._chart.attr('viewBox', ''
      + '0 0 '  + this._chartWidth
      + ' '     + this._chartHeight
    )

    // Reset view: change height of wrapper
    this._chartWrapper.css('padding-bottom',
      100*(this._chartHeight/this._chartWidth) + '%'
    )
  }
}
