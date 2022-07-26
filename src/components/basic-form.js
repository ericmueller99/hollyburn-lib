import React from 'react';
import {useForm} from 'react-hook-form';
import Image from "next/image";

export function BasicForm({stateSetter, firstName = '', lastName = '', emailAddress = '', phoneNumber = '', options = {}}) {

    //options
    const {buttonText = 'Submit'} = options;

    //state management
    const [isLoading, setIsLoading] = React.useState(false);
    const {register, handleSubmit, formState: {errors}, setError} = useForm({
        defaultValues: {
            firstName,
            lastName,
            emailAddress,
            phoneNumber
        }
    });

    //submit the form.
    const onSubmit = (data) => {
        if (stateSetter && typeof stateSetter === 'function') {
            data = {...data, result: true};
            stateSetter(data);
        }
        else {
            console.log('unable to set state.  stateSetter is not a function');
            console.log('form state is:');
            console.log(data);
        }
    }

    //input box classes.
    const textInputClasses = 'py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md';

    return (
        <div className={"py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12"}>

            {/*Loading Widget*/}
            <div className={isLoading ? 'block' : 'hidden'}>
                <div className={"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"} style={{zIndex: 500}}>
                    <img src="/images/loading.gif" height="150px" width="150px" alt="Loading..." />
                </div>
                <div className={"w-full h-full bg-hbLightGray absolute top-0 left-0 opacity-60 z-40"}></div>
            </div>

            {/*Form*/}
            <form className={"mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"} onSubmit={handleSubmit(onSubmit)}>

                {/* First Name */}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"firstName"} className={"block text-sm font-medium text-hbGray"}>*First Name</label>
                    <input type={"text"} {...register('firstName', {required: true, maxLength: 50})} className={textInputClasses} />
                    {errors.firstName && <p className={"text-red-600"}>First name is required.</p> }
                </div>

                {/* Last Name */}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"lastName"} className={"block text-sm font-medium text-hbGray"}>*Last Name</label>
                    <input type={"text"} {...register('lastName', {required: true, maxLength: 50})} className={textInputClasses} />
                    {errors.lastName && <p className={"text-red-600"}>Last name is required</p> }
                </div>

                {/*Email Address*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"emailAddress"} className={"block text-sm font-medium text-hbGray"}>*Email Address</label>
                    <input type={"text"} {...register('emailAddress', {pattern: /\S+@\S+\.\S+/, required: true})} className={textInputClasses} />
                    {errors.emailAddress && <p className={"text-red-600"}>Email address is not valid</p>}
                </div>

                {/*Phone Number*/}
                <div className={"col-span-2 sm:col-auto"}>
                    <label htmlFor={"phoneNumber"} className={"block text-sm font-medium text-hbGray"}>*Phone Number</label>
                    <input type={"text"} {...register('phoneNumber', {pattern: /^(0|[1-9]\d*)(\.\d+)?$/,required: true, maxLength: 50})} className={textInputClasses} />
                    {errors.phoneNumber && <p className={"text-red-600"}>Phone number is not valid</p> }
                </div>

                <div className={"col-span-2 flex justify-end"}>
                    <button type={"submit"} className={"mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium " +
                        "text-white bg-hbBlue hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto"}>
                        {buttonText}
                    </button>
                </div>


            </form>

        </div>
    )

}