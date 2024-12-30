class Error {
    /*objeto token que recibiar como parametros los valores que lo identifiquen */
    constructor(tipo, lexema, fila, columna,descripcion) {
        this.tipo = tipo;
        this.lexema = lexema;
        this.fila = fila;
        this.columna = columna;
        this.descripcion = descripcion;
    }

    getTipo() {
        return this.tipo;
    }

    getValor() {
        return this.lexema;
    }

    getFila() {
        return this.fila;
    }
    
    getColumna() {
        return this.columna;
    }

    getDescripcion() {
        return this.descripcion;
    }
}

module.exports = Error;