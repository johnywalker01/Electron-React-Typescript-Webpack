import {css, StyleSheet} from 'aphrodite/no-important'
import {observer} from 'mobx-react'
import * as React from 'react'
import {FormattedMessage} from 'react-intl'
import {HiVisNormalButton} from 'src/components/StandardButtons'
import palette from 'src/util/palette'
import {EventCell} from './EventCell'
import messages from './messages'
import {EventListPopupEngine} from 'src/OpsInterface/Sidebar/Events/EventListPopupEngine'
import {SituationsEngine} from 'src/OpsInterface/Sidebar/Events/SituationsEngine'
import {EventCellEngine} from 'src/OpsInterface/Sidebar/Events/EventCellEngine'

const MAX_HEIGHT: number = 576

class Props {
  eventListPopupEngine: EventListPopupEngine
  situationsEngine: SituationsEngine
}

class State {
}

@observer
export class EventListPopup extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = { areEventsShown: false }
  }

  render() {
    let eventList = this.props.eventListPopupEngine.orderedUnsnoozedEventCellEngines
    const isZeroEvents = eventList.length === 0
    const eventListBadgeRight = 5 + eventList.length.toString().length * 5
    let events: JSX.Element | JSX.Element[]

    // Only enable the button if there are dismissible events
    let hasAcknowledgableEvents = eventList.some(
      (current: EventCellEngine) => current.event._links['/pelco/rel/ack'] !== undefined)
    let hasDismissibleEvents = eventList.some(
      (current: EventCellEngine) => current.event._links['/pelco/rel/ack'] === undefined)

    // Shows the no events message, collapsed version, or all events  
    if (isZeroEvents) {
      events = (
        <div className={css(styles.emptyEventsMessage)}>
          <FormattedMessage {...messages.notificationZeroCount} />
        </div>
      )
    } else if (this.props.eventListPopupEngine.mode === 'single') {
      let firstEvent = eventList[0]
      events = (
        <EventCell eventCellEngine={firstEvent} eventListPopupEngine={this.props.eventListPopupEngine}
                   situationsEngine={this.props.situationsEngine} />
      )
    } else if (this.props.eventListPopupEngine.mode === 'multiple') {
      const eventLimit = 200
      events = eventList
        .filter(eventCellEngine => !eventCellEngine.snoozed)
        .slice(0, eventLimit)
        .map(eventCellEngine =>
          <EventCell key={eventCellEngine.event.id}
                     eventCellEngine={eventCellEngine}
                     eventListPopupEngine={this.props.eventListPopupEngine}
                     situationsEngine={this.props.situationsEngine} />)
      if (eventList.length > eventLimit) {
        events.push(
          <div key='notificationTooManyCount' className={css(styles.emptyEventsMessage)}>
            <FormattedMessage {...messages.notificationTooManyCount} />
          </div>
        )
      }
    }

    const eventListPopupEngine = this.props.eventListPopupEngine

    return (
      <div className={css(styles.container, eventListPopupEngine.mode === 'hidden' && styles.hide)}>
        <div className={css(styles.contentWrapper)}>
          <div className={css(styles.events,
            eventListPopupEngine.mode === 'multiple' ? styles.expand : styles.collapse)}>
            {events}
          </div>
          <div className={css(styles.eventBottomContainer)}>
            <button className={css(styles.menuButton,
              eventListPopupEngine.mode === 'single' && styles.menuButtonExpandable)}
                    disabled={isZeroEvents}
                    onClick={this.handleEventMenuClick} />
            <HiVisNormalButton
              onClick={() => this.props.eventListPopupEngine.acknowledgeAndDismissAll()}
              valueMessage={messages.acknowledgeAndDismissAll}
              disabled={!hasAcknowledgableEvents}
              style={{ height: 20, padding: '0 8px', marginRight: 8,
                display: eventListPopupEngine.mode === 'single' && 'none' }} />
            <HiVisNormalButton
              onClick={() => this.props.eventListPopupEngine.dismissAll()}
              valueMessage={messages.dismissAll}
              disabled={!hasDismissibleEvents}
              style={{ height: 20, padding: '0 8px', marginRight: 12,
                display: eventListPopupEngine.mode === 'single' && 'none' }} />
          </div>
        </div>
        <div className={css(styles.triangleDown)} style={{right: eventListBadgeRight}} />
      </div>
    )
  }

  handleEventMenuClick = (event: React.MouseEvent<any>) => {
    this.props.eventListPopupEngine.toggleMultiple()
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.c1,
    border: `1px solid ${palette.d3}`,
    bottom: 30,
    display: 'block',
    position: 'absolute',
    right: 5,
    width: 500,
    zIndex: 1,
  },
  contentWrapper: {
    backgroundColor: palette.b4,
    border: `1px solid ${palette.d3}`,
    color: palette.c1,
    margin: 7,
  },
  triangleDown: {
    backgroundColor: 'transparent',
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: `8px solid ${palette.d3}`,
    bottom: 0,
    position: 'absolute',
    '::before': {
      bottom: 1,
      borderLeft: '7px solid transparent',
      borderRight: '7px solid transparent',
      borderTop: `7px solid ${palette.b4}`,
      content: '""',
      left: -7,
      position: 'absolute',
    },
  },
  events: {
    height: 'calc(100% - 24px)',
    overflowY: 'auto',
  },
  emptyEventsMessage: {
    backgroundColor: palette.a,
    color: palette.d3,
    padding: '12px 0',
    textAlign: 'center',
    width: '100%',
  },
  eventBottomContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${palette.c1}`,
    padding: '2px 0',
  },
  menuButton: {
    border: 'none',
    cursor: 'pointer',
    height: 20,
    marginLeft: 8,
    marginRight: 'auto',
    width: 20,
    ...palette.backgroundImage(require(`../../../../resources/caret-dbl-dn-10x12-c1.png`)),
    ':hover': {
      ...palette.backgroundImage(require(`../../../../resources/caret-dbl-dn-10x12-d0.png`)),
    },
    ':active': {
      ...palette.backgroundImage(require(`../../../../resources/caret-dbl-dn-10x12-active_a.png`)),
    },
  },
  menuButtonExpandable: {
    ...palette.backgroundImage(require(`../../../../resources/caret-dbl-up-10x12-c1.png`)),
    ':hover': {
      ...palette.backgroundImage(require(`../../../../resources/caret-dbl-up-10x12-d0.png`)),
    },
    ':active': {
      ...palette.backgroundImage(require(`../../../../resources/caret-dbl-up-10x12-active_a.png`)),
    },
  },
  expand: {
    maxHeight: MAX_HEIGHT - 80,
  },
  collapse: {
    maxHeight: 140,
  },
  hide: {
    display: 'none',
  },
})
