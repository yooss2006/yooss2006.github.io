import { Posts } from 'hooks/useCategories'
import React from 'react'

type Props = {
  posts: Posts
}

const Nav = ({ posts }: Props) => {
  return (
    <ul>
      {posts.map((item, index) => {
        return <li key={index}>{item.categories}</li>
      })}
    </ul>
  )
}

export default Nav
