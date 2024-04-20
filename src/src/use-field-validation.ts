import { useEffect, useState } from 'react';
import { ComponentPropsWithoutRef } from "react"

type ErrorReason =
  | 'patternMismatch'
  | 'rangeUnderflow'
  | 'rangeOverflow'
  | 'valueMissing'
  | 'stepMismatch'
  | 'tooShort'
  | 'tooLong ';

type InputType = ComponentPropsWithoutRef<"input">;

export type ValidationLogicResult =
  | {
      type: 'VALID';
      value: string;
    }
  | {
      type: 'INVALID';
      value: string;
      errorReason: ErrorReason;
    };

type UseFieldValidationOptions = {
  initialValue: string;
  isAlreadyTouched: boolean;
  onChangeCallback: (value: string, isValid: boolean, isTouched: boolean) => void;
  validationLogic: (input: string) => ValidationLogicResult;
};

/* ------------------------- useFieldValidation hook ------------------------ */
export function useFieldValidation({
  initialValue,
  isAlreadyTouched,
  onChangeCallback,
  validationLogic,
}: UseFieldValidationOptions) {
  const [value, setValue] = useState(() => ({
    ...validationLogic(initialValue),
    isTouched: isAlreadyTouched
  }));

  const onValueChanged: InputType['onChange'] = (value) => {
    console.clear(); // TO REMOVE
    const validationResult = validationLogic(value.target.value);
    
    setValue({
      ...validationResult,
      isTouched: true
    });
  };

  useEffect(() => {
    onChangeCallback(value.value, value.type === 'VALID', value.isTouched);
  }, [value, onChangeCallback]);

  return { value, onValueChanged };
}
