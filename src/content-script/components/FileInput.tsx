// components/FileInput.tsx
import classNames from 'classnames' // classNames to organize the classes.
import { ComponentPropsWithRef } from 'react'

type Props = ComponentPropsWithRef<'input'>
const FileInput = (props: Props) => {
  return (
    <input
      {...props}
      className={classNames({
        // button colors
        'file:bg-violet-50 file:text-violet-500 hover:file:bg-violet-100': true,
        // button shape and spacing
        'file:rounded-lg file:rounded-tr-none file:rounded-br-none': true,
        'file:px-4 file:py-2 file:mr-4 file:border-none': true,
        // overall input styling
        'hover:cursor-pointer border rounded-lg text-gray-400': true,
      })}
      type="file"
    />
  )
}

export default FileInput
