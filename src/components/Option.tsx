import * as React from 'react'
import { FormattedMessage, injectIntl, InjectedIntl } from 'react-intl'
import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../util/palette'

interface OptionProps {
  value: string
  message: FormattedMessage.MessageDescriptor
  intl?: InjectedIntl
}

export const Option = injectIntl(function (props: OptionProps) {
  return (
    <option value={props.value} className={css(styles.option)}>
      {props.intl.formatMessage(props.message)}
    </option>
  )
})

const styles = StyleSheet.create({
  option: {
    backgroundColor: palette.a,
    border: 'none',
    boxShadow: 'none',
    color: palette.c1,
  },
  ':hover': {
    backgroundColor: palette.b4,
    color: palette.d0,
  },
})
