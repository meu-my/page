
// ゲーム画面のキャンバス要素を取得
var canvas = document.getElementById("gameCanvas");
var info_c = document.getElementById("info");
var stage_c = document.getElementById("stage");

// キャンバスの描画コンテキストを取得
var ctx = canvas.getContext("2d");
var info = info_c.getContext("2d");
var stage = stage_c.getContext("2d");

// ゲームのステージサイズ
var canvasWidth = 400;
var canvasHeight = 800;

//ゲームキャンバスの各真ん中
let cvc_x = canvas.width / 2;
let cvc_y = canvas.height / 2;

// マウスの現在位置
let mouseX = 0;
let mouseY = 0;

//現在のゲーム状態
var nowPlay = false;

//プレイヤー情報
let playerSpeed = 15;//スピード
var nowFire = false;//発射中かどうか
let time = 0;
let secondTime = 0;
let kill = 0;
let nowWave = 0;
let score = 0;

//弾
var bullets = [];
//レーザー
var lasers = [];
//弾種類名前
var bullets_type_nameList = ["single", "triple", "single_laser", "x_laser", "+_laser", "wide", "single_slow",];
//弾種類ごと間隔
let bullets_type_interval = 1;

//テスト用弾変更インデックス
let test_bulletIndex = 0;


//敵
var enemys = [];


//アイテム
var items = [];



//ゲーム開始前
function gameFirst() {
    // ゲームループを開始
    console.log("gameStart");
    nowPlay = true;

    nextWave.push(Math.max((Math.floor(Math.random() * wave_name.length - 1)), 0) + 1);
    nextWave.push(Math.max((Math.floor(Math.random() * wave_name.length - 1)), 0) + 1);
    nextWave.push(Math.max((Math.floor(Math.random() * wave_name.length - 1)), 0) + 1);
    nextWave.push(Math.max((Math.floor(Math.random() * wave_name.length - 1)), 0) + 1);
    //console.log(nextWave);

    _waveChange = waveChange();
    _waveChange.on();

    console.log("waveStart");
    requestAnimationFrame(gameLoop);
}
//スコア計算
function scoreCal() {
    let time_cal = 1.0;
    let kill_cal = 10.0;
    let wave_cal = 2.0;

    return time * time_cal + kill * kill_cal + nowWave * wave_cal;
}
function waveChange() {
    var textRC;
    return {
        textRC: textRC,
        changeNow: false,
        waveWait: false,
        startTime: 0,
        changeInTime: 1,
        changePoseTime: 0.5,
        changeOutTime: 0.7,
        update: function () {
            let time_f = time + secondTime / 100;

            //console.log(time_f);
            if (this.startTime + this.changeInTime > time_f) {
                this.textRC.inUpdate(this.changeInTime);
            }
            else if (this.startTime + this.changeInTime + this.changePoseTime > time_f) {
                this.textRC._text = "Wave " + (nowWave + 1);
                this.textRC.reSet();
            }
            else if (this.startTime + this.changeInTime + this.changePoseTime + this.changeOutTime > time_f) {
                this.waveWait = false;
                this.textRC.outUpdate(this.changeOutTime);
            }
            else {
                this.textRC.reSet();
                this.changeNow = false;
            }

            ctx.font = "40px Arial";
            ctx.fillText(this.textRC.trc(), cvc_x - ctx.measureText("Wave " + (nowWave + 1)).width / 2, cvc_y);
            //console.log(this.textRC.trc());
        },
        on: function () {
            this.changeNow = true;
            this.waveWait = true;
            this.startTime = time + secondTime / 100;
            this.textRC = textRandomChange("Wave " + (nowWave + 1));
            //console.log(this.textRC.text);
        }
    }
}





//UIを描画
function drawUI() {

    info.fillStyle = "black";
    //プレイヤー情報を描画する関数
    UI_info()

    //ステージ情報を描画する関数
    UI_stage()

    gameStart_fade();
}
//プレイヤー情報を描画する関数
function UI_info() {

    info.font = "13px Arial";
    info.fillText("time", 10, 20);
    info.fillText("/s", 23, 35);

    info.font = "30px Arial";
    var time_text = time + ".";
    var second_text = secondTime.toString().padStart(2, '0');
    let second_text_posX = 50 + info.measureText(time_text).width;
    info.fillText(time_text, 50, 34);
    info.font = "15px Arial";
    info.fillText(second_text, second_text_posX, 34);

    info.font = "13px Arial";
    info.fillText("kill × ", 10, 73);
    info.font = "20px Arial";
    info.fillText(kill, 50, 74.5);

    UI_info_HealthBar(info);
    UI_info_bulletsType(info);
    UI_info_score(info);
}
//体力バーの描画関数
function UI_info_HealthBar(info) {
    let healthBar_Width = 5;        // 体力バーの1つの四角形の幅
    let healthBar_Height = 25;      // 体力バーの1つの四角形の高さ
    let healthBar_WidthPadding = 5; // 体力バーの四角形間の横余白
    let healthBar_HeightPadding = 5;// 体力バーの四角形間の縦余白
    let healthBarX = 10;            // 体力バーの左端のx座標
    let healthBarY = 120;           // 体力バーの上端のy座標
    let healthBar_cnt = 15;         //体力バーの横表示数

    info.font = "13px Arial";
    info.fillText("Life × " + player.playerLife, healthBarX, healthBarY - 10);
    let i = 0;
    let j = -1;
    for (let index = 0; index < player.playerLife; index++) {

        if (i % healthBar_cnt == 0) {
            j++;
            i = 0;
        }

        info.fillRect(
            healthBarX + i * (healthBar_Width + healthBar_WidthPadding),
            healthBarY + j * (healthBar_Height + healthBar_HeightPadding),
            healthBar_Width,
            healthBar_Height
        );

        i++;
    }
}
//弾種類の描画関数
function UI_info_bulletsType(info) {
    let posX = 10;
    let posY = 280;
    let height = 5;
    let width = 150;
    let _width = width;
    let percentage = (1 - (player.bulletInterval / bullets_type_interval));

    //弾の発射間隔
    _width = width * percentage;
    info.fillStyle = "black";
    info.fillRect(posX, posY, _width, height);

    //弾の発射間隔２
    let splitCnt = 10;
    let splitPadding = 5.5;
    let splitWidth = 10;
    let splitHeight = 2;
    let splitPosX = posX + 145;
    let splitPosY = posY + 9;
    for (let i = 0; i < splitCnt; i++) {
        if (player.bulletInterval < bullets_type_interval / (i + 1)) {
            info.fillRect(splitPosX - (splitWidth + splitPadding) * i, splitPosY, splitWidth, splitHeight);
        }
    }

    //弾種類
    let bulletType_padding = 30;
    info.font = "13px Arial";
    info.fillText("now : " + bullets_type_nameList[player.bulletType], posX, posY + bulletType_padding);

    //弾の発射間隔３
    let perPosX = posX;
    let perPosY = posY + 70;

    info.fillText("percentage : ", perPosX, perPosY);
    info.font = "15px Arial";
    info.fillText(Math.floor(percentage * 100).toString().padStart(3, '0'), perPosX + 80, perPosY + 2.2);
    info.font = "10px Arial";
    info.fillText("%", perPosX + 120, perPosY + 3);
}
//スコア描画関数
function UI_info_score(info) {
    let posX = 10;
    let posY = 390;

    //スコア計算
    score = scoreCal();

    info.font = "13px Arial";
    info.fillText("score", posX, posY);
    info.font = "30px Arial";
    info.fillText(score, posX + 20, posY + 30);
}
//ステージ情報を描画する関数
function UI_stage() {
    let stage_text = "";

    //wave数
    stage.fillStyle = "black";
    stage.font = "30px Arial";
    stage_text = "Wave " + nowWave;
    stage.fillText(stage_text, stage_c.width - stage.measureText(stage_text).width - 10, 30);

    //wave種類
    let wave_type_posX = 15;
    let wave_type_posY = 58;

    stage.font = "20px Arial";
    stage_text = wave_name[nextWave[0]];
    stage_nowType_text_w = stage_c.width - stage.measureText(stage_text).width - wave_type_posX;
    stage.fillText(stage_text, stage_nowType_text_w, wave_type_posY);

    stage.font = "10px Arial";
    stage_text = "nowType";
    stage.fillText(stage_text, stage_nowType_text_w - stage.measureText(stage_text).width - 5, wave_type_posY);

    stage.font = "10px Arial";
    stage_text = "→  " + wave_name[nextWave[1]];
    stage.fillText(stage_text, stage_c.width - stage.measureText(stage_text).width - wave_type_posX, wave_type_posY + 10 * 1 + 8);

    stage.font = "10px Arial";
    stage_text = "→  " + wave_name[nextWave[2]];
    stage.fillText(stage_text, stage_c.width - stage.measureText(stage_text).width - wave_type_posX, wave_type_posY + 10 * 2 + 8);

    stage.font = "10px Arial";
    stage_text = "→  " + wave_name[nextWave[3]];
    stage.fillText(stage_text, stage_c.width - stage.measureText(stage_text).width - wave_type_posX, wave_type_posY + 10 * 3 + 8);

}




//文字ランダム変更
function textRandomChange(text) {
    return {
        text_l: text.length + 1,
        index: 0,
        setText: text,
        resultText: "",
        startTime: 0,
        inUpdate: function (setTime) {
            let time_f = time + secondTime / 100;
            let intervalTime = Math.floor(setTime / this.text_l * 100) / 100;

            //添え字がはみ出した時
            if (this.index + 1 >= this.text_l) return;

            //文字のランダム表示
            if (this.resultText.length < this.index + 1) {
                this.resultText += randomCharacter(this.setText[this.index]);
            } else {
                this.resultText = this.resultText.slice(0, - 1);
                this.resultText += randomCharacter(this.setText[this.index]);
            }

            //一文字表示時間を終えたとき
            //console.log(this.startTime + intervalTime +"<"+ time_f);
            if (this.startTime + intervalTime <= time_f) {
                this.resultText = this.resultText.slice(0, - 1);
                this.resultText += this.setText[this.index];

                //console.log("InsertText : " + this.setText[this.index]);
                //console.log("InsertIndex : " + this.index);
                //console.log("ResultText : " + this.resultText[this.index]);

                //インデックスを次に
                this.index++;
                //一文字表示開始時間を更新
                this.startTime = time + secondTime / 100;
            }
        },
        outUpdate: function (setTime) {
            let time_f = time + secondTime / 100;
            let intervalTime = Math.floor(setTime / this.text_l * 100) / 100;

            //添え字がはみ出した時
            if (this.index + 1 >= this.text_l) return;

            //文字のランダム表示
            this.resultText = this.resultText.slice(0, - 1);
            this.resultText += randomCharacter(this.setText[this.resultText.length]);

            //一文字表示時間を終えたとき
            //console.log(this.startTime + intervalTime +"<"+ time_f);
            if (this.startTime + intervalTime <= time_f) {
                this.resultText = this.setText.slice(0, -this.index - 1);

                //console.log("ResultText : " + this.resultText[this.index]);

                //インデックスを次に
                this.index++;
                //一文字表示開始時間を更新
                this.startTime = time + secondTime / 100;
            }
        },
        trc: function () {
            return this.resultText;
        },
        reSet: function () {
            this.index = 0;
        }
    }
}
//文字の種類に合ったランダム文字を生成
function randomCharacter(refText) {
    const bigCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const smallCharacters = 'abcdefghijklmnopqrstuvwxyz';
    const nuberCharacters = '0123456789';

    switch (charactersCheck(refText)) {
        case 0:
            return nuberCharacters.charAt(Math.floor(Math.random() * nuberCharacters.length));
        case 1:
            return bigCharacters.charAt(Math.floor(Math.random() * bigCharacters.length));
        case 2:
            return smallCharacters.charAt(Math.floor(Math.random() * smallCharacters.length));
    }
}
//文字種類判定チェッカー
function charactersCheck(str) {
    // 数字であるかを判定
    if (!isNaN(str)) {
        return 0;
    }
    // 大文字であるかを判定
    if (str.toUpperCase() === str) {
        return 1;
    }
    // 小文字であるかを判定
    if (str.toLowerCase() === str) {
        return 2;
    }

    console.log("error");
    return 99;
}


//エネミーの種類
var itemTypes = [
    //heal_1
    createItemType(
        itemTypeName = "heal_1",
        image_src = "item/0.png",
        //0:heal, 1:weapon
        itemEffectType = 0,
        healPoint = 1,
        weaponType = 0,
    ),
    //heal_5
    createItemType(
        itemTypeName = "heal_5",
        image_src = "item/1.png",
        //0:heal, 1:weapon
        itemEffectType = 0,
        healPoint = 5,
        weaponType = 0,
    ),
    //heal_10
    createItemType(
        itemTypeName = "heal_10",
        image_src = "item/2.png",
        //0:heal, 1:weapon
        itemEffectType = 0,
        healPoint = 10,
        weaponType = 0,
    ),
    //single
    createItemType(
        itemTypeName = "single",
        image_src = "item/3.png",
        //0:heal, 1:weapon
        itemEffectType = 1,
        healPoint = 0,
        weaponType = 0,
    ),
    //triple
    createItemType(
        itemTypeName = "triple",
        image_src = "item/4.png",
        //0:heal, 1:weapon
        itemEffectType = 1,
        healPoint = 0,
        weaponType = 1,
    ),
    //single_laser
    createItemType(
        itemTypeName = "single_laser",
        image_src = "item/5.png",
        //0:heal, 1:weapon
        itemEffectType = 1,
        healPoint = 0,
        weaponType = 2,
    ),
    //x_laser
    createItemType(
        itemTypeName = "x_laser",
        image_src = "item/6.png",
        //0:heal, 1:weapon
        itemEffectType = 1,
        healPoint = 0,
        weaponType = 3,
    ),
    //+_laser
    createItemType(
        itemTypeName = "+_laser",
        image_src = "item/7.png",
        //0:heal, 1:weapon
        itemEffectType = 1,
        healPoint = 0,
        weaponType = 4,
    ),
    //wide
    createItemType(
        itemTypeName = "wide",
        image_src = "item/8.png",
        //0:heal, 1:weapon
        itemEffectType = 1,
        healPoint = 0,
        weaponType = 5,
    ),
    //single_slow
    createItemType(
        itemTypeName = "single_slow",
        image_src = "item/9.png",
        //0:heal, 1:weapon
        itemEffectType = 1,
        healPoint = 0,
        weaponType = 6,
    ),
];
//エネミー種類クラス
function createItemType(itemTypeName, image_src, itemEffectType, healPoint, weaponType) {
    return {
        itemTypeName: itemTypeName,
        image_src: image_src,
        itemEffectType: itemEffectType,
        healPoint: healPoint,
        weaponType: weaponType,
    }
}
// エネミーオブジェクトを生成する関数
function createItem(x, y, itemType) {
    var image = new Image();
    var size = 45;
    var xSpeed = 0;
    var ySpeed = 4;
    var xMoveType = 0;
    var yMoveType = 2;
    var itemEffectType = 0;
    var healPoint = 0;
    var weaponType = 0;

    //エネミータイプ
    image.src = itemTypes[itemType].image_src;
    itemEffectType = itemTypes[itemType].itemEffectType;
    healPoint = itemTypes[itemType].healPoint;
    weaponType = itemTypes[itemType].weaponType;

    return {
        x: x,
        y: y,
        size: size,
        xSpeed: xSpeed,
        ySpeed: ySpeed,
        xMoveType: xMoveType,
        yMoveType: yMoveType,
        moveInterval: 0,
        moveDirection: 1,
        itemEffectType: itemEffectType,
        healPoint: healPoint,
        weaponType: weaponType,
        //更新内容
        update: function () {
            switch (this.xMoveType) {
                case 0:
                    this.x += this.xSpeed;
                    break;
                case 1:
                    this.x += this.xSpeed * Math.cos((this.moveInterval * Math.PI) / 180 * 8);
                    this.moveInterval++;
                    break;
            }
            switch (this.yMoveType) {
                case 0:
                    this.y += this.ySpeed;
                    break;
                case 1:
                    this.y += this.ySpeed * (1 + Math.cos((this.moveInterval * Math.PI) / 180));
                    this.moveInterval++;
                    break;
                case 2:
                    this.y += this.ySpeed * (1 + Math.cos((this.moveInterval * Math.PI) / 180 * 1.6));
                    this.moveInterval++;
                    break;
            }

            this.draw();
        },
        //エネミーの描画
        draw: function () {
            ctx.drawImage(image, this.x - (this.size / 2), this.y - (this.size / 2), this.size, this.size,);
        },
        //当たり判定プレイヤーにあたると特定の効果を付与し、消滅
        itemF: function (index) {
            //console.log(this.itemEffectType);
            switch (this.itemEffectType) {
                case 0:
                    //console.log("回復");
                    player.life(this.healPoint);
                    break;
                case 1:
                    //console.log("交換");
                    player.changeBullet(this.weaponType);
                    break;
            }

            //当たった弾を消す
            items.splice(index, 1);
        }
    };
}


//エネミーの種類
var enemyTypes = [
    //0 single
    createEnemyType(
        enemyTypeName = "single",
        image_src = "chara/0.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 2,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 6,
        enemyLife = 30,
    ),
    //1 triple
    createEnemyType(
        enemyTypeName = "triple",
        image_src = "chara/1.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 2,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 1,
        enemyLife = 20,
    ),
    //2 single_laser
    createEnemyType(
        enemyTypeName = "single_laser",
        image_src = "chara/2.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 2,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 2,
        enemyLife = 10,
    ),
    //3 x_laser
    createEnemyType(
        enemyTypeName = "x_laser",
        image_src = "chara/3.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 2,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 3,
        enemyLife = 20,
    ),
    //4 +_laser
    createEnemyType(
        enemyTypeName = "+_laser",
        image_src = "chara/4.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 2,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 4,
        enemyLife = 20,
    ),
    //5 bodyAttack
    createEnemyType(
        enemyTypeName = "bodyAttack",
        image_src = "chara/99.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 14,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 99,
        enemyLife = 20,
    ),
    //6 wide
    createEnemyType(
        enemyTypeName = "wide",
        image_src = "chara/5.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 2,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 5,
        enemyLife = 20,
    ),
    //7 shake
    createEnemyType(
        enemyTypeName = "shake",
        image_src = "chara/99.png",
        size = 40,
        xSpeed = 2.4,
        ySpeed = 10,
        xMoveType = 1,
        yMoveType = 0,
        bulletType = 99,
        enemyLife = 10,
    ),
    //8
    createEnemyType(
        enemyTypeName = "test",
        image_src = "chara/99.png",
        size = 40,
        xSpeed = 0,
        ySpeed = 0,
        xMoveType = 0,
        yMoveType = 0,
        bulletType = 99,
        enemyLife = 10,
    ),
]
//エネミー種類クラス
function createEnemyType(enemyTypeName, image_src, size, xSpeed, ySpeed, xMoveType, yMoveType, bulletType, enemyLife) {
    return {
        enemyTypeName: enemyTypeName,
        image_src: image_src,
        size: size,
        xSpeed: xSpeed,
        ySpeed: ySpeed,
        xMoveType: xMoveType,
        yMoveType: yMoveType,
        bulletType: bulletType,
        enemyLife: enemyLife,
    }
}
// エネミーオブジェクトを生成する関数
function createEnemy(x, y, enemyType) {
    var image = new Image();
    var symbol = "";
    var size = 0;
    var xSpeed = 0;
    var ySpeed = 0;
    var xMoveType = 0;
    var yMoveType = 0;
    var bulletType = 0;
    var enemyLife = 0;

    //エネミータイプ
    image.src = enemyTypes[enemyType].image_src;
    size = enemyTypes[enemyType].size;
    xSpeed = enemyTypes[enemyType].xSpeed;
    ySpeed = enemyTypes[enemyType].ySpeed;
    xMoveType = enemyTypes[enemyType].xMoveType;
    yMoveType = enemyTypes[enemyType].yMoveType;
    bulletType = enemyTypes[enemyType].bulletType;
    enemyLife = enemyTypes[enemyType].enemyLife;

    return {
        x: x,
        y: y,
        symbol: symbol,
        size: size,
        xSpeed: xSpeed,
        ySpeed: ySpeed,
        xMoveType: xMoveType,
        yMoveType: yMoveType,
        moveInterval: 0,
        moveDirection: 1,
        bulletType: bulletType,
        bulletInterval: 30,
        enemyLife: enemyLife,
        charaType: 1,
        enemyType: enemyType,
        //更新内容
        update: function () {
            switch (this.xMoveType) {
                case 0:
                    this.x += this.xSpeed;
                    break;
                case 1:
                    this.x += this.xSpeed * Math.cos((this.moveInterval * Math.PI) / 180 * 8);
                    this.moveInterval++;
                    break;
            }
            switch (this.yMoveType) {
                case 0:
                    this.y += this.ySpeed;
                    break;
                case 1:
                    this.y += this.ySpeed * (1 + Math.cos((this.moveInterval * Math.PI) / 180));
                    this.moveInterval++;
                    break;
            }

            this.bulletInterval =
                fireBullet(this.x, this.y, this.bulletInterval, this.bulletType, this.charaType, this);

            this.draw();
        },
        //エネミーの描画
        draw: function () {
            ctx.drawImage(image, this.x - (this.size / 2), this.y - (this.size / 2), this.size, this.size,);
        },
        //エネミーのライフ操作
        life: function (value) {

            // エネミーのライフを減らす
            this.enemyLife += value;

            // ライフが0になったら敵を削除
            for (let i = 0; i < enemys.length; i++) {
                if (enemys[i] != this) continue;

                if (this.enemyLife <= 0) {
                    this.death(i);
                }
            }
        },
        death: function (index) {
            this.delete_laser();

            //エネミーのキル
            kill++;
            enemys.splice(index, 1);
        },
        //レーザーの消去
        delete_laser: function () {
            for (let i = 0; i < lasers.length; i++) {
                if (lasers[i] && lasers[i].origin === this) {
                    lasers.splice(i, lasers[i].lasers_cnt);
                    break;
                }
            }
        }
    };
}

// プレイヤーオブジェクトを生成する関数
function createPlayer(x, y, size, color) {
    var image = new Image();
    image.src = "player/0.png";

    return {
        x: x,
        y: y,
        size: size,
        color: color,
        bulletInterval: 0,
        bulletType: 0,
        playerLife: 30,
        charaType: 0,
        //更新内容
        update: function () {
            this.draw();
            if (nowFire) {
                this.bulletInterval =
                    fireBullet(this.x, this.y, this.bulletInterval, this.bulletType, this.charaType, this);
            }
            else if (this.bulletInterval > 0) {
                this.bulletInterval--;
            }
            this.followMouse();
        },
        //プレイヤーの描画
        draw: function () {
            ctx.drawImage(image, this.x - (this.size), this.y - (this.size), this.size*2, this.size*2,);
        },
        //プレイヤーのマウス追従
        followMouse: function () {
            if (time < 1) {
                mouseX = cvc_x;
                mouseY = cvc_y;
                return;
            }

            let pSpeed = playerSpeed;
            //発射していな時スピードアップ
            if (!nowFire) {
                pSpeed *= 3;
            }

            // マウスとプレイヤーの位置の差を計算する
            const dx = mouseX - player.x;
            const dy = mouseY - player.y;

            // 速度を制御するために、ベクトルの大きさを計算する
            let dist = Math.sqrt(dx * dx + dy * dy);

            // 距離が近づくほどスピードを減らす
            let speed = pSpeed * Math.min(1, dist / 100);

            player.x += (dx / dist) * speed;
            player.y += (dy / dist) * speed;
        },
        //プレイヤーのライフ操作
        life: function (value) {

            //プレイヤーのライフを減らす
            this.playerLife += value;

            if (this.playerLife < 0) {
                this.playerLife = 0;
            }
            else if (this.playerLife > 60) {
                this.playerLife = 60;
            }
        },
        //レーザーの消去
        delete_laser: function () {
            for (let i = 0; i < lasers.length; i++) {
                if (lasers[i] && lasers[i].origin === this) {
                    lasers.splice(i, lasers[i].lasers_cnt);
                    break;
                }
            }
        },
        //弾の変更
        changeBullet: function (bulletType) {
            //インターバルの初期化
            this.bulletInterval = 1;
            //弾種類の変更
            this.bulletType = bulletType;
            //撃っていたレーザーの消去
            this.delete_laser();

            image.src = "player/" + bulletType + ".png";
        }
    };
}

//弾オブジェクトを打ち出す関数
function fireBullet(x, y, interval, type, charaType, origin) {
    let size;
    let color = 'black';
    let damage;
    let speed;
    let maxReflect;
    let fireTime;
    let chargeTime;
    let bulletInterval;

    let lasers_cnt;
    if (interval <= 0) {
        switch (type) {//ボム、ホーミング
            //single
            case 0:
                damage = 5;
                speed = 5
                size = 5;
                bulletInterval = 5;
                maxReflect = 1;

                bullets.push(createBullet(x, y, size, color, speed, 0, charaType, damage, maxReflect));

                break;
            //triple
            case 1:
                damage = 3;
                speed = 5
                size = 3;
                bulletInterval = 7;
                maxReflect = 2;

                bullets.push(createBullet(x, y, size, color, speed, -20, charaType, damage, maxReflect));
                bullets.push(createBullet(x, y, size, color, speed, 0, charaType, damage, maxReflect));
                bullets.push(createBullet(x, y, size, color, speed, 20, charaType, damage, maxReflect));

                break;
            //single_laser
            case 2:
                damage = 1;
                bulletInterval = 90;
                size = 1;
                maxReflect = 3;
                chargeTime = 30;
                fireTime = 50;
                lasers_cnt = 1;

                lasers.push(createLaser(origin, 0, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));

                break;
            //x_laser
            case 3:
                damage = 1;
                bulletInterval = 100;
                size = 1;
                maxReflect = 1;
                chargeTime = 50;
                fireTime = 20;
                lasers_cnt = 4;

                lasers.push(createLaser(origin, 45, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));
                lasers.push(createLaser(origin, 135, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));
                lasers.push(createLaser(origin, -45, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));
                lasers.push(createLaser(origin, -135, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));

                break;
            //+_laser
            case 4:
                damage = 1;
                bulletInterval = 100;
                size = 1;
                maxReflect = 1;
                chargeTime = 50;
                fireTime = 20;
                lasers_cnt = 4;

                lasers.push(createLaser(origin, 0, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));
                lasers.push(createLaser(origin, 90, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));
                lasers.push(createLaser(origin, -90, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));
                lasers.push(createLaser(origin, 180, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt));

                break;
            //wide
            case 5:
                damage = 4;
                speed = 5
                size = 4;
                bulletInterval = 6;
                maxReflect = 3;

                bullets.push(createBullet(x, y, size, color, speed, -20, charaType, damage, maxReflect));
                bullets.push(createBullet(x, y, size, color, speed, 20, charaType, damage, maxReflect));
                break;
            //single_slow
            case 6:
                damage = 10;
                speed = 5
                size = 8;
                bulletInterval = 14;
                maxReflect = 1;

                bullets.push(createBullet(x, y, size, color, speed, 0, charaType, damage, maxReflect));
                break;
        }
        //プレイヤーが撃ったときインターバルを記録
        if (charaType == 0) bullets_type_interval = bulletInterval;

        return bulletInterval;
    }
    else {
        interval--;
        return interval;
    }
}
//弾オブジェクトを生成する関数
function createBullet(x, y, size, color, speed, angle, charaType, damage, reflect_cnt) {
    return {
        x: x,
        y: y,
        size: size,
        color: color,
        speed: speed,
        angle: angle,
        charaType: charaType,
        damage: damage,
        reflect_cnt: reflect_cnt,
        update: function () {
            switch (charaType) {
                //プレイヤー
                case 0:
                    this.x += this.speed * angleToVector(this.angle - 90).x;
                    this.y += this.speed * angleToVector(this.angle - 90).y;
                    break;
                //エネミー
                case 1:
                    this.x += this.speed * angleToVector(this.angle + 90).x;
                    this.y += this.speed * angleToVector(this.angle + 90).y;
                    break;
            }
            this.draw();
            this.reflect();

            //一定以上反射したら
            if (this.reflect_cnt <= 0) this.delete();
        },
        draw: function () {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            ctx.fill();
        },
        //反射
        reflect: function () {
            if (this.x <= 0 || this.x >= canvas.width) {
                this.angle *= -1;
                this.reflect_cnt--;
            }
        },
        //弾の消去
        delete: function () {
            for (let i = 0; i < bullets.length; i++) {
                if (bullets[i] == this) {
                    bullets.splice(i, 1);
                    break;
                };

            }
        }
    };
}
//レーザーオブジェクトを生成する関数
function createLaser(origin, angle, maxReflect, size, damage, charaType, fireTime, chargeTime, lasers_cnt) {
    return {
        origin: origin,
        fireTime: fireTime,
        chargeTime: chargeTime,
        time_cnt: 0,
        angle: angle,
        lasers_cnt: lasers_cnt,
        //更新内容
        update: function () {
            let _angle = this.angle
            switch (charaType) {
                //プレイヤー
                case 0:
                    break;
                //エネミー
                case 1:
                    _angle -= 180;
                    break;
            }

            //チャージ中
            if (chargeTime > this.time_cnt) {
                Laser(_angle, maxReflect, size, damage, charaType, origin, this.time_cnt, this.time_cnt);
            }
            //発射中
            else {
                Laser(_angle, maxReflect, size, damage, charaType, origin, 0, this.time_cnt);
            }
            this.time_cnt++;
            if (fireTime + chargeTime < this.time_cnt) this.delete();
        },
        delete: function () {
            for (let i = 0; i < lasers.length; i++) {
                if (lasers[i] == this) {
                    lasers.splice(i, 1);
                    break;
                }
            }
        }
    }
}
//レーザーを描画、当たり判定関数
function Laser(angle, maxReflect, size, damage, charaType, origin, chargeTime, time_cnt) {
    let vx = angleToVector(angle - 90).x;
    let vy = angleToVector(angle - 90).y;
    let posX = origin.x;
    let posY = origin.y;
    let fromPosX;
    let fromPosY;
    let width = size;

    for (let i = 0; i < maxReflect; i++) {
        //始点を記録
        fromPosX = posX;
        fromPosY = posY;

        //測定
        while (true) {
            //上下の壁にぶつかったとき
            if (posY < 0 || canvas.height < posY) {
                i = maxReflect;
                break;
            }

            //左右の壁にぶつかったとき
            if (posX < 0 || canvas.width < posX) {
                //反射
                vx = -vx;
                posX += vx;
                posY += vy;
                break;
            }

            posX += vx;
            posY += vy;
        }

        //チャージ中のとき
        if (chargeTime > 0) {
            ctx.strokeStyle = "rgb(100,100,100)";
            ctx.setLineDash([time_cnt, 5]);
            width = size * 3;
        }
        else {
            ctx.strokeStyle = "rgb(0,0,0)";
            ctx.setLineDash([1, 0]);
            width = size;
        }

        //始点からぶつかった地点まで描画
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(fromPosX, fromPosY);
        ctx.lineTo(posX, posY);
        ctx.stroke();

        //チャージ中のとき
        if (chargeTime > 0) continue;

        // 線分の方程式 y = a * x + b を求める
        const a = (posY - fromPosY) / (posX - fromPosX);
        const b = fromPosY - a * fromPosX;
        //console.log("y=" + parseInt(a) + "x+" + parseInt(b));

        //傾きが縦のとき
        var Nan = false;
        if (isNaN(a + b)) {
            Nan = true;
        }

        //接触判定
        switch (charaType) {
            //プレイヤーによる接触
            case 0:
                for (let i = 0; i < enemys.length; i++) {

                    //存在しないとき
                    if (!enemys[i]) continue;

                    //レーザーとの接触
                    for (let x = enemys[i].x - (enemys[i].size / 2); x < enemys[i].x + (enemys[i].size / 2); x++) {
                        if (
                            (Nan && parseInt(enemys[i].x) - enemys[i].size / 2 < parseInt(posX) && parseInt(posX) < parseInt(enemys[i].x) + enemys[i].size / 2 && checkHighLow(angle, origin.y, enemys[i].y)) ||
                            (enemys[i].y - (enemys[i].size / 2) <= a * x + b && a * x + b <= enemys[i].y + (enemys[i].size / 2))) {
                            enemys[i].life(-damage);
                            break;
                        }
                    }
                };
                break;
            //エネミーによる接触
            case 1:
                let playerLeftX = player.x - player.size;
                let playerRightX = player.x + player.size;

                for (let x = parseInt(player.x) - (player.size / 2); x < parseInt(player.x) + (player.size / 2); x++) {
                    if (
                        (Nan && (playerLeftX < posX && posX < playerRightX) && checkHighLow(angle, origin.y, player.y)) ||
                        (parseInt(player.y) - (player.size / 2) <= a * x + b && a * x + b <= parseInt(player.y) + (player.size / 2))) {

                        player.life(-damage);
                        break;
                    }
                }
                break;
        }
    }
}

//相手に対して上下にいるかの判定
function checkHighLow(angle, y1, y2) {
    //上に向かって撃つっているとき
    if (angle % 360 === 0 && y1 > y2) {
        //console.log( parseInt(y1) +">"+  parseInt(y2));
        return true;
    }

    //下に向かって撃つっているとき
    if (angle % 360 === 180 && y1 < y2) {
        //console.log( parseInt(y1) +"<"+  parseInt(y2));
        return true;
    }

    return false;
}
//角度をxyベクトルに変換
function angleToVector(angle) {
    const radians = angle * Math.PI / 180; // 角度をラジアンに変換
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    return { x: x, y: y }; // x方向とy方向のベクトルをオブジェクトとして返す
}
//全体の当たり判定
function checkCollision() {
    //敵の接触
    for (let i = 0; i < enemys.length; i++) {

        //存在しないとき
        if (!enemys[i]) continue;

        //プレイヤーとの接触
        const dx = player.x - enemys[i].x;
        const dy = player.y - enemys[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.size + (enemys[i].size / 2)) {
            // エネミーのライフを減らす
            enemys[i].life(-1);
            //プレイヤーのライフを減らす
            player.life(-1);
        }
    };

    //アイテムの接触
    for (let i = 0; i < items.length; i++) {

        //存在しないとき
        if (!items[i]) continue;

        //プレイヤーとの接触
        const dx = player.x - items[i].x;
        const dy = player.y - items[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.size + (items[i].size / 2)) {
            items[i].itemF(i);
        }
    };

    //弾の接触
    for (let i = 0; i < bullets.length; i++) {
        //プレイヤーからの弾のとき
        if (bullets[i].charaType == 0) {
            //エネミー毎に当たっているか
            for (let j = 0; j < enemys.length; j++) {

                //存在しないとき
                if (!enemys[j] || !bullets[i]) continue;

                const dx = bullets[i].x - enemys[j].x;
                const dy = bullets[i].y - enemys[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < bullets[i].size + (enemys[j].size / 2)) {

                    // 敵のライフを減らす
                    enemys[j].life(-bullets[i].damage);

                    //当たった弾を消す
                    bullets.splice(i, 1);

                }
            }
        }
        //敵からの弾のとき
        else if (bullets[i].charaType == 1) {

            //存在しないとき
            if (!bullets[i]) continue;

            const dx = bullets[i].x - player.x;
            const dy = bullets[i].y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bullets[i].size + player.size) {

                //プレイヤーのライフを減らす
                player.life(-bullets[i].damage);

                //当たった弾を消す
                bullets.splice(i, 1);

            }
        }
    }
}





// イベントリスナーを登録する
canvas.addEventListener("mouseup", function (event) {
    if (event.button === 0) {
        if (nowPlay) {
            nowFire = false;
        }
    }
});
canvas.addEventListener('mousedown', function (event) {
    if (event.button === 0) {
        if (nowPlay) {
            nowFire = true;
        }
        else {
            endF.reStart();
        }
    }
});
canvas.addEventListener('mousemove', function (event) {
    // マウスの座標を取得
    //mouseX = event.clientX - canvas.offsetLeft;
    //mouseY = event.clientY - canvas.offsetTop;
    const canvasRect = canvas.getBoundingClientRect();
    mouseX = event.clientX - canvasRect.left;
    mouseY = event.clientY - canvasRect.top;
});
//テスト用
document.addEventListener("keydown", function (event) {
    if (event.key === 'z') {

        test_bulletIndex++;
        if (test_bulletIndex >= bullets_type_nameList.length) test_bulletIndex = 0;

        player.changeBullet(test_bulletIndex);
    }
});




//waveの開始時間
let wave_startTime = 0;
//waveの終了時間
let wave_endTime = 0;
//waveの初回動作
var wave_first = true;
//wave生成物
var create = [];
//wave状態
let wave_type = -1;
//UI_waveChange
var waveChange;
//次のwave
var nextWave = [];

//wave
var wave_name = ["", "X", "Meteor", "Triangle", "Shake",];
function wave() {
    //console.log("nowWave");
    if (wave_type === 0) {
        //waveInterval中
        if (_waveChange.waveWait || items.length > 0) {
            return;
        }
        nowWave++;
        console.log("waveStart");
        wave_startTime = time;

        //wave決定
        nextWave.push(Math.max((Math.floor(Math.random() * wave_name.length - 1)), 0) + 1);
        //nextWave.push(wave_type);

        //console.log(nextWave);
        wave_type = 1;
    }
    //初回
    else if (wave_type === -1) {
        //waveInterval中
        if (_waveChange.waveWait) {
            return;
        }
        nowWave++;
        console.log("waveStart");
        wave_startTime = time;

        //wave決定
        nextWave.push(Math.max((Math.floor(Math.random() * wave_name.length - 1)), 0) + 1);

        //console.log(nextWave);
        wave_type = 1;
    }

    //nextWave[0] = 5;
    switch (nextWave[0]) {
        case 1: wave_x(); break;
        case 2: wave_meteor(); break;
        case 3: wave_triangle(); break;
        case 4: wave_shake(); break;
        //case 5: wave_test(); break;
    }
}

function wave_test() {
    const wave_time_cnt = time - wave_startTime;

    //waveの時間
    const wave_time = 1;

    //初期生成
    if (wave_first) {
        wave_first = false;

        create.push(wave_createEnemy(8, startTime = 0, endTime = 0, interval = 100, PosType = 10));
    }

    //生成物の更新
    for (let i = 0; i < create.length; i++) {
        create[i].nowTime = wave_time_cnt;
        create[i].create();
        if (create[i].endCheck) {
            create.splice(i, 1);
        }
    }

    wave_end(wave_time);
}
function wave_shake() {
    const wave_time_cnt = time - wave_startTime;

    //waveの時間
    const wave_time = 10;

    //初期生成
    if (wave_first) {
        wave_first = false;

        create.push(wave_createEnemy(7, startTime = 0, endTime = 10, interval = 6, PosType = 9));
    }

    //生成物の更新
    for (let i = 0; i < create.length; i++) {
        create[i].nowTime = wave_time_cnt;
        create[i].create();
        if (create[i].endCheck) {
            create.splice(i, 1);
        }
    }

    wave_end(wave_time);
}
function wave_shake() {
    const wave_time_cnt = time - wave_startTime;

    //waveの時間
    const wave_time = 10;

    //初期生成
    if (wave_first) {
        wave_first = false;

        create.push(wave_createEnemy(7, startTime = 0, endTime = 10, interval = 6, PosType = 9));
    }

    //生成物の更新
    for (let i = 0; i < create.length; i++) {
        create[i].nowTime = wave_time_cnt;
        create[i].create();
        if (create[i].endCheck) {
            create.splice(i, 1);
        }
    }

    wave_end(wave_time);
}
function wave_triangle() {
    const wave_time_cnt = time - wave_startTime;

    //waveの時間
    const wave_time = 10;

    //初期生成
    if (wave_first) {
        wave_first = false;

        create.push(wave_createEnemy(6, startTime = 1, endTime = 1, interval = 100, PosType = 4));
        create.push(wave_createEnemy(0, startTime = 2, endTime = 2, interval = 100, PosType = 3));
        create.push(wave_createEnemy(0, startTime = 2, endTime = 2, interval = 100, PosType = 5));
        create.push(wave_createEnemy(6, startTime = 3, endTime = 3, interval = 100, PosType = 2));
        create.push(wave_createEnemy(6, startTime = 3, endTime = 3, interval = 100, PosType = 6));
        create.push(wave_createEnemy(6, startTime = 4, endTime = 4, interval = 100, PosType = 1));
        create.push(wave_createEnemy(0, startTime = 4, endTime = 4, interval = 100, PosType = 4));
        create.push(wave_createEnemy(6, startTime = 4, endTime = 4, interval = 100, PosType = 7));
        create.push(wave_createEnemy(6, startTime = 5, endTime = 5, interval = 100, PosType = 2));
        create.push(wave_createEnemy(6, startTime = 5, endTime = 5, interval = 100, PosType = 6));
        create.push(wave_createEnemy(0, startTime = 6, endTime = 6, interval = 100, PosType = 3));
        create.push(wave_createEnemy(0, startTime = 6, endTime = 6, interval = 100, PosType = 5));
        create.push(wave_createEnemy(6, startTime = 7, endTime = 7, interval = 100, PosType = 4));
    }

    //生成物の更新
    for (let i = 0; i < create.length; i++) {
        create[i].nowTime = wave_time_cnt;
        create[i].create();
        if (create[i].endCheck) {
            create.splice(i, 1);
        }
    }

    wave_end(wave_time);
}
function wave_meteor() {
    const wave_time_cnt = time - wave_startTime;

    //waveの時間
    const wave_time = 10;

    //初期生成
    if (wave_first) {
        wave_first = false;

        create.push(wave_createEnemy(5, startTime = 1, endTime = 10, interval = 5, PosType = 9));
    }

    //生成物の更新
    for (let i = 0; i < create.length; i++) {
        create[i].nowTime = wave_time_cnt;
        create[i].create();
        if (create[i].endCheck) {
            create.splice(i, 1);
        }
    }

    wave_end(wave_time);
}
function wave_x() {
    const wave_time_cnt = time - wave_startTime;

    //waveの時間
    const wave_time = 5;

    //初期生成
    if (wave_first) {
        wave_first = false;

        create.push(wave_createEnemy(3, startTime = 1, endTime = 8, interval = 70, PosType = 2));
        create.push(wave_createEnemy(4, startTime = 0, endTime = 8, interval = 70, PosType = 4));
        create.push(wave_createEnemy(3, startTime = 1, endTime = 8, interval = 70, PosType = 6));
    }

    //生成物の更新
    for (let i = 0; i < create.length; i++) {
        create[i].nowTime = wave_time_cnt;
        create[i].create();
        if (create[i].endCheck) {
            create.splice(i, 1);
        }
    }

    wave_end(wave_time);
}

//時間経過で次のwaveへ
function wave_end(wave_time) {
    //時間の経過でエネミーの召喚がなくなり、エネミー数が0になるとつぎのwaveへ
    if (time - wave_startTime > wave_time && enemys.length == 0) {
        wave_type = 0;
        wave_first = true;
        wave_endTime = time;
        _waveChange.on();
        nextWave.shift();

        player.life(1);

        //アイテム出現
        items.push(createItem(canvas.width * 3 / 4, 0, Math.max((Math.floor(Math.random() * itemTypes.length)), 0)));
        items.push(createItem(canvas.width * 2 / 4, 0, Math.max((Math.floor(Math.random() * itemTypes.length)), 0)));
        items.push(createItem(canvas.width * 1 / 4, 0, Math.max((Math.floor(Math.random() * itemTypes.length)), 0)));

        console.log("waveEnd");
    }
}
//wave内でエネミーを生成する関数
function wave_createEnemy(enemyType, startTime, endTime, Interval, PosType) {
    return {
        interval_cnt: 0,
        endCheck: false,
        nowTime: 0,
        create: function () {
            //設定時間内のとき
            if (startTime <= this.nowTime && this.nowTime <= endTime) {
                //エネミーの生成
                if (this.interval_cnt % Interval === 0) {
                    let posX;
                    let posY;
                    switch (PosType) {
                        //上段8分割位置指定
                        case 0:
                            posX = canvas.width * 0 / 8;
                            posY = 0;
                            break;
                        case 1:
                            posX = canvas.width * 1 / 8;
                            posY = 0;
                            break;
                        case 2:
                            posX = canvas.width * 2 / 8;
                            posY = 0;
                            break;
                        case 3:
                            posX = canvas.width * 3 / 8;
                            posY = 0;
                            break;
                        case 4:
                            posX = canvas.width * 4 / 8;
                            posY = 0;
                            break;
                        case 5:
                            posX = canvas.width * 5 / 8;
                            posY = 0;
                            break;
                        case 6:
                            posX = canvas.width * 6 / 8;
                            posY = 0;
                            break;
                        case 7:
                            posX = canvas.width * 7 / 8;
                            posY = 0;
                            break;
                        case 8:
                            posX = canvas.width * 8 / 8;
                            posY = 0;
                            break;
                        //上段ランダム
                        case 9:
                            posX = Math.random() * canvas.width;
                            posY = 0;
                            break;
                        //真ん中
                        case 10:
                            posX = canvas.width / 2;
                            posY = canvas.height / 2;
                            break;

                    }

                    var enemy = createEnemy(posX, posY, enemyType);
                    enemys.push(enemy);
                    this.interval_cnt = Interval;
                }
                this.interval_cnt--;
            }
            //時間を過ぎると
            else if (endTime < this.nowTime) {
                this.endCheck = true;
            }
        }
    }
}


// プレイヤーを召喚
const player = createPlayer(canvas.width / 2, canvas.height / 2 + 30, 10, 'black');

var restartCheck = false;
//ゲーム中のループを設定
function gameLoop() {

    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    info.clearRect(0, 0, info_c.width, info_c.height);
    stage.clearRect(0, 0, stage_c.width, stage_c.height);

    //waveを動作
    wave();

    // プレイヤーを描画
    player.update();
    // 敵を更新して描画
    enemys.forEach(function (enemy) {
        enemy.update();
    });
    // 弾を更新して描画
    bullets.forEach(function (bullet) {
        bullet.update();
    });
    // レーザーを更新して描画
    lasers.forEach(function (laser) {
        laser.update();
    });
    // アイテムを更新して描画
    items.forEach(function (item) {
        item.update();
    });

    //全体の当たり判定
    checkCollision();

    //UIを描画
    drawUI();

    //wave変更
    if (_waveChange.changeNow) {
        _waveChange.update();
    }

    // 画面上下外に出た弾を削除
    bullets.forEach(function (bullet, index) {
        if (bullet.y < 0 || canvas.height < bullet.y) {
            bullets.splice(index, 1);
        }
    });
    // 画面下外に出た敵を削除
    enemys.forEach(function (enemy, index) {
        if (enemy.y > canvas.height) {
            enemys.splice(index, 1);
        }
    });
    // 画面下外に出たアイテムを削除
    items.forEach(function (item, index) {
        if (item.y > canvas.height) {
            items.splice(index, 1);
        }
    });

    // ライフが0になったら負け
    if (player.playerLife <= 0) {
        console.log("gameOver");
        nowPlay = false;
        restartCheck = false;
        requestAnimationFrame(gameEnd);
    }
    else {
        // 次のフレームを要求
        requestAnimationFrame(gameLoop);
    }
}



//ゲーム終了時のループを設定
const endF = gameEndFunction();
function gameEndFunction() {
    return {
        gameEnd_inTime: 0,
        gameEnd_outTime: 0,
        backPos: 0,
        endCheck: false,
        update: function () {
            let inLimit = 30;

            // キャンバスをクリア
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            info.clearRect(0, 0, info_c.width, info_c.height);
            stage.clearRect(0, 0, stage_c.width, stage_c.height);


            //back
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);


            ctx.fillStyle = "white";
            //text1
            ctx.font = "30px Arial";
            var text = "Game Over";
            ctx.fillText(text, cvc_x - ctx.measureText(text).width / 2, cvc_y - 220);


            //score
            ctx.font = "13px Arial";
            var text = "score";
            ctx.fillText(text, cvc_x - ctx.measureText(text).width / 2, cvc_y - 80);

            ctx.font = "30px Arial";
            var text = scoreCal().toString();
            ctx.fillText(text, cvc_x - ctx.measureText(text).width / 2, cvc_y - 40);


            //restart
            let textLine_w = 180;
            let textLine_h = 0.8;
            let textLine_x = cvc_x - textLine_w / 2;
            let textLine_y = cvc_y + 105;

            ctx.font = "13px Arial";
            var text = "ReStart";
            let text_x = cvc_x - ctx.measureText(text).width / 2;
            let text_y = cvc_y + 100;

            let button_w = 300;
            let button_h = 200;
            let button_x = cvc_x;
            let button_y = cvc_y + 100;


            if (button_x - button_w / 2 < mouseX && mouseX < button_x + button_w / 2 &&
                button_y - button_h / 2 < mouseY && mouseY < button_y + button_h / 2) {

                ctx.fillStyle = "rgb(255,255,255)";
                ctx.fillText(text, text_x, text_y);

                //ctx.fillRect(button_x - button_w / 2, button_y - button_h / 2, button_w, button_h);

                ctx.fillStyle = "rgb(255,255,255)";
                ctx.fillRect(textLine_x, textLine_y, textLine_w, textLine_h);

                restartCheck = true;
            }
            else {
                ctx.fillStyle = "rgb(100,100,100)";
                ctx.fillText(text, text_x, text_y);
                restartCheck = false;
            }


            //text2
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.font = "18px Arial";
            var text = "Thank you for playing!!!";
            ctx.fillText(text, cvc_x - ctx.measureText(text).width / 2, cvc_y + 230);

            ctx.font = "11px Arial";
            var text = "made by Meu";
            ctx.fillText(text, cvc_x - ctx.measureText(text).width / 2, cvc_y + 260);

            //ゲームの再スタート
            if (this.endCheck) {
                this.startChange();
            }

            //初期表示フェード
            ctx.fillStyle = "rgb(0,0,0," + (1 - this.gameEnd_inTime / inLimit) + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (this.gameEnd_inTime < inLimit) {
                this.gameEnd_inTime++;
            }
        },
        startChange: function () {
            let maxSpeed = 11;

            //back
            ctx.fillStyle = "white";
            ctx.fillRect(0, this.gameEnd_outTime - canvas.height, canvas.width, canvas.height);

            let speed = Math.max(1, maxSpeed * (canvas.height - this.gameEnd_outTime) / 80)
            this.gameEnd_outTime += speed;

            if (this.gameEnd_outTime >= canvas.height) {
                location.reload();
            }
        },
        endChange: function () {
            let maxSpeed = 11;

            let infoMove = this.backPos / 4;
            info.fillStyle = "white";
            stage.fillStyle = "white";
            info.fillRect(infoMove - info_c.width, 0, info_c.width, info_c.height);
            stage.fillRect(-infoMove + stage_c.width, 0, stage_c.width, stage_c.height);


            //back
            ctx.fillStyle = "black";
            ctx.fillRect(0, this.backPos - canvas.height, canvas.width, canvas.height);

            let speed = Math.max(1, maxSpeed * (canvas.height - this.backPos) / 80)
            this.backPos += speed;
            //console.log("changeNow" + speed);
        },
        reStart: function () {
            if (restartCheck) this.endCheck = true;
        }
    }
}
function gameEnd() {

    if (endF.backPos >= canvas.height) {
        endF.update();
    }
    else {
        endF.endChange();
    }

    // 次のフレームを要求
    requestAnimationFrame(gameEnd);
}
function gameStart_fade() {

    let setSecondTIme = 60;

    if (secondTime < setSecondTIme && time < 1) {

        let infoMove = secondTime * secondTime / 10;
        info.fillStyle = "white";
        stage.fillStyle = "white";
        info.fillRect(infoMove, 0, info_c.width, info_c.height);
        stage.fillRect(-infoMove, 0, stage_c.width, stage_c.height);
    }
}



//ゲーム中時間計測
setInterval(function () {
    if (nowPlay) {
        secondTime++;
        if (secondTime >= 100) {
            time++;
            secondTime = 0;
        }
    }

}, 10);



// ゲームループを開始
requestAnimationFrame(gameFirst);