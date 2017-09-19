import * as React from 'react'

/**
 * Renders a hidden canvas to the DOM in order to do string width
 * calculations for truncation.
 */
export default class StringTruncator extends React.Component<{width: number}, {}> {
  canvas: HTMLCanvasElement

  render() {
    return <canvas height={0} {...this.props} ref={canvas => this.canvas = canvas} />
  }

  /**
   * Truncates a string to fit in the given width
   * @param str the string to truncate
   * @returns TruncateInfo
   */
  truncate(str: string, width?: number): TruncateInfo {
    let result = new TruncateInfo(str)
    if (str && width !== 0 && this.canvas) {
      result.truncate(this.canvas, width)
    }
    return result
  }
}

export class TruncateInfo {
  str: string
  gapStart: number
  gapEnd: number
  truncated: boolean
  originalStr: string

  constructor(str: string) {
    this.str = str
    this.gapStart = 0
    this.gapEnd = 0
    this.truncated = false
    this.originalStr = str
  }

  truncate(canvas: HTMLCanvasElement, width?: number, fontSize: number = 14, fontFamily: string = 'Arial, san serif') {
    const maxWidth = width || canvas.width
    if (canvas) {
      let ctx = canvas.getContext('2d')
      ctx.font = `${fontSize}px ${fontFamily}`
      let currWidth = ctx.measureText(this.str).width
      if (currWidth > maxWidth) {
        this.gapStart = Math.floor(this.str.length / 2)
        this.gapEnd = Math.ceil(this.str.length / 2)
        while (currWidth > maxWidth && this.gapStart > 0) {
          this.gapStart -= 1
          this.gapEnd += 1
          this.str = [this.str.slice(0, this.gapStart), this.str.slice(this.gapEnd)].join('...')
          currWidth = ctx.measureText(this.str).width
          this.truncated = true
        }
      }
    }
  }
}
