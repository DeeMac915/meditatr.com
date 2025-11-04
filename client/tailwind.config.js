/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#fffbf0",
                    100: "#fff7e6",
                    200: "#ffefcc",
                    300: "#ffe7b3",
                    400: "#ffeb9f",
                    500: "#ffdf8c",
                    600: "#d9b8a6",
                    700: "#c2a08b",
                    800: "#a67f6f",
                    900: "#8a5e53",
                },
                secondary: {
                    50: "#faf8f6",
                    100: "#f5f0ed",
                    200: "#efe8e3",
                    300: "#efd7c7",
                    400: "#e8c9b8",
                    500: "#d9b8a6",
                    600: "#c2a08b",
                    700: "#a67f6f",
                    800: "#8a5e53",
                    900: "#6e3d37",
                },
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "system-ui",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "Segoe UI",
                    "Roboto",
                    "sans-serif",
                ],
            },
        },
    },
    plugins: [],
};
