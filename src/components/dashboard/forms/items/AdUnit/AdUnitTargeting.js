import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdUnitHoc from './NewAdUnitHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import IconButton from '@material-ui/core/IconButton'
import CancelIcon from '@material-ui/icons/Cancel'
import Autocomplete from 'components/common/autocomplete'
import Typography from '@material-ui/core/Typography'
import Dropdown from 'components/common/dropdown'
import { translate } from 'services/translations/translations'
import { withStyles } from '@material-ui/core/styles'
import { SOURCES } from 'constants/targeting'

const styles = {
	slider: {
		padding: '22px 0px',
	},
	markLabel: {
		top: '30px',
	},
}
const marks = [
	{
		value: 5,
		label: 'Low',
	},
	{
		value: 50,
		label: 'Medium',
	},
	{
		value: 95,
		label: 'High',
	},
]

const SourcesSelect = Object.keys(SOURCES).map(key => {
	return {
		value: {
			key: key, // FOR DROPDOWN
			source: key,
			collection: SOURCES[key].collection,
			target: { tag: '', score: 1 },
			label: translate(`TARGET_LABEL_${key.toUpperCase()}`),
			placeholder: translate(`TARGET_LABEL_${key.toUpperCase()}`),
		},
		label: translate(`ADD_NEW_${key.toUpperCase()}_TARGET`),
	}
})

class AdUnitTargeting extends Component {
	constructor(props) {
		super(props)

		const { targets } = props.newItem.temp || {}
		this.state = {
			targets: [...(targets || [])],
		}
	}

	updateNewItemCollections(targets) {
		const { newItem, handleChange } = this.props
		const collections = [...targets].reduce(
			(all, tg) => {
				const newCollection = all[tg.collection] || []

				// NOTE: just skip empty tags
				if (!!tg.target.tag) {
					newCollection.push(tg.target)
				}
				all[tg.collection] = newCollection
				return all
			},
			{ targeting: [], tags: [] }
		)

		const { temp } = newItem
		const newTemp = { ...temp }

		// Need this to keep the state if user get back
		newTemp.targets = [...targets]
		collections.temp = newTemp

		handleChange(null, null, collections)
	}

	handleTargetChange = (index, prop, newValue) => {
		const newTargets = [...this.state.targets]
		const newTarget = { ...newTargets[index].target }
		newTarget[prop] = newValue
		newTargets[index] = { ...newTargets[index], target: newTarget }
		this.updateNewItemCollections(newTargets)
		this.setState({ targets: newTargets })
	}

	newTarget = target => {
		const newTargets = [...this.state.targets]
		const newTarget = { ...target }
		newTarget.key = newTargets.length
		newTarget.target = { ...target.target }
		newTargets.push(newTarget)
		this.setState({ targets: newTargets })
	}

	removeTarget = index => {
		const newTargets = [...this.state.targets]
		newTargets.splice(index, 1)
		this.updateNewItemCollections(newTargets)
		this.setState({ targets: newTargets })
		this.validateAutocomplete({
			id: `target-${index}`,
			isValid: true,
			dirty: false,
		})
	}

	validateAutocomplete = ({ id, isValid, dirty }) => {
		this.props.validate(id, {
			isValid,
			err: { msg: 'TARGETING_REQUIRED' },
			dirty,
		})
	}

	targetTag = ({
		source,
		collection,
		placeholder,
		label,
		index,
		target,
		t,
		classes,
		invalidFields,
	}) => {
		const id = `target-${index}`
		return (
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Autocomplete
						id={id}
						direction='auto'
						openOnClick
						required={true}
						error={invalidFields[id] && invalidFields[id].dirty}
						errorText={
							invalidFields[id] && !!invalidFields[id].dirty
								? invalidFields[id].errMsg
								: null
						}
						onChange={newValue => {
							this.handleTargetChange(index, 'tag', newValue, collection)
							this.validateAutocomplete({
								id,
								isValid: newValue,
								dirty: true,
							})
						}}
						onInit={() =>
							this.validateAutocomplete({
								id,
								isValid: target.tag,
								dirty: false,
							})
						}
						// validate={validate}
						label={label}
						placeholder={placeholder}
						source={source}
						value={target.tag}
						suggestionMatch='anywhere'
						showSuggestionsWhenValueIsSet={true}
						allowCreate={!source.length}
					/>
				</Grid>
				<Grid item xs={11} md={5}>
					<div>
						<Typography id={`tbaget-score-${index}`}>
							{/*TODO: Translate target name*/}
							{t('TARGET_SCORE_LABEL', {
								args: [target.score],
							})}
						</Typography>
						<Slider
							classes={{ root: classes.slider, markLabel: classes.markLabel }}
							aria-labelledby={`target-score-${index}`}
							min={1}
							max={100}
							step={1}
							valueLabelDisplay='auto'
							disabled={!target.tag}
							value={target.score}
							marks={marks}
							onChange={(ev, newValue) =>
								this.handleTargetChange(index, 'score', newValue, collection)
							}
						/>
					</div>
				</Grid>
				<Grid item container xs={1} md={1} alignItems='center'>
					<IconButton onClick={() => this.removeTarget(index)}>
						<CancelIcon />
					</IconButton>
				</Grid>
			</Grid>
		)
	}

	render() {
		const {
			t,
			// newItem,
			classes,
			...rest
		} = this.props
		// const { targeting, tags } = newItem

		const { targets } = this.state
		return (
			<div>
				<Grid container spacing={1}>
					<Grid item sm={12}>
						{[...targets].map(
							(
								{ source, collection, label, placeholder, target = {} } = {},
								index
							) => (
								<this.targetTag
									key={index}
									label={t(label)}
									placeholder={t(placeholder)}
									index={index}
									source={SOURCES[source].src}
									collection={collection}
									target={target}
									t={t}
									classes={classes}
									{...rest}
								/>
							)
						)}
					</Grid>
					<Grid item sm={12}>
						<Dropdown
							variant='filled'
							fullWidth
							onChange={target => {
								this.newTarget({ ...target })
							}}
							source={[...SourcesSelect]}
							value={''}
							label={t('NEW_TARGET')}
							htmlId='ad-type-dd'
							name='adType'
						/>
					</Grid>
				</Grid>
			</div>
		)
	}
}

AdUnitTargeting.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
}

const NewAdUnitTargeting = NewAdUnitHoc(withStyles(styles)(AdUnitTargeting))

export default Translate(NewAdUnitTargeting)