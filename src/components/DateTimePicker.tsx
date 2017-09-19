import * as React from 'react'
import { DatePicker } from 'antd'
import * as moment from 'moment'
import { StyleSheet, css } from 'aphrodite/no-important'
import { FormattedMessage } from 'react-intl'

import palette from 'src/util/palette'
import logs from 'src/util/logs'

export default class DateTimePicker extends React.Component<Props, State> {
  timeField: HTMLInputElement
  constructor(props) {
    super(props)
    this.state = {
      value: props.defaultValue,
      timeInputValue: props.defaultValue && buildTime(props.defaultValue),
    }
  }

  componentWillReceiveProps(newProps: Props) {
    this.setState({
      value: newProps.defaultValue,
      timeInputValue: newProps.defaultValue ? buildTime(newProps.defaultValue) : '',
    })
    if (!newProps.defaultValue) {
      this.timeField.value = ''
    }
  }

  render() {
    // const { value } = this.state
    const isError = this.props.errorMessage !== null
    const inputStyle = this.props.hiVis ? 'ant-input-hivis' : 'ant-input'
    let timePlaceholder = 'Time'
    let datePlaceholder = 'Date'
    switch (this.props.rangeBorder) {
      case 'start':
        timePlaceholder = 'Start time'
        datePlaceholder = 'Start date'
        break
      case 'end':
        timePlaceholder = 'End time'
        datePlaceholder = 'End date'
      default:
    }
    return (
      <span id={this.props.idPrefix}>
        <DatePicker
          showToday
          allowClear={this.props.allowClear}
          defaultValue={this.state.value && moment(this.state.value, dateFormat)}
          format={dateFormat}
          placeholder={datePlaceholder}
          onChange={this.handleDateChanged}
          style={{ width: this.props.allowClear ? 127 : 107, marginBottom: 10 }}
          className={isError ? 'ant-calendar-picker-error' : ''}
          inputPrefixCls={inputStyle}
          value={this.state.value && moment(this.state.value, dateFormat)}
        />
        <input
          defaultValue={this.state.value && buildTime(this.state.value)}
          onFocus={this.handleOnFocus}
          placeholder={timePlaceholder}
          onKeyDownCapture={this.handleKeyDownCapture}
          onWheel={this.handleWheel}
          onBlur={this.handleOnBlur}
          ref={this.setTimeField}
          className={(isError ? css(styles.inputWithError) + ' ' : '') + inputStyle}
          style={{ width: 97 }}
          id={this.props.idPrefix + 'Time'}
        />
        {this.props.errorMessage
          ? <div className={css(styles.errorMessage)} id={this.props.errorMessage.id}>
              <FormattedMessage {...this.props.errorMessage} />
            </div>
          : null}
      </span>
    )
  }

  changeTimeDate = (newTimeDateString: string) => {
    const newDate = new Date(newTimeDateString)
    logs.COMPONENTS.debug(`DateTimePicker changeTimeDate: ${newTimeDateString}`)
    if (!isNaN(newDate.getTime())) {
      logs.COMPONENTS.debug(`DateTimePicker changeTimeDate: ${newDate} accepted`)
      this.setState({ value: newDate })
      this.props.onChange(newDate)
    }
  }

  handleDateChanged = (momentDate: moment.Moment, dateString: string) => {
    if (dateString === '') {
      this.timeField.value = ''
      this.setState({ value: null })
      this.props.onChange(null)
    } else if (this.timeField.value === '') {
      switch (this.props.rangeBorder) {
        case 'start':
          this.timeField.value = '12:00:00 AM'
          break
        case 'end':
          this.timeField.value = '11:59:59 PM'
          break
        default:
      }
    }
    this.changeTimeDate(`${dateString} ${this.timeField.value}`)
  }

  setTimeField = ref => (this.timeField = ref)

  handleOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const newDate = new Date()
    if (!this.state.value) {
      switch (this.props.rangeBorder) {
        case 'start':
          this.timeField.value = '12:00:00 AM'
          newDate.setDate(1)
          break
        case 'end':
          this.timeField.value = '11:59:59 PM'
          newDate.setDate(32)
          newDate.setDate(-newDate.getDate())
          break
        default:
      }
      const dateString = buildDate(newDate)
      this.changeTimeDate(`${dateString} ${this.timeField.value}`)
    }
  }

  handleOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const el = e.currentTarget
    const sections = [Sections.Hours, Sections.Minutes, Sections.Seconds]
    let am = el.value[sectionStart[Sections.AmPm]] !== 'P'
    sections.forEach(section => {
      let tempNumber = parseInt(el.value.substr(sectionStart[section], 2), 10)
      if (isNaN(tempNumber)) {
        tempNumber = 99
      }
      if (section === Sections.Hours) {
        if (tempNumber === 0) {
          am = true
          tempNumber = 12
        } else if (tempNumber <= 12) {
          // we're good
        } else if (tempNumber < 24) {
          am = false
          tempNumber -= 12
        } else {
          // we're error
          am = false
          tempNumber = 11
        }
      } else {
        if (tempNumber >= 60) {
          tempNumber = 59
        }
      }
      const replacement = `${Math.floor(tempNumber / 10)}${tempNumber % 10}:`
      this.replaceAndSelectMiddle(el, sectionStart[section], replacement)
    })
    const replacement = am ? ' AM' : ' PM'
    this.replaceAndSelectMiddle(el, sectionStart[Sections.AmPm] - 1, replacement)
    this.changeTimeDate(`${buildDate(this.state.value)} ${this.timeField.value}`)
  }

  handleKeyDownCapture = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey) {
      return
    }
    const el = e.currentTarget
    const inSection = sectionFromPosition[el.selectionStart]
    let newSection = inSection
    logs.COMPONENTS.debug(`DateTimePicker ${e.key} ${el.selectionStart}-${el.selectionEnd}`)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === '+' || e.key === '-') {
      e.preventDefault()
      const direction = e.key === 'ArrowDown' || e.key === '-' ? -1 : 1
      this.handleUpDown(el, direction)
    } else if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === ':' ||
      e.key === '-' ||
      e.key === '.' ||
      e.key === 'Tab'
    ) {
      let direction = e.key === 'ArrowLeft' ? -1 : 1
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          direction = -1
        }
        if (inSection + direction < Sections.Hours || inSection + direction > Sections.AmPm) {
          return
        }
      }
      newSection = (inSection + direction + 4) % 4
      e.preventDefault()
      el.selectionStart = sectionStart[newSection]
      el.selectionEnd = sectionEnd[newSection]
    } else if (/[\d]/.exec(e.key)) {
      const changePosition = [0, 1, 3, 3, 4, 6, 6, 7]
      const nextStart = [1, 2, 4, 4, 5, 7, 7, 9]
      const nextEnd = [2, 2, 5, 5, 5, 8, 8, 11]
      e.preventDefault()
      if (el.selectionStart < nextStart.length) {
        const changePos = changePosition[el.selectionStart]
        const newStart = nextStart[el.selectionStart]
        const newEnd = nextEnd[el.selectionStart]
        if (el.selectionStart === 0 && e.key !== '0' && el.selectionEnd !== 1) {
          el.value = replaceMiddle(el.value, 0, ' ' + e.key)
          el.selectionStart = 2
          el.selectionEnd = 2
        } else if (el.selectionStart === 2 && el.value[0] === ' ') {
          el.value = replaceMiddle(el.value, 0, el.value[1] + e.key)
          el.selectionStart = 2
          el.selectionEnd = 2
        } else {
          el.value = replaceMiddle(el.value, changePos, e.key)
          el.selectionStart = newStart
          el.selectionEnd = newEnd
        }
      }
    } else if (e.key.toUpperCase() === 'A' || e.key.toUpperCase() === 'P') {
      e.preventDefault()
      const replacement = e.key.toUpperCase() + 'M'
      newSection = Sections.AmPm
      this.replaceAndSelectMiddle(el, sectionStart[newSection], replacement)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      if (el.selectionStart === el.selectionEnd) {
        if (e.key === 'Backspace') {
          el.selectionStart -= 1
        } else {
          el.selectionEnd += 1
        }
      }
      const replacement = '00:00:00 AM'.substring(el.selectionStart, el.selectionEnd)
      this.replaceAndSelectMiddle(el, el.selectionStart, replacement)
      if (e.key === 'Backspace') {
        el.selectionEnd = el.selectionStart
      } else {
        el.selectionStart = el.selectionEnd
      }
    } else if (!(e.key === 'Home' || e.key === 'End')) {
      e.preventDefault()
    }
  }

  handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    const direction = event.deltaY < 0 ? 1 : -1
    this.handleUpDown(event.currentTarget, direction)
  }

  handleUpDown(el: HTMLInputElement, direction: number) {
    let replacement = ''
    const inSection = sectionFromPosition[el.selectionStart]
    if (inSection === Sections.AmPm) {
      const am = el.value[sectionStart[Sections.AmPm]] !== 'P'
      replacement = am ? 'PM' : 'AM'
    } else {
      let tempNumber = parseInt(el.value.substr(sectionStart[inSection], 2), 10)
      if (isNaN(tempNumber)) {
        tempNumber = 0
      }
      if (inSection === Sections.Hours) {
        tempNumber = (tempNumber - 1 + direction + 12) % 12 + 1
      } else {
        tempNumber = (tempNumber + direction + 60) % 60
      }
      replacement = `${Math.floor(tempNumber / 10)}${tempNumber % 10}`
    }
    this.replaceAndSelectMiddle(el, sectionStart[inSection], replacement)
  }
  replaceAndSelectMiddle(el: HTMLInputElement, endFirst: number, newMiddle: string) {
    logs.COMPONENTS.debug(
      `DateTimePicker replaceAndSelectMiddle(${el.value}, ${endFirst}, ${newMiddle})`,
    )
    el.value = replaceMiddle(el.value, endFirst, newMiddle)
    el.selectionStart = endFirst
    el.selectionEnd = endFirst + newMiddle.length
  }
}

interface Props {
  defaultValue: Date
  idPrefix: string
  onChange: (Date) => void
  errorMessage: FormattedMessage.MessageDescriptor
  hiVis?: boolean
  allowClear: boolean
  rangeBorder?: 'start' | 'end'
}

interface State {
  value: Date
  timeInputValue: string
}

const dateFormat: string = 'YYYY-MM-DD'

const sectionStart = [0, 3, 6, 9]
const sectionEnd = [0 + 2, 3 + 2, 6 + 2, 9 + 2]

function replaceMiddle(s: string, endFirst: number, newMiddle: string): string {
  return s.substring(0, endFirst) + newMiddle + s.substring(endFirst + newMiddle.length)
}

enum Sections {
  Hours,
  Minutes,
  Seconds,
  AmPm,
}

const sectionFromPosition = [
  Sections.Hours,
  Sections.Hours,
  Sections.Hours,
  Sections.Minutes,
  Sections.Minutes,
  Sections.Minutes,
  Sections.Seconds,
  Sections.Seconds,
  Sections.Seconds,
  Sections.AmPm,
  Sections.AmPm,
  Sections.AmPm,
]

const styles = StyleSheet.create({
  inputWithError: {
    borderColor: palette.alert_a,
  },
  errorMessage: {
    marginTop: '-10px',
    color: palette.alert_c1,
  },
})

function twoDigits(x: number): string {
  const d1 = Math.floor(x / 10) % 10
  const d2 = x % 10
  return `${d1}${d2}`
}

function hoursAmPm(h: number): number {
  return h % 12 === 0 ? 12 : h % 12
}

function buildTime(value: Date): string {
  const defaultTimeBase = [
    twoDigits(hoursAmPm(value.getHours())),
    twoDigits(value.getMinutes()),
    twoDigits(value.getSeconds()),
  ].join(':')
  return defaultTimeBase + (value.getHours() < 12 ? ' AM' : ' PM')
}

function buildDate(value: Date): string {
  return [value.getFullYear(), twoDigits(value.getMonth() + 1), twoDigits(value.getDate())].join(
    '-',
  )
}
