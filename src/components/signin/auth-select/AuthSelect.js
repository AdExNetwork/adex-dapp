import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

const RRButton = withReactRouterLink(Button)

class AuthSelect extends Component {
	componentDidMount() {
		// NOTE: reset identity if someone press backspace 
		// to go to this page
		this.props.actions.resetIdentity()
	}

	render() {
		let { t, classes } = this.props
		return (
			<div>
				<List
					container
					// spacing={16}
					alignItems='center'
				>
					<ListItem item xs={12}>
						<RRButton
							variant='contained'
							to='/identity/grant'
							size='large'
							color='primary'
						>
							{t('CREATE_GRANT_ACCOUNT')}
						</RRButton>
					</ListItem>
					<ListItem item xs={12}>
						<RRButton
							variant='contained'
							to='/login/grant'
							size='large'
							color='primary'
						>
							{t('LOGIN_GRANT_ACCOUNT')}
						</RRButton>
					</ListItem>
					<ListItem item xs={12}>
						<RRButton
							variant='contained'
							to='/identity/full'
							size='large'
							color='primary'
						>
							{t('CREATE_FULL_ACCOUNT')}
						</RRButton>
					</ListItem>
					<ListItem item xs={12}>
						<RRButton
							variant='contained'
							to='/login/full'
							size='large'
							color='primary'
						>
							{t('LOGIN_FULL_ACCOUNT')}
						</RRButton>
					</ListItem>

				</List>
			</div>
		)
	}
}

export default Translate(withStyles(styles)(AuthSelect))
