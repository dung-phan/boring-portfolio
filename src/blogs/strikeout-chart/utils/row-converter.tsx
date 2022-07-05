import type { DSVRowString } from 'd3'
import { StrikeOut } from '../types/strike-out'

export function rowConverter(d: DSVRowString): StrikeOut {
    const total = Number(d.so)
    const games = Number(d.g)
    const year = Number(d.year)
    const averagePerGame = total / games
    const teamName = d.histname
    const teamCode = d.franchise
    return {
        year,
        teamCode,
        averagePerGame,
        teamName,
    }
}
