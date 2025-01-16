// Analizador Sintáctico

const Token = require('./Token');
const Error = require('./Error');
const Resultados = require('./Resultados');
const ExtraerDatos = require('./ExtraerDatos');
const CrearGraficas = require('./CrearGraficas');
const CrearArbol = require('./CrearArbol.js');
class AnalizadorSintactico{

    constructor(Token,entrada){ //Constructor de la clase
        this.entrada = entrada;
        this.Token = Token;
        this.PosicionActual = 0;
        this.nameOperacion = false;
        this.ErroresSintacticos = [];
        this.ErroresLexcios = [];
    }

    analizar(){
        while(this.PosicionActual < this.Token.length){ //Mientras no se haya llegado al final del archivo
            let tokenActual = this.Token[this.PosicionActual];
            if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "Operaciones"){ //Si el token actual es una palabra reservada "Operaciones"
                this.PosicionActual++; //Se aumenta la posicion actual
                
                this.analizarOperacion(); //Se llama al metodo analizarOperacion
            }else if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "ConfiguracionesLex"){ //Si el token actual es una palabra reservada "ConfiguracionesLex"
                this.PosicionActual++; //Se aumenta la posicion actual
                this.analizarConfiguracionLex(); //Se llama al metodo analizarConfiguracionLex
            }else if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "ConfiguracionesParser"){ //Si el token actual es una palabra reservada "ConfiguracionesParser"
                this.PosicionActual++;
                this.analizarConfiguracionLex();
            }else if(tokenActual.getTipo() == "KEYWORD" && tokenActual.getValor() == "generarReporte"){ //Si el token actual es una palabra reservada "generarReporte"
                this.PosicionActual++;
                this.analizarGenerarReporte();
            }else if (tokenActual.getTipo()== "KEYWORD"){ //Si el token actual es una palabra reservada
                this.analizarFuncion();

            }else {
                this.PosicionActual++;
            }
        }
    }

    analizarOperacion() { //Metodo para analizar las operaciones del archivo
        this.consumir("IGUAL"); //Se consume el token de tipo IGUAL 
        this.consumir("CORCHETE_ABRE");
        this.operacion();
        this.consumir("CORCHETE_CIERRA");
    }

    operacion(){ //Metodo para analizar las operaciones del archivo
        
        this.consumir("LLAVE_ABRE"); //Se consume el token de tipo LLAVE_ABRE
        this.consumir("OPERACION");
        this.consumir("DOS_PUNTOS");
        this.tipoOperacion();
        this.consumir("COMA");
        
        let tokenActual = this.Token[this.PosicionActual]; //Se obtiene el token actual de la lista de tokens
        if(this.nameOperacion === false){
            this.consumir("NOMBRE");
            this.consumir("DOS_PUNTOS");
            this.consumir("CADENA");
            this.consumir("COMA");
            this.nameOperacion = true;
        }
        this.variable(); //Se llama al metodo variable
        
        this.consumir("LLAVE_CIERRA"); //Se consume el token de tipo LLAVE_CIERRA
        this.consumir("COMA");
        this.nameOperacion = false;
        if(this.Token[this.PosicionActual].getTipo() === "LLAVE_ABRE"){ //Si el token actual es de tipo LLAVE_ABRE
            this.operacion(); //Se llama al metodo operacion
        }
        
        
    }

    operacionAnidada(){
        this.consumir("LLAVE_ABRE"); //Se consume el token de tipo LLAVE_ABRE
        this.consumir("OPERACION"); //Se consume el token de tipo OPERACION 
        this.consumir("DOS_PUNTOS");
        this.tipoOperacion();
        this.consumir("COMA");
        this.variable();
        this.consumir("LLAVE_CIERRA");
    }

    valor(){
        let tokenActual = this.Token[this.PosicionActual]; //Se obtiene el token actual de la lista de tokens
        if(tokenActual.getTipo() == "NUMERO_ENTERO" || tokenActual.getTipo() == "NUMERO_FLOTANTE"){ //Si el token actual es de tipo NUMERO_ENTERO o NUMERO_FLOTANTE
            this.PosicionActual++;  //Se aumenta la posicion actual
        }else if(tokenActual.getTipo() === "CORCHETE_ABRE"){ //Si el token actual es de tipo CORCHETE_ABRE
            this.consumir("CORCHETE_ABRE");
            this.operacionAnidada();
            this.consumir("CORCHETE_CIERRA");
        }

        if(this.Token[this.PosicionActual].getTipo() === "COMA"){ //Si el token actual es de tipo COMA
            this.consumir("COMA");
            this.variable();
        }
    }

    variable(){
        let tokenActual = this.Token[this.PosicionActual]; //Se obtiene el token actual de la lista de tokens
        //revisar que tokenActual en su lexema sea un numero
        if(tokenActual.getTipo() === "VARIABLE"){
            this.PosicionActual++;
            this.consumir("DOS_PUNTOS"); //Se consume el token de tipo DOS_PUNTOS
        }
        this.valor();
    }

    tipoOperacion(){
        let tokenActual = this.Token[this.PosicionActual]; //Se obtiene el token actual de la lista de tokens
        if(tokenActual.getTipo() == "OPERADOR"){
            this.PosicionActual++;
        }
    }

    analizarFuncion() { //Metodo para analizar las funciones del archivo
        consumir("IDENTIFICADOR");
        consumir("PARENTESIS_ABRE");
        // Valida parámetros...
        consumir("PARENTESIS_CIERRA");
        
    }

    analizarConfiguracionLex(){ //Metodo para analizar las configuraciones lex del archivo 
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

    analizarFuncion(){ //Metodo para analizar las funciones del archivo
        let guardar = this.Token[this.PosicionActual].getValor(); //Se obtiene el valor del token actual
        this.consumir("KEYWORD");
        this.consumir("PARENTESIS_ABRE"); //Se consume el token de tipo PARENTESIS_ABRE
        if(guardar == "imprimir" || guardar == "promedio" || guardar == "max" || guardar == "min"){     //Si el valor del token actual es igual a "imprimir", "promedio", "max" o "min"
            if(this.Token[this.PosicionActual].getTipo() == "CADENA"){ //Si el token actual es de tipo CADENA
                this.consumir("CADENA");
            }else if (this.Token[this.PosicionActual].getTipo() == "OPERADOR"){ //Si el token actual es de tipo OPERADOR
                this.consumir("OPERADOR");
            }
        }
        this.consumir("PARENTESIS_CIERRA");
    }

    analizarGenerarReporte() { //Metodo para analizar la funcion generarReporte
        this.consumir("PARENTESIS_ABRE");
        let guardarNombre = '"202230026"';
        let guardar = this.Token[this.PosicionActual]; //Se obtiene el token actual de la lista de tokens
    
        this.consumir("PALABRA_RESERVADA");
    
        if (this.Token[this.PosicionActual].getTipo() === "COMA") { //Si el token actual es de tipo COMA
            this.consumir("COMA");
            guardarNombre = this.Token[this.PosicionActual].getValor(); //Se obtiene el valor del token actual
            this.consumir("CADENA");
        }
    
        this.consumir("PARENTESIS_CIERRA"); //Se consume el token de tipo PARENTESIS_CIERRA
        if(guardar.getValor() === '"tokens"'){ //Si el valor del token actual es igual a "tokens"
            guardarNombre = guardarNombre.substring(1, guardarNombre.length-1); //Se obtiene el nombre del archivo a guardar
            guardarNombre = guardarNombre+".html";
            let tabla = new Resultados(this.Token, guardarNombre, this.ErroresSintacticos); //Se crea un objeto de la clase Resultados
            tabla.exportarTokenHTML(); //Se exportan los tokens a un archivo html
            this.ErroresLexcios = tabla.getErrores(); //Se obtienen los errores lexicos
            
        }else if(guardar.getValor() === '"errores"'){ //Si el valor del token actual es igual a "errores"
            guardarNombre = guardarNombre.substring(1, guardarNombre.length-1); //Se obtiene el nombre del archivo a guardar
            guardarNombre = guardarNombre+".html"; //Se le agrega la extension .html al nombre del archivo
            let tabla = new Resultados(this.Token, guardarNombre, this.ErroresSintacticos); //Se crea un objeto de la clase Resultados
            tabla.exportarErrorHTML(); //Se exportan los errores a un archivo html
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
                console.log("Operaciones:", operaciones); // Imprimir las operaciones
                console.log("Configuraciones Lex:", configuracionesLex);
                console.log("Configuraciones Parser:", configuracionesParser);
                
                const creadorGrafica = new CrearGraficas(operaciones, configuracionesLex); // Crear objeto de la clase CrearGraficas
                guardarNombre = guardarNombre.substring(1, guardarNombre.length - 1); //Se obtiene el nombre del archivo a guardar
        
                let dotname = guardarNombre + ".dot"; // Nombre del archivo DOT
                let pngname = guardarNombre + ".png";
                creadorGrafica.generarImagen(dotname, pngname);
        ////////////////////////7
                 const creadorGraficaArbol = new CrearArbol(this.Token, configuracionesParser); // Crear objeto de la clase CrearGraficas
                let dotnameArbol = 'ArbolCreado.dot'; // Nombre del archivo DOT
                let pngnameArbol = 'ArbolCreado.png';
                creadorGraficaArbol.generarArbolBNF(dotnameArbol); // Crear archivo DOT
                creadorGraficaArbol.generarImagen(dotnameArbol, pngnameArbol); // Crear imagen PNG
            } catch (error) {
                console.error("Error al procesar los datos:", error);
            }
        }
        
    }
    

    consumir(tipoEsperado) {
        let token = this.Token[this.PosicionActual]; //Se obtiene el token actual de la lista de tokens
        if (token.getTipo() == tipoEsperado) { //Si el tipo del token actual es igual al tipo esperado
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
        for(let i = 0; i < this.Token.length; i++){ //Recorre todos los tokens
            if(this.Token[i].getTipo() == "ERROR_LEXICO"){ //Si el tipo del token actual es igual a ERROR_LEXICO
                this.ErroresLexcios.push(this.Token[i]); //Se agrega el token a la lista de errores lexicos
            }
        }
    }



    getErroresLexicos(){
        this.sacareErroresLexicos(); //Se llama al metodo sacareErroresLexicos
        return this.ErroresLexcios; //Se retorna la lista de errores lexicos
    }

}

module.exports = AnalizadorSintactico;