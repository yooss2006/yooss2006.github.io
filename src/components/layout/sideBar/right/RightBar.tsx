import React from 'react'
import ColorPicker from './ColorPicker'

type Props = {
  changeColor: (colorName: string) => void
}

const RightBar = ({ changeColor }: Props) => {
  return (
    <>
      <ColorPicker changeColor={changeColor} />
    </>
  )
}

export default RightBar
