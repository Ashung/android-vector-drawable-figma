
main(true);

figma.on('selectionchange', () => {
    main(false);
});

figma.ui.onmessage = message => {
    if (message.type === 'notify') {
        figma.notify(message.text);
    }
};

function main(showUI: Boolean): void {

    const selectedLayers: readonly SceneNode[] = figma.currentPage.selection;
    
    if (showUI) {
        figma.showUI(__html__, {
            width: 240,
            height: 320
        });
    }

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
                    figma.ui.postMessage({
                        name,
                        data
                    });
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
}
