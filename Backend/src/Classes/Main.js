const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Importar módulos personalizados
const AnalizadorLexico = require('./AnalizadorLexico');
const AnalizadorSintactico = require('./AnalizadorSintactico');
const Resultados = require('./Resultados');
const CrearGraficas = require('./CrearGraficas');
const ExtraerDatos = require('./ExtraerDatos');

// Configuración del servidor
const app = express();
app.use(express.text()); // Middleware para recibir texto plano
app.use(cors()); // Habilitar CORS para todas las rutas

// Ruta para analizar y devolver HTML
app.post('/analizar-html', (req, res) => {
    const entrada = req.body; // Texto recibido
    console.log('Texto recibido para análisis:', entrada);

    try {
        // Realizar el análisis
        const analizador = new AnalizadorLexico(entrada);
        analizador.analizar();
        
        const tokenssintactico = analizador.getTokens();
        const analizadorSintactico = new AnalizadorSintactico(tokenssintactico, entrada);
        analizadorSintactico.analizar();

        const tokens = tokenssintactico;
        const errores = analizadorSintactico.getErrores();
        const erroresLexicos = analizadorSintactico.getErroresLexicos();
        

        // Generar el HTML como string
        let html = `<html><head><title>Resultados</title></head><body>`;
        html += `<h1>Tokens</h1><ul>`;
        html += `<h2>TIPO | LEXEMA | FILA | COLUMNA | DESCRIPCION</h2><ul>`;
        tokens.forEach((tokens, index) => {
            html += `<li>${index + 1}| ${tokens.tipo} | ${tokens.lexema} | ${tokens.fila} | ${tokens.columna} | ${tokens.descripcion}</li>`;
        });
        html += `</ul><h1>Errores sintacticos</h1><ul>`;
        errores.forEach((errores) => {
            html += `<li>${index + 1}|${errores.tipo} | ${errores.lexema} | ${errores.fila} | ${errores.columna} | ${errores.descripcion}</li>`;
        });
        html += `</ul></body></html>`;
        html += `<h1>Errores Lexicos</h1><ul>`;
        erroresLexicos.forEach((erroresLexicos) => {
            html += `<li>${index + 1}|${erroresLexicos.tipo} | ${erroresLexicos.lexema} | ${erroresLexicos.fila} | ${erroresLexicos.columna} | ${erroresLexicos.descripcion}</li>`;
        });
        html += `</ul></body></html>`;

        res.json({
            status: 'success',
            html,
        });
    } catch (error) {
        console.error('Error durante el análisis:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error durante el análisis',
            error: error.message,
        });
    }
});

// Función para analizar un archivo
function analizarArchivo(entrada) {
    const analizador = new AnalizadorLexico(entrada);
    analizador.analizar();
    analizador.imprimirTablaTokens();

    console.log('Análisis Léxico Finalizado');

    console.log('Análisis Sintáctico Iniciado');
    const tokens = analizador.getTokens();
    const analizadorSintactico = new AnalizadorSintactico(tokens, entrada);
    analizadorSintactico.analizar();
    console.log('Análisis Sintáctico Finalizado');
}

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});