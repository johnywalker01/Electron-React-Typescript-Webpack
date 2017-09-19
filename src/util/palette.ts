import { CSSProperties } from 'react'
import { StyleSheet } from 'aphrodite'

/* tslint:disable:variable-name */

export type GreyColor = 'd0' | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' |
  'c1' | 'c2' | 'c3' | 'c4' |
  'b1' | 'b2' | 'b3' | 'b4' | 'b5' |
  'a'

export const GREY_NAMES: GreyColor[] = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5',
  'c1', 'c2', 'c3', 'c4',
  'b1', 'b2', 'b3', 'b4', 'b5',
  'a']

export type RainbowColor = 'active_a' | 'active_b1' | 'active_b2' | 'active_b3' | 'active_c1' | 'active_c2' |
  'status_a' | 'status_b1' |
  'alert_a' | 'alert_b1' | 'alert_c1' |
  'warn_a' | 'warn_b1' |
  'actstat_a' | 'actstat_b1' |
  'mode1_a' | 'mode1_b1' | 'mode2_a' | 'mode2_b1' | 'mode3_a' | 'mode3_b1' | 'mode4_a' | 'mode4_b1' |
  'audio_a' | 'audio_b1' |
  'tooltip_a' |
  'level_b01' | 'level_b02' | 'level_b03' | 'level_b04' | 'level_b05' |
  'level_b06' | 'level_b07' | 'level_b08' | 'level_b09' | 'level_b10'

let resourceContext = null
try {
  resourceContext = (require as any).context('../../resources/', false)
} catch (error) {
  resourceContext = (filename: string) => {return filename}
}

export class Palette {
  /** Black #000 */
  d0 = '#000'

  /** Almost Black #111 */
  d1 = '#111'

  /** Darkest Grey #222 */
  d2 = '#222'

  /** Darker Grey #333 */
  d3 = '#333'

  /** Dark Grey #444 */
  d4 = '#444'

  /** Darkish Grey #555 */
  d5 = '#555'

  /** Grey #666 */
  c1 = '#666'

  /** Grey #777 */
  c2 = '#777'

  /** Grey #888 */
  c3 = '#888'

  /** Grey #999 */
  c4 = '#999'

  /** Lightish Grey #aaa */
  b1 = '#aaa'

  /** Light Grey #bbb */
  b2 = '#bbb'

  /** Lighter Grey #ccc */
  b3 = '#ccc'

  /** Lightest Grey #ddd */
  b4 = '#ddd'

  /** Almost White #eee */
  b5 = '#eee'

  /** White #fff */
  a = '#fff'

  /** Selected / Active / Link (Pelco Blue) */
  active_a = '#007dc5'

  /** Selected / Active / Link (Dark Blue) */
  active_b1 = '#00629c'

  /** Selected / Active / Link (Darker Blue) */
  active_b2 = '#0c5480'

  /** Selected / Active / Link (Darkest Blue) */
  active_b3 = '#0e4166'

  /** Selected / Active / Link (Bright Blue) */
  active_c1 = '#33bbff'

  /** Selected / Active / Link (Powder Blue) */
  active_c2 = '#aaddee'

  /** Status / Shared / Recorded Video (Green) */
  status_a = '#97cb59'

  /** Status / Shared / Recorded Video (Forest Green) */
  status_b1 = '#628c38'

  /** Alert / Alarm / Failure / Prohibited Action (Bright Red) */
  alert_a = '#d83237'

  /** Alert / Alarm / Failure / Prohibited Action (Dark Red) */
  alert_b1 = '#992222'

  /** Alert / Alarm / Failure / Prohibited Action (Darker Red) */
  alert_c1 = '#ff504c'

  /** Playback / Sync / Warning (Yellow) */
  warn_a = '#ffdd00'

  /** Playback / Sync / Warning (Yellowish Brown) */
  warn_b1 = '#ccaa00'

  /** Active Status / In Progress (Bright Turqoise) */
  actstat_a = '#00ffcc'

  /** Active Status / In Progress (Turqoise) */
  actstat_b1 = '#00cc99'

  /** PTZ mode colors (Cyan) */
  mode1_a = '#00ccff'

  /** PTZ mode colors (Cyan) */
  mode1_b1 = '#0099cc'

  /** dPTZ mode colors (Magenta) */
  mode2_a = '#ce3fff'

  /** dPTZ mode colors (Magenta) */
  mode2_b1 = '#9944bb'

  /** Investigation / Low-Quality / Beware colors (Orange) */
  mode3_a = '#ff9911'

  /** Investigation / Low-Quality / Beware colors (Orange) */
  mode3_b1 = '#cc7700'

  /** TBD (Purple) */
  mode4_a = '#9988ff'

  /** TBD (Purple) */
  mode4_b1 = '#7766cc'

  /** Audio colors (Grey-Violet) */
  audio_a = '#8f92b0'

  /** Audio colors (Grey-Violet) */
  audio_b1 = '#586087'

  /** Tooltip color (Cream) */
  tooltip_a = '#ffeeaa'

  /** Severity indicator (Aqua Green -> Red) */
  level_b01 = '#37b57e'
  level_b02 = '#67c06c'
  level_b03 = '#97cb59'
  level_b04 = '#bad13b'
  level_b05 = '#dcd71e'
  level_b06 = '#ffdd00'
  level_b07 = '#ffbb08'
  level_b08 = '#ff9911'
  level_b09 = '#eb6524'
  level_b10 = '#d83237'

  severityColors: Array<string> = [
    this.level_b01,
    this.level_b02,
    this.level_b03,
    this.level_b04,
    this.level_b05,
    this.level_b06,
    this.level_b07,
    this.level_b08,
    this.level_b09,
    this.level_b10,
  ]

  /** Default app background color */
  defaultBackgroundColor = this.d3

  /** Slightly darker top border */
  slightlyDarkerBackgroundColor = '#313131'

  /** Significantly darker bottom border */
  darkerBackgroundColor = '#242424'

  /** Default border color */
  defaultBorderColor = this.d4

  /** Default text color */
  defaultTextColor = this.b1

  greyStep(greyName: GreyColor, step: number) {
    const index = GREY_NAMES.indexOf(greyName)
    const newIndex = index + step
    if (newIndex < 0) {
      throw new Error(`Modifying palette.${greyName} by ${step} makes a color darker than black`)
    } else if (newIndex > GREY_NAMES.length - 1) {
      throw new Error(`Modifying palette.${greyName} by ${step} makes a color brighter than white`)
    }

    return GREY_NAMES[newIndex]
  }

  greyStepColor(greyName: GreyColor, step: number) {
    return this[this.greyStep(greyName, step)]
  }

  /**
   * Returns a CSSProperties instance from the incoming CSSProperties or
   * Aphrodite-created StyleSheet.create() style.
   * @param style the style to normalize
   */
  normalizeStyle(style: CSSProperties | AphroditeStyle): CSSProperties {
    if (style && '_definition' in style) {
      return (style as any)._definition
    } else {
      return style
    }
  }

  /**
   * Converts a React CSSProperties to an Aphrodite style to pass to the
   * css() function.  Same as calling StyleSheet.create().
   *
   * @param name the name of the property that will show up in generated css class
   * @param style the style object
   * @returns AphroditeStyle
   */
  asStyleSheet(name: string, style: CSSProperties): AphroditeStyle {
    const obj = {}
    obj[name] = style
    return StyleSheet.create(obj)[name]
  }

  /**
   * Leverages webpack's require.context to support dynamic require statements.
   * @param filename the filename relative to the /resource/ directory
   * (ie 'workspace-50x50-a.png')
   * @returns a url generated by webpack
   */
  resourceUrl(filename: string) {
    const relativePath = filename.startsWith('./') ? filename : './' + filename
    return resourceContext(relativePath)
  }

  /**
   * Generates a style that puts the given image in the background of an element.
   * @param imageUrl the image url to use as a background
   * @param position where to position the image (ie, 'top left' / defaults to 'center')
   * @returns React style
   */
  backgroundImage(imageUrl, position = 'center'): React.CSSProperties {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: position,
    }
  }
}

interface AphroditeStyle {
  _name: string
  _definition: CSSProperties
}

const palette = new Palette()

export default palette
