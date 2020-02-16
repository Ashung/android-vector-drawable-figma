figma.showUI(__html__, {
    width: 240,
    height: 320
});

let updateTimeout = 0;
let updateCounter = 0;
let prevMsg = '';

figma.on('selectionchange', update);

update();

figma.ui.onmessage = message => {
    if (message.type === 'notify') {
        figma.notify(message.text);
    }
};

function update(): void {
    clearTimeout(updateTimeout);

    const selectedLayers: readonly SceneNode[] = figma.currentPage.selection;

    if (selectedLayers.length !== 1) {
        figma.ui.postMessage({
            error: true,
            data: '<!--\nPlease select 1 layer.\n-->'
        });
    } else {
    
        const layer: SceneNode = selectedLayers[0];
        const name: string = layer.name.split(/\s*\/\s*/).pop()
            .trim().replace(/\s+/g, '_').toLowerCase();

        if (layer.parent.type === 'BOOLEAN_OPERATION') {
            figma.ui.postMessage({
                error: true,
                data: '<!--\nNot support layer type.\n-->'
            });
        } else if (layer.type === 'SLICE') {
            figma.ui.postMessage({
                error: true,
                data: '<!--\nSlice layer is not support.\n-->'
            });
        } else if (layer.visible === false) {
            figma.ui.postMessage({
                error: true,
                data: '<!--\nInvisible layer is not support.\n-->'
            });
        } else {
            try {
                const exportSettings: ExportSettingsSVG = {
                    format: 'SVG'
                }; 
                layer.exportAsync(exportSettings).then((data: Uint8Array) => {
                    const msg = {name, data};
                    const msgStr = JSON.stringify(msg);
                    if (msgStr !== prevMsg) {
                        prevMsg = msgStr;
                        figma.ui.postMessage(msg);
                        updateCounter = 0;
                    }
                }).catch((reason: any) => {
                    console.log(reason);
                });
            } catch (error) {
                figma.ui.postMessage({
                    error: true,
                    data: `<!--\nFailed to export SVG code.\n-->`
                });
            };
        }
    }

    const timeout = updateCounter++ < 20 ? 16 : 250;
    updateTimeout = setTimeout(update, timeout);
}