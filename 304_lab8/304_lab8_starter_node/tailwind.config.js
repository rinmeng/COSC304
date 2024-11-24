module.exports = {
  content: ["./views/**/*.handlebars", "./routes/**/*.js"],
  theme: {
    extend: {
      animation: {
        'fall-1': 'fallIn 1s ease-out forwards',
        'fall-2': 'fallIn 1s ease-out 0.75s forwards',
        'fall-3': 'fallIn 1s ease-out 1.5s forwards',
        'fade-in': 'fadeIn 1s ease-out 1.5s forwards',
        'fade-in-instant': 'fadeIn 1s ease-out forwards',
      },
      keyframes: {
        fallIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-100px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      }
    }
  },
  plugins: [],
};
