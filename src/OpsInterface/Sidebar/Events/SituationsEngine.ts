import {action, observable, ObservableMap} from 'mobx'

import Serenity from 'src/serenity'
import {Situation} from 'src/serenity/resources'

export class SituationsEngine {
  @observable situations = new ObservableMap<Situation>()

  constructor(private serenity: Serenity) { }

  @action
  async refresh() {
    const system = await this.serenity.system()
    const situations = await system.getSituations()
    situations.situations.forEach(situation => {
      this.situations.set(situation.type, situation)
    })
  }
}
