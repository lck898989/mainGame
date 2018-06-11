var imagePrefab = require("./ImagePrefab.js");
var comm = require("../game3/Common.js");
var game3 = require("../game3/game.js");
cc.Class({
    extends: cc.Component,

    properties: {
        imagePrefabArr : {
            default : [],
            type    : [cc.Prefab],
        },
        girdSize    : 116.7,
        back        : cc.Prefab,
        nextShape : {
            default : null,
            type    : cc.Node,
        },
        next2 : {
            default : null,
            type    : cc.Node,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
         this.nodeHeight = this.node.height;
         this.nodeWidth = this.node.width;
         this.initMap();
         //创建一个空节点用来盛放生成的预制体
         this.nodeArr = this.initImage(this.node,this.createRandomX(this.createRandom(0,6)),this.nodeHeight/2 - this.girdSize/2);
         this.createNext();
         //从游戏屏幕上下落的次数
         this.times = 0;
         //开始下落
         this.downFunction(this.nodeArr,1);
         this.iState = 0;
         this.totalTime = 0;
         this.registerKeyBoard();
    },
    registerKeyBoard : function(){
        //注册键盘监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.onKeyUp,this);
    },
    onKeyDown : function(event){
        switch(event.keyCode){
            case cc.KEY.down:
                 this.quickDown();
                 break;
            case cc.KEY.left:
                 this.moveLeft();
                 cc.log("<-----");
                 break;
            case cc.KEY.right:
                 this.moveRight();
                 cc.log("----->");
                 break;  
            case cc.KEY.f:
                 this.rotate();
                 //旋转操作
                 break;                  
        }
    },
    onKeyUp   : function(event){
        switch(event.keyCode){
            case cc.KEY.down:
                 //关闭快速下落计时器
                 this.unscheduleAllCallbacks();
                 //开始正常下落代码
                 this.downFunction(this.nodeArr,1);
                 break;
            case cc.KEY.left:
                 break;
            case cc.KEY.right:
                 break;  
            case cc.KEY.f:
                 //旋转操作
                 break;                 
        }
    },
    onDestroy () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },
    start () {

    },
    createRandomX : function(randomNumber){
        return this.backGroundArr[0][randomNumber];
    },
    //产生随机数
    createRandom : function(min,max){
         return Math.floor(Math.random()*(max - min) + min);
    },
    //初始化游戏场景主背景12行6列的网格
    initMap : function(){
        //初始化y坐标
        var y = this.nodeHeight/2 - this.girdSize/2;
        //初始化x坐标
        var x = -this.nodeWidth/2 + this.girdSize/2;
        cc.log("x is " + x);
        this.backGroundArr = [];
        this.map = [];
        //12行6列的网格
        for(var i = 0;i < comm.MAP_ROW; i++){
            //设置它的y坐标
            var tempY =y - i * this.girdSize;
            tempY = Number(tempY.toFixed(2));
            cc.log("tempY is " + tempY);
            this.backGroundArr[i] = [];
            this.map[i] = [];
            for(var j = 0; j < comm.MAP_COL;j++){
                var outArr = this.backGroundArr[i];
                var mapData = this.map[i];
                var tempX = x + j * this.girdSize;
                tempX = Number(tempX.toFixed(2));
                cc.log("tempX is " + tempX);
                //y坐标不变，x坐标要变
                var tempPrefab = this.setPrefabPosition(this.back,tempX,tempY,this.node);
                // var shape = new Shape(tempPrefab,-1);
                tempPrefab.isFilled = 0;
                tempPrefab.type = -1;
                tempPrefab.node = null;
                // var shape = new Shape(tempPrefab,-1);
                outArr[j]=tempPrefab;
                mapData[j] = 0;
            }
        }
        cc.log("backGroundArr is " +this.backGroundArr);
    },
    //生成形状在这个节点数组中加入父节点
    initImage : function(parentNode,x,y){
        this.times = 0;
        //动态生成一个新的节点将生成的预制体节点加入到该父节点上
        // var newNode = new cc.Node();
        // parentNode.addChild(newNode);
        //用来存放预制体的数组
        //定义从哪一列开始下落
        var randomCol = game3.prototype.createRandom(0,6);
        var prefabArrTemp = [];
        //从上往下生成
        var y = this.nodeHeight/2 + this.girdSize/2+1*this.girdSize;
        for(var i = 0;i < 2;i++){
            // var offSet = i * this.prefabHeight;
            // cc.log("offSet is " + offSet);
            // //产生0-3的随机数
            var index = Math.floor(Math.random()*200000) % 8;
            // //将对应的颜色索引存放到该数组中
            // // this.boxColorArr.push(this.prefabArr[index].color);
            // cc.log("index is " + index);
            // //将对应的预制体取出来转化为节点然后显示
            var prefabNode = game3.prototype.createPrefab(this.imagePrefabArr[index]);
            // cc.log("x is " + x + " and y is "+ y - offSet);
            //设置预制节点的位置
            prefabNode.setPosition(this.backGroundArr[i][randomCol].x,y-i*this.girdSize);
            
            prefabNode.getComponent("Image").type = index;
            prefabNode.active = false;
            this.backGroundArr[i][randomCol].node = prefabNode;
            cc.log("------type is " + prefabNode.getComponent("Image").type);
            //将该预制节点添加为parentNode的孩子
            parentNode.addChild(prefabNode);
            // var shape = new Shape(prefabNode,index);
            //将当前预制体节点存放到预制体临时数组里面
            prefabArrTemp.push(prefabNode);
        }
        console.log(prefabArrTemp);
        //生成父节点
        return prefabArrTemp;
    },
    //生成下一个形状
    createNext : function(){
        this.nextBlock = this.generateNext(this.node,this.createRandomX(this.createRandom(0,6)),this.nodeHeight/2 - this.girdSize);
        //显示下一个形状
        this.showNextShape(this.nextBlock,this.nextShape);
        //生成下下个形状
        this.next2Block = this.generateNext(this.node,this.createRandomX(this.createRandom(0,6)),this.nodeHeight/2 - this.girdSize);
        //显示下下个形状
        this.showNextShape(this.next2Block,this.next2);
    },
    //生成下一个形状
    generateNext : function(parentNode,x,y){
        return this.initImage(parentNode,x,y);
    },
    //显示下一个形状
    showNextShape : function(nextBlock,parentNode){
        //显示下一个形状之前删除这个节点的所有子节点
        if(parentNode.childrenCount > 0){
            for(let k = 0;k<parentNode.childrenCount;k++){
                //销毁该子节点,如果销毁节点成功的话就显示下一个形状
                parentNode.children[k].destroy();
            }
        }
        //依次生成预制节点组成的节点数组
        for(let i = 0;i<2;i++){
            var type = nextBlock[i].getComponent("Image").type;
            // var spriteFrame = nextBlock[i].getComponent("cc.Sprite").spriteFrame;
            this.setPrefabPosition(this.imagePrefabArr[type],0,140-i*this.girdSize,parentNode);
        }
        // for(let k = 0;k<3;k++){
        //     var pre = ;
        //     this.setPrefabPosition(,50,50+k*this.prefabHeight,this.nextShape);
        // }
    },
     /**
    @param prefab:将要生成预制节点的预制体
    @param x     :将要生成预制节点的x坐标
    @param y     :将要生成预制节点的y坐标
    @param parentNode : 生成的预制节点的父节点
     */
    setPrefabPosition : function(prefab,x,y,parentNode){
        var prefab = this.createPrefab(prefab);
        prefab.setPosition(x,y);
        parentNode.addChild(prefab);
        return prefab;
    },
    //创建一个预制体节点
    createPrefab : function(prefab){
        var prefabNode = cc.instantiate(prefab);
        return prefabNode;
    },
    //查看当前的棍处于哪一列
    getColumn : function(node){
        //竖行的条
        var indexGrid = this.chooseColumnByLocation(node.x);
        //放回列号
        return indexGrid;
    },
    //根据坐标选择位于哪个列
    chooseColumnByLocation : function(x){
        switch(x){
            case this.backGroundArr[0][0].x:
                return 0;
            case this.backGroundArr[0][1].x:
                return 1;
            case this.backGroundArr[0][2].x: 
                return 2;
            case this.backGroundArr[0][3].x: 
                return 3;
            case this.backGroundArr[0][4].x:
                return 4;
            case this.backGroundArr[0][5].x:
                return 5;                 
        }
    },
    //根据坐标获得位于哪一行
    getRow : function(node){
        var yIndexResult;
        cc.log("node is " + node);
        yIndexResult = this.chooseRawByLocation(node.y);
        return yIndexResult;
    },
    /***
        根据y坐标数值得到对应的行
        返回对应的行数
        @param : y 传入方法中的y坐标
        @return 返回坐标对应的行号
    * */
    chooseRawByLocation : function(y){
        switch(y){
            case this.backGroundArr[11][0].y:
                return 11;
            case this.backGroundArr[10][0].y:
                return 10;
            case this.backGroundArr[9][0].y: 
                return 9;
            case this.backGroundArr[8][0].y: 
                return 8;
            case this.backGroundArr[7][0].y:
                return 7;
            case this.backGroundArr[6][0].y:
                return 6;
            case this.backGroundArr[5][0].y:
                return 5;
            case this.backGroundArr[4][0].y:
                return 4;
            case this.backGroundArr[3][0].y: 
                return 3;
            case this.backGroundArr[2][0].y: 
                return 2;
            case this.backGroundArr[1][0].y:
                return 1;
            case this.backGroundArr[0][0].y:
                return 0;    
        }
    },
    update (dt) {
        // this.totalTime += dt;
        // if(totalTime >= 1){
        //     //执行下落动作
        //     this.moveDown(this.nodeArr);
        // }

    },
    //定时器控制下落
    downFunction : function(nodeArr,time){
        var self = this;
        self.schedule(function(dt){
            cc.log("dt is " + dt);
            self.updatePrefatY(nodeArr);
        }.bind(self),time);
    },
    //计时器回调函数
    // callBack     : function(){
    //     this.updatePrefatY();
    // },
    //更新预制体节点的y坐标
    updatePrefatY : function(nodeArr){
        cc.log("nodeArr is " + nodeArr);
        if(nodeArr.length != 0){
            if(nodeArr[0].y > this.nodeHeight/2){
                this.times++;
                // for(let m = 2;m >=0;m--){
                //     nodeArr[m].y -= (this.nodeWidth/6);
                // }
                // for(let colN = 0;colN < 6;colN++){
                //     //如果有一列的背景状态为1就停止游戏
                //     if(this.backGroundArr[0][colN].isFilled === 1){
                //         //取消所有计时器
                //         this.unscheduleAllCallbacks();
                //         this.gameOver = true;
                //         //使界面变为不可操作状态
                //         // alert("游戏结束");
                //     }
                // }
                for(let m = 0;m<1;m++){
                    nodeArr[m].active = false;
                }
                if(this.times === 1){
                    nodeArr[1].active = true;
                    nodeArr[1].y = this.backGroundArr[0][0].y;
                    // if(this.backGroundArr[0][this.getColumn(nodeArr[2].x)].isFilled != 1){
                    // }else{
                    //     nodeArr[2].active = false;
                    //     //游戏结束
                    //     alert("游戏结束");
                    //     //停止所有计时器
                    //     this.unscheduleAllCallbacks();
                    // }
                    
                }else if(this.times === 2){
                    nodeArr[1].active = true;
                    nodeArr[0].active = true;
                    nodeArr[1].y = this.backGroundArr[1][0].y;
                    nodeArr[0].y = this.backGroundArr[0][0].y;
                    // if(this.backGroundArr[0][this.getColumn(nodeArr[1].x)].isFilled != 1){
                    // }else{
                    //     nodeArr[2].active = false;
                    //     nodeArr[1].active = false;
                    //     this.unscheduleAllCallbacks();
                    // }
                    
                }
            }else{
                //如果允许下落的话条的y坐标向下移动
                if(this.CheckIsDown(nodeArr)){
                        //下落节点数组,
                        this.down(nodeArr);
                    //判断方格是否可以消除
                    //位移3个方格
                    
                }else{
                    // //如果不能下落的话改变背景方格状态(背景方格更新完成之后进行再次生成节点数组)
                    // this.changeBackBlockStatus(nodeArr);
                    // //生成下一个形状
                    // this.createNext();
                    this.changeMap(nodeArr);
                    this.unscheduleAllCallbacks();
                    //固定完之后重新生成随机预制体节点
                    this.nodeArr = this.nextBlock;
                    //开启计时器
                    this.downFunction(this.nodeArr,1);
                    //生成下一个形状
                    this.createNext();
                    // //显示下一个形状
                    // this.showNextShape(this.nextBlock);
                    //如果是不能下落的话就是前一个条形已经固定下来了，固定下来之前已经生成了下一个的形状
                    // for(var j = 0;j<3;j++){
                    //     nodeArr[j].prefabNode.y -= this.speed;
                    // }
                    
                }
            }
            // cc.log("-------->>>>>>>" + nodeArr[0].prefabNode.y);
            
        }
    },
    changeMap : function(nodeArr){
        if(nodeArr.length > 0){
            for(let k = 0;k<nodeArr.length;k++){
                //将所有的坐标变成只保留两位小数的数字
                nodeArr[k].x = Number(nodeArr[k].x.toFixed(2));
                nodeArr[k].y = Number(nodeArr[k].y.toFixed(2));
            }
            for(let i = 0;i<nodeArr.length;i++){
                //当前停止的节点对应的地图位置
                var row = this.getRow(nodeArr[i]);
                var col = this.getColumn(nodeArr[i]);
                this.map[row][col] = 1;
            }
        }

    },
   //方块下落方法
   down : function(nodeArr){
        //位移3个方格
        for(var i = nodeArr.length-1;i >= 0;i--){
            var row = this.getRow(nodeArr[i]);
            var col = this.getColumn(nodeArr[i]);
            nodeArr[i].y = this.backGroundArr[row+1][col].y; 
        }
    },
    quickDown :function(){
        //关闭正常下落的计时器
        this.unscheduleAllCallbacks();
        //执行快速下路代码
        this.downFunction(this.nodeArr,0.1);
        
    },
    //将这两个预制体的坐标数值保留两位小数
    remainTwoNumber : function(nodeArr){
        for(let k = 0;k<nodeArr.length;k++){
            //将所有的坐标变成只保留两位小数的数字
            nodeArr[k].x = Number(nodeArr[k].x.toFixed(2));
            nodeArr[k].y = Number(nodeArr[k].y.toFixed(2));
        }
    },
    //旋转方法
    rotate : function(){
        //记录下旋转的位置
        // this.unscheduleAllCallbacks();
        if(this.nodeArr[0].y < 700){
            var self = this;
            //旋转中心
            var x0 = this.nodeArr[1].x;
            var y0 = this.nodeArr[1].y;
            var x0Row = this.getRow(this.nodeArr[1]);
            var x0Col = this.getColumn(this.nodeArr[1]);
    
            // var rotateArr = [[x0Row-1,x0Col],[x0Row,x0Col+1],[x0Row+1,x0Col],[x0Row,x0Col-1 ]];
            //旋转0度对应的坐标
            var x = this.nodeArr[0].x;
            var y = this.nodeArr[0].y;
            
            //旋转45度对应的坐标
            var rotate45X = (x-x0)*Math.cos(-Math.PI/4)-(y-y0)*Math.sin(-Math.PI/4) + x0;
            var rotate45Y = (x-x0)*Math.sin(-Math.PI/4)+(y-y0)*Math.cos(-Math.PI/4) + y0;
            //节点的旋转状态
            var nodeAngle = this.nodeArr[0].getComponent("Image").angle;
            var canAction = false;
            if(nodeAngle === 0){
                if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                    //旋转90度对应的坐标位置
                    var rotate90X = this.backGroundArr[x0Row][x0Col+1].x;
                    var rotate90Y = this.backGroundArr[x0Row][x0Col+1].y;               
                    var bezier = [cc.p(x,y),cc.p(rotate45X,rotate45Y),cc.p(rotate90X,rotate90Y)];
                    // //初始向量
                    // var startV = cc.v2(x,y).sub(cc.v2(x0,y0));
                    // var result = startV.rotate(Math.PI/2);
                    this.nodeArr[0].x = rotate90X;
                    this.nodeArr[0].y = rotate90Y;
                    this.nodeArr[0].getComponent("Image").angle = 1;
                    //能够旋转
                    canAction = true;
                }
            }else if(nodeAngle === 1){
                if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                    var rotate90X = this.backGroundArr[x0Row+1][x0Col].x;
                    var rotate90Y = this.backGroundArr[x0Row+1][x0Col].y;   
                    //创建贝塞尔曲线所对应的最少坐标
                    var bezier = [cc.p(x,y),cc.p(rotate45X,rotate45Y),cc.p(rotate90X,rotate90Y)];
                    // //初始向量
                    // var startV = cc.v2(x,y).sub(cc.v2(x0,y0));
                    // var result = startV.rotate(Math.PI/2);
                    this.nodeArr[0].x = rotate90X;
                    this.nodeArr[0].y = rotate90Y;
                    //旋转之后变成180度
                    this.nodeArr[0].getComponent("Image").angle = 2;
                    canAction = true;
                }
            }else if(nodeAngle === 2){
                if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                    var rotate90X = this.backGroundArr[x0Row][x0Col-1].x;
                    var rotate90Y = this.backGroundArr[x0Row][x0Col-1].y;   
                    //创建贝塞尔曲线所对应的最少坐标
                    var bezier = [cc.p(x,y),cc.p(rotate45X,rotate45Y),cc.p(rotate90X,rotate90Y)];
                    // //初始向量
                    // var startV = cc.v2(x,y).sub(cc.v2(x0,y0));
                    // var result = startV.rotate(Math.PI/2);
                    this.nodeArr[0].x = rotate90X;
                    this.nodeArr[0].y = rotate90Y;
                    //旋转之后变成270度
                    this.nodeArr[0].getComponent("Image").angle = 3;
                    canAction = true;
                }
                
            }else if(nodeAngle === 3){
                if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                    var rotate90X = this.backGroundArr[x0Row-1][x0Col].x;
                    var rotate90Y = this.backGroundArr[x0Row-1][x0Col].y;   
                    //创建贝塞尔曲线所对应的最少坐标
                    var bezier = [cc.p(x,y),cc.p(rotate45X,rotate45Y),cc.p(rotate90X,rotate90Y)];
                    // //初始向量
                    // var startV = cc.v2(x,y).sub(cc.v2(x0,y0));
                    // var result = startV.rotate(Math.PI/2);
                    this.nodeArr[0].x = rotate90X;
                    this.nodeArr[0].y = rotate90Y;
                    //旋转之后变成360度
                    this.nodeArr[0].getComponent("Image").angle = 0;
                    canAction = true;
                }
            }
            
            // async
            // function test(resolve,reject){
            //     var bezierAction = cc.bezierTo(0.08,bezier);
            //     self.nodeArr[0].runAction(bezierAction);
            // }
            if(canAction){
                (function test(cb){
                    var bezierAction = cc.bezierTo(0.008,bezier);
                    self.nodeArr[0].runAction(bezierAction);
                    cb()
                })(pro);
                function pro() {
                    cc.log("承诺正常执行########");
                    cc.log("@@@@@@@@@@" + self.nodeArr[0].x);
                    cc.log("@@@@@@@@@@" + self.nodeArr[0].y);
                }
                cc.log("结束旋转动作!!!!!");
            }
        }
        
    },
    //检查是否可以旋转
    /**
     * @param  {旋转中心节点所在的行} centerRow
     * @param  {旋转中心节点所在的列} centerCol
     * @param  {待旋转节点的角度属性} angle
     */
    checkIsRotate : function(centerRow,centerCol,angle){
            //四个方向
            //如果当前方向是0的话就看看一方向对应的背景方格的状态是什么
            if(angle === 0){
                //检查旋转中心节点的右边背景方格的状态是否为1
                if(this.map[centerRow][centerCol+1] === 1){
                    return false;
                }else{
                    return true;
                }
            }else if(angle === 1){
                if(this.map[centerRow + 1][centerCol] === 1){
                    return false;
                }else{
                    return true;
                }
            }else if(angle === 2){
                if(this.map[centerRow][centerCol-1] === 1){
                    return false;
                }else{
                    return true;
                }
            }else if(angle === 3){
                if(this.map[centerRow-1][centerCol] === 1){
                    return false;
                }else{
                    return true;
                }
            }
    },
     //左移方法
     moveLeft    : function(){
        this.remainTwoNumber(this.nodeArr);
        if(this.CheckIsLeft()){
            for(var i = 0;i < this.nodeArr.length;i++){
                this.leftMove(this.nodeArr[i]);
                cc.log(this.getColumn(this.nodeArr[i]));
                // if((this.nodeArr[i].x <= -this.nodeWidth/2 + this.prefabHeight/2)){
                //     this.nodeArr[i].x = -this.nodeWidth/2 + this.prefabHeight/2;
                // }
            }
        }
    },
    leftMove : function(node){
        var row = this.getRow(node);
        var col = this.getColumn(node);
        //将当前背景节点的node改为null
        // this.backGroundArr[row][col].node = null;
        node.x = this.backGroundArr[row][col-1].x;
    },
   //右移方法
   moveRight   : function(){
        this.remainTwoNumber(this.nodeArr);
        if(this.CheckIsRight()){
            for(var i = 0;i < this.nodeArr.length;i++){
                this.rightMove(this.nodeArr[i]);
            }
        }
    },
    rightMove : function(node){
        var row = this.getRow(node);
        var col = this.getColumn(node);
        //将当前背景节点的node改为null
        node.x = this.backGroundArr[row][col+1].x;
    },
    /**
        检测是否可以向下移动
        返回true或者false
        @return true  : 可以下落
        @return false : 不可以下落
    **/
    CheckIsDown : function(nodeArr){
        if(nodeArr.length != 0){
            //如果是整个方块下落的时候的方法
            // var row = [];
            // for(var i = 0;i<nodeArr.length;i++){
            //     row[i] = this.getRow(nodeArr[i].prefabNode);
            // }
            // var col = this.getColumn(nodeArr[nodeArr.length - 1].prefabNode);
            this.remainTwoNumber(nodeArr);
            var row = this.getRow(nodeArr[nodeArr.length-1]);
            var col = this.getColumn(nodeArr[nodeArr.length-1]);
            if(row != 11){
                cc.log(this.map[row+1][col]);
                if(this.map[row + 1][col] === 1){
                    //将对应的背景方格的状态改为1
                    return false;
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }
    },
    /**
       检测是否可以向左移动
    **/
   CheckIsLeft : function(){
        //如果两个形状还没有完全落下来不能左移右移
        if(this.nodeArr[0].y > this.nodeHeight/2){
                return false;
        }
        this.remainTwoNumber(this.nodeArr);
        var xArr = [];
        var rowArr = [];
        var colArr = [];
        for(let i = 0;i< this.nodeArr.length;i++){
            xArr.push(this.nodeArr[i].x);
            rowArr.push(this.getRow(this.nodeArr[i]));
            colArr.push(this.getColumn(this.nodeArr[i]));
        }
        var minX = Math.min.apply(Math,xArr);
        cc.log("minX is " + minX);
        //找到最小列
        var col = this.chooseColumnByLocation(minX);
        if(xArr.length > 0){
            if(xArr[0] === xArr[xArr.length-1]){
                if(col === 0){
                    return false;
                }
                //说明是同一列
                //找出x坐标最小的左边看看它的坐标地图状态值是多少
                if(this.map[rowArr[0]][col-1] === 0 && this.map[rowArr[1]][col-1] === 0){
                    return true;
                }else{
                    return false;
                }

            }else{
                //同一行
                if(this.map[rowArr[0]][col-1] === 0){
                    return true;
                }else{
                    return false;
                }
            }
        }
    },
    //检测是否可以向右移动
    CheckIsRight : function(){
          //如果两个形状还没有完全落下来不能左移右移
        if(this.nodeArr[0].y > this.nodeHeight/2){
            return false;
        }
        var xArr = [];
        var rowArr = [];
        var colArr = [];
        this.remainTwoNumber(this.nodeArr);
        for(let i = 0;i< this.nodeArr.length;i++){
            xArr.push(this.nodeArr[i].x);
            rowArr.push(this.getRow(this.nodeArr[i]));
            colArr.push(this.getColumn(this.nodeArr[i]));
        }
        var maxX = Math.max.apply(Math,xArr);
        cc.log("maxX is " + maxX);
        //找到最大列
        var col = this.chooseColumnByLocation(maxX);
        if(xArr.length > 0){
            if(xArr[0] === xArr[xArr.length-1]){
                if(col === 5){
                    return false;
                }
                //说明是同一列
                //找出x坐标最小的左边看看它的坐标地图状态值是多少
                if(this.map[rowArr[0]][col+1] === 0 && this.map[rowArr[1]][col+1] === 0){
                    return true;
                }else{
                    return false;
                }
            }else{
            //同一行
            if(this.map[rowArr[0]][col+1] === 0){
                //如果最大行右边的背景方格的状态是0的话就可以移动
                return true;
            }else{
                return false;
            }

            }
        }
    },
});
