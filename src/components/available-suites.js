//when a property is select.  this will get and return the suites available for it.
import Image from "next/image";
import noImage from "../../public/images/no-image.jpg";
import {formatDateMMMD, suiteTypeMapper} from "../lib/helpers";
import React from "react";

export function AvailableSuites({register, suiteOptions, suiteWatch, availableSuiteHolderClasses, hbOrangeButton, errors}) {

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
                    Choose suites that match your preference. <br />
                    <span className={"text-xs"}>(Up to a maximum of 3 suites)</span>
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
                                                  <Image src={s.images[0]} alt={`${s.unitNumber} Image`} layout="fill" width={100} height={100} />
                                              </span>
                                          }
                                        {
                                            !s.images[0] &&
                                            <span className="relative w-full h-full">
                                                  <Image src={noImage} alt="Image not available" layout="fill" width={100} height={100} />
                                              </span>
                                        }
                                      </span>
                                        <span className="md:flex md:flex-none md:basis-1/2">
                                            <span className={"flex flex-col gap-y-2"}>
                                                {/*<CheckCircleIcon className={`${suiteWatchCleaned.includes(s.vacancyId) ? 'h-7 w-7 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2' : 'hidden'}`} />*/}
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
                {errors.suites && <p className={"text-red-600"}>You must choose at least one suite.</p>}
            </fieldset>
        </div>
    )
}