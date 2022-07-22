import React from 'react';
import {useForm, useWatch, useController} from 'react-hook-form';
import {CheckCircleIcon, XCircleIcon} from "@heroicons/react/solid";

export function BookAViewing({vacancyId}) {

    const [refreshFeed, setRefreshFeed] = React.useState(true);
    const [vacancyFeed, setVacancyFeed] = React.useState([]);
    const [propertyOptions, setPropertyOptions] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(false);
    const {control, watch, register, handleSubmit, formState: {errors}, setErrors} = useForm()
    const [suiteOptions, setSuiteOptions] = React.useState([]);
    const suiteWatch = watch('suites');
    const [dayOptions, setDayOptions] = React.useState([
        {label: 'July 21st 2022', value: '2022-07-22', availableSlots: 4},
        {label: 'July 22nd 2022', value: '2022-07-23', availableSlots: 9},
        {label: 'July 23rd 2022', value: '2022-07-24', availableSlots: 0},
        {label: 'July 24th 2022', value: '2022-07-25', availableSlots: 2}
    ])
    const dayWatch = watch('date');
    const propertyWatch = watch('property');

    //get the vacancy feed.  this contains properties and all vacant units that we can use to populate the form.
    React.useEffect(() => {

        if (!refreshFeed) {
            return;
        }

        console.log('getting vacancy feed!');
        setIsLoading(true);
        setRefreshFeed(false);
        fetch('https://api.hollyburn.com/properties/vacancies')
            .then(res => res.json())
            .then(data => {
                setVacancyFeed(data);
                setIsLoading(false);
            })
            .catch(error => {
                setIsLoading(false);
                console.log(error);
            })

    }, [refreshFeed]);

    //the vacancy feed data has been refreshed.
    React.useEffect(() => {
        const properties = vacancyFeed.filter(p => p.hasVacancy).map(p => {
            return {
                label: p.propertyName,
                value: p.propertyHMY
            }
        });
        setPropertyOptions(properties);
    }, [vacancyFeed])

    //property has been changed
    React.useEffect(() => {

        const [selectedProperty] = vacancyFeed.filter(p => p.propertyHMY === parseInt(propertyWatch));
        const {vacancies} = selectedProperty || [];
        setSuiteOptions(vacancies);

    }, [propertyWatch])

    //when a property is select.  this will get and return the suites available for it.
    function AvailableSuites({control}) {

        if (!suiteOptions) {
            return '';
        }

        console.log('hello');
        console.log(suiteOptions);
        console.log(suiteWatch);

        let suiteWatchCleaned = suiteWatch || [];
        if (!Array.isArray(suiteWatchCleaned)) {
            suiteWatchCleaned = [suiteWatchCleaned];
        }
        suiteWatchCleaned = suiteWatchCleaned.map(s => Number(s));

        return (
            <div className={"col-span-2"}>
                <fieldset>
                    <p>
                        Choose suites that match your preference. <br />
                        <span className={"text-xs"}>(Up to a maximum of 3 suites)</span>
                    </p>
                    <div className={"mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4"}>
                        {
                            suiteOptions.map(s => (
                                <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${suiteWatchCleaned.includes(s.vacancyId) ? 'border border-hbBlue' : ''}`} key={s.vacancyId}>
                                    <input type="checkbox" name="suites" value={s.vacancyId} className={"sr-only"} {...register('suites', {required: true})} />
                                    <span className={"flex-1 flex"}>
                                        <span className={"flex flex-col"}>
                                            <CheckCircleIcon className={`${suiteWatchCleaned.includes(s.vacancyId) ? 'h-7 w-7 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2' : 'hidden'}`} />
                                            <span className={"block text-sm font-medium text-gray-900"}>Unit: {s.unitNumber} - ${s.askingRent} monthly</span>
                                            <span className={"block text-sm font-medium text-gray-900"}>Available: <span className={"text-hbGray"}>{s.availableDate}</span></span>
                                        </span>
                                    </span>
                                </label>
                            ))
                        }
                    </div>
                    {errors.suites && <p className={"text-red-600"}>Choose atleast one suite type</p>}
                </fieldset>
            </div>
        )
    }

    //form submission
    const onSubmit = (data) => {
        console.log(data);
    }

    //tailwind classes for the text boxes.
    const textInputClasses = 'py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md';

    return (
        <div className={"py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12"}>

            {/*Loading Widget*/}
            <div className={isLoading ? 'block' : 'hidden'}>
                <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex: 400}}>
                    <img src="/images/loading.gif" height="150px" width="150px" alt="Loading..." />
                    <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}></div>
                </div>
            </div>

            <form className={"mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"} onSubmit={handleSubmit(onSubmit)}>

                {/*Step 1 - Select a Property*/}
                <div className={"col-span-2"}>
                    <label htmlFor={"property"} className={"block text-sm font-medium text-hbGray mb-3"}>Select a Property <br/> <span className={"text-xs"}>(Only properties with vacancies are displayed)</span> </label>
                    <select className={textInputClasses} {...register('property', {required: true})} defaultValue={"Please Select..."}>
                        <option value={"Please Select..."} disabled>Please Select...</option>
                        {
                            propertyOptions.map(p => (
                                <option value={p.value}>{p.label}</option>
                            ))
                        }
                    </select>
                </div>

                {/*Step 2 - Choose Available Suites*/}
                <AvailableSuites control={control} />

                {/*Step 3 - Choose date */}
                <div className={"col-span-2"}>
                    <fieldset>
                        <p>
                            Choose the day you would like to book on. <br />
                            <span className={"text-xs"}>(Please note, we only allow booking up to 4 days in advance)</span>
                        </p>
                        <div className={"mt-4 gap-x-2 grid grid-cols-2 gap-y-4 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-6"}>
                            {
                                dayOptions.map(day => {
                                    return day.availableSlots ?
                                        <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${day.value === dayWatch ? 'border border-hbBlue' : ''}`}>
                                            <input type="radio" name="date" value={day.value} className={"sr-only"} {...register('date', {required: true})} />
                                            <span className={"flex-1 flex"}>
                                                <span className={"flex flex-col"}>
                                                    <CheckCircleIcon className={`${day.value === dayWatch ? 'h-6 w-6 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 ' : 'hidden'}`} />
                                                    <span className={"block text-sm font-medium text-gray-900"}>{day.label}</span>
                                                    <span className={"block text-sm font-medium"}>Available Slots: <span className={"text-green-600"}>{day.availableSlots}</span></span>
                                                </span>
                                            </span>
                                        </label>
                                        :
                                        //No availability
                                        <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex border border-red-400 cursor-not-allowed`}>
                                            <input type="radio" name="date" value={day.value} className={"sr-only"} {...register('date', {required: true})} disabled />
                                            <span className={"flex-1 flex"}>
                                                <span className={"flex flex-col"}>
                                                    <CheckCircleIcon className={`${day.value === dayWatch ? 'h-6 w-6 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 ' : 'hidden'}`} />
                                                    <span className={"block text-sm font-medium text-gray-900"}>{day.label}</span>
                                                    <span className={"block text-sm font-medium"}>Available Slots: <span className={"text-red-600"}>{day.availableSlots}</span></span>
                                                </span>
                                            </span>
                                        </label>
                                })
                            }
                        </div>
                    </fieldset>
                </div>

                {/*Step 4 - Choose a time slot*/}
                <div className={"col-span-2"}>
                    <fieldset>
                        <p>
                            Choose an available timeslot.
                        </p>
                        <div className={"mt-4 gap-x-2 grid grid-cols-2 gap-y-4"}>
                            <label className={"relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none"}>
                                <input type="radio" name="timeslot" className={"sr-only"} {...register('timeslot', {required: true})} />
                                <span className={"flex-1 flex"}>
                                    <span className={"flex flex-col"}>
                                        <CheckCircleIcon className={"h-6 w-6 absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600"} />
                                        <span className={"block text-sm font-medium text-gray-900"}>11:00AM-11:20AM</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    </fieldset>
                </div>

                <div className={"col-span-2 flex justify-end"}>
                    <button type={"submit"} className={"mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium " +
                        "text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"}>
                        Submit
                    </button>
                </div>

            </form>

        </div>
    )
}