import React, { ReactNode } from 'react'
import styled from '@emotion/styled'
import { palette } from 'style/palette'

type Props = {
  length: string
  direction: string
  color: string
  children: ReactNode
}

const SideBar = ({ length, direction, color, children }: Props) => {
  return (
    <Section length={length} className={direction} color={color}>
      {children}
    </Section>
  )
}

const Section = styled.section<{ length: string; color: string }>`
  position: absolute;
  box-sizing: border-box;
  &.left {
    width: ${({ length }) => length};
    height: ${({ length }) => `calc(100% - ${length})`};
    top: ${({ length }) => length};
    left: 0;
    border-left: 2px solid ${({ color }) => palette[color].complementaryColor};
    border-right: 2px solid ${({ color }) => palette[color].complementaryColor};
    border-bottom: 2px solid ${({ color }) => palette[color].complementaryColor};
    background-color: ${({ color }) => palette[color].colorArray[1]};
  }
  &.right {
    width: ${({ length }) => length};
    height: ${({ length }) => `calc(100% - ${length})`};
    bottom: ${({ length }) => length};
    right: 0;
    border-top: 2px solid ${({ color }) => palette[color].complementaryColor};
    border-right: 2px solid ${({ color }) => palette[color].complementaryColor};
    border-left: 2px solid ${({ color }) => palette[color].complementaryColor};
    background-color: ${({ color }) => palette[color].colorArray[3]};
  }
  &.bottom {
    width: ${({ length }) => `calc(100% - ${length})`};
    height: ${({ length }) => length};
    bottom: 0;
    left: ${({ length }) => length};
    border-top: 2px solid ${({ color }) => palette[color].complementaryColor};
    border-right: 2px solid ${({ color }) => palette[color].complementaryColor};
    border-bottom: 2px solid ${({ color }) => palette[color].complementaryColor};
    background-color: ${({ color }) => palette[color].colorArray[2]};
  }
`

export default SideBar
