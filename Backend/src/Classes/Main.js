const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Importar módulos personalizados
const AnalizadorLexico = require('./AnalizadorLexico'); // Importar Analizador Léxico
const AnalizadorSintactico = require('./AnalizadorSintactico'); // Importar Analizador Sintáctico
const Resultados = require('./Resultados'); // Importar Resultados
const CrearGraficas = require('./CrearGraficas'); // Importar CrearGraficas
const ExtraerDatos = require('./ExtraerDatos'); // Importar ExtraerDatos

// Configuración del servidor
const app = express();
app.use(express.text()); // Middleware para recibir texto plano
app.use(cors()); // Habilitar CORS para todas las rutas

// Ruta para analizar y devolver HTML
app.post('/analizar-html', (req, res) => { // Cambiar por la ruta correcta 
    const entrada = req.body; // Texto recibido
    console.log('Texto recibido para análisis:', entrada); // Mostrar el texto recibido en consola

    try {
        // Realizar el análisis
        const analizador = new AnalizadorLexico(entrada); // Crear instancia del analizador léxico
        analizador.analizar(); // Realizar análisis léxico
        
        const tokenssintactico = analizador.getTokens(); // Obtener los tokens
        const analizadorSintactico = new AnalizadorSintactico(tokenssintactico, entrada); // Crear instancia del analizador sintáctico
        analizadorSintactico.analizar(); // Realizar análisis sintáctico

        const tokens = tokenssintactico; // Obtener los tokens
        const errores = analizadorSintactico.getErrores(); // Obtener los errores sintácticos
        const erroresLexicos = analizadorSintactico.getErroresLexicos(); // Obtener los errores léxicos
        

        // Generar el HTML como string
        let html = `<html><head><title>Resultados</title></head><body>`;
        html += `<h1>Tokens</h1><ul>`;
        html += `<h2>TIPO | LEXEMA | FILA | COLUMNA | DESCRIPCION</h2><ul>`;
        tokens.forEach((tokens, index) => {
            html += `<li>${index + 1}| ${tokens.tipo} | ${tokens.lexema} | ${tokens.fila} | ${tokens.columna} | ${tokens.descripcion}</li>`;
        });
        html += `</ul><h1>Errores sintacticos</h1><ul>`;
        errores.forEach((errores) => {
            html += `<li>${errores.tipo} | ${errores.lexema} | ${errores.fila} | ${errores.columna} | ${errores.descripcion}</li>`;
        });
        html += `</ul></body></html>`;
        html += `<h1>Errores Lexicos</h1><ul>`;
        erroresLexicos.forEach((erroresLexicos) => {
            html += `<li>${erroresLexicos.tipo} | ${erroresLexicos.lexema} | ${erroresLexicos.fila} | ${erroresLexicos.columna} | ${erroresLexicos.descripcion}</li>`;
        });
        html += `</ul></body></html>`;

        res.json({
            status: 'success',
            html,
        });
    } catch (error) {
        console.error('Error durante el análisis:', error); // Mostrar errores en consola

        res.status(500).json({ // Enviar respuesta de error
            status: 'error', // Estado de la respuesta
            message: 'Error durante el análisis', // Mensaje de error
            error: error.message, // Mensaje de error detallado
        });
    }
});

// Función para analizar un archivo
function analizarArchivo(entrada) { // Cambiar por la ruta correcta 
    const analizador = new AnalizadorLexico(entrada); // Crear instancia del analizador léxico
    analizador.analizar(); // Realizar análisis léxico
    analizador.imprimirTablaTokens(); // Imprimir tabla de tokens

    console.log('Análisis Léxico Finalizado');

    console.log('Análisis Sintáctico Iniciado');
    const tokens = analizador.getTokens(); // Obtener los tokens del analizador léxico
    const analizadorSintactico = new AnalizadorSintactico(tokens, entrada); // Crear instancia del analizador sintáctico
    analizadorSintactico.analizar(); // Realizar análisis sintáctico 
    console.log('Análisis Sintáctico Finalizado');
}

// Iniciar servidor
const PORT = 5000; // Puerto del servidor
app.listen(PORT, () => { // Iniciar
    console.log(`Servidor corriendo en http://localhost:${PORT}`); // Mostrar mensaje en consola
});