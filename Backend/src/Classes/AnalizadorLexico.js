// LexicalAnalyzer.js nuevooo modificado y mejorado de kike
const Token = require('./Token.js');
const Error = require('./Error.js');
const e = require('express');

class AnalizadorLexico{
    constructor(entrada){

        this.tokens = []; // obtengo tokens
        this.Token = [];
        this.errores = [];
        this.entrada = entrada; 
        this.estado = 0;
        this.token = "";
        this.fila = 1;
        this.columna = 1;
        this.misErrores = null; // Inicializamos misErrores en null
        this.configuraciones = {};
    }

    getTokens(){
        return this.Token;
    }

    analizar() {
        console.log("Analizando...");
        //leer un archivo de tipo json
        
        const tokens = this.analizarTexto(this.entrada);
       
        console.log("Analisis terminado");  
    }

    generarArchivoErrores(){
            this.misErrores.guardarErroresEnJSON();

    }

    PALABRAS_RESERVADAS = { // 
        '"operacion"': "OPERACION",
        '"nombre"': "NOMBRE",
        '"valor1"': "VARIABLE",
        '"valor2"': "VARIABLE",
        '"suma"': "OPERADOR",
        '"resta"': "OPERADOR",
        '"potencia"': "OPERADOR",
        '"raiz"': "OPERADOR",
        '"inverso"': "OPERADOR",
        '"coseno"': "OPERADOR",
        '"seno"': "OPERADOR",
        '"tangente"': "OPERADOR",
        '"multiplicacion"': "OPERADOR",
        '"division"': "OPERADOR",
        '"mod"': "OPERADOR",
        '"configuraciones"': "PALABRA_RESERVADA",
        'fondo': "PALABRA_RESERVADA",
        'fuente': "PALABRA_RESERVADA",
        'forma': "PALABRA_RESERVADA",
        'tipoFuente': "PALABRA_RESERVADA",
        'Operaciones': "KEYWORD",
        'ConfiguracionesLex': "KEYWORD",
        'ConfiguracionesParser': "KEYWORD",
        'imprimir': "KEYWORD",
        'conteo': "KEYWORD",
        'promedio': "KEYWORD",
        'max': "KEYWORD",
        'min': "KEYWORD",
        'generarReporte': "KEYWORD",
        '"tokens"': "PALABRA_RESERVADA",
        '"errores"': "PALABRA_RESERVADA",
        '"árbol"': "PALABRA_RESERVADA",
    };

    SIMBOLOS = {
        '{': "LLAVE_ABRE",
        '}': "LLAVE_CIERRA",
        '[': "CORCHETE_ABRE",
        ']': "CORCHETE_CIERRA",
        '(': "PARENTESIS_ABRE",
        ')': "PARENTESIS_CIERRA",
        ',': "COMA",
        ':': "DOS_PUNTOS",
        ';': "PUNTO_COMA",
        '=': "IGUAL",
    };

    extraerConfiguraciones(texto) {
        try {
            const jsonData = JSON.parse(texto); // Parsear el archivo JSON para obtener las configuraciones

            // Verificar si hay configuraciones  y si es un arreglo
            if (jsonData.configuraciones && Array.isArray(jsonData.configuraciones)) { // Verificar si hay configuraciones
                const config = jsonData.configuraciones[0]; // Obtener la primera configuración
                this.configuraciones = {
                    fondo: config.fondo || "default",
                    fuente: config.fuente || "default",
                    forma: config.forma || "default"
                };
            } else {
                console.log("No se encontraron configuraciones en el archivo.");
            }
        } catch (error) {
            console.error("Error al analizar configuraciones:", error.message);
        }
    }
    /* Metodo que contiene la logica del automata finito determinista, para la creacion de tokenes y errores
     */
    analizarTexto(texto) {
        const tokens = []; // Aquí se guardarán los tokens encontrados
        let buffer = ''; // Almacena temporalmente caracteres para formar un token
        let estado = 'inicial'; // El estado actual del autómata
        let fila = 1; // Contador para las filas (líneas)
        let columna = 1; // Contador para las columnas
    
        for (let i = 0; i < texto.length; i++) {
            const char = texto[i]; //descomposicion de la cadena en caracteres
    
            switch (estado) {
                case 'inicial':
                    if (char === '"') { // Detecta el inicio de una cadena con una comilla (")
                        estado = 'cadena'; //le asigna un estado
                        buffer = char; //almacena el caracter de manera momentanea
                    } else if (char >= '0' && char <= '9' || char === '-') { // Detecta un número
                        estado = 'numero';
                        buffer = char;
                    } else if ('{}[],:()='.includes(char)) { // Detecta caracteres especiales como llaves y corchetes
                        this.Token.push(new Token(this.identificarToken(char), char, fila, columna - buffer.length + 1, 'SIMBOLOS'));
                    } else if (char.trim() === '') { // Ignora espacios en blanco para no conrarlo como cadena
                        if (char === '\n') { // Salto de línea
                            fila++;
                            columna = 0; // Reinicia la columna al inicio de una nueva línea
                        }
                        // Incrementar columna incluso si es espacio
                    }else if(char === '*' && texto[i + 1] === '/'){ // Detecta comentarios de múltiples líneas
                        let comentario = '*/';
                        i += 2;
                        while (i < texto.length && !(texto[i] === '/' && texto[i + 1] === '*')) {
                            comentario += texto[i];
                            i++;
                        }
                        comentario += '*/';
                        this.Token.push(new Token('COMENTARIO', comentario, fila, columna - buffer.length + 1,'Comentario'));
                        i += 2;
                    }else if(char === '/' && texto[i + 1] === '/'){ // Detecta comentarios de una línea
                        let comentario = '//';
                        i += 2;
                        while (i < texto.length && texto[i] !== '\n') {
                            comentario += texto[i];
                            i++;
                        }
                        this.Token.push(new Token('COMENTARIOS', comentario, fila, columna - buffer.length + 1,'Comentario'));
                    //detectar si es una palabra reservada como operaciones
                    } else if (char.match(/[a-zA-Z]/i)) {
                        estado = 'palabra';
                        buffer = char;
                    } else {
                        this.Token.push(new Error(this.identificarToken(char), char, fila, columna - buffer.length + 1,'Caracter no reconocido'));
                    }
                    break;
    
                case 'cadena':
                    buffer += char;
                    if (char === '"') { // Termina la cadedena
                        let cadena =this.identificarToken(buffer);
                        if(cadena === "ERROR_LEXICO"){ // Verifica si la cadena es un error léxico
                            this.Token.push(new Error(this.identificarToken(buffer), buffer, fila, columna - buffer.length + 1,'Cadena no reconocida'));
                        }else{
                        this.Token.push(new Token(this.identificarToken(buffer), buffer, fila, columna - buffer.length + 1,'Palarba reservada'));
                        }
                        buffer = '';
                        estado = 'inicial';
                    }
                    break;
    
                case 'numero':
                    if (char >= '0' && char <= '9') {
                        buffer += char; // Continúa formando el número
                    } else if (char === '.' && !buffer.includes('.')) { // Detecta decimales
                        buffer += char;
                    } else { // Termina el número
                        this.Token.push(new Token(this.identificarToken(buffer), parseFloat(buffer), fila, columna - buffer.length + 1,'Numero'));
                        buffer = '';
                        estado = 'inicial';
                        i--; // Retrocede para procesar este carácter en el estado inicial
                    }
                    break;
                case 'palabra':
                    if (char.match(/[a-zA-Z]/i) || char.match(/[0-9]/i)) {
                        buffer += char;

                    } else {
                        if (this.PALABRAS_RESERVADAS[buffer]) { // Verifica si la palabra es una palabra reservada
                            this.Token.push(new Token(this.identificarToken(buffer), buffer, fila, columna - buffer.length + 1,'Palabra reservada')); // Agrega la palabra reservada
                        } else {
                            this.Token.push(new Error(this.identificarToken(buffer), buffer, fila, columna - buffer.length + 1,'Palabra no reconocida'));
                        }
                        buffer = '';
                        estado = 'inicial';
                        i--;
                    }
                    break;
                default:
                    throw new Error(`Estado desconocido: ${estado}`);
            }
    
            columna++; // Incrementa la columna después de procesar cada carácter
        }
    
        // Procesa cualquier token pendiente al final del texto
        if (buffer) {
            if (estado === 'numero') {
                this.Token.push(new Token(this.identificarToken(buffer), parseFloat(buffer), fila, columna - buffer.length + 1,'Numero')); // Agrega el número al final del texto
            } else if (estado === 'cadena') {
                throw new Error(`Cadena sin cerrar al final del texto en la fila ${fila}`);
            }
        }
    
        return tokens;
    }
    /*Metodo que identifica el tipo de token segun el estado y lo que contiene como valor*/
    identificarToken(buffer) {
        // Verifica si el token está en las palabras reservadas
        if (this.PALABRAS_RESERVADAS[buffer]) {
            return this.PALABRAS_RESERVADAS[buffer]; // Devuelve el tipo asociado al buffer
        }
        // Si está entre comillas dobles, clasificarlo como CADENA
        if (buffer.startsWith('"') && buffer.endsWith('"')) {
            return "CADENA"; // Es una cadena válida
        }
        // Verifica si es un número entero
        if (!isNaN(buffer) && Number.isInteger(Number(buffer))) {
            return "NUMERO_ENTERO"; // Es un número entero
        }
        // Verifica si es un número flotante (decimal)
        if (!isNaN(buffer) && buffer.includes('.')) {
            return "NUMERO_FLOTANTE"; // Es un número decimal
        }
        // Verifica si es un símbolo (por ejemplo, {}, [], :, etc.)
        if(this.SIMBOLOS[buffer]){
            return this.SIMBOLOS[buffer]; // Devuelve el tipo asociado al buffer
        }
        // Si no cumple con ninguna de las condiciones anteriores, se considera un error léxico
        return "ERROR_LEXICO"; 
    }

    imprimirTablaTokens() {
        if (this.Token.length === 0) { // Verifica si hay tokens para mostrar
            console.log("No hay tokens para mostrar."); // Muestra un mensaje si no hay tokens
            return;
        }
    
        console.log("\n--- TABLA DE TOKENS ---");
    
        this.Token.forEach((token, index) => {
            const numero = (index + 1).toString().padEnd(3, ' ');
            const tipo = token.tipo.padEnd(18, ' ');
            const valor = token.lexema.toString().padEnd(17, ' ');
            const fila = token.fila.toString().padEnd(6, ' ');
            const columna = token.columna.toString().padEnd(7, ' ');
            console.log(`| ${numero} | ${tipo} | ${valor} | ${fila} | ${columna} |`);
        });
    
        console.log("-----------------------------------------------------------------\n");
    }  

    imprimirTablaErrores() {
        if (this.errores.length === 0) {
            console.log("No se encontraron errores.");
            return;
        }
    
        console.log("\n--- TABLA DE ERRORES ---");
    
        this.errores.forEach((error, index) => {
            const numero = (index + 1).toString().padEnd(3, ' ');
            const descripcion = error.tipo.padEnd(18, ' ');
            const valor = error.valor.toString().padEnd(17, ' ');
            const fila = error.fila.toString().padEnd(6, ' ');
            const columna = error.columna.toString().padEnd(7, ' ');
            console.log(`| ${numero} | ${descripcion} | ${valor} | ${fila} | ${columna} |`);
        });
    
        console.log("-----------------------------------------------------------------\n");
    }
    

    imprimirTablaLexemas() {
        this.Lexicos = new Lexico(this.Token, this.errores);
        this.Lexicos.mostrarLexico();
    }

    crearHtml(){
        //const Lexicos = new Lexico(this.Token);
        this.Lexicos.crearArchivoLexico();
    }

    getErrores(){
        return this.errores;
    }

}

module.exports = AnalizadorLexico;