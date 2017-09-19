import { SerenityError } from '../../serenity'
import * as React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import { Popover } from 'antd'
import standardStyles from '../../util/standard-styles'
import palette from '../../util/palette'
import { VideoCellScrubber } from './Scrubber'
import ViewCamera from '../ViewCamera'
import logs from '../../util/logs'
import { VideoButton } from './VideoButton'
import { SPEED_OPTIONS } from '../ViewCamera'
import StateStyledCloseButton from '../../components/StateStyledCloseButton'
import { FormattedMessage, FormattedDate } from 'react-intl'
import messages from './messages'
import StringTruncator from '../../components/StringTruncator'
import { WarningMessageBox } from './WarningMessageBox'
import { ErrorEntity } from '../../serenity/index'
import { MIN_WIDTH_FOR_SLIDER, Slider } from './Slider'
import BookmarkPopup from '../BookmarkPopup'
import { formatDisplayTime } from 'src/util/EnhancedDate'
import AlarmIndicator from 'src/OpsInterface/VideoCell/AlarmIndicator'

const CELL_MARGIN = 2
const MIN_WIDTH_FOR_ONE_HEADER_ROW = MIN_WIDTH_FOR_SLIDER
const CLOSE_ICON_WIDTH = 70
const MIN_CAMERA_NAME_WIDTH = 50
const ALARM_BANNERS_MARGIN = 34
const ALARM_BANNERS_EXTRA_MARGIN = 50

class VideoCellProps {
  count: number
  width: number
  height: number
  @observable camera: ViewCamera
}

class VideoCellState {
  isHovered: boolean
  inPtzMode: boolean
  inPtzLockMode: boolean
  ptzErrorEntity: ErrorEntity
}

@observer
export class VideoCell extends React.Component<VideoCellProps, VideoCellState> {
  SPINNER_URL = require(`../../../resources/spinner-boxes-44x44.gif`)
  LOGO_URL = require('../../../resources/pelco-logo-78x16-c1.png')
  PTZCENTER_URL = require('../../../resources/ptz-20x20-active_a.png')
  initialZoomLevel = 0
  truncator: StringTruncator

  styles = StyleSheet.create({
    spinner: {
      backgroundImage: `url(${this.SPINNER_URL})`,
    },
    logo: {
      backgroundImage: `url(${this.LOGO_URL})`,
    },
    ptzCenter: {
      backgroundImage: `url(${this.PTZCENTER_URL})`,
    },
  })

  constructor(props) {
    super(props)
    this.updateCameras(props)
    this.state = {
      isHovered: false,
      inPtzMode: false,
      inPtzLockMode: false,
      ptzErrorEntity: null,
    }
  }

  componentWillReceiveProps(newProps) {
    this.updateCameras(newProps)
  }

  render() {
    const { camera, count, height, width } = this.props
    let centerStyles: Array<React.CSSProperties> = [styles.center]
    if (camera.errorMessage()) {
      centerStyles.push(styles.errorMessage)
    } else if (camera.isLoading) {
      centerStyles.push(this.styles.spinner)
    } else if (!camera.isVideo) {
      centerStyles.push(this.styles.logo)
    } else {
      centerStyles.push(styles.hidden)
    }

    let cellStyles: Array<React.CSSProperties> = [styles.cell, standardStyles.flexOne]
    if (camera.isVideo) {
      if (!camera.displayIsLive) {
        cellStyles.push(styles.playbackBorder)
      } else if (this.state.inPtzMode) {
        cellStyles.push(styles.ptzBorder)
      }

      // Show flashing alarm border.

      const eventListPopupEngine = this.props.camera.sourceBox && window.appState.eventListPopupEngine
        .getOrderedUnsnoozedEventCellEnginesById(this.props.camera.sourceBox.eventIds)
      if (eventListPopupEngine && eventListPopupEngine.length > 0) {
        cellStyles.push(styles.alarmBorder)
      }
    }

    let imageStyles: Array<React.CSSProperties> = [styles.image]
    if (camera.imageUrl && camera.isVideo && !camera.errorMessage()) {
      imageStyles.push(StyleSheet.create({
        temp: {
          top: Math.floor(height - camera.imageSizeScaled.height) / 2 - CELL_MARGIN - 2,
          left: Math.floor(width - camera.imageSizeScaled.width) / 2 - CELL_MARGIN - 2,
        },
      }).temp)
    } else {
      imageStyles.push(styles.hidden)
    }

    const hovered = this.state.isHovered || camera.bookmarkEngine.isDisplayingBookmark
    const hideUnlessHovered = !(hovered && camera.isVideo) && styles.hidden
    let hideIfPtz = this.state.inPtzMode && styles.hidden

    let cameraDisplayTime = camera.displayIsLive ?
      <FormattedMessage {...messages.live} /> :
      <FormattedDate value={camera.displayTimestamp} {...camera.displayTimestampOptions} />

    let headerStyles = [styles.header, styles.headerFooter, standardStyles.flexHorizontal]
    if (!(hovered && (camera.isLoading || camera.isVideo))) {
      headerStyles.push(styles.hidden)
    }

    logs.VIDEO.debug(`image ${camera.imageSizeScaled.width}x${camera.imageSizeScaled.height} src=${camera.imageUrl}`)
    let cameraName = this.truncator ? this.truncator.truncate(camera.name).str : camera.name

    let ptzButtonsStyles: Array<React.CSSProperties> = [styles.headerLeft]
    if (!camera.sourceBox || !camera.sourceBox.canPtz || !camera.displayIsLive) {
      ptzButtonsStyles.push(styles.hidden)
      // Makes the camera name and time expand out to take up the whole row
      ptzButtonsStyles.push(styles.shrinkWidth)
    } else if (camera.sourceBox.canPtz && !this.state.inPtzMode) {
      // Allow the hidden slider space to be used for the camera name.
      ptzButtonsStyles.push(styles.shrinkWidth)
    }

    // Copies the camera's current zoom value (set during on showing PTZ controls, togglePtzState)
    // and then clears the initialZoomLevel so the slider can be controlled by the user.
    let initialZoomLevel = this.initialZoomLevel
    this.initialZoomLevel = undefined

    let zoomMin = 1
    let zoomMax = 10
    // Update PTZ min and max limits if available
    if (camera.sourceBox) {
      let ptzController = camera.sourceBox.ptzController()
      if (ptzController && ptzController._limits && ptzController._limits.z) {
        zoomMin = ptzController._limits.z.min
        zoomMax = ptzController._limits.z.max
      }
    }

    // header changes styles (wrap, order, width, scale) based on the width of the cell.
    let isWidthGoodForOneRow = camera.imageSizeDesired.width > MIN_WIDTH_FOR_ONE_HEADER_ROW
      || (camera.sourceBox && !camera.sourceBox.canPtz)
    let cameraWidthOffest = 0

    // Getting the time width
    let liveMessageLength = this.getTextWidth(messages.live.defaultMessage)
    let timestampMessageWidth = this.getTextWidth(formatDisplayTime(camera.displayTimestamp))
    let timeWidth = camera.displayIsLive ? liveMessageLength : timestampMessageWidth

    if (isWidthGoodForOneRow) {
      if (this.state.inPtzMode) {
        // half of width is filled with ptz slider controls, minus time text, x
        cameraWidthOffest = camera.imageSizeDesired.width / 2 - timeWidth - CLOSE_ICON_WIDTH
      } else {
        // ptz buttons, minus time text, x
        cameraWidthOffest = camera.imageSizeDesired.width - timeWidth - CLOSE_ICON_WIDTH
      }
    } else {
      // Just camera name, minus time text, x
      cameraWidthOffest = camera.imageSizeDesired.width - timeWidth - CLOSE_ICON_WIDTH
    }

    let shouldHideTime = false
    if (cameraWidthOffest < MIN_CAMERA_NAME_WIDTH) {
      shouldHideTime = true
      // if hidding the time, then add the width back on
      cameraWidthOffest += timeWidth
    }

    // keeps the width above MIN_CAMERA_NAME_WIDTH, which should be 'two letters ... two letters'
    let cameraNameWidth = Math.max(cameraWidthOffest, MIN_CAMERA_NAME_WIDTH)

    const creatingBookmark = camera.bookmarkEngine.isDisplayingBookmark && camera.visible

    const popupContent: JSX.Element = creatingBookmark && (
      <BookmarkPopup
        camera={camera}
        bookmarkId={camera.bookmarkEngine.id} />
    )

    return (
      <div
        id={`VideoCell_${count}`}
        onDrop={this.handleDrop as any}
        onDragOver={this.handleDragOver as any}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
        key={'VC:' + count}
        className={css(cellStyles)}
        style={{background: camera.backgroundColor}}>
        <div className={css(headerStyles)} style={{flexWrap: isWidthGoodForOneRow ? 'nowrap' : 'wrap' }}>
          <div className={css(ptzButtonsStyles)} style={{order: isWidthGoodForOneRow ? 0 : 1 }}>
            <VideoButton name='device-ptz'
                        width={15} height={18}
                        checkState={true}
                        handleClick={this.togglePtzState}
                        state={this.state.inPtzMode}
                        activeSuffix='mode1_a'
                        activeHoverSuffix='a'
            />
            <div className={css(styles.headerLeftPtzControls, !this.state.inPtzMode && styles.hidden)}>
              <VideoButton name={'unlocked'}
                          width={12} height={16}
                          checkState={'locked'}
                          handleClick={this.togglePtzLockState}
                          state={this.ptzLocked()}
                          disabled={!(camera.sourceBox && camera.sourceBox.canPtzLock)}
              />
              <Slider id={count}
                      max={zoomMax}
                      min={zoomMin}
                      onClick={this.handleZoom}
                      parentWidth={camera.imageSizeDesired.width - 5}
                      initialZoomLevel={initialZoomLevel} />
            </div>
          </div>
          <div className={css(styles.headerRight)} style={{width: isWidthGoodForOneRow ? '' : '100%' }}>
            <div className={css(styles.label)} title={camera.name}
              style={{marginRight: shouldHideTime ? 20 : 0}}>
              {`${cameraName}`}
            </div>
            <div className={css(styles.label, styles.labelTime)}
              style={{display: shouldHideTime ? 'none' : 'block'}}>
              {cameraDisplayTime}
            </div>
            <div style={{textAlign: 'right', flexGrow: shouldHideTime ? 1 : 0}}>
              <StateStyledCloseButton isActiveTab={true} onClick={this.handleClose} />
            </div>
          </div>
        </div>
        <img width={camera.imageSizeScaled.width}
            height={camera.imageSizeScaled.height}
            src={camera.imageUrl}
            className={css(imageStyles)}
            style={this.state.inPtzMode ? {cursor: `url(${this.PTZCENTER_URL}) 10 10, crosshair`} : null}
            onClick={this.state.inPtzMode ? this.handlePtzClick : null}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
        />
        <div style={{ overflow: 'hidden', maxHeight: '100%',
          marginTop: isWidthGoodForOneRow ? ALARM_BANNERS_MARGIN : ALARM_BANNERS_EXTRA_MARGIN}}>
          {
            this.props.camera.sourceBox && window.appState.eventListPopupEngine
              .getOrderedUnsnoozedEventCellEnginesById(this.props.camera.sourceBox.eventIds)
              .map(eventCellEngine =>
                <AlarmIndicator key={eventCellEngine.event.id} eventCellEngine={eventCellEngine}/>)
          }
        </div>
        <div className={css(centerStyles)}>
          {camera.errorMessage() && <FormattedMessage {...camera.errorMessage()} />}
        </div>
        <div className={css(styles.scrubber, hideUnlessHovered, hideIfPtz)}>
          <VideoCellScrubber key={'VCS:' + count}
                            width={width}
                            camera={camera}
                            alt={camera.displayTime} />
        </div>
        <StringTruncator width={cameraNameWidth} ref={(truncator) => { this.truncator = truncator }}/>
        <div className={css(styles.footer, styles.headerFooter, hideUnlessHovered)}>
          <div className={css(styles.footerTransport)}
              style={{
                transform: isWidthGoodForOneRow ?
                  `scale(1)` :
                  `scale(${Math.max(camera.imageSizeDesired.width / 300, 0.75)})`,
              }}>
            <div  className={css(styles.footerTransportLeft, hideIfPtz)}>
              <Popover
                content={popupContent}
                placement='bottomLeft'
                trigger='click'
                arrowPointAtCenter
                visible={camera.bookmarkEngine.isDisplayingBookmark}>
                <VideoButton name={'bookmark'}
                  width={12} height={16}
                  checkState={true}
                  handleClick={this.handleBookmarkClick}
                  state={camera.bookmarkEngine.isDisplayingBookmark}
                  disabled={camera.bookmarkEngine.isDisplayingBookmark || !camera.canCreateBookmarkHere}
                  activeSuffix='active_a'
                  activeHoverSuffix='active_a'
                  hidden={!camera.canCreateBookmarks}
                />
              </Popover>
              <VideoButton name={'snapshot'}
                width={18} height={16}
                checkState={true}
                handleClick={this.handleSnapshotClick}
                state={camera.isTakingSnapshot}
                disabled={camera.isTakingSnapshot}
                activeSuffix='active_a'
                activeHoverSuffix='active_a'
              />
            </div>
            <div className={css(styles.controls, hideIfPtz)}>
              <VideoButton name='vcr-rew'
                          width={18} height={18}
                          checkState={true}
                          handleClick={() => { camera.changeSpeed(SPEED_OPTIONS.REVERSE) }}
                          state={camera.displaySpeed < 0}
              />
              <VideoButton name='vcr-frame-b'
                          width={18} height={18}
                          handleClick={() => { camera.changeSpeed(SPEED_OPTIONS.STEP_BACK) }}
              />
              <VideoButton name='vcr-play'
                          checkState='vcr-pause'
                          width={20} height={24}
                          handleClick={() => { camera.changeSpeed(SPEED_OPTIONS.TOGGLE_PAUSE) }}
                          state={camera.displaySpeed !== 0}
              />
              <VideoButton name='vcr-frame-f'
                          width={18} height={18}
                          handleClick={() => { camera.changeSpeed(SPEED_OPTIONS.STEP_FORWARD) }}
                          disabled={ camera.displayIsLive }
                          disabledSuffix='d5'
              />
              <VideoButton name='vcr-ff'
                          width={18} height={18}
                          handleClick={() => { camera.changeSpeed(SPEED_OPTIONS.FAST_FORWARD) }}
                          checkState={true}
                          state={camera.displaySpeed > 0 && camera.displaySpeed !== 1}
                          disabled={ camera.displayIsLive }
                          disabledSuffix='d5'
              />
            </div>
            <div className={css(styles.footerTransportRight, hideIfPtz)}>
              <VideoButton name='jump-to-live'
                          width={18} height={18}
                          handleClick={() => { camera.changeSpeed(SPEED_OPTIONS.JUMP_TO_LIVE) }}
                          disabled={ camera.displayIsLive }
                          disabledSuffix='d5'
              />
              <VideoButton name='back-30'
                          width={18} height={20}
                          handleClick={() => { camera.changeSpeed(SPEED_OPTIONS.JUMP_BACK_30_SECS) }}
              />
            </div>
            <div className={css(styles.footerRight)}>
              <VideoButton name='full-screen-enter'
                          checkState='full-screen-exit'
                          width={20} height={20}
                          handleClick={() => { camera.setFullScreen(!camera.isFullScreen) }}
                          state={camera.isFullScreen}
              />
            </div>
          </div>
          <WarningMessageBox ptzErrorEntity={this.state.ptzErrorEntity}
                            onClick={this.handlePtzErrorMessageClick} id={count} />
        </div>
      </div>
    )
  }

  handleDrop = (event: DragEvent) => {
    event.preventDefault()
    const { camera } = this.props
    const dataSourceId: string = event.dataTransfer.getData('text')
    camera.connect(dataSourceId)
  }

  handleDragOver = (event: DragEvent) => {
    // Must prevent default to allow dropping
    event.preventDefault()
  }

  handleMouseMove = (event) => {
    this.setState({
      isHovered: true,
    })
  }

  handleMouseEnter = (event) => {
    this.setState({
      isHovered: true,
    })
  }

  handleMouseLeave = (event) => {
    this.setState({
      isHovered: false,
    })
  }

  handleClose = (event) => {
    this.props.camera.disconnect()
  }

  togglePtzState = () => {
    const { camera } = this.props
    const inPtzMode = camera.displayIsLive && !this.state.inPtzMode

    // Sets the initialZoomLevel when in PTZ mode is enabled.
    // initialZoomLevel is cleared once set in the render()
    if (inPtzMode && camera.sourceBox && camera.sourceBox.ptzController()) {
      this.initialZoomLevel = camera.sourceBox.ptzController().z
    }

    this.setState({ inPtzMode: inPtzMode, ptzErrorEntity: null })
  }

  handlePtzClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const { sourceBox } = this.props.camera
    if (!sourceBox.ptzController()) { return }
    let boundingRect = event.currentTarget.getBoundingClientRect()
    let posX = event.clientX - boundingRect.left
    let halfWidth = boundingRect.width / 2
    let percentX = Math.round((posX - halfWidth) * 100 / halfWidth)
    let posY = event.clientY - boundingRect.top
    let halfHeight = boundingRect.height / 2
    let percentY = Math.round((posY - halfHeight) * 100 / halfHeight)
    sourceBox.updatePtzViewObject({ x: percentX, y: -percentY })
      .catch((error: SerenityError) => { this.setState({ ptzErrorEntity: error.errorEntity }) })
  }

  togglePtzLockState = () => {
    const { sourceBox } = this.props.camera
    if (!sourceBox.ptzController()) { return }
    sourceBox.updatePtzLock(!this.ptzLocked())
      .catch((error: SerenityError) => { this.setState({ ptzErrorEntity: error.errorEntity }) })
    const { camera } = this.props
    this.setState({inPtzLockMode: camera.displayIsLive && !this.state.inPtzLockMode})
  }

  handlePtzErrorMessageClick = () => {
    this.setState({ ptzErrorEntity: null })
  }

  ptzLocked() {
    const { camera } = this.props
    return this.state.inPtzMode &&
      camera.sourceBox &&
      camera.sourceBox.ptzController() &&
      camera.sourceBox.ptzController().locked
  }

  handleZoom = (zoomLevel: number) => {
    const { sourceBox } = this.props.camera
    if (!sourceBox.ptzController()) { return }
    sourceBox.updatePtzZoom(zoomLevel)
      .catch((error: SerenityError) => { this.setState({ ptzErrorEntity: error.errorEntity }) })
  }

  handleSnapshotClick = () => this.props.camera.saveSnapshot()

  handleBookmarkClick = () => this.props.camera.bookmarkEngine.creatingBookmark(this.props.camera.getDesiredVideoTime())

  updateCameras(props: VideoCellProps) {
    const { camera, width, height } = props
    camera.setDimensions(this, width - 2 * CELL_MARGIN - 4, height - 2 * CELL_MARGIN - 4)
  }

  reset() {
    this.setState({
      isHovered: false,
      inPtzMode: false,
      inPtzLockMode: false,
      ptzErrorEntity: null,
    })
  }

  getTextWidth = (txt: string) => {
    let el: HTMLCanvasElement = document.createElement('canvas')
    this.context = el.getContext('2d')
    this.context.font = '14px Arial, sans-serif'

    return this.context.measureText(txt).width
  }
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    position: 'relative',
    margin: CELL_MARGIN,
    border: `2px solid ${palette.d2}`,
  },
  playbackBorder: {
    border: `2px solid ${palette.warn_a}`,
  },
  ptzBorder: {
    border: `2px solid ${palette.active_a}`,
  },
  alarmBorder: {
    '::after': {
      borderStyle: 'solid',
      borderWidth: 3,
      bottom: -6,
      content: "''",
      left: -6,
      pointerEvents: 'none',
      position: 'absolute',
      right: -6,
      top: -6,
      animationName: {
        '0%': {
          borderColor: 'rgba(233, 15, 45, 1)',
        },
        '50%': {
          borderColor: 'rgba(233, 15, 45, 0)',
        },
        '100%': {
          borderColor: 'rgba(233, 15, 45, 1)',
        },
      },
      animationDuration: '2s',
      animationIterationCount: 'infinite',
    },
  },
  center: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundColor: 'transparent',
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  errorMessage: {
    top: '45%',
    width: '100%',
    color: palette.a,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hidden: {
    visibility: 'hidden',
    zIndex: -1,
  },
  shrinkWidth: {
    width: 0,
  },
  image: {
    position: 'absolute',
    maxHeight: 1200,
    zIndex: 0,
    userDrag: 'none',
    userSelect: 'none',
  },
  label: {
    backgroundColor: 'transparent',
    color: palette.a,
    whiteSpace: 'nowrap',
    zIndex: 1,
  },
  labelTime: {
    color: palette.status_a,
    marginLeft: 10,
    marginRight: 20,
    flexGrow: 1,
  },
  scrubber: {
    position: 'absolute',
    left: 0,
    bottom: 35,
    // height: '${Math.floor(35) px', // * window.devicePixelRatio)}
    width: '100%',
    zIndex: 1,
  },
  headerFooter: {
    position: 'absolute',
    left: 0,
    padding: 2,
    background: 'rgba(0, 0, 0, 0.5)',
    right: 0,
    zIndex: 1,
  },
  header: {
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  headerLeft: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    display: 'flex',
    flexFlow: 'row nowrap',
    marginLeft: 10,
    marginRight: 6,
  },
  headerLeftPtzControls: {
    display: 'flex',
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    display: 'flex',
    flexFlow: 'row nowrap',
    marginRight: 10,
    marginLeft: 10,
  },
  footer: {
    bottom: 0,
    overflow: 'hidden',
  },
  footerTransport: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    display: 'flex',
    flexWrap: 'nowrap',
    padding: '2px 0 2px 0',
  },
  footerTransportLeft: {
    display: 'flex',
    flexFlow: 'row nowrap',
    flexGrow: 1,
    marginLeft: 20,
  },
  controls: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap',
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  footerTransportRight: {
    display: 'flex',
    flexFlow: 'row nowrap',
    flexGrow: 1,
    marginLeft: 20,
  },
  footerRight: {
    marginTop: 3,
  },
})
