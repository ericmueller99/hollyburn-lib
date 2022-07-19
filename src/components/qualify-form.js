import React from "react";
import DatePicker from "react-datepicker";
import "../styles/react-datepicker.css";
import Image from "next/image";
import {useForm, Controller, useWatch} from 'react-hook-form';
import moment from 'moment';
import axios from "axios";
import {XCircleIcon} from "@heroicons/react/solid";

export function QualifyForm ({firstName, lastName, emailAddress, phoneNumber, maxBudget, moveIn, numberOfOccupants, utmCampaign, utmSource, utmMedium, utmContent, utmTerm, setFormCompleted, submitUrl = '/api/submit'}) {

    //form options.  Later this can be updated to a CRM or API endpoint.  For now this is fine.
    const occupantOptions = [
        {label: 1, value: 1},
        {label: 2, value: 2},
        {label: 3, value: 3},
        {label: 4, value: 4},
        {label: 5, value: 5},
    ]
    const suiteTypeOptions = [
        {name: 'Studio', value: 0, fieldName: 'suiteType-0'},
        {name: "1 Bedroom", value: 1, fieldName: 'suiteType-1'},
        {name: '2 Bedroom', value: 2, fieldName: 'suiteType-2'},
        {name: "3 Bedroom", value: 3, fieldName: 'suiteType-3'}
    ]
    const cityOptions = [
        {name: 'Ottawa', value: 'Ottawa', fieldName: 'city-ottawa'},
        {name: 'Vancouver', value: 'Vancouver', fieldName: 'city-vancouver'},
        {name: 'Toronto', value: 'Toronto', fieldName: 'city-toronto'},
        {name: 'Calgary', value: 'Calgary', fieldName: 'city-calgary'},
        {name: 'West Vancouver', value: 'West Vancouver', fieldName: 'city-westVancouver'},
        {name: 'North Vancouver', value: 'North Vancouver', fieldName: 'city-northVancouver'}
    ];
    const neighbourhoodOptions = [
        {name: 'West End', value: 'West End', fieldName: 'west-end', inCity: 'Vancouver'},
        {name: 'South Granville', value: 'South Granville', fieldName: 'south-granville', inCity: 'Vancouver'},
        {name: 'Kitsilano', value: 'Kitsilano', fieldName: 'kitsilano', inCity: 'Vancouver'},
        {name: 'UBC Point Grey', value: 'UBC Point Grey', fieldName: 'ubc', inCity: 'Vancouver'},
        {name: 'Kerrisdale', value: 'Kerrisdale', fieldName: 'kerrisdale', inCity: 'Vancouver'},
        {name: 'Oakridge', value: 'Oakridge', fieldName: 'oakridge', inCity: 'Vancouver'},
        {name: 'Marpole', value: 'Marpole', fieldName: 'marpole', inCity: 'Vancouver'},
        {name: 'Downtown Toronto', value: 'Downtown Toronto', fieldName: 'downtown-toronto', inCity: 'Toronto'},
        {name: 'The Annex', value: 'The Annex', fieldName: 'the-annex', inCity: 'Toronto'},
        {name: 'Etobicoke', value: 'Etobicoke', fieldName: 'etobicoke', inCity: 'Toronto'},
        {name: 'Yorkville', value: 'Yorkville', fieldName: 'yorkville', inCity: 'Toronto'},
    ];

    function NeighbourhoodOptions({control}) {

        //subscribing to change events for the cities options
        const cities = useWatch({
            control,
            name: 'cities'
        });
        if (cities) {

            //which neighbourhoods should be shown ?
            const neighbourhoods = neighbourhoodOptions.filter(n => cities.includes(n.inCity));

            if (neighbourhoods.length === 0) {
                return '';
            }

            return (
                <>
                    <div className={"col-span-2 sm:col-auto"}>
                        <label className={"font-medium text-sm"}>*Interested Neighbourhoods</label>
                    </div>
                    <div className={"col-span-2"}>
                        {neighbourhoods.map(n => (
                            <div className={"relative inline-flex items-start pr-4"} key={n.fieldName}>
                                <div className={"flex items-center h-5"}>
                                    <input id={n.fieldName} type={"checkbox"} className={"focus:ring-hbBlue h-4 w-4 text-hbBlue border-gray-300 rounded"}
                                           value={n.value} {...register("neighbourhoods", {required: true})} />
                                </div>
                                <div className={"ml-3 text-sm"}>
                                    <label htmlFor={n.fieldName} className={"font-medium text-gray-700"}>{n.name}</label>
                                </div>
                            </div>
                        ))}
                        {errors.neighbourhoods && <p className={"text-red-600"}>Please select atleast one neighbourhood</p> }
                    </div>
                </>
            )


        }

        return '';

    }

    const {control, register, handleSubmit, formState: {errors}, setError} = useForm();
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasCriticalError, setHasCriticalError] = React.useState(false)
    const [criticalErrorMessage, setCriticalErrorMessage] = React.useState('');

    //form submission
    const onSubmit = (data) => {

        data = {...data, utmCampaign, utmSource, utmMedium, utmContent, utmTerm}

        //date checks
        const currentDate = moment();
        const parsedMoveIn = moment(data.moveIn);
        if (!parsedMoveIn.isValid()) {
            setError('moveIn', {type: 'custom', message: "move in date does not appear to be valid"});
            return;
        }
        if (parsedMoveIn.diff(currentDate, 'year') > 2) {
            setError('moveIn', {type: 'custom', message: 'Choose a move-in within 2 years of today.'});
            return;
        }

        //prevent double posts
        if (isLoading) {
            return;
        }

        //send the request to the api endpoint
        setHasCriticalError(false);
        setIsLoading(true);
        axios.post(submitUrl, data)
            .then(res => {
                console.log(res);
                setIsLoading(false);
                setFormCompleted(true);
            })
            .catch(error => {
                setHasCriticalError(true);
                setCriticalErrorMessage(error.response.data.errorMessage || "Unknown Error");
                setIsLoading(false);
            })

    }

    //tailwind css classes for the form fields.
    const textInputClasses = 'py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md';

    return (
        <div className={"py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12"}>
            {/*loading widget*/}
            <div className={isLoading ? 'block' : 'hidden'}>
                <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex:500}}>
                    <Image src={"/images/loading.gif"} height={150} width={150} priority={true} />
                </div>
                <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}>

                </div>
            </div>
            {/*form header*/}
            <h3 className={"text-lg font-medium text-gray-900 font-bold"}>Personal Information</h3>
            {/*form*/}
            <form className={"mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"} onSubmit={handleSubmit(onSubmit)}>

                {/*First Name*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"first-name"} className={"block text-sm font-medium text-gray-900"}>*First Name</label>
                    <div className={"mt-1"}>
                        <input type={"text"} {...register('firstName', {required: true, maxLength: 50})}
                               className={textInputClasses} value={firstName} />
                        {errors.firstName && <p className={"text-red-600"}>First name is a required.</p>}
                    </div>
                </div>

                {/*Last Name*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"last-name"} className={"block text-sm font-medium text-gray-900"}>*Last Name</label>
                    <div className={"mt-1"}>
                        <input type={"text"} {...register('lastName', {required: true, maxLength: 50})}
                               className={textInputClasses} value={lastName} />
                        {errors.lastName && <p className={"text-red-600"}>Last name is required.</p>}
                    </div>
                </div>

                {/*Email Address*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"email"} className={"block text-sm font-medium text-gray-900"}>
                        *Email Address
                    </label>
                    <div className={"mt-1"}>
                        <input type={"email"} value={emailAddress} {...register("emailAddress", {pattern: /\S+@\S+\.\S+/, required: true})} className={textInputClasses} />
                        {errors.emailAddress && <p className={"text-red-600"}>Email address is not valid.</p>}
                    </div>
                </div>

                {/*Phone Number*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"phone"} className={"block text-sm font-medium text-gray-900"}>
                        *Phone Number
                    </label>
                    <div className={"mt-1"}>
                        <input value={phoneNumber} type={"tel"} className={textInputClasses} {...register('phoneNumber', {pattern: /^(0|[1-9]\d*)(\.\d+)?$/,required: true, maxLength: 50})} />
                        {errors.phoneNumber && <p className={'text-red-600'}>Valid phone number is required.</p>}
                    </div>
                </div>

                <h3 className={"text-lg font-medium font-bold text-gray-900 col-span-2"}>Preferences</h3>

                {/*Suite Types*/}
                <div className={"col-span-2"}>
                    <label className={"font-medium text-sm"}>*Suite Types</label>
                </div>
                <div className={"col-span-2"}>
                    {suiteTypeOptions.map(e => (
                        <div className="relative inline-flex items-start pr-4" key={e.name}>
                            <div className="flex items-center h-5">
                                <input id={e.fieldName} name={'suiteTypes'} type="checkbox"
                                       className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                       value={e.value} {...register("suiteTypes", {required: true})}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={e.fieldName} className="font-medium text-gray-700">
                                    {e.name}
                                </label>
                            </div>
                        </div>
                    ))}
                    {errors.suiteTypes && <p className={"text-red-600"}>Please select atleast one suite type</p>}
                </div>

                {/* max budget*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"max-budget"} className={"block text-sm font-medium text-gray-900"}>*Maximum Budget</label>
                    <div className={"mt-1"}>
                        <input value={maxBudget} type={"number"} className={textInputClasses} {...register('maxBudget', {required: true, max: 9999, min: 500})} />
                        {errors.maxBudget && <p className={"text-red-600"}>Max budget must be between 500 and 9999</p>}
                    </div>
                </div>

                {/*move-in date*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"move-in"} className={"font-medium text-sm"}>
                        *Desired Move-in Date
                    </label>
                    <div className={"mt-1 datepicker"}>
                        <Controller render={({ field }) => (
                            <DatePicker value={moveIn} selected={field.value} onChange={(date) => field.onChange( date )} dateFormat={"yyyy-MM-dd"} className={textInputClasses} placeholderText={"Select Date"}
                            />
                        )} name="moveIn" control={control} rules={{required: true}} />
                        {errors.moveIn && <p className={"text-red-600"}> {errors.moveIn.message ? errors.moveIn.message : 'Move-in is required.'}  </p>}
                    </div>
                </div>

                {/*Pet friendly*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label className={"font-medium text-sm"}>
                        Pet Friendly Required?
                    </label>
                    <div className={"mt-4"}>
                        <div className="relative inline-flex items-start pr-4">
                            <div className="flex items-center h-5">
                                <input id={"pet-friendly"} name={'pet-friendly'} type="checkbox"
                                       className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                       value={'Yes'} {...register("petFriendly")}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor={"pet-friendly"} className="font-medium text-gray-700">
                                    Yes
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/*Number of Occupants*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"occupants"} className={"text-sm font-medium"}>Number Of Occupants</label>
                    <div>
                        <select id={"occupants"} name={"occupants"} defaultValue={numberOfOccupants} className={textInputClasses} {...register('numberOfOccupants', {required: true})}>
                            {occupantOptions.map(e => (
                                <option key={e.value} value={e.value}>{e.label}</option>
                            ))}
                        </select>
                        {errors.numberOfOccupants && <p className={"text-red-600"}>Number of occupants is required.</p>}
                    </div>
                </div>

                {/*City Interest*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label className={"font-medium text-sm"}>Interested Cities</label>
                </div>
                <div className={"col-span-2"}>
                    {cityOptions.map(city => (
                        <div className={"relative inline-flex items-start pr-4"} key={city.fieldName}>
                            <div className={"flex items-center h-5"}>
                                <input id={city.fieldName} type={"checkbox"} className={"focus:ring-hbBlue h-4 w-4 text-hbBlue border-gray-300 rounded"}
                                       value={city.value} {...register("cities", {required: true})} />
                            </div>
                            <div className={"ml-3 text-sm"}>
                                <label htmlFor={city.fieldName} className={"font-medium text-gray-700"}>{city.name}</label>
                            </div>
                        </div>
                    ))}
                    {errors.cities && <p className={"text-red-600"}>Please select atleast one city</p> }
                </div>

                {/*Neighbourhoods*/}
                <NeighbourhoodOptions control={control} />

                {/*Critical Error*/}
                {
                    hasCriticalError &&
                    <div className={"col-span-2"}>
                        <div className="rounded-md bg-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XCircleIcon className="h-7 w-7 text-white" aria-hidden="true" />
                                </div>
                                <div className="ml-3 flex-1 md:flex md:justify-between text-center">
                                    <p className={"text-white"}>{criticalErrorMessage}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                }


                {/*Submit button*/}
                <div className={"sm:col-span-2 sm:flex sm:justify-end"}>
                    <button type={"submit"} className={"mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium " +
                        "text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"}>
                        Submit
                    </button>
                </div>

            </form>
        </div>
    )
}
