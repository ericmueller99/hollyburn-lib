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
Standard.args = {
  options: {
    showUpdatePrefsBanner: true,
    handleUpdatePrefs: () => {
      console.log('hello')
    }
  }
};

export const ThreeBedFiveThousdandBduget = Template.bind({});
ThreeBedFiveThousdandBduget.args = {
  propertyCode: null,
  options: {
    preferences: {
      minBudget: 5000,
      suiteTypes: [3],
    },
    showUpdatePrefsBanner: true,
    handleUpdatePrefs: () => {
      console.log('hello')
    }
  }
}

export const WithPropertyCode = Template.bind({});
WithPropertyCode.args = {
  propertyCode: 'ha045'
}

export const WithPropertyCodeTwo = Template.bind({});
WithPropertyCodeTwo.args = {
  propertyCode: null,
}