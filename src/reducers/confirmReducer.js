import { CONFIRM_ACTION } from '../constants/actionTypes'
import initialState from './../store/initialState'
// import Helper from './../helpers/miscHelpers'
// import { ItemTypesNames } from './../constants/itemsTypes'

export default function confirmReducer(state = initialState.confirm, action) {
    let newState

    switch (action.type) {
        case CONFIRM_ACTION:
            newState = { ...state }
            newState.data = { ...action.confirm.data }
            newState.onConfirm = action.confirm.onConfirm
            newState.onCancel = action.confirm.onCancel
            newState.active = true
            return newState

        default:
            return state

    }
}
