import { Global } from '@emotion/react'
import React from 'react'
import type { ReactElement } from 'react'
import NHassGroteskBold from '../../static/fonts/NHaasGrotesk/NHaasGrotesk_Bd.ttf'
import NHassGroteskMedium from '../../static/fonts/NHaasGrotesk/NHaasGrotesk_Md.ttf'
import NHassGroteskRegular from '../../static/fonts/NHaasGrotesk/NHaasGrotesk_Rg.ttf'

function Fonts(): ReactElement {
    return (
        <Global
            styles={`
        @font-face {
          font-family: 'NHassGrotesk Bold';
          font-style: bold;
          font-weight: 900;
          font-display: swap;
          src: url(${NHassGroteskBold}) format('truetype');
        }
        @font-face {
          font-family: 'NHassGrotesk Medium';
          font-style: normal;
          font-weight: 700;
          font-display: swap;
          src: url(${NHassGroteskMedium}) format('truetype');
        }
        @font-face {
          font-family: 'NHassGrotesk Regular';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url(${NHassGroteskRegular}) format('truetype');
        }
      `}
        />
    )
}
export default Fonts
