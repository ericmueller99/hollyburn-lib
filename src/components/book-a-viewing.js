import React, {useMemo} from 'react';
import {useForm, useWatch, useController} from 'react-hook-form';
import {CheckCircleIcon, XCircleIcon} from "@heroicons/react/solid";
import moment from "moment";

const getAsync = (asyncCallback) => {
    const [state, setState] = React.useState(null);
    React.useEffect(() => {
        const promise = asyncCallback();
        if (!promise) {
            return;
        }
        promise
            .then(res => res.json())
            .then(data => {
                setState(data)
            })
            .catch(error => {
                console.log(error);
            })
    }, [asyncCallback])
    return state;
}

const eqSet = (as, bs) => {
    if (as.size !== bs.size) {
        return false;
    }
    for (const a of as) {
        if (!bs.has(a)) {
            return false;
        }
    }
    return true;
}

//format the date into yyyy-mm-dd for the api endpoint
const formatDate = (date) => {
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

export function BookAViewing({vacancyId}) {

    const [refreshFeed, setRefreshFeed] = React.useState(true);
    const [vacancyFeed, setVacancyFeed] = React.useState([]);
    const [propertyOptions, setPropertyOptions] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(false);
    const {control, watch, register, handleSubmit, formState: {errors}, setErrors, setValue} = useForm()
    const [suiteOptions, setSuiteOptions] = React.useState([]);
    const suiteWatch = watch('suites');
    const [dayOptions, setDayOptions] = React.useState([]);
    const dayWatch = watch('date');
    const propertyWatch = watch('property');
    const [timeOptions, setTimeOptions] = React.useState([]);
    const timeWatch = watch('timeslot');

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
        setDayOptions([])
        setValue('suites', []);
    }, [propertyWatch])

    //day options.
    React.useEffect(() => {

        if (!suiteWatch || suiteWatch.length === 0) {
            setDayOptions([]);
            setTimeOptions([]);
            return;
        }

        if (isLoading) {
            return
        }

        //clean the suite watch into an array of numbers and get the property information from the vacancyFeed state.
        const suiteWatchCleaned = Array.isArray(suiteWatch) ? new Set(suiteWatch.map(s => Number(s))) : new Set([Number(suiteWatch)]);
        const [property] = vacancyFeed.filter(p => p.hasVacancy === true).filter(p => {
            for (const v of p.vacancies) {
                if (suiteWatchCleaned.has(v.vacancyId)) {
                    return true;
                }
            }
        });

        if (!property) {
            return;
        }

        setIsLoading(true);

        //format the startDate and endDate time
        const currentDate = new Date();
        const oneDayInMillis = 100800000; //28 hours to give a bit of a buffer for notices etc...
        const availabilityStart = new Date(currentDate.getTime() + oneDayInMillis);
        const availabilityEnd = new Date(currentDate.getTime() + (oneDayInMillis*5));
        const numberOfSuites = suiteWatchCleaned.size;
        const url = `https://api.hollyburn.com/properties/property/${property.propertyHMY}/availability/?startDate=${formatDate(availabilityStart)}&endDate=${formatDate(availabilityEnd)}&numberOfSuites=${numberOfSuites}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setIsLoading(false);
                const dayInterval = new Date(availabilityStart);
                const availabilityByDay = [];
                while (dayInterval <= availabilityEnd) {
                    availabilityByDay.push({
                        label: formatDate(dayInterval),
                        value: formatDate(dayInterval),
                        availableSlots: data.filter(d => {
                            const start = new Date(d.start);
                            return start.getDate() === dayInterval.getDate()
                        }).length,
                        timeSlots: data.filter(d => {
                            const start = new Date(d.start);
                            return start.getDate() === dayInterval.getDate()
                        })
                    })
                    dayInterval.setDate(dayInterval.getDate() + 1);
                }
                setDayOptions(availabilityByDay);

            })
            .catch(error => {
                setIsLoading(false);
                console.log(error);
            })


    }, [suiteWatch])

    //timeslots
    React.useEffect(() => {

        if (!dayWatch) {
            return;
        }

        //finding the timeslots that match the selected day.
        const [{timeSlots}] = dayOptions.filter(d => d.value === dayWatch);
        if (timeSlots) {
            const timeSlotOptions = timeSlots.map((t, index) => {
                return {
                    start: moment(t.start).format('h:m A'),
                    end: moment(t.end).format('h:m A'),
                    key: index,
                    value: `${t.start}-${t.end}`,
                }
            })
            setTimeOptions(timeSlotOptions)
        }

    }, [dayWatch])

    //when a property is select.  this will get and return the suites available for it.
    function AvailableSuites() {

        if (!suiteOptions || suiteOptions.length === 0) {
            return '';
        }

        let suiteWatchCleaned = suiteWatch || [];
        if (!Array.isArray(suiteWatchCleaned)) {
            suiteWatchCleaned = [suiteWatchCleaned];
        }
        suiteWatchCleaned = suiteWatchCleaned.map(s => Number(s));

        const bedroomToText = (bedrooms) => {
            const text = ['Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom']
            return text[bedrooms];
        }

        return (
            <div className={"col-span-2"}>
                <fieldset>
                    <p>
                        Choose suites that match your preference. <br />
                        <span className={"text-xs"}>(Up to a maximum of 3 suites)</span>
                    </p>
                    <div className={"mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4"}>
                        {
                            suiteOptions.map(s => (
                                <label className={`${suiteWatchCleaned.length > 2 && !suiteWatchCleaned.includes(s.vacancyId) ? 'cursor-not-allowed' : 'hover:border-hbBlue'} relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${suiteWatchCleaned.includes(s.vacancyId) ? 'border border-hbBlue' : ''}`} key={s.vacancyId}>
                                    <input type="checkbox" name="suites" value={s.vacancyId} className={"sr-only"} {...register('suites', {required: true})} disabled={suiteWatchCleaned.length > 2 && !suiteWatchCleaned.includes(s.vacancyId) ? true: false} />
                                    <span className={"flex-1 flex"}>
                                        <span className={"flex flex-col"}>
                                            <CheckCircleIcon className={`${suiteWatchCleaned.includes(s.vacancyId) ? 'h-7 w-7 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2' : 'hidden'}`} />
                                            <span className={"block text-sm font-medium text-gray-900"}>Unit: {s.unitNumber} - {bedroomToText(s.bedrooms)}</span>
                                            <span className={"block text-sm font-medium text-gray-900"}>Asking Rent: ${s.askingRent} monthly</span>
                                            <span className={"block text-sm font-medium text-gray-900"}>Available from: {s.availableDate}</span>
                                            <span className={"block text-xs text-gray-900"}>{s.features.toString().replace(/,/g, ', ')}, {s.flooring}, {s.countertops}</span>
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

    //days and time slots available based on the property & unit(s) selected.
    function AvailableDays() {

        if (!suiteWatch || suiteWatch.length === 0 || !suiteOptions || suiteOptions.length === 0) {
            return '';
        }

        return (
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
                                    <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${day.value === dayWatch ? 'border border-hbBlue' : ''}`} key={day.value}>
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
                                    <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex border border-red-400 cursor-not-allowed`} key={day.value}>
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
        )
    }

    //available timeslots of the property/suites/day selected.
    function AvailableTimeSlots() {

        if (!dayWatch || dayOptions.length === 0) {
            return '';
        }

        return (
            <div className={"col-span-2"}>
                <fieldset>
                    <p>
                        Choose an available timeslot.
                    </p>
                    <div className={"mt-4 gap-x-2 grid grid-cols-4 gap-y-4"}>
                        {
                            timeOptions.map(t => (
                                <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${timeWatch === t.value ? 'border-hbBlue' :''}`} key={t.key}>
                                    <input type="radio" name="timeslot" className={"sr-only"} {...register('timeslot', {required: true})} value={t.value} />
                                    <span className={"flex-1 flex"}>
                                    <span className={"flex flex-col"}>
                                        <CheckCircleIcon className={`${timeWatch === t.value ? 'h-6 w-6 absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600' : 'hidden'}`} />
                                        <span className={"block text-sm font-medium text-gray-900"}>{t.start} - {t.end}</span>
                                    </span>
                                </span>
                                </label>
                            ))
                        }
                    </div>
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
                                <option value={p.value} key={p.value}>{p.label}</option>
                            ))
                        }
                    </select>
                </div>

                {/*Step 2 - Choose Available Suites*/}
                <AvailableSuites control={control} />

                {/*Step 3 - Choose date */}
                <AvailableDays control={control} />

                {/*Step 4 - Choose a time slot*/}
                <AvailableTimeSlots control={control} />

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