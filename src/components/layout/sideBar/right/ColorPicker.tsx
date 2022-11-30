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
      <h3>🎨</h3>
      <div className="container">
        {paletteValue.map(colorItem => (
          <div key={colorItem.name} className="colorContainer">
            <ColorBall
              color={colorItem.name}
              onClick={() => {
                handleColor(colorItem.name)
              }}
            ></ColorBall>
          </div>
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
  div.container {
    margin: 0.5em 0;
    padding: 0 0.5em;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px 0;
  }
  div.colorContainer {
    flex-basis: 25%;
  }
`

const ColorBall = styled.button<{ color: string }>`
  height: 15px;
  width: 15px;
  border-radius: 50%;
  box-sizing: border-box;
  border: none;
  background: ${({ color }) => color};
`

export default ColorPicker
