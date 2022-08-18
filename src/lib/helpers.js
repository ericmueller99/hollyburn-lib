import moment from 'moment';

export const formatDate = (date) => {
    let d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    let year = d.getFullYear();
    if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }
    return [year, month, day].join('-');
}

export const formatDateMMMD = (date) => {
    const d = moment(date);
    return d.format('MMM D');
}

export const txtInputTailwindClasses = () => {
    return 'py-3 px-4 block w-full shadow-sm border border-gray-300 rounded-md focus:ring-hbBlue outline-hbBlue';
}

export const formTailwindClasses = () => {
    return 'mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8';
}

export const labelTailwindClasses = () => {
    return 'block text-sm font-medium text-hbGray';
}

export const checkboxTailwindClasses = () => {
    return 'focus:ring-hbBlue h-4 w-4 text-hbBlue border-gray-300 rounded outline-hbBlue';
}

export const formHolderTailwindClasses = () => {
    return 'py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12';
}

export const txtInputHolderTailwindClasses = () => {
    return 'col-span-2 sm:col-auto';
}

export const buttonTailwindClasses = () => {
    return 'mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto'
}

export const hbOrangeButtonClasses = () => {
    return 'cursor-pointer bg-hbOrange hover:bg-hbOrangeHover mt-2 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium';
}

//converts suite type numbers to a friendly name for labels
export const suiteTypeMapper = (suiteTypeNumber) => {
    const suiteTypesNames = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4 Bedroom', '5 Bedroom'];
    return suiteTypesNames[suiteTypeNumber];
}

//sort property options by optGroup property
export const sortOptGroups = (a, b) => {
    if (a.optGroup < b.optGroup) {
        return -1;
    }
    if (a.optGroup > b.optGroup) {
        return 1;
    }
    return 0;
}

//return an array that build opt groups via JSX
export const propertyOptGroupBuilder = (propertyOptions) => {
    const options = [];
    propertyOptions.map(p => {
        if (options.filter(o => o.optGroup === p.optGroup).length === 0) {
            options.push({
                optGroup: p.optGroup,
                data: [p]
            })
        }
        else {
            options.forEach(o => {
                if (o.optGroup === p.optGroup) {
                    console.log(p.optGroup);
                    o.data.push(p);
                }
            })
        }
    })
    return options.sort(sortOptGroups);
}