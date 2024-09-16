const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let juego_terminado = false;

var direccion = "";
var velocidad = 1.2;
var obstaculos = [];

var pausa = false;
var score = 0;
const puntuaciones = [];
var segundos = 0;
var minutos = 0;
var horas = 0;
let dificultad = 900;


var velocidad_bala = 2;
var balas = [];

var balas_enemigo = [];
var velocidad_bala_enemigo = 1;

let bandera_destruido = false;
let mostrar_menu_inicio = true;

let velocidad_enemigo_especial = 0;
let moviendo_derecha = true;
let bandera_enemigo_especial_destruido = false;


//BACKGROUND DEL JUEGO
const fondo_juego = new Image();
fondo_juego.src = "./imagenes/Niveles_Fondos/fondo_3.jpg"

fondo_juego.onload = function () {
    ctx.drawImage(fondo_juego, 0, 0, canvas.width, canvas.height);
};

//BARRA LATERAL
const barra_lateral = new Image();
barra_lateral.src = "./imagenes/Niveles_Fondos/barra_lateral.jpg"
barra_lateral.onload = function () {
    ctx.drawImage(barra_lateral, 0, 0, canvas.width, canvas.height);
};

//MENÚ DE INICIO
const img_menu_inicio = new Image();
img_menu_inicio.src = "./imagenes/Niveles_Fondos/menu_inicio.png"

img_menu_inicio.onload = function () {
    ctx.drawImage(img_menu_inicio, 0, 0, canvas.width, canvas.height);
};

function menu_inicio() {
    let x = 890;
    let y = 550;
    ctx.drawImage(img_menu_inicio, 0, 0, canvas.width, canvas.height);

    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = "60px Unlock";
    ctx.fillText("Pulsa Enter para comenzar", canvas.width - x, y);
    ctx.fillText("Controles", canvas.width - x, 170);
    ctx.font = "40px Unlock";
    ctx.fillText("    - Izquierda: a", canvas.width - x, 240);
    ctx.fillText("    - Derecha: d", canvas.width - x, 300);
    ctx.fillText("    - Disparar: c", canvas.width - x, 360);
    ctx.fillText("    - Pausa: Espacio", canvas.width - x, 420);

    ctx.font = "60px Unlock";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeText("Pulsa Enter para comenzar", canvas.width - x, y);
}

function game_over() {
    ctx.fillStyle = "rgba(34,37, 95, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(217,217,217)";
    ctx.font = "60px Unlock";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, (canvas.height / 2) - 200);

    ctx.font = "60px Noto Sans";
    ctx.fillText("Puntuación: " + score, canvas.width / 2, (canvas.height / 2) - 100);
    ctx.fillText("Pulsa Enter para volver a jugar ", canvas.width / 2, (canvas.height / 2) + 330);
}
//SPRITES DEL JUGADOR
const player_sprite = new Image();
player_sprite.src = "./imagenes/player/player.png"

player_sprite.onload = function () {
    ctx.drawImage(player_sprite, this.x, this.y, 200, 100);
};


//SPRITES DEL ENEMIGO
const enemigo_sprite = new Image();
enemigo_sprite.src = "./imagenes/Enemigos/enemigo1.png"

enemigo_sprite.onload = function () {
    ctx.drawImage(enemigo_sprite, this.x, this.y, 200, 100);
};

const enemigo2_sprite = new Image();
enemigo2_sprite.src = "./imagenes/Enemigos/enemigo2.png";

const enemigo_especial_sprite = new Image();
enemigo_especial_sprite.src = "./imagenes/Enemigos/enemigo_especial.png";


const enemigo_destruccion = new Image();
enemigo_destruccion.src = "./imagenes/Enemigos/Animaciones/enemigo_destruccion.gif";

let imagen_enemigo = new Image();
imagen_enemigo = enemigo_sprite; //Por default, la imagen del enemigo es su sprite original, si este es destruido, su imagén cambiará a la de destrucción


//BALAS
const imagen_bala = new Image();
imagen_bala.src = "./imagenes/balas/balas_1.png"
imagen_bala.onload = function () {
    ctx.drawImage(imagen_bala, this.x, this.y, 800, 100);
};

//SONIDOS
const sonido_disparo = new Audio('./sonidos/disparo.mp3');
sonido_disparo.volume = 0.1;

const sonido_enemigo_destruido = new Audio('./sonidos/enemigo_destruido.mp3');
sonido_enemigo_destruido.volume = 0.060;

const sonido_player_dano = new Audio('./sonidos/player_dano.mp3');
sonido_player_dano.volume = 0.360;

const musica_fondo = new Audio('./Sonidos/Necrofantasia-8-Bit-Remix.mp3');
musica_fondo.volume = 0.3;

function reproducirSonido(audio) {
    audio.currentTime = 0;
    audio.play();
}


class Player {
    constructor(x, y, ancho, alto, puntos_hp) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.puntos_hp = puntos_hp;
    }

    dibujar() {
        ctx.drawImage(player_sprite, this.x, this.y, 80, 80);
    }

    disparar() {
        let posicion_x = 0;
        let posicion_y = 0;

        //Dependiendo del lado del personaje, acomodar la posición de donde saldrá la bolita
        posicion_x = 35;
        posicion_y = -35;
        balas.push({
            x: player.x + posicion_x,
            y: player.y + posicion_y,
            velocidad: velocidad_bala,
            direccion: direccion
        });
        reproducirSonido(sonido_disparo);
    }

    manejarColision(bala) {
        return (player.x < bala.x + 50 &&
            player.x + player.ancho > bala.x &&
            player.y < bala.y + 50 &&
            player.y + player.alto > bala.y) ||
            (player.x > bala.x - 50 &&
                player.x + player.ancho < bala.x &&
                player.y > bala.y - 50 &&
                player.y + player.alto < bala.y);
    }


}

class Enemigo {
    constructor(x, y, ancho, alto, puntos_hp, imagen_actual, valor_puntos) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.puntos_hp = puntos_hp;
        this.imagen_actual = imagen_actual;
        this.valor_puntos = valor_puntos;

    }

    dibujar() {
        ctx.drawImage(this.imagen_actual, this.x, this.y, 50, 50);
        if (this.puntos_hp <= 0 && !this.puntuacion_dibujada) {
            this.dibujar_puntuacion();
        }

    }

    manejarColision(bala) {
        return this.x < bala.x + 10 &&
            this.x + this.ancho > bala.x &&
            this.y < bala.y + 30 &&
            this.y + this.alto > bala.y;
    }



    disparar_enemigo() {
        let posicion_x = 0;
        let posicion_y = 0;

        //Dependiendo del lado del personaje, acomodar la posición de donde saldrá la bolita
        posicion_x = 0;
        posicion_y = 0;
        balas_enemigo.push({
            x: this.x + posicion_x,
            y: this.y + posicion_y,
            velocidad: velocidad_bala_enemigo,
            direccion: direccion

        });

    }

    destruir_enemigo(enemigo) {
        enemigos_1.splice(enemigo, 1);
        puntuaciones.push({ x: this.x, y: this.y, texto: "+" + this.valor_puntos, tiempo: 0 });
        bandera_destruido = true;
        reproducirSonido(sonido_enemigo_destruido);


    }


    dibujar_puntuacion() {
        if (bandera_destruido) {
            ctx.fillStyle = "black";
            ctx.font = "40px Georgia";
            ctx.fillText("+100", this.x, this.y, 40);
            bandera_destruido = false
            bandera_enemigo_especial_destruido = false;


        }

    }

}

class Obstaculo {
    constructor(x, y, ancho, alto, capas) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.capas = capas;
        this.cuadrados = [];

        // Crear los pequeños cuadrados del obstáculo
        let cuadrado_size = 10;
        let espacio = 0;
        for (let i = 0; i < this.capas; i++) {
            for (let j = 0; j < this.ancho / (cuadrado_size + espacio); j++) {
                this.cuadrados.push({
                    x: this.x + j * (cuadrado_size + espacio),
                    y: this.y + i * (cuadrado_size + espacio),
                    width: cuadrado_size,
                    height: cuadrado_size
                });
            }
        }
    }

    dibujar() {
        ctx.fillStyle = 'black';
        this.cuadrados.forEach(cuadro => {
            ctx.fillRect(cuadro.x, cuadro.y, cuadro.width, cuadro.height);
        });
    }

    manejarColision(bala) {
        for (let i = 0; i < this.cuadrados.length; i++) {
            const cuadro = this.cuadrados[i];
            if (cuadro.x < bala.x + 30 && cuadro.x + cuadro.width > bala.x &&
                cuadro.y < bala.y + 30 && cuadro.y + cuadro.height > bala.y) {
                this.cuadrados.splice(i, 1); // Eliminar el cuadrado impactado
                return true; // Indicar que hubo colisión
            }
        }
        return false;
    }
}

//Se crea el jugador
const player = new Player(50, 750, 0, 0, 6);

obstaculos.push(new Obstaculo(200, 600, 100, 50, 7));
obstaculos.push(new Obstaculo(400, 600, 100, 50, 7));
obstaculos.push(new Obstaculo(600, 600, 100, 50, 7));
obstaculos.push(new Obstaculo(800, 600, 100, 50, 7));


//SE CREAN LOS ENEMIGOS
let salto_posicion_x = 100;
let salto_posicion_y = 70;
let enemigo1_x = 0;
let enemigo1_y = 100;

const enemigos_1 = [];
const enemigos_especiales = [];
const enemigo_especial = new Enemigo(-100, 100, 50, 50, 1, enemigo_especial_sprite, 1000);
enemigos_1.push(enemigo_sprite);
let filas_enemigos = 0;
let columnas_enemigos = 10;
let bandera_filas = 0;

const atributos_enemigos = {
    1: { imagen: enemigo_sprite, puntos_hp: 2, valor_puntos: 100, },
    2: { imagen: enemigo2_sprite, puntos_hp: 1, valor_puntos: 250 }
};

function crear_enemigos(tipos) {
    let salto_posicion_x = 100;
    let salto_posicion_y = 70;
    let enemigo_x = 0;
    let enemigo_y = 100;

    enemigos_1.length = 0; // Limpiar el array de enemigos antes de crear nuevos
    enemigos_1.push(enemigo_especial); // Agregar el enemigo especial

    let filas_enemigos = 0;
    let columnas_enemigos = 10;
    let bandera_filas = 0;

    while (bandera_filas < 3) {
        let tipo_enemigo = tipos[bandera_filas]; // Obtener el tipo de enemigo para la fila actual
        let atributos = atributos_enemigos[tipo_enemigo];

        if (!atributos) {
            console.error("Tipo de enemigo no válido");
            continue;
        }

        for (filas_enemigos = 0; filas_enemigos < columnas_enemigos; filas_enemigos++) {
            enemigos_1.push(new Enemigo(
                enemigo_x,
                enemigo_y,
                50,
                50,
                atributos.puntos_hp,
                atributos.imagen,
                atributos.valor_puntos
            ));
            enemigo_x += salto_posicion_x;
        }
        enemigo_x = 0;
        enemigo_y += salto_posicion_y;
        bandera_filas++;
    }
}

//Se crean los enemigos por primera vez de manera default
crear_enemigos([1, 2, 1]);

let bajar_una_vez = true;
let retroceder = false;
let alcanzado_limite = false;

const intervaloEnemigos = setInterval(function () {
    if (!pausa && !mostrar_menu_inicio && !juego_terminado) {
        if (alcanzado_limite && bajar_una_vez) {
            for (let i = enemigos_1.length - 1; i >= 0; i--) {
                if (enemigos_1[i] !== enemigo_especial) {
                    enemigos_1[i].y += 50;  //Baja a todos los enemigos 50 puntos en Y


                    if (retroceder) {
                        enemigos_1[i].x += 20;
                    } else {
                        enemigos_1[i].x -= 20;
                    }
                }
            }

            bajar_una_vez = false;
        }

        if (!retroceder) {
            for (let i = enemigos_1.length - 1; i >= 0; i--) {
                if (enemigos_1[i] !== enemigo_especial) {
                    enemigos_1[i].x += 20;
                    if (enemigos_1[i].x + enemigos_1[i].ancho >= canvas.width - 800) {
                        alcanzado_limite = true;
                        retroceder = true;
                        bajar_una_vez = true;
                    }
                }
            }
        }

        if (retroceder) {
            for (let i = enemigos_1.length - 1; i >= 0; i--) {
                if (enemigos_1[i] !== enemigo_especial) {
                    enemigos_1[i].x -= 20;
                    if (enemigos_1[i].x <= 0) {
                        alcanzado_limite = true;
                        retroceder = false;
                        bajar_una_vez = true;
                    }
                }
            }
        }
    }
}, 500);

let intervaloDisparosEnemigos;

function iniciarDisparosEnemigos() {
    if (intervaloDisparosEnemigos) {
        clearInterval(intervaloDisparosEnemigos);
    }
    intervaloDisparosEnemigos = setInterval(function () {
        if (!pausa && !mostrar_menu_inicio && !juego_terminado) {
            let numero_aleatorio = Math.floor(Math.random() * enemigos_1.length);
            enemigos_1[numero_aleatorio].disparar_enemigo();
        }
    }, dificultad);
}

iniciarDisparosEnemigos();

setInterval(function () {
    if (!pausa && !mostrar_menu_inicio && !juego_terminado) {
        segundos++
        if (segundos == 60) {
            minutos++;
            segundos = 0;
        }
    }

}, 1000);

function mostrar_tiempo(numero) {
    return numero < 10 ? '0' + numero : numero;
}

function mostrar_puntaje(score, longitud = 5) {
    return score.toString().padStart(longitud, '0');
}

setInterval(function () { //Esta función hará que el enemigo especial aparezca cada cierto tiempo
    if (!pausa && !mostrar_menu_inicio && !juego_terminado) {
        if (velocidad_enemigo_especial == 0) {
            velocidad_enemigo_especial = 1;

        }

    }
}, 5000);

function volver_jugar() {
    //Restablecer variables
    direccion = "";
    velocidad = 1.2;


    pausa = false;
    score = 0;
    puntuaciones.length = 0;
    velocidad_bala = 2;
    balas.length = 0;
    balas_enemigo.length = 0;
    velocidad_bala_enemigo = 1;
    bandera_destruido = false;
    bandera_enemigo_especial_destruido = false;
    mostrar_menu_inicio = true;
    juego_terminado = false;
    segundos = 0;
    minutos = 0;
    horas = 0;
    obstaculos.length = 0;
    dificultad = 900;
    obstaculos.push(new Obstaculo(200, 600, 100, 50, 7));
    obstaculos.push(new Obstaculo(400, 600, 100, 50, 7));
    obstaculos.push(new Obstaculo(600, 600, 100, 50, 7));
    obstaculos.push(new Obstaculo(800, 600, 100, 50, 7));
    velocidad_enemigo_especial = 0;



    //Restablecer el estado del jugador
    player.x = 50;
    player.y = 750;
    player.puntos_hp = 6;

    //Reconfigurar los enemigos
    enemigos_1.length = 0;

    //Reiniciar fondo y música
    fondo_juego.onload = function () {
        ctx.drawImage(fondo_juego, 0, 0, canvas.width, canvas.height);
    };

}
paint();
var teclapresionada = {};
document.addEventListener("keydown", function (e) {
    teclapresionada[e.code] = true;

    if (!pausa && !mostrar_menu_inicio && !juego_terminado) {


        if (teclapresionada['KeyC']) {
            player.disparar();
        }
    }
    if (teclapresionada['Enter']) {
        if (juego_terminado) {
            musica_fondo.pause();
            musica_fondo.currentTime = 0;
            volver_jugar();
        } else {
            mostrar_menu_inicio = false;
            setTimeout(() => {
                reproducirSonido(musica_fondo);
                musica_fondo.loop = true;
            }, 1000);
        }
    }

    if (e.code === 'Space') {
        pausa = !pausa;
    }
});


document.addEventListener("keyup", function (e) {
    delete teclapresionada[e.code];
});


function update() {

    if (!pausa && !mostrar_menu_inicio && !juego_terminado) {

        if (teclapresionada['KeyA']) {
            player.x -= velocidad;
            if (player.x < 0) {
                player.x = 0; // Limitar al borde izquierdo del canvas
            }
        }

        if (teclapresionada['KeyD']) {
            player.x += velocidad;
            if (player.x + player.ancho > canvas.width - 800) {
                player.x = canvas.width - 800 - player.ancho; // Limitar al borde derecho del canvas
            }
        }

        enemigos_1.forEach((enemigo, index) => {
            if (enemigo === enemigo_especial) {
                // Movimiento específico del enemigo especial
                if (moviendo_derecha) {
                    enemigo.x += velocidad_enemigo_especial;
                    if (enemigo.x + enemigo.ancho >= canvas.width - 800) {
                        moviendo_derecha = false;
                    }
                } else {
                    enemigo.x -= velocidad_enemigo_especial;
                    if (enemigo.x <= -200) {
                        velocidad_enemigo_especial = 0;
                        moviendo_derecha = true;
                    }
                }
            }


            // Revisa colisiones
            balas.forEach((bala, balaIndex) => {
                if (enemigo.manejarColision(bala)) {
                    console.log('Colisión detectada');
                    balas.splice(balaIndex, 1);
                    enemigo.puntos_hp--;

                    if (enemigo.puntos_hp <= 0) {
                        console.log('Enemigo eliminado');
                        score += enemigo.valor_puntos;
                        enemigos_1.splice(index, 1);
                        bandera_destruido = true;
                    }
                }
            });
        });
        // Dibuja el enemigo especial
        switch (direccion) {
            case "izquierda":
                if (velocidad == 0 && player.x >= canvas.width - 800) {
                    velocidad = 1.2;
                    console.log(velocidad)
                }
                player.x -= velocidad;
                if (player.x <= 0) {
                    velocidad = 0;

                }
                break;
            case "derecha":
                if (velocidad == 0 && player.x <= 0) {
                    velocidad = 1.2;
                    console.log(velocidad);
                }
                player.x += velocidad;
                if (player.x >= canvas.width - 800) {
                    velocidad = 0;
                    console.log(player.x)

                }
        }


        //Dibuja las balas disparadas por el jugador
        balas.forEach((bala, balaIndex) => {
            bala.y -= bala.velocidad;
            ctx.drawImage(imagen_bala, bala.x, bala.y, 30, 30);

            //Revisa colisiones entre las balas y los enemigos
            for (let i = enemigos_1.length - 1; i >= 0; i--) {
                const enemigo = enemigos_1[i];

                if (enemigo.manejarColision(bala)) {
                    console.log('Colisión detectada');

                    //Eliminar la bala
                    balas.splice(balaIndex, 1);
                    enemigo.puntos_hp--;

                    //Si el enemigo tiene 0 puntos de vida, eliminarlo
                    if (enemigo.puntos_hp <= 0) {
                        console.log('Enemigo eliminado');
                        score += enemigo.valor_puntos;
                        enemigos_1[i].destruir_enemigo(i);
                        bandera_destruido = true;
                    }
                }


            }
        });

        //ACTUALIZACIÓN DE BALA PARA LOS ENEMIGOS
        balas_enemigo.forEach((bala, balaIndex) => {
            bala.y += bala.velocidad;
            ctx.drawImage(imagen_bala, bala.x, bala.y, 50, 50);

            if (player.manejarColision(bala)) {
                console.log('Colisión detectada con jugador');

                //Eliminar la bala
                balas_enemigo.splice(balaIndex, 1);
                player.puntos_hp--;
                console.log(player.puntos_hp);
                reproducirSonido(sonido_player_dano);

                //Si el jugador tiene 0 puntos de vida, eliminarlo
                if (player.puntos_hp <= 0) {
                    console.log('Jugador eliminado');
                    juego_terminado = true;
                }
            }

            // Validar colisiones con todos los obstáculos
            obstaculos.forEach((obstaculo, obstaculoIndex) => {
                if (obstaculo.manejarColision(bala)) {
                    console.log('Colisión detectada con obstáculo ' + obstaculoIndex);

                    // Eliminar la bala
                    balas_enemigo.splice(balaIndex, 1);

                    // Aquí podrías reducir las capas del obstáculo, si es lo que buscas.
                    // Puedes agregar lógica para disminuir la vida del obstáculo si deseas.
                }
            });
        });

        obstaculos.forEach(obstaculo => {
            obstaculo.dibujar();
        });

        if (enemigos_1.length === 0 && juego_terminado == false) {
            console.log("murieron")
            crear_enemigos([1, 2, 1]);
            dificultad -= 100
            if (dificultad == 500) {
                dificultad = 500;
            }
            console.log(dificultad)
            iniciarDisparosEnemigos();
        }

        obstaculos.forEach((bala, balaIndex) => {


            //Revisa colisiones entre las balas y los enemigos
            for (let i = enemigos_1.length - 1; i >= 0; i--) {
                const enemigo = enemigos_1[i];

                if (enemigo.manejarColision(bala)) {
                    console.log('Colisión detectada');
                    enemigos_1[i].y = 100




                }


            }
        });
    }


}


function paint() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    //fondo del canvas


    ctx.drawImage(fondo_juego, 0, 0, canvas.width, canvas.height);

    player.dibujar();
    for (let i = enemigos_1.length - 1; i >= 0; i--) {
        enemigos_1[i].dibujar();

    }

    // Dibuja las puntuaciones
    ctx.fillStyle = "white";
    ctx.font = "40px Georgia";
    for (let i = puntuaciones.length - 1; i >= 0; i--) {
        let puntuacion = puntuaciones[i];
        ctx.fillText(puntuacion.texto, puntuacion.x, puntuacion.y - puntuacion.tiempo);
        puntuacion.tiempo += .4; // Cambia la velocidad de desaparición aquí
        if (puntuacion.tiempo > 50) { // Después de 50 píxeles de movimiento, elimina la puntuación
            puntuaciones.splice(i, 1);
        }
    }
    obstaculos.forEach(obstaculo => {
        obstaculo.dibujar();
    });



    ctx.font = "30px Georgia";
    ctx.fillStyle = "gray";
    ctx.fillText("Score: " + score, 100, 30);

    //BARRA LATERAL
    ctx.fillStyle = "black";
    ctx.fillRect(1200, 0, 700, canvas.height)
    ctx.drawImage(barra_lateral, 1200, 0, 700, canvas.height);
    ctx.font = "40px Aldrich";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("Score:        " + mostrar_puntaje(score), 1300, 130);
    ctx.fillText("Tiempo:       " + mostrar_tiempo(minutos) + ":" + mostrar_tiempo(segundos), 1300, 180);
    ctx.fillText("Vidas:       " + player.puntos_hp, 1300, 280);

    if (pausa) {
        ctx.fillStyle = "rgba(100,100,100,.5)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "black";
        ctx.font = "100px Georgia";
        ctx.fillText("Pausa", (canvas.width / 2) - 100, canvas.height / 2);
    }
    if (mostrar_menu_inicio) {
        menu_inicio();

    }
    if (juego_terminado) {
        game_over();
    }

    update();
    requestAnimationFrame(paint)


}

requestAnimationFrame(paint)

window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 17);
        };
}());






