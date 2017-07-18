// ############################################################################
// DOMElementCreator
// ############################################################################
// Create DOM Element with type, id, class and attributes
// ############################################################################

class DOMElementCreator
{
  constructor() {}

  create(elemType=null, id=null, classes=[], attributes=[])
  {
    // Error handling: element type must be given
    if (!elemType)
      return null

    // Error handling: if only one class as string given, make it an array
    if (typeof classes == 'string')
      classes = [classes]

    // Error handling: if classes are null, make empty array
    if (!classes)
      classes = []

    // Error handling: if attributes are null, make empty array
    if (!attributes)
      attributes = []

    // Create element
    let elem = document.createElement(elemType)

    // Set id
    if (id != null)
      elem.id = id

    // Set classes
    for (let idx=0; idx<classes.length; idx++)
      elem.classList.add(classes[idx])

    // Set attributes
    for (let idx=0; idx<attributes.length; idx++)
      elem.setAttribute(attributes[idx][0], attributes[idx][1])

    return elem
  }

}
