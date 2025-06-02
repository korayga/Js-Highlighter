// Ana Uygulama
document.addEventListener('DOMContentLoaded', () => {
    // HTML elementlerini seç
    const codeInput = document.getElementById('codeInput');
    const highlightOutput = document.getElementById('highlightOutput');
    const tokenList = document.getElementById('tokenList');
    const parseTree = document.getElementById('parseTree');
    const grammarRules = document.getElementById('grammarRules');
    const errorList = document.getElementById('errorList');
    const tokenCount = document.getElementById('tokenCount');
    const errorCount = document.getElementById('errorCount');

    // Gerekli nesneleri oluştur
    const lexer = new Lexer();
    const highlighter = new Highlighter();
    const astVisualizer = new ASTVisualizer();

    let debounceTimeout;

    function updateAnalysis() {
        const code = codeInput.value;

        // Sözcük Analizi
        const tokens = lexer.tokenize(code);

        // Ayrıştırma
        const parser = new Parser(tokens);
        const parseResult = parser.parse();

        // Vurgulama
        const highlightedHtml = highlighter.highlight(tokens);
        highlightOutput.innerHTML = highlightedHtml;

        // Göstergeleri güncelle
        updateTokenList(tokens);
        updateParseTree(parseResult.ast);
        updateGrammarRules();
        updateErrorList(parseResult.errors);
        updateStats(tokens, parseResult.errors);

        // Kaydırma senkronizasyonu
        highlightOutput.scrollTop = codeInput.scrollTop;
        highlightOutput.scrollLeft = codeInput.scrollLeft;
    }

    // Token listesini güncelle
    function updateTokenList(tokens) {
        const nonWhitespaceTokens = tokens.filter(t => t.type !== 'WHITESPACE');
        tokenList.innerHTML = nonWhitespaceTokens.map(token => {
            const typeDescription = lexer.tokenTypes[token.type] || token.type;
            return `<div class="token-item">
                        <span class="token-type">${typeDescription}</span>
                        <span class="token-value">${token.value}</span>
                    </div>`;
        }).join('');
    }

    // Ayrıştırma ağacını güncelle
    function updateParseTree(ast) {
        if (!ast) {
            parseTree.innerHTML = '<div class="text-muted">Henüz ayrıştırılacak kod yok...</div>';
            return;
        }

        const treeText = astVisualizer.visualize(ast);
        parseTree.innerHTML = `<div class="tree-node">${treeText.split('\n').map(line =>
            `<div class="tree-node">${line}</div>`
        ).join('')}</div>`;
    }

    // Dilbilgisi kurallarını güncelle
    function updateGrammarRules() {
        const parser = new Parser([]);
        const grammarHTML = Object.entries(parser.grammar).map(([rule, productions]) =>
            `<div class="grammar-section">
                        <div class="grammar-title">
                            <i class="fas fa-angle-right"></i>
                            ${rule}
                        </div>
                        ${productions.map(prod =>
                `<div class="grammar-rule">${rule} ::= ${prod}</div>`
            ).join('')}
                    </div>`
        ).join('');

        grammarRules.innerHTML = grammarHTML;
    }

    // Hata listesini güncelle
    function updateErrorList(errors) {
        if (errors.length === 0) {
            errorList.innerHTML = '<div class="text-success"><i class="fas fa-check-circle"></i> Hata bulunamadı! Kodunuz sözdizimi açısından doğru görünüyor.</div>';
            return;
        }

        errorList.innerHTML = errors.map(error =>
            `<div class="error-item">
                        <div class="error-type">
                            <i class="fas fa-exclamation-triangle"></i> ${error.type}
                        </div>
                        <div class="error-message">
                            Satır ${error.line}, Sütun ${error.column}: ${error.message}
                        </div>
                    </div>`
        ).join('');
    }

    // İstatistikleri güncelle
    function updateStats(tokens, errors) {
        const nonWhitespaceTokens = tokens.filter(t => t.type !== 'WHITESPACE');
        tokenCount.textContent = nonWhitespaceTokens.length;
        errorCount.textContent = errors.length;
    }

    // Gecikmeli güncelleme
    function debouncedUpdate() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updateAnalysis, 200);
    }

    // Olay dinleyicileri
    codeInput.addEventListener('input', debouncedUpdate);
    codeInput.addEventListener('scroll', () => {
        highlightOutput.scrollTop = codeInput.scrollTop;
        highlightOutput.scrollLeft = codeInput.scrollLeft;
    });

    // Başlangıç örnek kodu
    const initialCode = `// JavaScript Sözdizimi Vurgulayıcı ve Parser

    // Genel değişkenler
let x = 2;
const pi = 3.14;
var user = "Korayga";

// Fonksiyon tanımı
function greet(user) {
    if (user === "Korayga") {
        return "Hoş geldin patron!";
    } else {
        return "Merhaba " + user;
    }
}

// Switch-case örneği
switch (x) {
    case 1:
        console.log("Bir");
        break;
    case 2:
        console.log("İki");
        break;
    default:
        console.log("Bilinmiyor");
}

// Döngüler
for (let i = 0; i < 3; i++) {
    console.log("For:", i);
}

let count = 0;
while (count < 2) {
    console.log("While:", count);
    count++;
}

do {
    console.log("DoWhile:", count);
    count--;
} while (count > 0);

// Try-catch
try {
    let result = greet(name);
    console.log(result);
} catch (e) {
    console.log("Hata oluştu:", e);
}

// Dizi ve nesne
const arr = [1, 2, 3];
const obj = {
    a: 10,
    b: 20
};




`;

    codeInput.value = initialCode;
    updateAnalysis();
});