import {action, computed, observable, ObservableMap} from 'mobx'

import Serenity from 'src/serenity'
import {Event} from 'src/serenity/resources'
import {DataSourceBox} from 'src/util/DataSourceBox'
import logs from 'src/util/logs'
import {EventCellEngine} from 'src/OpsInterface/Sidebar/Events/EventCellEngine'

type EventLogMode = 'hidden' | 'single' | 'multiple'

export class EventListPopupEngine {
  private static timeDescendingComparator(a: EventCellEngine, b: EventCellEngine) {
    return b.event.time.getTime() - a.event.time.getTime()
  }

  @observable private _mode: EventLogMode = 'hidden' // tslint:disable-line:variable-name
  private pendingEvents = [] as Event[]
  private eventWebSocket: WebSocket
  @observable private readonly eventCellEngines = new ObservableMap<EventCellEngine>()

  constructor(private serenity: Serenity, private dataSources: ObservableMap<DataSourceBox>) { }

  @action
  async initialize() {
    this.setupPendingEventsWatcher()
    await this.subscribeToNotifications()
    await this.populateExistingNotifications()
  }

  @computed
  get orderedUnsnoozedEventCellEngines() {
    return this.eventCellEngines
      .values()
      .filter(eventCellEngine => !eventCellEngine.snoozed)
      .sort(EventListPopupEngine.timeDescendingComparator)
  }

  getOrderedUnsnoozedEventCellEnginesById(ids: string[]) {
    return ids
      .map(id => this.eventCellEngines.get(id))
      .filter(eventCellEngine => eventCellEngine && !eventCellEngine.snoozed)
      .sort(EventListPopupEngine.timeDescendingComparator)
  }

  @action
  dismissAll() {
    this.eventCellEngines.forEach(eventCellEngine => {
      if (eventCellEngine.event.ack_state !== 'ack_needed') {
        eventCellEngine.dismiss()
      }
    })
  }

  @action
  acknowledgeAndDismissAll() {
    this.eventCellEngines.forEach((eventCellEngine) => {
      if (eventCellEngine.event.ack_state === 'ack_needed') {
        eventCellEngine.acknowledge()
      } else {
        eventCellEngine.dismiss()
      }
    })
  }

  @action
  toggleOpen() {
    if (this.mode === 'hidden') {
      this.setModeAndUpdateEvents('multiple')
    } else {
      this.setModeAndUpdateEvents('hidden')
    }
  }

  @action
  toggleMultiple() {
    if (this.mode === 'single') {
      this.setModeAndUpdateEvents('multiple')
    } else {
      this.setModeAndUpdateEvents('single')
    }
  }

  @computed
  get mode() {
    return this._mode
  }

  @action
  private setModeAndUpdateEvents(mode: EventLogMode) {
    this._mode = mode
    if (mode === 'single') {
      this.eventCellEngines.values().forEach(it => it.expanded = true)
    } else if (mode === 'multiple') {
      this.eventCellEngines.values().forEach(it => it.expanded = false)
    } else {
      // Ignore 'hidden'
    }
  }

  private async subscribeToNotifications() {
    let request = {
      situation_types: [],
      user_notification: true,
    }

    this.eventWebSocket =
      await this.serenity.subscribeToAnyNotifications(request, (e) => this.pendingEvents.push(e))
  }

  private async populateExistingNotifications() {
    const pageSize = 500
    const system = await this.serenity.system()

    let events = await system.getEvents({notifies: true, ack_state: 'ack_needed', sort: 'time-desc', count: pageSize})
    await events.forEachEvent(event => this.pendingEvents.push(event))
  }

  private setupPendingEventsWatcher() {
    const pendingEventsWatcherInterval = 200

    setInterval(action(() => {
      while (this.pendingEvents.length > 0) {
        const event = this.pendingEvents.shift()
        this.processPendingEvent(event)
      }
    }), pendingEventsWatcherInterval)
  }

  private processPendingEvent(event: Event) {
    if ((event.ack_state === 'acked' || event.ack_state === 'auto_acked')) {
      if (this.eventCellEngines.has(event.id)) {
        logs.EVENTS.debug('Removing acked event', event)
        const eventCellEngine = this.eventCellEngines.get(event.id)
        const dataSourceId = eventCellEngine.event.properties.data_source_id
        if (dataSourceId) {
          if (this.dataSources.has(dataSourceId)) {
            const eventId = eventCellEngine.event.id
            this.dataSources.get(dataSourceId).eventIds.remove(eventId)
          }
        }
        this.eventCellEngines.delete(event.id)
      } else {
        logs.EVENTS.debug('Ignoring absent event', event)
      }
    } else {
      logs.EVENTS.debug('Adding event', event)
      const eventCellEngine = new EventCellEngine(event, this.eventCellEngines)
      this.eventCellEngines.set(event.id, eventCellEngine)
      const dataSourceId = eventCellEngine.event.properties.data_source_id
      if (dataSourceId) {
        if (this.dataSources.has(dataSourceId)) {
          const eventId = eventCellEngine.event.id
          this.dataSources.get(dataSourceId).eventIds.push(eventId)
        }
      }
      if (this.mode === 'hidden') {
        this.setModeAndUpdateEvents('single')
      }
      eventCellEngine.expanded = this.mode === 'single'
    }
  }
}
