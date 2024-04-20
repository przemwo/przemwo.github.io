import { ValidationLogicResult, useFieldValidation } from "./use-field-validation";

// Known issues:
//  gdy jest '123' i chcemy przed '1' wstawic '0' to nie mozemy tego zrobic! -> może trzeba dopuścić jedno zero przed liczbą? I na blur usunąć je gdy nie ma po nim przecinka?

// IDEA: dwa patterny, jeden co user moze wpisac (np. tylko jeden przecinek?) a drugi czy to co wpisano jest poprawne np. ',12' moze wpisac ale poprawne jest '0,12'?

// Działanie:
// 1. sanitize input
// - usun wszystkie znaki niepożądane z inputu za pomoca regexa i replace (z uwzględnieniem rodzaju separatora dziesietnego) DONE (removeNotAllowedChars)
// - usun specjalne przypadki: dwa lub wiecej zer na poczatku DONE (removeLeadingZerosExceptDecimal)
// - usun specjalne przypadki: wiecej niz jeden separator dziesietny DONE (removeExtraCommas)
// - usun "-" gdy ujemne niedozwolone lub gdy nie jest pierwszym znakiem DONE (removeMinusSign)
// - usun więcej znaków niż dozwolona liczba miejsc po przecinku DONE (removeAfterCommaNChars)
// - usn  każdy (dla integer) lub więcej niż jeden separator dziesiętny
// - kolejnosc: najpierw usuń nadmiarowe przecinki (dla integer wszystkie) a potem usun nadmiarowe znaki po przecinku!

// TOOD: teraz TO! Sprawdź czy aktualna wartość pasuje do wzorca?! Jak nie to errorReason 'patternMismatch'!
// 2. sprawdz czy sanitized pasuje do wzorca? tak? -> 3. nie? -> 4.
    // 3. kontynuuj z min/max itp.
    // 4. zwroc INVALID z errorReason 'patternMismatch'

/* -------------------------- removeNotAllowedChars ------------------------- */
// removeNotAllowedChars('123.4567', ',', 0) -> '1234567'
function removeNotAllowedChars(value: string, decimalSeparator: '.' | ',', decimalPlaces: number,  min: number) {
    const re = new RegExp(`[^0-9${decimalPlaces > 0 ? decimalSeparator : ""}${min < 0 ? "-" : ""}]`, 'g');
    return value.replace(re, "")
}

/* --------------------- removeLeadingZerosExceptDecimal -------------------- */
// removeLeadingZerosExceptDecimal('000123.4567', '.') -> '123.4567' - use only after removeNotAllowedChars!
function removeLeadingZerosExceptDecimal(str: string, decimalSeparator: '.' | ',') {
    
    // Check if the string consists only of zeros or only of zeros with a minus sign
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

/* ------------------------- removeAfterCommaNChars ------------------------- */
// removeAfterCommaNChars('123,4567', 2, ',') -> '123,45'
function removeAfterCommaNChars(str: string, decimalPlaces: number, decimalSeparator: '.' | ',') {
  return str.replace(new RegExp(`\\${decimalSeparator}(.{${decimalPlaces}}).*`), `${decimalSeparator}$1`);
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
    const c = removeLeadingZerosExceptDecimal(b, decimalSeparator); // !
    const d = removeExtraCommas(c, decimalSeparator);
    const e = removeAfterCommaNChars(d, decimalPlaces, decimalSeparator);
    console.log('e', e);
    return e;
}

function isPatternMatched(value: string, decimalPlaces: number, decimalSeparator: '.' | ',' , min: number) {
    // const regex = new RegExp(`^-?(0|0,\\d{0,${decimalPlaces}}|[1-9]\\d*,?\\d{0,${decimalPlaces}}|,\\d{0,${decimalPlaces}})$`);

    // const regex = numberOfDigitsAfterDecimalSeparator > 0
    //     ? new RegExp(
    //         `^-?(0|0,\\d{0,${numberOfDigitsAfterDecimalSeparator}}|[1-9]\\d*,?\\d{0,${numberOfDigitsAfterDecimalSeparator}}|,\\d{0,${numberOfDigitsAfterDecimalSeparator}})$`
    //         // '^-?\\d?,?\\d{0,4}$' - to jest to działające!!!
    //         // '^\\d{0,10}\\' + ',' + '{0,1}\\d{0,' + 4 + '}$'
    //     )
    //     : new RegExp('^-?(0|[1-9]\\d*)$');

    const regex = new RegExp(`^-{0,${min < 0 ? "1" : "0"}}\\d+\\${decimalSeparator}{0,${decimalPlaces > 0 ? 1 : 0}}\\d{0,${decimalPlaces}}$`);
    return  regex.test(value);
}

/* ----------------------------- validationLogic ---------------------------- */
const validationLogic = ({ min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER, decimalPlaces = 0, decimalSeparator = '.', isRequired = true }: Options = {}) => (input: string): ValidationLogicResult => {
    // Remove all not allowed characters from input
    const sanitized = sanitize(String(input), decimalPlaces, decimalSeparator, min);

    // Check if value is missing
    if(['', '-'].includes(sanitized) && isRequired) return {
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

    // Check if decimal separator is before any digit
    // if(sanitized.replace('-', '').startsWith(decimalSeparator)) return {
    //     type: 'INVALID',
    //     value: sanitized,
    //     errorReason: 'valueMissing' // TODO: different error?
    // }

    // console.log('...and MATCHED 2!');

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
export function NumberField(props: NumberFieldProps) {

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

    return (
    <div>
        <input
            type="text"
            onChange={onValueChanged}
            value={value.value}
        />
        {value.type === 'INVALID' && (<h3>{value.errorReason}</h3>)}
    </div>
    )
}
