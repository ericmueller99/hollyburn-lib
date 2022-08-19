import React from 'react';
import {WalkIn} from "../components/walk-in";
export default {
  title: 'Walk-in Form',
  component: WalkIn,
  argTypes: {
    propertyName: {
      control: {type: 'text'}
    }
  }
}

const Template = (args) => {
  return (
    <div className="bg-hbLightGray">
      <WalkIn {...args} />
    </div>
  )
}

export const Standard = Template.bind({})
Standard.args = {};