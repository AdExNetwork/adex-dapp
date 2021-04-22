import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { TextField, Button, Box, Grid, Paper } from '@material-ui/core'
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

const ZERO = BigNumber.from(0)

const getMainCurrencyValue = ({ asset, floatAmount, prices, mainCurrency }) => {
	const price = (prices[asset] || {})[mainCurrency] || 0
	const value = parseFloat(floatAmount) * price
	return value.toFixed(2)
}

const WalletTradeStep = ({ stepsId, validateId } = {}) => {
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const prices = useSelector(selectBaseAssetsPrices)
	const assetsFromSource = useSelector(selectTradableAssetsFromSources)
	const assetsToSource = useSelector(selectTradableAssetsToSources)
	const mainCurrency = { id: 'USD', symbol: '$' } // TODO selector

	const {
		formAsset = assetsFromSource[0].value,
		formAssetAmount = '0',
		toAsset = assetsFromSource[1].value,
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	const selectedFromAsset = assetsData[formAsset]
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

	return (
		<ContentBox>
			{syncSpinner ? (
				<FullContentMessage
					msgs={[{ message: 'SYNC_DATA_MSG' }]}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Paper>
						<Box p={1}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									From
								</Grid>
								<Grid item xs={12} md={6}>
									<Dropdown
										fullWidth
										variant='standard'
										required
										onChange={value => {
											execute(
												updateNewTransaction({
													tx: stepsId,
													key: 'formAsset',
													value,
												})
											)
										}}
										source={assetsFromSource}
										value={formAsset + ''}
										label={t('PROP_FROMASSET')}
										htmlId='wallet-asset-from-dd'
										name='formAsset'
										error={errFormAsset && !!errFormAsset.dirty}
										helperText={
											errFormAsset && !!errFormAsset.dirty
												? errFormAsset.errMsg
												: t('WALLET_TRADE_FROM_ASSET')
										}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Box>
										<Box>
											<TextField
												// disabled={spinner}
												type='text'
												fullWidth
												required
												label={
													<Box display='inline'>
														{t('TRADE_FROM_ASSET_AMOUNT_LABEL')} (
														{t('AVAILABLE')}
														<AmountWithCurrency
															amount={
																selectedFromAsset.assetToMainCurrenciesValues[
																	mainCurrency.id
																]
															}
															unit={mainCurrency.symbol}
															unitPlace='left'
															fontSize={14}
														/>
														)
													</Box>
												}
												name='amountToWithdraw'
												value={
													`${formAssetAmount} ${selectedFromAsset.symbol} (${mainCurrency.symbol} ${selectedFormAssetMainCurrencyValue})`

													// <Box display='inline'>
													// 	<AmountWithCurrency
													// 		amount={formAssetAmount}
													// 		unit={selectedFromAsset.symbol}
													// 		unitPlace='right'
													// 		fontSize={14}
													// 	/>
													// 	(
													// 	<AmountWithCurrency
													// 		amount={selectedFormAssetMainCurrencyValue}
													// 		unit={mainCurrency.symbol}
													// 		unitPlace='left'
													// 		fontSize={14}
													// 	/>
													// 	)
													// </Box>
												}
												onChange={ev =>
													execute(
														updateNewTransaction({
															tx: stepsId,
															key: 'formAssetAmount',
															value: ev.target.value,
														})
													)
												}
												error={errFormAssetAmount && !!errFormAssetAmount.dirty}
												helperText={
													errFormAssetAmount && !!errFormAssetAmount.dirty
														? errFormAssetAmount.errMsg
														: ''
												}
											/>
											<Box>
												<Button
													disabled={!selectedFromAsset}
													onClick={() => setTradePercent(25)}
												>
													25%
												</Button>
												<Button
													disabled={!selectedFromAsset}
													onClick={() => setTradePercent(50)}
												>
													50%
												</Button>
												<Button
													disabled={!selectedFromAsset}
													onClick={() => setTradePercent(75)}
												>
													75%
												</Button>
												<Button
													disabled={!selectedFromAsset}
													onClick={() => setTradePercent(100)}
												>
													100%
												</Button>
											</Box>
										</Box>
									</Box>
								</Grid>
							</Grid>
						</Box>
					</Paper>
					<Box my={2}></Box>
					<Paper>
						<Box p={1}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									To
								</Grid>
								<Grid item xs={12} md={6}>
									<Dropdown
										fullWidth
										variant='standard'
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
										label={t('PROP_TOASSET')}
										htmlId='wallet-asset-to-dd'
										name='formAsset'
										error={errToAsset && !!errToAsset.dirty}
										helperText={
											errToAsset && !!errToAsset.dirty
												? errToAsset.errMsg
												: t('WALLET_TRADE_FROM_ASSET')
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
