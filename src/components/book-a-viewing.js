import React  from 'react';
import {useForm} from 'react-hook-form';
import {CheckCircleIcon, XCircleIcon, InformationCircleIcon} from "@heroicons/react/solid";
import moment from "moment";
import {
    buttonTailwindClasses,
    formatDate,
    formHolderTailwindClasses,
    formTailwindClasses,
    labelTailwindClasses,
    txtInputTailwindClasses
} from "../lib/helpers";

//this form is generally part of a wizard, so instead of submission directly it is given a function that will update state that the wizard is watching
export function BookAViewing({vacancyId, stateSetter, options = {}}) {

    const {buttonText = 'Submit', showBack, handleBackButton, preferences: formPrefs = {},
        showUpdatePrefsBanner, handleUpdatePrefs, formHolderClasses = formHolderTailwindClasses(), formClasses = formTailwindClasses(),
        buttonClasses = buttonTailwindClasses()
    } = options;
    const [refreshFeed, setRefreshFeed] = React.useState(true);
    const [vacancyFeed, setVacancyFeed] = React.useState([]);
    const [propertyOptions, setPropertyOptions] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(false);
    const {control, watch, register, handleSubmit, formState: {errors}, setError, setValue, resetField} = useForm({
        defaultValues: {
            vacancyDisplayType: 'yes'
        }
    })
    const [suiteOptions, setSuiteOptions] = React.useState([]);
    const suiteWatch = watch('suites');
    const [dayOptions, setDayOptions] = React.useState([]);
    const dayWatch = watch('date');
    const propertyWatch = watch('property');
    const [timeOptions, setTimeOptions] = React.useState([]);
    const timeWatch = watch('timeslot');
    const [preferences, setPreferences] = React.useState(formPrefs)
    const vacancyDisplayTypeWatch = watch('vacancyDisplayType');
    const labelClasses = labelTailwindClasses();
    const textInputClasses = txtInputTailwindClasses();

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
                throw error;
            })

    }, [refreshFeed]);

    //the vacancy feed data has been refreshed.
    React.useEffect(() => {

        //if there are preferences and the vacancyDisplayWatch === 'yes' then applying those preferences
        if (preferences && vacancyDisplayTypeWatch === 'yes') {
            const properties = vacancyFeed.filter(p => {
                if (!p.hasVacancy) {
                    return false;
                }
                if (preferences.cities && preferences.cities.length > 0) {
                    if (!preferences.cities.includes(p.city)) {
                        return false
                    }
                }
                if (preferences.neighbourhoods && preferences.neighbourhoods.length > 0) {
                    if (p.neighbourhood === p.city) {
                        return true;
                    }
                    if (!preferences.neighbourhoods.includes(p.neighbourhood)) {
                        return false;
                    }
                }
                const matchedVacancies = p.vacancies.filter(v => {
                    if (preferences.suiteTypes && preferences.suiteTypes.length > 0) {
                        if (!preferences.suiteTypes.map(s => Number(s)).includes(parseInt(v.bedrooms))) {
                            return false;
                        }
                    }
                    if (preferences.maxBudget) {
                        if (parseInt(preferences.maxBudget) < parseInt(v.askingRent)) {
                            return false
                        }
                    }
                    return true;
                })
                if (!matchedVacancies || matchedVacancies.length === 0) {
                    return false;
                }
                return true;
            }).map(p => {
                return {
                    label: p.propertyName,
                    value: p.propertyHMY
                }
            });
            setPropertyOptions(properties);
        }
        else {
            const properties = vacancyFeed.filter(p => p.hasVacancy).map(p => {
                return {
                    label: p.propertyName,
                    value: p.propertyHMY
                }
            });
            setPropertyOptions(properties);
        }

        if (vacancyId) {
            try {
                if (Number(vacancyId)) {
                    //trying to find the vacancy
                    let vacancy;
                    const [property] = vacancyFeed.filter(p => {
                        if (p.vacancies && p.vacancies.length > 0) {
                            for (const v of p.vacancies) {
                                if (v.vacancyId === parseInt(vacancyId)) {
                                    vacancy = v;
                                    return true;
                                }
                            }
                        }
                    })
                    if (property && vacancy) {
                        setValue('property', property.propertyHMY)
                        setValue('suites', [vacancy.vacancyId]);
                    }
                }
            }
            catch (e) {
                console.log('unable to load from vacancyId');
                console.log(e);
            }
        }

        setValue('property', 'Please Select...');
        resetField('suites');
        resetField('date');
        resetField('timeslot');

    }, [vacancyFeed, vacancyDisplayTypeWatch])

    //property has been changed
    React.useEffect(() => {
        const [selectedProperty] = vacancyFeed.filter(p => p.propertyHMY === parseInt(propertyWatch));
        const {vacancies} = selectedProperty || [];

        //if there are preferences then apply them
        if (preferences && vacancyDisplayTypeWatch === 'yes' && vacancies && vacancies.length > 0) {
            const filteredVacancies = vacancies.filter(v => {
                if (preferences.maxBudget) {
                    if (parseInt(v.askingRent) > parseInt(preferences.maxBudget)) {
                        return false;
                    }
                }
                if (preferences.suiteTypes && preferences.suiteTypes.length > 0) {
                    if (!preferences.suiteTypes.map(s => Number(s)).includes(parseInt(v.bedrooms))) {
                        return false;
                    }
                }
                return true;
            })
            setSuiteOptions(filteredVacancies);
        }
        else {
            setSuiteOptions(vacancies);
        }

        //resetting fields
        resetField('suites');
        resetField('date');
        resetField('timeslot');

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
        resetField('timeslot');
        resetField('date');

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
                throw error;
            })


    }, [suiteWatch])

    //timeslots
    React.useEffect(() => {

        if (!dayWatch) {
            return;
        }

        resetField('timeslot')

        //finding the timeslots that match the selected day.
        const [{timeSlots}] = dayOptions.filter(d => d.value === dayWatch);
        if (timeSlots) {
            const timeSlotOptions = timeSlots.map((t, index) => {
                return {
                    start: moment(t.start).format('h:mm A'),
                    end: moment(t.end).format('h:mm A'),
                    key: index,
                    value: `${moment(t.start).format('YYYY-MM-DDTHH:mm:ss')}to${moment(t.end).format('YYYY-MM-DDTHH:mm:ss')}`,
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
                                    <input type="checkbox" name="suites" value={s.vacancyId} className={"sr-only"} {...register('suites', {required: 'Please select atleast one suite'})} disabled={suiteWatchCleaned.length > 2 && !suiteWatchCleaned.includes(s.vacancyId) ? true: false} />
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
                    <div className={"mt-4 gap-x-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-4"}>
                        {
                            dayOptions.map(day => {
                                return day.availableSlots ?
                                    <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${day.value === dayWatch ? 'border border-hbBlue' : ''}`} key={day.value}>
                                        <input type="radio" name="date" value={day.value} className={"sr-only"} {...register('date', {required: 'Please select a viewing day.'})} />
                                        <span className={"flex-1 flex"}>
                                            <div className={"flex w-3/4"}>
                                                <span className={"flex flex-col"}>
                                                    <span className={"block text-sm font-medium text-gray-900"}>{day.label}</span>
                                                    <span className={"block text-sm font-medium"}>Available Slots: <span className={"text-green-600"}>{day.availableSlots}</span></span>
                                                </span>
                                            </div>
                                                <span className={"flex items-center w-1/4 justify-end"}>
                                                    <CheckCircleIcon className={`${day.value === dayWatch ? 'h-6 w-6 text-green-600' : 'hidden'}`} />
                                                </span>
                                            </span>
                                    </label>
                                    :
                                    //No availability
                                    <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex border border-red-400 cursor-not-allowed`} key={day.value}>
                                        <input type="radio" name="date" value={day.value} className={"sr-only"} {...register('date', {required: true})} disabled />
                                        <span className={"flex-1 flex"}>
                                                <span className={"flex flex-col"}>
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
            <div className={`col-span-2`}>
                <fieldset>
                    <p>
                        Choose an available timeslot.
                    </p>
                    <div className={"mt-4 gap-x-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4"}>
                        {
                            timeOptions.map(t => (
                                <label className={`relative bg-white border rounded-lg shadow-sm p-4 flex cursor-pointer focus:outline-none ${timeWatch === t.value ? 'border border-hbBlue' :''}`} key={t.key}>
                                    <input type="radio" name="timeslot" className={"sr-only"} {...register('timeslot', {required: 'Please select a viewing time.'})} value={t.value} />
                                    <span className={"flex-1 flex"}>
                                        <span className={"flex flex-none w-3/4 justify-center"}>
                                            <span className={"block text-sm font-medium text-gray-900"}>{t.start} - {t.end}</span>
                                        </span>
                                        <span className={"flex items-center w-1/4 flex-none justify-center"}>
                                            <CheckCircleIcon className={`${timeWatch === t.value ? 'h-6 w-6 text-green-600' : 'hidden'}`} />
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

    //errors
    function FormErrors() {

        if (!errors || Object.keys(errors).length === 0) {
            return '';
        }

        return (
            <div className={"col-span-2 ring ring-1 ring-red-500 rounded-md p-5 my-5 w-full"}>
                <div className="flex">
                    {
                        Object.keys(errors).map(key => (
                            <div className={"flex"} key={key}>
                                <div className={"flex justify-start items-center"}>
                                    <XCircleIcon className={"text-red-600 h-10 w-10"} />
                                </div>
                                <div className={"flex text-red-600 items-center ml-2"}>
                                    {errors[key].message}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        )

    }

    //form submission
    const onSubmit = (data) => {

        //making sure property is not 'Please Select...'
        const {property, suites, timeslot} = data;
        if (property === 'Please Select...') {
            setError('property',{message: 'Please select a property.'});
            return;
        }

        const vacancyIds = Array.isArray(suites) ? suites : [parseInt(suites)];
        const vacancies = [];
        vacancyFeed.filter(p=>p.hasVacancy).map(p => {
            for (const v of p.vacancies) {
                if (vacancyIds.includes(v.vacancyId)) {
                    console.log('matched');
                    vacancies.push(v);
                }
            }
        })

        //constructing the state data.
        const stateData = {
            result: true,
            property: Number(property),
            suites: vacancies,
            startDate: timeslot.split('to')[0],
            endDate: timeslot.split('to')[1]
        }
        if (stateSetter && typeof stateSetter === 'function') {
            stateSetter(stateData);
        }
        else {
            console.log('Unable to set state.  stateSetter is not a function.');
            console.log('state data:');
            console.log(stateData);
        }

    }

    return (
        <div className={formHolderClasses}>

            {/*Loading Widget*/}
            <div className={isLoading ? 'block' : 'hidden'}>
                <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}></div>
                <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex: 400}}>
                    <img src="/images/loading.gif" height="150px" width="150px" alt="Loading..." />
                </div>
            </div>

            <form className={formClasses} onSubmit={handleSubmit(onSubmit)}>

                {/*Display type.  Filtered on preferences or shows all vacancies*/}
                <div className={"col-span-2 sm:col-span-1"}>
                    <fieldset>
                        <label htmlFor={"vacancy-display-type"} className={"block text-sm font-medium text-hbGray mb-3"}>Filter based on preferences?</label>
                    </fieldset>
                    <div className={"relative inline-flex items-start pr-4"}>
                        <div className={"flex items-center h-5"}>
                            <input id={'vacancy-display-yes'} type={"radio"} className={"focus:ring-hbBlue h-4 w-4 text-hbBlue border-gray-300 rounded"}
                                   value={'yes'} {...register("vacancyDisplayType")} />
                        </div>
                        <div className={"ml-3 text-sm"}>
                            <label htmlFor={'vacancy-display-yes'} className={"font-medium text-gray-700"}>Yes</label>
                        </div>
                    </div>
                    <div className={"relative inline-flex items-start pr-4"}>
                        <div className={"flex items-center h-5"}>
                            <input id={'vacancy-display-yes'} type={"radio"} className={"focus:ring-hbBlue h-4 w-4 text-hbBlue border-gray-300 rounded"}
                                   value={'no'} {...register("vacancyDisplayType")} />
                        </div>
                        <div className={"ml-3 text-sm"}>
                            <label htmlFor={'vacancy-display-yes'} className={"font-medium text-gray-700"}>No</label>
                        </div>
                    </div>
                </div>

                {/*update preferences banner*/}
                {showUpdatePrefsBanner && vacancyDisplayTypeWatch === 'yes' && handleUpdatePrefs && typeof handleUpdatePrefs === 'function' && propertyOptions.length > 0 &&
                    <div className={"col-span-2"}>
                        <div className="rounded-md bg-white p-4 border border-gray-300">
                            <div className={"flex"}>
                                <div className="flex-shrink-0 items-center flex">
                                    <InformationCircleIcon className="h-5 w-5 text-hbBlue" aria-hidden="true" />
                                </div>
                                <div className="flex-1 md:flex md:justify-between">
                                    <p className="flex items-center ml-1">Not seeing what you need?</p>
                                    <p className="flex items-center">
                                        <button type="button" className={"w-full inline-flex items-center justify-center px-6 py-1 border border-transparent rounded-md shadow-sm text-base " +
                                            "text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"} onClick={event => handleUpdatePrefs(event)}>Update Preferences</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                {/*Step 1 - Select a Property*/}
                {
                    propertyOptions && propertyOptions.length > 0 &&
                    <div className={"col-span-2"}>
                        <label htmlFor={"property"} className={labelClasses}>Select a Property <br/> <span className={"text-xs"}>{vacancyDisplayTypeWatch === 'yes' ? '(Vacancies are filtered by your preferences)' : '(Only properties with vacancies are displayed)'}</span> </label>
                        <div className={"mt-1"}>
                            <select className={textInputClasses} {...register('property', {required: "Please select a property."})} defaultValue={"Please Select..."}>
                                <option value={"Please Select..."} disabled>Please Select...</option>
                                {
                                    propertyOptions.map(p => (
                                        <option value={p.value} key={p.value}>{p.label}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                }
                {
                    !propertyOptions || propertyOptions.length === 0 &&
                    <div className="col-span-2">
                        <div className="rounded-md bg-white p-4 border border-red-400">
                            <div className="flex">
                                <div className="flex-shrink-0 items-center flex">
                                    <InformationCircleIcon className="h-5 w-5 text-hbBlue" aria-hidden="true" />
                                </div>
                                <div className="flex-1 md:flex md:justify-between">
                                    <p className="flex items-center ml-1">There are currently no vacancies available that match your preferences.</p>
                                    <p className="flex items-center">
                                        <button type="button" className={"w-full inline-flex items-center justify-center px-6 py-1 border border-transparent rounded-md shadow-sm text-base " +
                                            "text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"} onClick={event => handleUpdatePrefs(event)}>Update Preferences</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                }


                {/*Step 2 - Choose Available Suites*/}
                <AvailableSuites control={control} />

                {/*Step 3 - Choose date */}
                <AvailableDays control={control} />

                {/*Step 4 - Choose a time slot*/}
                <AvailableTimeSlots control={control} />

                <FormErrors control={control} />

                <div className={"col-span-2 flex justify-end"}>
                    {showBack && handleBackButton &&
                        <>
                            <button type="button" className={`${buttonClasses} mr-1`} onClick={event => handleBackButton(event)} >Back</button>
                            &nbsp;
                        </>
                    }
                    <button type={"submit"} className={buttonClasses}>
                        {buttonText}
                    </button>
                </div>

            </form>

        </div>
    )
}