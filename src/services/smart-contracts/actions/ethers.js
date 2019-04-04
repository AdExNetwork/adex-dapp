import { getEthers } from 'services/smart-contracts/ethers'
import { ethers } from 'ethers'
import { getRsvFromSig, getTypedDataHash } from 'services/smart-contracts/utils'
import { AUTH_TYPES } from 'constants/misc'
import TrezorSigner from 'services/smart-contracts/signers/trezor'
import LedgerSigner from 'services/smart-contracts/signers/ledger'
import LocalSigner from 'services/smart-contracts/signers/local'

export const prepareTx = ({}) => {
}

export async function getSigner({ wallet, provider }) {
	const { authType, path, email, password } = wallet

	if (authType === AUTH_TYPES.METAMASK.name) {
		const signer = provider.getSigner()
		return signer
	}
	if (authType === AUTH_TYPES.LEDGER.name) {

		const signer = new LedgerSigner(provider, { path })

		return signer
	}
	if (authType === AUTH_TYPES.TREZOR.name) {
		const signer = new TrezorSigner(provider, { path })
		return signer
	}
	if (authType === AUTH_TYPES.GRANT.name) {
		const signer = new LocalSigner(provider, { email, password })

		return signer
	}
}

export async function getAuthSig({ wallet }) {
	const { provider } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })

	const authToken = 46 || (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
	const typedData = [
		{ type: 'uint', name: 'Auth token', value: authToken }
	]

	const hash = getTypedDataHash({ typedData: typedData })

	const signature = await signer.signMessage(hash, { hex: true })

	return {
		...signature,
		authToken,
		hash
	}
}