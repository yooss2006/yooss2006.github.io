import { css } from '@emotion/react'
import { Post } from 'hooks/useCategories'
import React from 'react'
import theme from 'style/theme'
import NavItem from './NavItem'

type Props = {
  posts: Post[]
}

const Nav = ({ posts }: Props) => {
  return (
    <ul css={UlStyle}>
      {posts.map((item, index) => {
        return (
          <NavItem key={index} posts={item.post}>
            {item.categories}
          </NavItem>
        )
      })}
    </ul>
  )
}

const UlStyle = css`
  font-family: ${theme.title};
`

export default Nav
