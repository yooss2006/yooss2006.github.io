import PostContent from 'components/\bpost/postContent'
import { graphql } from 'gatsby'
import React from 'react'

type Props = {
  data: {
    allMarkdownRemark: {
      edges: [{}]
    }
  }
}

// const PostTemplate = ({
//   data: {
//     allMarkdownRemark: { edges },
//   },
// }: Props) => {
//   return <PostContent html={html} />
// }

// export default PostTemplate

export const queryMarkdownDataBySlug = graphql`
  query queryMarkdownDataBySlug($slug: String) {
    allMarkdownRemark(filter: { fields: { slug: { eq: $slug } } }) {
      edges {
        node {
          html
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
