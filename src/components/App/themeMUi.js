import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import lime from '@material-ui/core/colors/lime'
import deepOrange from '@material-ui/core/colors/deepOrange'
import amber from '@material-ui/core/colors/amber'
import grey from '@material-ui/core/colors/grey'

const WHITE = '#fff'
export const PRIMARY = '#1B75BC'
export const SECONDARY = '#FFAC00'
export const ALEX_GREY = '#3f3e3e'
export const ACCENT_ONE = '#57467B'
export const ACCENT_TWO = '#7CB4B8'

const palette = {
	primary: { main: PRIMARY, contrastText: WHITE },
	secondary: { main: SECONDARY, contrastText: WHITE },
	accentOne: { main: ACCENT_ONE, contrastText: WHITE },
	accentTwo: { main: ACCENT_TWO, contrastText: WHITE },
	grey: { main: ALEX_GREY, contrastText: WHITE },
	appBar: { main: grey[200], contrastText: grey[900] },
	error: deepOrange,
	warning: amber,
	first: lime,
	contrastThreshold: 3,
	tonalOffset: 0.2,
	text: grey,
}

export const theme = createMuiTheme({
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		fontSize: 13,
	},
	palette: { ...palette },
	overrides: {
		MuiButton: {
			root: {
				borderRadius: 0,
			},
			outlined: {
				borderRadius: 0,
			},
		},
		MuiTableCell: {
			head: {
				whiteSpace: 'nowrap',
			},
			root: {
				whiteSpace: 'nowrap',
			},
		},
		MuiPaper: {
			rounded: {
				borderRadius: 0,
			},
		},
		MuiTooltip: {
			tooltip: { borderRadius: 0 },
		},
		// MuiStepIcon: {
		//     root: {
		//         color: 'yellow',
		//         '&$active': {
		//             color: 'orange'
		//         }
		//     },
		//     active: {
		//         color: 'yellow'
		//     }
		// },
		MuiTableFooter: {
			root: {
				display: 'flex',
				flex: 0,
				padding: 0,
			},
		},
		MuiAppBar: {
			colorDefault: {
				backgroundColor: palette.appBar.main,
				color: palette.appBar.contrastText,
			},
		},
		MUIDataTablePagination: {
			toolbar: {
				padding: 0,
			},
		},
		MUIDataTableFilter: {
			root: {
				maxWidth: '400px',
			},
		},
		// Think of accessing an element not a class
		MuiGridListTile: {
			root: {
				width: '100% !important',
			},
		},
		MUIDataTableBodyCell: {
			stackedCommon: {
				height: '80px !important',
			},
		},
	},
})

export const themeMUI = responsiveFontSizes(theme, {
	options: ['xs', 'sm', 'md', 'lg', 'xl'],
	factor: 3,
})
