import React from 'react'
import type { ReactElement } from 'react'
import { ParallaxLayer } from '@react-spring/parallax'
import { Heading, Center, VStack, HStack } from '@chakra-ui/react'
import { RunningNumber } from '../../common/components/running-number'

export function Landing(): ReactElement {
    return (
        <ParallaxLayer offset={0} speed={2}>
            <Center h="100%">
                <VStack>
                    <Heading color="brand.600">This is... </Heading>
                    <HStack>
                        <RunningNumber count={30} />
                        <Heading>DOCS</Heading>
                    </HStack>
                </VStack>
            </Center>
        </ParallaxLayer>
    )
}
