import React from 'react'
import type { ReactElement } from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { teamOptions } from './team-options'
import { isEmpty } from '../../../../common/utils/global'
import { useFetchTeams } from '../../hooks/use-fetch-teams'

type ChartLegendProps = {
    selectedTeam: string
    onSelectTeam: (team: string) => void
}
export function ChartLegend({
    selectedTeam,
    onSelectTeam,
}: ChartLegendProps): ReactElement {
    const teams = useFetchTeams()
    return (
        <Box className="legend">
            <Flex alignItems="center" className="league" mb={1}>
                <svg>
                    <g>
                        <line x2="20" />
                        <circle r="2" />
                        <circle cx="20" r="2" />
                    </g>
                </svg>
                <div> League average </div>
            </Flex>
            <Flex alignItems="center" className="team">
                <svg>
                    <g>
                        <line x2="20" />
                        <circle r="2" />
                        <circle r="2" cx="20" />
                    </g>
                </svg>
                <select
                    className="select-option"
                    onChange={(e) => onSelectTeam(e.target.value)}
                    value={selectedTeam}
                >
                    <option value="none">Choose a team</option>
                    {teamOptions.map((option) => (
                        <optgroup label={option.label} key={option.code}>
                            {!isEmpty(teams)
                                ? teams
                                      .filter(
                                          (team) => team.league === option.code
                                      )
                                      .map((team) => (
                                          <option
                                              value={team.code}
                                              key={team.name}
                                          >
                                              {team.name}
                                          </option>
                                      ))
                                : null}
                        </optgroup>
                    ))}
                </select>
                {selectedTeam ? (
                    <button
                        className="remove-team"
                        type="button"
                        onClick={() => onSelectTeam('')}
                    >
                        ✕
                    </button>
                ) : null}
            </Flex>
        </Box>
    )
}
