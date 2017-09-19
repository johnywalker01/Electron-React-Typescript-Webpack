import { MSECONDS_PER_DAY } from './constants'

export function setCookie(name, value, expireDays) {
  let expireDate = new Date()
  expireDate.setTime(expireDate.getTime() + (expireDays * MSECONDS_PER_DAY))
  let expires = `expires=${expireDate.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/`
}

export function getCookie(name) {
  let cookieNameAndEqual = `${name}=`
  let cookies = document.cookie.split(';')
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1)
    }
    if (cookie.indexOf(cookieNameAndEqual) === 0) {
      return cookie.substring(cookieNameAndEqual.length, cookie.length)
    }
  }
  return ''
}

export function deleteCookie(cookieName: string) {
  setCookie(cookieName, '', -1)
}
