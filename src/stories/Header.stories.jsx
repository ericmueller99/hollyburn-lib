import React from 'react';

import { Header } from '../components/header';

export default {
  title: 'Header',
  component: Header,
};

const Template = (args) => <Header {...args} />;

export const Standard = Template.bind({});
Standard.args = {};