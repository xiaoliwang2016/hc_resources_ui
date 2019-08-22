import Cookies from 'js-cookie'

const TokenKey = 'login_symbol'

export function checkSymbol() {
  return Cookies.get(TokenKey) == '1'
}

export function setSymbol() {
  return Cookies.set(TokenKey, '1')
}

export function removeSymbol() {
  return Cookies.remove(TokenKey)
}
