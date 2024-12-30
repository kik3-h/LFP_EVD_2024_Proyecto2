import React, { useState } from 'react';
import axios from 'axios'; // Importar Axios
import './Component.css';

export default function Component() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState(''); // Cambiar por un objeto vacío
  const [resultadoTokens, setResultadoTokens] = useState([]); 
  const [erroresSintacticos, setErroresSintacticos] = useState([]);
  const [erroresLexicos, setErroresLexicos] = useState([]);

  const analizarTexto = async () => { // Función para analizar el texto ingresado
    try {
        // Enviar el texto al servidor para análisis y generación de HTML
        const response = await axios.post('http://localhost:5000/analizar-html', texto, { // Cambiar la URL por la correcta
            headers: { 'Content-Type': 'text/plain' },
        });

        if (response.data.status === 'success') {
            // Mostrar el HTML generado en el área de resultados
            setResultado(response.data.html);
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(response.data.html, 'text/html');
             // Extraer Tokens
        const tokens = Array.from(htmlDoc.querySelectorAll('ul:nth-of-type(1) li')).map((li) =>
            li.textContent.split(' | ')
          );
  
          // Extraer Errores Sintácticos
          const erroresSint = Array.from(htmlDoc.querySelectorAll('ul:nth-of-type(2) li')).map((li) =>
            li.textContent.split(' | ')
          );
  
          // Extraer Errores Léxicos
          const erroresLex = Array.from(htmlDoc.querySelectorAll('ul:nth-of-type(3) li')).map((li) =>
            li.textContent.split(' | ') )

        setResultadoTokens(tokens);
        setErroresSintacticos(erroresSint);
        setErroresLexicos(erroresLex);
        } else {
            setResultado('Error al analizar el código.');
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        setResultado('Error al conectar con el servidor.');
    }
};


  const limpiarTexto = () => {
    setTexto('');
    setResultado('');
    setResultadoTokens([]);
    setErroresSintacticos([]);
    setErroresLexicos([]);   

  };

  const cargarTexto = async () => {
    // Implementación para cargar un archivo desde el sistema
    const archivo = document.createElement('input');
    archivo.type = 'file';
    archivo.accept = '.txt,.nlex';
    archivo.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setTexto(e.target.result);
      };
      reader.readAsText(file);
    };
    archivo.click();
  };

  const guardar = () => {
    const blob = new Blob([texto], { type: 'text/plain' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'archivo.nlex';
    enlace.click();
  };

  const guardarComo = () => {
    const extension = prompt('Ingresa la extensión y nombre del archivo (ej: .txt, .nlex):');
    if (extension) {
      const blob = new Blob([texto], { type: 'text/plain' });
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.download = `archivo${extension}`;
      enlace.click();
    }
  };

  return (
    <div className="titulo-container">
      <div className="titulo">NodeLex by kik3-h       Proyecto 2 LFP </div>
      <div className="editor-container">
        <textarea
          className="texto-editable"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="INGRESA TU CODIGO AQUI..."
        ></textarea>
        <textarea
          className="texto-no-editable"
          value={resultado}
          readOnly
          placeholder="Resultados deberian de aparecer aquí XD..."
        ></textarea>
      </div>
      <div className="botones-container">
        <button className="btn-analizar" onClick={analizarTexto}>
          Analizar Código
        </button>
        <button className="btn-limpiar" onClick={limpiarTexto}>
          Limpiar
        </button>
        <button className="btn-cargar" onClick={cargarTexto}>
          Cargar Archivo
        </button>
        <button className="btn-guardar" onClick={guardar}>
          Guardar
        </button>
        <button className="btn-guardar" onClick={guardarComo}>
          Guardar Como
        </button>

      </div>

      <div className="resultados">
        <h2>Tabla de Tokens</h2>
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Lexema</th>
              <th>Fila</th>
              <th>Columna</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {resultadoTokens.map((token, index) => (
              <tr key={index}>
                {token.map((col, i) => (
                  <td key={i}>{col}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Errores Sintácticos</h2>
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Lexema</th>
              <th>Fila</th>
              <th>Columna</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {erroresSintacticos.map((error, index) => (
              <tr key={index}>
                {error.map((col, i) => (
                  <td key={i}>{col}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Errores Léxicos</h2>
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Lexema</th>
              <th>Fila</th>
              <th>Columna</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {erroresLexicos.map((error, index) => (
              <tr key={index}>
                {error.map((col, i) => (
                  <td key={i}>{col}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
