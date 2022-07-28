import React from 'react';
import {BookAViewing} from "../components/book-a-viewing";
export default {
    title: 'Book A Viewing',
    component: BookAViewing,
    argTypes: {
        vacancyId: {
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
            <BookAViewing {...args} />
        </div>
    )
}

export const Standard = Template.bind({});
Standard.args = {};

export const PrefsTorontoStudio1Bed = Template.bind({});
PrefsTorontoStudio1Bed.args = {
    options: {
        preferences: {
            moveIn: '2022-09-01',
            suiteTypes: [0,1],
            cities: ['Toronto']
        },
        showUpdatePrefsBanner: true,
        handleUpdatePrefs: () => {
            console.log('hello')
        }
    }
}

export const PrefsToronto1Bed2100Max = Template.bind({})
PrefsToronto1Bed2100Max.args = {
    options: {
        preferences: {
            suiteTypes: [1],
            cities: ['Toronto'],
            maxBudget: 2100
        },
        showUpdatePrefsBanner: true,
        handleUpdatePrefs: () => {
            console.log('hello')
        }
    }
}

export const PrefsVancouver3BedWestEnd4500Max = Template.bind({});
PrefsVancouver3BedWestEnd4500Max.args = {
    options: {
        preferences: {
            suiteTypes: [3],
            cities: ['Vancouver', 'North Vancouver', 'West Vancouver'],
            neighbourhoods: ['West End'],
            maxBudget: 4500
        },
        showUpdatePrefsBanner: true,
        handleUpdatePrefs: () => {
            console.log('hello')
        }
    }
}