import React from 'react';
import {BasicForm} from "../components/basic-form";

export default {
    title: 'Basic Form',
    component: BasicForm,
    argTypes: {
        firstName: {
            control: {type: 'text'}
        },
        lastName: {
            control: {type: 'text'}
        },
        emailAddress: {
            control: {type: 'text'}
        },
        phoneNumber: {
            control: {type: 'text'}
        },
        options: {
            control: {type: 'object'}
        }
    }
}

const Template = (args) => {
    return (
        <div className={"bg-hbLightGray"}>
            <BasicForm {...args} />
        </div>
    )
}
export const Standard = Template.bind({});
Standard.args = {};

export const Wizard = Template.bind({})
Wizard.args = {
    options: {
        buttonText: 'Next'
    }
}