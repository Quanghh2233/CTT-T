import {
    GET_DEPARTMENTS,
    GET_DEPARTMENT,
    ADD_DEPARTMENT,
    UPDATE_DEPARTMENT,
    DELETE_DEPARTMENT,
    DEPARTMENT_ERROR
} from '../types';

const initialState = {
    departments: [],
    currentDepartment: null,
    loading: true,
    error: null
};

export default function (state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case GET_DEPARTMENTS:
            return {
                ...state,
                departments: payload.data,
                loading: false
            };
        case GET_DEPARTMENT:
            return {
                ...state,
                currentDepartment: payload,
                loading: false
            };
        case ADD_DEPARTMENT:
            return {
                ...state,
                departments: [payload, ...state.departments],
                loading: false
            };
        case UPDATE_DEPARTMENT:
            return {
                ...state,
                departments: state.departments.map(dept =>
                    dept.id === payload.id ? payload : dept
                ),
                currentDepartment: payload,
                loading: false
            };
        case DELETE_DEPARTMENT:
            return {
                ...state,
                departments: state.departments.filter(dept => dept.id !== payload),
                loading: false
            };
        case DEPARTMENT_ERROR:
            return {
                ...state,
                error: payload,
                loading: false
            };
        default:
            return state;
    }
}
