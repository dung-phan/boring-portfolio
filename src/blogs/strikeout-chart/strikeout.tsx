/* eslint-disable react/no-this-in-sfc */
/* eslint-disable @typescript-eslint/no-shadow */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { ReactElement } from 'react'
import {
    csv,
    group,
    line,
    max,
    mean,
    scaleLinear,
    select,
    axisBottom,
    axisRight,
    extent,
} from 'd3'
import { Container, Heading, Text } from '@chakra-ui/react'
import dataset from './data/strikeouts.csv'
import { ChartWrapper } from '../../common/components/chart-wrapper/chart-wrapper'
import './style/strikeout.css'
import { rowConverter } from './utils/row-converter'
import { StrikeOut } from './types/strike-out'
import { ChartLegend } from './components/chart-legend/chart-legend'

const dimensions = {
    width: window.innerWidth * 0.7,
    height: 500,
    margin: {
        top: 50,
        right: 60,
        bottom: 20,
        left: 50,
    },
}
const boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right
const boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom
export function StrikeOutChart(): ReactElement {
    const [data, setData] = useState<StrikeOut[]>([])
    const [average, setAverage] = useState<StrikeOut[]>([])
    const [selectedTeam, setSelectedTeam] = useState<string>('')
    const [selectedTeamData, setSelectedTeamData] = useState<StrikeOut[]>([])
    const [minAverage, setMinAverage] = useState<StrikeOut>()
    const [maxAverage, setMaxAverage] = useState<StrikeOut>()
    const ref = useRef<SVGSVGElement>(null)
    const xAccessor = useCallback((d: StrikeOut): number => d.year, [])
    const yAccessor = (d: StrikeOut): number => d.averagePerGame
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
                const [minScore, maxScore] = extent(
                    averagePerYear,
                    yAccessor
                ) as [number, number]
                setMinAverage({
                    year:
                        averagePerYear.find(
                            (d) => d.averagePerGame === minScore
                        )?.year ?? 0,
                    averagePerGame: Number(minScore.toFixed(1)),
                })
                setMaxAverage({
                    year:
                        averagePerYear.find(
                            (d) => d.averagePerGame === maxScore
                        )?.year ?? 0,
                    averagePerGame: Number(maxScore.toFixed(1)),
                })
            })

            .catch((err) => {
                throw err
            })
    }, [xAccessor])

    const xScale = scaleLinear()
        .domain([1900, max(average, xAccessor) as number])
        .range([0, boundedWidth])
    const yScale = scaleLinear()
        .domain([0, max(data, yAccessor)] as [number, number])
        .range([boundedHeight, 0])
    const drawLine = line<StrikeOut>()
        .x((d) => xScale(xAccessor(d)))
        .y((d) => yScale(yAccessor(d)))
    const xAxis = axisBottom(xScale).tickSizeOuter(0)
    const yAxis = axisRight(yScale)
    const yTickValues = yScale.ticks()
    const onSelectTeam = useCallback(
        (team: string): void => {
            setSelectedTeam(team)
            setSelectedTeamData(data.filter((d) => d.teamCode === team))
        },
        [data]
    )
    useEffect(() => {
        const svg = select(ref.current)
        if (svg && average.length && minAverage && maxAverage) {
            const headerText = svg
                .append('g')
                .style('transform', 'translateY(25px)')
            headerText
                .append('text')
                .attr('class', 'chart-heading')
                .text('Strikeouts per game per team')
            headerText
                .append('text')
                .attr('class', 'chart-heading-sub')
                .attr('x', 205)
                .text('(by batters)')
            svg.selectAll('.grid-lines')
                .data(yTickValues)
                .enter()
                .append('line')
                .attr('class', 'grid-lines')
                .attr('x1', (d) => {
                    // eslint-disable-next-line no-nested-ternary
                    return d === 8 ? 200 : d === 9 ? 280 : 0
                })
                .attr('x2', boundedWidth)
                .attr('y1', (d) => yScale(d))
                .attr('y2', (d) => yScale(d))
            svg.selectAll('.team-circles')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'team-circles')
                .attr('cx', (d) => xScale(xAccessor(d)))
                .attr('cy', (d) => yScale(yAccessor(d)))
                .attr('r', 2.7)
                .attr('fill', (d) => {
                    return d.teamCode === selectedTeam
                        ? 'transparent'
                        : '#d6d6d6b3'
                })
                .on('mouseenter', function onMouseEnter(event, d) {
                    const xPosition = Number(this.getAttribute('cx'))
                    const yPosition = Number(this.getAttribute('cy'))
                    const yearAverage =
                        average.find((game) => d.year === game.year)
                            ?.averagePerGame ?? 0
                    const toolTipText = svg
                        .append('g')
                        .attr('class', 'tooltip')
                        .style('transform', `translate(${xPosition}px`)
                    toolTipText
                        .append('text')
                        .text(`${d.averagePerGame.toFixed(2)}`)
                        .attr(
                            'y',
                            d.averagePerGame < yearAverage
                                ? `${yPosition + 25}px`
                                : `${yPosition - 40}px`
                        )
                        .attr('class', 'annotation-highlight')
                    toolTipText
                        .selectAll('annotation-subtext')
                        .data([`${d.teamName}`, `${d.year}`])
                        .enter()
                        .append('text')
                        .attr('class', 'annotation-subtext')
                        .attr(
                            'y',
                            d.averagePerGame < yearAverage
                                ? `${yPosition + 38}px`
                                : `${yPosition - 24}px`
                        )
                        .attr('dy', (d, i) => `${i * 1.3}em`)
                        .text((d) => d)
                    svg.append('circle')
                        .attr('class', 'tooltip-circle')
                        .attr('cx', xPosition)
                        .attr('cy', yPosition)
                        .attr('r', 4)
                })
                .on('mouseleave', () => {
                    svg.select('.tooltip').remove()
                    svg.select('.tooltip-circle').remove()
                })
                .on('click', (event, d) => {
                    onSelectTeam(d.teamCode as string)
                })

            svg.append('path')
                .datum(average)
                .attr('class', 'average-line')
                .attr('d', drawLine(average))

            const firstAnnotationGroup = svg
                .append('g')
                .style('transform', `translateX(${xScale(1917)}px)`)
            firstAnnotationGroup
                .append('line')
                .attr('class', 'annotation-line')
                .attr('y1', yScale(3.48))
                .attr('y2', yScale(1) - 13)
            firstAnnotationGroup
                .selectAll('.annotation-text')
                .data(['U.S enters', 'World War I.'])
                .enter()
                .append('text')
                .attr('class', 'annotation-text')
                .attr('y', yScale(1.08))
                .attr('dy', (d, i) => `${i * 1.3}em`)
                .text((d) => d)
            const secondAnnotationGroup = svg
                .append('g')
                .style('transform', `translateX(${xScale(1946)}px)`)
            secondAnnotationGroup
                .append('line')
                .attr('class', 'annotation-line')
                .attr('y1', yScale(3.88))
                .attr('y2', yScale(1.9))
            secondAnnotationGroup
                .selectAll('.annotation-text')
                .data(['Players return', 'from World War II.'])
                .enter()
                .append('text')
                .attr('class', 'annotation-text')
                .attr('y', yScale(1.9) + 10)
                .attr('dy', (d, i) => `${i * 1.3}em`)
                .text((d) => d)
            const thirdAnnotationGroup = svg
                .append('g')
                .style('transform', `translateX(${xScale(1963)}px)`)
            thirdAnnotationGroup
                .append('line')
                .attr('class', 'annotation-line')
                .attr('y1', yScale(5.79))
                .attr('y2', yScale(2.9))
            thirdAnnotationGroup
                .selectAll('.annotation-text')
                .data(['Strike zone enlarged', 'from 1963-1968.'])
                .enter()
                .append('text')
                .attr('class', 'annotation-text')
                .attr('y', yScale(2.9) + 10)
                .attr('dy', (d, i) => `${i * 1.3}em`)
                .text((d) => d)
            const fourthAnnotationGroup = svg
                .append('g')
                .style('transform', `translateX(${xScale(1969)}px)`)
            fourthAnnotationGroup
                .append('line')
                .attr('class', 'annotation-line')
                .attr('y1', yScale(8.7) + 40)
                .attr('y2', yScale(5.8))
            fourthAnnotationGroup
                .selectAll('.annotation-text')
                .data([
                    'Pitching has become so dominant',
                    'in the 1960s that the mound',
                    'was lowered in 1969.',
                ])
                .enter()
                .append('text')
                .attr('class', 'annotation-text')
                .attr('y', yScale(8.7))
                .attr('dy', (d, i) => `${i * 1.3}em`)
                .text((d) => d)
            const fifthAnnotationGroup = svg
                .append('g')
                .style('transform', `translateX(${xScale(1973)}px)`)
            fifthAnnotationGroup
                .append('line')
                .attr('class', 'annotation-line')
                .attr('y1', yScale(5.2))
                .attr('y2', yScale(1.6) - 13)
            fifthAnnotationGroup
                .selectAll('.annotation-text')
                .data(['Designated hitter', 'rule took effect.'])
                .enter()
                .append('text')
                .attr('class', 'annotation-text')
                .attr('y', yScale(1.6))
                .attr('dy', (d, i) => `${i * 1.3}em`)
                .text((d) => d)
            const sixthAnnotationGroup = svg
                .append('g')
                .style('transform', `translateX(${xScale(2008)}px)`)
            sixthAnnotationGroup
                .append('line')
                .attr('class', 'annotation-line')
                .attr('y1', yScale(6.8))
                .attr('y2', yScale(3.9))
            sixthAnnotationGroup
                .selectAll('.annotation-text')
                .data(['Mitchell report', 'on steroids.'])
                .enter()
                .append('text')
                .attr('class', 'annotation-text')
                .attr('y', yScale(3.8) + 10)
                .attr('dy', (d, i) => `${i * 1.3}em`)
                .text((d) => d)
            svg.selectAll('.average-circles')
                .data(average)
                .enter()
                .append('circle')
                .attr('class', 'average-circles')
                .attr('cx', (d) => xScale(xAccessor(d)))
                .attr('cy', (d) => yScale(yAccessor(d)))
                .attr('r', 3.5)
            if (selectedTeam) {
                svg.append('path')
                    .datum(selectedTeamData)
                    .attr('class', 'team-line')
                    .attr('d', drawLine(selectedTeamData))
                svg.selectAll('.team-circle overlay')
                    .data(selectedTeamData)
                    .enter()
                    .append('circle')
                    .attr('class', 'team-circle overlay')
                    .attr('cx', (d) => xScale(xAccessor(d)))
                    .attr('cy', (d) => yScale(yAccessor(d)))
                    .attr('r', 2.7)
                    .attr('fill', '#f2a20d')
            }
            svg.append('g')
                .call(xAxis)
                .attr('transform', `translate(0, ${boundedHeight})`)
                .attr('class', 'axis-x')
            svg.append('g')
                .call(yAxis)
                .attr('transform', `translate(${boundedWidth}, 0)`)
                .attr('class', 'axis-y')
            const highlightedYears = svg
                .append('g')
                .attr('class', 'min-annotation')
            highlightedYears
                .selectAll('.circle-annotation-text')
                .data([minAverage, maxAverage])
                .enter()
                .append('text')
                .attr('x', (d) => xScale(xAccessor(d)))
                .attr('y', (d) => yScale(yAccessor(d)))
                .attr('dy', (d) => {
                    if (yAccessor(d) > minAverage.averagePerGame) {
                        return '-0.5em'
                    }
                    return '1.2em'
                })
                .attr('class', 'circle-annotation-text')
                .text((d) => yAccessor(d))
            highlightedYears
                .selectAll('.circle-annotation-subtext')
                .data(['Leage average, '])
            svg.selectAll('.circles-hightlight')
                .data([minAverage, maxAverage])
                .enter()
                .append('circle')
                .attr('class', 'circles-hightlight')
                .attr('cx', (d) => xScale(xAccessor(d)))
                .attr('cy', (d) => yScale(yAccessor(d)))
                .attr('r', 6)

            // on('mouseleave', () => {
            //     const group = svg
            //     group

            // }).on('mouseenter', () => {
            //     svg.select('.min-annotation').remove()
            // })
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
        selectedTeam,
        selectedTeamData,
        onSelectTeam,
        minAverage,
        maxAverage,
    ])
    return data.length ? (
        <Container maxW="container.xl">
            <Heading>Strikeouts on the Rise</Heading>
            <Text>
                There were more strikeouts in 2012 than at any other time in
                major league history
            </Text>
            <div className="container">
                <ChartLegend
                    selectedTeam={selectedTeam}
                    onSelectTeam={onSelectTeam}
                />
                <ChartWrapper
                    width={dimensions.width}
                    height={dimensions.height}
                    top={dimensions.margin.top}
                    left={dimensions.margin.left}
                    elementRef={ref}
                />
            </div>
        </Container>
    ) : (
        <pre>Loading...</pre>
    )
}
