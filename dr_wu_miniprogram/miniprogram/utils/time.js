let isToday = theDate => {
  let theDay = new Date(theDate).setHours(0, 0, 0, 0)
  let today = new Date().setHours(0, 0, 0, 0)

  return !(theDay - today)
}

let getHMS = function (theDate) {
  theDate = theDate ? theDate : new Date().getTime()
  let theDay = new Date(theDate)
  let zero = t => { return t < 10 ? '0' + t : t }
  let h = zero(theDay.getHours())
  let m = zero(theDay.getMinutes())
  let s = zero(theDay.getSeconds())
  return `${h}:${m}:${s}`
}

let getHM = function (theDate) {
  theDate = theDate ? theDate : new Date().getTime()
  let theDay = new Date(theDate)
  let zero = t => { return t < 10 ? '0' + t : t }
  let h = zero(theDay.getHours())
  let m = zero(theDay.getMinutes())
  return `${h}:${m}`
}

let getymd = function (theDate) {
  theDate = theDate ? theDate : new Date().getTime()
  let theDay = new Date(theDate)
  let y = theDay.getFullYear()
  let m = theDay.getMonth() + 1
  let d = theDay.getDate()
  return `${y}/${m}/${d}`
}

let getYMD = function (theDate) {
  theDate = theDate ? theDate : new Date().getTime()
  let theDay = new Date(theDate)
  let y = theDay.getFullYear()
  let m = theDay.getMonth() + 1
  let d = theDay.getDate()
  return `${y}-${m}-${d}`
}

let getMD = function (theDate) {
  theDate = theDate ? theDate : new Date().getTime()
  let theDay = new Date(theDate)
  let m = theDay.getMonth() + 1
  let d = theDay.getDate()
  return `${m}-${d}`
}

module.exports = {
  isToday, getHMS, getHM, getymd, getYMD, getMD
}