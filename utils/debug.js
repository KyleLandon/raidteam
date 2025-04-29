const DEBUG = process.env.NODE_ENV !== 'production';

export function logApiCall(method, url, data = null) {
    if (DEBUG) {
        console.log(`[API] ${method} ${url}`, data ? { data } : '');
    }
}

export function logApiResponse(method, url, response) {
    if (DEBUG) {
        console.log(`[API Response] ${method} ${url}`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
        });
    }
}

export function logApiError(method, url, error) {
    console.error(`[API Error] ${method} ${url}`, error);
}

export function logComponentRender(componentName, props = {}) {
    if (DEBUG) {
        console.log(`[Render] ${componentName}`, props);
    }
}

export function logStateChange(componentName, stateName, newValue) {
    if (DEBUG) {
        console.log(`[State] ${componentName}.${stateName}`, newValue);
    }
} 