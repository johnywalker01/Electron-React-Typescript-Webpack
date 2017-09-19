import { StyleSheet } from 'aphrodite'

export default StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  /** Vertical panel */
  flexVertical: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  } as React.CSSProperties,
  flexVerticalNot100Width: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  flexHorizontal: {
    display: 'flex',
    flexDirection: 'row',
  } as React.CSSProperties,
})
