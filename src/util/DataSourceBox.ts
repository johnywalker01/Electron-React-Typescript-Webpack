import {
  DataSourceSnapshot,
} from '../serenity'
import Serenity from '../serenity'
import {
  Bookmarks,
  DataSource,
  Device,
  PtzController,
  Tag,
} from 'src/serenity/resources'
import ClipStore from '../OpsInterface/VideoCell/Scrubber/clipStore'
import { MSECONDS_PER_MINUTE, MSECONDS_PER_SECOND } from '../util/constants'
import Expirable from './expirable'
import { observable, computed, IObservableArray } from 'mobx'
import ViewCamera from '../OpsInterface/ViewCamera'
import jpegSize = require('jpeg-size')

export interface ThumbnailInterface {
  url: string,
  requestTime: Date,
  imageTime: Date,
}

export class ThumbnailStorageItem implements ThumbnailInterface {
  constructor(
    public url: string,
    public requestTime: Date,
    public imageTime: Date,
    public lastAccessed: Date,
    ) {}

  dispose() {
    window.URL.revokeObjectURL(this.url)
  }
}

export class ThumbnailStorageBox {
  items: Array<ThumbnailStorageItem>

  constructor() {
    this.items = new Array<ThumbnailStorageItem>()
  }

  findThumbnail(requestTime: Date) {
    let storageItem = this.items.find(item => item.requestTime.getTime() === requestTime.getTime())
    if (storageItem) {
      storageItem.lastAccessed = new Date()
    }
    return storageItem
  }

  addRequest(requestTime: Date) {
    let storageItem = new ThumbnailStorageItem(null, requestTime, null, new Date())
    if (this.items.length > 3) {
      let oldestIndex = this.items.reduce<number>((prevIndex, currItem, currIndex) => {
        if (!this.items[prevIndex].requestTime) { return prevIndex }
        return this.items[prevIndex].requestTime.getTime() < currItem.requestTime.getTime() ? prevIndex : currIndex
      } , 0)
      let oldestItem = this.items.splice(oldestIndex, 1, storageItem)[0]
      oldestItem.dispose()
    } else {
      this.items.push(storageItem)
    }
  }

  updateItem(requestTime: Date, url, imageTime) {
    let storageItem = this.findThumbnail(requestTime)
    if (storageItem) {
      storageItem.url = url
      storageItem.imageTime = imageTime
    }
    return storageItem
  }
}

export class DataSourceBox {
  @observable source: DataSource
  serenity: Serenity
  clipStore: ClipStore
  @observable tags: IObservableArray<Tag>
  @observable deviceBase: Expirable<Device>
  @observable snapshotBase: Expirable<DataSourceSnapshot>
  @observable ptzControllerBase: Expirable<PtzController>
  @observable bookmarksBase: Expirable<Bookmarks>
  @observable viewCameras: IObservableArray<ViewCamera>
  thumbnailStore: ThumbnailStorageBox
  @observable eventIds: IObservableArray<string>

  constructor(
    source: DataSource,
    serenity: Serenity,
    clipStore: ClipStore) {
    this.source = source
    this.serenity = serenity
    this.clipStore = clipStore
    this.viewCameras = observable(new Array<ViewCamera>())
    this.tags = observable(new Array<Tag>())
    this.thumbnailStore = new ThumbnailStorageBox()
    this.eventIds = observable([])

    this.deviceBase = new Expirable<Device>(MSECONDS_PER_MINUTE,
      (eDevice: Expirable<Device>) => {
        this.source.getDevice().then((device) => eDevice.store(device))
      }
    )
    this.snapshotBase = new Expirable<DataSourceSnapshot>(MSECONDS_PER_MINUTE,
      (eSnapshotData: Expirable<DataSourceSnapshot>) => {
        this.source.getSnapshot({width: 200}).then((snapshotData) => {
        if (!snapshotData) { return }
        if (this.snapshotBase.item) {
          window.URL.revokeObjectURL(this.snapshotBase.item.src)
        }
        let size = jpegSize(new Uint8Array(snapshotData))
        let blob = new Blob([snapshotData], { type: 'image/jpeg' })
        let snapshot = new DataSourceSnapshot()
        snapshot.src = window.URL.createObjectURL(blob)
        snapshot.height = size.height / (size.width / 100)
        snapshot.width = 100
        eSnapshotData.store(snapshot)
      })
      }
    )
    this.ptzControllerBase = new Expirable<PtzController>(MSECONDS_PER_SECOND * 3,
      (ePtzController: Expirable<PtzController>) => {
        if (!this.source._links['/pelco/rel/ptz_controller']) { return }
        this.source.getPtzController()
          .then((ptzController) => { ePtzController.store(ptzController) })
      }
    )

    this.bookmarksBase = new Expirable<Bookmarks>(MSECONDS_PER_SECOND * 3,
      (eBookmarks: Expirable<Bookmarks>) => {
        this.source._serenity.system()
          .then((system) => { return system.getBookmarks({data_source_id: this.source.id})})
          .then((bookmarks) => {eBookmarks.store(bookmarks)} )
      })
  }

  @computed get device() {
    return this.deviceBase.get()
  }

  @computed get snapshot() {
    return this.snapshotBase.get()
  }

  ptzController() {
    return this.ptzControllerBase.get()
  }

  @computed get endpoint() {
    const mjpegDataInterface = this.source.data_interfaces.find(di => di.protocol === 'mjpeg-pull')
    return mjpegDataInterface._links['/pelco/rel/endpoint']
  }

  @computed get isPtz() {
    return !this.isPanoramic && this.source._links['/pelco/rel/ptz_controller']
  }

  @computed get canPtz() {
    return this.isPtz && this.ptzController() && this.ptzController()._links['/pelco/rel/view_object']
  }

  @computed get canPtzLock() {
    return this.isPtz && this.ptzController() && this.ptzController()._links['/pelco/rel/ptzlock']
  }

  @computed get isPanoramic() {
    return !this.source.data_interfaces.find(di => di.render_type === 'standard')
  }

  @computed get isOnScreen() {
    return this.viewCameras.some(viewCamera => viewCamera.visible)
  }

  updatePtzViewObject(ptzViewObjectData) {
    if (this.ptzController() && this.ptzController()._links['/pelco/rel/view_object']) {
      return this.ptzController().postViewObject(ptzViewObjectData)
    }
  }

  updatePtzLock(locked: boolean) {
    if (this.ptzController() && this.ptzController()._links['/pelco/rel/ptzlock']) {
      return this.ptzController().getPtzlock()
        .then((ptzLock) => {
          return ptzLock.edit({ lock: locked, expire: 900 })
        })
        .then(() => { this.ptzControllerBase.forceExpire() })
    }
  }

  updatePtzZoom(zoom: number) {
    if (this.ptzController() && this.ptzController()._links.edit) {
      return this.ptzController().edit({ z: zoom })
    }
  }

  addViewCamera(viewCamera: ViewCamera): void {
    if (viewCamera && this.viewCameras.indexOf(viewCamera) < 0) {
      this.viewCameras.push(viewCamera)
    }
  }

  removeViewCamera(viewCamera: ViewCamera): void {
    this.viewCameras.remove(viewCamera)
  }

  bookmarks() {
    return this.bookmarksBase.get()
  }

  clearTags() {
    this.tags.clear()
  }

  getThumbnailUrl(requestTime: Date): Promise<ThumbnailInterface> {
    let storedImage = this.thumbnailStore.findThumbnail(requestTime)
    if (storedImage) {
      return Promise.resolve(storedImage)
    }
    let clip = this.clipStore.get(this.source).getClip(requestTime)
    if (clip) {
      this.thumbnailStore.addRequest(requestTime)
      return clip.getSnapshots({
        params: {
          width: 150,
          start_time: requestTime.toISOString(),
          end_time: requestTime.toISOString(),
        },
        headers: { 'Accept': 'multipart/mixed' },
      })
        .then((responsearray: ArrayBuffer) => {
          let multipart = ''
          let buf = new Uint8Array(responsearray, 0, 200)
          for (let i = 0; i < buf.byteLength; i++) {
            multipart += String.fromCharCode(buf[i])
          }
          // console.log(`imageBuffer.length [${imageBuffer.byteLength}]`)
          let boundary = multipart.split('\r\n')[0]
          let responses = multipart.split(boundary)
          let pieces = /(.*)\r\n(.*)\r\n(.*)[\r\n]*([^]*)/.exec(responses[1])
          let imageTime = new Date(pieces[2].split('Time: ')[1])
          let imageStart = multipart.indexOf(pieces[4])
          let blob = new Blob([responsearray.slice(imageStart)], { type: 'image/jpeg' })
          let url = window.URL.createObjectURL(blob)
          let thumbnail = this.thumbnailStore.updateItem(requestTime, url, imageTime)
          return Promise.resolve(thumbnail)
        })
    }
    return Promise.resolve(null)
  }
}
