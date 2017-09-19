import * as React from 'react'
import { StyleSheet } from 'aphrodite/no-important'
import { injectIntl, InjectedIntl, FormattedMessage } from 'react-intl'

import logs from '../util/logs'
import palette from '../util/palette'
import { GreyColor } from '../util/palette'
import StateStyledButton from './StateStyledButton'
import { InputType } from './StateStyledButton'

interface ButtonVariation {
  inputType: InputType
  normal: ColorSet
  hover: ColorSet
  press: ColorSet
  focus: ColorSet
  disable: ColorSet
}

interface ColorSet {
  fill: string
  border: string
  text: string
}

interface ButtonProps {
  id?: string
  valueMessage: FormattedMessage.MessageDescriptor
  disabled?: boolean
  tabIndex?: number
  onClick: React.MouseEventHandler<HTMLElement>
  style?: React.CSSProperties
}

interface ButtonPropsWithBG extends ButtonProps {
  parentBgColor: GreyColor
}

export function NormalButton(buttonProps: ButtonPropsWithBG) {
  const buttonVariation: ButtonVariation = {
    inputType: 'button',
    normal: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 1)],
      border: palette[palette.greyStep(buttonProps.parentBgColor, -2)],
      text: palette.b1,
    },
    hover: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 2)],
      border: palette[palette.greyStep(buttonProps.parentBgColor, -2)],
      text: palette.a,
    },
    focus: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 1)],
      border: palette.active_a,
      text: palette.b1,
    },
    press: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, -1)],
      border: palette.active_b1,
      text: palette.active_a,
    },
    disable: {
      fill: palette[buttonProps.parentBgColor],
      border: palette[palette.greyStep(buttonProps.parentBgColor, -1)],
      text: palette.c2,
    },
  }

  return <StandardButton buttonProps={buttonProps} buttonVariation={buttonVariation} />
}

export function PrimaryButton(buttonProps: ButtonPropsWithBG) {
  const buttonVariation: ButtonVariation = {
    inputType: 'submit',
    normal: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 1)],
      border: palette.b1,
      text: palette.b1,
    },
    hover: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 2)],
      border: palette.b1,
      text: palette.a,
    },
    press: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, -1)],
      border: palette.active_b1,
      text: palette.active_a,
    },
    focus: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 1)],
      border: palette.active_a,
      text: palette.b3,
    },
    disable: {
      fill: palette[buttonProps.parentBgColor],
      border: palette[palette.greyStep(buttonProps.parentBgColor, -1)],
      text: palette.c2,
    },
  }

  return <StandardButton buttonProps={buttonProps} buttonVariation={buttonVariation} />
}

export function DestructiveButton(buttonProps: ButtonPropsWithBG) {
  const buttonVariation: ButtonVariation = {
    inputType: 'button',
    normal: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 1)],
      border: palette[palette.greyStep(buttonProps.parentBgColor, -2)],
      text: palette.b1,
    },
    hover: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 2)],
      border: palette.alert_a,
      text: palette.a,
    },
    focus: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, 2)],
      border: palette.alert_a,
      text: palette.a,
    },
    press: {
      fill: palette[palette.greyStep(buttonProps.parentBgColor, -1)],
      border: palette.active_b1,
      text: palette.active_a,
    },
    disable: {
      fill: palette[buttonProps.parentBgColor],
      border: palette[palette.greyStep(buttonProps.parentBgColor, -1)],
      text: palette.c2,
    },
  }

  return <StandardButton buttonProps={buttonProps} buttonVariation={buttonVariation} />
}

export function HiVisNormalButton(buttonProps: ButtonProps) {
  const buttonVariation: ButtonVariation = {
    inputType: 'button',
    normal: {
      fill: palette.b3,
      border: palette.c1,
      text: palette.d3,
    },
    hover: {
      fill: palette.b2,
      border: palette.c1,
      text: palette.d0,
    },
    focus: {
      fill: palette.b3,
      border: palette.active_a,
      text: palette.active_a,
    },
    press: {
      fill: palette.b5,
      border: palette.active_b1,
      text: palette.d0,
    },
    disable: {
      fill: palette.b4,
      border: palette.b1,
      text: palette.c4,
    },
  }

  return <StandardButton buttonProps={buttonProps} buttonVariation={buttonVariation} />
}

export function HiVisPrimaryButton(buttonProps: ButtonProps) {
  const buttonVariation: ButtonVariation = {
    inputType: 'submit',
    normal: {
      fill: palette.active_c2,
      border: palette.c1,
      text: palette.d3,
    },
    hover: {
      fill: palette.active_c2,
      border: palette.d0,
      text: palette.d0,
    },
    press: {
      fill: palette.b5,
      border: palette.active_b1,
      text: palette.active_a,
    },
    focus: {
      fill: palette.active_c2,
      border: palette.active_a,
      text: palette.d3,
    },
    disable: {
      fill: palette.b4,
      border: palette.b1,
      text: palette.c4,
    },
  }

  return <StandardButton buttonProps={buttonProps} buttonVariation={buttonVariation} />
}

export function HiVisDestructiveButton(buttonProps: ButtonProps) {
  const buttonVariation: ButtonVariation = {
    inputType: 'button',
    normal: {
      fill: palette.b3,
      border: palette.c1,
      text: palette.d3,
    },
    hover: {
      fill: palette.b2,
      border: palette.alert_a,
      text: palette.d0,
    },
    focus: {
      fill: palette.b2,
      border: palette.alert_a,
      text: palette.d0,
    },
    press: {
      fill: palette.b5,
      border: palette.active_b1,
      text: palette.active_a,
    },
    disable: {
      fill: palette.b4,
      border: palette.b1,
      text: palette.c4,
    },
  }

  return <StandardButton buttonProps={buttonProps} buttonVariation={buttonVariation} />
}

interface StandardButtonProps {
  buttonVariation: ButtonVariation
  buttonProps: ButtonProps
  intl?: InjectedIntl
  id?: string
}

const StandardButton = injectIntl(function(props: StandardButtonProps) {
  logs.COMPONENTS.debug(`StandardButton: props: ${JSON.stringify(props)}`)

  const styles = StyleSheet.create({
    normal: {
      height: 26,
      padding: '3px 12px 3px 12px',
      border: '1px solid',
      borderColor: props.buttonVariation.normal.border,
      right: 0,
      backgroundColor: props.buttonVariation.normal.fill,
      color: props.buttonVariation.normal.text,
      cursor: 'pointer',
      textDecoration: 'none',
      ...props.buttonProps.style,
    },
    hover: {
      border: '1px solid',
      borderColor: props.buttonVariation.hover.border,
      backgroundColor: props.buttonVariation.hover.fill,
      color: props.buttonVariation.hover.text,
    },
    focus: {
      border: '1px solid',
      borderColor: props.buttonVariation.focus.border,
      backgroundColor: props.buttonVariation.focus.fill,
      color: props.buttonVariation.focus.text,
    },
    press: {
      border: '1px solid',
      borderColor: props.buttonVariation.press.border,
      backgroundColor: props.buttonVariation.press.fill,
      color: props.buttonVariation.press.text,
    },
    disable: {
      border: '1px solid',
      borderColor: props.buttonVariation.disable.border,
      backgroundColor: props.buttonVariation.disable.fill,
      color: props.buttonVariation.disable.text,
      cursor: 'default',
    } as React.CSSProperties,
  })

  return <StateStyledButton id={props.buttonProps.id}
    value={props.intl.formatMessage(props.buttonProps.valueMessage)}
    disabled={props.buttonProps.disabled}
    inputType={props.buttonVariation.inputType}
    tabIndex={props.buttonProps.tabIndex}
    onClick={props.buttonProps.onClick}
    normalStyle={styles.normal}
    hoverStyle={styles.hover}
    focusStyle={styles.focus}
    pressStyle={styles.press}
    disableStyle={styles.disable} />
})
