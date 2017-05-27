// ############################################################################
// ClimateDatasetController                                          Controller
// ############################################################################
// Handles the datasets from thre thredds data server
// - Load datasets
// - Manage active dataset
// ############################################################################

class ClimateDatasetController
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(main)
  {
    this._main = main
    this._x2js = new X2JS()


    // ------------------------------------------------------------------------
    // Member Variables
    // ------------------------------------------------------------------------

    this._datasets = []             // all datasets
    this._selectedDataset = null    // currently active dataset

    // Initially load datasets and metadata
    this._loadDatasets()
  }


  // ==========================================================================
  // (De)Select Dataset
  // ==========================================================================

  select(dataset)
  {
    // Cleanup currently selected dataset
    this.deselect()

    // Model
    dataset.is_selected = true

    // View
    // Selection in ClimateDatasetsInList automatically

    // Controller
    this._selectedDataset = dataset
    this._main.modules.timeController.setMinMaxYear(
      dataset.timePeriod[0], dataset.timePeriod[1]
    )
  }

  selectByName(name)
  {
    // Find name in list of datasets
    for (let dataset of this._datasets)
      if (dataset.name == name)
        this.select(dataset)
  }

  deselect()
  {
    if (this._selectedDataset)
    {
      // Model
      this._selectedDataset.is_selected = false

      // View
      // Selection in ClimateDatasetsInList automatically

      // Controller
      this._selectedDataset = null
    }
  }


  // ==========================================================================
  // Load climate data for one raster cell
  // ==========================================================================

  loadClimateData(coords)
  {
    let variables = []
    for (var idx=0; idx<2; idx++)
      for (var name in this._selectedDataset.metaDatasets[idx].variable)
        if (this._selectedDataset.metaDatasets[idx].variable[name]._shape == "time lat lon")
          variables.push(this._selectedDataset.metaDatasets[idx].variable[name]._name)

    this._main.modules.serverInterface.requestClimateDataForCell(
      this._selectedDataset.urlDatasets,
      variables,          // ["tmp", "pre"]
      coords,             // [lat, lng]
      [                   // [minDate, maxDate]
        this._main.modules.timeController.getPeriodStart(),
        this._main.modules.timeController.getPeriodEnd(),
      ],
      (tempDataXml, precDataXml, names, elevation) =>    // success callback
      {
        // Load climate data from server in XML and transform to JSON
        let tempDataOrig = this._x2js.xml2json(tempDataXml[0]).grid
        let precDataOrig = this._x2js.xml2json(precDataXml[0]).grid

        // Transform data structure to climateData
        let tempData = this._gridDataToClimateData(tempDataOrig)
        let precData = this._gridDataToClimateData(precDataOrig)

        // Assemble name array
        let name = [
          names[0].name,
          names[0].adminName1,
          names[0].countryName,
        ]

        // Update climate data
        this._main.modules.climateDataController.update(
          tempData, precData,                   // Actual climate data
          name, coords, elevation[0].srtm3     // Meta data
        )
      }
    )
  }


  // ==========================================================================
  // Return currently selected dataset
  // ==========================================================================

  getSelectedDataset()
  {
    return this._selectedDataset
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################


  // ==========================================================================
  // Load all datasets from server
  // ==========================================================================

  _loadDatasets()
  {
    this._main.modules.serverInterface.requestAllDatasets(
      (xmlData) =>
        {
          // Parse data
          let catalog = this._x2js.xml2json(xmlData).catalog

          // For each dataset
          for (var dsIdx in catalog.dataset)
          {
            // Create new climate dataset
            let dataset = new ClimateDataset()
            dataset.id =          catalog.dataset[dsIdx]._ID
            dataset.name =        catalog.dataset[dsIdx]._name
            dataset.description = catalog.dataset[dsIdx].documentation[0].__text
            dataset.doi =         catalog.dataset[dsIdx].documentation[1].__text
            dataset.urlDatasets =
            [
              catalog.dataset[dsIdx].dataset[0]._urlPath,
              catalog.dataset[dsIdx].dataset[1]._urlPath
            ]
            dataset.timePeriod =
            [
              parseInt(catalog.dataset[dsIdx].timeCoverage.start),
              parseInt(catalog.dataset[dsIdx].timeCoverage.end)
            ]

            // Save dataset
            this._datasets.push(dataset)

            // Get metadata
            this._loadMetadata(dataset)
          }
        }
    )
  }

  _loadMetadata(dataset)
  {
    this._main.modules.serverInterface.requestMetadataForDataset(
      dataset.urlDatasets,
      (tempDataXml, precDataXml) =>
      {
        dataset.metaDatasets =
        [
          this._x2js.xml2json(tempDataXml[0]).netcdf,
          this._x2js.xml2json(precDataXml[0]).netcdf
        ]
        dataset.rasterSize =
        [
          parseFloat(dataset.metaDatasets[0].group[0].attribute[6]._value),
          parseFloat(dataset.metaDatasets[0].group[0].attribute[7]._value)
        ]

        // Set the cell dimensions
        this._main.modules.climateCellController.setCellSize(dataset.rasterSize)

        // Add to view
        this._main.modules.climateDatasetsInList.add(dataset)

        // Initially select the first dataset in the list
        if (!this._selectedDataset)
          this.select(this._datasets[0])
      }
    )
  }


  // ==========================================================================
  // Transform grid data to climate data
  // ==========================================================================

  _gridDataToClimateData(inData)
  {
    // Create basic structure
    /*
      [                 // month
        [               // year
          val_year1,    // temp/prec value
          val_year2,
          ...
          val_yearn
        ]
      ]
    */
    let outData = []
    for (let monthIdx=0; monthIdx<MONTHS_IN_YEAR.length; monthIdx++)
      outData.push([])

    // Read incoming data object and transform it into outgoing structure
    let minYear = this._main.modules.timeController.getPeriodStart()
    for (let dataIdx=0; dataIdx<inData.point.length; dataIdx++)
    {
      let date = new Date(inData.point[dataIdx].data[0].__text)
      let monthIdx = date.getMonth()
      let yearIdx = date.getFullYear()-minYear
      let unit = inData.point[dataIdx].data[3]._units
      let value = this._main.modules.helpers.roundToDecimalPlace(
        parseFloat(inData.point[dataIdx].data[3].__text),
        this._main.config.climateData.decimalPlaces
      )

      // If temperature values are in Kelvin units => convert to Celsius.
      if (unit == "degK")
        value -= KELVIN_TO_CELSIUS

      // If precipitation values are in cm => convert to mm
      if (unit == "cm")
        value *= CM_TO_MM

      // Put in outgoing array
      outData[monthIdx][yearIdx] = value
    }
    return outData
  }
}
