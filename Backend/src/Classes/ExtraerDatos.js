const fs = require('fs');

class ExtraerDatos {
    constructor(rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
    }

    // Método para extraer una sección específica del archivo
    static extraerSeccion(contenido, inicio, fin) {
        const startIndex = contenido.indexOf(inicio);
        if (startIndex === -1) return null; // No se encontró el inicio

        let endIndex = -1;
        let openBrackets = 0;

        // Buscar el final de la sección con soporte para anidamientos
        for (let i = startIndex + inicio.length; i < contenido.length; i++) {
            if (contenido[i] === '[') openBrackets++;
            if (contenido[i] === ']') {
                if (openBrackets === 0) {
                    endIndex = i;
                    break;
                }
                openBrackets--;
            }
        }

        if (endIndex === -1) return null; // No se encontró el cierre correspondiente

        return contenido.substring(startIndex + inicio.length, endIndex + 1).trim();
    }

    // Método para limpiar el texto JSON
    static limpiarJSON(texto) {
        return texto
            .replace(/([{,])?\s*([a-zA-Z_]+)\s*:/g, '$1"$2":') // Agrega comillas a las claves
            .replace(/'/g, '"') // Cambia comillas simples por dobles
            .replace(/,\s*([\]}])/g, '$1') // Elimina comas sobrantes
            .trim();
    }
    

    // Método para extraer datos del archivo
    extraerDatos() {
        // Leer el contenido del archivo
        const contenido = this.rutaArchivo;
        console.log(contenido);
    
        // Extraer las secciones específicas
        const operacionesTexto = ExtraerDatos.extraerSeccion(contenido, 'Operaciones = [', ']');
        const configuracionesLexTexto = ExtraerDatos.extraerSeccion(contenido, 'ConfiguracionesLex = [', ']');
        const configuracionesParserTexto = ExtraerDatos.extraerSeccion(contenido, 'ConfiguracionesParser = [', ']');
        if (!operacionesTexto || !configuracionesLexTexto || !configuracionesParserTexto) {
            throw new Error("No se encontraron las secciones 'Operaciones' o 'ConfiguracionesLex' en el archivo.");
        }
    
        // Limpiar JSON
        const operacionesLimpias = ExtraerDatos.limpiarJSON(operacionesTexto);
        const configuracionesLexLimpias = ExtraerDatos.limpiarJSON(configuracionesLexTexto);
        const configuracionesParserLimpias = ExtraerDatos.limpiarJSON(configuracionesParserTexto);
        //console.log(configuracionesLexLimpias);
        // Parsear JSON
        const operacionesValidas = `{"operaciones":[${operacionesLimpias}}`;
        const configuracionesLexValidas = `{"configuaracionesLex":[{${configuracionesLexLimpias.replace(/]/g, '}')}]}`;
        const configuracionesParserValidas = `{"configuaracionesParser":[{${configuracionesParserLimpias.replace(/]/g, '}')}]}`;

        try {
            const operaciones = JSON.parse(operacionesValidas);
            const configuracionesLex = JSON.parse(configuracionesLexValidas);
            const configuracionesParser = JSON.parse(configuracionesParserValidas);
    
            return { operaciones, configuracionesLex, configuracionesParser };
        } catch (error) {
            console.error("Error al parsear JSON:", error.message);
            //throw error;
        }
    }
    
}    

module.exports = ExtraerDatos;