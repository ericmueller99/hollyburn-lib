module.exports = {
  content: [
      "./src/**/*.{html,js,jsx}",
      "./dist/**/*.{html,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hbOrange': '#F4C82D',
        'hbOrangeHover': '#e2b30c',
        'hbGray': '#464646',
        'hbLightGray': '#f5f5f5',
        'footerBorder': '#c8c6c5',
        'fontGray': "#868686",
        'hbBlue': '#003976',
        'hbLightGrayText': '#959595'
      },
      backgroundImage: {
        'qualifyCard': "url('/images/sidebar-img.jpg')",
        'footerHero': 'url(/images/footer-img.jpg)'
      },
    },
  },
  plugins: [],
}