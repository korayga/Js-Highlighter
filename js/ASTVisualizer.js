class ASTVisualizer {
    visualize(ast, indent = 0) {
        // AST boş ise boş AST mesajı döndür
        if (!ast) return 'Boş AST';

        // Girinti oluştur
        const indentStr = '  '.repeat(indent);
        let result = '';

        if (ast.type) {
            // Düğüm tipini ekle
            result += `${indentStr}${ast.type}\n`;

            // Farklı düğüm özelliklerini işleme
            Object.keys(ast).forEach(key => {
                if (key !== 'type' && ast[key] !== null && ast[key] !== undefined) {
                    // Eğer dizi ise
                    if (Array.isArray(ast[key])) {
                        if (ast[key].length > 0) {
                            result += `${indentStr}├── ${key}:\n`;
                            // Dizideki her öğeyi işleme
                            ast[key].forEach((item, index) => {
                                const isLast = index === ast[key].length - 1;
                                const prefix = isLast ? '└── ' : '├── ';
                                if (typeof item === 'object' && item.type) {
                                    result += `${indentStr}│   ${prefix}${this.visualize(item, indent + 2).trim()}\n`;
                                } else {
                                    result += `${indentStr}│   ${prefix}${item}\n`;
                                }
                            });
                        }
                        // Eğer nesne ve tip içeriyorsa
                    } else if (typeof ast[key] === 'object' && ast[key].type) {
                        result += `${indentStr}├── ${key}: ${this.visualize(ast[key], indent + 1).trim()}\n`;
                        // Diğer tüm değerler için
                    } else {
                        result += `${indentStr}├── ${key}: ${ast[key]}\n`;
                    }
                }
            });
        }

        return result;
    }
}