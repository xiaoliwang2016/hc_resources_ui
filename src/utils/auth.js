import Cookies from 'js-cookie'

export function checkSymbol(key) {
  return Cookies.get(key) == '1'
}

export function setSymbol(key) {
  return Cookies.set(key, '1')
}

export function removeSymbol(key) {
  return Cookies.remove(key)
}
