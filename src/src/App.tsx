import { useState } from "react";
import { NumberField } from "./NumberField";

export function App() {
  const [value, setValue] = useState<number | undefined>(-.3);
  const onChange = (value: number | undefined, isValid: boolean, isTouched: boolean) => {
    console.log('onChange', value, isValid, isTouched);
    setValue(value);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <NumberField
        initialValue={value} // liczba albo undefined
        isAlreadyTouched={false}
        isErrorDisplayEnabled={true}
        onChange={onChange} // liczba albo undefined
        options={{ min: -2, max: 1, decimalPlaces: 1, decimalSeparator: ','}}
      />
    </div>
  )
}
