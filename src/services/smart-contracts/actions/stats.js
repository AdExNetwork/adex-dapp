import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { getValidatorAuthToken } from 'services/adex-validator/actions'
import { BigNumber, utils } from 'ethers'
import { formatTokenAmount } from 'helpers/formatters'
import {
	selectRelayerConfig,
	selectMainToken,
	selectRoutineWithdrawTokens,
	selectFeeTokenWhitelist,
} from 'selectors'
import { AUTH_TYPES } from 'constants/misc'

const privilegesNames = constants.valueToKey(constants.IdentityPrivilegeLevel)

const tokenAvailableBalance = ({ token, balance, mainToken }) => {
	if (token.address === mainToken.address) {
		return balance
	}

	const feeToken = selectFeeTokenWhitelist()[token.address]

	// approve + swap txns
	const swapFees = BigNumber.from(feeToken.min).mul(BigNumber.from(2))

	const isAvailable = swapFees.mul(BigNumber.from(2)).lte(balance)
	return isAvailable ? balance : BigNumber.from(0)
}

export const getTotalAccountRevenue = async ({ all }) => {
	const withdrawTokens = selectRoutineWithdrawTokens()
	const totalRevenue = await Object.values(all).reduce(
		async (revenuePr, { balance, depositAsset } = {}) => {
			const revenue = await revenuePr

			const token = withdrawTokens[depositAsset]

			// const hasMinBalance = BigNumber.from(balance).gt(
			// 	BigNumber.from(token.minFinal)
			// )

			// NOTE: Show everything
			const hasMinBalance = BigNumber.from(balance).gt(BigNumber.from(0))

			const balanceMainToken = hasMinBalance
				? await tokenInMainTokenValue({
						token,
						balance,
				  })
				: BigNumber.from(0)

			return revenue.add(balanceMainToken)
		},
		Promise.resolve(BigNumber.from(0))
	)

	return totalRevenue
}

export const getWithdrawTokensBalances = async ({
	address,
	getFullBalances,
}) => {
	const { getToken } = await getEthers(AUTH_TYPES.READONLY)
	const { routineWithdrawTokens, mainToken } = selectRelayerConfig()
	const balancesCalls = routineWithdrawTokens.map(async token => {
		const tokenContract = getToken(token)

		const balance = await tokenContract.balanceOf(address)

		const available = getFullBalances
			? balance
			: tokenAvailableBalance({
					token,
					mainToken,
					balance,
			  })

		const balanceMainToken = await tokenInMainTokenValue({
			token,
			balance: available,
		})

		return { token, balance: available, balanceMainToken }
	})

	const balances = await Promise.all(balancesCalls)
	const { totalBalanceInMainToken, mainTokenBalance } = balances.reduce(
		(data, balanceData) => {
			data.totalBalanceInMainToken = data.totalBalanceInMainToken.add(
				balanceData.balanceMainToken
			)

			if (balanceData.token.address === mainToken.address) {
				data.mainTokenBalance = balanceData.balance
			}

			return data
		},
		{
			totalBalanceInMainToken: BigNumber.from(0),
			mainTokenBalance: BigNumber.from(0),
		}
	)

	return {
		balances,
		mainTokenBalance,
		totalBalanceInMainToken,
	}
}

export async function getAddressBalances({ address, getFullBalances }) {
	const { provider } = await getEthers(AUTH_TYPES.READONLY)

	const calls = [
		provider.getBalance(address.address),
		getWithdrawTokensBalances({
			address: address.address,
			getFullBalances,
		}),
	]

	const balances = await Promise.all(calls)

	const formatted = {
		address: address.address,
		path: address.serializedPath || address.path, // we are going to keep the entire path
		balanceEth: utils.formatEther(balances[0].toString()),
		tokensBalances: balances[1].balances.map(({ token, balance }) => {
			return {
				balance: formatTokenAmount(balance, token.decimals, false, 2),
				symbol: token.symbol,
			}
		}),
	}

	return formatted
}

export async function getAccountStats({
	account,
	outstandingBalanceMainToken = {
		total: BigNumber.from('0'),
		available: BigNumber.from('0'),
	},
	outstandingBalanceAllMainToken = {
		total: BigNumber.from('0'),
		available: BigNumber.from('0'),
	},
	all,
}) {
	const { wallet, identity } = account
	const { address } = identity
	const { getIdentity } = await getEthers(AUTH_TYPES.READONLY)
	const { decimals } = selectMainToken()

	const { status = {} } = identity
	const identityContract = getIdentity({ address })
	let privilegesAction
	try {
		await identityContract.deployed()
		privilegesAction = identityContract.privileges(wallet.address)
	} catch {
		privilegesAction = Promise.resolve(status.type || 'Not Deployed')
	}

	const calls = [
		getWithdrawTokensBalances({ address }),
		privilegesAction,
		getTotalAccountRevenue({ all }),
	]

	const [
		identityWithdrawTokensBalancesBalances = {},
		walletPrivileges,
		totalRevenue,
	] = await Promise.all(
		calls.map(c =>
			c
				.then(res => res)
				.catch(e => {
					return undefined
				})
		)
	)

	const identityBalanceMainToken =
		identityWithdrawTokensBalancesBalances.totalBalanceInMainToken ||
		BigNumber.from(0)

	// BigNumber values for balances
	const raw = {
		identityWithdrawTokensBalancesBalances,
		walletPrivileges,
		identityBalanceMainToken,
		outstandingBalanceMainToken: outstandingBalanceMainToken.available,
		totalOutstandingBalanceMainToken: outstandingBalanceMainToken.total,
		availableIdentityBalanceMainToken: identityBalanceMainToken.add(
			outstandingBalanceMainToken.available
		),
		totalIdentityBalanceMainToken: identityBalanceMainToken.add(
			outstandingBalanceMainToken.total
		),
		outstandingBalanceAllMainToken: outstandingBalanceAllMainToken.available,
		totalOutstandingBalanceAllMainToken: outstandingBalanceAllMainToken.total,
		availableIdentityBalanceAllMainToken: identityBalanceMainToken.add(
			outstandingBalanceAllMainToken.available
		),
		totalIdentityBalanceAllMainToken: identityBalanceMainToken.add(
			outstandingBalanceAllMainToken.total
		),
		totalRevenue,
	}

	const formatted = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		identityAddress: identity.address,
		identityBalanceMainToken: formatTokenAmount(
			identityBalanceMainToken,
			decimals,
			false,
			2
		),
		outstandingBalanceMainToken: formatTokenAmount(
			raw.outstandingBalanceMainToken,
			decimals,
			false,
			2
		),
		totalOutstandingBalanceMainToken: formatTokenAmount(
			raw.totalOutstandingBalanceMainToken,
			decimals,
			false,
			2
		),
		availableIdentityBalanceMainToken: formatTokenAmount(
			raw.availableIdentityBalanceMainToken,
			decimals,
			false,
			2
		),
		totalIdentityBalanceMainToken: formatTokenAmount(
			raw.totalIdentityBalanceMainToken,
			decimals,
			false,
			2
		),
		outstandingBalanceAllMainToken: formatTokenAmount(
			raw.outstandingBalanceAllMainToken,
			decimals,
			false,
			2
		),
		totalOutstandingBalanceAllMainToken: formatTokenAmount(
			raw.totalOutstandingBalanceAllMainToken,
			decimals,
			false,
			2
		),
		availableIdentityBalanceAllMainToken: formatTokenAmount(
			raw.availableIdentityBalanceAllMainToken,
			decimals,
			false,
			2
		),
		totalIdentityBalanceAllMainToken: formatTokenAmount(
			raw.totalIdentityBalanceAllMainToken,
			decimals,
			false,
			2
		),
		totalRevenue: formatTokenAmount(
			raw.totalRevenue || '0',
			decimals,
			false,
			2
		),
	}

	return {
		raw,
		formatted,
	}
}

// NOTE: currently working because DAI and SAI has the same price and decimals
// We should use getOutstandingBalanceMainToken if changed
export async function getOutstandingBalance({ withBalance }) {
	const bigZero = BigNumber.from(0)

	const initial = { total: bigZero, available: bigZero }

	const allOutstanding = withBalance.reduce((amounts, ch) => {
		const { outstanding, outstandingAvailable } = ch
		const current = { ...amounts }
		current.total = current.total.add(outstanding)
		current.available = current.available.add(
			BigNumber.from(outstandingAvailable)
		)

		return current
	}, initial)

	return allOutstanding
}

export async function getOutstandingBalanceMainToken({ withBalance }) {
	const tokens = selectRoutineWithdrawTokens()
	const bigZero = BigNumber.from(0)

	const initial = { total: bigZero, available: bigZero }

	const allOutstanding = withBalance.reduce((amounts, ch) => {
		const { outstanding, outstandingAvailable, channel } = ch
		const { depositAsset } = channel
		const token = tokens[depositAsset]

		const outstandingMT = tokenInMainTokenValue({ token, balance: outstanding })
		const outstandingAvailableMT = tokenInMainTokenValue({
			token,
			balance: outstandingAvailable,
		})

		const current = { ...amounts }
		current.total = current.total.add(outstandingMT)
		current.available = current.available.add(outstandingAvailableMT)

		return current
	}, initial)

	return allOutstanding
}

export async function getAllValidatorsAuthForIdentity({
	withBalance,
	account,
}) {
	const validatorAuthTokens = account.identity.validatorAuthTokens || {}

	const allValidators = withBalance.reduce((all, { channel }) => {
		const leader = (channel.validators || channel.spec.validators)[0].id
		const follower = (channel.validators || channel.spec.validators)[1].id

		const validators = {
			...all,
			[leader]: all[leader] || validatorAuthTokens[leader] || null,
			[follower]: all[follower] || validatorAuthTokens[follower] || null,
		}

		return validators
	}, {})

	const keys = Object.keys(allValidators)

	const tokenCalls = keys.map(async key => {
		if (allValidators[key]) {
			return allValidators[key]
		} else {
			const token = await getValidatorAuthToken({
				validatorId: key,
				account,
			})

			return token
		}
	})

	const allTokens = await Promise.all(tokenCalls)

	const validatorsAuth = keys.reduce((all, key, index) => {
		const validators = {
			...all,
			[key]: allTokens[index],
		}

		return validators
	}, {})

	return validatorsAuth
}

const saiDaiConversion = async ({ token, balance }) => balance

const valueInMainTokenConversions = {
	// SAI
	'0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': {
		// DAI
		'0x6b175474e89094c44da98b954eedeac495271d0f': saiDaiConversion,
	},
	// DAI
	'0x6b175474e89094c44da98b954eedeac495271d0f': {
		// SAI
		'0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': saiDaiConversion,
	},
}

export async function tokenInMainTokenValue({ token, balance }) {
	const { address } = selectMainToken()

	if (address === token.address) {
		return balance
	}

	const valueInMainToken = await valueInMainTokenConversions[
		address.toLowerCase()
	][token.address.toLowerCase()]({
		token,
		balance,
	})

	return valueInMainToken
}
