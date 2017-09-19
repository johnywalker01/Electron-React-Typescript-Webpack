import * as _glob from 'glob'
import * as fs from 'fs'
import logs from '../src/util/logs'

function glob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    _glob(pattern, (err, matches) => err ? reject(err) : resolve(matches))
  })
}

import { locales } from '../src/i18n'

export interface Message {
  id: string
  defaultMessage: string
}

export interface Translation {
  id: string
  defaultMessage: string
  message: string
  todos?: string[]
}

glob('../src/**/messages.ts')
  .then((filenames) => {
    logs.I18N.info('Collecting messages')
    const unsortedAllCurrentMessages = {}
    for (let filename of filenames) {
      logs.I18N.info(`  Found message file ${filename}`)
      const messages = <{[id: string]: Message}> require(filename).default
      for (const shortKey of Object.keys(messages)) {
        const message = messages[shortKey]
        logs.I18N.debug(`    Found message ${message.id}`)
        unsortedAllCurrentMessages[message.id] = message
      }
    }

    const allCurrentMessages = Object.keys(unsortedAllCurrentMessages)
      .sort()
      .reduce((obj, translationId) => {
        obj[translationId] = unsortedAllCurrentMessages[translationId]
        return obj
      }, {} as {[id: string]: Message})

    logs.I18N.info('Reading existing translations')
    for (const locale of locales) {
      logs.I18N.info(`  Processing locale ${locale}`)
      const localeTranslationPath = `../src/translations/${locale}.json`
      const existingLocaleTranslationsArray = <Translation[]> require(localeTranslationPath)
      const existingLocaleTranslations = existingLocaleTranslationsArray
        .reduce((obj, translation) => {
          obj[translation.id] = translation
          return obj
        }, {} as {[id: string]: Translation})

      const mergedLocaleTranslationsArray = Object.keys(allCurrentMessages)
        .reduce((result, translationId) => {
          const currentMessage = allCurrentMessages[translationId]
          let existingLocaleTranslation = existingLocaleTranslations[translationId]

          let todos = []

          if (existingLocaleTranslation == null) {
            existingLocaleTranslation = {
              id: translationId,
              defaultMessage: currentMessage.defaultMessage,
              message: '',
            }
            todos.push('Translate, new message')
          }

          if (existingLocaleTranslation.todos != null) {
            todos = [...existingLocaleTranslation.todos, ...todos]
          }

          if (currentMessage.defaultMessage !== existingLocaleTranslation.defaultMessage) {
            todos.push(`Re-translate, defaultMessage changed from '${existingLocaleTranslation.defaultMessage}'`)
          }

          const mergedTranslation: Translation = {
            id: translationId,
            defaultMessage: currentMessage.defaultMessage,
            message: existingLocaleTranslation.message,
          }

          if (todos.length > 0) {
            mergedTranslation.todos = todos
          }

          result.push(mergedTranslation)

          return result
        }, [] as Translation[])

      logs.I18N.info(`  Writing translations to ${localeTranslationPath}`)
      fs.writeFileSync(localeTranslationPath,
        JSON.stringify(mergedLocaleTranslationsArray, null, 2) + '\n')
    }

    process.exit(0)
  })
  .catch((err) => {
    logs.I18N.error(err)
    process.exit(1)
  })
