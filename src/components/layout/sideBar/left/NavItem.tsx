import React, { ReactNode } from 'react'

interface Children {
  children: ReactNode
}

interface Props extends Children {
  posts: { title: string; id: number }[]
}

const NavItem = ({ children, posts }: Props) => {
  return <CaregoriesButton>{children}</CaregoriesButton>
}

const CaregoriesButton = ({ children }: Children) => {
  return (
    <li>
      <button>{children}</button>
    </li>
  )
}

export default NavItem
