import { css, Global } from '@emotion/react'
import { reset } from 'style/reset'
import React, { ReactNode } from 'react'
import { FC } from 'react'

type Props = {
  children: ReactNode
}

const GlobalLayout: FC<Props> = ({ children }) => {
  return (
    <>
      <Global
        styles={css`
          ${reset};
          ${globalStyle}
        `}
      />
      {children}
    </>
  )
}

const globalStyle = css`
  @font-face {
    font-family: 'HBIOS-SYS';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2207-01@1.0/HBIOS-SYS.woff2')
      format('woff2');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'HallymGothic-Regular';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2204@1.0/HallymGothic-Regular.woff2')
      format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  body {
    font-family: 'HallymGothic-Regular';
  }
  #___gatsby,
  #gatsby-focus-wrapper {
    height: 100%;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: 'HBIOS-SYS';
  }

  h1 {
    font-size: 32px;
  }
  h2 {
    font-size: 24px;
  }
  h3 {
    font-size: 20px;
  }
  h4 {
    font-size: 18px;
  }
`

export default GlobalLayout
