
import * as React from 'react'
import { observer } from 'mobx-react'
import { FormattedMessage } from 'react-intl'

import messages from './messages'
import ModalDialog from '../components/ModalDialog'
import ClearBoth from '../components/ClearBoth'
import { HiVisHeader } from '../components/StandardHeaders'
import { HiVisPrimaryButton } from '../components/StandardButtons'

interface Props {
  isOpen: boolean
  onOk: () => void
}

@observer
export default class AuthFailedDialog extends React.Component<Props, {}> {
  constructor() {
    super()
  }

  render() {
    return <ModalDialog isOpen={this.props.isOpen} contentLabel='AuthFailedDialog'>
      <HiVisHeader headerMessage={messages.sessionExpired} />
      <div style={{display: 'block', marginBottom: 12}}>
        <FormattedMessage {...messages.loginAgain} />
      </div>
      <HiVisPrimaryButton id='AuthFailedDialog_ok'
        onClick={this.props.onOk}
        valueMessage={messages.ok}
        style={{ display: 'block', float: 'right' }} />
      <ClearBoth />
    </ModalDialog>
  }
}
