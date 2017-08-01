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

    this._ctr = 0
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
    this._main.hub.onDatasetChange(dataset);
  }

  reselect()
  {
    this.select(this._selectedDataset)
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

  update()
  {
    // Error handling: ignore if dataset not fully loaded yet
    if (!this._selectedDataset) return
    if (this._selectedDataset.meta_datasets.length == 0) return

    // Get request variable from dataset (e.b. 'tmp')
    let variables = []
    for (var idx=0; idx<2; idx++)
      for (var name in this._selectedDataset.meta_datasets[idx].variable)
        if (this._selectedDataset.meta_datasets[idx].variable[name]._shape == "time lat lon")
          variables.push(this._selectedDataset.meta_datasets[idx].variable[name]._name)

    let coords = this._main.modules.mapController.getCoordinates()
    let timePeriod =
    [
      this._main.modules.timeController.getPeriodStart(),
      this._main.modules.timeController.getPeriodEnd()+1,
    ]

    // Error handling: Only update if variables, coords and timePeriod given
    if (variables.length == 0)
      return console.error(""
        + "The datset"
        + this._selectedDataset.name
        + "could not be loaded correctly"
      )
    if (
      (!this._main.modules.helpers.checkIfNumber(coords.lat)) ||
      (!this._main.modules.helpers.checkIfNumber(coords.lng)) ||
      (!this._main.modules.helpers.checkIfNumber(timePeriod[0])) ||
      (!this._main.modules.helpers.checkIfNumber(timePeriod[1]))
    )
      return // No coordinates or time period given

    this._main.modules.loading.start("climate data for raster cell")

    // Load data for this dataset at this position in this time period
    this._main.modules.serverInterface.requestClimateDataForCell(
      this._selectedDataset.url_datasets,
      variables,      // [tmp, pre]
      coords,         // [lat, lng]
      timePeriod,     // [minDate, maxDate]
      (tempDataXml, precDataXml, names, elevation) =>    // success callback
        {
          // Load climate data from server in XML and transform to JSON
          let tempDataOrig = this._x2js.xml2json(tempDataXml[0]).grid
          let precDataOrig = this._x2js.xml2json(precDataXml[0]).grid

          // Transform data structure to climateData
          let tempData = this._gridDataToClimateData(tempDataOrig)
          let precData = this._gridDataToClimateData(precDataOrig)

          // Detect empty dataset: Is it an empty dataset?
          for (let nullValue of CLIMATE_DATASET_NULL_VALUES)
          {
            if (tempData[0][0] == nullValue)
            {
              this._main.modules.loading.end()
              return this._main.modules.climateDataController.clear()
            }
          }

          // Assemble name array
          let name = [
            names[0].name,
            names[0].adminName1,
            names[0].countryName,
          ]

          // Get elevation
          let elev = elevation[0].srtm3

          // Get source DOI
          let source = this._selectedDataset.doi

          // Update climate data
          this._main.modules.climateDataController.update(
            tempData, precData,           // Actual climate data
            name, coords, elev, source    // Meta data
          )

          this._main.modules.loading.end()
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
    this._main.modules.loading.start("datasets")

    this._main.modules.serverInterface.requestAllDatasets( (xmlData) =>
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
          dataset.url_datasets =
          [
            catalog.dataset[dsIdx].dataset[0]._urlPath,
            catalog.dataset[dsIdx].dataset[1]._urlPath
          ]
          dataset.time_period =
          [
            parseInt(catalog.dataset[dsIdx].timeCoverage.start),
            parseInt(catalog.dataset[dsIdx].timeCoverage.end)
          ]

          // Save dataset
          this._datasets.push(dataset)

          // Get metadata
          this._loadMetadata(dataset)
        }

        this._main.modules.loading.end()
      }
    )
  }

  _loadMetadata(dataset)
  {
    this._main.modules.loading.start("dataset")

    this._main.modules.serverInterface.requestMetadataForDataset(
      dataset.url_datasets,
      (tempDataXml, precDataXml) =>
      {
        dataset.meta_datasets =
        [
          this._x2js.xml2json(tempDataXml[0]).netcdf,
          this._x2js.xml2json(precDataXml[0]).netcdf
        ]
        dataset.raster_cell_size =
        {
          lat: parseFloat(dataset.meta_datasets[0].group[0].attribute[6]._value),
          lng: parseFloat(dataset.meta_datasets[0].group[0].attribute[7]._value)
        }

        // Add to view
        this._main.modules.climateDatasetsInList.add(dataset)

        // Initially select the first dataset in the list
        if (!this._selectedDataset)
          this.select(this._datasets[0])

        this._main.modules.loading.end()
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
