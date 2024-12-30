Universidad de San Carlos de Guatemala.

Facultad de Ingenieria en Ciencias y Sistemas.

Escuela de Vacaciones de Diciembre 2024

Lenguajes Formales y de Programación

Ingeniera Mariana Sic

Auxiliar Elder Pum

Estudiante: ENRIQUE ALEXANDEER TEBALAN HERNANDEZ    3160499720903

Carnet: 202230026

# Manual Técnico

Version: 5.0.0
Nombre: NODLEX
Lenguaje: JavaScript, typeScript, HTML
Visual Studio Code
Node js v22
React 19
Html

# Introduccion

El sistema "NodeLex v2.0" es una herramienta que permite analizar archivos de texto en formato .nlex, generando reportes en formato HTML sobre los tokens, errores léxicos y sintácticos. También soporta configuraciones personalizadas y la creación de gráficos.

# Requisitos del Sistema

-Hardware:

Procesador: Intel i3 o superior

Memoria RAM: 4 GB mínimo

Espacio en disco: 200 MB mínimo

- Software:

Node.js v22.12.0 o superior

Angular CLI 19

Sistema operativo: Windows 10/11, Linux, o macOS

# Arquitectura del Sistema

## Backend:

Desarrollado en Node.js

Express.js para el servidor

Módulos personalizados para análisis léxico y sintáctico

## Frontend:

Desarrollado en React

Axios para comunicación con el backend

CSS/SCSS para diseño responsivo

# Estructura de Archivos y Carpetas

src/
├── Classes/
│   ├── AnalizadorLexico.js
│   ├── AnalizadorSintactico.js
│   ├── Resultados.js
│   ├── CrearGraficas.js
│   ├── ExtraerDatos.js
├── main.js

src/
├── assets/
│   ├── fondo.png
│   └── logo.png
├── components/
│   ├── Component.js
│   └── Component.css
├── App.js
├── index.js

### main
Esta clase es la que arranca el programa, ya que contiene el menu y se comunica con la mayoria de clases que existen.
### Tokens
La clase token contiene todas las descripciones y caracaterisiticas que tendran una unidad lexica. 
### AnalizadorLexico
La clase que contiene la logica del AUTOMATA FINITO DETERMINANTE, este hace uso de listas de objetos token y tambien crea una lista especial para errores, esto sirve para generar la tabla de simbolos de un lenguaje de entrada.
### Lexico
Analiza la lista de tokens para guardar los lexemas existente dentro de esa lista.
### Error
Esta clase recibe los token de la lista de Errores y los convierte en archivo de tipo JSON con la estructura que describe el error.
### Resultados
Clase que crea el html con las tablas de los lexicos y las tablas de errores, al igual que genera por medio de graphviz un archivo de tipo dot que sirve para generar una imagen con los resultados de las operacion y ordenados por medio de nodos cada proceso de operación.

### Analizador Sintactico
Clase que recibe el listado de tokens y apartir de una estuctura BNF se encarga de validar las gramaticas del lenguajes, haciendo uso de la lecutra de cada token y los valores esperados que cumplan con lo esperado por el lenguaje que ha sido creado

## Creación del Automata por medio de una Expresion Regular

La creación del automata por meedio del método del árbol.

![Expresion Regular](/Backend/src/Imagenes/1.jpg "Método de Árbol")
![Transiciones](/Backend/src/Imagenes/2.jpg "Transiciones")

![Derivacion](/Backend/src/Imagenes/derivacion.png "Transiciones")

## El Automata Final
![Automata](/Backend/src/Imagenes/AutomataFinal.png "Automata")
 Segunda foto
![Automata](/Backend/src/Imagenes/AutomataFinal2.png "Automata parte 2")

## Gramatica Libre de Contexto BNF
El BNF se utiliza extensamente como notación para las gramáticas de los lenguajes de programación, de los sistemas de comando y de los protocolos de comunicación, así como una notación para representar partes de las gramáticas de la lengua natural 

![BNF](/Backend/src/Imagenes/BNF.png "Grmatica Libre de Contexto")

### Codigo del Automata (lexico y sintactico)

// LexicalAnalyzer.js
const Token = require('./Token.js');
const Error = require('./Error.js');
const e = require('express');

class AnalizadorLexico{
    constructor(entrada){

        this.tokens = [];
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

    PALABRAS_RESERVADAS = {
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
            const jsonData = JSON.parse(texto); // Parsear el archivo JSON

            // Verificar si hay configuraciones
            if (jsonData.configuraciones && Array.isArray(jsonData.configuraciones)) {
                const config = jsonData.configuraciones[0];
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
                        if (this.PALABRAS_RESERVADAS[buffer]) {
                            this.Token.push(new Token(this.identificarToken(buffer), buffer, fila, columna - buffer.length + 1,'Palabra reservada'));
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
                this.Token.push(new Token(this.identificarToken(buffer), parseFloat(buffer), fila, columna - buffer.length + 1,'Numero'));
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
        if (this.Token.length === 0) {
            console.log("No hay tokens para mostrar.");
            return;
        }
    
        console.log("\n--- TABLA DE TOKENS ---");
        console.log("-----------------------------------------------------------------");
        console.log("| #   | Tipo               | Valor             | Fila   | Columna  |");
        console.log("-----------------------------------------------------------------");
    
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
        console.log("-----------------------------------------------------------------");
        console.log("| #   | Descripción         | Valor             | Fila   | Columna  |");
        console.log("-----------------------------------------------------------------");
    
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

Sintactico:

// Analizador Sintáctico

const Token = require('./Token');
const Error = require('./Error');
const Resultados = require('./Resultados');
const ExtraerDatos = require('./ExtraerDatos');
const CrearGraficas = require('./CrearGraficas');
const CrearArbol = require('./CrearArbol.js');
class AnalizadorSintactico{

    constructor(Token,entrada){
        this.entrada = entrada;
        this.Token = Token;
        this.PosicionActual = 0;
        this.nameOperacion = false;
        this.ErroresSintacticos = [];
        this.ErroresLexcios = [];
    }

    analizar(){
        while(this.PosicionActual < this.Token.length){
            let tokenActual = this.Token[this.PosicionActual];
            if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "Operaciones"){
                this.PosicionActual++;
                
                this.analizarOperacion();
            }else if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "ConfiguracionesLex"){
                this.PosicionActual++;
                this.analizarConfiguracionLex();
            }else if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "ConfiguracionesParser"){
                this.PosicionActual++;
                this.analizarConfiguracionLex();
            }else if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "generarReporte"){
                this.PosicionActual++;
                this.analizarGenerarReporte();
            }else if (tokenActual.getTipo()== "KEYWORD"){
                this.analizarFuncion();

            }else {
                this.PosicionActual++;
            }
        }
    }

    analizarOperacion() {
        this.consumir("IGUAL");
        this.consumir("CORCHETE_ABRE");
        this.operacion();
        this.consumir("CORCHETE_CIERRA");
    }

    operacion(){
        
        this.consumir("LLAVE_ABRE");
        this.consumir("OPERACION");
        this.consumir("DOS_PUNTOS");
        this.tipoOperacion();
        this.consumir("COMA");
        
        let tokenActual = this.Token[this.PosicionActual];
        if(this.nameOperacion === false){
            this.consumir("NOMBRE");
            this.consumir("DOS_PUNTOS");
            this.consumir("CADENA");
            this.consumir("COMA");
            this.nameOperacion = true;
        }
        this.variable();
        
        this.consumir("LLAVE_CIERRA");
        this.consumir("COMA");
        this.nameOperacion = false;
        if(this.Token[this.PosicionActual].getTipo() === "LLAVE_ABRE"){
            this.operacion();
        }
        
        
    }

    operacionAnidada(){
        this.consumir("LLAVE_ABRE");
        this.consumir("OPERACION");
        this.consumir("DOS_PUNTOS");
        this.tipoOperacion();
        this.consumir("COMA");
        this.variable();
        this.consumir("LLAVE_CIERRA");
    }

    valor(){
        let tokenActual = this.Token[this.PosicionActual];
        if(tokenActual.getTipo() == "NUMERO_ENTERO" || tokenActual.getTipo() == "NUMERO_FLOTANTE"){
            this.PosicionActual++;
        }else if(tokenActual.getTipo() === "CORCHETE_ABRE"){
            this.consumir("CORCHETE_ABRE");
            this.operacionAnidada();
            this.consumir("CORCHETE_CIERRA");
        }

        if(this.Token[this.PosicionActual].getTipo() === "COMA"){
            this.consumir("COMA");
            this.variable();
        }
    }

    variable(){
        let tokenActual = this.Token[this.PosicionActual];
        //revisar que tokenActual en su lexema sea un numero
        if(tokenActual.getTipo() === "VARIABLE"){
            this.PosicionActual++;
            this.consumir("DOS_PUNTOS");
        }
        this.valor();
    }

    tipoOperacion(){
        let tokenActual = this.Token[this.PosicionActual];
        if(tokenActual.getTipo() == "OPERADOR"){
            this.PosicionActual++;
        }
    }

    analizarFuncion() {
        consumir("IDENTIFICADOR");
        consumir("PARENTESIS_ABRE");
        // Valida parámetros...
        consumir("PARENTESIS_CIERRA");
        
    }

    analizarConfiguracionLex(){
        this.consumir("IGUAL");
        this.consumir("CORCHETE_ABRE");
        this.consumir("PALABRA_RESERVADA");
        this.consumir("DOS_PUNTOS");
        this.consumir("CADENA");
        this.consumir("COMA");
        this.consumir("PALABRA_RESERVADA");
        this.consumir("DOS_PUNTOS");
        this.consumir("CADENA");
        this.consumir("COMA");
        this.consumir("PALABRA_RESERVADA");
        this.consumir("DOS_PUNTOS");
        this.consumir("CADENA");
        this.consumir("COMA");
        this.consumir("PALABRA_RESERVADA");
        this.consumir("DOS_PUNTOS");
        this.consumir("CADENA")
        this.consumir("CORCHETE_CIERRA");
    }

    analizarFuncion(){
        let guardar = this.Token[this.PosicionActual].getValor();
        this.consumir("KEYWORD");
        this.consumir("PARENTESIS_ABRE");
        if(guardar == "imprimir" || guardar == "promedio" || guardar == "max" || guardar == "min"){
            if(this.Token[this.PosicionActual].getTipo() == "CADENA"){
                this.consumir("CADENA");
            }else if (this.Token[this.PosicionActual].getTipo() == "OPERADOR"){
                this.consumir("OPERADOR");
            }
        }
        this.consumir("PARENTESIS_CIERRA");
    }

    analizarGenerarReporte() {
        this.consumir("PARENTESIS_ABRE");
        let guardarNombre = '"202230026"';
        let guardar = this.Token[this.PosicionActual];
    
        this.consumir("PALABRA_RESERVADA");
    
        if (this.Token[this.PosicionActual].getTipo() === "COMA") {
            this.consumir("COMA");
            guardarNombre = this.Token[this.PosicionActual].getValor();
            this.consumir("CADENA");
        }
    
        this.consumir("PARENTESIS_CIERRA");
        if(guardar.getValor() === '"tokens"'){
            guardarNombre = guardarNombre.substring(1, guardarNombre.length-1);
            guardarNombre = guardarNombre+".html";
            let tabla = new Resultados(this.Token, guardarNombre, this.ErroresSintacticos);
            tabla.exportarTokenHTML();
            this.ErroresLexcios = tabla.getErrores();
            
        }else if(guardar.getValor() === '"errores"'){
            guardarNombre = guardarNombre.substring(1, guardarNombre.length-1);
            guardarNombre = guardarNombre+".html";
            let tabla = new Resultados(this.Token, guardarNombre, this.ErroresSintacticos);
            tabla.exportarErrorHTML();
        }else if(guardar.getValor() === '"arbol"') {
            const extraer = new ExtraerDatos(this.entrada);
        
            try {
                // Extraer los datos
                const { operaciones, configuracionesLex, configuracionesParser } = extraer.extraerDatos();
                
                // Verificar si los datos son válidos
                if (!operaciones || !configuracionesLex || !configuracionesParser) {
                    console.warn("Operaciones o configuraciones no válidas. Se omite la creación de imágenes.");
                    return;
                }
                console.log("Operaciones:", operaciones);
                console.log("Configuraciones Lex:", configuracionesLex);
                console.log("Configuraciones Parser:", configuracionesParser);
                
                const creadorGrafica = new CrearGraficas(operaciones, configuracionesLex);
                guardarNombre = guardarNombre.substring(1, guardarNombre.length - 1);
        
                let dotname = guardarNombre + ".dot";
                let pngname = guardarNombre + ".png";
                creadorGrafica.generarImagen(dotname, pngname);
        ////////////////////////7
                 const creadorGraficaArbol = new CrearArbol(this.Token, configuracionesParser);
                let dotnameArbol = 'ArbolCreado.dot';
                let pngnameArbol = 'ArbolCreado.png';
                creadorGraficaArbol.generarArbolBNF(dotnameArbol); // Crear archivo DOT
                creadorGraficaArbol.generarImagen(dotnameArbol, pngnameArbol);
            } catch (error) {
                console.error("Error al procesar los datos:", error);
            }
        }
        
    }
    

    consumir(tipoEsperado) {
        let token = this.Token[this.PosicionActual];
        if (token.getTipo() == tipoEsperado) {
            this.PosicionActual++;
        } else {
            //Crear un token de tipo error sintactico y agregarlo a la lista de tokens
            this.ErroresSintacticos.push(new Error("ERROR_SINTACTICO", token.getValor(), token.getFila(), token.getColumna(),'Se esperaba ' + tipoEsperado));;
            //throw new Error("Se esperaba " + tipoEsperado + " en línea " + token.linea);
        }
    }

    getToken(){
        return this.Token;
    }

    getErrores(){
        return this.ErroresSintacticos;
    }

    //Metodo para obtener los errores lexicos, recorre todos los token y guardar los errores de tipo lexico en en arreglo erroreslexciso
    sacareErroresLexicos(){
        for(let i = 0; i < this.Token.length; i++){
            if(this.Token[i].getTipo() == "ERROR_LEXICO"){
                this.ErroresLexcios.push(this.Token[i]);
            }
        }
    }



    getErroresLexicos(){
        this.sacareErroresLexicos();
        return this.ErroresLexcios;
    }

}

module.exports = AnalizadorSintactico;

## Componentes Principales

Analizador Léxico: Identifica tokens válidos y errores léxicos.

Analizador Sintáctico: Valida la estructura gramatical de las entradas.

Generador de Reportes: Crea tablas en HTML con tokens y errores.

Interfaz Gráfica: Permite cargar archivos, mostrar resultados y guardar análisis.

