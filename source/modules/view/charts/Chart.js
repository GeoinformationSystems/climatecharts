// ############################################################################
// Chart                                                                  View
// ############################################################################
// Base class for all visualization charts using the d3 visualization library.
// Manages the basic procedures that are the same for each of the charts, e.g:
// - Creating the div container
// - Creating title, subtitle and footer (data reference and source)
// - Providing functionality for exporting to SVG and PNG
// ############################################################################


class Chart
{

  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main, chartName, climateData, id, profile, dataIsViable)
  {
    this._main = main;

    this._chartExists = true;
    this._newCollectionStart = false;
    this._chartCollectionId = id;
    this._climateData = this._main.modules.helpers.deepCopy(climateData);
    this._geoProfile = profile;
    this._dataIsViable = dataIsViable;

    this._graphOptionsElements = [];

    // Get charts main -> generic information for all charts
    // get initial dimensions as a deep copy to change them later on
    this._chartsMain = this._main.config.charts;
   
    // Get chart main -> specific information for this chart
    this._chartName = chartName;
    this._chartMain = null;
    for (let chart of this._main.config.charts.charts)
      if (chart.name === chartName)     
        this._chartMain = chart;


    //check if complete new container has to be drawn
    this._chartZero = this._chartsMain.charts[0].name;
    if(this._chartZero == chartName){
      this._newCollectionStart = true;
    }
    
    // Global setup for all chart types
    this._initMembers(climateData);
    this._setChartMetadata();
    this._setupContainer();
    this._setupToolbar(); 
    if(this._dataIsViable) this._setupChart(); else this._setupChartlessContainer();
    this._setupHeaderFooter();

  }

  // ========================================================================
  // Update title of chart
  // ========================================================================

  updateTitle(title)
  {
    if (this._chartExists)
    {
      // Update model
      this._title = title;
      // Update view
      this._titleDiv.text(title)
    }
  }


  // ========================================================================
  // Remove chart
  // ========================================================================

  _remove()
  {
    if (this._chartExists)
    {
      // Clean model
      this._climateData = null;
      // Clean view
      let chartmenu = $('#chartcollection' + this._chartCollectionId + '-menu'); 
      chartmenu.remove();

      d3.selectAll('.chart-grid').each(
        function(){
          if(this.childElementCount < 1){
            this.remove();
          };
        }
      )

      this._toolbar.empty();
      this._main.modules.chartController.deleteMapItem(this._chartCollectionId);
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
    this._chartWidth =  this._chartsMain.positions.width;
    this._chartHeight = this._chartsMain.positions.height;

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
    };

    this._mainPos.width =   this._mainPos.right   - this._mainPos.left;
    this._mainPos.height =  this._mainPos.bottom  - this._mainPos.top;

    // Actual chart data
    this._climateData = climateData;
  }


  // ==========================================================================
  // Set Metadata
  // ==========================================================================

  _setChartMetadata()
  {
    // Set title
    this._title = this._climateData.name;

    // Assemble subtitle (location | elevation | climate class | years)
    this._subtitle = this._climateData.location.DD;
    if (this._climateData.elevation)
      this._subtitle += ' | Elevation: '
        + this._climateData.elevation;
    if (this._climateData.climate_class)
      this._subtitle += ' | Climate Class: '
        + this._climateData.climate_class;
    this._subtitle +=   ' | Years: '
      + this._climateData.years[0]
      + '-'
      + this._climateData.years[1];
      // TODO: gap years (appendix in this._climateData.years[2])

    // Get reference URL
    this._refURL = this._chartsMain.referenceURL
  }


  // ==========================================================================
  // Setup chart container
  // ==========================================================================

  _setupContainer()
  {
    let partialID = 'chartcollection' + this._chartCollectionId;
    let chartID = this._chartMain.name + this._chartCollectionId;
    var navbar_list;
    
    if(this._newCollectionStart){
      navbar_list = this._setupContainerMenu(partialID, chartID);      
    }else{
      // tabmenu buttons
      navbar_list = this._main.modules.domElementCreator.create(
        'li',                         // Element type
        chartID + '-li',              // ID
        ['chart-li', 'nav-item']      // Classes , 'w3-bar-item' ,'w3-button', 'tablink'
      );
      var navUl = document.getElementById(partialID + '-list');
      navUl.append(navbar_list);
      this._navbarli = $('#' + chartID + '-li');
    }

    let navbarbtn = this._main.modules.domElementCreator.create(
      'a',                            // Element type
      chartID + '-tab',               // ID
      ['chart-a', 'nav-link'],        // Classes , 'w3-bar-item' ,'w3-button', 'tablink'
    );
    navbar_list.append(navbarbtn);
    this._navbarbtn = $('#' + chartID + '-tab');

    // add link to navigation bar
    navbarbtn.setAttribute("href", "#" + chartID + '-wrapper');
    navbarbtn.setAttribute("data-toggle", "pill");
    navbarbtn.setAttribute("title", this._chartName.replace("-", " "));
    var disImgID= "distribution-chart" + this._chartCollectionId +"-img";
    var disListID= "distribution-chart" + this._chartCollectionId +"-li";

    switch(this._chartMain.name){
      case 'climate-chart':{
        navbarbtn.innerHTML = '<i class="fas fa-chart-area" aria-hidden="true" align="center"></i>';

        // switch image in distribution chart when switching charts
        $("#" + chartID + '-li').on("click", () =>{
          if(!$('#' + chartID + '-li').hasClass('active')){
            $('#'+disImgID).attr('src', 'data/img/noun_BoxPlot_normal.png');
            $('#'+disListID).removeClass('active');
          }
        });
        break;
      }
      case 'distribution-chart':{
        navbarbtn.innerHTML = '<img id="'+chartID+'-img"' + 'class="distbar" src="data/img/noun_BoxPlot_normal.png"></img>';
        // switch image
        $("#" + chartID + '-li>a').on("click", () =>{
          if(!$('#' + chartID + '-li').hasClass('active')){
            $('#'+disImgID).attr('src', 'data/img/noun_BoxPlot_highlight.png');
          }
        });

        break;
      }
      case 'availability-chart':{
        navbarbtn.innerHTML = '<i class="fab fa-buromobelexperte" aria-hidden="true" align="center"></i>';
        $("#" + chartID + '-li').on("click", () =>{
          if(!$('#' + chartID + '-li').hasClass('active')){
            $('#'+disImgID).attr('src', 'data/img/noun_BoxPlot_normal.png');
            $('#'+disListID).removeClass('active');
          }
        });
        break;
      }
      default:{
        navbarbtn.text = this._chartMain.name;
      }
    }

    // Chart Wrapper for all chart elements
    let chartWrapper = this._main.modules.domElementCreator.create(
        'div',                              // Element type
        chartID + '-wrapper',  // ID
        ['chart-wrapper', 'box', 'tab-pane', 'fade']            // Classes 'w3-container'
      );
    
      if(this._newCollectionStart){
        chartWrapper.classList.add("in");
        chartWrapper.classList.add("active");
      }
    var tabCon = document.getElementById(partialID + '-tabContent');
    tabCon.append(chartWrapper);
    this._chartWrapper = $('#' + chartID + '-wrapper');

      
    // Adjust "height" of wrapper
    if(this._chartName != 'map-chart'){
      this._chartWrapper.css('padding-bottom', 
        100*(this._chartHeight/this._chartWidth) + '%'
      );
    }

  }

  // ==========================================================================
  // Setup Container for first Chart in Collection
  // ==========================================================================

  _setupContainerMenu(partID, cID){
    // Get parent container (the one that contains all charts)
    let parentContainer = $('#' + this._chartsMain.parentContainer);

    let amountOfCharts = this._main.modules.chartController.getMapSize();
    var chartgrid;
    
    //Grid Layout
    var chartgridExists = $("div").hasClass("chart-grid");
    if(!chartgridExists){
      chartgrid = this._main.modules.domElementCreator.create(
        'div',                              // Element type
        partID + '-grid',  // ID
        ['chart-grid']            //'row' Classes 'container-fluid', 'w3-row'
      );
      parentContainer.append(chartgrid);
      this._chartgrid = $('#' + partID + '-grid');
    }else{
      chartgrid = $(".chart-grid");
    }

    // Tabbed Container for charts
    let chartmenu = this._main.modules.domElementCreator.create(
      'div',                              // Element type
      partID + '-menu',  // ID
      ['chart-menu']            // Classes w3-row  col-lg-6 'w3-col', 's6', 'w3-dark-grey' , 'w3-center'
    );
    chartgrid.append(chartmenu);
    this._chartmenu = $('#' + partID + '-menu'); 

    //divide into left and right column for padding
    // var lr_column = document.getElementById(partID + '-menu');
    // if(chartgrid.childElementCount == 1){
    //   // lr_column.classList.add("left-col");
    // }else{
    //   // lr_column.classList.add("right-col");
    // }


    // Navigational Tabs
    let navbar = this._main.modules.domElementCreator.create(
        'div',                              // Element type
        partID + '-bar',  // ID
        ['chart-bar' ]         // Classes 'w3-sidebar', 'w3-bar-block', 'w3-light-grey', 'w3-card'
    );
    chartmenu.append(navbar);
    this._navbar = $('#' + partID + '-bar');

    // nav bar pills
    let navbarlist = this._main.modules.domElementCreator.create(
      'ul',                              // Element type
      partID + '-list',  // ID
      ['chart-list', 'nav' ,'nav-pills', 'nav-stacked']          // Classes , 'w3-bar-item' ,'w3-button', 'tablink'
    );
    navbar.append(navbarlist);
    this._navbarlist = $('#' + partID + '-list');

    // tabmenu buttons
    let navbarli = this._main.modules.domElementCreator.create(
      'li',                              // Element type
      cID + '-li',  // ID
      ['chart-li', 'active', 'nav-item']      // Classes , 'w3-bar-item' ,'w3-button', 'tablink'
    );
    navbarlist.append(navbarli);
    this._navbarli = $('#' + partID + '-li');

    //tab-content
    let tabContent = this._main.modules.domElementCreator.create(
      'div',                              // Element type
      partID + '-tabContent',  // ID
      ['tab-content', 'contentcontainer']            // Classes 'w3-container'
    );
    chartmenu.append(tabContent);
    this._tabContent = $('#' + partID + '-tabContent');

    return navbarli;
    
  }
  // ==========================================================================
  // Setup an empty container when not enought data
  // ==========================================================================

  _setupChartlessContainer()
  {
    this._createSvgCanvas();

    let link = "availability-chart" + this._chartCollectionId;
    let textlink = this._chartsMain.charts[0].infoTextNotEnoughData + "<a id='"+ link+"-link' href='#AvailChart'>Availability Chart.</a>"

    d3.select(this._chartWrapper[0])
    .append('div')
    .attr('id', 'infobox-chartless-' + this._chartName + this._chartCollectionId ) 
    .html(textlink)

    $('#'+link+'-link').click(() =>
      {
        $('#'+link+"-tab").tab('show');
      }
    )
  }


  // ==========================================================================
  // Setup toolbar
  // -> Will be placed on top of chart, but will not be printed
  // ==========================================================================

  _setupToolbar()
  {
    // Container
    let toolbar = this._main.modules.domElementCreator.create(
      'div', this._chartMain.name+'-toolbar', ['toolbar']
    );
    this._chartWrapper[0].appendChild(toolbar);
    this._toolbar = $(toolbar);

    // close button
    let closeBtn = this._main.modules.domElementCreator.create(
      'button',
       'close' + this._chartName + this._chartCollectionId, 
       ['close-chart', 'toolbarbtn']
    );
    this._toolbar.append(closeBtn);
    closeBtn.innerHTML = '<i class="fas fa-times" style="color:#c3c3c3;" aria-hidden="true" align="center"></i>';

    $(closeBtn).click(() =>
      {
        this._remove();
      }
    );

    if(this._dataIsViable){

      let saveOptions = this._main.modules.domElementCreator.create(
        'div',
        'save-button-area' + this._chartName + this._chartCollectionId
      );
      this._toolbar.append(saveOptions);

      // Save options: PNG
      let pngButton = this._main.modules.domElementCreator.create(
        'button',
        'savepng' + this._chartName + this._chartCollectionId,
        [],
        [['title', 'Download as PNG']]
      );
      $(pngButton).html(this._chartsMain.saveOptions.png.buttonName);
      saveOptions.append(pngButton);

      $(pngButton).click(() =>
        {
          this._saveToPNG()
        }
      );

      // Save options: SVG
      let svgButton = this._main.modules.domElementCreator.create(
        'button', 
        'savesvg' + this._chartName + this._chartCollectionId,
        [],
        [['title', 'Download as SVG']]
      );
      $(svgButton).html(this._chartsMain.saveOptions.svg.buttonName);
      saveOptions.append(svgButton);

      $(svgButton).click(() =>
        {
          let rootDiv =       this._chart[0][0];
          let fileName =      this._chartName;  // TODO: more sophisticated
          this._saveToSVG()
        }
      )

      let graphOptions = this._main.modules.domElementCreator.create(
        'div', 
        'graph-options-' + this._chartName + this._chartCollectionId
      );
      this._toolbar[0].appendChild(graphOptions);

      // Set title if given in config
      let hoverHint = '';
      if(this._chartMain.switch.title != '') {
        graphOptions.innerHTML = '<p>' + this._chartMain.switch.title + ': </p>';
        hoverHint = this._chartMain.switch.title + ': ';
      }

      for(let i = 0 ; i < this._chartMain.switch.states.length; i++)
      {
        let optionPos = '';
        if( i===0 ) optionPos = 'first';
        else if (i === this._chartMain.switch.states.length-1) optionPos = 'last';
        else optionPos = 'middle';

        let graphOption = this._main.modules.domElementCreator.create(
          'a', 
          'graph-option-'+ optionPos + '-' + this._chartName + this._chartCollectionId,
          [], 
          [['title', hoverHint + this._chartMain.switch.states[i]]]
        );
        graphOption.innerHTML = this._chartMain.switch.statesDisplay[i];
        graphOptions.appendChild(graphOption);
        this._graphOptionsElements.push(graphOption);
      }

      graphOptions.querySelectorAll('a')[this._chartMain.switch.activeState].className ='graph-active';
      

      // ------------------------------------------------------------------------
      // Interaction: click on toggle switch to change the layout
      // ------------------------------------------------------------------------    
      
      $(this._graphOptionsElements).click((e) =>
        {
          // clean chart
          $('#' + this._chartName + this._chartCollectionId).remove();

          // set active state and reset other Options
          for (let i = 0; i < e.currentTarget.parentNode.querySelectorAll('a').length; i++)
          {
              if(e.currentTarget.parentNode.querySelectorAll('a')[i] === e.currentTarget){
                  this._chartMain.switch.activeState = i
              }
              else {
                  e.currentTarget.parentNode.querySelectorAll('a')[i].className=''
              }    
          }
          
          e.currentTarget.className ='graph-active';

          this._setupChart();
          this._setupHeaderFooter();
        }
      );
    }
    
  }


  // ==========================================================================
  // Setup chart
  // -> Use svg-canvas
  // ==========================================================================

  _setupChart()
  {
    this._createSvgCanvas();
  }

  // ==========================================================================
  // Create SVG Canvas: also used for chartless container
  // ==========================================================================

  _createSvgCanvas()
  {
   	this._chart = d3.select(this._chartWrapper[0])
      .append('svg')
      .attr('id', this._chartName + this._chartCollectionId)
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
      .attr('id', this._chartName + this._chartCollectionId + '-title')
      .attr('class', 'chart-header chart-title')
      .attr('x', this._chartWidth/2)
      .attr('y', 0
        + this._chartsMain.positions.titleTop
        + this._chartsMain.padding
      )
      .attr('text-anchor', 'middle')
      .style('font-size', this._chartsMain.fontSizes.title + 'em')
      .text(this._title);

    this._titleDiv = $('#' + this._chartName  + this._chartCollectionId + '-title');

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
      .text(this._subtitle);

    // Footer: Source link

      this._footerElems = [2];
      this._footerElems[0] = this._chart.append('text')
        .attr('class', 'footer source footer-'+this._chartName+this._chartCollectionId)
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
        .on('click', () =>
          {
            window.open(this._climateData.source.link)
          }
        );
      this._footerElems[0].append('tspan')
        .attr('x', 0
            + this._chartsMain.padding
          )
        .text('Data Source: ' + this._climateData.source.name);
      this._footerElems[0].append('tspan')
        .attr('x', 0
            + this._chartsMain.padding
          )
        .attr('dy', '1em')
        .text(this._climateData.source.link);

      // Footer: Reference URL
      this._footerElems[1] = this._chart.append('text')
        .attr('class', 'footer ref-url footer-'+this._chartName+this._chartCollectionId)
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
        .text('\u00A9 ' + this._refURL)
    
  }


  // ==========================================================================
  // Resize chart height by x px
  // ==========================================================================

  _resizeChartHeight(shiftUp)
  {
    // Reset model: Shift full height
    this._chartHeight += shiftUp;
    this._mainPos.bottom += shiftUp;
    this._mainPos.height += shiftUp;

    // Reset view: svg view box
    this._chart.attr('viewBox', ''
      + '0 0 '  + this._chartWidth
      + ' '     + this._chartHeight
    );

    // Reset view: change height of wrapper
    this._chartWrapper.css('padding-bottom',
     100*(this._chartHeight/this._chartWidth) + '%'
    );
  }


  // ==========================================================================
  // Save chart to PNG
  // ==========================================================================

  _saveToPNG()
  {
    let rootDiv =   this._chart[0][0];
    let fileName =  this._chartName;  // TODO: more sophisticated

    // Decrease font size
    this._main.modules.helpers.increaseFontSize(
      $('#' + rootDiv.id + ' text'),
      this._chartsMain.saveOptions.png.fontDecreaseFactor
    );

    // Save it
    saveSvgAsPng(
      rootDiv,
      fileName + this._chartsMain.saveOptions.png.fileExtension,
      {
        scale:          this._chartsMain.saveOptions.png.scaleFactor,
        encoderOptions: this._chartsMain.saveOptions.png.imageQuality,
      }
    );

    // Increase font size again
    this._main.modules.helpers.increaseFontSize(
      $('#' + rootDiv.id + ' text'),
      1/this._chartsMain.saveOptions.png.fontDecreaseFactor
    )
  }


  // ==========================================================================
  // Save chart to SVG
  // ==========================================================================

  _saveToSVG()
  {
    let rootDiv =   this._chart[0][0];
    let fileName =  this._chartName + this._chartsMain.saveOptions.svg.fileExtension; // TODO: more sophisticated

    rootDiv.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    //get svg source.
    let serializer = new XMLSerializer();
    let svgData = serializer.serializeToString(rootDiv);

    let preface = '<?xml version="1.0" standalone="no"?>\r\n';
    let svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(svgBlob, fileName)
    }
    else {
        // for Non-IE (chrome, firefox etc.)
        let svgUrl = URL.createObjectURL(svgBlob);
        let downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink)
    }

  }

  _resizeCanvas(){
    var w;
    let canvas = d3.selectAll('.mapboxgl-map').each(
      function(){
        // let id = document.getElementById('#map-chart'+this._chartCollectionId+'-wrapper');
        // let w = id.clientWidth();
        w =  parseInt(this.style.width, 10)*0.45;
        let height= w*0.6;
        this.style.width = w + 'px';
        this.style.height = height + 'px';
      }
      
    )
    let text = d3.selectAll('.maphf').each(
      function(){
        this.style.fontSize = 75 + '%';
      }
    )

    let mapGL = d3.selectAll('.mapboxgl-control-container').each(
      function(){
        let test =  parseInt(this.style.width, 10);
        let w = test * 0.45;
        let height= w*0.6;
        this.style.width = w + 'px';
        this.style.height = height + 'px';
      })

    setTimeout(()=>{
      window.dispatchEvent(new Event('resize'));
        }, 500);
  }

}
