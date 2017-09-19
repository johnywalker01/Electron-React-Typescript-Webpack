import {observable, ObservableMap} from 'mobx'
import {Event} from 'src/serenity/resources'
import logs from 'src/util/logs'
import {MSECONDS_PER_SECOND} from 'src/util/constants'

export class EventCellEngine {
  @observable snoozed = false
  @observable expanded = false
  @observable event: Event

  constructor(event: Event, private eventCellEngines: ObservableMap<EventCellEngine>) {
    this.event = event
  }

  toggleExpanded() {
    if (this.event.ack_state === 'ack_needed' || this.event.ack_state === 'silenced') {
      this.expanded = !this.expanded
    }
  }

  async toggleInProgress() {
    const silenced = this.event.ack_state === 'silenced'
    try {
      await this.event.postSilence({ wakeup: silenced ? 0 : 15 })
    } catch (err) {
      logs.EVENTS.error('Failed to toggle in progress for event', event, err)
    }
  }

  async acknowledge() {
    try {
      await this.event.postAck({})
    } catch (err) {
      logs.EVENTS.error('Failed to acknowledge event', event, err)
    }
  }

  dismiss() {
    this.eventCellEngines.delete(this.event.id)
  }

  snooze(interval: number) {
    this.snoozed = true
    setTimeout(() => {
      this.snoozed = false
    }, interval * MSECONDS_PER_SECOND)
  }
}
