import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import { Popover } from 'antd'

import messages from './messages'

import palette from 'src/util/palette'
import logs from 'src/util/logs'
import { formatDisplayTime } from 'src/util/EnhancedDate'

import { Bookmark } from 'src/serenity/resources'
import {
  BookmarkFilterModel,
  SortCategory,
} from 'src/OpsInterface/Sidebar/BookmarkFilterModel'
import ViewCamera from 'src/OpsInterface/ViewCamera'
import { HiVisNormalButton, HiVisPrimaryButton } from 'src/components/StandardButtons'
import { FormattedMessage } from 'react-intl'

const HEADER_LOCK_WIDTH = 25
const HEADER_SOURCE_NAME_WIDTH = 80
const HEADER_SOURCE_NUMBER_WIDTH = 130
const LOCK_WIDTH = HEADER_LOCK_WIDTH + 5
const SOURCE_NAME_WIDTH = HEADER_SOURCE_NAME_WIDTH + 15
const SOURCE_NUMBER_WIDTH = HEADER_SOURCE_NUMBER_WIDTH + 15
const TRUNCATE_WIDTHS = [SOURCE_NAME_WIDTH - 10, 0]

@observer
export default class BookmarkList extends React.Component<Props, State> {
  cells: Array<HTMLTableCellElement>

  constructor() {
    super()
    this.cells = []
    this.state = {
      selected: null,
      deleting: false,
      deleteFailed: false,
    }
  }

  render() {
    logs.BOOKMARK_LIST.debug('BookmarkList render()')
    const bookmarks = this.props.model.filteredSourceList

    return (
      <div className={css(styles.wrapper)}>
        <table className={css(styles.table)} id='BookmarkList_table_header'>
          <thead className={css(styles.thead)}>
            <tr className={css(styles.thr)}>
              <th {...this.headerProps(SortCategory.Locked)} style={{ width: HEADER_LOCK_WIDTH }}>
                <div className={css(styles.thLockIcon)} />
              </th>
              <th
                {...this.headerProps(SortCategory.Name)}
                style={{ width: HEADER_SOURCE_NAME_WIDTH }}
              >
                <FormattedMessage {...messages.bookmarkTitle} />
              </th>
              <th
                {...this.headerProps(SortCategory.Time)}
                style={{ width: HEADER_SOURCE_NUMBER_WIDTH }}
              >
                <FormattedMessage {...messages.dateTime} />
              </th>
            </tr>
          </thead>
        </table>
        <div className={css(styles.root)}>
          <table className={css(styles.table)} id='BookmarkList_table'>
            <tbody>
              {bookmarks.map((bookmark, rowIndex) => {
                const highlight = this.props.model.highlightNames(bookmark, TRUNCATE_WIDTHS)
                let popupString = bookmark.name || ''
                if (bookmark.description) {
                  popupString = [popupString, '----------', bookmark.description].join('\n')
                }
                return (
                  <tr
                    id={`BookmarkList_row_${rowIndex}`}
                    key={rowIndex}
                    data-bookmark={bookmark.id}
                    onClick={() => this.selectBookmark(bookmark)}
                    onDoubleClick={() => this.popupBookmark(bookmark)}
                    className={css(
                      styles.tr,
                      bookmark === this.state.selected ? styles.trSelected : null,
                    )}
                  >
                    <td
                      ref={element => {
                        this.cells[rowIndex] = element
                      }}
                      className={bookmark.lock && bookmark.lock.enabled && css(styles.tdLockIcon)}
                      id={`BookmarkList_row_${rowIndex}_lock`}
                      style={{ width: LOCK_WIDTH }}
                    />
                    <td
                      className={css(styles.td)}
                      id={`BookmarkList_row_${rowIndex}_title`}
                      style={{ width: SOURCE_NAME_WIDTH }}
                    >
                      {highlight.title.map((part, spanIndex) =>
                        <span
                          key={`bookmarkTitle-${rowIndex}-${spanIndex}`}
                          className={css(styles.tdMatch)}
                          style={{ width: SOURCE_NAME_WIDTH }}
                          title={popupString}
                        >
                          {part}
                        </span>,
                      )}
                    </td>
                    <td
                      className={css(styles.td)}
                      id={`BookmarkList_row_${rowIndex}_time`}
                      style={{ width: SOURCE_NUMBER_WIDTH }}
                    >
                      {formatDisplayTime(bookmark.time)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div>
          <div style={{ textAlign: 'right', margin: '8px 8px 0' }}>
            <button
              className={css(
                styles.editButton,
                this.state.selected ? styles.editButtonEnabled : null,
              )}
              disabled={!this.state.selected}
              id='BookmarkList_EditButton'
              onClick={() => this.popupBookmark(this.state.selected, true)}
            />
            <Popover
              content={this.deleteConfirm()}
              placement={'top'}
              trigger={'click'}
              arrowPointAtCenter
              visible={this.state.deleting}
            >
              <button
                className={css(
                  styles.deleteButton,
                  this.state.selected ? styles.deleteButtonEnabled : null,
                )}
                disabled={!this.state.selected}
                id='BookmarkList_DeleteButton'
                onClick={() => this.setState({ deleting: true, deleteFailed: false })}
              />
            </Popover>
          </div>
        </div>
      </div>
    )
  }

  headerProps(category: SortCategory) {
    let headerStyles: Array<any> = [styles.th]
    let down = this.props.model.sortDown(category)
    if (category === this.props.model.sortCategory) {
      headerStyles.push(down ? sortStyles.sortingDown : sortStyles.sortingUp)
    } else {
      headerStyles.push(down ? sortStyles.sortingNotDown : sortStyles.sortingNotUp)
    }
    let props = {
      id: `BookmarkList_Header_${SortCategory[category]}`,
      onClick: () => this.props.model.updateSort(category),
      className: css(headerStyles),
    }
    return props
  }

  popupBookmark(bookmark: Bookmark, editable: boolean = false) {
    if (!bookmark) {
      return
    }
    bookmark.getDataSource().then(dataSource => {
      this.props.camera.connect(dataSource.id)
      this.props.camera.bookmarkEngine.displayingBookmark(bookmark)
      this.props.camera.bookmarkEngine.editable = true
    })
  }

  selectBookmark(bookmark: Bookmark) {
    if (this.state.selected) {
      if (this.state.selected === bookmark) {
        bookmark = null
      }
    }
    this.setState({ selected: bookmark })
  }

  deleteSelectedBookmark = () => {
    this.state.selected
      .delete()
      .then(() => this.setState({ deleting: false }))
      .catch(() => this.setState({ deleteFailed: true }))
  }

  deleteConfirm() {
    return (
      <div>
        <FormattedMessage {...messages.confirm} />
        <hr style={{ margin: '10px 0' }} />
        {
          // this.renderError(BookmarkErrors.FailedToCreate)
        }
        <div style={{ textAlign: 'right' }}>
          <HiVisNormalButton
            id={'BookmarkList_DeleteCancelButton'}
            onClick={() => this.setState({ deleting: false, deleteFailed: false })}
            valueMessage={messages.cancel}
            style={{ marginRight: 5 }}
          />
          <HiVisPrimaryButton
            id={'BookmarkList_DeleteConfirmButton'}
            onClick={this.deleteSelectedBookmark}
            valueMessage={messages.delete}
            style={{ marginRight: 5 }}
          />
        </div>
      </div>
    )
  }
}

interface Props {
  model: BookmarkFilterModel
  camera: ViewCamera
}
interface State {
  selected: Bookmark
  deleting: boolean
  deleteFailed: boolean
}

const sortStyles = StyleSheet.create({
  sortingDown: {
    backgroundImage: `url(${require(`../../../resources/triangle-dn-6x4-active_c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-dn-6x4-a.png`)})`,
    },
  },
  sortingUp: {
    backgroundImage: `url(${require(`../../../resources/triangle-up-6x4-active_c1.png`)})`,
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-up-6x4-a.png`)})`,
    },
  },
  sortingNotDown: {
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-dn-6x4-b1.png`)})`,
    },
  },
  sortingNotUp: {
    ':hover': {
      backgroundImage: `url(${require(`../../../resources/triangle-up-6x4-b1.png`)})`,
    },
  },
})

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  root: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
  table: {
    color: palette.c3,
    fontSize: 14,
    backgroundColor: palette.defaultBorderColor,
    borderCollapse: 'collapse',
    width: '100%',
  },
  thead: {},
  thr: {
    borderBottom: `1px solid ${palette.d3}`,
    backgroundColor: palette.d5,
    height: 18,
  },
  th: {
    textAlign: 'left',
    fontWeight: 'normal',
    borderRight: `1px solid ${palette.darkerBackgroundColor}`,
    paddingLeft: 5,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top 8px right 8px',
    ':last-child': {
      borderRight: 'none',
    },
  },
  tbody: {},
  tr: {
    borderTop: `1px solid ${palette.slightlyDarkerBackgroundColor}`,
    borderBottom: `1px solid ${palette.darkerBackgroundColor}`,
    backgroundColor: palette.defaultBackgroundColor,
    color: palette.defaultTextColor,
    ':hover td': {
      backgroundColor: palette.d5,
    },
  },
  trSelected: {
    backgroundColor: palette.active_b1,
    ':hover td': {
      backgroundColor: palette.active_a,
    },
  },
  thLockIcon: {
    ...palette.backgroundImage(require(`resources/locked-12x14-b1.png`)),
    width: 12,
    height: 14,
  },
  tdLockIcon: {
    ...palette.backgroundImage(require(`resources/locked-12x14-b1.png`), '5px center'),
    ':hover': {
      ...palette.backgroundImage(require(`resources/locked-12x14-active_a.png`), '5px center'),
    },
  },
  td: {
    cursor: 'pointer',
    padding: 5,
    textAlign: 'left',
  },
  tdMatch: {
    ':nth-child(even)': {
      color: palette.b5,
    },
  },
  editButton: {
    border: 'none',
    cursor: 'pointer',
    height: 20,
    marginLeft: 8,
    marginRight: 'auto',
    width: 20,
    ...palette.backgroundImage(require(`resources/edit-14x14-c1.png`)),
  },
  editButtonEnabled: {
    ...palette.backgroundImage(require(`resources/edit-14x14-b1.png`)),
    ':hover': {
      ...palette.backgroundImage(require(`resources/edit-14x14-a.png`)),
    },
    ':active': {
      ...palette.backgroundImage(require(`resources/edit-14x14-active_a.png`)),
    },
  },
  deleteButton: {
    border: 'none',
    cursor: 'pointer',
    height: 20,
    marginLeft: 8,
    marginRight: 'auto',
    width: 20,
    ...palette.backgroundImage(require(`resources/trash-14x16-c1.png`)),
  },
  deleteButtonEnabled: {
    ...palette.backgroundImage(require(`resources/trash-14x16-b1.png`)),
    ':hover': {
      ...palette.backgroundImage(require(`resources/trash-14x16-a.png`)),
    },
    ':active': {
      ...palette.backgroundImage(require(`resources/trash-14x16-alert_a.png`)),
    },
  },
})
