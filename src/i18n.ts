import * as reactIntl from 'react-intl'

export const locales = [
  'ar',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pl',
  'pt',
  'ru',
  'tr',
  'zh',
]

interface Message {
  id: string
  defaultMessage: string
  message: string
}

const i18n = {}

/* tslint:disable:no-var-requires */
for (const locale of locales) {
  const localeData = require(`react-intl/locale-data/${locale}`)
  reactIntl.addLocaleData(localeData)

  const localeMessages = {}
  const rawLocaleMessageList = require(`./translations/${locale}.json`)
  for (const message of rawLocaleMessageList) {
    localeMessages[message.id] = message.message || message.defaultMessage
  }

  // console.log(locale)
  // console.log(localeMessages)
  i18n[locale] = localeMessages
}
/* tslint:enable:no-var-requires */

export default i18n
