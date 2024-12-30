const fs = require('fs');
const { exec } = require('child_process');

class CrearGrafica {
    constructor(datosOperaciones, datosConfiguracionesLex) { // Constructor de la clase CrearGrafica
        this.operaciones = datosOperaciones.operaciones || []; // Inicializar operaciones con datosOperaciones.operaciones o un arreglo vacío
        this.configuracionesLex = datosConfiguracionesLex && datosConfiguracionesLex[0]  // Inicializar configuracionesLex con datosConfiguracionesLex[0] o un objeto con valores por defecto
            ? { // Aplicar configuracionesLex si existen en el archivo de configuración de NodeLex sino xd
                fondo: datosConfiguracionesLex[0].fondo || "#ffffff",
                fuente: datosConfiguracionesLex[0].fuente || "#000000", // Valores por defecto
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
        const { fondo, fuente, forma, tipoFuente } = this.configuracionesLex; // Desestructurar configuracionesLex

        dot += `  graph [bgcolor="${fondo}"];\n`;
        dot += `  node [shape=${forma}, style=filled, fillcolor="${fondo}", fontcolor="${fuente}", fontname="${tipoFuente}"];\n`; // Aplicar configuracionesLex a los nodos del grafo

        let contador = 0;

        // Función recursiva para crear nodos
        const crearNodos = (operacion, parent = null) => { // Función para crear nodos
            contador++;
            const nodoId = `n${contador}`; // Crear un ID único para el nodo
            const etiqueta = `${operacion.operacion} ${operacion.nombre || ""}`; // Crear etiqueta para el nodo
            dot += `  ${nodoId} [label="${etiqueta}"];\n`; // Agregar nodo al DOT

            if (parent) {
                dot += `  ${parent} -> ${nodoId};\n`; // Agregar conexión entre el nodo actual y su padre
            }

            // Agregar nodos para valor1
            if (operacion.valor1 !== undefined) {   // Agregar nodos para valor1 si es diferente de indefinido 
                contador++;
                const valor1NodoId = `n${contador}`;
                dot += `  ${valor1NodoId} [label="${operacion.valor1}"];\n`; // Agregar nodo para valor1 con su valor
                dot += `  ${nodoId} -> ${valor1NodoId};\n`; // Agregar conexión entre el nodo actual y el nodo de valor1 
            }

            // Agregar nodos para valor2
            if (Array.isArray(operacion.valor2)) { // Agregar nodos para valor2 si es un arreglo    
                operacion.valor2.forEach(subOperacion => { // Recorrer cada subOperación de valor2 
                    crearNodos(subOperacion, nodoId); // Llamar a la función recursiva para crear nodos con la subOperación y el nodo actual
                });
            } else if (operacion.valor2 !== undefined) { // Agregar nodos para valor2 si es diferente de indefinido
                contador++;
                const valor2NodoId = `n${contador}`;
                dot += `  ${valor2NodoId} [label="${operacion.valor2}"];\n`; // Agregar nodo para valor2 con su valor
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
        exec(`dot -Tpng ${rutaDot} -o ${rutaImagen}`, (error, stdout, stderr) => { // Generar la imagen con Graphviz y ejecutar el comando
            if (error) {
                console.error(`Error al generar la imagen: ${error.message}`); // Mostrar mensaje de error si ocurre un error
                return;
            }
            if (stderr) {
                console.error(`Graphviz stderr: ${stderr}`); // Mostrar mensaje de error de Graphviz si ocurre un error
            } else {
                console.log(`Imagen generada exitosamente en ${rutaImagen}`);
            }
        });
    }

    generarImagenArbol(dotFileName, pngFileName) { // Función para generar una imagen del árbol de tokens
 
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
    
        crearArbolTokens(dotFileName, tokens) { // Función para crear un árbol de tokens en formato DOT
            let dot = 'digraph ArbolTokens {\n'; // Encabezado de DOT
            dot += '    rankdir=TB;\n'; // Dirección de arriba a abajo
            dot += '    node [shape=circle, fontname="Arial"];\n';
        
            let nodeId = 0; // ID de nodo
            const crearNodo = (label) => { // Función para crear un nodo con una etiqueta
                const id = `node${nodeId++}`; // Crear un ID único para el nodo
                dot += `    ${id} [label="${label}"];\n`; // Agregar nodo al DOT
                return id;
            };
        
            const agregarConexion = (padre, hijo) => { // Función para agregar una conexión entre nodos
                dot += `    ${padre} -> ${hijo};\n`; // Agregar conexión entre el nodo padre y el nodo hijo
            };
        
            // Nodo raíz
            const rootId = crearNodo("Tokens"); // Crear nodo raíz con la etiqueta "Tokens"
        
            // Construir árbol basado en tokens
            for (const token of tokens) {
                const tokenId = crearNodo(`${token.getTipo()}: ${token.getValor()}`); // Crear nodo para el token con su tipo y valor
                agregarConexion(rootId, tokenId); // Agregar conexión entre el nodo raíz y el nodo del token
            }
        
            dot += '}\n';
        
            // Guardar archivo DOT
            const fs = require('fs'); // Importar módulo fs
            fs.writeFileSync(dotFileName, dot); // Escribir archivo DOT
            console.log(`Archivo DOT del árbol de tokens generado: ${dotFileName}`); // Mostrar mensaje de éxito
        }
        

}

module.exports = CrearGrafica; // Exportar la clase CrearGrafica
