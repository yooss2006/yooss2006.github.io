import styled from '@emotion/styled'
import GlobalLayout from 'components/layout/GlobalLayout'
import React from 'react'

const index = () => {
  return (
    <GlobalLayout>
      <TestBox>dd</TestBox>
    </GlobalLayout>
  )
}

const TestBox = styled.div`
  height: 1000px;
`

export default index
