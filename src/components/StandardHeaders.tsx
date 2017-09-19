import {css, StyleSheet} from 'aphrodite/no-important'
import * as React from 'react'
import {FormattedMessage, InjectedIntl, injectIntl} from 'react-intl'

import palette from '../util/palette'

interface HeaderProps {
  headerMessage?: FormattedMessage.MessageDescriptor
  subHeaderMessage?: FormattedMessage.MessageDescriptor
  intl?: InjectedIntl
}

export const HiVisHeader = injectIntl(function(props: HeaderProps) {
  return <div>
    {props.headerMessage &&
      <h1 className={css(styles.header)}>
        {props.intl.formatMessage(props.headerMessage)}
      </h1>
    }
    {props.subHeaderMessage &&
      <div className={css(styles.subHeader)}>
        {props.intl.formatMessage(props.subHeaderMessage)}
      </div>
    }
    <hr className={css(styles.hr)} />
  </div>
})

const styles = StyleSheet.create({
  header: {
    color: palette.c1,
  },
  subHeader: {
    color: palette.d3,
  },
  hr: {
    borderStyle: 'none',
    height: 4,
    marginBottom: 8,
    background: palette.c1,
  },
})
