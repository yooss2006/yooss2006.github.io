import React from 'react'
import styled from '@emotion/styled'
import { palette } from 'style/palette'
import theme from 'style/theme'

type Props = {
  html: string
}

const PostContent = ({ html }: Props) => {
  const color = localStorage.getItem('color') || 'white'
  return (
    <MarkdownRenderer
      dangerouslySetInnerHTML={{ __html: html }}
      color={color}
    />
  )
}

const MarkdownRenderer = styled.div<{ color: string }>`
  margin: 0 auto;
  padding: 1em 1.25em;
  word-break: break-all;
  line-height: 1.8;
  aside {
    padding: 1em 0;
    font-family: ${theme.title};
    border-radius: 10px;
    border: 1px solid ${({ color }) => palette[color].complementaryColor};
    background-color: ${({ color }) => palette[color].colorArray[1]};
    &::before {
      content: '💡';
      padding-left: 0.5em;
    }
  }

  ol,
  ul {
    margin: 0 1.25em;
    padding: 0.5em 0;
    list-style: circle;
  }
  li {
    margin-bottom: 0.5em;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: 800;
    margin: 1em 0 0.5em;
    &::before {
      content: '#';
      padding: 0 0.2em;
    }
  }

  strong {
    font-weight: 800;
    color: red;
  }

  blockquote {
    margin: 1em 0;
    padding: 0 1em;
    border-left: 3px solid ${({ color }) => palette[color].complementaryColor};
  }
  hr {
    border: 1px solid ${({ color }) => palette[color].complementaryColor};
    margin: 7em 0;
  }

  a {
    color: #4263eb;
    text-decoration: underline;
  }

  pre[class*='language-'] {
    margin: 1em 0;
    padding: 1em;
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 3px;
    }
  }

  p > code[class*='language-'],
  li > code[class*='language-'] {
    padding: 0 0.3em;
    margin: 0 0.1em;
    color: ${({ color }) => palette[color].colorArray[0]};
    background-color: ${({ color }) => palette[color].complementaryColor};
  }
`

export default PostContent
