import * as React from 'react'
import {observable} from 'mobx'
import { observer } from 'mobx-react'
import { FormattedMessage } from 'react-intl'
import * as lodash from 'lodash'

import Serenity from '../serenity'
import { SerenityError, SERVER_DOES_NOT_SUPPORT_CHANGING_PASSWORD } from '../serenity'
import messages from './messages'
import ModalDialog from '../components/ModalDialog'
import ClearBoth from '../components/ClearBoth'
import {HiVisHeader} from '../components/StandardHeaders'
import {HiVisFormField} from '../components/StandardFormFields'
import {HiVisNormalButton, HiVisPrimaryButton} from '../components/StandardButtons'
import logs from '../util/logs'

interface Props {
  isOpen: boolean
  onSuccess: (newPassword: string) => void
  onCancel: () => void
  serenity: Serenity
}

interface ChangePasswordModel {
  currentPassword: string
  currentPasswordErrorMessage: FormattedMessage.MessageDescriptor
  newPassword: string
  newPasswordErrorMessage: FormattedMessage.MessageDescriptor
  retypePassword: string
  retypePasswordErrorMessage: FormattedMessage.MessageDescriptor
}

@observer
export default class ChangePasswordDialog extends React.Component<Props, {}> {
  private defaultChangePasswordModelFieldValues = {
    currentPassword: '',
    newPassword: '',
    retypePassword: '',
  }

  private defaultChangePasswordModelErrorMessages = {
    currentPasswordErrorMessage: null,
    newPasswordErrorMessage: null,
    retypePasswordErrorMessage: null,
  }

  private changePasswordModel: ChangePasswordModel = observable(lodash.assign(
    {}, this.defaultChangePasswordModelFieldValues, this.defaultChangePasswordModelErrorMessages))

  constructor() {
    super()
    this.resetErrorMessages()
    this.resetFormValues()
  }

  render() {
    return <ModalDialog isOpen={this.props.isOpen} contentLabel='ChangePasswordDialog'>
      <HiVisHeader headerMessage={messages.header} />
      <form onSubmit={this.handleSave} style={{width: '300px'}}>
        <HiVisFormField
          autoFocus
          name='currentPassword'
          type='password'
          model={this.changePasswordModel}
          labelMessage={messages.currentPassword} />
        <HiVisFormField
          name='newPassword'
          type='password'
          model={this.changePasswordModel}
          labelMessage={messages.newPassword} />
        <HiVisFormField
          name='retypePassword'
          type='password'
          model={this.changePasswordModel}
          labelMessage={messages.retypePassword} />
        <HiVisHeader />
        <HiVisNormalButton
          onClick={this.handleCancel}
          valueMessage={messages.cancelButton}
          style={{ float: 'right', marginLeft: '6px' }} />
        <HiVisPrimaryButton
          onClick={this.handleSave}
          disabled={!this.changePasswordModel.currentPassword
            || !this.changePasswordModel.newPassword || !this.changePasswordModel.retypePassword}
          valueMessage={messages.saveButton}
          style={{ float: 'right', marginLeft: '6px' }} />
        <ClearBoth />
      </form>
    </ModalDialog>
  }

  handleSave = async (event) => {
    this.resetErrorMessages()

    if (this.changePasswordModel.newPassword !== this.changePasswordModel.retypePassword) {
      this.changePasswordModel.newPasswordErrorMessage = messages.passwordsDoNotMatch
      this.changePasswordModel.retypePasswordErrorMessage = messages.passwordsDoNotMatch
      return
    }

    try {
      await this.props.serenity.changePassword(
        this.changePasswordModel.currentPassword, this.changePasswordModel.newPassword)

      this.props.onSuccess(this.changePasswordModel.newPassword)

      this.resetErrorMessages()
      this.resetFormValues()
    } catch (serenityError) {
      logs.ROOT.error('Error changing password:', serenityError)

      if (serenityError === SERVER_DOES_NOT_SUPPORT_CHANGING_PASSWORD) {
        this.changePasswordModel.currentPasswordErrorMessage = messages.serverDoesNotSupportChangingPassword
        return
      }

      const errorEntity = (serenityError as SerenityError).errorEntity

      if (errorEntity) {
        switch (errorEntity.code) {
          case 'InvalidValue':
            this.changePasswordModel.newPasswordErrorMessage = messages.passwordInvalid
            this.changePasswordModel.retypePasswordErrorMessage = messages.passwordInvalid
            break
          case 'PasswordReqMoreDigits':
            this.changePasswordModel.newPasswordErrorMessage = messages.passwordReqMoreDigits
            this.changePasswordModel.retypePasswordErrorMessage = messages.passwordReqMoreDigits
            break
          case 'PasswordReqMoreLower':
            this.changePasswordModel.newPasswordErrorMessage = messages.passwordReqMoreLower
            this.changePasswordModel.retypePasswordErrorMessage = messages.passwordReqMoreLower
            break
          case 'PasswordReqMoreSpecial':
            this.changePasswordModel.newPasswordErrorMessage = messages.passwordReqMoreSpecial
            this.changePasswordModel.retypePasswordErrorMessage = messages.passwordReqMoreSpecial
            break
          case 'PasswordReqMoreUpper':
            this.changePasswordModel.newPasswordErrorMessage = messages.passwordReqMoreUpper
            this.changePasswordModel.retypePasswordErrorMessage = messages.passwordReqMoreUpper
            break
          case 'PasswordTooShort':
            this.changePasswordModel.newPasswordErrorMessage = messages.passwordTooShort
            this.changePasswordModel.retypePasswordErrorMessage = messages.passwordTooShort
            break
          case 'PasswordTooSimilar':
            this.changePasswordModel.newPasswordErrorMessage = messages.passwordTooSimilar
            this.changePasswordModel.retypePasswordErrorMessage = messages.passwordTooSimilar
            break
          case 'Unauthenticated':
            this.changePasswordModel.currentPasswordErrorMessage = messages.verifyCurrentPassword
            break
          case 'PermissionConflict':
          case 'Unauthorized':
            this.changePasswordModel.currentPasswordErrorMessage = messages.insufficientPrivileges
            break
          default:
            this.changePasswordModel.currentPasswordErrorMessage = messages.unknownError
            break
        }
      } else {
        this.changePasswordModel.currentPasswordErrorMessage = messages.unknownError
      }
    }
  }

  handleCancel = (event) => {
    this.resetFormValues()
    this.resetErrorMessages()

    this.props.onCancel()
  }

  resetFormValues() {
    lodash.assign(this.changePasswordModel, this.defaultChangePasswordModelFieldValues)
  }

  resetErrorMessages() {
    lodash.assign(this.changePasswordModel, this.defaultChangePasswordModelErrorMessages)
  }
}
