import React from 'react'
import PropTypes from 'prop-types'
import { constants, IabCategories } from 'adex-models'
import OutlinedPropView from 'components/common/OutlinedPropView'

import { t } from 'selectors'
import { Box, Chip, Tooltip } from '@material-ui/core'

const { CountryNames, CountryTiers } = constants

const AudiencePreview = ({ audienceInput = {}, subHeader }) => {
	const {
		location = {},
		categories = {},
		publishers = {},
		advanced = {},
	} = audienceInput

	return (
		<Box>
			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`LOCATION_${(location.apply || '').toUpperCase()}`)}
					value={
						location.apply === 'allin' ? (
							<Chip
								variant='outlined'
								size='small'
								label={t('ALL_COUNTRIES')}
							/>
						) : (
							(location[location.apply] || []).map(x => (
								<Tooltip
									title={
										CountryTiers[x]
											? CountryTiers[x].countries.join(', ')
											: t(CountryNames[x] || x || '')
									}
								>
									<Chip variant='outlined' size='small' label={t(x || '')} />
								</Tooltip>
							))
						)
					}
				/>
			</Box>
			{!!categories.apply &&
				categories.apply.map(apply => (
					<Box m={1}>
						<OutlinedPropView
							margin='dense'
							label={t(`CATEGORIES_${(apply || '').toUpperCase()}`)}
							value={(categories[apply] || []).map(cat => (
								<Chip
									variant='outlined'
									size='small'
									label={t(
										IabCategories.wrbshrinkerWebsiteApiV3Categories[cat] || cat
									)}
								/>
							))}
						/>
					</Box>
				))}

			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`PUBLISHERS_${(publishers.apply || '').toUpperCase()}`)}
					value={
						publishers.apply === 'allin' ? (
							<Chip
								variant='outlined'
								size='small'
								label={t('ALL_PUBLISHERS')}
							/>
						) : (
							(publishers[publishers.apply] || []).map(x => (
								<Chip
									variant='outlined'
									size='small'
									label={(JSON.parse(x) || {}).hostname}
								/>
							))
						)
					}
				/>
			</Box>
			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`INCLUDE_INCENTIVIZED_TRAFFIC`)}
					value={t(advanced.includeIncentivized ? 'TRUE' : 'FALSE')}
				/>
			</Box>
			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`DISABLE_FREQUENCY_CAPPING`)}
					value={t(advanced.disableFrequencyCapping ? 'TRUE' : 'FALSE')}
				/>
			</Box>
			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`LIMIT_AVERAGE_DAILY_SPENDING`)}
					value={t(advanced.limitDailyAverageSpending ? 'TRUE' : 'FALSE')}
				/>
			</Box>
		</Box>
	)
}

AudiencePreview.propTypes = {
	audienceInput: PropTypes.array,
	subHeader: PropTypes.string,
}

export default AudiencePreview