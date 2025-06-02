class Parser {
    constructor(tokens) {
        // Boşluk ve yorum satırlarını filtrele
        this.tokens = tokens.filter(t => t.type !== 'WHITESPACE' && t.type !== 'COMMENT');
        this.current = 0;
        this.errors = [];
        this.ast = null;

        // Biçimsel Dilbilgisi Kuralları (BNF benzeri)
        this.grammar = {
            'Program': ['Statement*'], // Program birden çok ifadeden oluşur
            'Statement': ['VarDeclaration', 'FunctionDeclaration', 'IfStatement', 'WhileStatement', 'ForStatement', 'ExpressionStatement', 'BlockStatement'], // İfade türleri
            'VarDeclaration': ['("let" | "const" | "var") IDENTIFIER ("=" Expression)? ";"?'], // Değişken tanımlama
            'FunctionDeclaration': ['"function" IDENTIFIER "(" ParameterList? ")" BlockStatement'], // Fonksiyon tanımlama 
            'IfStatement': ['"if" "(" Expression ")" Statement ("else" Statement)?'], // If ifadesi
            'WhileStatement': ['"while" "(" Expression ")" Statement'], // While döngüsü
            'ForStatement': ['"for" "(" (VarDeclaration | Expression)? ";" Expression? ";" Expression? ")" Statement'], // For döngüsü
            'BlockStatement': ['"{" Statement* "}"'], // Blok ifadesi
            'ExpressionStatement': ['Expression ";"?'], // İfade
            'Expression': ['AssignmentExpression'], // Atama ifadeleri
            'AssignmentExpression': ['ConditionalExpression (AssignmentOperator AssignmentExpression)?'], // Atama operatörleri
            'ConditionalExpression': ['LogicalORExpression ("?" Expression ":" ConditionalExpression)?'], // Koşullu ifade
            'LogicalORExpression': ['LogicalANDExpression ("||" LogicalANDExpression)*'], // Mantıksal VEYA
            'LogicalANDExpression': ['EqualityExpression ("&&" EqualityExpression)*'], // Mantıksal VE
            'EqualityExpression': ['RelationalExpression (("=="|"!="|"==="|"!==") RelationalExpression)*'], // Eşitlik operatörleri
            'RelationalExpression': ['AdditiveExpression (("<"|">"|"<="|">=") AdditiveExpression)*'], // Karşılaştırma operatörleri 
            'AdditiveExpression': ['MultiplicativeExpression (("+"|"-") MultiplicativeExpression)*'], // Toplama/çıkarma
            'MultiplicativeExpression': ['UnaryExpression (("*"|"/"|"%") UnaryExpression)*'], // Çarpma/bölme/mod
            'UnaryExpression': ['("!"|"-"|"+"|"++"|"--")? PostfixExpression'], // Tekli operatörler
            'PostfixExpression': ['PrimaryExpression ("++"|"--")?'], // Son ek operatörler
            'PrimaryExpression': ['IDENTIFIER', 'NUMBER', 'STRING', 'true', 'false', 'null', '"(" Expression ")"', 'ArrayExpression', 'ObjectExpression'], // Temel ifadeler
            'ArrayExpression': ['"[" (Expression ("," Expression)*)? "]"'], // Dizi ifadesi
            'ObjectExpression': ['"{" (Property ("," Property)*)? "}"'], // Nesne ifadesi
            'Property': ['IDENTIFIER ":" Expression'], // Nesne özelliği
            'TryStatement': ['"try" BlockStatement "catch" "(" IDENTIFIER ")" BlockStatement'], // Try-catch bloğu
            'ReturnStatement': ['"return" Expression? ";"?'], // Return ifadesi
            'SwitchStatement': ['"switch" "(" Expression ")" "{" CaseBlock "}"'], // Switch ifadesi
            'CaseBlock': ['(CaseClause)* (DefaultClause)? (CaseClause)*'], // Case blokları
            'CaseClause': ['"case" Expression ":" Statement*'], // Case durumu
            'DefaultClause': ['"default" ":" Statement*'], // Varsayılan durum
            'DoWhileStatement': ['"do" Statement "while" "(" Expression ")" ";"?'] // Do-while döngüsü


        };
    }

    parse() {
        try {
            this.ast = this.parseProgram();
            return {
                ast: this.ast,
                errors: this.errors,
                success: this.errors.length === 0
            };
        } catch (error) {
            this.addError('PARSE_ERROR', error.message);
            return {
                ast: this.ast || {type: 'Program', body: []},
                errors: this.errors,
                success: false
            };
        }
    }

    addError(type, message, token = null) {
        const errorToken = token || this.getCurrentToken();
        this.errors.push({
            type: type,
            message: message,
            line: errorToken?.line || 0,
            column: errorToken?.column || 0,
            token: errorToken
        });
    }

    getCurrentToken() {
        return this.tokens[this.current];
    }



    consumeToken(expectedType = null) {
        const token = this.getCurrentToken();

        if (expectedType && (!token || token.type !== expectedType)) {
            if (token) {
                this.addError('UNEXPECTED_TOKEN', `Expected ${expectedType}, but got ${token.type} "${token.value}"`);
            } else {
                this.addError('UNEXPECTED_EOF', `Expected ${expectedType}, but reached end of input`);
            }
            return null;
        }

        this.current++;
        return token;
    }

    matchToken(type) {
        const token = this.getCurrentToken();
        return token && token.type === type;
    }


    matchValue(value) {
        const token = this.getCurrentToken();
        return token && token.value === value;
    }

    parseProgram() {
        const statements = [];
        while (this.current < this.tokens.length) {
            try {
                const stmt = this.parseStatement();
                if (stmt) statements.push(stmt);
            } catch (error) {
                this.errors.push({
                    type: 'STATEMENT_ERROR',
                    message: error.message,
                    line: this.getCurrentToken()?.line || 0,
                    column: this.getCurrentToken()?.column || 0
                });
                this.current++; // Hatalı token'ı atla
            }
        }
        return {type: 'Program', body: statements};
    }

    parseStatement() {
        const token = this.getCurrentToken();
        if (!token) return null;

        // Değişken tanımlamaları
        if (this.matchValue('let') || this.matchValue('const') || this.matchValue('var')) {
            return this.parseVarDeclaration();
        }

        // Fonksiyon tanımlamaları 
        if (this.matchValue('function')) {
            return this.parseFunctionDeclaration();
        }

        // If ifadeleri
        if (this.matchValue('if')) {
            return this.parseIfStatement();
        }

        // While döngüleri
        if (this.matchValue('while')) {
            return this.parseWhileStatement();
        }

        // For döngüleri
        if (this.matchValue('for')) {
            return this.parseForStatement();
        }

        // Blok ifadeleri 
        if (this.matchValue('{')) {
            return this.parseBlockStatement();
        }
        if (this.matchValue('try')) {
            return this.parseTryStatement();
        }
        if (this.matchValue('return')) {
            return this.parseReturnStatement();
        }
        if (this.matchValue('switch')) {
            return this.parseSwitchStatement();
        }
        if (this.matchValue('do')) {
            return this.parseDoWhileStatement();
        }
        if (this.matchValue('break')) return this.parseBreakStatement();


        // İfade cümleleri
        return this.parseExpressionStatement();
    }

    parseVarDeclaration() {
        const kind = this.consumeToken('KEYWORD');
        const id = this.consumeToken('IDENTIFIER');

        let init = null;
        if (this.matchValue('=')) {
            this.consumeToken('OPERATOR');
            init = this.parseExpression();
        }

        if (this.matchValue(';')) {
            this.consumeToken('PUNCTUATION');
        }

        return {
            type: 'VariableDeclaration',
            kind: kind.value,
            id: {type: 'Identifier', name: id.value},
            init: init
        };
    }

    parseFunctionDeclaration() {
        this.consumeToken('KEYWORD'); // function
        const id = this.consumeToken('IDENTIFIER');

        this.consumeToken('PUNCTUATION'); // (

        const params = [];
        while (!this.matchValue(')') && this.getCurrentToken()) {
            params.push(this.consumeToken('IDENTIFIER'));
            if (this.matchValue(',')) {
                this.consumeToken('PUNCTUATION');
            }
        }

        this.consumeToken('PUNCTUATION'); // )
        const body = this.parseBlockStatement();

        return {
            type: 'FunctionDeclaration',
            id: {type: 'Identifier', name: id.value},
            params: params.map(p => ({type: 'Identifier', name: p.value})),
            body: body
        };
    }

    parseIfStatement() {
        this.consumeToken('KEYWORD'); // if
        this.consumeToken('PUNCTUATION'); // (
        const test = this.parseExpression();
        this.consumeToken('PUNCTUATION'); // )
        const consequent = this.parseStatement();

        let alternate = null;
        if (this.matchValue('else')) {
            this.consumeToken('KEYWORD');
            alternate = this.parseStatement();
        }

        return {
            type: 'IfStatement',
            test: test,
            consequent: consequent,
            alternate: alternate
        };
    }

    parseWhileStatement() {
        this.consumeToken('KEYWORD'); // while
        this.consumeToken('PUNCTUATION'); // (
        const test = this.parseExpression();
        this.consumeToken('PUNCTUATION'); // )
        const body = this.parseStatement();

        return {
            type: 'WhileStatement',
            test: test,
            body: body
        };
    }

    parseForStatement() {
        this.consumeToken('KEYWORD'); // for
        this.consumeToken('PUNCTUATION'); // (

        // Init
        let init = null;
        if (!this.matchValue(';')) {
            if (this.matchValue('let') || this.matchValue('const') || this.matchValue('var')) {
                init = this.parseVarDeclaration();
            } else {
                init = this.parseExpression();
                if (this.matchValue(';')) {
                    this.consumeToken('PUNCTUATION');
                }
            }
        } else {
            this.consumeToken('PUNCTUATION');
        }

        // Test
        let test = null;
        if (!this.matchValue(';')) {
            test = this.parseExpression();
        }
        this.consumeToken('PUNCTUATION'); // ;

        // Update
        let update = null;
        if (!this.matchValue(')')) {
            update = this.parseExpression();
        }
        this.consumeToken('PUNCTUATION'); // )

        const body = this.parseStatement();

        return {
            type: 'ForStatement',
            init: init,
            test: test,
            update: update,
            body: body
        };
    }

    parseBlockStatement() {
        this.consumeToken('PUNCTUATION'); // {
        const statements = [];

        while (!this.matchValue('}') && this.getCurrentToken()) {
            const stmt = this.parseStatement();
            if (stmt) statements.push(stmt);
        }

        this.consumeToken('PUNCTUATION'); // }

        return {
            type: 'BlockStatement',
            body: statements
        };
    }

    parseTryStatement() {
        this.consumeToken('KEYWORD'); // try
        const tryBlock = this.parseBlockStatement();

        this.consumeToken('KEYWORD'); // catch
        this.consumeToken('PUNCTUATION'); // (
        const param = this.consumeToken('IDENTIFIER');
        this.consumeToken('PUNCTUATION'); // )
        const catchBlock = this.parseBlockStatement();

        return {
            type: 'TryStatement',
            block: tryBlock,
            handler: {
                type: 'CatchClause',
                param: {type: 'Identifier', name: param.value},
                body: catchBlock
            }
        };
    }

    parseReturnStatement() {
        this.consumeToken('KEYWORD'); // return
        let argument = null;

        if (!this.matchValue(';') && this.getCurrentToken()) {
            argument = this.parseExpression();
        }

        if (this.matchValue(';')) {
            this.consumeToken('PUNCTUATION');
        }

        return {
            type: 'ReturnStatement',
            argument: argument
        };
    }

    parseSwitchStatement() {
        this.consumeToken('KEYWORD'); // switch
        this.consumeToken('PUNCTUATION'); // (
        const discriminant = this.parseExpression();
        this.consumeToken('PUNCTUATION'); // )

        this.consumeToken('PUNCTUATION'); // {
        const cases = [];

        while (!this.matchValue('}') && this.getCurrentToken()) {
            const token = this.getCurrentToken();

            if (token.value === 'case' || token.value === 'default') {
                const isDefault = token.value === 'default';
                this.consumeToken('KEYWORD'); // case/default

                let test = null;
                if (!isDefault) {
                    test = this.parseExpression(); // case 1
                }

                this.consumeToken('PUNCTUATION'); // :

                const consequent = [];
                while (
                    !this.matchValue('case') &&
                    !this.matchValue('default') &&
                    !this.matchValue('}') &&
                    this.getCurrentToken()
                    ) {
                    const stmt = this.parseStatement();
                    if (stmt) consequent.push(stmt);
                    else break;
                }

                cases.push({type: 'SwitchCase', test, consequent});
            } else {
                this.consumeToken(); // bilinmeyen token'ı atla
            }
        }

        this.consumeToken('PUNCTUATION'); // }

        return {
            type: 'SwitchStatement',
            discriminant,
            cases
        };
    }

    parseDoWhileStatement() {
        this.consumeToken('KEYWORD'); // do
        const body = this.parseStatement();
        this.consumeToken('KEYWORD'); // while
        this.consumeToken('PUNCTUATION'); // (
        const test = this.parseExpression();
        this.consumeToken('PUNCTUATION'); // )
        if (this.matchValue(';')) this.consumeToken('PUNCTUATION');
        return {
            type: 'DoWhileStatement',
            body,
            test
        };
    }

    parseBreakStatement() {
        this.consumeToken('KEYWORD'); // break 
        if (this.matchValue(';')) this.consumeToken('PUNCTUATION');
        return {
            type: 'BreakStatement'
        };
    }


    parseExpressionStatement() {
        const expression = this.parseExpression();
        if (this.matchValue(';')) {
            this.consumeToken('PUNCTUATION');
        }
        return {
            type: 'ExpressionStatement',
            expression: expression
        };
    }

    parseExpression() {
        return this.parseAssignmentExpression();
    }

    parseAssignmentExpression() {
        const left = this.parseConditionalExpression();

        if (this.matchToken('OPERATOR') && this.getCurrentToken().value.includes('=')) {
            const operator = this.consumeToken('OPERATOR');
            const right = this.parseAssignmentExpression();
            return {
                type: 'AssignmentExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        return left;
    }

    parseConditionalExpression() {
        const test = this.parseLogicalORExpression();

        if (this.matchValue('?')) {
            this.consumeToken('OPERATOR');
            const consequent = this.parseExpression();
            this.consumeToken('PUNCTUATION'); // :
            const alternate = this.parseConditionalExpression();
            return {
                type: 'ConditionalExpression',
                test: test,
                consequent: consequent,
                alternate: alternate
            };
        }

        return test;
    }

    parseLogicalORExpression() {
        let left = this.parseLogicalANDExpression();

        while (this.matchValue('||')) {
            const operator = this.consumeToken('OPERATOR');
            const right = this.parseLogicalANDExpression();
            left = {
                type: 'LogicalExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        return left;
    }

    parseLogicalANDExpression() {
        let left = this.parseEqualityExpression();

        while (this.matchValue('&&')) {
            const operator = this.consumeToken('OPERATOR');
            const right = this.parseEqualityExpression();
            left = {
                type: 'LogicalExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        return left;
    }

    parseEqualityExpression() {
        let left = this.parseRelationalExpression();

        while (this.matchValue('==') || this.matchValue('!=') ||
        this.matchValue('===') || this.matchValue('!==')) {
            const operator = this.consumeToken('OPERATOR');
            const right = this.parseRelationalExpression();
            left = {
                type: 'BinaryExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        return left;
    }

    parseRelationalExpression() {
        let left = this.parseAdditiveExpression();

        while (this.matchValue('<') || this.matchValue('>') ||
        this.matchValue('<=') || this.matchValue('>=')) {
            const operator = this.consumeToken('OPERATOR');
            const right = this.parseAdditiveExpression();
            left = {
                type: 'BinaryExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        return left;
    }

    parseAdditiveExpression() {
        let left = this.parseMultiplicativeExpression();

        while (this.matchValue('+') || this.matchValue('-')) {
            const operator = this.consumeToken('OPERATOR');
            const right = this.parseMultiplicativeExpression();
            left = {
                type: 'BinaryExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        return left;
    }

    parseMultiplicativeExpression() {
        let left = this.parseUnaryExpression();

        while (this.matchValue('*') || this.matchValue('/') || this.matchValue('%')) {
            const operator = this.consumeToken('OPERATOR');
            const right = this.parseUnaryExpression();
            left = {
                type: 'BinaryExpression',
                operator: operator.value,
                left: left,
                right: right
            };
        }

        return left;
    }

    parseUnaryExpression() {
        if (this.matchValue('!') || this.matchValue('-') || this.matchValue('+') ||
            this.matchValue('++') || this.matchValue('--')) {
            const operator = this.consumeToken('OPERATOR');
            const argument = this.parseUnaryExpression();
            return {
                type: 'UnaryExpression',
                operator: operator.value,
                argument: argument,
                prefix: true
            };
        }

        return this.parsePostfixExpression();
    }

    parsePostfixExpression() {
        let left = this.parsePrimaryExpression();

        if (this.matchValue('++') || this.matchValue('--')) {
            const operator = this.consumeToken('OPERATOR');
            return {
                type: 'UpdateExpression',
                operator: operator.value,
                argument: left,
                prefix: false
            };
        }

        return left;
    }

    parsePrimaryExpression() {
        let expr;

        const token = this.getCurrentToken();

        if (!token) {
            throw new Error('Beklenmeyen girdi sonu');
        }

        if (token.type === 'IDENTIFIER') {
            this.current++;
            expr = {type: 'Identifier', name: token.value};
        } else if (token.type === 'KEYWORD' && token.value === 'this') {
            this.current++;
            expr = {type: 'ThisExpression'};
        } else if (token.value === '(') {
            this.consumeToken('PUNCTUATION'); // (
            expr = this.parseExpression();
            this.consumeToken('PUNCTUATION'); // )
        } else if (token.type === 'STRING') {
            this.current++;
            expr = {type: 'Literal', value: token.value};
        } else if (token.type === 'NUMBER') {
            this.current++;
            expr = {type: 'Literal', value: Number(token.value)};
        } else if (token.type === 'KEYWORD' &&
            (token.value === 'true' || token.value === 'false' || token.value === 'null')) {
            this.current++;
            expr = {type: 'Literal', value: token.value === 'true' ? true : token.value === 'false' ? false : null};
        } else if (token.value === '[') {
            this.consumeToken('PUNCTUATION'); // [
            const elements = [];
            while (!this.matchValue(']') && this.getCurrentToken()) {
                elements.push(this.parseExpression());
                if (this.matchValue(',')) this.consumeToken('PUNCTUATION');
                else break;
            }
            this.consumeToken('PUNCTUATION'); // ]
            expr = {
                type: 'ArrayExpression',
                elements: elements
            };
        } else if (token.value === '{') {
            this.consumeToken('PUNCTUATION'); // {
            const properties = [];

            while (!this.matchValue('}') && this.getCurrentToken()) {
                const key = this.consumeToken('IDENTIFIER');
                this.consumeToken('PUNCTUATION'); // :
                const value = this.parseExpression();

                properties.push({
                    type: 'Property',
                    key: {type: 'Identifier', name: key.value},
                    value: value
                });

                if (this.matchValue(',')) {
                    this.consumeToken('PUNCTUATION');
                } else break;
            }

            this.consumeToken('PUNCTUATION'); // }
            expr = {
                type: 'ObjectExpression',
                properties: properties
            };
        } else {
            throw new Error(`Birincil ifadede beklenmeyen token: ${token.value}`);
        }

        // MemberExpression ve CallExpression zinciri
        while (this.matchValue('.') || this.matchValue('(')) {
            if (this.matchValue('.')) {
                this.consumeToken('PUNCTUATION'); // .
                const property = this.consumeToken('IDENTIFIER');
                expr = {
                    type: 'MemberExpression',
                    object: expr,
                    property: {type: 'Identifier', name: property.value}
                };
            } else if (this.matchValue('(')) {
                this.consumeToken('PUNCTUATION'); // (
                const args = [];
                while (!this.matchValue(')') && this.getCurrentToken()) {
                    args.push(this.parseExpression());
                    if (this.matchValue(',')) this.consumeToken('PUNCTUATION');
                    else break;
                }
                this.consumeToken('PUNCTUATION'); // )
                expr = {
                    type: 'CallExpression',
                    callee: expr,
                    arguments: args
                };
            }
        }

        return expr;
    }

}