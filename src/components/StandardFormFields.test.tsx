import { mount } from '../util/enzyme-i18n'
import {expect, use} from 'chai'
import * as chaiEnzyme from 'chai-enzyme'
use(chaiEnzyme())
import {observable} from 'mobx'

import * as React from 'react'
import {FormField} from './StandardFormFields'

describe('StandardFormFields', () => {
  it('updates the model\'s field', () => {
    const model = observable({
      name: 'InitialValue',
    })

    const formField = mount(<FormField
      name='name'
      model={model}
      labelMessage={{id: 'name', defaultMessage: 'Label'}}
      parentBgColor='d3'
      />)
    const input = formField.find('input') as any

    expect(formField.text()).to.contain('Label')
    expect(input.node.value).to.equal('InitialValue')

    input.simulate('change', {target: {name: 'name', value: 'NewValue'}})
    expect(model.name).to.equal('NewValue')
  })
})
