/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            borderWidth: {
                '5': '5px',
                '6': '6px',
            },
        },
    },
    plugins: [],
};
