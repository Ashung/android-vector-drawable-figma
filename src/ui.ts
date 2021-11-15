import './ui.css';

import svg2vectordrawable from 'svg2vectordrawable';

// https://clipboardjs.com/
import Clipboard from 'clipboard';

import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
hljs.registerLanguage('xml', xml);
hljs.configure({
    ignoreUnescapedHTML: true,
    throwUnescapedHTML: false,
});

const codeBlock = document.getElementById('codeBlock');
const copyButton = document.getElementById('copy');
const exportButton = document.getElementById('export');

// Copy button
const clipboard = new Clipboard('#copy:not([disabled])');
clipboard.on('success', e => {
    parent.postMessage(
        {
            pluginMessage: {
                type: 'notify',
                text: 'Copied!'
            }
        },
        '*'
    );
    e.clearSelection();
});

// Export button
exportButton.onclick = () => {
    if (exportButton.getAttribute('disabled') === null) {
        const blob = new Blob(
            [codeBlock.innerText],
            {type: 'text/xml'}
        )
        const download = document.createElement('a');
        download.download = codeBlock.getAttribute('data-file-name') + '.xml';
        download.href = URL.createObjectURL(blob);
        download.click();
    }
};

window.onmessage = async (event) => {

    if (!event.data) {
        return;
    }

    const pluginMessage = event.data.pluginMessage;
    const data = pluginMessage.data;
    if (data) {
        if (pluginMessage.error) {
            codeBlock.textContent = pluginMessage.data;
            codeBlock.setAttribute('data-file-name', '');
            copyButton.setAttribute('disabled', 'disabled');
            exportButton.setAttribute('disabled', 'disabled');
        } else {
            const textDecoder = new TextDecoder();
            const svgCode = textDecoder.decode(pluginMessage.data);
            const xmlCode = await svg2vectordrawable(svgCode);
            codeBlock.textContent = xmlCode;
            codeBlock.setAttribute('data-file-name', pluginMessage.name);
            copyButton.removeAttribute('disabled');
            exportButton.removeAttribute('disabled');
        }
        hljs.highlightElement(codeBlock);
    }
};
