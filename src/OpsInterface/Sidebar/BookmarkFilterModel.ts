// import messages from './messages'
import { observable, ObservableMap } from 'mobx'

import {
  BaseFilterModel,
  BaseFilterItem,
  BaseFilterBooleanItem,
  BaseFilterStringItem,
} from './BaseFilterModel'
import { Bookmark } from 'src/serenity/resources'
import { FilterDropdownProps } from 'src/OpsInterface/Sidebar/FilterDropdown'

class BookmarkFilterItem extends BaseFilterItem<Bookmark> {}

export class BookmarkFilterStringItem extends BaseFilterStringItem<Bookmark> {
  highlightNames(bookmark: Bookmark, widths: Array<number>) {
    const [firstSpans, lastSpans] = this.buildHighlightSpans(bookmark, widths)
    return { title: firstSpans, description: lastSpans }
  }
}

export class BookmarkFilterBooleanItem extends BaseFilterBooleanItem<Bookmark> {}

export enum FILTER_TYPES {
  LOCKED,
  AFTER,
  BEFORE,
  NAME,
}

export enum SortCategory {
  Name,
  Time,
  Locked,
}

export class BookmarkFilterDateItem extends BookmarkFilterItem {
  @observable state: Date = null

  constructor(filterDirection: number) {
    super()
    this.filterMethod = (bookmark: Bookmark) => {
      const delta = this.state.getTime() - bookmark.time.getTime()
      return delta * filterDirection <= 0
    }
  }
}

export class BookmarkFilterModel extends BaseFilterModel<Bookmark, SortCategory> {
  constructor(sourceMap: ObservableMap<Bookmark>) {
    super(sourceMap, [SortCategory.Name, SortCategory.Time, SortCategory.Locked])
    this.addFilters()
  }

  addFilters() {
    this.addFilterItem(
      FILTER_TYPES.LOCKED,
      new BookmarkFilterBooleanItem((bookmark: Bookmark) => bookmark.lock && bookmark.lock.enabled),
    )
    this.addFilterItem(FILTER_TYPES.AFTER, new BookmarkFilterDateItem(1))
    this.addFilterItem(FILTER_TYPES.BEFORE, new BookmarkFilterDateItem(-1))
    this.addFilterItem(FILTER_TYPES.NAME, new BookmarkFilterStringItem((bookmark: Bookmark) =>
      [bookmark.name || '', bookmark.description || '']))
  }

  sortSources = (a: Bookmark, b: Bookmark) => {
    let sortResult = 0
    switch (this.sortCategory) {
      case SortCategory.Locked:
        const aLocked = a.lock && a.lock.enabled
        const bLocked = b.lock && b.lock.enabled
        if (aLocked && !bLocked) {
          sortResult = 1
        } else if (bLocked && !aLocked) {
          sortResult = -1
        }
        break
      default:
      case SortCategory.Name:
        if (!a.name) {
          return 1
        } else if (!b.name) {
          return -1
        }
        sortResult = a.name.localeCompare(b.name)
        break
      case SortCategory.Time:
        sortResult = b.time.getTime() - a.time.getTime()
    }
    return this.sorters.get(this.sortCategory.toString()) ? sortResult : -sortResult
  }

  highlightNames(bookmark: Bookmark, widths: Array<number>) {
    const highlighter = this.filters[FILTER_TYPES.NAME] as BookmarkFilterStringItem
    return highlighter.highlightNames(bookmark, widths)
  }

  getProps(filterType: FILTER_TYPES): FilterDropdownProps {
    let filter = this.filters[filterType] as BookmarkFilterBooleanItem
    // pulling filterMethod out to match type
    // tslint:disable-next-line:no-unused-variable
    const { filterMethod, ...dropdownProps } = filter
    return dropdownProps
  }
}
