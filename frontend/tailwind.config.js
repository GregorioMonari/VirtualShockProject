/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.html"
    ],
    theme: {
      extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
      themes: [
        {
          corporate: {
            ...require('daisyui/src/theming/themes')[
            '[data-theme=corporate]'
            ],
            fontFamily: 'Montserrat, sans-serif',
            primary: "#03AF7C",
            secondary: "#B0D871",
            "--rounded-btn": "0rem",
          }
        }
      ],
    },
  }
  