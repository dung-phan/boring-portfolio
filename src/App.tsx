import React from 'react'
import type { ReactElement } from 'react'
import { Box, HStack } from '@chakra-ui/react'
import { Parallax, ParallaxLayer } from '@react-spring/parallax'
import { Landing } from './pages/landing/landing'
import { NetWorkChart } from './blogs/network-bar-chart/network-bar'

export default function App(): ReactElement {
    return (
        <Parallax pages={3} style={{ top: 0, left: 0 }}>
            <Landing />
            <ParallaxLayer offset={1} speed={0.5}>
                <HStack>
                    <Box
                        w="50%"
                        h="100vh"
                        style={{ backgroundColor: '#A28480', margin: 0 }}
                    />
                    <Box
                        w="50%"
                        h="100vh"
                        style={{ backgroundColor: '#B9A796', margin: 0 }}
                    />
                </HStack>
            </ParallaxLayer>
            <ParallaxLayer offset={2} speed={1}>
                <NetWorkChart />
            </ParallaxLayer>
        </Parallax>
    )
}
