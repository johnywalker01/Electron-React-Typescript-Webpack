import { defineMessages } from 'react-intl'

export default defineMessages({
  tabName: {
    id: 'vxweb.VideoTab.tabName',
    defaultMessage: 'Tab {tabNumber} ({layout})',
  },
  settingsLink: {
    id: 'vxweb.VideoTab.settingsLink',
    defaultMessage: 'Configure Server',
  },
  logoutLink: {
    id: 'vxweb.VideoTab.logoutLink',
    defaultMessage: 'Log Out',
  },
  changePassword: {
    id: 'vxweb.VideoTab.changePassword',
    defaultMessage: 'Change Password',
  },
  cancel: {
    id: 'vxweb.VideoTab.cancel',
    defaultMessage: 'Cancel',
  },
  save: {
    id: 'vxweb.VideoTab.save',
    defaultMessage: 'Save',
  },
  edit: {
    id: 'vxweb.VideoTab.edit',
    defaultMessage: 'Edit',
  },
  createBookmarkFor: {
    id: 'vxweb.VideoTab.createBookmarkFor',
    defaultMessage: 'Create Bookmark for ',
  },
  editBookmarkFor: {
    id: 'vxweb.VideoTab.editBookmarkFor',
    defaultMessage: 'Edit Bookmark for ',
  },
  lockAdjacentRecordings: {
    id: 'vxweb.VideoTab.lockAdjacentRecordings',
    defaultMessage: 'Lock adjacent recordings...',
  },
  adjacentRecordingsLocked: {
    id: 'vxweb.VideoTab.adjacentRecordingsLocked',
    defaultMessage: 'Adjacent recordings locked',
  },
  bookmarkStartTooLate: {
    id: 'vxweb.VideoTab.bookmarkStartTooLate',
    defaultMessage: 'Start Time is after the Bookmark Time. Please make it earlier and try again.',
  },
  bookmarkEndTooEarly: {
    id: 'vxweb.VideoTab.bookmarkEndTooEarly',
    defaultMessage: 'End Time is before the Bookmark Time. Please make it later and try again.',
  },
  bookmarkFailedToCreate: {
    id: 'vxweb.VideoTab.bookmarkFailedToCreate',
    defaultMessage: 'The system was unable to create this bookmark.',
  },
})
