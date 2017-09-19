import * as React from 'react'
import { observer } from 'mobx-react'
import { scrubberTotalHeight } from './model'
import ViewCamera from '../../ViewCamera'
import { StyleSheet, css } from 'aphrodite/no-important'

interface Props {
  width: number,
  camera: ViewCamera
  alt: string
}

@observer
export class VideoCellScrubber extends React.Component<Props, {}> {
  render() {
    const { width, alt, camera } = this.props
    return <canvas
            id={'VideoCellScrubber'}
            width={Math.floor(width - 8)}
            height={scrubberTotalHeight}
            data-timestamp={alt}
            className={css(styles.scrubber)}
            {...camera.scrubberModel.handlers()}
            ref={(element) => { camera.scrubberModel.setCanvas(element) }}/>
  }
}

const styles = StyleSheet.create({
  scrubber: {
    position: 'absolute',
    left: '0px',
    bottom: '0px',
    width: '100%',
    zIndex: 2,
  },
})
