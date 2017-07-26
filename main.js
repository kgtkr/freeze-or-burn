phina.globalize();

var W = 640; 
var H = 480;
var ASSETS = {
    image: {
        back: "back.png",
    }
};

//ゲームシーン
phina.define("MainScene", {
    superClass: "CanvasScene",
    init: function () {
        let self = this;

        this.superInit();
        // 背景
        this.back = Sprite("back").addChildTo(this);
        this.back.origin.set(0, 0);
        
        //プレイヤー
        var playerCS = RectangleShape();
        playerCS.radius = 15;
        this.player = playerCS.addChildTo(this);
        this.player.SPEED = 5;
        this.player.x = W / 2;
        this.player.y = H - 50;
        this.player.charge = 0;
        this.player.n温度 = 0;
        this.player.update = function (app) {
            var p = app.pointer;
            var vec = new Vector2(p.x - this.x, p.y - this.y);

            //移動するか
            var isMove = vec.lengthSquared() > 10 * 10;

            //正規化
            vec.normalize();

            //マウスと50以上離れているなら移動
            if (isMove) {
                this.x += vec.x * 5;
                this.y += vec.y * 5;
            }


            //弾
            if (p.getPointingStart()&&this.n温度!==0) {
                var cs = CircleShape();
                cs.radius = 5;
                cs.fill = this.n温度 >0 ? "red" : "blue";
                var b = cs.addChildTo(self.b);
                b.x = this.x;
                b.y = this.y;
                b.n温度 = Math.round(this.n温度/10)+(this.n温度>0?1:-1);
                b.update = function (app) {
                    this.y -= 5;

                    if (isOut(this)) {
                        this.remove();
                    }
                }
            }

            //温度
            playerCS.fill = s温度色(this.n温度);
        }

        //敵
        this.enemy = CanvasElement().addChildTo(this);
        //文字列
        this.label = CanvasElement().addChildTo(this);
        //弾
        this.b = CanvasElement().addChildTo(this);

        this.score = 0;

        this.count = 0;

        //自機温度
        this.player.label = Label().addChildTo(this.label);
        this.player.label.fill = "green";
        this.player.label.update = function (app) {
            this.text = self.player.n温度.toString();
            this.x = self.player.x;
            this.y = self.player.y;
        };

        //得点ラベル
        this.scoreL = Label().addChildTo(this);
        this.scoreL.fill = "white";
        this.scoreL.origin.set(0, 0);
        this.scoreL.x = 10;
        this.scoreL.y = 10;
        this.scoreL.update = function (app) {
            this.text = self.score;
        };
    },

    update: function (app) {
        var self = this;

        if (Math.randint(0, 120) === 0 && this.enemy.children.length <= 10) {
            //温度と種別セット
            var n温度 = 0;
            do {
                n温度 = Math.randint(-100, 100);
            } while (n温度 === 0);
            var n種別 = n温度 > 0 ? 1 : -1;

            var cs = (n種別 === 1 ? CircleShape : TriangleShape)();
            cs.radius = 35;
            var e = cs.addChildTo(this.enemy);
            e.n温度 = n温度;
            e.n種別 = n種別;
            e.n得点 = e.n温度 * e.n種別;
            e.y = 0;
            //氷なら左
            e.x = e.n種別 === 1 ? W : 0;
            e.vec = null;
            e.update = function (app) {
                if (Math.randint(0, 60) === 0||this.vec===null) {
                    this.vec = new Vector2(self.player.x - this.x, self.player.y - this.y);
                    this.vec.normalize();
                    this.vec.mul(Math.randfloat(0.1, 1.5));
                }

                this.x += this.vec.x;
                this.y += this.vec.y;

                cs.fill = s温度色(e.n温度);
            }

            //温度
            e.label = Label().addChildTo(this.label);
            e.label.fill = "yellow";
            e.label.update = function (app) {
                this.text = e.n温度.toString();
                this.x = e.x;
                this.y = e.y;
            };
        }

        for(let e of this.enemy.children) {
            //当たり判定
            if (e.hitTestElement(this.player) && this.count % 30 === 0) {
                var e温度 = e.n温度;
                var p温度 = this.player.n温度;

                e.n温度 +=p温度;

                this.player.n温度 +=e温度;
                if (this.player.n温度 >= 100 || this.player.n温度 <= -100) {
                    this.exit("result", { score: this.score });
                }
            }

            for(let b of this.b.children) {
                if (e.hitTestElement(b)) {
                    e.n温度 += b.n温度;
                    b.remove();
                }
            }

            //+100～-100
            e.n温度 = (e.n温度 > 100 ? 100 : (e.n温度 < -100 ? -100 : e.n温度));

            if ((e.n種別 === 1 && e.n温度 <= 0) || (e.n種別 === -1 && e.n温度 >= 0)) {
                this.score += e.n得点;
                e.remove();
                e.label.remove();
            }
        }

        this.count++;
    }
});

// メイン処理
phina.main(function () {
    var app = GameApp({
        width: W,
        height: H,
        fps: 60,
        title: "FreezeOrBurn",
        assets: ASSETS,
        fit: false
    });
    app.run();
});


//温度から温度色のもじれつを返す
var s温度色 = function (n温度) {
    if (n温度 === 0) {
        return "rgb(255,255,255)";
    } else if (n温度 > 0) {
        var n = Math.round(255 - n温度 / 100 * 255);
        return "rgb(255," + n + "," + n + ")";
    } else {
        var n = Math.round(255 + n温度 / 100 * 255);
        return "rgb(" + n + "," + n + ",255)";
    }
};

var isOut = function (o) {
    return o.right < 0 || o.left > W || o.bottom < 0 || o.top > H;
}
