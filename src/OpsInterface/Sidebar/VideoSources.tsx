import SourceList from './SourceList'
import * as React from 'react'
import { Collapse, Popover, AutoComplete } from 'antd'
import CollapsibleBox from '../../components/CollapsibleBox'
import TagButton from '../../components/TagButton'
import { InjectedIntl, FormattedMessage, injectIntl } from 'react-intl'
import messages from './messages'
import { observer } from 'mobx-react'
import FilterDropdown from './FilterDropdown'
import { ViewsTabState } from '../model'
import { SourceFilterModel, FILTER_TYPES, SourceFilterStringItem, SourceFilterTagArrayItem } from './SourceFilterModel'
import { StyleSheet, css } from 'aphrodite/no-important'
import palette from '../../util/palette'
import AppState from '../../AppState'
import { EventListPopup } from './Events/EventListPopup'

import ComponentConstructor = ReactIntl.ComponentConstructor
import InjectedIntlProps = ReactIntl.InjectedIntlProps
import BookmarkList from './BookmarkList'
import {
  BookmarkFilterModel,
  BookmarkFilterStringItem,
  BookmarkFilterBooleanItem,
  BookmarkFilterDateItem,
} from './BookmarkFilterModel'
import ViewCamera from 'src/OpsInterface/ViewCamera'
import BookmarkPopup from '../BookmarkPopup'
import DateTimePicker from 'src/components/DateTimePicker'

const Panel = Collapse.Panel
const VIDEO_SOURCE_PANEL_KEY = '1'
const BOOKMARK_PANEL_KEY = '2'
const PANEL_SPACING = 96
const BOOKMARK_PANEL_SPACING = 28

class VideoSourcesProps {
  appState: AppState
  viewsTabState: ViewsTabState
}

interface State {
  sourceListModel: SourceFilterModel,
  bookmarkListModel: BookmarkFilterModel,
  camera: ViewCamera
  keys: Array<string>
  isEditingTag: boolean
}

@observer
export default class VideoSources extends React.Component<VideoSourcesProps, State> {
  collapsePanel: Collapse

  constructor(props) {
    super(props)
    this.state = {
      sourceListModel: new SourceFilterModel(this.props.appState.dataSourceMap),
      bookmarkListModel: new BookmarkFilterModel(this.props.appState.bookmarkMap),
      camera: new ViewCamera(this.props.appState.dataSourceMap),
      keys: [VIDEO_SOURCE_PANEL_KEY],
      isEditingTag: false,
    }
  }

  handleCollapseOnChange = keys => {
    this.setState({keys: keys})
  }

  render() {
    const { sourceListModel, bookmarkListModel, camera, isEditingTag } = this.state
    const { viewsTabState } = this.props
    let videoSourcePanelHeight: string = null
    let bookmarkPanelHeight: string = null
    const tagFilter = this.state.sourceListModel.filters[FILTER_TYPES.TAG] as SourceFilterTagArrayItem

    if (this.collapsePanel && this.state.keys) {
      const openPanels = this.state.keys.length
      const isVideoSourceOpen = this.state.keys.some(key => { return key === VIDEO_SOURCE_PANEL_KEY })
      const isBookmarkPanelOpen = this.state.keys.some(key => { return key === BOOKMARK_PANEL_KEY })

      videoSourcePanelHeight = isVideoSourceOpen
        ? `calc(${100 / openPanels}vh - ${PANEL_SPACING / openPanels}px)` : null
      bookmarkPanelHeight = isBookmarkPanelOpen
        ? `calc(${100 / openPanels}vh - ${isBookmarkPanelOpen && isVideoSourceOpen 
          ? BOOKMARK_PANEL_SPACING : PANEL_SPACING / openPanels}px)` : null
    }

    const nameIdSourceFilter = this.state.sourceListModel.filters[FILTER_TYPES.NAME_OR_ID] as SourceFilterStringItem
    const titleBookmarkFilter = this.state.bookmarkListModel.filters[3] as BookmarkFilterStringItem

    const lockedBookmarkFilter = bookmarkListModel.filters[0] as BookmarkFilterBooleanItem
    const fromBookmarkFilter = bookmarkListModel.filters[1] as BookmarkFilterDateItem
    const toBookmarkFilter = bookmarkListModel.filters[2] as BookmarkFilterDateItem
    const popupContent: JSX.Element =
      camera.bookmarkEngine.isDisplayingBookmark &&
      <BookmarkPopup camera={camera} bookmarkId={camera.bookmarkEngine.id} />

    let numEvents = this.props.appState.eventListPopupEngine.orderedUnsnoozedEventCellEngines.length

    return (
          <Popover
            content={popupContent}
            placement={'left'}
            visible={camera.bookmarkEngine.isDisplayingBookmark}
          >
      <div className={css(styles.container) + ' videoSourcesAntd'}>
        <Collapse
          defaultActiveKey={[VIDEO_SOURCE_PANEL_KEY]}
          onChange={this.handleCollapseOnChange}
          ref={(element) => { this.collapsePanel = element }}>
          <Panel
            key={VIDEO_SOURCE_PANEL_KEY}
            style={{height: videoSourcePanelHeight, position: 'relative'}}
            header={
              <div>
                <FormattedMessage { ...messages.videoSources } />
                <button id='VideoSources_refresh'
                  onClick={this.props.appState.updateDataSources}
                  className={css(styles.refreshButton)} />
              </div>} >
            <div className={css(styles.filterCollapsibleBox)}>
              <CollapsibleBox id='VideoSources_filter_CollapsibleBox'
                label={sourceListModel.renderFilterLabel('VideoSources')} isOpen={false} parentBgColor='d1'>
                <div style={{padding: 7, backgroundColor: palette.d3}}>
                  <SourceFilterInput filterItem={nameIdSourceFilter} />
                  <CollapsibleBox id='VideoSources_filter_more_CollapsibleBox' parentBgColor='d1'
                    label={<span className={css(styles.clickable)}
                    ><FormattedMessage { ...messages.moreOptions } /></span>}
                    isOpen={false}>
                    <div className={css(styles.padding, styles.moreOptions)}>
                      <div style={{marginBottom: 10}}>
                        <div style={{backgroundColor: palette.d5, textAlign: 'center', clear: 'both'}}>
                          <FormattedMessage {...messages.tags} />
                          <a id='VideoSources_filter_clear_tags'
                            className={css(styles.clickable, styles.clearAllLink)}
                            onClick={(event) => {
                              event.stopPropagation()
                              sourceListModel.clearTagFilters()
                              this.setState({ isEditingTag: false })
                            }}>
                            <FormattedMessage {...messages.clear} />
                          </a>
                        </div>
                        <div className={css(styles.tagsContainer)}>
                          {tagFilter.state.map(tag =>
                            <TagButton key={`TagButton ${tag.id}`} tag={tag} close={tagFilter.removeTag} />
                          )}
                          <AutoComplete
                            value={tagFilter.searchValue}
                            style={{ borderRadius: 3, display: isEditingTag ? 'inline-block' : 'none' }}
                            onSearch={(value) => tagFilter.handleOnSearch(value, this.props.appState.tags)}
                            dataSource={tagFilter.searchDataSource}
                            onSelect={(tagName) => {
                              tagFilter.addTag(this.props.appState.tags.find(tag => tag.name === tagName))
                              tagFilter.handleOnSearch('', this.props.appState.tags)
                              this.setState({ isEditingTag: false })
                            }} >
                            <input
                              style={{
                                width: 36 + 8 * tagFilter.searchValue.length,
                                backgroundColor: palette.b3,
                                border: `1px inset ${palette.d0}`,
                                fontSize: 12,
                                borderRadius: 4,
                                height: 20,
                                lineHeight: 20,
                                padding: '2px 0',
                                textAlign: 'center',
                              }}
                              onBlur={(event) => {
                                this.setState({ isEditingTag: false })
                                tagFilter.searchValue = ''
                              }}
                              onKeyUp={(event) => {
                                if (event.keyCode === 27) {
                                  this.setState({ isEditingTag: false })
                                  tagFilter.searchValue = ''
                                }
                              }} />
                          </AutoComplete>
                          <a className={css(styles.addATag)}
                            style={{ display: isEditingTag ? 'none' : 'inline-block' }}
                            onClick={e => this.setState({ isEditingTag: true })}>
                            <FormattedMessage {...messages.addATag} />
                          </a>
                        </div>
                      </div>
                      <FilterDropdown id='VideoSources_filter_online'
                        {...sourceListModel.getProps(FILTER_TYPES.ONLINE) } />
                      <FilterDropdown id='VideoSources_filter_recording'
                        {...sourceListModel.getProps(FILTER_TYPES.RECORDING) } />
                      <FilterDropdown id='VideoSources_filter_onScreen'
                        {...sourceListModel.getProps(FILTER_TYPES.ON_SCREEN) } />
                    </div>
                  </CollapsibleBox>
                </div>
              </CollapsibleBox>
            </div>
            <SourceList
              model={sourceListModel}
              viewDataSource={(dataSourceId: string) => viewsTabState.viewDataSource(dataSourceId)}
            />
          </Panel>
          <Panel
            key={BOOKMARK_PANEL_KEY}
            style={{height: bookmarkPanelHeight, position: 'relative'}}
            header={
              <div>
                <FormattedMessage { ...messages.bookmarks } />
                <button id='Bookmarks_refresh'
                  onClick={this.props.appState.updateBookmarks}
                  className={css(styles.refreshButton)} />
              </div>} >
            <div className={css(styles.filterCollapsibleBox)}>
              <CollapsibleBox id='Bookmarks_filter_CollapsibleBox'
                label={bookmarkListModel.renderFilterLabel('Bookmarks')} isOpen={false} parentBgColor='d1'>
                <div style={{padding: 7, backgroundColor: palette.d3}}>
                  <BookmarkFilterInput filterItem={titleBookmarkFilter} />
                  <CollapsibleBox id='Bookmarks_filter_more_CollapsibleBox' parentBgColor='d1'
                    label={<span className={css(styles.clickable)}
                      ><FormattedMessage { ...messages.moreOptions } /></span>}
                    isOpen={false}>
                    <div className={css(styles.padding, styles.moreOptions)}>
                    <input
              type={'checkbox'}
              id={'Bookmarks_filter_onlyLocked'}
              checked={!!lockedBookmarkFilter.state}
              onChange={(event: React.SyntheticEvent<HTMLInputElement>) => {
                lockedBookmarkFilter.handleStateChange(event.currentTarget.checked ? true : null) }}
              style={{ marginRight: 5, marginBottom: 10 }}
            />
            <FormattedMessage { ...messages.showOnlyLockedBookmarks } />
                    <div style={{marginBottom: -5}}><FormattedMessage { ...messages.from } />: <DateTimePicker
                      defaultValue={fromBookmarkFilter.state}
                      idPrefix={'Bookmarks_filter_from'}
                      onChange={(date) => fromBookmarkFilter.state = date}
                      errorMessage={null}
                      allowClear={true}
                      rangeBorder={'start'}
                      /></div>
                    <div><FormattedMessage { ...messages.to } />: <DateTimePicker
                      defaultValue={toBookmarkFilter.state}
                      idPrefix={'Bookmarks_filter_to'}
                      onChange={(date) => toBookmarkFilter.state = date}
                      errorMessage={null}
                      allowClear={true}
                      rangeBorder={'end'}
                      /></div>
                      </div>
                  </CollapsibleBox>
                </div>
              </CollapsibleBox>
            </div>
            <BookmarkList model={bookmarkListModel} camera={camera}/>
          </Panel>
        </Collapse>
        <div className={css(styles.eventBox)}>
          <span onClick={this.handleEventPopupClick}
            className={css(styles.eventsBadge, (numEvents > 0) && styles.eventsBadgeAlert )}>
            {numEvents}
          </span>
          <EventListPopup
            eventListPopupEngine={this.props.appState.eventListPopupEngine}
            situationsEngine={this.props.appState.situationsEngine} />
        </div>
      </div>
      </Popover>
    )
  }

  handleEventPopupClick = (event: React.MouseEvent<any>) => {
    this.props.appState.eventListPopupEngine.toggleOpen()
  }
}

interface FilterInputProps<T> {
  filterItem: T
  intl?: InjectedIntl
}

type SourceFilterInputProps = FilterInputProps<SourceFilterStringItem>
type SourceFilterInputIntlProps = SourceFilterInputProps & InjectedIntlProps

// tslint:disable-next-line:variable-name
const _SourceFilterInput = observer(function (props: SourceFilterInputProps) {
  return <input id='VideoSources_SourceFilterInput' className={css(styles.input)}
                value={props.filterItem.state || ''}
                placeholder={props.intl.formatMessage(messages.byNameOrID)}
                onChange={event => props.filterItem.handleStateChange(event.currentTarget.value)}
  />
})
const SourceFilterInput = injectIntl(_SourceFilterInput as ComponentConstructor<SourceFilterInputIntlProps>)

type BookmarkFilterInputProps = FilterInputProps<BookmarkFilterStringItem>
type BookmarkFilterInputIntlProps = BookmarkFilterInputProps & InjectedIntlProps

// tslint:disable-next-line:variable-name
const _BookmarkFilterInput = observer(function (props: BookmarkFilterInputProps) {
  return <input id='VideoSources_BookmarkFilterInput' className={css(styles.input)}
                value={props.filterItem.state || ''}
                placeholder={props.intl.formatMessage(messages.byTitleOrDescription)}
                onChange={event => props.filterItem.handleStateChange(event.currentTarget.value)}
  />
})
const BookmarkFilterInput = injectIntl(_BookmarkFilterInput as ComponentConstructor<BookmarkFilterInputIntlProps>)

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingRight: 8,
    width: '100%',
  },
  videoSources: {
    backgroundColor: palette.d4,
    border: `1px solid ${palette.d5}`,
    flexShrink: 0,
    paddingLeft: 7,
    marginBottom: 7,
  },
  filterCollapsibleBox: {
    flexShrink: 0,
    marginBottom: 7,
  },
  input: {
    backgroundColor: palette.d2,
    border: '1px solid',
    borderColor: palette.d1,
    color: palette.a,
    display: 'block',
    height: 24,
    padding: '0 8px',
    marginBottom: 10,
    width: '100%',
    ':focus': {
      borderColor: palette.active_a,
    },
    '::selection': {
      background: palette.mode1_a,
    },
  },
  padding: {
    padding: '7px 7px 0',
  },
  moreOptions: {
    backgroundColor: palette.d4,
    border: `1px solid ${palette.d2}`,
    borderTop: 'none',
    color: palette.b1,
    marginBottom: 7,
    paddingBottom: 0,
    textAlign: 'right',
  },
  refreshButton: {
    float: 'right',
    marginTop: -3,
    marginRight: 12,
    height: 12,
    width: 12,
    border: 'none',
    cursor: 'pointer',
    background: `url(${require('../../../resources/refresh-12x12-b1.png')})`,
    ':hover': {
      backgroundImage: `url(${require('../../../resources/refresh-12x12-a.png')})`,
    },
    ':active': {
      backgroundImage: `url(${require('../../../resources/refresh-12x12-active_a.png')})`,
    },
    backgroundRepeat: 'no-repeat',
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
  tagsContainer: {
    backgroundColor: palette.d3,
    maxHeight: 94,
    overflow: 'auto',
    padding: '0 4px',
    textAlign: 'left',
    width: '100%',
  },
  addATag: {
    color: palette.active_a,
    marginLeft: 5,
    padding: '5px 0 5px',
    ':hover': {
      color: palette.a,
    },
  },
  eventBox: {
    flexShrink: 0,
    marginBottom: 7,
    marginTop: 0,
    padding: '2px 0px 2px 7px',
    textAlign: 'right',
    background: `url(${require('../../../resources/pelco-vx-lockup-162x18-c1.png')}) 10px 4px no-repeat`,
  },
  eventsBadge: {
    backgroundColor: palette.d0,
    color: palette.a,
    cursor: 'pointer',
    display: 'inline-block',
    padding: '0 2px',
    position: 'relative',
    marginRight: 18,
    '::before': {
      content: '""',
      backgroundColor: 'transparent',
      borderBottom: '9px solid transparent',
      borderRight: `6px solid ${palette.d0}`,
      borderTop: '9px solid transparent',
      left: -6,
      height: 0,
      position: 'absolute',
      right: 15,
      width: 0,
    },
    '::after': {
      content: '""',
      backgroundColor: 'transparent',
      borderBottom: '9px solid transparent',
      borderLeft: `6px solid ${palette.d0}`,
      borderTop: '9px solid transparent',
      height: 0,
      position: 'absolute',
      right: -6,
      width: 0,
    },
  },
  eventsBadgeAlert: {
    backgroundColor: palette.alert_a,
    '::before': {
      borderRight: `6px solid ${palette.alert_a}`,
    },
    '::after': {
      borderLeft: `6px solid ${palette.alert_a}`,
    },
  },
})
