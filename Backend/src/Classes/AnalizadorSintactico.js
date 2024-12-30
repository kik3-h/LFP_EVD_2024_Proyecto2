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