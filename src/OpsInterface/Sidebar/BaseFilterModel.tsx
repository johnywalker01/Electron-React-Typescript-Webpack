import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { observable, IObservableArray, computed, ObservableMap, action } from 'mobx'
import { StyleSheet, css } from 'aphrodite/no-important'

import palette from 'src/util/palette'
import messages from './messages'
import { HighlightSpans } from 'src/util/HighlightSpans'
import { TruncateInfo } from 'src/components/StringTruncator'
import { Tag } from 'src/serenity/resources'

export class BaseFilterItem<ItemType> {
  static buildPattern(searchValue: string): RegExp {
    try {
      return new RegExp('(.*?)(' + searchValue.split(' ').join(')(.*?)(') + ')(.*)', 'i')
    } catch (e) {
      return new RegExp('#####', 'i')
    }
  }
  @observable state: string | boolean | Tag[] | Date = null
  handleStateChange: (newState: string | boolean) => void
  filterMethod: (item: ItemType) => boolean
  isOn() {
    return this.state != null
  }
  clear() {
    this.state = null
  }
}

export class BaseFilterBooleanItem<ItemType> extends BaseFilterItem<ItemType> {
  name: FormattedMessage.Props
  notName: FormattedMessage.Props
  @observable state: boolean = null

  constructor(boolFilter: (ItemType) => boolean) {
    super()
    this.filterMethod = (item: ItemType) => boolFilter(item) === this.state
  }

  handleStateChange = newState => (this.state = newState)
}

export class BaseFilterStringItem<ItemType> extends BaseFilterItem<ItemType> {
  @observable state: string = null
  pattern: RegExp
  canvas: HTMLCanvasElement
  buildMatchStrings: (item: ItemType) => Array<string>

  constructor(buildMatchStrings: (item: ItemType) => Array<string>) {
    super()
    this.buildMatchStrings = buildMatchStrings
    this.filterMethod = (item: ItemType) => {
      const matchString = this.buildMatchStrings(item).join()
      return this.pattern.exec(matchString) !== null
    }
    this.canvas = document.createElement('canvas')
  }

  handleStateChange = newState => {
    if (newState && newState.length > 0) {
      this.pattern = BaseFilterItem.buildPattern(newState)
      this.state = newState
    } else {
      this.state = null
    }
  }

  buildTruncateInfos(item: ItemType, widths: Array<number>): Array<TruncateInfo> {
    let pos = 0
    const infos = this.buildMatchStrings(item).map((str, index) => {
      let info = new TruncateInfo(str)
      // A truncate width of 0 is valid.  It just means that no truncation will happen.  
      // Useful for items that are filtered but not displayed in the list, like bookmark description.
      info.truncate(this.canvas, widths[index] || 0)
      // Adding pos makes the gapStart and gapEnd relative to the entire string, 
      info.gapStart += pos
      info.gapEnd += pos
      pos += info.originalStr.length
      return info
    })
    return infos
  }

  highlightTruncateInfos(truncateInfos: Array<TruncateInfo>): Array<Array<string>> {
    // The match target is all of the match strings joined togehter
    const matchTarget = truncateInfos.map(info => info.originalStr).join('')
    const resultSpans = new HighlightSpans()
    resultSpans.buildFromPieces(this.pattern.exec(matchTarget), truncateInfos)
    const results = []
    let workingSpans = resultSpans
    truncateInfos.slice(0, truncateInfos.length - 1).forEach(info => {
      const [firstSpans, lastSpans] = workingSpans.splitSpans(info.str.length)
      workingSpans = lastSpans
      results.push(firstSpans.spans)
    })
    results.push(workingSpans.spans)
    return results
  }

  buildHighlightSpans(item: ItemType, widths: Array<number>): Array<Array<string>> {
    const truncateInfos: Array<TruncateInfo> = this.buildTruncateInfos(item, widths)
    if (!this.state) {
      return truncateInfos.map(info => [info.str])
    }
    return this.highlightTruncateInfos(truncateInfos)
  }
}

export class BaseFilterBooleanChoiceItem<ItemType> extends BaseFilterBooleanItem<ItemType> {
  name: FormattedMessage.Props
  notName: FormattedMessage.Props
  @observable state: boolean = null

  constructor(name, notName: FormattedMessage.Props, boolFilter: (ItemType) => boolean) {
    super(boolFilter)
    this.name = name
    this.notName = notName
  }
}

export class BaseFilterModel<ItemType, SortCategory> {
  @observable sourceMap: ObservableMap<ItemType>
  @observable filters: Array<BaseFilterItem<ItemType>>
  @observable sorters: ObservableMap<boolean>
  @observable sortCategory: SortCategory
  sortSources: (a: ItemType, b: ItemType) => number

  constructor(sourceMap: ObservableMap<ItemType>, sortCategories: Array<SortCategory>) {
    this.sourceMap = sourceMap
    this.filters = new Array()
    this.sorters = new ObservableMap<boolean>()
    sortCategories.forEach(category => this.sorters.set(category.toString(), true))
    this.sortCategory = sortCategories[0]
  }

  @computed
  get filteredSourceList(): IObservableArray<ItemType> {
    if (!this.sourceMap.size) {
      return observable(new Array())
    }
    let result: Array<ItemType> = Array.from(this.sourceMap.values())
    this.filters.forEach(filter => {
      if (filter.filterMethod && filter.isOn()) {
        result = result.filter(filter.filterMethod)
      }
    })
    return observable(result.sort(this.sortSources).slice(0, 500))
  }

  addFilterItem(filterType: number, filter: BaseFilterItem<ItemType>) {
    this.filters[filterType] = filter
  }

  clearAllFilters() {
    this.filters.forEach(filter => filter.clear())
  }

  @computed
  get anyFiltersOn() {
    return this.filters.find(filter => filter.isOn()) !== undefined
  }

  @action
  updateSort = (category: SortCategory) => {
    if (category === this.sortCategory) {
      this.sorters.set(category.toString(), !this.sorters.get(category.toString()))
    } else {
      this.sortCategory = category
    }
  }

  sortDown(category: SortCategory): boolean {
    return this.sorters.get(category.toString())
  }

  renderFilterLabel(idPrefix: string) {
    return (
      <span>
        <span className={css(styles.clickable)}>
          <FormattedMessage {...messages.filter} />
        </span>
        <span className={css(styles.filtersOnOff, this.anyFiltersOn && styles.anyFiltersOn)}>
          <FormattedMessage {...(this.anyFiltersOn ? messages.on : messages.off)} />
        </span>
        |
        <span className={css(styles.showingLabel)}>
          <FormattedMessage {...messages.showing} />
          <span className={css(styles.numberLabels)}>
            {' '}{this.filteredSourceList.length.toString()}{' '}
          </span>
          <FormattedMessage {...messages.of} />
          <span className={css(styles.numberLabels)}>
            {' '}{this.sourceMap.size.toString()}{' '}
          </span>
        </span>
        <a
          id={idPrefix + '_filter_clearAll'}
          className={css(styles.clickable, styles.clearAllLink)}
          onClick={event => {
            event.stopPropagation()
            this.clearAllFilters()
          }}
        >
          <FormattedMessage {...messages.clearAll} />
        </a>
      </span>
    )
  }
}

const styles = StyleSheet.create({
  filtersOnOff: {
    color: palette.b1,
    padding: '0 7px',
  },
  anyFiltersOn: {
    color: palette.mode3_a,
  },
  showingLabel: {
    color: palette.b1,
    padding: '0 7px',
  },
  numberLabels: {
    color: palette.status_a,
  },
  clearAllLink: {
    backgroundColor: 'transparent',
    float: 'right',
    marginRight: 10,
    border: '1px solid transparent',
    ':focus': {
      border: `1px solid ${palette.active_a}`,
    },
  },
  clickable: {
    color: palette.b1,
    ':hover': {
      color: palette.a,
    },
    ':active': {
      color: palette.active_a,
    },
  },
})
