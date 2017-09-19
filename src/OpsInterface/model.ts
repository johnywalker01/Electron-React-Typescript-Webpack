import { observable, IObservableArray, computed, ObservableMap, autorun } from 'mobx'
import ViewCamera from './ViewCamera'
import { DataSourceBox } from '../util/DataSourceBox'

export class ViewsTabState {
  @observable selectedIndex = 0
  @observable tabs: IObservableArray<ViewTab>
  @observable dataSourceMap: ObservableMap<DataSourceBox>

  constructor(args: {dataSourceMap: ObservableMap<DataSourceBox>}) {
    this.dataSourceMap = args.dataSourceMap
    this.selectedIndex = 0
    this.tabs = observable([])
  }

  selected() {
    return this.tabs[this.selectedIndex]
  }

  select(index: number) {
    if (this.selectedIndex === index) {return}
    if (index < 0 || index >= this.tabs.length) {
      throw new Error(`Invalid tab index: ${index}`)
    }

    // Set the old ViewTab to hidden, and the new ViewTab to visible.
    this.selected().setVisible(false)
    this.selectedIndex = index
    this.selected().setVisible(true)
  }

  close(index: number) {
    if (index < 0 || index >= this.tabs.length) {
      throw new Error(`Invalid tab index: ${index}`)
    }

    this.tabs[index].disconnect()
    this.tabs.remove(this.tabs[index])
    if (index < this.selectedIndex) {
      // Closed a tab to the left.
      // Number changes, but actual tab doesn't.
      this.selectedIndex = this.selectedIndex - 1
    } else if (index === this.selectedIndex) {
      // Closed the current tab. 
      // Select the one at the current position (if it exists) or the last one.
      this.selectedIndex = Math.min(index, this.tabs.length - 1)
      this.selected().setVisible(true)
    } else {
      // Closed a tab to the right. Do nothing
    }
  }

  addTab(name: string, layout: Layout) {
    this.tabs.push(new ViewTab({container: this, name: name, layout: layout}))
  }

  logout() {
    this.selected().disconnect()
  }

  viewDataSource(dataSourceId: string) {
    this.selected().viewDataSource(dataSourceId)
  }
}

export class ViewTab {
  @observable layout: Layout
  @observable cameras: Array<ViewCamera>
  @observable visible: boolean
  container: ViewsTabState
  @computed get tabNumber() {
    return this.container.tabs.indexOf(this) + 1
  }

  @computed get fullScreen(): number {
    let numVisible = parseInt(this.layout[0], 10) * parseInt(this.layout[2], 10)
    for (let i = 0; i < numVisible; i++) {
      if (this.cameras[i].isFullScreen) {return i}
    }
    return null
  }

  @computed get creatingBookmark(): ViewCamera {
    return this.cameras.find(camera => camera.bookmarkEngine.isDisplayingBookmark && camera.visible)
  }

  constructor(args: {container: ViewsTabState, name: string, layout: Layout}) {
    this.visible = false
    this.container = args.container
    this.layout = args.layout
    this.cameras = new Array()
    for (let i = 0; i < MAX_CELLS; i++) {
      this.cameras.push(new ViewCamera(this.container.dataSourceMap))
    }
    autorun(this.setVisibleInternal)
  }

  setVisible(visible) {
    this.visible = visible
  }

  setVisibleInternal = () => {
    if (this.visible) {
      if (this.fullScreen === null) {
        let numVisible = parseInt(this.layout[0], 10) * parseInt(this.layout[2], 10)
        this.cameras.forEach((camera, index) => camera.setVisible(index < numVisible))
      } else {
        let visibleCamera = this.cameras[this.fullScreen]
        this.cameras.forEach((camera) => camera.setVisible(camera === visibleCamera))
      }
    } else {
      this.cameras.forEach((camera) => camera.setVisible(false))
    }
  }

  disconnect() {
    this.visible = false
    this.cameras.forEach((camera) => camera.disconnect())
  }

  viewDataSource(dataSourceId: string) {
    // select the first empty cell
    let visibleCamera = this.cameras.find(camera => camera.visible && !camera.connected)
    // if no cells are empty, select the tirst cell
    if (!visibleCamera) {
       visibleCamera = this.cameras.find(camera => camera.visible)
    }
    if (visibleCamera) {
      visibleCamera.connect(dataSourceId)
    }
  }
}

export type Layout = '1x1' | '2x2' | '3x3' | '4x4' | '1x2' | '2x1'
export const MAX_CELLS = 16
