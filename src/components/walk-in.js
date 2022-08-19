import React from 'react';
import {Transition} from "@headlessui/react";
import {useForm} from 'react-hook-form';
import {
  filterProperties,
  formHolderTailwindClasses,
  formTailwindClasses,
  getVacancyFeed, labelTailwindClasses,
  propertyOptGroupBuilder, txtInputTailwindClasses
} from "../lib/helpers";
import {LoadingWidget} from "./utils";
import {PropertySelectWithOptGroup} from "./form-fields";

export function WalkIn({propertyName, stateSetter, options = {}}) {

  const {formHolderClasses = formHolderTailwindClasses(), formClasses = formTailwindClasses(),
    textInputClasses = txtInputTailwindClasses(), labelClasses = labelTailwindClasses()
  } = options;
  const {control, watch, register, handleSubmit, formState: {errors}, setError, setValue, resetField} = useForm();
  const [isLoading, setIsLoading] = React.useState(false);
  const [refreshFeed, setRefreshFeed] = React.useState(true);
  const [vacancyFeed, setVacancyFeed] = React.useState([]);
  const [propertyOptions, setPropertiesOptions] = React.useState([]);

  //getting the vacancy feed
  React.useEffect(() => {

    if (!refreshFeed) {
      return;
    }

    setIsLoading(true);
    setRefreshFeed(false);

    getVacancyFeed()
      .then(data => {
        setVacancyFeed(data);
        setIsLoading(false);
      })
      .catch(error => {
        setIsLoading(false);
        throw error;
      })


  }, [refreshFeed])

  //setting up property select box
  React.useEffect(() => {

    if (!vacancyFeed) {
      return;
    }

    const properties = filterProperties(vacancyFeed);
    setPropertiesOptions(propertyOptGroupBuilder(properties));

  }, [vacancyFeed])

  //submit function
  const onSubmit = () => {

  }

  return (
    <div className={formHolderClasses}>

      {/*Loading Widget*/}
      <LoadingWidget isLoading={isLoading} />

      <form className={formClasses} onSubmit={handleSubmit(onSubmit)}>

        {/*Property Select*/}
        <div className="col-span-2">
          <label htmlFor="property" className={labelClasses}>Select a Property <br/><span className="text-xs">(only properties with vacancies are shown)</span></label>
          <div className="mt-1">
            <PropertySelectWithOptGroup propertyOptions={propertyOptions} register={register} tailwindClasses={textInputClasses} />
          </div>
        </div>


      </form>

    </div>
  )

}