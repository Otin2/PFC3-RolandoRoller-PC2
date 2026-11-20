// ============================================================
// CONTENIDO EDITABLE DE LA LANDING
// Textos de marketing y fotos de la página de inicio.
// El día del examen se reemplazan por los del caso.
// Fotos: Unsplash (licencia gratuita, se pueden usar sin pagar).
// ============================================================

const unsplash = (id: string, ancho = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${ancho}&q=75`;

export const fotos = {
  hamburguesaLechuga: unsplash("1568901346375-23c9450c58cd"),
  hamburguesaQueso: unsplash("1607013251379-e6eecfffe234"),
  hamburguesaPapas: unsplash("1551782450-a2132b4ba21d"),
  hamburguesaDoble: unsplash("1572802419224-296b0aeee0d9"),
  hamburguesaMadera: unsplash("1571091718767-18b5b1457add"),
  hamburguesaBandeja: unsplash("1550547660-d9450f859349"),
  hamburguesaFlotante: unsplash("1633424234673-c8cd0f4df77b"),
  hamburguesaBlanca: unsplash("1549611016-3a70d82b5040"),
  hamburguesaPapel: unsplash("1606392340576-c31a40313caa"),
  hamburguesas: unsplash("1565299507177-b0ac66763828"),
  papasLimon: unsplash("1556403806-90f55c9db1e1"),
  parrilla: unsplash("1603088549155-6ae9395b928f"),
  sandwich: unsplash("1440427810006-0e4109fd4abe"),
  mesaComida: unsplash("1681038560284-58214f7ea0ac"),
  bowl: unsplash("1545984929-f28d9e323a00"),
};

// Fotos que se van turnando en las tarjetas de productos (sin foto propia en la BD)
export const fotosProductos = [
  fotos.hamburguesaBlanca,
  fotos.hamburguesaQueso,
  fotos.hamburguesaDoble,
  fotos.hamburguesaPapel,
  fotos.hamburguesaLechuga,
  fotos.hamburguesaMadera,
  fotos.hamburguesaBandeja,
  fotos.hamburguesaFlotante,
];

// ---------- 1) HERO ----------
export const hero = {
  antetitulo: "Lo nuevo en [CASO]",
  linea1: "[CASO]",
  linea2: "(hecho fácil)",
  sticker: "¡wow!",
  fotoCentral: fotos.hamburguesaFlotante,
  // 4 fotos que flotan en las esquinas
  fotosEsquinas: [fotos.mesaComida, fotos.bowl, fotos.parrilla, fotos.hamburguesaPapas],
};

// ---------- 2) CARRUSEL (si la BD aún no tiene datos, se muestran estos de ejemplo) ----------
export const ejemplosCarrusel = {
  aviso: "Ejemplos: se reemplazan solos cuando haya datos en la base de datos.",
  grupos: [
    {
      nombre: "Clásicas",
      items: ["Hamburguesa clásica", "Doble con queso", "Con papas", "De la casa"],
    },
    { nombre: "Especiales", items: ["Parrillera", "BBQ ahumada", "Picante"] },
    { nombre: "Combos", items: ["Combo familiar", "Combo para dos"] },
  ],
};

// ---------- 3) INSPIRACIÓN (pestañas en píldora) ----------
export const inspiracion = {
  titulo: "¿Buscas ideas? Aquí tienes.",
  pestanas: [
    {
      nombre: "Favoritas",
      antetitulo: "Sorprende a todos en",
      titulo: "La reunión",
      tarjetas: [
        { etiqueta: "Fácil", titulo: "Mesa para compartir", foto: fotos.mesaComida, datos: ["4 porciones", "13 ingredientes", "Muy fácil"] },
        { etiqueta: "Parrilla", titulo: "Brochetas a la brasa", foto: fotos.parrilla, datos: ["4 porciones", "11 ingredientes", "Muy fácil"] },
      ],
    },
    {
      nombre: "Hamburguesas",
      antetitulo: "Hamburguesa,",
      titulo: "Te presento a tu boca",
      tarjetas: [
        { etiqueta: "Reto en casa", titulo: "La hamburguesa suprema", foto: fotos.hamburguesaDoble, datos: ["4 porciones", "22 ingredientes", "Intermedio"] },
        { etiqueta: "Fácil", titulo: "Mini hamburguesas", foto: fotos.hamburguesas, datos: ["6 porciones", "12 ingredientes", "Muy fácil"] },
      ],
    },
    {
      nombre: "Rápidas",
      antetitulo: "¿Muy impaciente?",
      titulo: "Perfecto",
      tarjetas: [
        { etiqueta: "Fácil", titulo: "Sándwich express", foto: fotos.sandwich, datos: ["2 porciones", "8 ingredientes", "Muy fácil"] },
        { etiqueta: "Antojo", titulo: "Papas con limón", foto: fotos.papasLimon, datos: ["3 porciones", "5 ingredientes", "Muy fácil"] },
      ],
    },
  ],
};

// ---------- 4) MISIÓN ----------
export const mision = {
  linea1: "Nuestra",
  linea2: "Misión",
  sticker: "gran cambio",
  texto:
    "Queremos que [actor 1] y [actor 2] se encuentren en un solo lugar, con información clara, precios reales y datos seguros. La forma de resolver el problema de [CASO] es hacerlo simple para todos.",
  autor: "[Nombre], fundador de [CASO]",
  pestanas: [
    {
      nombre: "Datos reales",
      titulo: "Todo lo que ves sale directo de la base de datos: stock, precios y pedidos en tiempo real.",
      texto: "Nada de datos inventados. Cada registro tiene dueño y queda guardado con su historial.",
      boton: "Ver catálogo",
    },
    {
      nombre: "Seguridad",
      titulo: "Cada rol solo ve y modifica lo suyo, aunque alguien intente llamar a la API directamente.",
      texto: "Usamos Row Level Security en PostgreSQL, validación con Zod y cabeceras de seguridad en cada respuesta.",
      boton: "Crear cuenta",
    },
    {
      nombre: "Rapidez",
      titulo: "Desplegado en la región São Paulo para tener la menor latencia posible desde Lima.",
      texto: "HTTPS automático, CDN y un pipeline que prueba cada cambio antes de publicarlo.",
      boton: "Ver catálogo",
    },
    {
      nombre: "Para todos",
      titulo: "Diseñado para el celular primero, porque así trabajan [actor 1] y [actor 2].",
      texto: "Pantallas simples, botones grandes y mensajes claros cuando algo sale mal.",
      boton: "Crear cuenta",
    },
  ],
  fotoPestanas: fotos.hamburguesaLechuga,
};

// ---------- 5) PREGUNTAS FRECUENTES ----------
export const preguntas = {
  linea1: "Preguntas",
  linea2: "Frecuentes",
  texto: "Respondemos lo que más nos preguntan sobre [CASO].",
  items: [
    {
      pregunta: "¿Qué es [CASO]?",
      respuesta:
        "Es una plataforma web donde [actor 2] registra su [entidad principal] y publica [entidad hija], y [actor 1] puede buscarlos y hacer [transacciones] en línea.",
    },
    {
      pregunta: "¿Cuánto cuesta registrarse?",
      respuesta: "Registrarse es gratis. Solo necesitas un correo y una contraseña de al menos 6 caracteres.",
    },
    {
      pregunta: "¿Mis datos están seguros?",
      respuesta:
        "Sí. Cada usuario solo puede ver y modificar su propia información gracias a las políticas de seguridad de la base de datos (Row Level Security).",
    },
  ],
  pie: "¿Aún tienes preguntas?",
  pieTexto: "Escríbenos y te ayudamos.",
};

// ---------- 6) LOCALIZADOR ----------
export const localizador = {
  antetitulo: "Busca",
  titulo: "Cerca de ti",
  texto: "¿Dónde está lo que buscas? El catálogo lo sabe. Encuentra cada [entidad hija] y la [entidad principal] que lo vende.",
  boton: "Ir al catálogo",
};

// ---------- 7) SUSCRIPCIÓN ----------
export const suscripcion = {
  titulo: "Crea tu cuenta y entérate primero de todo lo nuevo en [CASO]",
  boton: "Registrarme",
  campo: "Empieza gratis en menos de un minuto",
};
