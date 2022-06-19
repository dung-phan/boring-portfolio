import React, { RefObject } from 'react'
import type { ReactElement } from 'react'

type ChartWrapperProps = {
    width: number
    height: number
    top: number
    left: number
    elementRef: RefObject<SVGSVGElement>
}
export function ChartWrapper({
    width,
    height,
    top,
    left,
    elementRef,
}: ChartWrapperProps): ReactElement {
    return (
        <svg width={width} height={height}>
            <g
                style={{
                    transform: `translate(${left}px, ${top}px)`,
                }}
                ref={elementRef}
            />
        </svg>
    )
}
