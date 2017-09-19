import { defineMessages } from 'react-intl'

export default defineMessages({
  live: {
    id: 'vxweb.VideoCell.live',
    defaultMessage: 'Live',
  },
  ok: {
    id: 'vxweb.VideoCell.ok',
    defaultMessage: 'OK',
  },
  ptzLockedGeneralError: {
    id: 'vxweb.VideoCell.ptzLockedGeneralError',
    defaultMessage: 'The PTZ command failed. Please try again.',
  },
  ptzLockedHigherPriortyUserError: {
    id: 'vxweb.VideoCell.ptzLockedHigherPriortyUserError',
    defaultMessage: 'PTZ on this camera has been locked by a higher priority user.',
  },
  errorCannotConnect: {
    id: 'vxweb.VideoCell.errorCannotConnect',
    defaultMessage: 'Cannot connect to video source',
  },
  errorNoRecordingExists: {
    id: 'vxweb.VideoCell.errorNoRecordingExists',
    defaultMessage: 'No recording exists at this point',
  },
  ptzLockedOverrideError: {
    id: 'vxweb.VideoCell.ptzLockedOverrideError',
    defaultMessage: 'PTZ on this camera has been locked by another user. Click the lock icon to override their lock.',
  },
})
