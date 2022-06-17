import React, { useEffect, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import {
    csv,
    curveBasis,
    extent,
    line,
    mean,
    scaleLinear,
    scaleTime,
    timeParse,
} from 'd3'
import type { DSVRowString } from 'd3'
import { animated, config, useSpring } from 'react-spring'
import { Heading } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { camelcaseKeys } from '../common/utils/global'
import dataset from '../data/observed.csv'

type ObservedTemp = {
    year: string
    annualMean: number
}
const LineText = styled(animated.div)`
    font-size: 0.75rem;
    font-weight: 600;
    background: black;
    color: white;
    padding: 0.1rem 0.3rem;
    border-radius: 0.2rem;
    position: absolute;
    top: 5px;
    left: 30px;
`
const height = 200
const width = window.innerWidth * 0.7
const rowConverter = (d: DSVRowString): ObservedTemp => {
    const { year, annualMean } = camelcaseKeys(d) as ObservedTemp
    return {
        year,
        annualMean: Number(annualMean),
    }
}
function DraftBlog(): ReactElement {
    const [data, setData] = useState<ObservedTemp[]>([])
    const [pathLength, setPathLength] = useState(0)
    const pathRef = useRef<SVGPathElement>(null)
    const { x } = useSpring({
        from: { x: pathLength },
        to: { x: 0 },
        config: {
            ...config.gentle,
            duration: 3500,
        },
    })
    const style = useSpring({
        from: { x: 0, y: height },
        to: { x: width - 150, y: 15 },
        config: {
            duration: 3600,
        },
    })
    const yearParse = timeParse('%Y')
    const xAccessor = (d: ObservedTemp): Date => yearParse(d.year) as Date
    const yAccessor = (d: ObservedTemp): number => d.annualMean
    useEffect(() => {
        csv(dataset, rowConverter)
            .then(setData)
            .catch((err) => {
                throw err
            })
    }, [])
    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength())
        }
    }, [setPathLength])
    const yScale = scaleLinear()
        .domain(extent(data, yAccessor) as [number, number])
        .range([height, 0])
    const xScale = scaleTime()
        .domain(extent(data, xAccessor) as [Date, Date])
        .range([0, width - 150])
    const lineGenerator = line<ObservedTemp>()
        .x((d) => xScale(xAccessor(d)))
        .y((d) => yScale(yAccessor(d)))
        .curve(curveBasis)(data)

    if (!data.length && !pathLength) return <div>Loading...</div>
    const filteredRange = data.filter(
        (d) => d.year >= '1880' && d.year <= '1910'
    )

    const meanTemp = mean(filteredRange, yAccessor) as number
    return (
        <div>
            <Heading size="lg">What&apos;s really warming the world?</Heading>
            <svg width={width} height={height}>
                <g style={{ transform: `translate(60px, 0px)` }}>
                    <g>
                        <animated.path
                            id="MyPath"
                            ref={pathRef}
                            fill="none"
                            strokeWidth="2.5"
                            stroke="grey"
                            d={lineGenerator as string}
                            strokeDasharray={pathLength}
                            strokeDashoffset={x}
                        />
                        {/* <animated.text
                            style={{ transform: `translateX(${x}px)` }}
                        >
                            Observed
                        </animated.text> */}
                    </g>
                    <g>
                        <line y2={height * 2} stroke="black" />
                        <line
                            x2={width}
                            x1={0}
                            y1={yScale(meanTemp)}
                            y2={yScale(meanTemp)}
                            stroke="black"
                        />
                    </g>
                </g>
            </svg>
            <LineText style={style}>Observed</LineText>
        </div>
    )
}

export default DraftBlog
