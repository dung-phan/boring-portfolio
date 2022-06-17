import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    styles: {
        global: {
            'html, body, #root': {
                height: '100%',
                background: '#35454B',
                color: '#C2AA84',
            },
        },
    },
    fonts: {
        heading: 'NHassGrotesk Bold',
        body: 'NHassGrotesk Regular',
    },
    colors: {
        brand: {
            900: '#35454B',
            600: '#BA8073',
        },
    },
    components: {
        Heading: {
            sizes: {
                lg: {
                    fontSize: '8xl',
                },
            },
            defaultProps: {
                size: 'lg',
            },
        },
    },
})
export default theme
