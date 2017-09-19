import * as React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import { FormattedMessage } from 'react-intl'
import * as lodash from 'lodash'

import logs from '../util/logs'
import palette from '../util/palette'
import standardStyles from '../util/standard-styles'
import { deleteCookie, getCookie} from '../util/cookie'
import AppState from '../AppState'
import messages from './messages'
import ClearBoth from '../components/ClearBoth'
import { FormField } from '../components/StandardFormFields'
import { PrimaryButton } from '../components/StandardButtons'
import { Link } from '../components/StandardLinks'
import defaultLogin from '../defaultLogin'
import ChangePasswordDialog from '../ChangePasswordDialog/ChangePasswordDialog'
import {SerenityError} from '../serenity'
import AuthFailedDialog from './AuthFailedDialog'

// tslint:disable:no-var-requires
const loginVxPortalLogo = require('../../resources/logo-vxportal-110x76-alert_c1.png')
const loginVxLogo = require('../../resources/pelco_vx_logo.png')
// tslint:enable:no-var-requires

export interface LoginModel {
  username: string
  usernameErrorMessage?: FormattedMessage.MessageDescriptor
  password: string
  passwordErrorMessage?: FormattedMessage.MessageDescriptor
  serverIp: string
  serverIpErrorMessage?: FormattedMessage.MessageDescriptor
}

export interface LoginScreenProps {
  appState: AppState
}

export interface LoginScreenState {
  showChangePasswordLink?: boolean
  showChangePasswordDialog?: boolean
}

@observer
export default class LoginScreen extends React.Component<LoginScreenProps, LoginScreenState> {
  // Specify defaultCredentials to login automatically in a dev environment
  private loginModel: LoginModel = observable(lodash.assign({}, defaultLogin))

  constructor() {
    super()

    this.state = {
      showChangePasswordLink: false,
      showChangePasswordDialog: false,
    }
  }

  componentDidMount() {
    let cookie = getCookie('auth_token')
    // Default to cookie, then defaultCredentials settings
    if (cookie) {
      this.loginWithAuthToken()
    } else if (this.loginModel.username.length > 0) {
      // Login automatically if loginModel was populated via defaultCredentials
      logs.ROOT.info(`Found saved username ${this.loginModel.username}`)
      this.handleLogin({preventDefault: () => { }}) /* tslint:disable-line:no-empty */
    }
  }

  render() {
    return <div id='LoginScreen' className={css(standardStyles.flexVertical, styles.root)}>
      <ChangePasswordDialog
        isOpen={this.state.showChangePasswordDialog}
        onSuccess={this.handleChangePasswordDialogSuccess}
        onCancel={this.handleChangePasswordDialogClosed}
        serenity={this.props.appState.serenity} />

      <AuthFailedDialog
        isOpen={this.props.appState.showAuthFailedDialog}
        onOk={() => this.props.appState.showAuthFailedDialog = false} />

      <div className={css(styles.loginWrap)}>
        <h1><FormattedMessage {...messages.loginHeadingLabel} /></h1>
        <form onSubmit={this.handleLogin} className={css(styles.loginForm)}>
          <div className={css(styles.headingLabel)}>
            <div className={css(styles.headingLabel)}>
              <img src={loginVxPortalLogo} />
            </div>
            <img src={loginVxLogo} />
          </div>
          <FormField id='LoginScreen_username'
            autoFocus
            name='username'
            model={this.loginModel}
            labelMessage={messages.usernameLabel}
            parentBgColor='d3' />
          <FormField id='LoginScreen_password'
            name='password'
            type='password'
            model={this.loginModel}
            labelMessage={messages.passwordLabel}
            parentBgColor='d3' />
          <Link id='LoginScreen_changePassword'
                onClick={this.handleChangePasswordLinkClicked}
                style={{
                  marginLeft: '8px',
                  width: '100%',
                  display: this.state.showChangePasswordLink ? 'inline-block' : 'none',
                }}>
            <FormattedMessage {...messages.changePassword} />
          </Link>
          <FormField id='LoginScreen_serverIp'
            name='serverIp'
            model={this.loginModel}
            labelMessage={messages.serverIpLabel}
            parentBgColor='d3' />
          <span style={{display: 'inline-block', marginTop: 10, marginLeft: 8, fontSize: 12, color: palette.c1}}>
            {this.props.appState.version}
          </span>
          <PrimaryButton id='LoginScreen_login'
            onClick={this.handleLogin}
            valueMessage={messages.loginButton}
            disabled={!this.loginModel.username || !this.loginModel.password || !this.loginModel.serverIp}
            parentBgColor='d3'
            style={{float: 'right', marginTop: '5px'}} />
          <ClearBoth />
        </form>
      </div>
    </div>
  }

  handleLogin = async (event) => {
    event.preventDefault()
    logs.ROOT.info(`Logging in as ${this.loginModel.username} @ ${this.loginModel.serverIp}`)
    try {
      await this.props.appState.login(this.loginModel.username, this.loginModel.password,this.loginModel.serverIp)
      lodash.assign(this.loginModel, defaultLogin)
    } catch (error) {
      this.loginError(error)
    }
  }

  loginError = (error) => {
    logs.SERENITY.error('Login error', error)
    const serenityError = error as SerenityError
    if (serenityError.errorEntity) {
      if (serenityError.errorEntity.code === 'Unauthenticated') {
        this.loginModel.usernameErrorMessage = messages.verifyUsernameError
        this.loginModel.passwordErrorMessage = messages.verifyPasswordError
      } else if (serenityError.errorEntity.code === 'AuthExpired') {
        this.loginModel.passwordErrorMessage = messages.passwordExpired
        this.setState({ showChangePasswordLink: true })
      }
    }
  }

  handleChangePasswordLinkClicked = (event) => {
    this.setState({showChangePasswordDialog: true})
  }

  handleChangePasswordDialogSuccess = (password: string) => {
    this.loginModel.password = password
    // tslint:disable-next-line:no-empty
    this.handleLogin({preventDefault: () => {}})
  }

  handleChangePasswordDialogClosed = () => {
    this.loginModel.usernameErrorMessage = null
    this.loginModel.password = ''
    this.loginModel.passwordErrorMessage = null
    this.setState({ showChangePasswordDialog: false })
  }

  loginWithAuthToken = async () => {
    try {
      await this.props.appState.login('', '','')
    } catch (error) {
      this.loginError(error)
      deleteCookie('auth_token')
    }
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.d4,
  } as React.CSSProperties,
  loginWrap: {
    width: 350,
    margin: '100px auto 0 auto',
    padding: 8,
    border: '2px solid ' + palette.d0,
    backgroundColor: palette.d2,
  } as React.CSSProperties,
  loginForm: {
    padding: '18px 12px 12px 12px',
    border: '1px solid ' + palette.d0,
    backgroundColor: palette.d3,
  } as React.CSSProperties,
  headingLabel: {
    textAlign: 'center',
    marginBottom: 12,
  },
  flexVertical: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
})
