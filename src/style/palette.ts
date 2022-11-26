import theme from './theme'

export type ColorType = 'white' | 'black' | 'green'

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
    colorArray: ['#ffffff', '#fafafa', '#f2f2f2', '#ececec'],
  },
  black: {
    name: 'black',
    complementaryColor: theme.white,
    colorArray: ['#000000', '#090909', '#0d0d0d', '#161616'],
  },
  green: {
    name: 'green',
    complementaryColor: theme.green,
    colorArray: ['#F0EEC9', '#D4D9C1', '#DAF0C9', '#C4E6C1'],
  },
  red: {
    name: 'green',
    complementaryColor: theme.green,
    colorArray: ['#F0EEC9', '#D4D9C1', '#DAF0C9', '#C4E6C1'],
  },
  redd: {
    name: 'green',
    complementaryColor: theme.green,
    colorArray: ['#F0EEC9', '#D4D9C1', '#DAF0C9', '#C4E6C1'],
  },
  reddd: {
    name: 'green',
    complementaryColor: theme.green,
    colorArray: ['#F0EEC9', '#D4D9C1', '#DAF0C9', '#C4E6C1'],
  },
}
