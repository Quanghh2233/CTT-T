import {
    GET_NEWS,
    GET_NEWS_DETAIL,
    ADD_NEWS,
    UPDATE_NEWS,
    DELETE_NEWS,
    NEWS_ERROR,
    CLEAR_NEWS
} from '../types';

const initialState = {
    news: [],
    currentNews: null,
    loading: true,
    error: null,
    pagination: {
        count: 0,
        totalPages: 0,
        currentPage: 1
    }
};

export default function (state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case GET_NEWS:
            return {
                ...state,
                news: payload.data,
                pagination: {
                    count: payload.count,
                    totalPages: payload.totalPages,
                    currentPage: payload.currentPage
                },
                loading: false
            };
        case GET_NEWS_DETAIL:
            return {
                ...state,
                currentNews: payload,
                loading: false
            };
        case ADD_NEWS:
            return {
                ...state,
                news: [payload, ...state.news],
                loading: false
            };
        case UPDATE_NEWS:
            return {
                ...state,
                news: state.news.map(item =>
                    item.id === payload.id ? payload : item
                ),
                currentNews: payload,
                loading: false
            };
        case DELETE_NEWS:
            return {
                ...state,
                news: state.news.filter(item => item.id !== payload),
                loading: false
            };
        case NEWS_ERROR:
            return {
                ...state,
                error: payload,
                loading: false
            };
        case CLEAR_NEWS:
            return {
                ...state,
                currentNews: null
            };
        default:
            return state;
    }
}
