import * as React from 'react'
import { FormattedMessage, InjectedIntl } from 'react-intl'
import messages from './messages'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { StyleSheet, css } from 'aphrodite/no-important'
import { Select } from '../../components/Select'
import { Option } from '../../components/Option'

export class FilterDropdownProps {
  id?: string
  name: FormattedMessage.Props
  notName: FormattedMessage.Props
  @observable state: boolean
  handleStateChange: (newState: boolean) => void
  intl?: InjectedIntl
}

@observer
export default class FilterDropdown extends React.Component<FilterDropdownProps, {}> {
  render() {
    return (
      <div>
        <FormattedMessage {...this.props.name} />:
        <Select
          className={css(styles.dropdown)}
          id={this.props.id}
          name='select'
          onChange={this.handleChangeSelect}
          value={this.boolToString(this.props.state)}>
          <Option value='null' message={messages.noFilter} />
          <Option value='false' message={this.props.notName} />
          <Option value='true' message={this.props.name} />
        </Select>
      </div>
    )
  }

  handleChangeSelect = (newValue: string) => {
    this.props.handleStateChange(this.stringToBool(newValue))
  }

  boolToString(boolValue: boolean): string {
    switch (boolValue) {
      default:
      case null: return 'null'
      case false: return 'false'
      case true: return 'true'
    }
  }

  stringToBool(strValue: string): boolean {
    switch (strValue) {
      default:
      case 'null': return null
      case 'false': return false
      case 'true': return true
    }
  }
}

const styles = StyleSheet.create({
  dropdown: {
    width: '50%',
    margin: '0 0 10px 10px',
  },
})
