const fs = require("fs");

class Resultados{
    constructor(token, nombreArchivo,erroresLexicos){
        this.token = token;
        this.nombreArchivo = nombreArchivo;
        this.errores = [];
        this.lexemas = [];
        this.erroresLexicos = erroresLexicos;
        this.revisarErrores();
    }

    revisarErrores(){
        for(let i = 0; i < this.token.length; i++){
            if(this.token[i].getTipo() == "ERROR_LEXICO"){
                this.errores.push(this.token[i]);
            }else{
                this.lexemas.push(this.token[i]);
            }
        }
    }



    crearReporteHtml(){
        this.revisarErrores();
        if(this.errores.length > 0){
            this.exportarErrorHTML();
        }else{
            this.exportarTokenHTML();
        }
    }

    // Método para generar la tabla HTML de léxicos
    generarTablaLexicosHTML() {;

        if (this.token.length === 0) {
            return "<p>---------------  No hay lexemas para mostrar. ------------</p>";
        }

        let tabla = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Tipo</th>
                        <th>Lexema</th>
                        <th>Fila</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.token.forEach((token, index) => {
            tabla += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${token.tipo}</td>
                    <td>${token.lexema}</td>
                    <td>${token.fila}</td>
                    <td>${token.columna}</td>
                </tr>
            `;
        });

        tabla += `
                </tbody>
            </table>
        `;

        return tabla;
    }

    // Método para generar la tabla HTML de errores
    generarTablaErroresHTML() {
            if (this.errores.length === 0) {
                return "<p>No hay errores Lexicos para mostrar.</p>";
            }
            
    
            let tabla = `
                <table border="1" style="border-collapse: collapse; width: 100%;">
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Tipo</th>
                            <th>Lexema</th>
                            <th>Descripción</th>
                            <th>Fila</th>
                            <th>Columna</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
    
            this.errores.forEach((error, index) => {
                tabla += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${error.tipo}</td>
                        <td>${error.lexema}</td>
                        <td>${error.descripcion}</td>
                        <td>${error.fila}</td>
                        <td>${error.columna}</td>
                    </tr>
                `;
            });
    
            tabla += `
                    </tbody>
                </table>
            `;
    
            return tabla;
    }

    // Método para generar la tabla HTML de erroresLexicos
    generarTablaErroresSintacticosHTML() {
        if (this.erroresLexicos.length === 0) {
            return "<p>------   No hay errores Lexicos para mostrar. ---------</p>";
        }
        

        let tabla = `
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Tipo</th>
                        <th>Lexema</th>
                        <th>Descripción</th>
                        <th>Fila</th>
                        <th>Columna</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.erroresLexicos.forEach((error, index) => {
            tabla += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${error.tipo}</td>
                    <td>${error.lexema}</td>
                    <td>${error.descripcion}</td>
                    <td>${error.fila}</td>
                    <td>${error.columna}</td>
                </tr>
            `;
        });

        tabla += `
                </tbody>
            </table>
        `;

        return tabla;
    }

    // Método para guardar ambas tablas en un archivo HTML y exportarlo como archivo html
    exportarTokenHTML() {
                const tablaLexicos = this.generarTablaLexicosHTML();
        
                const html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Tablas de Tokens</title>
                        <style>
                            table {
                                margin: 20px 0;
                                font-family: Arial, sans-serif;
                            }
                            th, td {
                                padding: 10px;
                                text-align: left;
                            }
                            th {
                                background-color:rgb(115, 176, 170);
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Proyecto 2</h1>
                        <h1>Tabla de Léxicos</h1>
                        ${tablaLexicos}
                    </body>
                    </html>
                `;
        
                fs.writeFileSync(this.nombreArchivo, html);
                console.log(`Archivo HTML generado: ${this.nombreArchivo}`);
    }

    exportarErrorHTML() {
        const tablaErrores = this.generarTablaErroresHTML();
        const tablaErroresSintacticos = this.generarTablaErroresSintacticosHTML();

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Tablas de Errores</title>
                <style>
                    table {
                        margin: 20px 0;
                        font-family: Arial, sans-serif;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                    }
                    th {
                        background-color:rgb(123, 18, 18);
                    }
                </style>
            </head>
            <body>
                <h1>Proyecto 2</h1>
                <h1>Tabla de Errores</h1>
                ${tablaErrores}
                <h1>Tabla de Errores Sintacticos</h1>
                ${tablaErroresSintacticos}
            </body>
            </html>
        `;

        fs.writeFileSync(this.nombreArchivo, html);
        console.log(`Archivo HTML generado: ${this.nombreArchivo}`);
    }
        
    agregarResultado(resultado){
        this.resultados.push(resultado);
    }

    getResultado(){
        this.resultados = this.token;
        return this.resultados;
    }

    //un metodo que devuleva el archivo html
    getDatos(){
        return this.nombreArchivo;
    }

    getErrores(){
        return this.errores;
    }
}

module.exports = Resultados;