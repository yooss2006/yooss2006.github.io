import styled from '@emotion/styled'
import { Posts } from 'hooks/useCategories'
import React, { ReactNode, useState } from 'react'
import { palette } from 'style/palette'
import Nav from './left/Nav'
import RightBar from './right/RightBar'
import SideBar from './SideBar'

type Props = {
  children: ReactNode
  posts: Posts
}

const SideBarLayout = ({ posts, children }: Props) => {
  console.log(posts)
  const length = '150px'
  const [color, setColor] = useState(localStorage.getItem('color') || 'white')

  const changeColor = (colorName: string) => {
    setColor(colorName)
  }

  return (
    <Box color={color}>
      <Header length={length} color={color}>
        하하
      </Header>
      <SideBar length={length} direction="left" color={color}>
        <Nav posts={posts} />
      </SideBar>
      <SideBar length={length} direction="right" color={color}>
        <RightBar changeColor={changeColor} />
      </SideBar>
      <SideBar length={length} direction="bottom" color={color}>
        <div></div>
      </SideBar>
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
