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
    // this._loadDataForDataset(dataset)

    // View
    // Selection in ClimateDatasetsInList automatically

    // Controller
    this._selectedDataset = dataset

    console.log(dataset);
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

  loadClimateData(cellBounds)
  {
    let variables = []
    for (var idx=0; idx<2; idx++)
      for (var name in this._selectedDataset.metaDatasets[idx].variable)
        if (this._selectedDataset.tempDataset.variable[name]._shape == "time lat lon")
          variable.push(this._selectedDataset.tempDataset.variable[name]._name)

    this._main.modules.serverInterface.requestDataForDataset(
      this._selectedDataset.urlDatasets,
      variables,          // ["tmp", "pre"]
      cellBounds,         // [lat, lng]
      [                   // [minDate, maxDate]
        this._main.modules.timeController.getMinDate(),
        this._main.modules.timeController.getMaxDate(),
      ],
      (tempData, precData) =>    // success callback
      {
        console.log("Heureka!");
        console.log(tempData);
        console.log(precData);
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
          let x2js = new X2JS()
          let catalog = x2js.xml2json(xmlData).catalog

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
        let x2js = new X2JS()
        dataset.metaDatasets =
        [
          x2js.xml2json(tempDataXml[0]).netcdf,
          x2js.xml2json(precDataXml[0]).netcdf
        ]

        dataset.rasterSize =
        [
          parseFloat(dataset.metaDatasets[0].group[0].attribute[6]._value),
          parseFloat(dataset.metaDatasets[0].group[0].attribute[7]._value)
        ]
      }
    )

    // Initially select the first dataset in the list
    if (!this._selectedDataset)
      this.select(this._datasets[0])
  }
}
