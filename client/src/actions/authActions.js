import axios from "axios";
import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

//Register user
export const registerUser = (userData, history) => dispatch => {
    axios
        .post("/api/users/register", userData)
        .then(result => {
            console.log("result from server:", result.data);
            history.push("/login");
        })
        .catch(err =>
            dispatch({
                type: GET_ERRORS,
                payload: err.response.data
            })
        );
};

//Login - Get User Token

export const loginUser = userData => dispatch => {
    axios
        .post("/api/users/login", userData)
        .then(res => {
            const token = res.data.token;
            console.log("response:", token);
            //set token to localStorage
            localStorage.setItem("jwtToken", token);
            //set token to Auth header
            setAuthToken(token);
            //decode token to get user data
            const decoded = jwt_decode(token);
            console.log("d:", decoded);
            dispatch(setCurrentUser(decoded));
        })
        .catch(err => {
            dispatch({
                type: GET_ERRORS,
                payload: err.response
            });
        });
};

// set logged in user

export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    };
};

export const logoutUser = () => dispatch => {
    localStorage.removeItem("jwtToken");
    setAuthToken(false);
    dispatch(setCurrentUser(null));
};
