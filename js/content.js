/* ==========================================================================
   CONTENIDO DEL SITIO  —  aquí editas textos, fotos, videos y música
   (no necesitas tocar index.html ni main.js)
   Tip: para citar usa « » en vez de comillas dobles "".
   ========================================================================== */
window.SITE = {

  /* ---------------------------- AJUSTES ---------------------------------- */

  // true  = la pregunta inicial NO deja pasar con «Ahora no»: solo se entra con «Sí».
  // false = después de 3 insistencias suaves aparece «Entrar a mi ritmo» y entra igual, sin presión.
  forceYes: false,

  // true  = la página final «Lo que quería decirte» se abre cuando ella visite las otras 3.
  // false = está abierta desde el inicio.
  lockFinal: true,

  // Botón opcional en la página final para que te escriba por WhatsApp.
  // Número en formato internacional SIN el +, ej: "59171234567". Vacío = no se muestra el botón.
  whatsapp: "",
  whatsappTexto: "Vi tu página 🐦‍⬛",

  // Efecto de fondo por página: "petals" (pétalos rojos) o "snow" (copos de nieve)
  fx: { gate: "petals", hub: "petals", taehyung: "petals", gustos: "petals", juegos: "petals", final: "snow" },

  /* ------------------------- IMÁGENES DE FLUTTERSHY ------------------------ */
  // PNG con fondo transparente. El código les aplica un filtro rojo/gótico automáticamente.
  fluttershy: {
    happy: "assets/img/fluttershy-feliz.png",
    sad:   "assets/img/fluttershy-triste.png"
  },

  /* ------------------------------ MÚSICA ----------------------------------- */
  // Cada página tiene su canción (null = silencio). vol va de 0 a 1.
  // La portada no puede tener música: los celulares bloquean el sonido hasta el primer toque.
  // Archivos en assets/audio/ (nombres exactos):
  //   taehyung.mp3 → «Cosas que te gustan»
  //   slipknot.mp3 → «Lo que te hace ser tú»  (es música fuerte: por eso vol más bajo)
  //   ado.mp3      → «Nuestras partidas»
  //   piano.mp3    → «Lo que quería decirte»
  music: {
    hub: null,
    taehyung: { src: "assets/audio/taehyung.mp3", vol: 0.8 },
    gustos:   { src: "assets/audio/slipknot.mp3", vol: 0.55 },
    juegos:   { src: "assets/audio/ado.mp3",      vol: 0.7 },
    final:    { src: "assets/audio/piano.mp3",    vol: 0.7 }
  },

  /* --------------------- PORTADA / PREGUNTA (con Flutter) ------------------ */
  gate: {
    para: "Para ti, Jael",
    kicker: "Antes de entrar…",
    question: "¿Me dejas enseñarte algo que hice para ti?",
    yes: "Sí 🖤",
    no: "Ahora no",
    // Cada vez que toca «Ahora no», Flutter insiste con ternura (nunca con reproche).
    noSteps: [
      { q: "Flutter se asoma tímida… ¿segura?",              sub: "Es solo un ratito, y está hecho con cariño." },
      { q: "Prometo que no muerde 🥀",                        sub: "Solo quería que lo vieras tú." },
      { q: "Flutter se escondió detrás de la luna…",          sub: "Pero la puerta sigue abierta, por si cambias de idea." },
      { q: "Ok, ya. Creo que Flutter se pasó de insistente jsjs", sub: "Entra cuando quieras." }
    ],
    // Es el 4.º paso cuando forceYes es false (reemplaza al de arriba)
    noStepSoft: { q: "Está bien, sin prisa.", sub: "Entra cuando quieras; aquí te espero." },
    noFinalForce: "Sí (no tengo opción jsjs)",   // solo si forceYes es true
    noFinalSoft:  "Entrar a mi ritmo",
    soft: "Sin presión. Igual te dejo la puerta abierta 🖤",
    thanks: "Gracias 🖤 Adelante, la puerta ya está abierta."
  },

  /* ------------------------------ MAPA (hub) ------------------------------- */
  hub: {
      title: "Para ti, Jael",    intro: [
      "Hay regalos que se envuelven en papel y otros que se escriben a la luz de una vela. Este es de los segundos: lo hice porque me importa cómo estás.",
      "No hay prisa ni nada que responder. Toca las señales rojas y recórrelo a tu ritmo, como quien camina de noche por un jardín en calma."
    ],
    hintLocked: "La última puerta se abre cuando hayas cruzado las otras tres ❄️",
    hintUnlocked: "La última puerta ya está abierta ❄️",
    cards: [
      { id: "taehyung", icon: "🥀", title: "Cosas que te gustan",    sub: "lo que te late, y yo escuché" },
      { id: "gustos",   icon: "🦇", title: "Lo que te hace ser tú",  sub: "sombras, guitarras, Coraline y una pony tímida" },
      { id: "juegos",   icon: "🎮", title: "Nuestras partidas",      sub: "risas, caídas y mapaches" },
      { id: "final",    icon: "❄️", title: "Lo que quería decirte",  sub: "claveles oscuros bajo la nieve" }
    ]
  },

  /* ------------------------ COSAS QUE TE GUSTAN ---------------------------- */
  // (el id interno sigue siendo «taehyung» para no romper nada)
  taehyung: {
    topbar: "Cosas que te gustan",
    title: "Cosas que te gustan",
    subtitle: "lo que te late, y yo escuché 🥀",
    // Cambia esto por el nombre de la canción que pongas en assets/audio/taehyung.mp3
    track: { title: "Singularity", artist: "V · BTS" },
    dedication: [
      "Guardas muchos mundos a la vez, y eso es de lo que más me gusta de ti. Y aunque a veces no lo pareciera, yo siempre estuve escuchando.",
      "Como la vez que me hablaste de Taehyung, y recuerdo que tienes un llavero de el cuando tiene el cabello de rojo; o la otra vez que me contaste de tu gusto por el metal. Guardé cada palabra como se guardan las cosas pequeñas que valen mucho.",
      "No necesito entender todas las referencias para disfrutar lo contenta que te pones cuando hablas de lo que amas ^^",
      "Esta canción suena para ti 🎧"
    ],
    media: [
      { src: "assets/img/taehyung-1.jpg", caption: "Rojo, como a ti te gusta." },
      { src: "assets/img/taehyung-2.jpg", caption: "El cabello rojo, siempre." },
      { src: "assets/img/taehyung-3.jpg", caption: "" },
      // Para un video corto: { type: "video", src: "assets/video/tae.mp4", autoplay: true }
    ]
  },

  /* ------------------------------- GUSTOS ---------------------------------- */
  gustos: {
    topbar: "Lo que te hace ser tú",
    title: "Lo que te hace ser tú",
    subtitle: "cosas tuyas que me gustan mucho",
    blocks: [
      {
        deco: "gothic",
        title: "Entre el rojo y la medianoche",
        text: [
          "Tu estilo es de lo que más me gusta de ti: el rojo profundo, el negro como un abrigo de medianoche y ese cuervo 🐦‍⬛ (es un cuervo xd) que llevas hasta en el nombre del chat.",
          "No se siente actuado. Se siente tú, sumado a tu forma de ser siempre logras destacar para mi ^^ Tienes un mundo propio, y se nota en cada detalle."
        ],
        media: [
          { src: "assets/img/gotico-1.jpg", caption: "Rojo y negro." },
          { src: "assets/img/gotico-2.jpg", caption: "Es un Album que te recomiendo :3, me gusta su portada" }
        ]
      },
      {
        deco: "metal",
        title: "Guitarras en la tormenta",
        text: [
          "La otra vez me contaste de tu gusto por el metal, y desde entonces te imagino subiendo el volumen hasta que el mundo se calla y solo quedan las guitarras.",
          "También reconozco lo fuerte que eres. Y eso, lejos de alejarme, es justo lo que me gusta de ti: tu carácter, tu fuerza, que vayas al gym, que no te dejes de nada. Hay una belleza en lo que no se rompe fácil, y en ti se ve por dentro y por fuera.",
          "Y sí, también me quedó clarísimo el día que me hiciste cosquillas hasta dejarme sin costillas jsjs."
        ],
        media: [
          { src: "assets/img/rock-1.jpg", caption: "Volumen al máximo." }
        ]
      },
      {
        deco: "coraline",
        title: "Coraline, o la puerta pequeña",
        text: [
          "Y tu Coraline: ese mundo raro, oscuro y hermoso al otro lado de una puertita, tan de tu estilo.",
          "Ahora que es temporada de Halloween, podríamos verla juntos, con la luz baja y las calabazas encendidas 🎃🕸️"
        ],
        media: [
          { src: "assets/img/coraline-1.jpg", caption: "Halloween con Coraline." }
        ]
      },
      {
        deco: "kpop",
        title: "K-pop y K-dramas",
        text: [
          "Y al mismo tiempo te gustan el K-pop y hasta los K-dramas (que, según tú, cuentan como serie).",
          "No te encasillas en una sola cosa, y eso me parece muy tú: libre, curiosa y sin etiquetas, como una casa antigua con muchas habitaciones por descubrir."
        ],
        media: []   // sin imagen en este bloque
      },
      {
        deco: "pony",
        title: "Fluttershy, ternura con espinas",
        text: [
          "Suave y tímida por fuera, pero cuidado el día que se enoja: hasta la ternura tiene espinas. Por eso ella te recibió en la entrada, como guardiana de este pequeño castillo.",
          "Por cierto: te propuse ver juntos la primera temporada de My Little Pony. No era broma; la propuesta sigue en pie, esperando tu momento."
        ],
        media: [
          { src: "assets/img/pony-1.jpg", caption: "Fluttershy." }
        ]
      }
    ]
  },

  /* ------------------------------- JUEGOS ---------------------------------- */
  juegos: {
    topbar: "Nuestras partidas",
    title: "Nuestras partidas",
    subtitle: "las risas que me dejaron",
    // Etiqueta «Sonando». Cámbiala para que diga EXACTAMENTE la canción de Ado que subas a ado.mp3
    track: { title: "Show", artist: "Ado" },
    intro: [
      "Gracias por las partidas. Unas se perdieron, otras se ganaron, y en todas hubo una risa que se quedó conmigo."
    ],
    entries: [
      {
        title: "Cuando me hiciste jugar como si fuera tu perro",
        text: [
          "No olvido la vez que me hiciste jugar como si fuera tu perro jsjs. Obediente, leal y pero con cierta dignidad :,). Volvería a hacerlo, aunque sea solo por la risa."
        ],
        media: [{ src: "assets/img/juego-01.png", caption: "Buen chico xd (matame)" }]
      },
      {
        title: "El parkour con vista muy shida",
        text: [
          "Después fuimos a hacer parkour a un lugar con una vista muy shida. Entre saltos fallidos y caídas, nos reímos más de lo que avanzamos. De esas veces en que el camino importó más que la meta."
        ],
        media: [{ src: "assets/img/juego-02.png", caption: "La vista." }]
      },
      {
        title: "El juego de peleas",
        text: [
          "Y la otra vez, el juego de peleas. Sé que ahí pude ganarte jsjs aunque dudo mucho que en la vida real, pero igual lo disfruté un montón. Perder contigo también tiene su encanto."
        ],
        media: []
      },
      {
        title: "Roblox con tu Chio (y los mapaches)",
        text: [
          "Me encantó jugar Roblox contigo y con tu hermana. Siempre encuentran los minijuegos más divertidos, como el de los mapaches jsjs."
        ],
        media: [{ src: "assets/img/juego-03.png", caption: "Los mapaches." }]
      },
      {
        title: "Lo que viene",
        text: [
          "Y sí, ya sé: «tiempo que no jugamos ☝️». Me sacaré tiempo para poder seguir jugando, porque me debes la revancha, y todavía nos faltan partidas de Mobile Legends, más Roblox y otros juegos que se nos puedan ocurrir ^^"
        ],
        media: []
      }
    ]
  },

  /* -------------------------- LO QUE QUERÍA DECIRTE ------------------------ */
  final: {
    topbar: "Lo que quería decirte",
    title: "Lo que quería decirte",
    subtitle: "claveles oscuros bajo la nieve ❄️",
    photo: { src: "assets/img/nosotros.jpg", caption: "Nosotros." },
    letter: [
      "Todo empezó con un «vengo a hacerte bullying». Pero desde ahí, sin darme cuenta, no paré de querer saber qué ibas a contar después: el museo al que te escapaste, tu Coraline, tus parciales, tus peces y todo lo demás. Cada historia tuya es interesante para mi y yo quiero escucharlas todas.",
      "Me agrada muchísimo pasar tiempo contigo. De verdad. Las tardes que se alargan como sombras, las partidas, las bromas random y hasta cuando me haces bullying. Contigo puedo ser yo ^^. Espero si sientas algo similar al estar conmigo. Y tu Jukumari/Oso bezudo ya anda conmigo de llavero a todas partes, como un pequeño recordatorio de ti.",
      "Sé que a veces soy algo tonto por el tono con el que digo las cosas. No lo hago para molestarte, simplemente uso mucho sarcasmo. Y sé que, aunque haya tormentas, siempre vale más la pena construir algo bonito que dejarlo en ruinas, fue por eso que te escribi para dejar en claro que si fue mi culpa, porque si quiero construir algo mejor :3",
      "Aunque nos hayamos distanciado un poco, sigo valorándote muchísimo, y me encantaría que la próxima vez que salgamos sea tranquila, sin presión y al ritmo que veamos",
      "Por lo que conozco de ti, eres libre, de esas almas que no se dejan atar, como el cuervo, que va a donde quiere y siempre sabe dónde está su cielo. Esa libertad es una de las cosas que más me gustan de ti. Porcierto, la cancion que escuchas en esta pagina fue tocada por mi es una melodia de una cancion que me agrada, espero te guste",
      "Y una cosa más, la más importante: ¿cómo estás? Ojalá tu perrito se esté recuperando y tú estés bien. Si necesitas desahogarte, distraerte con una partida o simplemente hablar, aquí estoy."
    ],
    closing: "Gracias por existir con tanto estilo ^^",
    signature: "— Neil 🖤",
    whatsappLabel: "Responderle cuando quieras",
    backLabel: "Volver al mapa"
  }
};