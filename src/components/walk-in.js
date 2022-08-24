import React from 'react';
import {useForm} from 'react-hook-form';
import {
  availableSuiteHolderTailwindClasses, buttonTailwindClasses,
  filterProperties, filterPropertiesWithPrefs, filterVacanciesFromProperty,
  formHolderTailwindClasses,
  formTailwindClasses, getVacanciesFromIds,
  getVacancyFeed, hbOrangeButtonClasses, labelTailwindClasses,
  propertyOptGroupBuilder, txtInputTailwindClasses
} from "../lib/helpers";
import {LoadingWidget} from "./utils";
import {Transition} from '@headlessui/react'
import {
  AvailableSuites,
  FormErrors, InvalidVacancyOrPropertyLink,
  PropertySelectWithOptGroup,
  UpdatePreferenceBanner,
  VacancyDisplayType
} from "./form-fields";

export function WalkIn({propertyCode, stateSetter, options = {}}) {

  const {formHolderClasses = formHolderTailwindClasses(), formClasses = formTailwindClasses(),
    textInputClasses = txtInputTailwindClasses(), labelClasses = labelTailwindClasses(), availableSuitesHolderClasses=availableSuiteHolderTailwindClasses(),
    hbOrangeButton = hbOrangeButtonClasses(), buttonText = 'Submit', showBack, handleBackButton, buttonClasses = buttonTailwindClasses(), showUpdatePrefsBanner, handleUpdatePrefs,
    updatePrefsIconHolderClasses, preferences: formPrefs = {}
  } = options;
  const updatePrefsOptions = {
    iconHolderClasses: updatePrefsIconHolderClasses
  }
  const {control, watch, register, handleSubmit, formState: {errors}, setError, setValue, resetField} = useForm({
    defaultValues: {
      vacancyDisplayType: propertyCode !== undefined && propertyCode !== null ? 'no' : 'yes'
    }
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [refreshFeed, setRefreshFeed] = React.useState(true);
  const [vacancyFeed, setVacancyFeed] = React.useState([]);
  const [propertyOptions, setPropertiesOptions] = React.useState([]);
  const [suiteOptions, setSuiteOptions] = React.useState([]);
  const [preferences, setPreferences] = React.useState(formPrefs);
  const [linkedProperty, setLinkedProperty] = React.useState({})

  const availableSuitesOptions = {
    headerText: 'Which suites are you visiting today?',
    infoText: null
  }

  //field watches
  const propertyWatch = watch('property');
  const suiteWatch = watch('suites')
  const vacancyDisplayTypeWatch = watch('vacancyDisplayType');

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

    if (preferences && vacancyDisplayTypeWatch === 'yes') {
      const properties = filterPropertiesWithPrefs(vacancyFeed, preferences);
      setPropertiesOptions(propertyOptGroupBuilder(properties));
    }
    else {

      //filtering properties based on hasVacancy
      const properties = filterProperties(vacancyFeed);
      setPropertiesOptions(propertyOptGroupBuilder(properties));

      //if a property was passed in
      if (propertyCode !== undefined && propertyCode) {
        const [selectedProperty] = properties.filter(p => p.propertyCode === propertyCode)
        if (selectedProperty) {
          setLinkedProperty({
            ...selectedProperty
          })
        }
        else {
          setLinkedProperty({
            noVacancy: true,
            dismissWarning: false
          })
        }
      }

    }

  }, [vacancyFeed, vacancyDisplayTypeWatch]);

  //setup the linked property
  React.useEffect(() => {

    if (!linkedProperty || !linkedProperty.value || linkedProperty.initialLoadCompleted || linkedProperty.noVacancy) {
      return;
    }

    setLinkedProperty({
      ...linkedProperty,
      initialLoadCompleted: true
    })
    setValue('property', linkedProperty.value);

  }, [linkedProperty])

  //Setting the property
  React.useEffect(() => {

    if (!propertyWatch) {
      return;
    }

    //resetting the field
    resetField('suites');

    //setting suite options
    const vacancies = filterVacanciesFromProperty(vacancyFeed, propertyWatch, preferences);
    setSuiteOptions(vacancies);


  }, [propertyWatch])

  const dismissLinkedPropertyWarning = (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    setLinkedProperty({
      ...linkedProperty,
      dismissWarning: true
    })
  }

  //submit function
  const onSubmit = (data) => {

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

        {/*Display type.  Filtered on preferences or shows all vacancies*/}
        <VacancyDisplayType register={register} />

        {/*update preferences banner*/}
        {showUpdatePrefsBanner && vacancyDisplayTypeWatch === 'yes' && handleUpdatePrefs && typeof handleUpdatePrefs === 'function' &&
          <UpdatePreferenceBanner handleUpdatePrefs={handleUpdatePrefs} options={updatePrefsOptions} />
        }

        {/*<div className="col-span-2">*/}
          <Transition
            show={(linkedProperty?.noVacancy === true && linkedProperty?.dismissWarning === false)}
            enter="col-span-2 transition ease duration-700 transform"
            enterFrom="opacity-0 -translate-y-full"
            enterTo="opacity-100 translate-y-0"
            entered="col-span-2"
            leave="col-span-2 transition ease duration-1000 transform"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-full"
          >
            <InvalidVacancyOrPropertyLink text='It looks like the property link you followed currently has no posted vacancies.' handleDismissClick={dismissLinkedPropertyWarning} />
          </Transition>
        {/*</div>*/}

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