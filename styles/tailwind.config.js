const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    purge: {
        content: ['_site/**/*.html'],
        options: {
            safelist: [],
        },
    },
    theme: {
        extend: {
            transitionProperty: {
                'height': 'height'
              },
            fontFamily: {
                sans: ['overpass', ...defaultTheme.fontFamily.sans],
                chivo: ['Chivo', ...defaultTheme.fontFamily.sans]
            },
            colors: {
                // * Greenery Theme *
                // black: "#3C403D",
                // white: "#FFFFFF",
                // green: {
                //     light: "#DADED4",
                //     medium: "#A3BCB6",
                //     dark: "#39603D"
                // }
                // * Cactus Theme *
                // black: "#283747",
                // white: "#FFFFFF",
                // accent: "#F1B24A",
                // green: {
                //     medium: "#F1B24A",
                //     dark: "#164A41",
                //     light: "#9DC88D"
                // }
                // * Clean/Modern Theme *
                black: "#17252A",
                white: "#FEFFFF",
                green: {
                    light: "#DEF2F1",
                    medium: "#3AAFA9",
                    dark: "#2B7A78"
                }
                // * Blue Theme *
                // black: "#112D32",
                // white: "#C5C6C7",
                // green: {
                //     light: "#88BDBC",
                //     dark: "#6E6658",
                //     medium: "#254E58"
                // }
                // * AQUA Theme *
                // black: "#0B0C10",
                // white: "#C5C6C7",
                // green: {
                //     light: "#66FCF1",
                //     medium: "#45A29E",
                //     dark: "#1F2833"
                // }    
                // * RED Theme *     
                // black: "#1A1A1D",
                // white: "#f2f2f2",
                // green: {
                //     light: "#C3073F",
                //     medium: "#950740",
                //     dark: "#6F2232"
                // }
                // * GREEEN Theme * 
                // black: "#182628",
                // white: "#f2f2f2",
                // green: {
                //     light: "#65ccb8",
                //     medium: "#57BA98",
                //     dark: "#3B945E"
                // },
            },
            typography: {
                dark: {
                    css: {
                        h3: {
                            color: "#17252A"
                        },
                        ol: {
                            '> li': {
                                '&::before': {
                                    'color': "#17252A"
                                }
                            }
                        },  
                    }
                },
                light: {
                    css: {
                        color: "#FEFFFF",
                        ol: {
                            '> li': {
                                '&::before': {
                                    'color': "#FEFFFF"
                                }
                            }
                        },  
                    }
                },
                DEFAULT: {
                    css: {
                        color: "#17252A",
                        a: {
                            color: "#3AAFA9"
                        },
                        h3: {
                            color: "#FEFFFF",
                            'font-size': "1.875rem",
                            'line-height': "2.25rem"
                        },
                        ul: {
                            '> li': {
                                '&::before': {
                                    'background-color': "#17252A"
                                }
                            }
                        }
                    }
                }
            }
        },
    },
    variants: {},
    plugins: [
        require('@tailwindcss/typography'),
        require('@tailwindcss/forms'),
    ],
}