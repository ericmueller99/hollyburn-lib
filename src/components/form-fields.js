import React from "react";

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