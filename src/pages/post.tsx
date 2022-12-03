import styled from '@emotion/styled'
import GlobalLayout from 'components/layout/GlobalLayout'
import SideBarLayout from 'components/layout/sideBar/SideBarLayout'
import { graphql } from 'gatsby'
import useCategories from 'hooks/useCategories'
import queryString, { ParsedQuery } from 'query-string'

import React from 'react'

type Props = {
  location: {
    search: string
  }
  data: {
    allMarkdownRemark: {
      edges: [
        {
          node: {
            frontmatter: {
              title: string
              categories: string
              id: number
            }
          }
        },
      ]
    }
  }
}

const PostPage = ({
  location: { search },
  data: {
    allMarkdownRemark: { edges },
  },
}: Props) => {
  const { posts } = useCategories({ edges })
  const { id }: ParsedQuery<string> = queryString.parse(search)
  const postName = posts.find(item => {
    return item.post.find(post => post.id === Number(id))
  })
  console.log(postName)
  return (
    <GlobalLayout>
      <SideBarLayout posts={posts}>
        <TestBox>{id}</TestBox>
      </SideBarLayout>
    </GlobalLayout>
  )
}

export const getCategories = graphql`
  query getCategories {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            title
            categories
            id
          }
        }
      }
    }
  }
`

const TestBox = styled.div`
  height: 1000px;
`

export default PostPage
