import {css, StyleSheet} from 'aphrodite/no-important'
import * as React from 'react'
import {FormattedMessage} from 'react-intl'
import {SituationTypeMap} from 'src/serenity/situations'
import palette from '../../util/palette'
import {EventCellEngine} from 'src/OpsInterface/Sidebar/Events/EventCellEngine'

interface Props {
  eventCellEngine: EventCellEngine
}

interface State {
  expanded: boolean
}

export default class AlarmIndicator extends React.Component<Props, State> {
  constructor() {
    super()
    this.state = {expanded: true}
  }

  render() {
    const eventCellEngine = this.props.eventCellEngine
    const situationMessage = SituationTypeMap[eventCellEngine.event.situation_type]
      || {id: eventCellEngine.event.situation_type, defaultMessage: eventCellEngine.event.situation_type}
    return eventCellEngine && (
      <div>
        <div
          className={css(styles.alarmIndicator, this.state.expanded && styles.alarmIndicatorExpanded)}
          onMouseEnter={() => this.setState({expanded: true})}
          onMouseLeave={() => this.setState({expanded: false})}>
          <span className={css(styles.alarmName)}>
            <FormattedMessage {...situationMessage} />
          </span>
        </div>
      </div>
    )
  }

  componentDidMount() {
    setTimeout(() => this.setState({expanded: false}), 3000)
  }
}

const styles = StyleSheet.create({
  alarmIndicator: {
    backgroundColor: palette.alert_a,
    color: palette.a,
    display: 'inline-flex',
    lineHeight: '30px',
    marginBottom: 4,
    maxWidth: 0,
    paddingLeft: 30,
    position: 'relative',
    transition: 'max-width 500ms',
    '::after': {
      border: '15px solid transparent',
      borderLeft: `9px solid ${palette.alert_a}`,
      content: "''",
      height: 0,
      left: '100%',
      position: 'absolute',
      width: 0,
      top: 0,
    },
    '::before': {
      content: "''",
      left: 0,
      height: 30,
      position: 'absolute',
      width: 32,
      ...palette.backgroundImage(palette.resourceUrl('bell-16x16-a.png')),
    },
  },
  alarmIndicatorExpanded: {
    maxWidth: '100%',
  },
  alarmName: {
    display: 'inline-block',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
})
