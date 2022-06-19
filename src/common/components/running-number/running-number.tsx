import React from 'react'
import type { ReactElement } from 'react'
import { animated, config, useSpring } from 'react-spring'
import { Heading } from '@chakra-ui/react'
import styled from '@emotion/styled'

type RunningNumberProps = {
    count: number
}
const AnimatedHeading = styled(animated(Heading))``
export function RunningNumber({ count }: RunningNumberProps): ReactElement {
    const { number } = useSpring({
        from: { number: 0 },
        number: count,
        config: { delay: 200, ...config.molasses },
    })

    return <AnimatedHeading>{number.to((n) => n.toFixed(0))}</AnimatedHeading>
}
