import { csv } from 'd3'
import type { DSVRowString } from 'd3'
import { useEffect, useState } from 'react'
import dataset from '../data/teams.csv'

export type TeamInfo = {
    name: string
    league: 'NL' | 'AL'
    code: string
}
export function useFetchTeams(): TeamInfo[] {
    const [teams, setTeams] = useState<TeamInfo[]>([])

    useEffect(() => {
        csv(dataset, (d: DSVRowString) => d as TeamInfo)
            .then(setTeams)
            .catch((err) => {
                throw err
            })
    }, [])

    return teams
}
