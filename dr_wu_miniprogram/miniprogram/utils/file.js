let getExt = filePath => {
  let index = filePath.lastIndexOf(".")
  return filePath.substr(index + 1)
}

module.exports = {
  getExt
}