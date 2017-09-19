/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap an invalid
 * English locale intl context around them so that they fall back on default messages.
 * See also: https://github.com/yahoo/react-intl/wiki/Testing-with-React-Intl#enzyme
 */
import * as React from 'react'
import { IntlProvider, intlShape } from 'react-intl'
import { mount as _mount, shallow as _shallow, render as _render } from 'enzyme'

// You can pass your messages to the IntlProvider. Optional: remove if unneeded.
const messages = {}

// Create the IntlProvider to retrieve context for wrapping around.
const intlProvider = <any> new IntlProvider({ locale: 'en', messages }, {})
const { intl } = intlProvider.getChildContext()

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
function nodeWithIntlProp(node) {
  return React.cloneElement(node, { intl })
}

/**
 * Shallow rendering is useful to constrain yourself to testing a component as a unit, and to ensure that
 * your tests aren't indirectly asserting on behavior of child components.
 * @param node
 * @param [options]
 */
export function shallow(node) {
  return _shallow(nodeWithIntlProp(node), { context: { intl } })
}

/**
 * Mounts and renders a react component into the document and provides a testing wrapper around it.
 * @param node
 * @param [options]
 */
export function mount(node) {
  return _mount(nodeWithIntlProp(node), {
    context: { intl },
    childContextTypes: { intl: intlShape },
  })
}

/**
 * Render react components to static HTML and analyze the resulting HTML structure.
 * @param node
 * @param [options]
 */
export function render(node) {
  return _render(React.createElement(IntlProvider, {locale: 'en', messages}, node))
}
