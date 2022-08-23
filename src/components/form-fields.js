import React from "react";
import Image from "next/image";
import noImage from "../../public/images/no-image.jpg";
import {formatDateMMMD, suiteTypeMapper} from "../lib/helpers";
import {XCircleIcon} from "@heroicons/react/solid";

export const PropertySelectWithOptGroup = ({register, propertyOptions, tailwindClasses}) => {
  return (
    <select className={tailwindClasses} {...register('property', {required: "Please select a property."})} defaultValue={"Please Select..."}>
      <option value={"Please Select..."} disabled>Please Select...</option>
      {
        propertyOptions.map(p => {
          return (
            <optgroup label={p.optGroup} key={p.optGroup}>
              {
                p.data.map(d => (
                  <option value={d.value} key={d.value}>{d.label}</option>
                ))
              }
            </optgroup>
          )
        })
      }
    </select>
  )
}

export const AvailableSuites = ({register, suiteOptions, suiteWatch, availableSuiteHolderClasses, hbOrangeButton, options = {}}) => {

  const {headerText = 'Choose suites that match your preference.', infoText = '(Up to a maximum of 3 suites)'} = options;

  //if there are no suite options then return early
  if (!suiteOptions || suiteOptions.length === 0) {
    return '';
  }

  let suiteWatchCleaned = suiteWatch || [];
  if (!Array.isArray(suiteWatchCleaned)) {
    suiteWatchCleaned = [suiteWatchCleaned];
  }
  suiteWatchCleaned = suiteWatchCleaned.map(s => Number(s));

  return (
    <div className={"col-span-2"}>
      <fieldset>
        <p>
          {headerText}
          {
            infoText &&
            <>
              <br />
              <span className={"text-xs"}>{infoText}</span>
            </>
          }
        </p>
        <div className={availableSuiteHolderClasses}>
          {
            suiteOptions.map(s => (
              <div className={`${suiteWatchCleaned.length > 2 && !suiteWatchCleaned.includes(s.vacancyId) ? 'cursor-not-allowed' : ''} relative bg-white border rounded-md shadow-xl p-4 flex focus:outline-none ${suiteWatchCleaned.includes(s.vacancyId) ? 'border border-hbBlue' : ''}`} key={s.vacancyId}>
                <input type="checkbox" id={`${s.vacancyId}-suite`} name="suites" value={s.vacancyId} className={"sr-only"} {...register('suites', {required: 'Please select atleast one suite'})} disabled={suiteWatchCleaned.length > 2 && !suiteWatchCleaned.includes(s.vacancyId) ? true: false} />
                <span className={"flex-1 flex"}>
                                      {/*Image*/}
                  <span className="flex flex-none basis-1/2 pr-5">
                                          {
                                            s.images[0] &&
                                            <span className="relative w-full h-full">
                                                  <Image src={s.images[0]} alt={`${s.unitNumber} Image`} layout="fill" />
                                              </span>
                                          }
                    {
                      !s.images[0] &&
                      <span className="relative w-full h-full">
                                                  <Image src="/images/no-image.jpg" alt="Image not available" layout="fill" width={100} height={100} />
                                              </span>
                    }
                                      </span>
                                        <span className="md:flex md:flex-none md:basis-1/2">
                                            <span className={"flex flex-col gap-y-2"}>
                                              <span className={"block text-xl font-medium text-hbGray"}>{s.unitNumber} {suiteTypeMapper(s.bedrooms)}</span>
                                                <span className={"block text-lg font-medium text-hbLightGrayText"}>Available {formatDateMMMD(s.availableDate)} from</span>
                                                <span className={"block text-xl font-medium text-hbGray"}>${s.askingRent} monthly</span>
                                                <span className={"block text-xs text-gray-900"}>{s.features && s.features.length > 0 ? `${s.features.toString().replace(/,/g, ', ')},` : ''} {s.flooring}, {s.countertops}</span>
                                                <span className="block justify-end">
                                                    <label htmlFor={`${s.vacancyId}-suite`} className={hbOrangeButton}>
                                                        {suiteWatchCleaned.includes(s.vacancyId) ? 'Selected' : 'Select'}
                                                    </label>
                                                </span>
                                            </span>
                                        </span>
                                    </span>
              </div>
            ))
          }
        </div>
      </fieldset>
    </div>
  )
}

//form errors control.  Displays all errors on a form.
export const FormErrors = ({errors}) => {

  if (!errors || Object.keys(errors).length === 0) {
    return '';
  }

  return (
    <div className="col-span-2 mt-4">
      <div className="rounded-md bg-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0 items-center flex">
            <XCircleIcon className="h-7 w-7 text-white" aria-hidden="true" />
          </div>
          {
            Object.keys(errors).map(key => (
              <div className="ml-3 flex-1 md:flex md:justify-between text-center">
                <p className={"text-white"}>{errors[key].message}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )

}