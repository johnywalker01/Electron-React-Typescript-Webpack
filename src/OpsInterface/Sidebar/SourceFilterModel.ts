import messages from './messages'
import { observable, ObservableMap } from 'mobx'

import {
  BaseFilterModel,
  BaseFilterItem,
  BaseFilterBooleanItem,
  BaseFilterBooleanChoiceItem,
  BaseFilterStringItem,
} from './BaseFilterModel'
import { Tag } from 'src/serenity/resources'
import { DataSourceBox } from 'src/util/DataSourceBox'
import { FilterDropdownProps } from 'src/OpsInterface/Sidebar/FilterDropdown'

class SourceFilterItem extends BaseFilterItem<DataSourceBox> {}

export class SourceFilterStringItem extends BaseFilterStringItem<DataSourceBox> {
  highlightNames(dataSourceBox: DataSourceBox, widths: Array<number>) {
    const [firstSpans, lastSpans] = this.buildHighlightSpans(dataSourceBox, widths)
    return { name: firstSpans, number: lastSpans }
  }
}

export class SourceFilterBooleanItem extends BaseFilterBooleanChoiceItem<DataSourceBox> {}

export class SourceFilterTagArrayItem extends SourceFilterItem {
  @observable state: Array<Tag> = null
  @observable searchValue = ''
  @observable searchDataSource: Array<string>
  constructor() {
    super()
    this.state = new Array()
    this.searchDataSource = new Array()
  }

  isOn() {
    return this.state.length !== 0
  }
  clear() {
    this.state = new Array()
  }

  addTag = tag => {
    this.state.push(tag)
    this.searchValue = ''
  }
  removeTag = tag => (this.state = this.state.filter(stateTag => stateTag !== tag))

  filterMethod = (dataSourceBox: DataSourceBox) => {
    const filteredState = this.state.filter(stateTag =>
      dataSourceBox.tags.find(dsTag => dsTag === stateTag),
    )
    return filteredState.length === this.state.length
  }
  handleOnSearch = (value, tags) => {
    this.searchValue = value
    let pattern = new RegExp('.*', 'i')
    if (value) {
      pattern = BaseFilterItem.buildPattern(value)
    }

    this.searchDataSource = tags
      .filter(tag => pattern.exec(tag.name) != null)
      .filter(tag => !this.state.find(stateTag => tag === stateTag))
      .map(tag => tag.name)
  }
}

export enum FILTER_TYPES {
  ONLINE,
  RECORDING,
  ON_SCREEN,
  NAME_OR_ID,
  TAG,
}

export enum SortCategory {
  Name,
  Id,
}

export class SourceFilterModel extends BaseFilterModel<DataSourceBox, SortCategory> {
  constructor(sourceMap: ObservableMap<DataSourceBox>) {
    super(sourceMap, [SortCategory.Name, SortCategory.Id])
    this.addFilters()
  }

  addFilters() {
    this.addFilterItem(
      FILTER_TYPES.ONLINE,
      new SourceFilterBooleanItem(
        messages.online,
        messages.notOnline,
        (box: DataSourceBox) => box.source.state === 'online',
      ),
    )
    this.addFilterItem(
      FILTER_TYPES.RECORDING,
      new SourceFilterBooleanItem(
        messages.recording,
        messages.notRecording,
        (box: DataSourceBox) => box.source.recording,
      ),
    )
    this.addFilterItem(
      FILTER_TYPES.ON_SCREEN,
      new SourceFilterBooleanItem(
        messages.onScreen,
        messages.notOnScreen,
        (box: DataSourceBox) => box.isOnScreen,
      ),
    )
    let buildMatchTarget = (dataSourceBox: DataSourceBox) => {
      let source = dataSourceBox.source
      return [source.name, source.number === undefined ? '' : source.number.toString()]
    }
    this.addFilterItem(FILTER_TYPES.NAME_OR_ID, new SourceFilterStringItem(buildMatchTarget))
    this.addFilterItem(FILTER_TYPES.TAG, new SourceFilterTagArrayItem())
  }

  clearTagFilters() {
    if (this.filters && FILTER_TYPES.TAG in this.filters) {
      this.filters[FILTER_TYPES.TAG].clear()
    }
  }

  sortSources = (aBox: DataSourceBox, bBox: DataSourceBox) => {
    let a = aBox.source
    let b = bBox.source
    let sortResult = 0
    if (this.sortCategory === SortCategory.Name) {
      sortResult = a.name.localeCompare(b.name)
    } else if (this.sortCategory === SortCategory.Id) {
      if (a.number === undefined) {
        return 1
      }
      if (b.number === undefined) {
        return -1
      }
      sortResult = a.number - b.number
    }
    return this.sorters.get(this.sortCategory.toString()) ? sortResult : -sortResult
  }

  highlightNames(dataSourceBox: DataSourceBox, widths: Array<number>) {
    const highlighter = this.filters[FILTER_TYPES.NAME_OR_ID] as SourceFilterStringItem
    return highlighter.highlightNames(dataSourceBox, widths)
  }

  getProps(filterType: FILTER_TYPES): FilterDropdownProps {
    let filter = this.filters[filterType] as BaseFilterBooleanItem<any>
    // pulling filterMethod out to match type
    // tslint:disable-next-line:no-unused-variable
    const { filterMethod, ...dropdownProps } = filter
    return dropdownProps
  }
}
