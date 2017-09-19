import { mount } from '../util/enzyme-i18n'
import {expect, use} from 'chai'
import * as chaiEnzyme from 'chai-enzyme'
use(chaiEnzyme())

import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'

import StateStyledButton from './StateStyledButton'

describe('StateStyledButton', () => {
  it('swaps styles on hover', () => {
    let clicked = false

    const onClick = (evt) => {
      clicked = true
    }

    const button = mount(<StateStyledButton
      value='Button Text'
      inputType='button'
      normalStyle={styles.normal}
      hoverStyle={styles.hover}
      focusStyle={styles.focus}
      pressStyle={styles.press}
      disableStyle={styles.disable}
      onClick={onClick} />)

    expect(button).to.have.className(css(styles.normal))
    button.simulate('mouseEnter')
    expect(button).to.have.className(css(styles.normal, styles.hover))
    button.simulate('mouseLeave')
    expect(button).to.have.className(css(styles.normal))
  })
})

const styles = StyleSheet.create({
  normal: {
    color: 'red',
  },
  hover: {
    color: 'orange',
  },
  focus: {
    color: 'yellow',
  },
  press: {
    color: 'green',
  },
  disable: {
    color: 'black',
  },
})
