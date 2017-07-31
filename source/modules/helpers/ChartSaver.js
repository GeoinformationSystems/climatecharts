// ############################################################################
// ChartSaver                                                           Helper
// ############################################################################
// This is a little helper class that deals with all the ugliness of saving
// an SVG chart into PNG and SVG
// ############################################################################

class ChartSaver
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  constructor() {}

  // ==========================================================================
  // Save to PNG
  // ==========================================================================

  toPNG(rootDiv, fileName, scaleFactor, imageQuality)
  {
    saveSvgAsPng(rootDiv, fileName,
      {
        scale:          scaleFactor,
        encoderOptions: imageQuality,
      }
    )
  }

  // ==========================================================================
  // Save to SVG
  // ==========================================================================

  toSVG(rootDiv, fileName)
  {
    // TODO: get to work
/*
    var rootDiv = $('#'+'climate-chart');
		var body = $('body');

		rootDiv.panzoom("reset");

    try
    {
      var isFileSaverSupported = !!new Blob();
    }
    catch (e)
    {
      alert("This function is not supported by your browser!");
    }

    // create new temporary div where the to print is copied in
    // -> use like a workbench
    body.append("<div id=\"temp\">");
    var workbench = $('#temp');
    workbench.append(rootDiv.clone());

    var html = workbench.html();

    var blob = new Blob([html], {type: "image/svg+xml"});
    saveAs(blob, fileName);

    workbench.remove();
*/
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################



}
