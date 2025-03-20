import {
    GET_DOCUMENTS,
    GET_DOCUMENT,
    ADD_DOCUMENT,
    UPDATE_DOCUMENT,
    DELETE_DOCUMENT,
    DOCUMENT_ERROR,
    DOWNLOAD_DOCUMENT
} from '../types';

const initialState = {
    documents: [],
    currentDocument: null,
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
        case GET_DOCUMENTS:
            return {
                ...state,
                documents: payload.data,
                pagination: {
                    count: payload.count,
                    totalPages: payload.totalPages,
                    currentPage: payload.currentPage
                },
                loading: false
            };
        case GET_DOCUMENT:
            return {
                ...state,
                currentDocument: payload,
                loading: false
            };
        case ADD_DOCUMENT:
            return {
                ...state,
                documents: [payload, ...state.documents],
                loading: false
            };
        case UPDATE_DOCUMENT:
            return {
                ...state,
                documents: state.documents.map(doc =>
                    doc.id === payload.id ? payload : doc
                ),
                currentDocument: payload,
                loading: false
            };
        case DELETE_DOCUMENT:
            return {
                ...state,
                documents: state.documents.filter(doc => doc.id !== payload),
                loading: false
            };
        case DOWNLOAD_DOCUMENT:
            return {
                ...state,
                documents: state.documents.map(doc =>
                    doc.id === payload.id ? { ...doc, downloadCount: doc.downloadCount + 1 } : doc
                ),
                loading: false
            };
        case DOCUMENT_ERROR:
            return {
                ...state,
                error: payload,
                loading: false
            };
        default:
            return state;
    }
}
