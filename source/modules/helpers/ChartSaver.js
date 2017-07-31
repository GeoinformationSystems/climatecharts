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

  toPNG(rootDiv, fileName, saveOptions)
  {
    // Decrease font size
    this._increaseFontSize(
      rootDiv.id,
      saveOptions.fontDecreaseFactor
    )

    // Save it
    saveSvgAsPng(
      rootDiv,
      fileName + saveOptions.fileExtension,
      {
        scale:          saveOptions.scaleFactor,
        encoderOptions: saveOptions.imageQuality,
      }
    )

    // Increase font size again
    this._increaseFontSize(
      rootDiv.id,
      1/saveOptions.fontDecreaseFactor
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

  _increaseFontSize(id, factor)
  {
    let textNodes = $('#' + id + ' text')
    for (let textNodeIdx = 0; textNodeIdx < textNodes.length; textNodeIdx++)
    {
      let textNode = $(textNodes[textNodeIdx])
      let oldFontSize = parseFloat(textNode.css('font-size'))
      let newFontSize = (oldFontSize * factor)
      textNode.css('font-size', newFontSize)
    }
  }
}
