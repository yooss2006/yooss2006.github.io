import React from 'react'
import styled from '@emotion/react'

type Props = {
  html: string
}

const PostContent = ({ html }: Props) => {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

export default PostContent
