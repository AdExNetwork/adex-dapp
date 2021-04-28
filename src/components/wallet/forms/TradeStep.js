import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { makeStyles } from '@material-ui/core/styles'
import {
	TextField,
	Button,
	Box,
	Grid,
	Paper,
	// InputAdornment,
	Typography,
	OutlinedInput,
} from '@material-ui/core'
import { AmountWithCurrency } from 'components/common/amount'
// import { InputLoading } from 'components/common/spinners/'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import {
	t,
	selectValidationsById,
	selectNewTransactionById,
	// selectSpinnerById,
	selectWeb3SyncSpinnerByValidateId,
	selectTradableAssetsFromSources,
	selectTradableAssetsToSources,
	selectAccountStatsRaw,
	selectBaseAssetsPrices,
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
import { formatTokenAmount } from 'helpers/formatters'

const styles = theme => {
	return {
		leftInput: {
			borderBottomRightRadius: 0,
			borderTopRightRadius: 0,
			borderRight: 0,
			borderRightWidth: '0 !important',
		},
		notchedOutlineLeft: {
			borderRightWidth: '0 !important',
		},
		rightInput: {
			borderBottomLeftRadius: 0,
			borderTopLeftRadius: 0,
			borderLeft: 0,
		},
		notchedOutlineRight: {
			borderLeftWidth: '0 !important',
		},
	}
}

const useStyles = makeStyles(styles)

const ZERO = BigNumber.from(0)

const getMainCurrencyValue = ({ asset, floatAmount, prices, mainCurrency }) => {
	const price = (prices[asset] || {})[mainCurrency] || 0
	const value = parseFloat(floatAmount) * price
	return value.toFixed(2)
}

const conversionRate = ({ formAsset, toAsset, prices, mainCurrency }) => {
	const fromPrice = parseFloat((prices[formAsset] || {})[mainCurrency] || 0)
	const toPrice = parseFloat((prices[toAsset] || {})[mainCurrency] || 0)

	if (!toPrice) {
		return null
	}

	return fromPrice / toPrice
}

const estimatedConversionValue = ({
	formAsset,
	toAsset,
	formAssetAmount,
	prices,
	mainCurrency,
}) => {
	const rate = conversionRate({
		formAsset,
		toAsset,
		prices,
		mainCurrency,
	})

	const value =
		rate && !!parseFloat(formAssetAmount)
			? parseFloat(formAssetAmount) * rate
			: null

	return value
}

const WalletTradeStep = ({ stepsId, validateId } = {}) => {
	const classes = useStyles()
	// NOTE: RAW DATA - BNs - format in fields
	const [selectedPercent, setSelectedPercent] = useState(0)
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const prices = useSelector(selectBaseAssetsPrices)
	const assetsFromSource = useSelector(selectTradableAssetsFromSources)
	const assetsToSource = useSelector(selectTradableAssetsToSources)
	const mainCurrency = { id: 'USD', symbol: '$' } // TODO selector

	const {
		formAsset,
		formAssetAmount,
		toAsset = assetsFromSource[1].value,
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	const selectedFromAsset = assetsData[formAsset] || {}
	const selectedToAsset = assetsData[toAsset] || {}
	const selectedFormAssetMainCurrencyValue = getMainCurrencyValue({
		asset: selectedFromAsset.symbol,
		floatAmount: formAssetAmount,
		prices,
		mainCurrency: mainCurrency.id,
	})

	const fromAssetUserBalance = selectedFromAsset
		? selectedFromAsset.balance
		: ZERO

	// const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const toAssetAmount = estimatedConversionValue({
		formAssetAmount,
		formAsset: selectedFromAsset.symbol,
		toAsset: selectedToAsset.symbol,
		prices,
		mainCurrency: mainCurrency.id,
	})

	const selectedToAssetMainCurrencyValue = toAssetAmount
		? getMainCurrencyValue({
				asset: selectedToAsset.symbol,
				floatAmount: toAssetAmount,
				prices,
				mainCurrency: mainCurrency.id,
		  })
		: null

	const {
		formAssetAmount: errFormAssetAmount,
		formAsset: errFormAsset,
		toAsset: errToAsset,
		fees: errFees,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	const setTradePercent = percent => {
		const bnBalance = BigNumber.from(fromAssetUserBalance)
			.mul(percent)
			.div(100)
		const value = formatTokenAmount(bnBalance, selectedFromAsset.decimals)
		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'formAssetAmount',
				value,
			})
		)
	}

	useEffect(() => {
		if (!formAsset) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'formAsset',
					value: assetsFromSource[0].value,
				})
			)
		}
		if (formAssetAmount === undefined) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'formAssetAmount',
					value: '0',
				})
			)
		}
	})

	return (
		<ContentBox>
			{syncSpinner ? (
				<FullContentMessage
					msgs={[{ message: 'SYNC_DATA_MSG' }]}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Box>
						<Paper elevation={25}>
							<Box p={2}>
								<Grid container spacing={0}>
									<Grid item xs={12}>
										<Box mb={2}>
											<Typography variant='h5'>{t('FROM')}</Typography>
										</Box>
									</Grid>
									<Grid item xs={8}>
										<Box>
											<Box>
												<TextField
													// disabled={spinner}
													variant='outlined'
													type='text'
													fullWidth
													required
													label={
														<Box display='inline'>
															{t('TRADE_FROM_ASSET_AMOUNT_LABEL')} (
															{t('AVAILABLE')}{' '}
															<AmountWithCurrency
																amount={formatTokenAmount(
																	fromAssetUserBalance,
																	selectedToAsset.decimals
																)}
																fontSize={16}
															/>
															)
														</Box>
													}
													name='amountToWithdraw'
													value={`${formAssetAmount}`}
													onChange={ev => {
														execute(
															updateNewTransaction({
																tx: stepsId,
																key: 'formAssetAmount',
																value: ev.target.value,
															})
														)
														setSelectedPercent(0)
													}}
													error={
														errFormAssetAmount && !!errFormAssetAmount.dirty
													}
													helperText={
														errFormAssetAmount && !!errFormAssetAmount.dirty
															? errFormAssetAmount.errMsg
															: null
													}
													InputProps={{
														classes: {
															root: classes.leftInput,
															// notchedOutline: classes.notchedOutlineLeft,
														},
													}}
												/>
												<Box mt={1}>
													{[25, 50, 75, 100].map(percent => (
														<Box
															display='inline'
															key={percent.toString()}
															p={0.5}
														>
															<Button
																variant={
																	selectedPercent === percent
																		? 'contained'
																		: 'outlined'
																}
																size='small'
																color='default'
																disabled={!selectedFromAsset}
																onClick={() => {
																	setTradePercent(percent)
																	setSelectedPercent(percent)
																}}
															>
																{percent}%
															</Button>
														</Box>
													))}
												</Box>
											</Box>
										</Box>
									</Grid>
									<Grid item xs={4}>
										<Dropdown
											fullWidth
											variant='outlined'
											required
											onChange={value => {
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'formAsset',
														value,
													})
												)
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'formAssetAmount',
														value: '0',
													})
												)
												setSelectedPercent(0)
											}}
											source={assetsFromSource}
											value={formAsset + ''}
											label={t('FROM_ASSET_LABEL')}
											htmlId='wallet-asset-from-dd'
											name='formAsset'
											error={errFormAsset && !!errFormAsset.dirty}
											helperText={
												errFormAsset && !!errFormAsset.dirty
													? errFormAsset.errMsg
													: // : t('WALLET_TRADE_FROM_ASSET')
													  ''
											}
											inputComponent={
												<OutlinedInput
													label={t('FROM_ASSET_LABEL')}
													labelWidth={0}
													classes={{
														root: classes.rightInput,
														// notchedOutline: classes.notchedOutlineRight,
													}}
												/>
											}
										/>
									</Grid>
								</Grid>
							</Box>
						</Paper>
						<Box my={4}></Box>
						<Paper elevation={25}>
							<Box p={2}>
								<Grid container spacing={0}>
									<Grid item xs={12}>
										<Box mb={2}>
											<Typography variant='h5'>{t('TO')}</Typography>
										</Box>
									</Grid>
									<Grid item xs={8}>
										<TextField
											// disabled={spinner}
											variant='outlined'
											type='text'
											fullWidth
											// disabled
											label={
												<Box display='inline'>
													{t('TRADE_TO_ASSET_ESTIMATED_AMOUNT_LABEL')}
												</Box>
											}
											name='amountToWithdraw'
											value={`${toAssetAmount || 'N/A'}`}
											helperText={
												<AmountWithCurrency
													amount={selectedToAssetMainCurrencyValue}
													unit={mainCurrency.symbol}
													unitPlace='left'
													fontSize={16}
												/>
											}
											InputProps={{
												classes: {
													root: classes.leftInput,
													// notchedOutline: classes.notchedOutlineLeft,
												},
											}}
										/>
									</Grid>
									<Grid item xs={4}>
										<Dropdown
											fullWidth
											variant='outlined'
											required
											onChange={value =>
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'toAsset',
														value,
													})
												)
											}
											source={assetsToSource}
											value={toAsset + ''}
											label={t('TO_ASSET_LABEL')}
											htmlId='wallet-asset-to-dd'
											name='formAsset'
											error={errToAsset && !!errToAsset.dirty}
											helperText={
												errToAsset && !!errToAsset.dirty
													? errToAsset.errMsg
													: // : t('WALLET_TRADE_FROM_ASSET')
													  ''
											}
											inputComponent={
												<OutlinedInput
													label={t('TO_ASSET_LABEL')}
													labelWidth={0}
													classes={{
														root: classes.rightInput,
														// notchedOutline: classes.notchedOutlineRight,
													}}
												/>
											}
										/>
									</Grid>
								</Grid>
							</Box>
						</Paper>

						{errFees && errFees.dirty && errFees.errMsg && (
							<Alert variant='filled' severity='error'>
								{errFees.errMsg}
							</Alert>
						)}
					</Box>
				</ContentBody>
			)}
		</ContentBox>
	)
}

WalletTradeStep.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default WalletTradeStep