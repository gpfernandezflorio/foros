Mila.Modulo({
  define:"FOROS",
  usa:['$milascript/pantalla/todo','$milascript/base','$milascript/objeto','$milascript/archivo']
});

FOROS.contenido = [];

FOROS.panelDesplegable = function(nombre, elementos, f, atributos={}) {
  const i = FOROS.contenido.length;
  const fDesplegable = function() {
    if (FOROS.contenido[i].panelInterno.desplegado()) {
      FOROS.contenido[i].panelInterno.Plegar();
      FOROS.contenido[i].panelExterno.CambiarColorFondoA_("#0000");
    } else {
      FOROS.contenido[i].panelInterno.Desplegar();
      FOROS.contenido[i].panelExterno.CambiarColorFondoA_("#bb8a");
    }
  };
  FOROS.contenido.push({});
  FOROS.contenido[i].panelInterno = Mila.Pantalla.nuevoPanelDesplegable(function() {
    return elementos.transformados(f).snoc(Mila.Pantalla.nuevoBoton({texto:"Cerrar",funcion:fDesplegable,colorFondo:"#fff",margenExterno:Mila.Geometria.rectanguloEn__De_x_(20,20,0,0)}));
  });
  FOROS.contenido[i].panelExterno = Mila.Pantalla.nuevoPanel(Object.assign({elementos:[
    Mila.Pantalla.nuevoPanel({elementos:[Mila.Pantalla.nuevoBoton({texto:"+",funcion:fDesplegable}),Mila.Pantalla.nuevaEtiqueta({texto:nombre,margenExterno:2})],
      disposicion:"Horizontal", colorFondo:"#fff", cssAdicional:{"border-radius":"5px"},
      margenExterno:5
    }),
    FOROS.contenido[i].panelInterno
  ],alto:"Minimizar"}, atributos));
  return FOROS.contenido[i].panelExterno;
};

FOROS.panelParaForo = function(foro) {
  return FOROS.panelDesplegable(foro.nombre, foro.posts, FOROS.panelParaPost, {grosorBorde:1,colorBorde:"#aaa",margenExterno:5, cssAdicional:{"border-radius":"5px"}});
};

FOROS.panelParaPost = function(post) {
  return Mila.Pantalla.nuevaEtiqueta({texto:post.mensaje,
    grosorBorde:1,colorBorde:"#666",margenExterno:2,colorFondo:"#fff",margenInterno:6,
    cssAdicional:{"textAlign":"left","textWrapMode":"wrap","border-radius":"5px"}
  });
}

FOROS.MostrarForo = function(contenido,nombre) {
  let json = JSON.parse(contenido);
  Mila.Pantalla.nueva({
    elementos:[
      FOROS.panelSuperior(nombre),
      FOROS.panelPrincipal(json)
    ]
  },nombre);
};

FOROS.panelSuperior = function(actual) {
  return Mila.Pantalla.nuevoPanel({elementos:
    FOROS.FILES.transformados(function(nombre){
      return nombre == actual
        ? Mila.Pantalla.nuevaEtiqueta({texto:actual,margenExterno:5})
        : Mila.Pantalla.nuevoBoton({texto:nombre,funcion:function(){FOROS.CargarArchivo(nombre)}});
    }).concatenadaCon_([
      Mila.Pantalla.nuevoBoton({texto:"abrir",funcion:FOROS.AbrirLocal,
        margenExterno:Mila.Geometria.rectanguloEn__De_x_(10,0,10,0)
      }),
      Mila.Pantalla.nuevoBoton({texto:"importar",funcion:FOROS.Importar
      })
  ]), alto:"Minimizar", disposicion:"Horizontal"});
};

FOROS.panelPrincipal = function(json) {
  return Mila.Pantalla.nuevoPanel({elementos:json.transformados(FOROS.panelParaForo)});
};

FOROS.Importar = function() {
};

FOROS.AbrirLocal = function() {
  Mila.Archivo.SolicitarArchivoYLuego_(function(nombreArchivo, contenido) {
    if (FOROS.FILES.contieneA_(nombreArchivo)) {
      FOROS.FILES.SacarPrimeraAparicionDe_(nombreArchivo);
      if (nombreArchivo in Mila.Pantalla._pantallas) {
        if (Mila.Pantalla._pantallaActual.esAlgo() && Mila.Pantalla._pantallaActual.esIgualA_(nombreArchivo)) {
          Mila.Pantalla._pantallas[Mila.Pantalla._pantallaActual].QuitarDelHtml();
          Mila.Pantalla._pantallaActual = Mila.Nada;
        }
        delete Mila.Pantalla._pantallas[nombreArchivo];
      }
    }
    FOROS.FILES.Agregar_AlFinal(nombreArchivo);
    FOROS.MostrarForo(contenido,nombreArchivo);
    Mila.Pantalla.CambiarA_(nombreArchivo);
  })
};

FOROS.CargarArchivo = function(nombreArchivo) {
  if (!(nombreArchivo in Mila.Pantalla._pantallas)) {
    Mila.Archivo.AbrirArchivo_YLuego_(nombreArchivo, function(resultado) {
      if ('error' in resultado) {
        Mila.Error(resultado.error);
      } else {
        FOROS.MostrarForo(resultado.contenido,nombreArchivo);
        Mila.Pantalla.CambiarA_(nombreArchivo);
      }
    });
  } else {
    Mila.Pantalla.CambiarA_(nombreArchivo);
  }
};

FOROS.FILES = ["Ejemplo.json"
  // "InPr-2021-s1.json",
  // "InPr-2022-s1.json",
  // "InPr-2023-s1.json",
  // "InPr-2023-s2.json",
  // "InPr-2024-s1.json",
  // "InPr-2024-s2.json"
];

Mila.alIniciar(function() {
  if (!Mila.entorno().enNavegador()) {
    Mila.Error("Este script se tiene que ejecutar en el navegador.");
  } else {
    let nombreArchivo = FOROS.FILES[0];
    FOROS.CargarArchivo(nombreArchivo);
  }
});