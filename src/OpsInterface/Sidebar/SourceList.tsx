import * as React from 'react'
import { observer } from 'mobx-react'

import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../../util/palette'

import logs from '../../util/logs'

import { DataSourceBox } from '../../util/DataSourceBox'
import { SortCategory, SourceFilterModel } from './SourceFilterModel'
import SourceDetails from './SourceDetails'

const HEADER_SOURCE_ICON_WIDTH = 30
const HEADER_SOURCE_NAME_WIDTH = 180
const HEADER_SOURCE_NUMBER_WIDTH = 55
const SOURCE_ICON_WIDTH = HEADER_SOURCE_ICON_WIDTH + 10
const SOURCE_NAME_WIDTH = HEADER_SOURCE_NAME_WIDTH
const SOURCE_NUMBER_WIDTH = HEADER_SOURCE_NUMBER_WIDTH
const TRUNCATE_WIDTHS = [SOURCE_NAME_WIDTH, SOURCE_NUMBER_WIDTH - 15]

interface SourceListProps {
  viewDataSource: (dataSourceId: string) => void
  model: SourceFilterModel
}

interface SourceListState {
  detailsRow: number
}

@observer
export default class SourceList extends React.Component<SourceListProps, SourceListState> {
  cells: Array<HTMLTableCellElement>
  lastTapTime: number = 0

  constructor() {
    super()
    this.cells = []
    this.state = {
      detailsRow: -1,
    }
  }

  render() {
    logs.SOURCE_LIST.debug('SourceList render()')
    let sources = this.props.model.filteredSourceList
    const { viewDataSource } = this.props
    return (
      <div className={css(styles.wrapper)}>
        <table className={css(styles.table)}>
          <thead className={css(styles.thead)}>
            <tr className={css(styles.thr)}>
              <th className={css(styles.th)} style={{ width: HEADER_SOURCE_ICON_WIDTH }} />
              {/* FIXME: Add Source translation */}
              <th {...this.headerProps(SortCategory.Name) } style={{ width: HEADER_SOURCE_NAME_WIDTH }}>Source Name</th>
              <th {...this.headerProps(SortCategory.Id) } style={{ width: HEADER_SOURCE_NUMBER_WIDTH }}>#</th>
            </tr>
          </thead>
        </table>
        <div className={css(styles.root)}>
          <table className={css(styles.table)}>
            <tbody>
              {sources.map((dataSourceBox, rowIndex) => {
                const highlight = this.props.model.highlightNames(dataSourceBox, TRUNCATE_WIDTHS)
                const sourceDetails = this.sourceDetails(rowIndex, dataSourceBox)
                return <tr
                  id={`SourceList_row_${rowIndex}`}
                  key={rowIndex}
                  onDoubleClick={() => viewDataSource(dataSourceBox.source.id)}
                  onTouchEnd={(event) => this.handleTouchEnd(event, dataSourceBox.source.id)}
                  className={css(styles.tr)}>
                  <td
                    ref={(element) => { this.cells[rowIndex] = element }}
                    className={this.cameraClass(dataSourceBox)}
                    onClick={() => this.handleCameraIconClick(rowIndex)}
                    style={{ width: SOURCE_ICON_WIDTH }}>
                    {sourceDetails}
                  </td>
                  <td className={css(styles.td)}
                    draggable={true}
                    onDragStart={this.curryOnDragStart(dataSourceBox)}>
                    {highlight.name.map((part, spanIndex) => <span
                      key={`sourceName-${rowIndex}-${spanIndex}`}
                      className={css(styles.tdMatch)}
                      style={{ width: SOURCE_NAME_WIDTH }}
                      title={dataSourceBox.source.name}>
                      {part}
                    </span>)}
                  </td>
                  <td className={css(styles.td)}
                    draggable={true}
                    onDragStart={this.curryOnDragStart(dataSourceBox)}>
                    {highlight.number.map((part, spanIndex) => <span
                      key={`sourceId-${rowIndex}-${spanIndex}`}
                      className={css(styles.tdMatch)}
                      style={{ width: SOURCE_NUMBER_WIDTH }}
                      title={dataSourceBox.source.number ? dataSourceBox.source.number.toString() : null}>
                      {part}
                    </span>)}
                  </td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  componentDidMount() {
    this.forceUpdate()
  }

  curryOnDragStart(dataSourceBox: DataSourceBox) {
    return (event: React.DragEvent<HTMLTableCellElement>) => {
      event.persist()
      logs.SOURCE_LIST.debug('Starting drag for %s (%s)', dataSourceBox.source.name, dataSourceBox.source.id)
      event.dataTransfer.setData('text', dataSourceBox.source.id)
    }
  }

  headerProps(category: SortCategory) {
    let headerStyles: Array<any> = [styles.th]
    let down = this.props.model.sortDown(category)
    if (category === this.props.model.sortCategory) {
      headerStyles.push(down ? sortStyles.sortingDown : sortStyles.sortingUp)
    } else {
      headerStyles.push(down ? sortStyles.sortingNotDown : sortStyles.sortingNotUp)
    }
    let props = {
      onClick: () => this.props.model.updateSort(category),
      className: css(headerStyles),
    }
    return props
  }

  sourceDetails(rowIndex: number, dataSourceBox: DataSourceBox) {
    if (rowIndex === this.state.detailsRow) {
      let cell = this.cells[this.state.detailsRow]
      if (window.innerHeight - cell.getBoundingClientRect().bottom > 10) {
        return <SourceDetails dataSourceBox={dataSourceBox} cell={cell}
                              eventTypes='click' onClickOutside={this.handleClickOutsideSourceDetails} />
      }
    }
    return null
  }

  handleCameraIconClick = (row: number) => {
    logs.SOURCE_LIST.debug('Showing source details for row %s', row)
    this.setState({ detailsRow: row })
  }

  handleClickOutsideSourceDetails = (event) => {
    logs.SOURCE_LIST.debug('Hiding source details')
    this.setState({ detailsRow: -1 })
  }

  handleTouchEnd = (event: React.TouchEvent<HTMLTableRowElement>, id: string) => {
    let currentTime = new Date().getTime()
    let timeBetweenTaps = currentTime - this.lastTapTime

    if (timeBetweenTaps < 500 && timeBetweenTaps > 0) {
        event.preventDefault()
        this.props.viewDataSource(id)
    }

    this.lastTapTime = currentTime
  }

  cameraClass(dataSourceBox: DataSourceBox) {
    let cameraStyles: Array<any> = [styles.tdCamera]
    const eventCellEngines = window.appState.eventListPopupEngine
      .getOrderedUnsnoozedEventCellEnginesById(dataSourceBox.eventIds)
    if (eventCellEngines.length > 0) {
      cameraStyles.push(cameraIcons.alarm)
    } else if (dataSourceBox.source.state === 'online') {
      if (dataSourceBox.isOnScreen) {
        if (dataSourceBox.isPtz) {
          cameraStyles.push(cameraIcons.cameraPtzActiveA)
        } else if (dataSourceBox.isPanoramic) {
          cameraStyles.push(cameraIcons.cameraPanoActiveA)
        } else {
          cameraStyles.push(cameraIcons.cameraFixedActiveA)
        }
      } else {
        if (dataSourceBox.isPtz) {
          cameraStyles.push(cameraIcons.cameraPtzC1)
        } else if (dataSourceBox.isPanoramic) {
          cameraStyles.push(cameraIcons.cameraPanoC1)
        } else {
          cameraStyles.push(cameraIcons.cameraFixedC1)
        }
      }
    } else {
      if (dataSourceBox.isPtz) {
        cameraStyles.push(cameraIcons.cameraPtzOfflineC1)
      } else if (dataSourceBox.isPanoramic) {
        cameraStyles.push(cameraIcons.cameraPanoOfflineC1)
      } else {
        cameraStyles.push(cameraIcons.cameraFixedOfflineC1)
      }
    }

    return css(cameraStyles)
  }
}

const cameraIcons = StyleSheet.create({
  alarm: {
    backgroundImage: `url(${require(`../../../resources/alarm-18x18-alert_a.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/alarm-18x18-alert_b1.png`)})`,
    },
  },
  cameraPtzC1:
  {
    backgroundImage: `url(${require(`../../../resources/device-ptz-15x18-c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-ptz-15x18-b1.png`)})`,
    },
  },
  cameraPtzOfflineC1:
  {
    backgroundImage: `url(${require(`../../../resources/device-ptz-offline-15x18-c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-ptz-offline-15x18-b1.png`)})`,
    },
  },
  cameraPtzActiveA:
  {
    backgroundImage: `url(${require(`../../../resources/device-ptz-15x18-active_a.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-ptz-15x18-active_c1.png`)})`,
    },
  },
  cameraFixedC1:
  {
    backgroundImage: `url(${require(`../../../resources/device-fixed-20x10-c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-fixed-20x10-b1.png`)})`,
    },
  },
  cameraFixedOfflineC1:
  {
    backgroundImage: `url(${require(`../../../resources/device-fixed-offline-20x12-c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-fixed-offline-20x12-b1.png`)})`,
    },
  },
  cameraFixedActiveA:
  {
    backgroundImage: `url(${require(`../../../resources/device-fixed-20x10-active_a.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-fixed-20x10-active_c1.png`)})`,
    },
  },
  cameraPanoC1:
  {
    backgroundImage: `url(${require(`../../../resources/device-pano-16x16-c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-pano-16x16-b1.png`)})`,
    },
  },
  cameraPanoOfflineC1:
  {
    backgroundImage: `url(${require(`../../../resources/device-pano-offline-16x16-c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-pano-offline-16x16-b1.png`)})`,
    },
  },
  cameraPanoActiveA:
  {
    backgroundImage: `url(${require(`../../../resources/device-pano-16x16-active_a.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/device-pano-16x16-active_c1.png`)})`,
    },
  },
})

const sortStyles = StyleSheet.create({
  sortingDown: {
    backgroundImage: `url(${require(`../../../resources/triangle-dn-6x4-active_c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-dn-6x4-a.png`)})`,
    },
  },
  sortingUp: {
    backgroundImage: `url(${require(`../../../resources/triangle-up-6x4-active_c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-up-6x4-a.png`)})`,
    },
  },
  sortingNotDown: {
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-dn-6x4-b1.png`)})`,
    },
  },
  sortingNotUp: {
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-up-6x4-b1.png`)})`,
    },
  },
})

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  root: {
      overflowX: 'hidden',
      overflowY: 'auto',
  },
  table: {
    color: palette.c3,
    fontSize: 14,
    backgroundColor: palette.defaultBorderColor,
    borderCollapse: 'collapse',
    width: '100%',
  },
  thead: {},
  thr: {
    borderBottom: `1px solid ${palette.d3}`,
    backgroundColor: palette.d5,
    height: 18,
  },
  th: {
    textAlign: 'left',
    fontWeight: 'normal',
    borderRight: `1px solid ${palette.darkerBackgroundColor}`,
    paddingLeft: 5,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top 8px right 8px',
    ':last-child': {
      borderRight: 'none',
    },
  },
  tbody: {},
  tr: {
    borderTop: `1px solid ${palette.slightlyDarkerBackgroundColor}`,
    borderBottom: `1px solid ${palette.darkerBackgroundColor}`,
    backgroundColor: palette.defaultBackgroundColor,
    color: palette.defaultTextColor,
    ':hover td:not(:first-of-type)': {
      backgroundColor: palette.d5,
    },
  },
  tdCamera: {
    borderRight: `1px solid ${palette.darkerBackgroundColor}`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    ':hover': {
      backgroundColor: palette.d5,
    },
    ':hover ~ td': {
      backgroundColor: `${palette.defaultBackgroundColor} !important`,
    },
  },
  td: {
    cursor: 'pointer',
    padding: 5,
    textAlign: 'left',
  },
  tdMatch: {
    ':nth-child(even)': {
      color: palette.b5,
    },
  },
})
