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