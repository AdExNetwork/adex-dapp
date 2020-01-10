import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ListWithControls from 'components/dashboard/containers/Lists/ListWithControls'
import classnames from 'classnames'
import TableCellMui from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
// import IconButton from '@material-ui/core/IconButton'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Img from 'components/common/img/Img'
import Rows from 'components/dashboard/collection/Rows'
import Translate from 'components/translate/Translate'
// import DeleteIcon from '@material-ui/icons/Delete'
// import { FileCopy } from '@material-ui/icons'
// import ArchiveIcon from '@material-ui/icons/Archive'
// import UnarchiveIcon from '@material-ui/icons/Unarchive'
// import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline'
// import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
// import { NewUnitDialog } from 'components/dashboard/forms/items/NewItems'
import { NewCloneUnitDialog } from '../../forms/items/NewItems'
import { AdUnit } from 'adex-models'

const TableCell = ({ children, ...rest }) => (
	<TableCellMui {...rest}>{!!children && children}</TableCellMui>
)

const RRTableCell = withReactRouterLink(TableCell)
const RRButton = withReactRouterLink(Button)

class ItemsList extends Component {
	renderTableHead = ({ selected }) => {
		const {
			t,
			selectedItems,
			selectMode,
			noActions,
			// itemType
		} = this.props
		return (
			<TableHead>
				<TableRow>
					{selectMode && (
						<TableCell>{Object.keys(selectedItems).length || ''}</TableCell>
					)}
					<TableCell> {t('PROP_MEDIA')}</TableCell>
					<TableCell> {t('PROP_TITLE')} </TableCell>
					<TableCell> {t('PROP_TYPE')} </TableCell>
					<TableCell> {t('PROP_CREATED')} </TableCell>

					{!noActions && <TableCell> {t('ACTIONS')} </TableCell>}
				</TableRow>
			</TableHead>
		)
	}

	renderCampaignTableHead = ({ selected }) => {
		const { t, selectedItems, selectMode, noActions } = this.props
		return (
			<TableHead>
				<TableRow>
					{selectMode && (
						<TableCell>{Object.keys(selectedItems).length || ''}</TableCell>
					)}
					<TableCell> {t('PROP_MEDIA')}</TableCell>
					<TableCell> {t('PROP_STATUS')} </TableCell>
					<TableCell> {t('PROP_DEPOSIT')} </TableCell>
					<TableCell> {t('PROP_DISTRIBUTED', { args: ['%'] })} </TableCell>
					<TableCell> {t('PROP_CPM')} </TableCell>
					<TableCell>
						{/* {t('PROP_CREATED')}/ <br /> */}
						{t('PROP_STARTS')}/ <br />
						{t('PROP_ENDS')}
					</TableCell>
					{!noActions && <TableCell> {t('ACTIONS')} </TableCell>}
				</TableRow>
			</TableHead>
		)
	}

	renderTableRow = (item, index, { to, selected }) => {
		const {
			// t,
			classes,
			selectMode,
			selectedItems,
			onSelect,
			noActions,
		} = this.props
		// const ImagCell = noActions ? TableCell : RRTableCell

		return (
			<TableRow key={item.ipfs || index} selected={selectedItems[item.ipfs]}>
				{selectMode && (
					<TableCell padding='checkbox'>
						<Checkbox
							// indeterminate={numSelected > 0 && numSelected < rowCount}
							checked={!!selectedItems[item.ipfs]}
							onChange={event => {
								onSelect(item.ipfs, event.target.checked)
							}}
						/>
					</TableCell>
				)}
				<TableCell>
					<Img
						fullScreenOnClick={true}
						className={classnames(classes.cellImg)}
						src={item.mediaUrl || item.fallbackMediaiUrl || ''}
						alt={item.title}
						mediaMime={item.mediaMime}
						allowVideo
					/>
				</TableCell>
				<RRTableCell
					// className={tableTheme.link}
					to={to}
				>
					{item.title}
				</RRTableCell>
				<TableCell> {item.type} </TableCell>
				<TableCell> {formatDateTime(item.created)} </TableCell>
				{!noActions && this.renderActions({ item, to })}
			</TableRow>
		)
	}

	renderCampaignTableRow = (item, index, { to, selected }) => {
		const {
			selectMode,
			selectedItems,
			onSelect,
			noActions,
			classes,
		} = this.props

		const status = item.status || {}
		const firstUnit = item.adUnits[0] || {}
		const mediaUrl = firstUnit.mediaUrl || ''
		const mediaMime = firstUnit.mediaMime || ''

		return (
			<TableRow key={item.ipfs || index} selected={selectedItems[item.ipfs]}>
				{selectMode && (
					<TableCell padding='checkbox'>
						<Checkbox
							// indeterminate={numSelected > 0 && numSelected < rowCount}
							checked={!!selectedItems[item.ipfs]}
							onChange={event => {
								onSelect(item.ipfs, event.target.checked)
							}}
						/>
					</TableCell>
				)}
				<TableCell>
					<Img
						fullScreenOnClick={true}
						className={classnames(classes.cellImg)}
						src={mediaUrl}
						alt={item.title}
						mediaMime={mediaMime}
						allowVideo
					/>
				</TableCell>
				<TableCell> {status.name} </TableCell>
				<TableCell>
					{' '}
					{formatTokenAmount(item.depositAmount, 18, true)} DAI{' '}
				</TableCell>
				<TableCell>
					{' '}
					{((status.fundsDistributedRatio || 0) / 10).toFixed(2)}
				</TableCell>
				<TableCell>
					{formatTokenAmount(
						bigNumberify(item.minPerImpression).mul(1000),
						18,
						true
					)}{' '}
					DAI
				</TableCell>
				<TableCell>
					{/* {formatDateTime(item.created)} <br /> */}
					{formatDateTime(item.activeFrom)} <br />
					{formatDateTime(item.withdrawPeriodStart)}
				</TableCell>
				{!noActions && this.renderActions({ item, to })}
			</TableRow>
		)
	}

	renderActions = ({ item, to }) => {
		const { t, actions, itemType } = this.props
		// const itemName = item.title
		// const itemTypeName = t(itemType, { isProp: true })

		return (
			<TableCell>
				<Tooltip
					title={t('LABEL_VIEW')}
					// placement='top'
					enterDelay={1000}
				>
					<RRButton to={to} variant='contained' color='primary'>
						{t('LABEL_VIEW')}
					</RRButton>
				</Tooltip>
				{itemType === 'AdUnit' ? (
					<Tooltip
						title={t('TOOLTIP_CLONE')}
						// placement='top'
						enterDelay={1000}
					>
						<span>
							<NewCloneUnitDialog
								onBeforeOpen={() =>
									actions.cloneItem({ item, itemType, objModel: AdUnit })
								}
								iconButton
							/>
						</span>
					</Tooltip>
				) : null}
				{/* {!item.archived &&
					<Tooltip
						title={t('TOOLTIP_ARCHIVE')}
						// placement='top'
						enterDelay={1000}
					>
						<IconButton
							disabled={isDemo}
							// label={t('ARCHIVE')}
							// className={RTButtonTheme.danger}
							onClick={actions.confirmAction.bind(this,
								actions.archiveItem.bind(this, { item: item, authSig: account.wallet.authSig }),
								null,
								{
									confirmLabel: t('CONFIRM_YES'),
									cancelLabel: t('CONFIRM_NO'),
									text: t('ARCHIVE_ITEM', { args: [itemTypeName, itemName] }),
									title: t('CONFIRM_SURE')
								})}
						>
							<ArchiveIcon />
						</IconButton>
					</Tooltip>
				}
				{item.archived &&
					<Tooltip
						title={t('TOOLTIP_UNARCHIVE')}
						enterDelay={1000}
					// placement='top'
					>
						<IconButton
							disabled={isDemo}
							// label={t('UNARCHIVE')}
							color='secondary'
							onClick={actions.confirmAction.bind(this,
								actions.unarchiveItem.bind(this, { item: item, authSig: account.wallet.authSig }),
								null,
								{
									confirmLabel: t('CONFIRM_YES'),
									cancelLabel: t('CONFIRM_NO'),
									text: t('UNARCHIVE_ITEM', { args: [itemType, itemName] }),
									title: t('CONFIRM_SURE')
								})}
						>
							<UnarchiveIcon />
						</IconButton>
					</Tooltip>
				} */}
			</TableCell>
		)
	}

	renderRows = items => {
		const { itemType, side, padding } = this.props
		return (
			<Rows
				padding={padding}
				side={side}
				rows={items}
				itemType={itemType}
				rowRenderer={
					itemType === 'Campaign'
						? this.renderCampaignTableRow
						: this.renderTableRow
				}
				tableHeadRenderer={
					itemType === 'Campaign'
						? this.renderCampaignTableHead
						: this.renderTableHead
				}
			/>
		)
	}

	render() {
		const { items, viewModeId, side, noControls, classes, ...rest } = this.props

		if (noControls) {
			return this.renderRows(items)
		}
		return (
			<ListWithControls
				{...rest}
				items={items}
				viewModeId={viewModeId}
				archive
				renderRows={this.renderRows}
			/>
		)
	}
}

ItemsList.propTypes = {
	actions: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	viewModeId: PropTypes.string.isRequired,
	header: PropTypes.string,
	objModel: PropTypes.func.isRequired,
	itemType: PropTypes.string.isRequired,
	sortProperties: PropTypes.array.isRequired,
	selectedItems: PropTypes.object,
	selectMode: PropTypes.bool,
	onSelect: PropTypes.func,
	noControls: PropTypes.bool,
	noActions: PropTypes.bool,
}

function mapStateToProps(state, props) {
	const memory = state.memory
	return {
		side: memory.nav.side,
		selectedItems: props.selectedItems || {},
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(ItemsList)))