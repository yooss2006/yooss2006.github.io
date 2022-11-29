import styled from '@emotion/styled'
import GlobalLayout from 'components/layout/GlobalLayout'
import SideBarLayout from 'components/layout/sideBar/SideBarLayout'
import { graphql } from 'gatsby'
import useCategories from 'hooks/useCategories'

import React from 'react'

type Props = {
  data: {
    allMarkdownRemark: {
      edges: [
        {
          node: {
            frontmatter: {
              title: string
              categories: string
            }
          }
        },
      ]
    }
  }
}

const MainPages = ({
  data: {
    allMarkdownRemark: { edges },
  },
}: Props) => {
  const { posts } = useCategories({ edges })

  return (
    <GlobalLayout>
      <SideBarLayout posts={posts}>
        <TestBox>dd</TestBox>
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
          }
        }
      }
    }
  }
`

const TestBox = styled.div`
  height: 1000px;
`

export default MainPages
