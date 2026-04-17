const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    backgroundColor: '#87CEEB', // céu azul
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

// ---------------- VARIÁVEIS GLOBAIS ----------------
let player;
let ground;
let enemy;
let fruit;
let fruitActive = false;
let cursors;
let speed = 200;
let gameOver = false;
let score = 0;
let scoreText;
const fruitsList = ['apple','banana','cereja','morango'];

// ---------------- PRELOAD ----------------
function preload() {
    // Chão, inimigo e player
    this.load.image('chao', 'assets/chao.png');
    this.load.image('inimigo', 'assets/inimigo.png');
    this.load.image('walk1', 'assets/walk1.png');
    this.load.image('walk2', 'assets/walk2.png');

    // Frutas
    this.load.image('apple', 'assets/apple.png');
    this.load.image('banana', 'assets/banana.png');
    this.load.image('cereja', 'assets/cereja.png');
    this.load.image('morango', 'assets/morango.png');
}

// ---------------- CREATE ----------------
function create() {
    // Chão
    ground = this.add.tileSprite(0, 336, 800, 64, 'chao').setOrigin(0,0);
    this.physics.add.existing(ground,true);

    // Player
    player = this.physics.add.sprite(100,270,'walk1');
    player.setCollideWorldBounds(true);

    // Animação do player
    this.anims.create({
        key:'run',
        frames:[
            {key:'walk1'},
            {key:'walk2'}
        ],
        frameRate:6,
        repeat:-1
    });
    player.play('run');

    // Inimigo
    enemy = this.physics.add.sprite(850,280,'inimigo');
    enemy.setImmovable(true);
    enemy.body.allowGravity=false;
    enemy.body.setSize(40,40);
    enemy.body.setOffset(12,12);

    // Fruta inicial (inativa)
    spawnFruit.call(this);

    // Colisões
    this.physics.add.collider(player, ground);
    this.physics.add.collider(player, enemy, hitEnemy, null, this);
    this.physics.add.overlap(player, fruit, collectFruit, null, this);

    // Teclado
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', jump, this);

    // Score
    scoreText = this.add.text(16,16,'Score: 0',{fontSize:'24px',fill:'#000'});
}

// ---------------- UPDATE ----------------
function update() {
    if(gameOver) return;

    // Movimento do chão
    ground.tilePositionX += speed*0.02;

    // Movimento do inimigo
    enemy.setVelocityX(-speed);

    // Reposiciona inimigo se saiu da tela
    if(enemy.x < -50){
        enemy.x = 850;
        speed += 20;
        score += 1;
        scoreText.setText('Score: ' + score);
    }

    // Movimento da fruta
    if(fruitActive){
        fruit.x -= speed*0.02;

        // Se sair da tela sem ser coletada
        if(fruit.x < -50){
            fruit.setActive(false).setVisible(false);
            fruitActive = false;

            // Respawn após 1-3 segundos
            this.time.delayedCall(Phaser.Math.Between(1000,3000), ()=>{
                if(!gameOver) spawnFruit.call(this);
            });
        }
    }
}

// ---------------- FUNÇÕES AUXILIARES ----------------

// Pulo do player
function jump(){
    if(gameOver) return;
    if(player.body.touching.down){
        player.setVelocityY(-500); // pulo alto
    }
}

// Colisão com inimigo
function hitEnemy(){
    gameOver = true;
    player.setTint(0xff0000);
    player.anims.stop();
    this.physics.pause();
}

// Cria uma fruta
function spawnFruit(){
    if(fruitActive) return; // só uma fruta por vez

    const randomFruit = Phaser.Math.RND.pick(fruitsList);
    const yPosition = 200 + Phaser.Math.Between(-50,50);

    if(fruit){
        fruit.setTexture(randomFruit);
        fruit.setPosition(850, yPosition);
        fruit.setActive(true).setVisible(true);
    } else {
        fruit = this.physics.add.sprite(850, yPosition, randomFruit);
        fruit.body.allowGravity=false;
    }

    fruitActive = true;
}

// Coletar fruta
function collectFruit(player, collectedFruit){
    if(!fruitActive) return;

    collectedFruit.setActive(false).setVisible(false);
    fruitActive = false;

    // Apenas 1 ponto
    score += 1;
    scoreText.setText('Score: ' + score);

    // Nova fruta aparece após 1-3 segundos
    this.time.delayedCall(Phaser.Math.Between(1000,3000), ()=>{
        if(!gameOver) spawnFruit.call(this);
    });
}