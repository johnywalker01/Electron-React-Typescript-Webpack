import { observable, computed, ObservableMap } from 'mobx'

import logs from 'src/util/logs'
import { MSECONDS_PER_SECOND } from 'src/util/constants'
import { DataSourceBox, ThumbnailInterface } from 'src/util/DataSourceBox'

import {
  Bookmark,
  Bookmark_LockEditData,
  BookmarkEditData,
  Event,
  NewLockedBookmarkData,
  NewBookmarkData,
} from 'src/serenity/resources'
import { SituationType } from 'src/serenity/situations'

export default class BookmarkEngine {
  static startListeningForNotifications(appState) {
    let request = {
      situation_types: [
        'system/bookmark_added',
        'system/bookmark_lock_enabled',
        'system/bookmark_lock_modified',
        'system/bookmark_lock_disabled',
        'system/bookmark_modified',
        'system/bookmark_removed',
      ] as SituationType[],
      user_notification: false,
    }

    appState.serenity.subscribeToAnyNotifications(request, event =>
      BookmarkEngine.handleBookmarkEvent(appState.bookmarkMap, event),
    )
  }

  static handleBookmarkEvent(bookmarkMap: ObservableMap<Bookmark>, event: Event) {
    logs.BOOKMARK_LIST.debug('handleBookmarkEvent', event)
    const bookmarkId = event.properties.bookmark_id
    if (event.situation_type === 'system/bookmark_removed') {
      bookmarkMap.delete(bookmarkId)
    } else {
      event._serenity
        .system()
        .then(system => system.getBookmarks({ id: bookmarkId }))
        .then(bookmarks =>
          bookmarks.bookmarks.forEach(bookmark =>
            bookmarkMap.set(bookmark.id, bookmark),
          ),
        )
    }
  }

  @observable time: Date = null
  @observable lockEnabled: boolean = false
  @observable lockStartTime: Date = null
  @observable lockEndTime: Date = null
  @observable editable: boolean = false
  @observable beingEdited: Bookmark = null
  @observable thumbnailSrc: string = null
  private sourceBox: DataSourceBox
  private timeoutID = null

  connect(sourceBox: DataSourceBox) {
    this.sourceBox = sourceBox
  }

  disconnect() {
    this.sourceBox = null
    this.time = null
  }

  @computed
  get isDisplayingBookmark(): boolean {
    return this.time !== null
  }

  @computed
  get id(): string {
    return this.beingEdited ? this.beingEdited.id : null
  }

  clearDisplayingBookmark() {
    this.clearDisplayingBookmarkTimer()
    if (this.isDisplayingBookmark && this.beingEdited === null) {
      return
    }
    this.timeoutID = setTimeout(this.clearDisplayingBookmarkTimeout, 3 * MSECONDS_PER_SECOND)
  }

  clearDisplayingBookmarkTimer() {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID)
      this.timeoutID = null
    }
  }

  clearDisplayingBookmarkTimeout = () => {
    if (this.isDisplayingBookmark && this.editable) {
      return
    }
    this.time = null
    this.lockEnabled = false
    this.lockStartTime = null
    this.lockEndTime = null
    this.editable = false
    this.beingEdited = null
  }

  displayingBookmark(bookmark: Bookmark) {
    if (this.isDisplayingBookmark && (this.editable || this.beingEdited === bookmark)) {
      return
    }
    this.clearDisplayingBookmarkTimer()
    this.thumbnailSrc = null
    this.lockEnabled = bookmark.lock && bookmark.lock.enabled
    if (this.lockEnabled) {
      this.lockStartTime = new Date(bookmark.lock.start_time)
      this.lockEndTime = new Date(bookmark.lock.end_time)
    } else {
      this.lockStartTime = null
      this.lockEndTime = null
    }
    this.editable = false
    this.beingEdited = bookmark
    this.time = new Date(bookmark.time)
    this.thumbnailSrc = null
    this.loadBookmarkThumbnail()
  }

  loadBookmarkThumbnail() {
    if (!this.time) {
      this.thumbnailSrc = null
      return
    }
    this.sourceBox.getThumbnailUrl(this.time).then((result: ThumbnailInterface) => {
      /**
       * What can happen?
       * We can get the url but not be showing any bookmark
       * We can get the url for an old bookmark
       * We can get the url for the current bookmark
       */

      // If we're not displaying a bookmark, clear it and get out
      if (!this.isDisplayingBookmark) {
        this.thumbnailSrc = null
        return
      }
      // If we got a thumbnail for the current bookmark, use it
      if (
        result &&
        result.requestTime &&
        Math.abs(result.requestTime.getTime() - this.time.getTime()) < 100
      ) {
        this.thumbnailSrc = result.url
      }
    })
  }

  creatingBookmark(bookmarkTime: Date) {
    this.clearDisplayingBookmarkTimer()
    this.time = bookmarkTime
    this.lockEnabled = false
    this.lockStartTime = null
    this.lockEndTime = null
    this.editable = true
    this.beingEdited = null
    this.thumbnailSrc = null
    this.loadBookmarkThumbnail()
  }

  getBookmarks(includeInProgressBookmark: boolean) {
    if (includeInProgressBookmark && this.time && !this.beingEdited) {
      const tempBookmark = {
        time: this.time,
        lock: {
          enabled: this.lockEnabled,
          start_time: this.lockStartTime ? this.lockStartTime.toISOString() : '',
          end_time: this.lockEndTime ? this.lockEndTime.toISOString() : '',
        },
      }
      return [tempBookmark, ...this.sourceBox.bookmarks().bookmarks]
    } else if (this.sourceBox.bookmarks()) {
      return this.sourceBox.bookmarks().bookmarks
    }
    return []
  }

  createBookmark(title: string, description: string): Promise<Bookmark> {
    if (this.beingEdited) {
      if (title || description) {
        let patchData: BookmarkEditData = { name: title, description: description }
        this.beingEdited.edit(patchData)
      }
      let lockPatchData: Bookmark_LockEditData = {
        enabled: this.lockEnabled,
        end_time: this.lockEndTime,
        start_time: this.lockStartTime,
      }
      return this.beingEdited.lock.edit(lockPatchData).then(() => this.beingEdited.getSelf())
    } else if (this.lockEnabled && this.sourceBox.bookmarks().postAddLockedBookmark) {
      let newLockedBookmark: NewLockedBookmarkData = {
        data_source_id: this.sourceBox.source.id,
        start_time: this.lockStartTime,
        end_time: this.lockEndTime,
      }
      if (title.length > 0) {
        newLockedBookmark.name = title
      }
      if (description.length > 0) {
        newLockedBookmark.description = description
      }
      return this.sourceBox.bookmarks().postAddLockedBookmark(newLockedBookmark)
    } else if (this.sourceBox.bookmarks().postAddBookmark) {
      let newBookmark: NewBookmarkData = {
        data_source_id: this.sourceBox.source.id,
        time: this.time,
      }
      if (title.length > 0) {
        newBookmark.name = title
      }
      if (description.length > 0) {
        newBookmark.description = description
      }
      return this.sourceBox.bookmarks().postAddBookmark(newBookmark)
    }
  }

  setLockState(lockState: boolean) {
    if (this.lockStartTime === null) {
      const bookmarkTimeInSeconds = Math.floor(this.time.getTime() / MSECONDS_PER_SECOND)
      this.lockStartTime = new Date(MSECONDS_PER_SECOND * (bookmarkTimeInSeconds - 10))
      this.lockEndTime = new Date(MSECONDS_PER_SECOND * (bookmarkTimeInSeconds + 10))
    }
    this.lockEnabled = lockState
  }

  saveBookmark(title: string, description: string) {
    let possibleErrors: Array<BookmarkErrors> = []
    if (this.lockStartTime && this.lockStartTime.getTime() > this.time.getTime()) {
      possibleErrors.push(BookmarkErrors.StartTooLate)
    }
    if (this.lockEndTime && this.lockEndTime.getTime() < this.time.getTime()) {
      possibleErrors.push(BookmarkErrors.EndTooEarly)
    }
    if (possibleErrors.length > 0) {
      return Promise.reject(possibleErrors)
    } else {
      return this.createBookmark(title, description)
        .then(bookmark => {
          // window.appState.bookmarkMap.set(bookmark.id, bookmark)
          this.time = null
        })
        .catch(error => {
          return [BookmarkErrors.FailedToCreate]
        })
    }
  }
}

export enum BookmarkErrors {
  StartTooLate,
  EndTooEarly,
  FailedToCreate,
}
