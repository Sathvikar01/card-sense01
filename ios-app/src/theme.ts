/**
 * The website's four colours, one light theme. Mirrors src/app/globals.css in the web app.
 *   paper  the ground
 *   white  controls and floating layers
 *   pine   text and primary actions
 *   gold   the one accent, a fill under pine text
 */
export const colors = {
  paper: '#f4f3ef',
  white: '#ffffff',
  pine: '#16302b',
  gold: '#d9a93a',
  /** Pine mixed 82% toward paper: 7:1 on paper, for secondary text. */
  muted: '#3e534e',
  /** Pine at 6% and 11%: fills for rows and pressed states. */
  tint: 'rgba(22, 48, 43, 0.06)',
  tintStrong: 'rgba(22, 48, 43, 0.11)',
} as const

export const font = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
} as const

/** 16px gutter, as on the web at phone width. */
export const EDGE = 16
