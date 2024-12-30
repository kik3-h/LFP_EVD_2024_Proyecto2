const fs = require('fs');
const { exec } = require('child_process');

class CrearGrafica {
    constructor(datosOperaciones, datosConfiguracionesLex) {
        this.operaciones = datosOperaciones.operaciones || [];
        this.configuracionesLex = datosConfiguracionesLex && datosConfiguracionesLex[0] 
            ? { // Aplicar configuracionesLex si existen en el archivo de configuración de NodeLex sino xd
                fondo: datosConfiguracionesLex[0].fondo || "#ffffff",
                fuente: datosConfiguracionesLex[0].fuente || "#000000",
                forma: datosConfiguracionesLex[0].forma || "ellipse",
                tipoFuente: datosConfiguracionesLex[0].tipoFuente || "Arial",
            }
            : {
                fondo: "#ffffff",
                fuente: "#000000",
                forma: "ellipse",
                tipoFuente: "Arial",
            };
    }
    
    generarDot() {
        let dot = `digraph Operaciones {\n`;

         // Aplicar configuracionesLex
        const { fondo, fuente, forma, tipoFuente } = this.configuracionesLex;

        dot += `  graph [bgcolor="${fondo}"];\n`;
        dot += `  node [shape=${forma}, style=filled, fillcolor="${fondo}", fontcolor="${fuente}", fontname="${tipoFuente}"];\n`;

        let contador = 0;

        // Función recursiva para crear nodos
        const crearNodos = (operacion, parent = null) => {
            contador++;
            const nodoId = `n${contador}`;
            const etiqueta = `${operacion.operacion} ${operacion.nombre || ""}`;
            dot += `  ${nodoId} [label="${etiqueta}"];\n`;

            if (parent) {
                dot += `  ${parent} -> ${nodoId};\n`;
            }

            // Agregar nodos para valor1
            if (operacion.valor1 !== undefined) {
                contador++;
                const valor1NodoId = `n${contador}`;
                dot += `  ${valor1NodoId} [label="${operacion.valor1}"];\n`;
                dot += `  ${nodoId} -> ${valor1NodoId};\n`;
            }

            // Agregar nodos para valor2
            if (Array.isArray(operacion.valor2)) {
                operacion.valor2.forEach(subOperacion => {
                    crearNodos(subOperacion, nodoId);
                });
            } else if (operacion.valor2 !== undefined) {
                contador++;
                const valor2NodoId = `n${contador}`;
                dot += `  ${valor2NodoId} [label="${operacion.valor2}"];\n`;
                dot += `  ${nodoId} -> ${valor2NodoId};\n`;
            }
        };

        // Construir nodos para todas las operaciones
        this.operaciones.forEach(op => crearNodos(op));

        dot += `}`;
        return dot;
    }

    generarImagen(rutaDot, rutaImagen) {
        const dotContenido = this.generarDot();

        // Escribir el archivo DOT
        fs.writeFileSync(rutaDot, dotContenido);

        // Generar la imagen usando Graphviz
        exec(`dot -Tpng ${rutaDot} -o ${rutaImagen}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al generar la imagen: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Graphviz stderr: ${stderr}`);
            } else {
                console.log(`Imagen generada exitosamente en ${rutaImagen}`);
            }
        });
    }

    generarImagenArbol(dotFileName, pngFileName) {

        exec(`dot -Tpng ${dotFileName} -o ${pngFileName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al generar imagen: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error en Graphviz: ${stderr}`);
                return;
            }
            console.log(`Imagen generada: ${pngFileName}`);
        });
    }
    
        crearArbolTokens(dotFileName, tokens) {
            let dot = 'digraph ArbolTokens {\n';
            dot += '    rankdir=TB;\n'; // Dirección de arriba a abajo
            dot += '    node [shape=circle, fontname="Arial"];\n';
        
            let nodeId = 0;
            const crearNodo = (label) => {
                const id = `node${nodeId++}`;
                dot += `    ${id} [label="${label}"];\n`;
                return id;
            };
        
            const agregarConexion = (padre, hijo) => {
                dot += `    ${padre} -> ${hijo};\n`;
            };
        
            // Nodo raíz
            const rootId = crearNodo("Tokens");
        
            // Construir árbol basado en tokens
            for (const token of tokens) {
                const tokenId = crearNodo(`${token.getTipo()}: ${token.getValor()}`);
                agregarConexion(rootId, tokenId);
            }
        
            dot += '}\n';
        
            // Guardar archivo DOT
            const fs = require('fs');
            fs.writeFileSync(dotFileName, dot);
            console.log(`Archivo DOT del árbol de tokens generado: ${dotFileName}`);
        }
        

}

module.exports = CrearGrafica;
