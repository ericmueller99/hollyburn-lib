import React from 'react';
import {useForm} from 'react-hook-form';
import {
  availableSuiteHolderTailwindClasses, buttonTailwindClasses,
  filterProperties, filterVacanciesFromProperty,
  formHolderTailwindClasses,
  formTailwindClasses, getVacanciesFromIds,
  getVacancyFeed, hbOrangeButtonClasses, labelTailwindClasses,
  propertyOptGroupBuilder, txtInputTailwindClasses
} from "../lib/helpers";
import {LoadingWidget} from "./utils";
import {AvailableSuites, FormErrors, PropertySelectWithOptGroup} from "./form-fields";

export function WalkIn({propertyName, stateSetter, options = {}}) {

  const {formHolderClasses = formHolderTailwindClasses(), formClasses = formTailwindClasses(),
    textInputClasses = txtInputTailwindClasses(), labelClasses = labelTailwindClasses(), availableSuitesHolderClasses=availableSuiteHolderTailwindClasses(),
    hbOrangeButton = hbOrangeButtonClasses(), buttonText = 'Submit', showBack, handleBackButton, buttonClasses = buttonTailwindClasses()
  } = options;
  const {control, watch, register, handleSubmit, formState: {errors}, setError, setValue, resetField} = useForm();
  const [isLoading, setIsLoading] = React.useState(false);
  const [refreshFeed, setRefreshFeed] = React.useState(true);
  const [vacancyFeed, setVacancyFeed] = React.useState([]);
  const [propertyOptions, setPropertiesOptions] = React.useState([]);
  const [suiteOptions, setSuiteOptions] = React.useState([]);

  const availableSuitesOptions = {
    headerText: 'Which suites are you visiting today?',
    infoText: null
  }

  //field watches
  const propertyWatch = watch('property');
  const suiteWatch = watch('suites')

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

  //Setting the property
  React.useEffect(() => {

    if (!propertyWatch) {
      return;
    }

    //setting suite options
    const vacancies = filterVacanciesFromProperty(vacancyFeed, propertyWatch);
    setSuiteOptions(vacancies);


  }, [propertyWatch])

  //submit function
  const onSubmit = () => {

    const {property, suites} = data;
    if (!property || property === 'Please Select...') {
      setError('property', {message: "Please select a property"});
      return;
    }

    if (!stateSetter || typeof stateSetter !== 'function') {
      console.log('unable to set state. stateSetting is missing or not a function');
      return;
    }

    const vacancyIds = Array.isArray(suites) ? suites: [parseInt(suites)];
    const vacancies = getVacanciesFromIds(vacancyFeed, vacancyIds);

    //setting the state
    const stateData = {
      result: true,
      property: Number(property),
      suites: vacancies
    }
    stateSetter(stateData);

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

        {/*Available Suites*/}
        <AvailableSuites availableSuiteHolderClasses={availableSuitesHolderClasses} register={register} suiteOptions={suiteOptions} suiteWatch={suiteWatch} hbOrangeButton={hbOrangeButton} options={availableSuitesOptions} />

        {/*Any form errors*/}
        <FormErrors errors={errors} />

        {/*Submit Button*/}
        <div className={"col-span-2 flex justify-end"}>
          {showBack && handleBackButton &&
            <>
              <button type="button" className={`${buttonClasses} mr-1`} onClick={event => handleBackButton(event)}>Back</button>
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