import { defineMessages } from 'react-intl'

export default defineMessages({
  header: {
    id: 'vxweb.ChangePasswordDialog.changePassword',
    defaultMessage: 'Change Password',
  },
  currentPassword: {
    id: 'vxweb.ChangePasswordDialog.currentPassword',
    defaultMessage: 'Current Password',
  },
  newPassword: {
    id: 'vxweb.ChangePasswordDialog.newPassword',
    defaultMessage: 'New Password',
  },
  retypePassword: {
    id: 'vxweb.ChangePasswordDialog.retypePassword',
    defaultMessage: 'Retype New Password',
  },
  saveButton: {
    id: 'vxweb.ChangePasswordDialog.saveButton',
    defaultMessage: 'Save',
  },
  cancelButton: {
    id: 'vxweb.ChangePasswordDialog.cancelButton',
    defaultMessage: 'Cancel',
  },
  verifyCurrentPassword: {
    id: 'vxweb.ChangePasswordDialog.verifyCurrentPassword',
    defaultMessage: 'Please verify your Password, then try again.',
  },
  insufficientPrivileges: {
    id: 'vxweb.ChangePasswordDialog.insufficientPrivileges',
    defaultMessage: 'Your account has insufficent privileges.',
  },
  serverDoesNotSupportChangingPassword: {
    id: 'vxweb.ChangePasswordDialog.serverDoesNotSupportChangingPassword',
    defaultMessage: 'The server does not support changing your password',
  },
  passwordsDoNotMatch: {
    id: 'vxweb.ChangePasswordDialog.passwordsDoNotMatch',
    defaultMessage: 'Passwords do not match.',
  },
  passwordInvalid: {
    id: 'vxweb.ChangePasswordDialog.passwordInvalid',
    defaultMessage: 'Invalid password.',
  },
  passwordReqMoreDigits: {
    id: 'vxweb.ChangePasswordDialog.passwordReqMoreDigits',
    defaultMessage: 'New password needs more digits.',
  },
  passwordReqMoreLower: {
    id: 'vxweb.ChangePasswordDialog.passwordReqMoreLower',
    defaultMessage: 'New password needs more lower case characters.',
  },
  passwordReqMoreSpecial: {
    id: 'vxweb.ChangePasswordDialog.passwordReqMoreSpecial',
    defaultMessage: 'New password needs more special characters.',
  },
  passwordReqMoreUpper: {
    id: 'vxweb.ChangePasswordDialog.passwordReqMoreUpper',
    defaultMessage: 'New password needs more upper case characters.',
  },
  passwordTooShort: {
    id: 'vxweb.ChangePasswordDialog.passwordTooShort',
    defaultMessage: 'New password was too short.',
  },
  passwordTooSimilar: {
    id: 'vxweb.ChangePasswordDialog.passwordTooSimilar',
    defaultMessage: 'New password was too similar to a previous password.',
  },
  unknownError: {
    id: 'vxweb.ChangePasswordDialog.unknownError',
    defaultMessage: 'Sorry, an unknown error occurred while changing your password.',
  },
})
