import * as React from 'react'
import { observer } from 'mobx-react'
import { InjectedIntl, FormattedMessage } from 'react-intl'

import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../util/palette'
import {GreyColor} from '../util/palette'

interface FormFieldVariation {
  borderColor: string,
  backgroundColor: string,
  color: string,
  focusBorderColor: string,
  selectionBackground: string,
}

interface FormFieldProps {
  id?: string
  name: string
  model: any
  type?: FieldType
  labelMessage: FormattedMessage.MessageDescriptor
  autoFocus?: boolean
}

interface FormFieldPropsWithBG extends FormFieldProps {
  parentBgColor: GreyColor
}

type FieldType = 'text' | 'password' | 'submit'

/**
 * A light-on-dark form field with conditional error message.  This compoent's
 * model prop drives it's behavior.  The input's value is bound to model[name].  The
 * error message is bound to the model[name+'ErrorMessage'] (a react-intl
 * message).
 */
export function FormField(props: FormFieldPropsWithBG) {
  const formFieldVariation = {
    borderColor: palette.d1,
    backgroundColor: palette.d2,
    color: palette.a,
    focusBorderColor: palette.active_a,
    selectionBackground: palette.mode1_a,
  } as FormFieldVariation

  return <StandardFormField formFieldProps={props} formFieldVariation={formFieldVariation} />
}

/**
 * A dark-on-light form field with conditional error message.  This compoent's
 * model prop drives it's behavior.  The input's value is bound to model[name].  The
 * error message is bound to the model[name+'ErrorMessage'] (a react-intl
 * message).
 */
export function HiVisFormField(props: FormFieldProps) {
  const formFieldVariation = {
    borderColor: palette.c4,
    backgroundColor: palette.b5,
    color: palette.d3,
    focusBorderColor: palette.active_a,
    selectionBackground: palette.mode1_a,
  } as FormFieldVariation

  return <StandardFormField formFieldProps={props} formFieldVariation={formFieldVariation} />
}

interface StandardFormFieldProps {
  formFieldProps: FormFieldProps
  formFieldVariation: FormFieldVariation
  intl?: InjectedIntl
}

@observer
class StandardFormField extends React.Component<StandardFormFieldProps, {}> {
  static defaultProps = {
    type: 'text',
  }

  onInputChange = (event) => {
    this.props.formFieldProps.model[event.target.name] = event.target.value
  }

  render() {
    const styles = StyleSheet.create({
      root: {
        marginBottom: 12,
      },
      label: {
        display: 'block',
        paddingBottom: 4,
      },
      input: {
        height: 24,
        padding: '0 8px',
        display: 'block',
        width: '100%',
        border: '1px solid',
        borderColor: this.props.formFieldVariation.borderColor,
        backgroundColor: this.props.formFieldVariation.backgroundColor,
        color: this.props.formFieldVariation.color,
        ':focus': {
          borderColor: this.props.formFieldVariation.focusBorderColor,
        },
        '::selection': {
          background: this.props.formFieldVariation.selectionBackground,
        },
      },
      inputWithError: {
        borderColor: palette.alert_a,
      },
      errorMessage: {
        marginTop: '7px',
        color: palette.alert_c1,
      },
    })

    const formFieldProps = this.props.formFieldProps

    const fieldValue = formFieldProps.model[formFieldProps.name]

    const errorMessageFieldName = formFieldProps.name + 'ErrorMessage'
    const errorMessageDescriptor = formFieldProps.model[errorMessageFieldName] as FormattedMessage.MessageDescriptor

    return <div className={css(styles.root)}>
      <label htmlFor={formFieldProps.name} className={css(styles.label)}>
        <FormattedMessage {...formFieldProps.labelMessage} />
      </label>
      <input id={formFieldProps.id}
        autoFocus={formFieldProps.autoFocus}
        type={formFieldProps.type}
        name={formFieldProps.name}
        value={fieldValue}
        onChange={this.onInputChange}
        className={css(styles.input,
           errorMessageDescriptor && styles.inputWithError)}
        />
      {errorMessageDescriptor &&
        <div className={css(styles.errorMessage)}><FormattedMessage {...errorMessageDescriptor} /></div>}
    </div>
  }
}
