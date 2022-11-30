import { css } from '@emotion/react'
import React, { Children, ReactNode } from 'react'
import { FC } from 'react'

interface Children {
  children: ReactNode
}

interface Props extends Children {
  posts: { title: string; id: number }[]
  name: string
  setCheckedName: React.Dispatch<React.SetStateAction<string | undefined>>
  checkedName: string | undefined
}

interface SubProps {
  posts: { title: string; id: number }[]
}

const NavItem = ({
  children,
  posts,
  name,
  setCheckedName,
  checkedName,
}: Props) => {
  const isChecked = checkedName === name
  return (
    <li css={LiStyle}>
      <button
        type="button"
        css={ButtonStyle}
        onClick={() => setCheckedName(name)}
        className={isChecked ? 'checked' : ''}
      >
        {children}
      </button>
      {isChecked && <SubNav posts={posts} />}
    </li>
  )
}

const SubNav = ({ posts }: SubProps) => {
  return (
    <ul css={SubNavStyle}>
      {posts.map(item => {
        return <li>{item.title}</li>
      })}
    </ul>
  )
}

const SubNavStyle = css`
  transition: all 1s;
`

const LiStyle = css`
  margin: 0.5em;
`

const ButtonStyle = css`
  width: 100%;
  padding: 0.5em 0;
  &.checked {
    background-color: red;
  }
`

export default NavItem
