import * as React from 'react'
import { observer } from 'mobx-react'
import { StyleSheet, css } from 'aphrodite/no-important'
import { FormattedMessage } from 'react-intl'

import messages from './messages'
import ViewCamera from './ViewCamera'

import { Link } from 'src/components/StandardLinks'
import { HiVisNormalButton, HiVisPrimaryButton } from 'src/components/StandardButtons'
import palette from 'src/util/palette'
import DateTimePicker from 'src/components/DateTimePicker'
import { BookmarkErrors } from 'src/util/BookmarkEngine'
import { formatDisplayTime } from 'src/util/EnhancedDate'

@observer
export default class BookmarkPopup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    const { bookmarkId } = props
    const { bookmarkEngine } = props.camera
    this.state = {
      title: bookmarkId ? bookmarkEngine.beingEdited.name : '',
      description: bookmarkId ? bookmarkEngine.beingEdited.description : '',
      errors: [],
    }
  }

  render() {
    const { camera } = this.props
    const { bookmarkEngine } = this.props.camera
    const isCreating = bookmarkEngine.id === null
    if (!bookmarkEngine.editable) {
      return this.renderReadOnly()
    }
    return (
      <div className={css(styles.container)}>
        <div className={css(styles.header)}>
          <FormattedMessage
            {...(isCreating ? messages.createBookmarkFor : messages.editBookmarkFor)}
          />
        </div>
        <div className={css(styles.subHeader)} style={{color: palette.active_a}}>
          {camera.name}
        </div>
        <div id={'BookmarkPopup_Camera'} className={css(styles.subHeader)}>
          {formatDisplayTime(bookmarkEngine.time, true)}
        </div>
        <hr className={css(styles.hr)} />
        <div style={{ marginTop: 10 }}>Title:</div>
        <div>
          <input
            id={'BookmarkPopup_Title'}
            maxLength={64}
            className={css(styles.input)}
            value={this.state.title || ''}
            onChange={event => this.setState({ title: event.currentTarget.value })}
          />
        </div>
        <div>
        <div>Notes:</div>
          <textarea
            id={'BookmarkPopup_Description'}
            className={css(styles.input, styles.textarea)}
            value={this.state.description || ''}
            placeholder={'max 255 characters'}
            maxLength={255}
            onChange={event => this.setState({ description: event.currentTarget.value })}
          />
        </div>
        <div className={css(camera.canCreateLockedBookmarks ? null : styles.hidden)}>
          <label>
            <input
              type={'checkbox'}
              id={'BookmarkPopup_LockEnabled'}
              checked={bookmarkEngine.lockEnabled}
              onChange={this.handleLockChanged}
              style={{ marginRight: 5 }}
            />
            <FormattedMessage {...messages.lockAdjacentRecordings} />
          </label>
          {bookmarkEngine.lockEnabled
            ? <div id={'BookmarkPopup_LockIcon'} className={css(styles.lockIcon)} />
            : null}
        </div>
        {bookmarkEngine.lockEnabled &&
          <div>
            <div style={{ textAlign: 'left', marginTop: 6, marginLeft: 20 }}>
              <div className={css(styles.timeIcon, styles.timeStartIcon)} />
              <span id={'BookmarkPopup_LockStartTime'}>
                <DateTimePicker
                  idPrefix={'BookmarkPopup_LockStart'}
                  defaultValue={bookmarkEngine.lockStartTime}
                  onChange={this.handleNewStartTimeChanged}
                  errorMessage={this.errorMessage(BookmarkErrors.StartTooLate)}
                  hiVis={true}
                  allowClear={false}
                  rangeBorder={'start'}
                />
              </span>
            </div>
            <div style={{ textAlign: 'left', marginLeft: 20 }}>
              <div className={css(styles.timeIcon, styles.timeStopIcon)} />
              <span id={'BookmarkPopup_LockEndTime'}>
                <DateTimePicker
                  idPrefix={'BookmarkPopup_LockEnd'}
                  defaultValue={bookmarkEngine.lockEndTime}
                  onChange={this.handleNewEndTimeChanged}
                  errorMessage={this.errorMessage(BookmarkErrors.EndTooEarly)}
                  hiVis={true}
                  allowClear={false}
                  rangeBorder={'end'}
                />
              </span>
            </div>
          </div>}
        {this.renderThumbnail('BookmarkPopup_LockThumbnail')}
        <hr style={{ margin: '10px 0' }} />
        {this.renderError(BookmarkErrors.FailedToCreate)}
        <div style={{ textAlign: 'right' }}>
          <HiVisNormalButton
            id={'BookmarkPopup_CancelButton'}
            onClick={this.handleCancel}
            valueMessage={messages.cancel}
            style={{ marginRight: 5 }}
          />
          <HiVisPrimaryButton
            id={'BookmarkPopup_SaveButton'}
            onClick={this.handleSave}
            valueMessage={messages.save}
            style={{ marginRight: 5 }}
          />
        </div>
      </div>
    )
  }

  renderReadOnly() {
    const { camera } = this.props
    const { bookmarkEngine } = camera
    const bookmark = camera.bookmarkEngine.beingEdited
    return (
      <div className={css(styles.container)}>
        {bookmark.name
          ? <h1 className={css(styles.header)}>
              <span id={'BookmarkPopup_ViewTitle'}>
                {bookmark.name}
              </span>
            </h1>
          : null}
        <div className={css(styles.subHeader)}>
          <div id={'BookmarkPopup_ViewCamera'}>
            {camera.name}
          </div>
          <div id={'BookmarkPopup_ViewTime'}>
            {formatDisplayTime(bookmarkEngine.time, true)}
          </div>
        </div>
        <hr className={css(styles.hr)} />

        {bookmark.description && bookmark.description.length > 0
          ? <div
              id={'BookmarkPopup_ViewDescription'}
              style={{ fontStyle: 'italic', margin: '10px 0', whiteSpace: 'pre-wrap' }}
            >
              {bookmark.description}
            </div>
          : null}
        <hr />
        {bookmark.lock && bookmark.lock.enabled
          ? <div>
              <div style={{ fontWeight: 'bold', marginTop: 10 }}>
                <FormattedMessage {...messages.adjacentRecordingsLocked} />
                <div id={'BookmarkPopup_ViewLockIcon'} className={css(styles.lockIcon)} />
              </div>
              <div className={css(styles.readOnlyDateContainer)}>
                <div>
                  <div
                    id={'BookmarkPopup_ViewLockStartTime'}
                    className={css(styles.timeIcon, styles.timeStartIcon)}
                  />
                  {formatDisplayTime(new Date(bookmark.lock.start_time), true)}
                </div>
                <div>
                  <div
                    id={'BookmarkPopup_ViewLockEndTime'}
                    className={css(styles.timeIcon, styles.timeStopIcon)}
                  />
                  {formatDisplayTime(new Date(bookmark.lock.end_time), true)}
                </div>
              </div>
            </div>
          : null}
        {this.renderThumbnail('BookmarkPopup_ViewLockThumbnail')}
        <Link
          id={'BookmarkPopup_EditLink'}
          onClick={() => (bookmarkEngine.editable = true)}
          style={{ display: 'block', marginTop: '-10px', textAlign: 'right' }}
        >
          <FormattedMessage {...messages.edit} />
        </Link>
      </div>
    )
  }

  renderThumbnail(id: string) {
    const { camera } = this.props
    const src = camera.bookmarkEngine.thumbnailSrc
    return src
      ? <div className={css(styles.thumbnailSrc)}>
          <img id={id} src={src} />
        </div>
      : null
  }

  renderError(possibleError: BookmarkErrors) {
    const msg = this.errorMessage(possibleError)
    return msg
      ? <span className={css(styles.errorMessage)} id={msg.id}>
          <FormattedMessage {...msg} />
        </span>
      : null
  }

  errorMessage(possibleError: BookmarkErrors) {
    if (this.state.errors.some(error => error === possibleError)) {
      switch (possibleError) {
        default:
        case BookmarkErrors.FailedToCreate:
          return messages.bookmarkFailedToCreate
        case BookmarkErrors.StartTooLate:
          return messages.bookmarkStartTooLate
        case BookmarkErrors.EndTooEarly:
          return messages.bookmarkEndTooEarly
      }
    }
    return null
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.bookmarkId !== this.props.bookmarkId) {
      const { camera, bookmarkId } = newProps
      this.setState({
        title: bookmarkId ? camera.bookmarkEngine.beingEdited.name : '',
        description: bookmarkId ? camera.bookmarkEngine.beingEdited.description : '',
      })
    }
  }

  handleCancel = () => this.props.camera.bookmarkEngine.creatingBookmark(null)

  handleSave = () => {
    const { bookmarkEngine } = this.props.camera
    bookmarkEngine
      .saveBookmark(this.state.title, this.state.description)
      .catch((possibleErrors: Array<BookmarkErrors>) => {
        this.setState({ errors: possibleErrors })
      })

  }

  handleLockChanged = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.camera.bookmarkEngine.setLockState(event.currentTarget.checked)
  }

  handleNewStartTimeChanged = (newDate: Date) => {
    this.props.camera.bookmarkEngine.lockStartTime = newDate
  }

  handleNewEndTimeChanged = (newDate: Date) => {
    this.props.camera.bookmarkEngine.lockEndTime = newDate
  }
}

interface Props {
  camera: ViewCamera
  bookmarkId: string
}

interface State {
  title: string
  description: string
  errors: Array<BookmarkErrors>
}

const styles = StyleSheet.create({
  container: {
    width: 360,
    fontSize: 14,
  },
  header: {
    color: palette.c1,
    lineHeight: '0px',
    margin: '5px 0 8px 0',
    wordWrap: 'break-word',
    fontWeight: 'bold',
  },
  subHeader: {
    color: palette.d3,
    wordWrap: 'break-word',
    fontSize: 14,
  },
  hr: {
    borderStyle: 'none',
    height: '4px',
    background: palette.c1,
  },
  input: {
    backgroundColor: palette.b5,
    border: '1px solid',
    borderColor: palette.d1,
    color: palette.c1,
    display: 'block',
    height: 24,
    padding: '3px 8px',
    marginBottom: 10,
    width: '100%',
    ':focus': {
      borderColor: palette.active_a,
    },
    '::selection': {
      background: palette.mode1_a,
    },
    '::placeholder': {
      color: palette.b3,
      fontStyle: 'italic',
    },
  },
  textarea: {
    backgroundColor: palette.b5,
    height: 50,
    resize: 'vertical',
  },
  hidden: {
    visibility: 'hidden',
    zIndex: -1,
  },
  lockIcon: {
    display: 'inline-block',
    width: 24,
    height: 28,
    float: 'right',
    marginBottom: -3,
    ...palette.backgroundImage(require(`../../resources/locked-24x28-d3.png`)),
    '::after': {
      content: '',
      clear: 'both',
    },
  },
  timeIcon: {
    display: 'inline-block',
    height: 14,
    width: 10,
  },
  timeStartIcon: {
    marginRight: 10,
    ...palette.backgroundImage(require(`../../resources/time-start-10x14-c1.png`)),
  },
  timeStopIcon: {
    marginRight: 10,
    ...palette.backgroundImage(require(`../../resources/time-stop-10x14-c1.png`)),
  },
  readOnlyDateContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 10,
  },
  thumbnailSrc: {
    display: 'flex',
    justifyContent: 'center',
    margin: '10px 0',
  },
  errorMessage: {
    marginTop: '7px',
    color: palette.alert_c1,
  },
})
