import { css } from '@emotion/react'
import { Post } from 'hooks/useCategories'
import React, { useState } from 'react'
import theme from 'style/theme'
import NavItem from './NavItem'

type Props = {
  posts: Post[]
}

const Nav = ({ posts }: Props) => {
  const [checkedName, setCheckedName] = useState<string>()

  return (
    <ul css={UlStyle}>
      {posts.map((item, index) => {
        return (
          <NavItem
            key={index}
            name={item.categories}
            posts={item.post}
            setCheckedName={setCheckedName}
            checkedName={checkedName}
          >
            {item.categories}
          </NavItem>
        )
      })}
    </ul>
  )
}

const UlStyle = css`
  margin: 1em 0;
  font-family: ${theme.title};
`

export default Nav
