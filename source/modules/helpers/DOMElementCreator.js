// ############################################################################
// DOMElementCreator
// ############################################################################
// Create DOM Element with type, id, class
// ############################################################################

class DOMElementCreator
{
  // ##########################################################################
  // PUBLIC MEMBERS
  // ##########################################################################

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor() {}

  // ==========================================================================
  // Create new element
  // ==========================================================================

  create(elemType=null, id=null, classes=[], attributes=[])
  {
    // error handling: element type must be given
    if (!elemType)
      return null

    // error handling: if only one class as string given, make it an array
    if (typeof classes == 'string')
      classes = [classes]

    let elem = document.createElement(elemType)

    if (id != null)
      elem.id = id

    for (let idx=0; idx<classes.length; idx++)
      elem.classList.add(classes[idx])

    for (let idx=0; idx<attributes.length; idx++)
      elem.setAttribute(attributes[idx][0], attributes[idx][1])

    return elem
  }
}
