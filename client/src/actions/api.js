const baseUrl = process.env.REACT_APP_BACKEND_URL;

const post = (url, request) => {
    return fetch(url, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
    });
}

export const test = async topLevelModule => {
    const response = await post(`${baseUrl}/systemreliability/test`, topLevelModule);
    return await response.json();
}

export const getEquationSystem = async systemRequest => {
    const response = await post(`${baseUrl}/systemreliability/equation-system`, systemRequest);
    return await response.json();
}

export const getPlotData = async plotRequest => {
    const response = await post(`${baseUrl}/systemreliability/plots`, plotRequest);
    return await response.json();
}