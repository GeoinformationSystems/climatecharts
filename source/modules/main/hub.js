// ############################################################################
// CENTRAL INTERACTION HUB BEWTEEN MODULES
// ############################################################################
// Defines the
// ############################################################################

let loadHub = (main) =>
{
  main.hub = {};

  // ==========================================================================
  // Mode Changes ('C': ClimateCell, 'S': WeatherStation)
  // ==========================================================================

  main.hub.onModeChange = (newMode) =>
    {
      let oldMode = main.mode;

      // No mode change: no action
      if (newMode == oldMode) return;

      // Error handling: Can only be 'C' or 'S' -> Fallback: 'C'
      if (!(newMode=="C" || newMode=="S")) newMode = 'C';

      // Old mode ClimateCell: cleanup location marker and climate cell
      if (oldMode == 'C')
      {
        main.modules.locationMarkerOnMap.remove();
        main.modules.climateCellOnMap.remove();
        main.modules.coordinatesInInfobox.disable();
        main.modules.climateDatasetsInList.disable()
      }

      // Old mode WeatherStation: cleanup weatherstation
      if (oldMode == 'S')
      {
        main.modules.weatherStationController.deselect();
        main.modules.climateDatasetsInList.removeStationsTitle()
      }

      // New mode ClimateCell: restore climate datasets and coordinates
      if (newMode == 'C')
      {
        main.modules.climateDatasetsInList.enable();
        main.modules.coordinatesInInfobox.enable();
        main.modules.climateDatasetController.reselect()
      }

      // New mode WeatherStation: set datasets title and disable coordinates
      if (newMode == 'S')
      {
        main.modules.climateDatasetsInList.setStationsTitle()
      }

      // Set new mode
      main.mode = newMode
    };


  // ==========================================================================
  // Location changes
  // ==========================================================================

  // Coords format: coords = {lat: Float, lng: Float}
  main.hub.onLocationChange = (coords) =>
    {
      // In ClimateCell mode
      if (main.mode == "C")
      {
        //set Piwiks CustomDimension: Searched Locations to track Locations in cell mode
	_paq.push(['setCustomDimension', 1, coords.lat + ',' + coords.lng + ',1,' + main.modules.timeController.getPeriodStart() + ',' + main.modules.timeController.getPeriodEnd()]);
	_paq.push(['trackPageView']);
        
        main.modules.locationMarkerOnMap.set(coords);
        main.modules.climateCellOnMap.set(coords);
        main.modules.climateDatasetController.update();
        main.modules.map.updatePopup();
      }

      // In WeatherStation mode
      else if (main.mode == "S")
      {
        //set Piwiks CustomDimension: Searched Locations to track Locations in station mode
	_paq.push(['setCustomDimension', 1, coords.lat + ',' + coords.lng + ',2,' + main.modules.timeController.getPeriodStart() + ',' + main.modules.timeController.getPeriodEnd()]);
	_paq.push(['trackPageView'])
        
        // Handled directly in WeatherStation controller?
      }

      // Update coordinates in infobox
      main.modules.coordinatesInInfobox.update(coords)

      //open Popup
      // main.modules.map.updatePopup(start, end);
    };


  // ==========================================================================
  // Time changes
  // ==========================================================================

  main.hub.onMinMaxYearChange = (min, max) =>
    {
      // Update timeline
      let start = main.modules.timeController.getPeriodStart();
      let end = main.modules.timeController.getPeriodEnd();
      main.modules.timeline.update(min, max, start, end)
    };

  main.hub.onPeriodChange = (start, end) =>
    {
      // Update climate data for ClimateCell
      if (main.mode == 'C')
        main.modules.climateDatasetController.update();

      // Update climate data for WeatherStation
      if (main.mode == 'S')
        main.modules.weatherStationController.updateDataForStation();

      main.modules.weatherStationController.updateStations();

      // Update period data in timeline
      main.modules.timeline.updatePeriod(start, end);

      // Update Popup on map
      main.modules.map.updatePopupTime(start, end);
    };

  main.hub.onResetPeriod = (start, end) =>
    {
      // Update climate data for ClimateCell
      if (main.mode == 'C')
        main.modules.climateDatasetController.update();

      // Update climate data for WeatherStation
      if (main.mode == 'S')
        main.modules.weatherStationController.updateDataForStation();

      main.modules.weatherStationController.updateStations();

      // Update timeline completely
      let min = main.modules.timeController.getMinYear();
      let max = main.modules.timeController.getMaxYear();
      main.modules.timeline.update(min, max, start, end)
    };


  // ==========================================================================
  // Dataset changes
  // ==========================================================================

  main.hub.onDatasetChange = (dataset) =>
    {
      // Update time bounds (min/max year)
      main.modules.timeController.setMinMaxYear(
        dataset.time_period[0], dataset.time_period[1]
      );

      // Update metadata in infobox
      main.modules.datasetInfobox.updateDatasetInfo(dataset);

      // Update climate data for ClimateCell
      main.modules.climateDatasetController.update()
    };


  // ==========================================================================
  // Weatherstation changes
  // ==========================================================================

  main.hub.onStationChange = (station) =>
    {
      // Tell the map that a station has been selected
      main.modules.mapController.clickedOnStation();

      // Update time bounds (min/max year)
      main.modules.timeController.setMinMaxYear(
        station.min_year, station.max_year
      );

      // Update metadata in infobox
      main.modules.datasetInfobox.updateStationInfo(station);

      // Update climate data for WeatherStation
      main.modules.weatherStationController.updateDataForStation()
    };


  // ==========================================================================
  // Diagram title changes
  // ==========================================================================

  main.hub.onDiagramTitleChange = (title) =>
    {
      // Update all diagrams
    //  main.modules.chartController.updateTitle(title);

      // Update user defined title
      // main.modules.chartTitleSetter.update(title)
    }

};
