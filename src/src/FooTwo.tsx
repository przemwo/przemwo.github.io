import { useState } from "react";
import { NumberFieldTwo } from "./NumberFieldTwo";


export function FooTwo({ min, max, decimalPlaces, decimalSeparator }: { min: number, max: number, decimalPlaces: number, decimalSeparator: '.' | ','}) {
  const [value, setValue] = useState<number | undefined>(undefined);
  const onChange = (value: number | undefined, isValid: boolean, isTouched: boolean) => {
    console.log('onChange', value, isValid, isTouched);
    setValue(value);
  }

  return (
    <div style={{ marginTop: "1rem", marginBottom: "3rem"}}>
        <NumberFieldTwo
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
