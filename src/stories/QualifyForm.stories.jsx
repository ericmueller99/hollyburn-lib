import React from 'react';
import {QualifyForm} from "../components/qualify-form";

export default {
    title: 'Qualify Form',
    component: QualifyForm,
    argTypes: {
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
        maxBudget: {
            control: {type: 'number', min: 0, max: 9999}
        },
        firstName: {
            control: {type: 'text'}
        },
        suiteTypes: {
            control: 'inline-check', options: ['0','1','2','3']
        },
        cities: {
            control: 'inline-check', options: ['Ottawa', 'Vancouver', 'Calgary', 'West Vancouver', 'North Vancouver', 'Toronto']
        },
        neighbourhoods: {
            control: 'inline-check', options: ['West End', 'South Granville', 'Kitsilano', 'UBC Point Grey', 'Oakridge', 'Marpole', 'Downtown Toronto', 'The Annex', 'Etobicoke', 'Yorkville']
        },
        options: {
            control: 'object'
        }
    },
    parameters: {
        controls: {sort: 'alpha'}
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