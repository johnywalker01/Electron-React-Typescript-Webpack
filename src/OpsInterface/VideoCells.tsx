import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import standardStyles from '../util/standard-styles'
import { ViewTab } from './model'
import { VideoCell } from './VideoCell'
import logs from '../util/logs'
import elementResizeEvent = require('element-resize-event')
import palette from '../util/palette'

interface VideoCellsProps {
  viewTab: ViewTab
}

interface VideoCellsState {
  width: number
  height: number
}

@observer
export default class VideoCells extends React.Component<VideoCellsProps, VideoCellsState> {
  element: HTMLDivElement

  render() {
    const { viewTab } = this.props
    let rows: Array<JSX.Element>
    if (viewTab.fullScreen === null) {
      switch (viewTab.layout) {
        default:
          throw new Error(`Unknown layout: ${viewTab.layout}`)
        case ('1x1'):
        case ('1x2'):
        case ('2x1'):
        case ('2x2'):
        case ('3x3'):
        case ('4x4'):
          rows = this.rows(parseInt(viewTab.layout[0], 10), parseInt(viewTab.layout[2], 10))
      }
    } else {
      rows = this.rows(1, 1, viewTab.fullScreen)
    }
    return <div id='VideoCells'
      ref={(element) => { this.element = element }}
      className={css(styles.cellsRoot, standardStyles.flexVertical)}>
      {rows}
    </div>
  }

  componentDidMount() {
    logs.CELLS.debug(`VideoCells componentDidMount ${this.element.clientWidth}x${this.element.clientHeight}`)
    elementResizeEvent(this.element, this.onResize)
    setTimeout(this.onResize, 250)
  }

  onResize = () => {
    logs.CELLS.debug(`VideoCells resize ${this.element.clientWidth}x${this.element.clientHeight}`)
    this.setState({width: this.element.clientWidth, height: this.element.clientHeight})
  }

  rows(colCount: number, rowCount: number, cellOffset: number = 0) {
    if (!this.state) {return null}
    const { width, height } = this.state
    const { viewTab } = this.props
    let widths = []
    for (let col = 0; col < colCount; col++) {
      widths.push(width / colCount)
    }
    let result: Array<JSX.Element> = []
    for (let row = 0; row < rowCount; row++) {
      result.push(<VideoRow key={`VideoRow ${row}`} widths={widths}
        yIndex={row} countStart={row * colCount + cellOffset}
        viewTab={viewTab} height={height / rowCount} />)
    }
    return result
  }
}

interface VideoRowProps {
  widths: Array<number>
  height: number
  yIndex: number
  countStart: number
  viewTab: ViewTab
}

@observer
class VideoRow extends React.Component<VideoRowProps, {}> {
  constructor(props) {
    super(props)
  }

  render() {
    let {widths, countStart, height, viewTab } = this.props
    let children: Array<JSX.Element>
    if (widths) {
      children = []
      for (let i = 0; i < widths.length; i++) {
        let camera = viewTab.cameras[countStart + i]
        children.push(<VideoCell key={`VideoCell ${countStart + i}`}
          count={countStart + i}
          width={widths[i]}
          height={height}
          camera={camera}/>)
      }
    }
    return <div className={css(styles.row)}>
      {children}
    </div>
  }

}

const styles = StyleSheet.create({
  cellsRoot: {
    flex: 1,
    border: `2px solid ${palette.d4}`,
    background: palette.d4,
  } as React.CSSProperties,
  row: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  } as React.CSSProperties,
})
