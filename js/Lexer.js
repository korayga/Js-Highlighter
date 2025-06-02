class Lexer {
    constructor() {
        this.tokenDefinitions = [
            // Boşluk ve Yorum Satırları
            {type: 'WHITESPACE', regex: /^\s+/, ignore: false},
            {type: 'COMMENT', regex: /^\/\/.*/, ignore: false},
            {type: 'COMMENT', regex: /^\/\*[\s\S]*?\*\//, ignore: false},

            // Anahtar Kelimeler (Rezerve Edilmiş Sözcükler) - Gelişmiş liste 
            {
                type: 'KEYWORD',
                regex: /^\b(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|eval|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield|async|of)\b/
            },

            // Tanımlayıcılar
            {type: 'IDENTIFIER', regex: /^[a-zA-Z_$][a-zA-Z0-9_$]*/},

            // Sayılar
            {type: 'NUMBER', regex: /^0[xX][0-9a-fA-F]+/}, // Onaltılık sayılar
            {type: 'NUMBER', regex: /^0[bB][01]+/}, // İkili sayılar
            {type: 'NUMBER', regex: /^0[oO][0-7]+/}, // Sekizli sayılar
            {type: 'NUMBER', regex: /^\d+\.?\d*([eE][+-]?\d+)?/}, // Ondalık sayılar

            // Metinler - Gelişmiş şablon literal desteği
            {type: 'STRING', regex: /^`([^`\\]|\\.|\\[\s\S])*`/}, // Şablon literalleri
            {type: 'STRING', regex: /^"([^"\\]|\\.)*"/}, // Çift tırnak
            {type: 'STRING', regex: /^'([^'\\]|\\.)*'/}, // Tek tırnak

            // Operatörler (Önce çoklu karakterli olanlar) - Genişletilmiş
            {
                type: 'OPERATOR',
                regex: /^(\+\+|--|===|!==|==|!=|<=|>=|<<|>>|>>>|&&|\|\||[\+\-\*\/\%\&\|\^]=|\*\*=|<<=|>>=|>>>=|\?\?=|\|\|=|\&\&=|\*\*|\?\?|\?\.|=>)/
            },
            {type: 'OPERATOR', regex: /^[+\-*/%=<>!&|^~?@]/},

            // Noktalama işaretleri
            {type: 'PUNCTUATION', regex: /^[{}()[\]:.,;]/},
        ];

        this.tokenTypes = {
            'KEYWORD': 'Anahtar Kelime',
            'IDENTIFIER': 'Tanımlayıcı',
            'NUMBER': 'Sayı',
            'STRING': 'Metin',
            'OPERATOR': 'Operatör',
            'PUNCTUATION': 'Noktalama',
            'COMMENT': 'Yorum',
            'WHITESPACE': 'Boşluk',
            'UNKNOWN': 'Bilinmeyen'
        };
    }

    tokenize(input) {
        const tokens = [];
        let remainingInput = input;
        let currentPosition = 0;
        let line = 1;
        let column = 1;

        while (remainingInput.length > 0) {
            let matched = false;

            for (const tokenDef of this.tokenDefinitions) {
                const match = tokenDef.regex.exec(remainingInput);

                if (match && match.index === 0) {
                    const value = match[0];

                    tokens.push({
                        type: tokenDef.type,
                        value: value,
                        start: currentPosition,
                        end: currentPosition + value.length - 1,
                        line: line,
                        column: column,
                        length: value.length
                    });

                    // Pozisyon takibi güncelleme
                    for (let char of value) {
                        if (char === '\n') {
                            line++;
                            column = 1;
                        } else {
                            column++;
                        }
                    }

                    remainingInput = remainingInput.substring(value.length);
                    currentPosition += value.length;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                const unknownChar = remainingInput[0];
                tokens.push({
                    type: 'UNKNOWN',
                    value: unknownChar,
                    start: currentPosition,
                    end: currentPosition,
                    line: line,
                    column: column,
                    length: 1
                });

                if (unknownChar === '\n') {
                    line++;
                    column = 1;
                } else {
                    column++;
                }

                remainingInput = remainingInput.substring(1);
                currentPosition += 1;
            }
        }

        return tokens;
    }
}