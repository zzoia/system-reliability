export const download = (data, filename) => {

    const file = new Blob([JSON.stringify(data)], { type: "application/json" });
    if (window.navigator.msSaveOrOpenBlob) { // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
        return;
    }

    const anchor = document.createElement("a");
    const url = URL.createObjectURL(file);

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);

    anchor.click();

    setTimeout(function () {
        document.body.removeChild(anchor);
        window.URL.revokeObjectURL(url);
    }, 0);

}

export const readJson = file => {

    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = async event => resolve(JSON.parse(event.target.result));
        reader.readAsText(file);
    });
};