import React, { useState, useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import {
    ascending,
    csv,
    DSVRowString,
    select,
    max,
    scaleLinear,
    scaleBand,
    extent,
    axisRight,
} from 'd3'
import dataset from '../../data/subscription_prices.csv'
import { ChartWrapper } from '../../common/components/chart-wrapper/chart-wrapper'

type SubscriptionData = {
    Network: string
    X2013: string
}
type SubscriptionPrice = {
    network: string
    price: number
}
const dimensions = {
    width: window.innerWidth * 0.7,
    height: 600,
    margin: {
        top: 30,
        right: 100,
        bottom: 15,
        left: 15,
    },
}
// calculate bounds
const boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right
const boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom
const grayValues = [
    'C-SPAN',
    'The Weather Channel',
    'Comedy Central',
    'MSNBC',
    'Bravo',
    'TBS',
    'Fox',
    'ESPN2',
    'TNT',
]
const xAccessor = (d: SubscriptionPrice): string => d.network
const yAccessor = (d: SubscriptionPrice): number => d.price
export function NetWorkChart(): ReactElement {
    const [data, setData] = useState<SubscriptionPrice[]>([])
    const xScale = scaleBand()
        .domain(data.map(xAccessor))
        .range([0, boundedWidth])
        .paddingInner(0.1)
    const barWidth = xScale.bandwidth()
    const yScale = scaleLinear()
        .domain(extent(data, yAccessor) as [number, number])
        .range([boundedHeight, 0]) // min = height (bottom of the chart), max = 0 (top of chart)
    const yAxis = axisRight(yScale)
        .ticks(5)
        .tickFormat((d) => (d ? `$${d}` : ''))
        .tickSizeOuter(0)
    const ref = useRef<SVGSVGElement>(null)
    const rowConverter = (d: DSVRowString): SubscriptionPrice => {
        const { Network, X2013 } = d as SubscriptionData
        return {
            network: Network,
            price: Number(X2013),
        }
    }
    useEffect(() => {
        csv(dataset, rowConverter)
            .then((results) =>
                results.sort((a, b) => ascending(a.price, b.price))
            )
            .then(setData)
            .catch(() => {
                throw new Error('Error loading data')
            })
    }, [])
    useEffect(() => {
        const svgElement = select(ref.current)
        const barHeight = (d: SubscriptionPrice): number => yScale(yAccessor(d))
        if (svgElement && data.length) {
            svgElement
                .selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', (d) => xScale(xAccessor(d)) as number)
                .attr('y', (d) => barHeight(d))
                .attr('width', barWidth)
                .attr('height', (d) => boundedHeight - barHeight(d))
                .attr('fill', (d) => {
                    if (max(data, yAccessor) === yAccessor(d)) {
                        return 'orange'
                    }
                    if (grayValues.includes(d.network)) {
                        return '#999'
                    }
                    return '#ddd'
                })
            svgElement
                .selectAll('text')
                .data(data.filter((d) => grayValues.includes(d.network)))
                .enter()
                .append('text')
                .text((d) => `${d.network} ($${d.price})`)
                .attr('x', (d) => xScale(xAccessor(d)) as number)
                .attr('y', (d) => barHeight(d) - 7)
                .attr('font-size', '11px')
                .attr('fill', 'white')
                .attr('text-anchor', (d) => {
                    if (['Comedy Central', 'Bravo'].includes(d.network)) {
                        return 'middle'
                    }
                    return 'end'
                })
            svgElement
                .append('g')
                .call(yAxis)
                .attr('class', 'axis')
                .attr('transform', `translate(${boundedWidth}, 0)`)
                .attr('font-size', '12px')
            svgElement
                .append('text')
                .attr('class', 'highlight-text')
                .text('ESPN')
                .attr('x', boundedWidth + 10)
                .attr('y', 5)
                .attr('font-size', '13px')
                .attr('font-weight', 'bold')
                .attr('fill', 'white')
            svgElement
                .append('text')
                .text('$5.54')
                .attr('x', boundedWidth + 10)
                .attr('y', 20)
                .attr('font-size', '12px')
                .attr('fill', 'white')
            svgElement
                .append('text')
                .text('per subscriber')
                .attr('x', boundedWidth + 10)
                .attr('y', 35)
                .attr('font-size', '12px')
                .attr('fill', 'white')
        }
    }, [data, barWidth, yAxis, xScale, yScale])
    return data.length ? (
        <ChartWrapper
            width={dimensions.width}
            height={dimensions.height}
            elementRef={ref}
            top={dimensions.margin.top}
            left={dimensions.margin.left}
        />
    ) : (
        <pre>Loading...</pre>
    )
}
