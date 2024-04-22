import { ValidationLogicResult, useFieldValidation } from "./use-field-validation";

// Known issues:
//  gdy jest '123' i chcemy przed '1' wstawic '0' to nie mozemy tego zrobic! -> może trzeba dopuścić jedno zero przed liczbą? I na blur usunąć je gdy nie ma po nim przecinka?

/* -------------------------- removeNotAllowedChars ------------------------- */
// removeNotAllowedChars('123.4567', ',', 0) -> '1234567'
function removeNotAllowedChars(value: string, decimalSeparator: '.' | ',', decimalPlaces: number,  min: number) {
    const re = new RegExp(`[^0-9${decimalPlaces > 0 ? decimalSeparator : ""}${min < 0 ? "-" : ""}]`, 'g');
    return value.replace(re, "")
}

/* --------------------- removeLeadingZerosExceptDecimal -------------------- */
// removeLeadingZerosExceptDecimal('000123.4567', '.') -> '123.4567' - use only after removeNotAllowedChars!
function removeLeadingZerosExceptDecimal(str: string, decimalSeparator: '.' | ',') {
    
    if (/^0+$/.test(str)) {
        return "0";
    }
    if (/^-0+$/.test(str)) {
        return "-0";
    }
    const separatorPattern = decimalSeparator === "." ? "\\." : ",";
    return str.replace(new RegExp(`^(-?)0+(?!${separatorPattern})`), '$1');
}

/* ---------------------------- removeExtraCommas --------------------------- */
// removeExtraCommas('123,4567,58') -> '123,456758'
function removeExtraCommas(str: string, decimalSeparator: '.' | ',') {
    const separatorPattern = decimalSeparator === "." ? "\\." : ",";
  const a = str.split("").reverse().join("");
  const b = a.replace(new RegExp(`${separatorPattern}(?=.*?${separatorPattern})`, 'g'), '');
  return b.split("").reverse().join("");
    // const re = new RegExp(`(${decimalSeparator}.*?)${decimalSeparator}.*`, 'g');
    // return str.replace(re, "$1");
}

/* ---------------------------- removeMinusSigns ---------------------------- */
// removeMinusSign('-123,4567-123-456', -1) -> '-123,4567'
function removeMinusSigns(str: string, min: number) {
    return min < 0
        ? str.replace(/^(-)|-/g, '$1')
        : str.replace(/-/g, '');
}

type FieldValue = number | undefined;

type Options = {
    min?: number;
    max?: number;
    decimalPlaces?: number;
    decimalSeparator?: '.' | ',';
    isRequired?: boolean;
};

type NumberFieldProps = {
    initialValue: FieldValue;
    isAlreadyTouched: boolean;
    isErrorDisplayEnabled: boolean;
    onChange: (value: FieldValue, isValid: boolean, isTouched: boolean) => void;
    options?: Options;
};

// sanitize function - remove all not allowd characters from input
function sanitize(value: string, decimalPlaces: number, decimalSeparator: '.' | ',', min: number) {
    const a = removeNotAllowedChars(value, decimalSeparator, decimalPlaces, min); // !
    const b = removeMinusSigns(a, min);
    const c = removeExtraCommas(b, decimalSeparator);
    console.log('c', c);
    return c;
}

function isPatternMatched(value: string, decimalPlaces: number, decimalSeparator: '.' | ',' , min: number) {
    const regex = new RegExp(`^-{0,${min < 0 ? "1" : "0"}}\\d+\\${decimalSeparator}{0,${decimalPlaces > 0 ? 1 : 0}}\\d{0,${decimalPlaces}}$`);
    return  regex.test(value);
}

/* ----------------------------- validationLogic ---------------------------- */
const validationLogic = ({ min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, decimalPlaces = 0, decimalSeparator = '.', isRequired = true }: Options = {}) => (input: string): ValidationLogicResult => {
    // Remove all not allowed characters from input
    const sanitized = sanitize(String(input), decimalPlaces, decimalSeparator, min);

    // Check if value is missing
    if(sanitized === '' && isRequired) return {
        type: 'INVALID',
        value: sanitized,
        errorReason: 'valueMissing'
    }

    // Check if matches number pattern
    if(!isPatternMatched(sanitized, decimalPlaces, decimalSeparator, min)) return {
        type: 'INVALID',
        value: sanitized,
        errorReason: 'patternMismatch'
    }

    const sanitizedAsNumber = Number(sanitized.replace(decimalSeparator, '.'));

    // Check if value is less than min
    if(Number(sanitizedAsNumber) < min) return {
        type: 'INVALID',
        value: sanitized,
        errorReason: 'rangeUnderflow'
    }

    // Check if value is greater than max
    if(Number(sanitizedAsNumber) > max) return {
        type: 'INVALID',
        value: sanitized,
        errorReason: 'rangeOverflow'
    }

    return {
        type: 'VALID',
        value: sanitized
    }
}

/* ------------------------------- NumberField ------------------------------ */
export function NumberFieldTwo(props: NumberFieldProps) {

    const initialValueToString = (initialValue: unknown): string => {
        const a =  String(initialValue ?? '');
        const b = a.replace('.', props.options?.decimalSeparator ?? '.');
        return b;
    }

    const x = (value: string, isValid: boolean, isTouched: boolean) => {
        const a = value.replace(props.options?.decimalSeparator ?? '.', '.');
        props.onChange(['', '-'].includes(a)
            ? undefined
            : Number(a), isValid, isTouched
        );
    }

    const { value, onValueChanged } = useFieldValidation({
        initialValue: initialValueToString(props.initialValue),
        isAlreadyTouched: props.isAlreadyTouched,
        onChangeCallback: x,
        validationLogic: validationLogic(props.options),
    });

    // Removes visually leading zeros on blur!!!
    const handleOnBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        e.target.value = removeLeadingZerosExceptDecimal(e.target.value, props.options?.decimalSeparator ?? '.');
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            // e.preventDefault();
            console.log('ArrowUp or ArrowDown!');
            const input = e.target as HTMLInputElement;
            const step = e.key === 'ArrowUp' ? 1 : -1;
            const newValue = Number(input.value) + step; // TODO: check if it's a number before setting target value!!!
            (e.target as HTMLInputElement).value = String(newValue);

            // const validationResult = validationLogic(props.options)(String(newValue));
            // if (validationResult.type === 'VALID') {
            //     input.value = String(newValue);
            //     x(input.value, true, true);
            // }
        }
    }

    return (
    <div>
        <input
            type="text"
            onKeyDown={handleOnKeyDown}
            onChange={onValueChanged}
            value={value.value}
            onBlur={handleOnBlur}
        />
        {value.type === 'INVALID' && (<h3>{value.errorReason}</h3>)}
    </div>
    )
}
