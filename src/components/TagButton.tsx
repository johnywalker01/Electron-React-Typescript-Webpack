import * as React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'

import { Tag } from 'src/serenity/resources'
import palette from 'src/util/palette'
import StateStyledCloseButton from 'src/components/StateStyledCloseButton'

export default function TagButton(props: { tag: Tag, close?: (Tag) => void }) {
  let icon = <div className={css(styles.tagIcon, styles.tagGlobalIcon)} ></div>
  if (props.tag.owner) {
    if (props.tag.owner.split('@')[0] === props.tag._serenity.getUsername) {
      icon = null
    } else {
      icon = <div className={css(styles.tagIcon, styles.tagUserIcon)} ></div>
    }
  }
  let closeButton = null
  if (props.close) {
    closeButton = <StateStyledCloseButton isActiveTab onClick={() => props.close(props.tag)}/>
  }
  return <div className={css(styles.tagDiv)}>
    <span className={css(props.close ? styles.tagCloseButtonPadding : null)}>
      {props.tag.name}
      {icon}
    </span>
    {closeButton}
  </div>
}

const styles = StyleSheet.create({
  tagDiv: {
    backgroundColor: palette.greyStepColor('d4', 2),
    display: 'inline-block',
    paddingLeft: 18,
    paddingRight: 18,
    margin: 2,
    borderRadius: 3,
  },
  tagCloseButtonPadding: {
    paddingRight: 18,
  },
  tagIcon: {
    display: 'inline-block',
    width: 12,
    height: 12,
    marginLeft: 4,
    marginBottom: -1,
  },
  tagGlobalIcon: {
    ...palette.backgroundImage(require(`../../resources/global-12x12-status_a.png`)),
  },
  tagUserIcon: {
    ...palette.backgroundImage(require(`../../resources/user-12x12-mode3_a.png`)),
  },
})
