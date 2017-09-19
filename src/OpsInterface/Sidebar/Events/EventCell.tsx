import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import { FormattedMessage } from 'react-intl'

import { Event } from 'src/serenity/resources'
import { SituationTypeMap } from 'src/serenity/situations'
import palette from 'src/util/palette'
import { HiVisNormalButton } from 'src/components/StandardButtons'
import Dropdown from 'src/components/Dropdown/Dropdown'
import DropdownTrigger from 'src/components/Dropdown/DropdownTrigger'
import DropdownContent from 'src/components/Dropdown/DropdownContent'

import { makeEventIconStyle, makeSeverityIconStyle } from './helper'
import messages from './messages'
import {EventCellEngine} from 'src/OpsInterface/Sidebar/Events/EventCellEngine'
import {EventListPopupEngine} from 'src/OpsInterface/Sidebar/Events/EventListPopupEngine'
import {SituationsEngine} from 'src/OpsInterface/Sidebar/Events/SituationsEngine'

interface EventMessageProps {
  eventCellEngine: EventCellEngine
  eventListPopupEngine: EventListPopupEngine
  situationsEngine: SituationsEngine
}

@observer
export class EventCell extends React.Component<EventMessageProps, {}> {
  render() {
    const event = this.props.eventCellEngine.event
    const situation = this.props.situationsEngine.situations.get(event.situation_type)
    const sourceDevice = event._embedded && event._embedded['/pelco/rel/source_device']
    const eventTimeString = (new Date(event.time)).toLocaleString()
    const situationTypeLocalized = SituationTypeMap[event.situation_type]
    const styleShowActions = !this.props.eventCellEngine.expanded && styles.hidden
    const sourceReference =
      event.properties.name ||
      event.properties.role_name ||
      event.properties.data_source_name ||
      (sourceDevice && sourceDevice.name)
    const snoozeIntervals = situation ? situation.snooze_intervals : []
    const showSnooze = snoozeIntervals.length > 0 && event.ack_state !== 'acked'
    const styleShowSnoozeButton = !showSnooze && styles.invisible

    return <div className={css(styles.event)}
                onClick={this.handleExpansionToggle}
            >
      <div className={css(styles.infoContainerTop)}>
        <div className={css(styles.iconLeft, makeEventIconStyle(event))}/>
        <div className={css(styles.detailsContainerMiddle)}>
          <div className={css(styles.situationType)}>
            <FormattedMessage {...situationTypeLocalized} />
          </div>
          <div className={css(styles.sourceReference)}>{sourceReference}</div>
          <div className={css(styles.eventTimestamp)}>{eventTimeString}</div>
        </div>
        <div className={css(styles.severityContainerRight)}>
          <div className={css(makeSeverityIconStyle(event))}/>
          <div className={css(styles.ackState)}>{this.makeAckStateOrDismissLink(event)}</div>
        </div>
      </div>

      <div className={css(styles.actionContainerBottom, styleShowActions)}>
        <span className={css(styles.snoozeContainer, styleShowSnoozeButton)}>
          <Dropdown>
            <DropdownTrigger>
              <div className={css(styles.snoozeTrigger)} id='ViewsTabBar_loggedInUsername'>
                <FormattedMessage {...messages.snooze} />
              </div>
            </DropdownTrigger>
            <DropdownContent className={styles.snoozeDropdownContent}>
              <ul className={css(styles.snoozeValues)}>
                {snoozeIntervals.map((interval) =>
                  <li className={css(styles.snoozeValue)} key={`interval_${interval}`}
                      onClick={(mouseEvent) => this.handleSnoozeButton(interval, mouseEvent)}>
                    {interval} Seconds
                  </li>
                )}
              </ul>
            </DropdownContent>
          </Dropdown>
        </span>

        <span className={css(styles.inProgressContainer)} onClick={this.handleInProgressToggle}>
          <input type='checkbox'
                 checked={event.ack_state === 'silenced'}
                  style={{marginTop: -1, marginRight: 6, verticalAlign: 'middle'}}/>
          <FormattedMessage {...messages.inProgress} />
        </span>

        <span style={{marginLeft: 'auto'}}>
          <HiVisNormalButton
            onClick={this.handleAcknowledgeButton}
            valueMessage={messages.acknowledge} />
        </span>
      </div>
    </div>
  }

  makeAckStateOrDismissLink(event: Event) {
    switch (event.ack_state) {
      case 'ack_needed':
        return <div style={{color: palette.alert_a}}>
          <FormattedMessage {...messages.needsAttention} />
        </div>
      case 'silenced':
        return <div style={{color: palette.active_a}}>
          <FormattedMessage {...messages.inProgress} />
        </div>
      default:
      case 'acked':
      case 'auto_acked':
      // return <FormattedMessage {...messages.acknowleged} />
      case 'no_ack_needed':
        return <a onClick={this.handleDismissButton}
                  className={css(styles.dismissLink)}>
          <FormattedMessage {...messages.dismiss} />
        </a>
    }
  }

  handleExpansionToggle = () => {
    this.props.eventCellEngine.toggleExpanded()
  }

  handleInProgressToggle = (mouseEvent: React.MouseEvent<any>) => {
    mouseEvent.preventDefault()
    mouseEvent.stopPropagation()
    this.props.eventCellEngine.toggleInProgress()
  }

  handleAcknowledgeButton = (mouseEvent: React.MouseEvent<any>) => {
    mouseEvent.preventDefault()
    mouseEvent.stopPropagation()
    this.props.eventCellEngine.acknowledge()
  }

  handleDismissButton = (mouseEvent: React.MouseEvent<any>) => {
    mouseEvent.preventDefault()
    mouseEvent.stopPropagation()
    this.props.eventCellEngine.dismiss()
  }

  handleSnoozeButton = (interval: number, mouseEvent: React.MouseEvent<any>) => {
    mouseEvent.preventDefault()
    mouseEvent.stopPropagation()
    this.props.eventCellEngine.snooze(interval)
  }
}

const styles = StyleSheet.create({
  event: {
    borderBottom: `1px solid ${palette.c1}`,
    borderRight: `1px solid ${palette.c1}`,
    display: 'flex',
    flexDirection: 'column',
    padding: 8,
    color: palette.d3,
    backgroundColor: palette.b5,
    cursor: 'pointer',
    ':hover': {
      backgroundColor: palette.b4,
    },
  },
  infoContainerTop: {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'start',
  },
  iconLeft: {
    display: 'inline-block',
    width: 32,
    height: 32,
  },
  detailsContainerMiddle: {
    flex: 1,
    textAlign: 'left',
  },
  situationType: {
    marginTop: -4,
    fontWeight: 'bold',
    lineHeight: '20px',
  },
  sourceReference: {
    fontStyle: 'italic',
    fontSize: 12,
  },
  eventTimestamp: {
    fontSize: 12,
  },
  severityContainerRight: {
    flex: 1,
    minWidth: 75,
    maxWidth: 120,
  },
  ackState: {
    marginTop: 4,
    textAlign: 'right',
  },
  dismissLink: {
    color: palette.c1,
    textDecoration: 'underline',
    ':hover': {
      color: palette.d0,
    },
    ':active': {
      color: palette.active_a,
    },
  },
  actionContainerBottom: {
    display: 'flex',
    marginTop: 3,
  },
  snoozeContainer: {
    marginLeft: 32,
  },
  snoozeTrigger: {
    background: `url(${require('../../../../resources/triangle-dn-8x6-d3.png')}) right 8px center no-repeat`,
    backgroundColor: palette.b3,
    border: `1px solid ${palette.c1}`,
    color: palette.d3,
    cursor: 'pointer',
    height: 26,
    padding: '3px 24px 3px 10px',
    userSelect: 'none',
    ':hover': {
      background: `url(${require('../../../../resources/triangle-dn-8x6-d0.png')}) right 8px center no-repeat`,
      backgroundColor: palette.b2,
      borderColor: palette.d0,
      color: palette.d0,
    },
    ':active': {
      background: `url(${require('../../../../resources/triangle-dn-8x6-active_a.png')}) right 8px center no-repeat`,
      backgroundColor: palette.b5,
      borderColor: palette.active_a,
      color: palette.active_a,
    },
  },
  snoozeDropdownContent: {
    left: 31,
  },
  snoozeValues: {
    backgroundColor: palette.a,
    padding: 0,
    margin: 0,
    minWidth: 100,
    textAlign: 'left',
  },
  snoozeValue: {
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
  inProgressContainer: {
    marginTop: 5,
    marginLeft: 26,
  },
  hidden: {
    display: 'none',
  },
  invisible: {
    visibility: 'hidden',
  },
})
