//Configuración principal del servidor Express
const fs = require('fs');

// Clase Token
class Token {
    constructor(type, value, row, col) {
        this.type = type;
        this.value = value;
        this.row = row;
        this.col = col;
    }
}

// Clase Error
class AnalysisError {
    constructor(message, row, col) {
        this.message = message;
        this.row = row;
        this.col = col;
    }
}

// Clase Analizador Léxico
class LexicalAnalyzer {
    constructor() {
        this.tokens = [];
        this.errors = [];
        this.row = 1;
        this.col = 1;
    }

    analyze(content) {
        let i = 0;
        while (i < content.length) {
            const char = content[i];

            if (char === ' ' || char === '\t') {
                this.col++;
                i++;
            } else if (char === '\n') {
                this.row++;
                this.col = 1;
                i++;
            } else if (char === '{' || char === '}' || char === '[' || char === ']') {
                this.tokens.push(new Token('SYMBOL', char, this.row, this.col));
                this.col++;
                i++;
            } else if (char === ':' || char === ',' || char === '=') {
                this.tokens.push(new Token('DELIMITER', char, this.row, this.col));
                this.col++;
                i++;
            } else if (char === '"') {
                let value = '';
                i++;
                this.col++;
                while (i < content.length && content[i] !== '"') {
                    value += content[i];
                    i++;
                    this.col++;
                }
                if (content[i] === '"') {
                    this.tokens.push(new Token('STRING', value, this.row, this.col));
                    i++;
                    this.col++;
                } else {
                    this.errors.push(new AnalysisError('Cadena no cerrada', this.row, this.col));
                }
            } else if (/[0-9]/.test(char)) {
                let value = '';
                while (i < content.length && /[0-9.]/.test(content[i])) {
                    value += content[i];
                    i++;
                    this.col++;
                }
                this.tokens.push(new Token('NUMBER', value, this.row, this.col));
            } else if (/[a-zA-Z]/.test(char)) {
                let value = '';
                while (i < content.length && /[a-zA-Z]/.test(content[i])) {
                    value += content[i];
                    i++;
                    this.col++;
                }
                const keywords = ['Operaciones', 'ConfiguracionesLex', 'ConfiguracionesParser', 'imprimir', 'conteo', 'promedio', 'max', 'min', 'generarReporte'];
                if (keywords.includes(value)) {
                    this.tokens.push(new Token('KEYWORD', value, this.row, this.col));
                } else {
                    this.tokens.push(new Token('IDENTIFIER', value, this.row, this.col));
                }
            } else {
                this.errors.push(new AnalysisError(`Caracter no reconocido '${char}'`, this.row, this.col));
                this.col++;
                i++;
            }
        }
        return { tokens: this.tokens, errors: this.errors };
    }
}

// Clase Analizador Sintáctico
class SyntacticAnalyzer {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.errors = [];
    }

    parse() {
        return this.programa();
    }

    programa() {
        if (this.match('KEYWORD', 'Operaciones')) {
            this.consume('DELIMITER', '=');
            this.consume('SYMBOL', '[');
            this.listaOperaciones();
            this.consume('SYMBOL', ']');

            if (this.match('KEYWORD', 'ConfiguracionesLex')) {
                this.bloqueConfiguraciones();
            } else {
                this.errors.push('Error: Se esperaba ConfiguracionesLex');
            }

            return true;
        } else {
            this.errors.push('Error: Se esperaba Operaciones');
            return false;
        }
    }

    listaOperaciones() {
        do {
            this.operacion();
        } while (this.match('DELIMITER', ','));
    }

    operacion() {
        this.consume('SYMBOL', '{');
        this.consume('STRING');
        this.consume('DELIMITER', ':');
        this.consume('STRING');
        this.consume('DELIMITER', ',');
        this.consume('STRING');
        this.consume('DELIMITER', ',');
        this.consume('STRING');
        this.consume('SYMBOL', '}');
    }

    bloqueConfiguraciones() {
        this.consume('DELIMITER', '=');
        this.consume('SYMBOL', '[');
        this.consume('SYMBOL', ']');
    }

    match(type, value) {
        if (this.current < this.tokens.length) {
            const token = this.tokens[this.current];
            if (token.type === type && (!value || token.value === value)) {
                this.current++;
                return true;
            }
        }
        return false;
    }

    consume(type, value = null) {
        if (!this.match(type, value)) {
            const token = this.tokens[this.current] || { row: -1, col: -1 };
            this.errors.push(new AnalysisError(`Se esperaba ${type} con valor ${value || ''}`, token.row, token.col));
        }
    }
}

// Clase Gestor de Operaciones
class MathOperations {
    executeOperation(operation) {
        switch (operation.operacion) {
            case 'suma':
                return this.add(operation.valor1, operation.valor2);
            case 'resta':
                return this.subtract(operation.valor1, operation.valor2);
            default:
                throw new Error(`Operación no soportada: ${operation.operacion}`);
        }
    }

    add(a, b) {
        return a + b;
    }

    subtract(a, b) {
        return a - b;
    }
}

// Clase Principal
class NodeLex {
    constructor() {
        this.lexicalAnalyzer = new LexicalAnalyzer();
        this.syntacticAnalyzer = null;
        this.mathOperations = new MathOperations();
    }

    analyzeFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lexResult = this.lexicalAnalyzer.analyze(content);

        if (lexResult.errors.length === 0) {
            this.syntacticAnalyzer = new SyntacticAnalyzer(lexResult.tokens);
            this.syntacticAnalyzer.parse();

            if (this.syntacticAnalyzer.errors.length === 0) {
                console.log('Análisis completado sin errores.');
            } else {
                console.log('Errores Sintácticos:', this.syntacticAnalyzer.errors);
            }
        } else {
            console.log('Errores Léxicos:', lexResult.errors);
        }
    }
}

// Ejecución
const nodeLex = new NodeLex();
nodeLex.analyzeFile('archivo.nlex');