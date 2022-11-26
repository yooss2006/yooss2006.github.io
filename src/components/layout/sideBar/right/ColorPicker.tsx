import React, { useState } from 'react'
import styled from '@emotion/styled'
import { palette } from 'style/palette'

const paletteValue = Object.values(palette)

type Props = {
  changeColor: (colorName: string) => void
}

const ColorPicker = ({ changeColor }: Props) => {
  const color = localStorage.getItem('color') || 'white'

  const handleColor = (colorName: string) => {
    localStorage.setItem('color', colorName)
    changeColor(colorName)
  }

  return (
    <ColorThemePicker color={color}>
      <h3>THEME</h3>
      <div>
        {paletteValue.map(colorItem => (
          <ColorBall
            key={colorItem.name}
            color={colorItem.name}
            onClick={() => {
              handleColor(colorItem.name)
            }}
          ></ColorBall>
        ))}
      </div>
    </ColorThemePicker>
  )
}

const ColorThemePicker = styled.article<{ color: string }>`
  margin: 1em 0.8em;
  text-align: center;
  border-radius: 10px;
  border: 2px solid ${({ color }) => palette[color].complementaryColor};
  background-color: ${({ color }) => palette[color].colorArray[1]};
  h3 {
    margin: 0.5em;
    color: ${({ color }) => palette[color].complementaryColor};
  }
  div {
    margin: 0.5em 0;
    padding: 0 0.5em;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px 0;
  }
`

const ColorBall = styled.button<{ color: string }>`
  height: 20px;
  flex-basis: 30%;
  box-sizing: border-box;
  border: 2px solid ${({ color }) => palette[color].complementaryColor};
  background: ${({ color }) => color};
`

export default ColorPicker
