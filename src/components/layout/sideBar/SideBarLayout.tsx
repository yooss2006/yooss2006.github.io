import styled from '@emotion/styled'
import React, { ReactNode } from 'react'
import { palette } from 'style/palette'
import SideBar from './SideBar'

type Props = {
  children: ReactNode
}

const SideBarLayout = ({ children }: Props) => {
  const length = '150px'
  const color = localStorage.getItem('key') || 'green'

  return (
    <Box color={color}>
      <Header length={length} color={color}>
        하하
      </Header>
      <SideBar length={length} direction="left" color={color} />
      <SideBar length={length} direction="right" color={color} />
      <SideBar length={length} direction="bottom" color={color} />
      <Main length={length}>{children}</Main>
    </Box>
  )
}
const Box = styled.div<{ color: string }>`
  height: 100%;
  color: ${({ color }) => palette[color].complementaryColor};
  background-color: ${({ color }) => palette[color].colorArray[0]};
`

const Header = styled.header<{ length: string; color: string }>`
  width: ${({ length }) => `calc(100% - ${length})`};
  height: ${({ length }) => length};
  top: 0;
  left: 0;
  position: absolute;
  box-sizing: border-box;
  border-top: 2px solid ${({ color }) => palette[color].complementaryColor};
  border-left: 2px solid ${({ color }) => palette[color].complementaryColor};
  border-bottom: 2px solid ${({ color }) => palette[color].complementaryColor};
  background-color: ${({ color }) => palette[color].colorArray[0]};
`

const Main = styled.main<{ length: string }>`
  width: ${({ length }) => `calc(100% - ${length} * 2)`};
  height: ${({ length }) => `calc(100% - ${length} * 2)`};
  padding: 1em;
  position: absolute;
  top: ${({ length }) => length};
  left: ${({ length }) => length};
  overflow: scroll;
  box-sizing: border-box;
`

export default SideBarLayout
