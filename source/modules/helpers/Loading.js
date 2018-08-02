// ############################################################################
// Loading                                                              Helper
// ############################################################################
// Handles the loading dialog on screen while data is fetched from the server.
// ############################################################################


class Loading
{
  
  // ==========================================================================
  // Initialize loader that will be switched between shown/hidden
  // ==========================================================================

  constructor()
  {
    this._loadCounter = 0;   // How many things are currently loading?

    // Setup loader div
    this._loaderDiv = $('#loader')
  }


  // ==========================================================================
  // Start loading (put loading dialog on screen)
  // ==========================================================================

  start(text)
  {
    this._loadCounter++;

    // Put loader on the screen
    this._loaderDiv.show();
    this._loaderDiv.waitMe(
      {
        effect: 'progressBar',
        text:   'Load ' + text,
        color:  'black',
      }
    )
  }


  // ==========================================================================
  // Finish loading (remove loading dialog from screen)
  // ==========================================================================

  end(text)
  {
    this._loadCounter--;

    // Only if nothing is loading anymore, remove the loader from the UI
    if (this._loadCounter == 0)
    {
      this._loaderDiv.hide();
      this._loaderDiv.empty()
    }
  }

}
