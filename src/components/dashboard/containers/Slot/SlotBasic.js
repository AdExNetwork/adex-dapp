import React, { Fragment } from 'react'
import { Paper, Grid, Box } from '@material-ui/core'
import { WebsiteIssues } from 'components/dashboard/containers/Slot/WebsiteIssues'
import OutlinedPropView from 'components/common/OutlinedPropView'
import { SlotEdits } from './SlotEdits'
import {
	ChangeControls,
	ItemTitle,
	ItemDescription,
	ItemAdType,
	ItemFallbackMediaURL,
	MediaCard,
	ItemWebsite,
	ArchiveItemBtn,
	ItemMinPerImpression,
	SlotAdultContent,
} from 'components/dashboard/containers/ItemCommon/'
import { t } from 'selectors'

export const SlotBasic = ({ item, ...hookProps }) => {
	const {
		id,
		title,
		description,
		mediaUrl,
		mediaMime,
		type,
		targetUrl,
		website,
		archived,
		rulesInput,
		minPerImpression,
	} = item
	const { title: errTitle, description: errDescription } = hookProps.validations

	return (
		<Fragment>
			<Box p={2}>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={12} md={6} lg={5}>
						<Box py={1}>
							<MediaCard
								mediaUrl={mediaUrl}
								mediaMime={mediaMime}
								label={t('SLOT_FALLBACK_MEDIA_LABEL')}
							/>
						</Box>
						<Box py={1}>
							<ItemFallbackMediaURL targetUrl={targetUrl} />
						</Box>
						<Box py={1}>
							<SlotEdits item={item} {...hookProps} />
						</Box>
						{!archived && (
							<Box py={1}>
								<ArchiveItemBtn
									fullWidth
									itemType='AdSlot'
									itemId={id}
									title={title}
									goToTableOnSuccess
								/>
							</Box>
						)}
					</Grid>
					<Grid item xs={12} sm={12} md={6} lg={7}>
						<Box py={1}>
							<ItemTitle title={title} errTitle={errTitle} {...hookProps} />
						</Box>
						<Box py={1}>
							<ItemDescription
								description={description}
								errDescription={errDescription}
								{...hookProps}
							/>
						</Box>
						<Box py={1}>
							<ItemAdType type={type} />
						</Box>

						<Box py={1}>
							<ItemWebsite item={item} {...hookProps} />
						</Box>
						<Box>
							<OutlinedPropView
								label={t('WEBSITE_VERIFICATION')}
								value={<WebsiteIssues website={website} tryAgainBtn />}
							/>
						</Box>
						<Box py={1}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<ItemMinPerImpression item={item} {...hookProps} />
								</Grid>
								<Grid item xs={12}>
									<SlotAdultContent item={item} {...hookProps} />
								</Grid>
								<Grid item xs={12}></Grid>
							</Grid>
						</Box>
					</Grid>
					<Grid item xs={12} sm={12} md={12} lg={6}></Grid>
				</Grid>
			</Box>
		</Fragment>
	)
}
