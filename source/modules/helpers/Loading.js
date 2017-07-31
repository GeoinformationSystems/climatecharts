// ############################################################################
// Loading                                                              Helper
// ############################################################################
// This is a little helper class that puts the loading dialog on screen while
// data is fetched from the server
// ############################################################################

class Loading
{
  constructor()
  {
    this._loadCounter = 0   // How many things are currently loading?
  }

  // ==========================================================================
  // Start loading (put loading dialog on screen)
  // ==========================================================================

  start(text)
  {
    this._loadCounter++
    console.log("Start Loading", text);
  }

  // ==========================================================================
  // Finish loading (remove loading dialog from screen)
  // ==========================================================================

  end(text)
  {
    console.log("Finish Loading", text);
    this._loadCounter--

    // Only if nothing is loading anymore, remove the loader from the UI
    if (this._loadCounter == 0)
    {
      console.log("!!! DONE !!!");
    }
  }


  // ##########################################################################
  // PRIVATE MEMBERS
  // ##########################################################################

}
