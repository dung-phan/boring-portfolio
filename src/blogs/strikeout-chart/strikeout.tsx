import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import {
    csv,
    DSVRowString,
    extent,
    group,
    line,
    max,
    mean,
    scaleLinear,
    scaleTime,
    select,
    timeParse,
    axisBottom,
    axisRight,
} from 'd3'
import dataset from './data/strikeouts.csv'
import { ChartWrapper } from '../../common/components/chart-wrapper/chart-wrapper'

type StrikeOut = {
    year: string
    averagePerGame: number
}
function rowConverter(d: DSVRowString): StrikeOut {
    const total = Number(d.so)
    const games = Number(d.g)
    return {
        ...d,
        year: d.year as string,
        averagePerGame: total / games,
    }
}
const dimensions = {
    width: window.innerWidth * 0.7,
    height: 500,
    margin: {
        top: 30,
        right: 60,
        bottom: 20,
        left: 100,
    },
}
const boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right
const boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom
export function StrikeOutChart(): ReactElement {
    const [data, setData] = useState<StrikeOut[]>([])
    const [average, setAverage] = useState<StrikeOut[]>([])
    const ref = useRef<SVGSVGElement>(null)
    useEffect(() => {
        csv(dataset, rowConverter)
            .then((res) => {
                setData(res)
                const groupByYear = group(res, (d) => d.year)
                const averagePerYear = Array.from(groupByYear).map(
                    ([key, values]) => ({
                        year: key,
                        averagePerGame:
                            mean(values, (d) => d.averagePerGame) ?? 0,
                    })
                )
                setAverage(averagePerYear)
            })

            .catch((err) => {
                throw err
            })
    }, [])
    const timeParser = timeParse('%Y')
    const xAccessor = useCallback(
        (d: StrikeOut) => timeParser(d.year) as Date,
        [timeParser]
    )
    const yAccessor = (d: StrikeOut): number => d.averagePerGame
    const xScale = scaleTime()
        .domain(extent(data, xAccessor) as [Date, Date])
        .range([0, boundedWidth])
    const yScale = scaleLinear()
        .domain([0, max(data, yAccessor)] as [number, number])
        .range([boundedHeight, 0])
    const drawLine = line<StrikeOut>()
        .x((d) => xScale(xAccessor(d)))
        .y((d) => yScale(yAccessor(d)))(average)
    const xAxis = axisBottom(xScale).tickSizeOuter(0)
    const yAxis = axisRight(yScale)
    const yTickValues = yScale.ticks()

    useEffect(() => {
        const svg = select(ref.current)
        if (svg && average.length) {
            svg.selectAll('grid-line')
                .data(yTickValues)
                .enter()
                .append('line')
                .attr('x1', 0)
                .attr('x2', boundedWidth)
                .attr('y1', (d) => yScale(d))
                .attr('y2', (d) => yScale(d))
                .attr('stroke', '#d6d6d6b3')
                .attr('stroke-dasharray', '2,2')
            svg.selectAll('.secondary-circle')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'secondary-circle')
                .attr('cx', (d) => xScale(xAccessor(d)))
                .attr('cy', (d) => yScale(yAccessor(d)))
                .attr('r', 2.7)
                .attr('fill', '#d6d6d6b3')
            // .on('mouseenter', function (event, d) {
            //     svg.append('text')
            //         .attr('id', 'tooltip')
            //         .attr('y', `${Number(this.getAttribute('cy')) - 12}px`)
            //         .attr('text-anchor', 'middle')
            //         .attr('font-size', '12px')
            //         .attr('fill', 'black')
            //         .text(`${d.averagePerGame.toFixed(2)}`)
            //         .attr('x', `${this.getAttribute('cx')}px`)
            //         // eslint-disable-next-line react/no-this-in-sfc
            //         .attr('y', `${Number(this.getAttribute('cy')) - 10}px`)
            // })
            // .on('mouseleave', function (event, d) {
            //     svg.select('#tooltip').remove()
            // })
            svg.append('path')
                .datum(average)
                .attr('d', drawLine)
                .attr('stroke', '#0f618a')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
            svg.selectAll('.average-circle')
                .data(average)
                .enter()
                .append('circle')
                .attr('class', 'average-circle')
                .attr('cx', (d) => xScale(xAccessor(d)))
                .attr('cy', (d) => yScale(yAccessor(d)))
                .attr('r', 3.5)
                .attr('fill', '#0f618acc')
                .attr('stroke', '#fff')
                .attr('stroke-opacity', 0.5)
                .attr('stroke-width', '1px')
            svg.append('g')
                .call(xAxis)
                .attr('transform', `translate(0, ${boundedHeight})`)
                .attr('font-size', '11px')
            svg.append('g')
                .call(yAxis)
                .attr('transform', `translate(${boundedWidth}, 0)`)
                .attr('stroke-width', 0)
                .attr('font-size', '11.5px')
        }
        return () => {
            svg.selectAll('*').remove()
        }
    }, [
        average,
        data,
        drawLine,
        xScale,
        yScale,
        xAccessor,
        xAxis,
        yAxis,
        yTickValues,
    ])
    return data.length ? (
        <ChartWrapper
            width={dimensions.width}
            height={dimensions.height}
            top={dimensions.margin.top}
            left={dimensions.margin.left}
            elementRef={ref}
        />
    ) : (
        <pre>Loading...</pre>
    )
}
