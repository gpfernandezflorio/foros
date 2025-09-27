/*
  Intrucciones:
  1. Descargar el archivo de backup del curso *.mbz.
  2. Descomprimirlo.
  3. Ubicar el archivo del foro.
    a) Entrar en la carpeta descomprimida.
    b) Entrar a activities.
    c) Buscar todas las carpetas que comiencen con "forum_".
    d) Ver los archivos "forum.xml" dentro de cada una.
    e) Identificar cuál corresponde al foro de consultas (el nombre del foro aparece cerca del inicio del archivo con el tag "name").
  4. Copiar el archivo "forum.xml" fuera de la carpeta y renombrarlo según el semestre al que corresponde.
  5. Ejecutar este script sobre ese archivo.
*/

Mila.Modulo({
  usa:['$milascript/base','$milascript/archivo']
});

const discusiones = [];

RecogerForo = function(contenido,nombreArchivo) {
  let iDiscusión = contenido.indexOf("<discussions>");
  if (iDiscusión >= 0) {
    let finDiscusión = contenido.indexOf("</discussions>", iDiscusión + "<discussions>".length);
    if (finDiscusión >= 0) {
      RecogerDiscusiones(contenido.substring(iDiscusión + "<discussions>".length, finDiscusión));
    }
  }
  Mila.Archivo.Escribir_EnElArchivo_(JSON.stringify(discusiones),nombreArchivo, Mila.MostrarError);
};

RecogerDiscusiones = function(contenido) {
  let iDiscusión = contenido.indexOf("<discussion id=");
  while (iDiscusión >= 0) {
    let finDiscusión = contenido.indexOf("</discussion>", iDiscusión + "<discussion id=".length);
    if (finDiscusión >= 0) {
      RecogerDiscusión(contenido.substring(iDiscusión + "<discussion id=".length, finDiscusión));
    }
    iDiscusión = contenido.indexOf("<discussion id=", finDiscusión);
  }
};

RecogerDiscusión = function(contenido) {
  let nombre = "?";
  let iName = contenido.indexOf("<name>");
  if (iName >= 0) {
    let finName = contenido.indexOf("</name>", iName + "<name>".length);
    if (finName >= 0) {
      nombre = contenido.substring(iName + "<name>".length, finName);
    }
  }
  discusiones.push({posts:[],nombre});
  let iPost = contenido.indexOf("<posts>");
  if (iPost >= 0) {
    let finPost = contenido.indexOf("</posts>", iPost + "<posts>".length);
    if (finPost >= 0) {
      RecogerPosts(contenido.substring(iPost + "<posts>".length, finPost));
    }
  }
};

RecogerPosts = function(contenido) {
  let iPost = contenido.indexOf("<post id=");
  while (iPost >= 0) {
    let finPost = contenido.indexOf("</post>", iPost + "<post id=".length);
    if (finPost >= 0) {
      RecogerPost(contenido.substring(iPost + "<post id=".length, finPost));
    }
    iPost = contenido.indexOf("<post id=", finPost);
  }
};

RecogerPost = function(contenido) {
  let nuevoPost = {};
  let iMensaje = contenido.indexOf("<message>");
  if (iMensaje >= 0) {
    let finMensaje = contenido.indexOf("</message>", iMensaje + "<message>".length);
    if (finMensaje >= 0) {
      nuevoPost.mensaje = xmlATexto(contenido.substring(iMensaje + "<message>".length, finMensaje));
    }
  }
  discusiones.ultimo().posts.push(nuevoPost);
};

Mila.alIniciar(function() {
  if (Mila.entorno().enNavegador()) {
    Mila.Error("Este script se tiene que ejecutar en Node.");
  } else {
    const argumentos = Mila.entorno().argumentos;
    if (argumentos.lista.length == 0) {
      Mila.Error("No se pasa un archivo para compilar.");
    } else {
      const objetivo = argumentos.lista[0];
      Mila.Archivo.AbrirArchivo_YLuego_(objetivo, function(resultado) {
        if ('error' in resultado) {
          Mila.Error(resultado.error);
        } else {
          RecogerForo(resultado.contenido,objetivo.replace('.xml','.json'));
        }
      });
    }
  }
});

function xmlATexto(textoXml) {
  return textoXml
    .replaceAll(/&amp;/g, '&')
    .replaceAll(/&lt;/g, '<')
    .replaceAll(/&gt;/g, '>')
    .replaceAll(/&apos;/g, "'")
    .replaceAll(/&quot;/g, '"')
  ;
};