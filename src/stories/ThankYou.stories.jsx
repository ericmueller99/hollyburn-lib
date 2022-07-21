import React from 'react';
import {ThankYou} from "../components/thank-you";

export default {
    title: 'Thank You',
    component: ThankYou,
    argsTypes: {

    }
}

const Template = (args) => <ThankYou {...args} />
export const Standard = Template.bind({});
Standard.args = {}