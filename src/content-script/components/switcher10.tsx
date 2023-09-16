import { useState } from 'react'

interface Props {
  displayText: string
  buttonId?: number
  buttonSize?: string
}

export enum SmallButtonSize {
  Slider = 'h-[13px] w-[34px]',
  Dot = 'h-[10px] w-[10px]',
  Text = 'text-xs',
}

export enum MediumButtonSize {
  Slider = 'h-[26px] w-[50px]',
  Dot = 'h-[18px] w-[18px]',
  Text = 'text-sm',
}

const Switcher10 = (props: Props) => {
  const [isChecked, setIsChecked] = useState(false)
  const buttonSize =
    props.buttonSize && props.buttonSize == 'small' ? SmallButtonSize : MediumButtonSize

  const handleCheckboxChange = () => {
    console.log('displayText', props.displayText)
    console.log('buttonId', props.buttonId)
    console.log('isChecked', isChecked)
    // alert((props.buttonId ? ('Row '+ props.buttonId) : '') + ' set to ' + (!isChecked ? 'On' : 'Off'))
    setIsChecked(!isChecked)
  }

  return (
    <>
      <label className="autoSaverSwitch relative inline-flex cursor-pointer select-none items-center">
        <input
          type="checkbox"
          name="autoSaver"
          className="sr-only"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`slider mr-3 flex ${
            buttonSize.Slider
          } items-center rounded-full p-1 duration-200 ${
            isChecked ? 'bg-indigo-500' : 'bg-[#CCCCCE]'
          }`}
        >
          <span
            className={`dot ${buttonSize.Dot} rounded-full bg-white duration-200 ${
              isChecked ? 'translate-x-6' : ''
            }`}
          ></span>
        </span>
        <span className={`label flex items-center ${buttonSize.Text} font-medium text-black`}>
          {props.displayText} <span className="pl-1"> {isChecked ? 'On' : 'Off'} </span>
        </span>
      </label>
    </>
  )
}

export default Switcher10
//https://tailgrids.com/components/toggle-switch
