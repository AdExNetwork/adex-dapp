import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { push } from 'connected-react-router'
import Typography from '@material-ui/core/Typography'
import {
	execute,
	updateIdentity,
	ownerIdentities as updateOwnerIdentities,
} from 'actions'
import {
	selectSpinnerById,
	selectIdentity,
	t,
	selectSearchParams,
} from 'selectors'
import Dropdown from 'components/common/dropdown'
import { GETTING_OWNER_IDENTITIES } from 'constants/spinners'

const getIdentitiesForDropdown = (ownerIdentities = [], t) =>
	ownerIdentities.map(id => {
		return {
			value: id.identity + '-' + id.privLevel,
			label: t('IDENTITY_OPTION_DATA', {
				args: [id.identity, id.privLevel, id.data.email || '-'],
			}),
		}
	})

function FullLogin(props) {
	const identity = useSelector(selectIdentity)
	const {
		walletAddr,
		wallet = {},
		ownerIdentities,
		identityContractAddress,
	} = identity
	const walletAddress = wallet.address || walletAddr
	const spinner = useSelector(state =>
		selectSpinnerById(state, GETTING_OWNER_IDENTITIES)
	)
	const searchParams = useSelector(selectSearchParams)
	searchParams.set('step', '1')

	const search = searchParams.toString()

	useEffect(() => {
		execute(updateOwnerIdentities({ owner: walletAddress }))
		// We need it just once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Grid
			container
			spacing={2}
			// direction='row'
			alignContent='space-between'
			alignItems='center'
		>
			<Grid item xs={12}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Typography variant='body2' color='primary' gutterBottom>
							{t('FULL_LOGIN_INFO')}
						</Typography>
					</Grid>
					<Grid item xs={12}>
						<Dropdown
							label={t('SELECT_IDENTITY')}
							helperText={t('SELECT_IDENTITY_INFO')}
							onChange={val =>
								execute(updateIdentity('identityContractAddress', val))
							}
							source={getIdentitiesForDropdown(ownerIdentities, t)}
							value={identityContractAddress || ''}
							htmlId='label-identityContractAddress'
							fullWidth
							loading={!!spinner}
							noSrcLabel={t('NO_IDENTITIES_FOR_ADDR', {
								args: [walletAddress],
							})}
						/>
					</Grid>
					<Grid item xs={12}>
						<Button onClick={() => execute(push(`/signup/full?${search}`))}>
							{t('CREATE_NEW_IDENTITY_LINK')}
						</Button>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}

export default FullLogin