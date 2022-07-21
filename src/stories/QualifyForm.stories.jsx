import React from 'react';
import {QualifyForm} from "../components/qualify-form";

export default {
    title: 'Qualify Form',
    component: QualifyForm,
    argTypes: {
        maxBudget: {
            control: {type: 'number', min: 0, max: 9999}
        },
        firstName: {
            control: {type: 'text'}
        },
        lastName: {
            control: {type: 'text'}
        },
        emailAddress: {
            control: {
                type: 'text'
            }
        },
        phoneNumber: {
            control: {type: 'text'}
        },
        submitUrl: {
            control: {type: 'text'}
        }
    }
}

const Template = (args) => {
    return (
        <div className={"bg-hbLightGray"}>
            <QualifyForm {...args} />
        </div>
    )
}
export const Standard = Template.bind({});
Standard.args = {};