const fs = require('fs')
const path = require('path')
const paths = require('./paths')

// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')]

const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
	throw new Error(
		'The NODE_ENV environment variable is required but was not specified.'
	)
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
var dotenvFiles = [
	`${paths.dotenv}.${NODE_ENV}.local`,
	`${paths.dotenv}.${NODE_ENV}`,
	// Don't include `.env.local` for `test` environment
	// since normally you expect tests to produce the same
	// results for everyone
	NODE_ENV !== 'test' && `${paths.dotenv}.local`,
	paths.dotenv,
].filter(Boolean)

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(dotenvFile => {
	if (fs.existsSync(dotenvFile)) {
		require('dotenv-expand')(
			require('dotenv').config({
				path: dotenvFile,
			})
		)
	}
})

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebookincubator/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.
// https://github.com/facebookincubator/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd())
process.env.NODE_PATH = (process.env.NODE_PATH || '')
	.split(path.delimiter)
	.filter(folder => folder && !path.isAbsolute(folder))
	.map(folder => path.resolve(appDirectory, folder))
	.join(path.delimiter)

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
const REACT_APP = /^REACT_APP_/i

function getClientEnvironment(publicUrl) {
	const raw = Object.keys(process.env)
		.filter(key => REACT_APP.test(key))
		.reduce(
			(env, key) => {
				env[key] = process.env[key]
				return env
			},
			{
				// Useful for determining whether we’re running in production mode.
				// Most importantly, it switches React into the correct mode.
				NODE_ENV: process.env.NODE_ENV || 'development',
				// Useful for resolving the correct path to static assets in `public`.
				// For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
				// This should only be used as an escape hatch. Normally you would put
				// images into the `src` and `import` them in code to get their paths.
				PUBLIC_URL: publicUrl,
				IPFS_GATEWAY: process.env.IPFS_GATEWAY,
				WEB3_NODE_ADDR: process.env.WEB3_NODE_ADDR, // set in .env.(production/development).local
				ADEX_CORE_ADDR: process.env.ADEX_CORE_ADDR,
				ADEX_ENS_ADDR: process.env.ADEX_ENS_ADDR,
				ADX_TOKEN_ADDR: process.env.ADX_TOKEN_ADDR,
				ETH_SCAN_ADDR_HOST: process.env.ETH_SCAN_ADDR_HOST,
				ETH_SCAN_TX_HOST: process.env.ETH_SCAN_ADDR_HOST,
				ADEX_SITE_HOST: process.env.ADEX_SITE_HOST,
				ADEX_RELAYER_HOST: process.env.ADEX_RELAYER_HOST,
				ADEX_RELAYER_ADDR: process.env.ADEX_RELAYER_ADDR,
				ADEX_MARKET_HOST: process.env.ADEX_MARKET_HOST,
				IDENTITY_BASE_ADDR: process.env.IDENTITY_BASE_ADDR,
				IDENTITY_FACTORY_ADDR: process.env.IDENTITY_FACTORY_ADDR,
				VALIDATOR_REGISTRY: process.env.VALIDATOR_REGISTRY,
				VALIDATOR_LEADER_URL: process.env.VALIDATOR_LEADER_URL,
				VALIDATOR_LEADER_ID: process.env.VALIDATOR_LEADER_ID,
				VALIDATOR_FOLLOWER_URL: process.env.VALIDATOR_FOLLOWER_URL,
				VALIDATOR_FOLLOWER_ID: process.env.VALIDATOR_FOLLOWER_ID,
				DAI_TOKEN_ADDR: process.env.DAI_TOKEN_ADDR,
				ACCESS_CODE_CHECK: process.env.ACCESS_CODE_CHECK,
				ADVIEW_URL: process.env.ADVIEW_URL,
			}
		)

	const notSetEnvVars = Object.keys(raw).filter(key => {
		const value = raw[key]
		return value === undefined
	})

	if (notSetEnvVars.length > 0) {
		throw new Error(`process.env missing values: ${notSetEnvVars.join(', ')} `)
	}

	// Stringify all values so we can feed into Webpack DefinePlugin
	const stringified = {
		'process.env': Object.keys(raw).reduce((env, key) => {
			env[key] = JSON.stringify(raw[key])
			return env
		}, {}),
	}

	return { raw, stringified }
}

module.exports = getClientEnvironment
