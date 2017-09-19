import { sprintf } from 'sprintf-js'

import palette, {GreyColor, RainbowColor} from 'src/util/palette'
import {Event} from 'src/serenity/resources'

export function makeEventIconStyle(event: Event) {
  const situationCategory = event.situation_type.substr(0, event.situation_type.indexOf('/'))
  const iconSize = situationCategory === 'admin' || situationCategory === 'external'
    ? '22x24' : '24x24'

  let ackStateColor: RainbowColor | GreyColor
  if (event.ack_state === 'ack_needed') {
    ackStateColor = 'alert_a'
  } else if (event.ack_state === 'silenced') {
    ackStateColor = 'active_a'
  } else {
    ackStateColor = 'c1'
  }

  const iconFilename = `alert-${situationCategory}-${iconSize}-${ackStateColor}.png`
  const iconUrl = palette.resourceUrl(iconFilename)
  const style = palette.backgroundImage(iconUrl, 'top left')
  return palette.asStyleSheet(`${situationCategory}-${ackStateColor}`, style)
}

export function makeSeverityIconStyle(event: Event) {
  const humanSeverity = 11 - event.severity
  const iconFilename = sprintf('severity-%02d-71x14.png', humanSeverity)
  const iconUrl = palette.resourceUrl(iconFilename)
  const style = palette.backgroundImage(iconUrl, 'top right')
  style.height = 14
  return palette.asStyleSheet(iconFilename.replace('.', '-'), style)
}
