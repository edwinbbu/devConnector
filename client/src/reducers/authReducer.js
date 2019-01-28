import { SET_CURRENT_USER } from "../actions/types";

const initialState = {
    isAuthenticated: false,
    user: {}
};
function check(payload) {
    if (payload) return true;
    else return false;
}
export default function(state = initialState, action) {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                isAuthenticated: check(action.payload),
                user: action.payload
            };
        default:
            return state;
    }
}
