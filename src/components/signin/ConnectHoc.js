import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Logo from 'components/common/icons/AdexIconTxt'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import classnames from 'classnames'
import packageJson from './../../../package.json'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

import AuthSelect from 'components/signin/auth-select/AuthSelect'

export default function ConnectHoc(Decorated) {
	class Connect extends Component {

		render() {
			const { classes, t, noBackground, ...rest } = this.props
			return (
				<div
					className={classes.root}
				>
					<Grid
						className={classes.container}
						container
					// spacing={16}
					>
						<Grid
							className={classes.actions}
							item
							xs={12}
							md={8}
						>
							<Decorated
								{...rest}
							/>
						</Grid>
						<Grid
							item xs={12}
							md={4}
						>
							<Grid
								container
								direction='column'
								alignItems='center'
								justify='space-between'
							>
								<div className={classes.adexLogoTop} >
									<Logo className={classes.logo} />
								</div>
								<AuthSelect  {...rest} />
								<small className={classes.adxVersion} >
									{`v.${packageJson.version}-beta`}
								</small>
							</Grid>
						</Grid>
					</Grid>
				</div>
			)
		}
	}

	Connect.propTypes = {
		actions: PropTypes.object.isRequired,
	}

	function mapStateToProps(state) {
		// const persist = state.persist
		// const memory = state.memory
		return {
			// account: persist.account
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch)
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(Translate(withStyles(styles)(Connect)))
}