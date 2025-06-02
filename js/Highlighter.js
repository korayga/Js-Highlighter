class Highlighter {
    escapeHTML(text) {
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    highlight(tokens) {
        let html = '';
        tokens.forEach(token => {
            const className = `token-${token.type}`;
            const escapedValue = this.escapeHTML(token.value);
            html += `<span class="${className}" title="${token.type}: ${escapedValue}">${escapedValue}</span>`;
        });
        return html;
    }
}
