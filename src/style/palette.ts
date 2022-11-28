import theme from './theme'

export type ColorType = 'white' | 'black' | 'green' | 'purple'

export type Palette = {
  [key: string]: {
    name: ColorType
    complementaryColor: string
    colorArray: string[]
  }
}

export const palette: Palette = {
  white: {
    name: 'white',
    complementaryColor: theme.black,
    colorArray: ['#ffffff', '#f2f2f2', '#ececec', '#dfdfdf'],
  },
  black: {
    name: 'black',
    complementaryColor: theme.white,
    colorArray: ['#000000', '#2a2a2a', '#474747', '#7a7a7a'],
  },
  green: {
    name: 'green',
    complementaryColor: theme.green,
    colorArray: ['#F0EEC9', '#D4D9C1', '#DAF0C9', '#C4E6C1'],
  },
  purple: {
    name: 'purple',
    complementaryColor: theme.purple,
    colorArray: ['#DCFF42', '#C2E625', '#7F990C', '#516108'],
  },
}
