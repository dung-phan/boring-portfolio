import React from 'react'
import type { ReactElement } from 'react'
import { ParallaxLayer } from '@react-spring/parallax'
import { Heading, Box, VStack, HStack } from '@chakra-ui/react'
import { RunningNumber } from '../../common/components/running-number/running-number'
import { StrikeOutChart } from '../../blogs/strikeout-chart/strikeout'

export function Landing(): ReactElement {
    return (
        <ParallaxLayer offset={0} speed={2}>
            <Box h="100%" backgroundColor="white">
                <VStack>
                    <Heading color="brand.600">This is... </Heading>
                    <HStack>
                        <RunningNumber count={30} />
                        <Heading>DOCS</Heading>
                    </HStack>
                </VStack>
                <StrikeOutChart />
            </Box>
        </ParallaxLayer>
    )
}
