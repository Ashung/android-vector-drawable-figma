figma.showUI(__html__, {
    width: 400,
    height: 320
});

let updateTimeout: any;

update();

figma.on('selectionchange', update);

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
                const name: string = layer.name.split(/\s*\/\s*/).pop().trim().replace(/\s+/g, '_').toLowerCase();
                const exportSettings: ExportSettingsSVG = {
                    format: 'SVG'
                };
                layer.exportAsync(exportSettings).then((data: Uint8Array) => {
                    figma.ui.postMessage({name, data});
                }).catch((reason: any) => {
                    figma.ui.postMessage({
                        error: true,
                        data: `<!--\n${reason}\n-->`
                    });
                });
            } catch (error) {
                figma.ui.postMessage({
                    error: true,
                    data: `<!--\nFailed to export SVG code.\n-->`
                });
            };
        }
    }
    updateTimeout = setTimeout(update, 200);
}