const fs = require('fs');
const { exec } = require('child_process');

class CrearArbol {
    constructor(tokens, datosConfiguracionesLex) {
        this.tokens = tokens; // Lista de tokens analizados
        this.configuracionesLex = (datosConfiguracionesLex.configuaracionesLex || [])[0] || {};
    }

    generarArbolBNF(dotFileName) {
        let dot = 'digraph ArbolBNF {\n';
        dot += '    rankdir=TB;\n'; // Dirección de arriba hacia abajo

        // Configuraciones visuales personalizadas
        const fondo = this.configuracionesLex.fondo || "#ffffff";
        const fuente = this.configuracionesLex.fuente || "#000000";
        const forma = this.configuracionesLex.forma || "ellipse";
        const tipoFuente = this.configuracionesLex.tipoFuente || "Arial";

        dot += `  graph [bgcolor="${fondo}"];\n`;
        dot += `  node [shape=${forma}, style=filled, fillcolor="${fondo}", fontcolor="${fuente}", fontname="${tipoFuente}"];\n`;

        let nodeId = 0; // Contador para nodos únicos

        // Función para crear un nodo único en el archivo DOT
        const crearNodo = (label, value = "") => {
            const safeLabel = (label || "SinEtiqueta").replace(/"/g, '\\"'); // Escapar comillas dobles
            const safeValue = (value || "").replace(/"/g, '\\"');
            const id = `node${nodeId++}`;
            const nodeLabel = value ? `${safeLabel}\\n(${safeValue})` : safeLabel;
            dot += `    ${id} [label="${nodeLabel}"];\n`;
            return id;
        };

        // Función para conectar dos nodos
        const agregarConexion = (padre, hijo) => {
            dot += `    ${padre} -> ${hijo};\n`; // Conectar nodos en el árbol de derivación
        };

        // Construir el árbol basándose en las reglas del BNF
        const construirArbol = (produccion, padreId) => {
            // Nodo raíz para la producción actual
            const nodoProduccion = crearNodo(produccion.tipo, produccion.valor);
            agregarConexion(padreId, nodoProduccion);

            // Procesar los valores de la producción
            if (produccion.valores) {
                for (const valor of produccion.valores) {
                    if (typeof valor === 'string') {
                        // Es un valor terminal
                        const nodoValor = crearNodo("Valor", valor);
                        agregarConexion(nodoProduccion, nodoValor);
                    } else if (typeof valor === 'object' && valor.tipo) {
                        // Es una subproducción, procesarla recursivamente
                        construirArbol(valor, nodoProduccion);
                    } else {
                        console.warn(`Valor inesperado: ${valor}`);
                    }
                }
            }
        };

        // Nodo raíz general
        const rootId = crearNodo("Inicio");

        // Generar las producciones de las configuraciones
        const configuracionesId = crearNodo("Configuraciones");
        agregarConexion(rootId, configuracionesId);

        for (const token of this.tokens.filter(t => t.getTipo() === "CONFIGURACION")) {
            const produccion = this.procesarToken(token);
            construirArbol(produccion, configuracionesId);
        }

        // Generar las producciones de las operaciones
        const operacionesId = crearNodo("Operaciones");
        agregarConexion(rootId, operacionesId);

        for (const token of this.tokens.filter(t => t.getTipo() === "OPERACION")) {
            this.avanzarToken();
            const produccion = this.procesarToken(token);
            construirArbol(produccion, operacionesId);
        }

        dot += '}\n';

        // Guardar el contenido del archivo DOT
        fs.writeFileSync(dotFileName, dot);
        console.log(`Archivo DOT del árbol de derivación generado: ${dotFileName}`);
    }

    procesarToken(token) {
        // Convertir un token a una producción BNF
        switch (token.getTipo()) {
            case "OPERACION":
                //usar el metodo avanzarToken con un for 6 veces
                return {
                    tipo: "Operacion",
                    valores: [
                        { tipo: "TipoOperacion", valores: [token.getValor()] },
                        { tipo: "Nombre", valores: ["Identificador"] },
                        { tipo: "Valor1", valores: [token.getValor()] },
                        { tipo: "Valor2", valores: ["Numero"] }
                    ]
                };
            case "KEYWORD":
                if (token.getValor() === "generarReporte") {
                    return {
                        tipo: "GenerarReporte",
                        valores: [
                            { tipo: "TipoReporte", valores: [token.getValor()] }
                        ]
                    };
                } else {
                    return {
                        tipo: "PalabraReservada",
                        valores: [token.getValor()]
                    };
                }
            case "CADENA":
                return {
                    tipo: "Cadena",
                    valores: [token.getValor()]
                };
            case "CONFIGURACION":
                return {
                    tipo: "Configuracion",
                    valores: [
                        { tipo: "Clave", valores: ["Identificador"] },
                        { tipo: "Valor", valores: [token.getValor()] }
                    ]
                };
            case "NUMERO_ENTERO":
                return {
                    tipo: "Numero",
                    valores: [token.getValor()]
                };
            case "NUMERO_DECIMAL":
                return {
                    tipo: "Numero",
                    valores: [token.getValor()]
                };
            default:
                return {
                    tipo: token.getTipo(),
                    valores: [token.getValor()]
                };
        }
    }

    generarImagen(dotFileName, pngFileName) {
        exec(`dot -Tpng ${dotFileName} -o ${pngFileName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al generar la imagen: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Graphviz stderr: ${stderr}`);
            } else {
                console.log(`Imagen generada exitosamente en ${pngFileName}`);
            }
        });
    }

    //metodos para avanar un token mas adelante
    avanzarToken() {
        this.tokenActual = this.tokens.shift();
    }

    //metodo para obtener el token actual
    obtenerTokenActual() {
        return this.tokenActual;
    }
}

module.exports = CrearArbol;
