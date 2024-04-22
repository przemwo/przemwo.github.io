import { useState } from "react";
import { NumberField } from "./NumberField";


export function Foo({ min, max, decimalPlaces, decimalSeparator }: { min: number, max: number, decimalPlaces: number, decimalSeparator: '.' | ','}) {
  const [value, setValue] = useState<number | undefined>(-.3);
  const onChange = (value: number | undefined, isValid: boolean, isTouched: boolean) => {
    console.log('onChange', value, isValid, isTouched);
    setValue(value);
  }

  return (
    <div style={{ marginTop: "1rem", marginBottom: "1rem"}}>
        <NumberField
            initialValue={value} // liczba albo undefined
            isAlreadyTouched={false}
            isErrorDisplayEnabled={true}
            onChange={onChange} // liczba albo undefined
            options={{ min, max, decimalPlaces, decimalSeparator }}
        />
        <p>Min: {min}, Max: {max}, DecimalPlaces: {decimalPlaces}, Separator: {decimalSeparator}</p>
    </div>
  )
}
