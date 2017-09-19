import * as React from 'react'
import palette from '../../util/palette'
import { StyleSheet, css } from 'aphrodite/no-important'
import standardStyles from '../../util/standard-styles'
import { DataSourceBox } from '../../util/DataSourceBox'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { FormattedMessage} from 'react-intl'
import messages from './messages'
import * as onClickOutside from 'react-onclickoutside'
import * as lodash from 'lodash'
import TagButton from 'src/components/TagButton'

interface SourceDeviceItemProps {
  name: FormattedMessage.Props,
  value: string
  smallText?: boolean
}

class SourceDeviceItem extends React.Component<SourceDeviceItemProps, {}> {
  render() {
    if (!this.props.value) { return null }
    return <div>
      <div className={css(styles.detailsHeader)}>
        <FormattedMessage {...this.props.name} />
      </div>
      <div className={css(this.props.smallText ? styles.detailsSmallItem : styles.detailsItem)}>
        {this.props.value}
      </div>
    </div>
  }
}

interface Props {
  dataSourceBox: DataSourceBox
  cell: HTMLTableCellElement
  onClickOutside: (event: any) => void
}

interface State {
  cellOffsetParentTop: number
  cellOffsetTop: number
  cellTop: number
  selfOffsetHeight: number
  windowInnerHeight: number
  notchOffset: number
}

const MIN_HEIGHT = 80
const DROP_BELOW_HEIGHT = 0
const OVERHEAD_HEIGHT = 53
const MAX_NOTCH_OFFSET = 32

const icons = {
  true: {
    src: require('../../../resources/check-circle-12x12-status_b1.png'),
    padding: (24 - 12) / 2,
  },
  false: {
    src: require('../../../resources/denied-12x12-alert_a.png'),
    padding: (24 - 12) / 2,
  },
  warning: {
    src: require('../../../resources/warning-16x14-warn_a.png'),
    padding: (24 - 16) / 2,
  },
}

@observer
// tslint:disable-next-line:class-name - Wrapped below with onClickOutside HOC
class _SourceDetails extends React.Component<Props, State> {
  @observable self: HTMLDivElement

  constructor(props) {
    super(props)
    this.state = this.liveState()
  }

  render() {
    const { device, snapshot, source } = this.props.dataSourceBox
    const sourceBox = this.props.dataSourceBox
    const { cellOffsetParentTop, cellOffsetTop, cellTop, notchOffset } = this.state
    let offset = cellTop - cellOffsetParentTop - cellOffsetTop - OVERHEAD_HEIGHT
    return <div
      ref={this.updateHeight}
      onDoubleClick={this.handleDblClick}
      className={css(styles.dropdownPanel, standardStyles.flexHorizontal)}
      style={{
        marginTop: offset - notchOffset,
      }}>
      <div

        className={css(styles.dropdownBox)}>
        <div
          className={css(styles.detailsContainer)}>
          <div className={css(styles.cameraNameHeader)}>{this.nameAndID(source)}</div>
            <hr className={css(styles.hr)}/>
          {snapshot ? <div style={{ textAlign: 'center', marginTop: 9 }}>
            <img src={snapshot.src} className={css(styles.snapshot)} /></div> : null}
            <table className={css(styles.table)}>
                <this.formatSummaryItems>
                  <this.SourceDetailsSummaryItem name={messages.online} value={source.state === 'online'} />
                  <this.SourceDetailsSummaryItem name={messages.onScreen} value={sourceBox.isOnScreen} />
                  <this.SourceDetailsSummaryItem name={messages.recording} value={source.recording === true} />
                  {sourceBox.isPtz && sourceBox.ptzController() ?
                    <this.SourceDetailsSummaryItem
                      name={messages.ptzLocked}
                      value={sourceBox.ptzController().locked === true} />
                    : null}
                </this.formatSummaryItems>
            </table>
          {sourceBox.tags.length > 0 ? <div>
            <hr className={css(styles.hr)}/>
            {sourceBox.tags.map(tag => <TagButton key={`TagButton ${tag.id}`}tag={tag}/> )}
            </div> : null}
          <hr className={css(styles.hr)}/>
          {device ? <div>
            <SourceDeviceItem name={messages.name} value={this.nameAndID(source)}/>
            <SourceDeviceItem name={messages.ipAddress} value={device.ip}/>
            <SourceDeviceItem name={messages.model} value={device.model}/>
            <SourceDeviceItem name={messages.serial} value={device.serial}/>
            <SourceDeviceItem name={messages.version} value={device.version}/>
            <SourceDeviceItem name={messages.sourceId} value={source.id} smallText={true}/>
          </div> : null}
        </div>
      </div>

      <div className={css(styles.triangleRightFauxBorder)} style={{ marginTop: notchOffset + 16 }}>
        <div className={css(styles.triangleRight)} style={{ top: - 8 }} />
      </div>
    </div>
  }

  componentDidUpdate(prevProps, prevState) {
    this.checkNewState()
  }

  handleClickOutside = (event) => {
    this.props.onClickOutside(event)
  }

  handleDblClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  updateHeight = (element) => {
    this.self = element
    if (element) {
      this.checkNewState()
    }
  }

  checkNewState() {
      lodash.defer(this.checkNewStateDeferred)
  }

  checkNewStateDeferred = () => {
    let changed = false
    let newState = this.liveState()
    for (let key in newState) {
      if (newState.hasOwnProperty(key) && this.state.hasOwnProperty(key)) {
        if (newState[key] !== this.state[key]) {
          changed = true
        }
      }
    }
    if (changed) {
      this.setState(newState)
    }
  }

  liveState() {
    const { cell } = this.props
    let selfOffsetHeight = this.self ? this.self.getBoundingClientRect().height : MIN_HEIGHT
    let selfBottom = (cell.getBoundingClientRect().top + selfOffsetHeight)
    let notchOffset = Math.max(0, selfBottom - (window.innerHeight + DROP_BELOW_HEIGHT))
    notchOffset = Math.min(notchOffset, selfOffsetHeight - MAX_NOTCH_OFFSET)
    return {
      cellOffsetParentTop: (cell.offsetParent as HTMLElement).offsetTop,
      cellOffsetTop: cell.offsetTop,
      cellTop: cell.getBoundingClientRect().top,
      selfOffsetHeight: selfOffsetHeight,
      windowInnerHeight: window.innerHeight,
      notchOffset: notchOffset,
    }
  }

  nameAndID(item: {name?: string, number?: number}) {
    if (item.number || item.number === 0) {
      return `${item.name} / ${item.number}`
    }
    return item.name
  }

  formatSummaryItems(props) {
    const rows = props.children.reduce((items, item) => {
      if (item) {
        if (items[items.length - 1].length >= 3) {
          items.push([])
        }
        items[items.length - 1].push(item)
      }
      return items
    }, [[]])
    const lastRow = rows[rows.length - 1]
    while (lastRow.length < 3) {
      lastRow.push(<td className={css(styles.td, styles.tdBlank)} key={`blank-${lastRow.length}`} />)
    }
    return <tbody>{rows.map((row, index) => <tr key={`row ${index}`} className={css(styles.tr)}>{row}</tr>)}</tbody>
  }

  SourceDetailsSummaryItem(props: SummaryItemProps) {
    const icon = props.value ? icons.true : icons.false
    return <td className={css(styles.td)} key={props.name.id}>
      <img src={icon.src}
        style={{ paddingLeft: icon.padding, paddingRight: icon.padding }}
        className={css(styles.tdImg)} />
      <FormattedMessage {...props.name} />
    </td>
  }

}

interface SummaryItemProps {
  name: FormattedMessage.Props,
  src?: string,
  padding?: number,
  value?: boolean
}

const styles = StyleSheet.create({
  dropdownPanel: {
    background: palette.c1,
    width: 312 + 16 + 2,
    overflow: 'auto',
    position: 'fixed',
    marginLeft: -(312 + 16 + 2),
    overflowStyle: 'hidden',
    // marginTop: -25,
    zIndex: 11,
    borderWidth: 1,
    borderColor: palette.d0,
    borderStyle: 'solid',
  } as React.CSSProperties,
  dropdownBox: {
    display: 'block',
    margin: '0',
    width: 390,
    overflow: 'auto',
    border: 0,
    padding: '8px 0px 8px 8px',  // 8px padding gives the faux border
  } as React.CSSProperties,
  triangleRightFauxBorder: {
    width: 0,
    height: 0,
    // marginTop: 16,
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
    borderLeft: `8px solid ${palette.d3}`,
  },
  triangleRight: {
    position: 'relative',
    // top: -8,
    left: -9,
    width: 0,
    height: 0,
    borderTop: '8px solid transparent',
    borderBottom: '8px solid transparent',
    borderLeft: `8px solid ${palette.b4}`,
    backgroundColor: 'transparent',
  },
  detailsContainer: {
    background: palette.b4,
    border: `1px solid ${palette.d3}`,
    padding: '8px',
  },
  snapshot: {
    height: 100,
    maxWidth: 290,
  },
  table: {
    tableLayout: 'fixed',
    // backgroundColor: palette.defaultBorderColor,
    borderCollapse: 'collapse',
    verticalAlign: 'center',
    display: 'table',
    width: '100%',
    fontSize: 12,
    lineHeight: 14 / 12,
    color: palette.d3,
  },
  tr: {
    // borderBottom: `1px solid ${palette.darkerBackgroundColor}`,
    backgroundColor: palette.b4,
    color: palette.defaultTextColor,
  },
  tdBlank: {
    border: 'none',
  },
  td: {
    border: `1px solid ${palette.slightlyDarkerBackgroundColor}`,
    // padding: 5,
    textAlign: 'left',
    width: '33.3%',
    color: palette.d3,
    backgroundColor: `${palette.b4} !important`,
  },
  tdImg: {
    paddingTop: 2,
  },
  cameraNameHeader: {
    fontWeight: 'bold',
    color: palette.c1,
    fontSize: 14,
    lineHeight: 18 / 14,
  },
  detailsHeader: {
    color: palette.c3,
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12 / 10,
  },
  detailsItem: {
    color: palette.d3,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 18 / 14,
  },
  detailsSmallItem: {
    color: palette.d3,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 12 / 9,
  },
  hr: {
    // border: 0,
    height: 0,
    borderTop: 2,
    borderColor: palette.c1,
  },
})

const SourceDetails = onClickOutside(_SourceDetails)
export default SourceDetails
