import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import Dropdown from '../components/Dropdown/Dropdown'
import DropdownTrigger from '../components/Dropdown/DropdownTrigger'
import DropdownContent from '../components/Dropdown/DropdownContent'

import logs from '../util/logs'
import standardStyles from '../util/standard-styles'
import palette from '../util/palette'
import AppState from '../AppState'
import { ViewsTabState } from './model'
import StateStyledCloseButton from '../components/StateStyledCloseButton'
import { FormattedMessage } from 'react-intl'
import messages from './messages'
import ChangePasswordDialog from '../ChangePasswordDialog/ChangePasswordDialog'

interface Props {
  appState: AppState
  viewsTabState: ViewsTabState
}
interface State {
  showChangePasswordDialog: boolean
}

@observer
export default class ViewsTabBar extends React.Component<Props, State> {

  constructor() {
    super()
    this.state = { showChangePasswordDialog: false }
  }

  render() {
    let showClose = this.props.viewsTabState.tabs.length > 1
    return <nav className={css(standardStyles.flexHorizontal, styles.nav)}>
      <ul className={css(standardStyles.flexHorizontal, styles.ul)}>
        <li>
          <img src={require('../../resources/logo-vxportal-92x24-alert_c1.png')}
            className={css(styles.logo)} />
        </li>
        {this.props.viewsTabState.tabs.map((tab, i) => {
          const isActiveTab: boolean = i === this.props.viewsTabState.selectedIndex
          return <li
            key={i}
            className={css(styles.li)}
            style={{ zIndex: isActiveTab ? 101 : 100 - i }}>
            <a id={`ViewsTabBar_tab${i}`}
              key={`ViewsTabBar_tab${i}`}
              onClick={this.onTabSelectedCurry(i)}
              className={css(isActiveTab ? styles.aActive : styles.aInactive)}
              style={showClose ? {} : { paddingRight: 3}}>
              <FormattedMessage {...messages.tabName} values={
                { tabNumber: tab.tabNumber.toString(), layout: tab.layout }
              } />
            </a>
            {showClose
              ? <StateStyledCloseButton id={`ViewsTabBar_tab${i}_close`}
                isActiveTab={isActiveTab}
                onClick={this.onTabClosedCurry(i)} />
              : null}
          </li>
        })}
        <li className={css(styles.li)} style={{zIndex: 99}}>
          <a id='ViewsTabBar_newTab'
            onClick={this.handleNewTabButtonClick}
            className={css(styles.newTabA)} />
        </li>
      </ul>
      <span className={css(styles.usernameLinkWrapper)}>
        <Dropdown>
          <DropdownTrigger>
            <div className={css(styles.userName)} id='ViewsTabBar_loggedInUsername'>
              {this.props.appState.username}
            </div>
          </DropdownTrigger>
          <DropdownContent className={styles.dropdownContent}>
            <ul className={css(styles.userUl)}>
              <li className={css(styles.userLi, styles.configIcon, !this.props.appState.isAdminRole && styles.hide)}>
                <a id='ViewsTabBar_settings' className={css(styles.userA)}
                   href='../app/index.html' target='_blank'>
                  <FormattedMessage {...messages.settingsLink} />
                </a>
              </li>
              <li className={css(styles.userLi, styles.changePasswordIcon)}
                  onClick={this.handleChangePasswordLinkClick}>
                <FormattedMessage {...messages.changePassword} />
              </li>
              <hr className={css(styles.hr)} />
              <li className={css(styles.userLi, styles.logoutIcon)}
                  onClick={this.handleLogoutLinkClick}>
                <FormattedMessage {...messages.logoutLink} />
              </li>
            </ul>
          </DropdownContent>
        </Dropdown>
      </span>
      <ChangePasswordDialog
        isOpen={this.state.showChangePasswordDialog}
        onSuccess={this.handleChangePasswordDialogSuccess}
        onCancel={this.handleChangePasswordDialogCancel}
        serenity={this.props.appState.serenity} />
    </nav>
  }

  onTabSelectedCurry = (selectedIndex: number) => {
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      logs.TABS.debug(`Selected tab #${selectedIndex}: ${this.props.viewsTabState.selected()}`)
      this.props.viewsTabState.select(selectedIndex)
    }
  }

  onTabClosedCurry = (selectedIndex: number) => {
    return (event: React.MouseEvent<HTMLInputElement>) => {
      logs.TABS.debug(`Closed tab #${selectedIndex}: ${this.props.viewsTabState.selected()}`)
      event.currentTarget.blur()
      this.props.viewsTabState.close(selectedIndex)
    }
  }

  handleChangePasswordLinkClick = (event: React.MouseEvent<HTMLLIElement>) => {
    event.preventDefault()
    this.setState({showChangePasswordDialog: true})
  }

  handleChangePasswordDialogSuccess = (password: string) => {
    this.setState({showChangePasswordDialog: false})
    this.props.appState.login(this.props.appState.username, password,this.props.appState.serverIp)
  }

  handleChangePasswordDialogCancel = () => {
    this.setState({showChangePasswordDialog: false})
  }

  handleLogoutLinkClick = (event: React.MouseEvent<HTMLLIElement>) => {
    event.preventDefault()
    logs.ROOT.info('Logging out')
    this.props.viewsTabState.logout()
    this.props.appState.logout()
  }

  handleNewTabButtonClick = (event: React.MouseEvent<any>) => {
    const {viewsTabState} = this.props
    viewsTabState.addTab('New Tab', '2x2')
    viewsTabState.select(viewsTabState.tabs.length - 1)
  }
}

const styles = StyleSheet.create({
  nav: {
  },
  ul: {
    padding: '0',
    margin: '5px 0 -2px 0',
    flex: 3,
  },
  li: {
    position: 'relative',
    display: 'inline-block',
    marginLeft: 18,
  },
  logo: {
    position: 'relative',
    top: -2,
    marginLeft: 8,
    marginRight: 4,
  },
  aActive: makeAnchorStyle(palette.d5, palette.d4, palette.d4, palette.a),
  aInactive: makeAnchorStyle(palette.d5, palette.d5, palette.d2, palette.c3),
  newTabA: {
    content: '" "',
    position: 'relative',
    display: 'inline-block',
    marginLeft: 1,
    marginTop: 2,
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: palette.d5,
    height: 20,
    padding: '3px 9px 2px 4px',
    backgroundColor: palette.d5,
    backgroundImage: `url(${require('../../resources/plus-12x12-b1.png')})`,
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    // backgroundColor: 'blue',
    color: palette.b1,
    textDecoration: 'none',
    ':hover': {
      borderColor: palette.c1,
      backgroundColor: palette.c1,
      backgroundImage: `url(${require('../../resources/plus-12x12-a.png')})`,
      cursor: 'pointer',
    },
    ':active': {
      borderColor: palette.active_b1,
      backgroundColor: palette.d2,
      backgroundImage: `url(${require('../../resources/plus-12x12-active_a.png')})`,
    },
    ':before': {
      content: '" "',
      position: 'absolute',
      top: -1,
      bottom: 0,
      left: -6,
      width: 13,
      height: '110%',
      transform: 'skew(30deg)',
      borderTop: '1px solid',
      borderLeft: '1px solid',
      borderColor: 'inherit',
      backgroundColor: 'inherit',
      // backgroundColor: 'green',
      zIndex: -1,
    },
    ':after': {
      content: '" "',
      position: 'absolute',
      top: -1,
      bottom: 0,
      right: -6,
      width: 13,
      height: '110%',
      transform: 'skew(30deg)',
      borderRight: '1px solid',
      borderBottom: '1px solid',
      borderColor: 'inherit',
      backgroundColor: 'inherit',
      // backgroundColor: 'red',
      zIndex: -1,
    },
  },
  usernameLinkWrapper: {
    maxWidth: 250,
    paddingTop: 7,
    paddingRight: 12,
    flex: 1,
    textAlign: 'right',
  },
  userName: {
    cursor: 'pointer',
    paddingRight: 16,
    color: palette.b1,
    background: `url(${require('../../resources/triangle-dn-8x6-b1.png')}) right no-repeat`,
    ':hover': {
      background: `url(${require('../../resources/triangle-dn-8x6-a.png')}) right no-repeat`,
      color: palette.a,
    },
    ':active': {
      background: `url(${require('../../resources/triangle-dn-8x6-active_a.png')}) right no-repeat`,
      color: palette.active_a,
    },
  },
  dropdownContent: {
    right: 1,
  },
  userUl: {
    backgroundColor: palette.a,
    padding: 0,
    margin: 0,
    minWidth: 100,
    textAlign: 'left',
  },
  userLi: {
    color: palette.c1,
    cursor: 'pointer',
    listStyle: 'none',
    padding: 5,
    ':hover': {
      backgroundColor: palette.b4,
      color: palette.d0,
    },
    ':active': {
      backgroundColor: palette.active_c1,
    },
  },
  configIcon: {
    background: `url(${require('../../resources/gear-18x18-b1.png')}) left no-repeat`,
    backgroundPosition: '2px 4px',
    paddingLeft: 22,
    ':hover': {
      background: `${palette.b4} left no-repeat`,
      backgroundImage: `url(${require('../../resources/gear-18x18-d0.png')})`,
      backgroundPosition: '2px 4px',
    },
  },
  changePasswordIcon: {
    background: `url(${require('../../resources/key-16x8-b1.png')}) left no-repeat`,
    backgroundPosition: '4px 10px',
    paddingLeft: 22,
    ':hover': {
      background: `${palette.b4} left no-repeat`,
      backgroundImage: `url(${require('../../resources/key-16x8-d3.png')})`,
      backgroundPosition: '4px 10px',
    },
  },
  logoutIcon: {
    background: `url(${require('../../resources/admin-14x14-b1.png')}) left no-repeat`,
    backgroundPosition: '4px 6px',
    paddingLeft: 22,
    ':hover': {
      background: `${palette.b4} left no-repeat`,
      backgroundImage: `url(${require('../../resources/admin-14x14-d0.png')})`,
      backgroundPosition: '4px 6px',
    },
  },
  userA: {
    textDecoration: 'none',
    ':focus': {
      border: 'none',
    },
  },
  hr: {
    border: `none`,
    borderTop: `1px solid ${palette.b2}`,
    margin: 0,
  },
  hide: {
    display: 'none',
  },
})

function makeAnchorStyle(borderColor: string, borderBottomColor: string, backgroundColor: string, color: string) {
  return {
    position: 'relative',
    display: 'inline-block',
    padding: '3px 22px 2px 4px',
    marginBottom: '1px',
    borderTop: `1px solid ${borderColor}`,
    borderBottom: `1px solid ${borderBottomColor}`,
    borderRight: 0,
    borderLeft: 0,
    backgroundColor: backgroundColor,
    // backgroundColor: 'blue',
    color: color,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ':hover': {
      color: palette.a,
      cursor: 'pointer',
    },
    ':before': {
      content: '" "',
      position: 'absolute',
      top: -1,
      bottom: -1,
      left: -8,
      width: 18,
      transform: 'skew(-30deg)',
      border: `1px solid ${borderColor}`,
      borderBottom: `1px solid ${borderBottomColor}`,
      backgroundColor: 'inherit',
      // backgroundColor: 'green',
      zIndex: -1,
    },
    ':after': {
      content: '" "',
      position: 'absolute',
      top: -1,
      bottom: -1,
      right: -8,
      width: 18,
      transform: 'skew(30deg)',
      border: `1px solid ${borderColor}`,
      borderBottom: `1px solid ${borderBottomColor}`,
      backgroundColor: 'inherit',
      // backgroundColor: 'red',
      zIndex: -1,
    },
  } as React.CSSProperties
}
