import { useEffect, useState } from "react";

// export function useLocalStorage<T>(key: string, fallbackValue: T) {
//     const [value, setValue] = useState(fallbackValue);

//     useEffect(() => {
//         console.log('first uE', key, fallbackValue);
//         const stored = localStorage.getItem(key);
//         setValue(stored ? JSON.parse(stored) : fallbackValue);
//     }, [fallbackValue, key]);

//     useEffect(() => {
//         console.log('second uE', key, value);
//         localStorage.setItem(key, JSON.stringify(value));
//     }, [key, value]);

//     return [value, setValue] as const;
// }

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
    const [state, setState] = useState<T>(() => {
        // Initialize the state
        try {
            const value = window.localStorage.getItem(key)
            // Check if the local storage already has any values,
            // otherwise initialize it with the passed initialValue
            return value ? JSON.parse(value) : initialValue
        } catch (error) {
            console.log(error)
            return initialValue;
        }
    });

    const setValue = (value: T) => {
        try {
            // If the passed value is a callback function,
            //  then call it with the existing state.
            const valueToStore = value instanceof Function ? value(state) : value
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
            setState(value)
        } catch (error) {
            console.log(error)
        }
    };

    return [state, setValue] as const;
};

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
export const makeId = (length: number) => {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;

    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }

    return result;
};
