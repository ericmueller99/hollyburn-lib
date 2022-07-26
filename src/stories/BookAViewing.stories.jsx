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