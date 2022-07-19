import React from "react";
import {Footer} from "../components/footer";

export default {
    title: 'Footer',
    component: Footer,
    argTypes: {
        showHero: {
            control: {type: 'boolean'}
        }
    }
}

const Template = (args) => <Footer {...args} />;
export const ShowHero = Template.bind({});
ShowHero.args = {
    showHero: true
}
export const HideHero = Template.bind({});
HideHero.args = {
    showHero: false
}