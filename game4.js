var comm = require("../game3/Common.js");
var game3 = require("../game3/game.js");
var statuMachine = require("./StatuMachine.js");
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
        },
        downButton : {
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
        //  //开始下落
        //  this.downFunction(this.nodeArr,1);
         this.iState = 0;
         this.totalTime = 0;
         this.registerKeyBoard();
         this.quick = false;
         this.time = 0;
         this.xltime = 0.5;
         this.cishu = 0;

         //监听下落按钮按下的时候
         this.downButton.on("touchstart",function(){
            this.xltime = 0.05;
         }.bind(this));
         //下落按钮离开时候
         this.downButton.on("touchend",function(){
            this.xltime = 0.5;
         }.bind(this));
         this.gameOver = false;
         this.status = 0;
         Array.prototype.contain = function(node){
            if(node != undefined){
                for(var i = 0;i<this.length;i++){
                    if(this[i].x === node.x && this[i].y === node.y && this[i].getComponent("Image").type === node.getComponent("Image").type){
                        return true;
                    }
                }
                return false;
            }
            return false;
        };
    },
    registerKeyBoard : function(){
        //注册键盘监听
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,this.onKeyDown,this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP,this.onKeyUp,this);
    },
    onKeyDown : function(event){
        switch(event.keyCode){
            case cc.KEY.down:
                this.xltime = 0.05;
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
                this.xltime = 0.5;
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
                // var node = new Shape(tempPrefab,-1);
                tempPrefab.getComponent("Back").isFilled = 0;
                // tempPrefab.isFilled = 0;
                cc.log("tempPrefab.isFilled is " + tempPrefab.isFilled);
                tempPrefab.getComponent("Back").type = -1;
                tempPrefab.getComponent("Back").innerNode = null;
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
        this.cishu  = 0;
        //从上往下生成
        // var y = this.nodeHeight/2 + this.girdSize/2+1*this.girdSize;
        for(var i = 0;i < 2;i++){
            // var offSet = i * this.prefabHeight;
            // cc.log("offSet is " + offSet);
            // //产生0-3的随机数
            var index = this.controlRandom();
            // //将对应的颜色索引存放到该数组中
            // // this.boxColorArr.push(this.prefabArr[index].color);
            // cc.log("index is " + index);
            // //将对应的预制体取出来转化为节点然后显示
            var prefabNode = game3.prototype.createPrefab(this.imagePrefabArr[index]);
            // cc.log("x is " + x + " and y is "+ y - offSet);
            //设置预制节点的位置
            this.nodeArr1=prefabNode;
            prefabNode.setPosition(this.backGroundArr[0][randomCol].x,this.backGroundArr[0][randomCol].y);
            
            prefabNode.getComponent("Image").type = index;
            prefabNode.getComponent("Image").col = randomCol;
            prefabNode.getComponent("Image").row = 0;
            prefabNode.active = false;
            // this.backGroundArr[i][randomCol].node = prefabNode;
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
    //改变随机数出现的概率
    controlRandom : function(){
        var id;
        var rnd = Math.random();
        if(rnd < 0.2){
            id = 0;
        }else if(rnd < 0.4){
            id = 1;
        }else if(rnd < 0.6){
            id = 2;
        }else if(rnd < 0.8){
            id = 3;
        }else if(rnd < 0.85){
            id = 4;
        }else if(rnd < 0.9){
            id = 5;
        }else if(rnd < 0.95){
            id = 6;
        }else if(rnd < 1){
            id = 7;
        }
        return id;
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
        switch(this.status){
            case statuMachine.STATE_BEGIN:
             cc.log("开始游戏");
             break;
            case statuMachine.STATE_PLAY:
             cc.log("游戏中");  
        }
        this.checkIsOver();
        //如果游戏结束了就不在进行下落
        if(!this.gameOver){
            this.time += dt;
            if(this.time > this.xltime){
                if(this.cishu < 2){
                    if(this.cishu === 0){
                        this.nodeArr[1].active = true;
                    }else if(this.cishu === 1){
                        this.nodeArr[1].y = this.backGroundArr[1][this.nodeArr[1].getComponent("Image").col].y;
                        this.nodeArr[1].getComponent("Image").row = 1;
                        this.nodeArr[0].active = true;
                        this.nodeArr[0].y = this.backGroundArr[0][this.nodeArr[0].getComponent("Image").col].y;
                        this.nodeArr[1].getComponent("Image").row = 0;
                    }
                    this.cishu++;
                }else{
                    this.updatePrefatY(this.nodeArr);
                }
                this.time = 0;
            }
        }
    },
    //检查游戏是否结束
    checkIsOver : function(){
        for(let i = 0;i<6;i++){
            if(this.map[0][i] === 1){
                //游戏结束
                this.gameOver = true;
            }
        }
    },
    //定时器控制下落
    // downFunction : function(nodeArr,time){
    //     var self = this;
    //     self.updatePrefatY(nodeArr);
    // },
    //更新预制体节点的y坐标
    updatePrefatY : function(nodeArr){
                //如果允许下落的话条的y坐标向下移动
                if(this.CheckIsDown(nodeArr)){
                        //下落节点数组,如果是横向的话分开这连个节点
                        this.down(nodeArr);
                }else{
                    //改变地图信息
                    this.changeMap(this.nodeArr);
                    //查看这个节点数组中是否可以消除如果满足条件进行消除
                    this.checkNodeArr(this.nodeArr);
                    //生成下一个形状
                    this.nodeArr = this.nextBlock;
                    //生成下一个形状
                    this.createNext();
                }
    },
    //检查一个节点数组是否满足消除条件
    checkNodeArr : function(nodeArr){
        //临时数组存放待消节点
        var waitQueue = [];
        if(this.canRemove(nodeArr,waitQueue).isRemove){
            //如果是可以消除的话进行消除这时候待消队列已经填满了节点
            // this.remove(this.nodeArr);
            //检测完这两个下落的方块的待消队列
            for(let j = 0;j<waitQueue.length;j++){
                //将这些带消除的标记为可消除的
                waitQueue[j].getComponent("Image").isRemove = true;
            }
            //该消除的消除该下落的下落
            this.remove(waitQueue);
        }
    },
    //改变地图信息
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
                //如果有块在停止的时候更新了地图就不在这里更新地图信息了
                if(!nodeArr[i].getComponent("Image").hasDown){
                    this.map[row][col] = 1;
                    //将背景方格的属性状态改为该节点数组对应的类型
                    this.backGroundArr[row][col].getComponent("Back").type = nodeArr[i].getComponent("Image").type;
                    this.backGroundArr[row][col].getComponent("Back").innerNode = nodeArr[i];
                }else{
                    //将该节点的移动状态改为初始值
                    nodeArr[i].getComponent("Image").hasDown = false;
                }
            }
                
        }
    },
    //检查该节点数组是否可以消除
    /**
     * @param  {待检测的节点数组} nodeArr
     * @param  {待消队列} waitQueue
     * @return {JSON}    result
     */
    canRemove : function(nodeArr,waitQueue){
        var result = {
            isRemove : false,
            queue    : null,
        }
        for(let m = 0;m < nodeArr.length;m++){
            var tempArr = [];
            var cRow = nodeArr[m].getComponent("Image").row;
            var cCol = nodeArr[m].getComponent("Image").col;
            var cType = nodeArr[m].getComponent("Image").type; 
            this.find(nodeArr[m],cRow,cCol,cType,tempArr);
            if(tempArr.length >= 3){
                for(let k = 0;k < tempArr.length;k++){
                    if(!waitQueue.contain(tempArr[k])){
                        //如果数组里面有这个节点的信息了说明已经加到数组里面了不用再重复加入了
                        waitQueue.push(tempArr[k]);
                    }
                    
                }
            }
        }
        //递归的方式把待消队列找出来
        if(waitQueue.length >= 3){
            result.isRemove = true;
            result.queue = waitQueue;
        }else{
            result.isRemove = false;
            result.queue = [];
        }
        return result;

    },
    //消除操作，先播放消除动画删除相应节点，上面的节点依次下落
    remove : function(waitQueue){
        //先不删除这些节点等找到所有这些待消节点上方的节点之后删除他们

        //找到这几个待消节点上面的所有节点让他们自动执行下落动作（节点所挂的消除下落方法）
        var waitDownArr = [];
        for(let m = 0;m<waitQueue.length;m++){
            var cRow = waitQueue[m].getComponent("Image").row;
            var cCol = waitQueue[m].getComponent("Image").col;
            this.upFindNodes(cRow,cCol,waitDownArr);
        }
        cc.log("待下落节点数组为：" + waitDownArr);
        this.deleteNodeFromParent(waitQueue);
        //下落其他节点
        for(let j = 0;j<waitDownArr.length;j++){
             waitDownArr[j].getComponent("Image").afterRemoveDown(this.map,this.backGroundArr);
        }
    },
    /**
     * @param  {待消除队列} waitQueue
     */
    deleteNodeFromParent : function(waitQueue){
        for(let i = 0;i<waitQueue.length;i++){
            var row = waitQueue[i].getComponent("Image").row;
            var col = waitQueue[i].getComponent("Image").col;
            //恢复地图信息
            this.map[row][col] = 0;
            //恢复背景方格的原始属性
            this.backGroundArr[row][col].getComponent("Back").type = -1;
            this.backGroundArr[row][col].getComponent("Back").innerNode = null;
            //销毁该节点
            waitQueue[i].destroy();
            //恢复地图状态
            
        }
    },
    //向上找节点
    upFindNodes : function(row,col,arr){
        while(row > 0){
            row--;
            var upNode = this.backGroundArr[row][col].getComponent("Back").innerNode;
            if(upNode != null){
                if(upNode.getComponent("Image").isRemove === true){
                    continue;
                }else{
                    //将不是待消节点添加到数组中去
                    if(!arr.contain(upNode)){    
                        //如果该数组中还没有该节点的话就加进去
                        arr.push(upNode);
                    }
                }
            }else{
                //如果upNode是空的话
                break;
            }
        }
    },
   //
   /**
    * 递归查找该节点上下左右四个方向是否有跟自己的类型相同的节点
    * @param  {待检测节点} node
    * @param  {待检测节点所在的行} row
    * @param  {待检测节点所在的列} col
    * @param  {待检测节点的类型} type
    * @param  {待消除队列} arr
    */
   find : function(node,row,col,type,arr){
       //定义上下左右四个方向数组
       if(row != 11 && (col != 0 && col != 5)){
           var round = [[row-1,col],[row+1,col],[row,col-1],[row,col+1]];
       }else if(row === 11 && col === 0){
           var round = [[row-1,col],[row,col+1]];
       }else if(row === 11 && col === 5){
           var round = [[row-1,col],[row,col-1]];
       }else if(row != 11 && col === 0){
           var round = [[row-1,col],[row,col+1],[row+1,col]];
       }else if(row != 11 && col === 5){
           var round = [[row-1,col],[row,col-1],[row+1,col]];
       }else if(row === 11 && col != 0 && col != 5){
           var round = [[row-1,col],[row,col-1],[row,col+1]];
       }
       if(!arr.contain(node)){
           //如果当前数组中不包含该节点就加入数组
           arr.push(node);
       }
       for(let i =0;i < round.length;i++){
           if(this.backGroundArr[round[i][0]][round[i][1]].getComponent("Back").type === type){
                var waitDeleteNode = this.backGroundArr[round[i][0]][round[i][1]].getComponent("Back").innerNode;
                if(!arr.contain(waitDeleteNode)){
                    arr.push(waitDeleteNode);
                    //递归寻找节点
                    this.find(waitDeleteNode,round[i][0],round[i][1],type,arr);
                }
                
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
            nodeArr[i].getComponent("Image").row = row+1;
        }
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
                //边界旋转
                if(x0Col === 5){
                    //改变旋转中心进行旋转
                    this.changeRotateCenter(nodeAngle,x0Col);
                }else{
                    if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                        //旋转90度对应的坐标位置
                        var bezier = this.dealRotate(nodeAngle,x0Row,x0Col,rotate45X,rotate45Y,x,y,1);
                        //能够旋转
                        canAction = true;
                    }
                }
                
            }else if(nodeAngle === 1){
                if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                    var bezier = this.dealRotate(nodeAngle,x0Row,x0Col,rotate45X,rotate45Y,x,y,2);
                    canAction = true;
                }
            }else if(nodeAngle === 2){
                //边界旋转判断改为顺时针旋转（以#0块为旋转中心）
                if(x0Col === 0){
                   this.changeRotateCenter(nodeAngle,x0Col);
                }else{
                    if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                        var bezier = this.dealRotate(nodeAngle,x0Row,x0Col,rotate45X,rotate45Y,x,y,3);
                        canAction = true;
                    }
                }
            }else if(nodeAngle === 3){
                if(this.checkIsRotate(x0Row,x0Col,nodeAngle)){
                    //创建贝塞尔曲线所对应的最少坐标
                    var bezier = this.dealRotate(nodeAngle,x0Row,x0Col,rotate45X,rotate45Y,x,y,0);
                    canAction = true;
                }
            }
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
    //处理旋转
    /**
     * @param  {当前需要旋转的节点的角度代码属性} angle
     * @param  {旋转中心所在的行} row
     * @param  {选装中心所在的列} col
     * @param  {旋转45度对应的x坐标} rotate45X
     * @param  {旋转45度对应的y坐标} rotate45Y
     * @param  {旋转之前的x坐标} x
     * @param  {旋转之前对应的y坐标} y
     * @param  {旋转之后该节点对应的角度属性代号} angleCode
     */
    dealRotate : function(angle,row,col,rotate45X,rotate45Y,x,y,angleCode){
        if(angle === 0){
            var rotate90X = this.backGroundArr[row][col+1].x;
            var rotate90Y = this.backGroundArr[row][col+1].y;
            this.nodeArr[0].getComponent("Image").row = row;
            this.nodeArr[0].getComponent("Image").col = col+1;  
        }else if(angle === 1){
            var rotate90X = this.backGroundArr[row+1][col].x;
            var rotate90Y = this.backGroundArr[row+1][col].y;  
            this.nodeArr[0].getComponent("Image").row = row+1;
            this.nodeArr[0].getComponent("Image").col = col;  
        }else if(angle === 2){
            var rotate90X = this.backGroundArr[row][col-1].x;
            var rotate90Y = this.backGroundArr[row][col-1].y;
            this.nodeArr[0].getComponent("Image").row = row;
            this.nodeArr[0].getComponent("Image").col = col-1;    
        }else if(angle === 3){
            var rotate90X = this.backGroundArr[row-1][col].x;
            var rotate90Y = this.backGroundArr[row-1][col].y;
            this.nodeArr[0].getComponent("Image").row = row-1;
            this.nodeArr[0].getComponent("Image").col = col;    
        }
         
        //创建贝塞尔曲线所对应的最少坐标
        var bezier = [cc.p(x,y),cc.p(rotate45X,rotate45Y),cc.p(rotate90X,rotate90Y)];
        // //初始向量
        // var startV = cc.v2(x,y).sub(cc.v2(x0,y0));
        // var result = startV.rotate(Math.PI/2);
        this.nodeArr[0].x = rotate90X;
        this.nodeArr[0].y = rotate90Y;
        //旋转之后变成360度
        this.nodeArr[0].getComponent("Image").angle = angleCode;
        return bezier;
    },
    //变换旋转中心
    changeRotateCenter : function(nodeAngle,col){
        var x00 = this.nodeArr[0].x;
        var y00 = this.nodeArr[0].y;
        var x00Row = this.getRow(this.nodeArr[0]);
        var x00Col = this.getColumn(this.nodeArr[0]);

        var xx = this.nodeArr[1].x;
        var yy = this.nodeArr[1].y;

        //旋转45度方向
        var rotate45Xc = (xx-x00)*Math.cos(-Math.PI/4)-(yy-y00)*Math.sin(-Math.PI/4) + x00;
        var rotate45Yc = (xx-x00)*Math.sin(-Math.PI/4)+(yy-y00)*Math.cos(-Math.PI/4) + y00;
        if(nodeAngle === 0 && col === 5){
            var rotate90X = this.backGroundArr[x00Row][x00Col-1].x;
            var rotate90Y = this.backGroundArr[x00Row][x00Col-1].y;
            this.nodeArr[1].getComponent("Image").row = x00Row;
            this.nodeArr[1].getComponent("Image").col = x00Col-1;   
        }else if(nodeAngle === 2 && col === 0){
            var rotate90X = this.backGroundArr[x00Row][x00Col+1].x;
            var rotate90Y = this.backGroundArr[x00Row][x00Col+1].y;   
            this.nodeArr[1].getComponent("Image").row = x00Row;
            this.nodeArr[1].getComponent("Image").col = x00Col+1;   
        }
       
        //创建贝塞尔曲线所对应的最少坐标
        var bezier = [cc.p(xx,yy),cc.p(rotate45Xc,rotate45Yc),cc.p(rotate90X,rotate90Y)];
        // //初始向量
        // var startV = cc.v2(x,y).sub(cc.v2(x0,y0));
        // var result = startV.rotate(Math.PI/2);
        this.nodeArr[1].x = rotate90X;
        this.nodeArr[1].y = rotate90Y;
        //旋转之后变成270度
        if(nodeAngle === 2 && col === 0){
            this.nodeArr[0].getComponent("Image").angle = 3;
        }else if(nodeAngle === 0 && col === 5){
            this.nodeArr[0].getComponent("Image").angle = 1;
        }
        //执行贝塞尔曲线动作
        (function test(cb){
            var bezierAction = cc.bezierTo(0.008,bezier);
            self.nodeArr[1].runAction(bezierAction);
            cb()
        })(pro);
        function pro() {
            cc.log("承诺正常执行########");
            cc.log("@@@@@@@@@@" + self.nodeArr[0].x);
            cc.log("@@@@@@@@@@" + self.nodeArr[0].y);
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
                //检查旋转中心节点的右边背景方格的状态是否为1和检查#0块右边对应的背景方格是否为1
                if(this.map[centerRow-1][centerCol+1] != 1 && this.map[centerRow][centerCol+1] != 1){
                    return true;
                }else{
                    return false;
                }
            }else if(angle === 1){
                if(this.map[centerRow+1][centerCol+1] != 1 && this.map[centerRow+1][centerCol] != 1){
                    return true;
                }else{
                    return false;
                }
            }else if(angle === 2){
                if(this.map[centerRow+1][centerCol-1] != 1 && this.map[centerRow][centerCol-1] != 1){
                    return true;
                }else{
                    return false;
                }
            }else if(angle === 3){
                if(this.map[centerRow-1][centerCol-1] != 1 && this.map[centerRow-1][centerCol] != 1){
                    return true;
                }else{
                    return false;
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
            }
        }
    },
    leftMove : function(node){
        var row = this.getRow(node);
        var col = this.getColumn(node);
        //将当前背景节点的node改为null
        // this.backGroundArr[row][col].node = null;
        node.x = this.backGroundArr[row][col-1].x;
        node.getComponent("Image").row = row;
        node.getComponent("Image").col = col-1;
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
        node.getComponent("Image").row = row;
        node.getComponent("Image").col = col+1;
    },
    /**
        检测是否可以向下移动
        返回true或者false
        @return true  : 可以下落
        @return false : 不可以下落
    **/
    /**
     * @param  {待检测的节点数组} nodeArr
     */
    CheckIsDown : function(nodeArr){
        if(nodeArr.length != 0){
            //将坐标值转换为小数点两位小数
            this.remainTwoNumber(nodeArr);
            //如果#0块的属性angle为零的时候，只判断#1块下面是否为1，为1不下落，为地面不下落
            if(nodeArr[0].getComponent("Image").angle === 0){
                return this.checkIsBottom(nodeArr[1],0);
            }else if(nodeArr[0].getComponent("Image").angle === 1 || nodeArr[0].getComponent("Image").angle === 3){
                //横条的形状的时候会出现有一个下落的情况
                if(this.checkDown(nodeArr) && !(this.checkDown(nodeArr) instanceof cc.Node)){
                    return true;
                }else if(!this.checkDown(nodeArr) && !(this.checkDown(nodeArr) instanceof cc.Node)){
                    return false;
                }else if(this.checkDown(nodeArr) instanceof cc.Node){
                    var targetNode = this.checkDown(nodeArr);
                    //找出这个下面背景方格状态为0的节点
                    var targetRow = this.findTheNodeDown(targetNode);
                    var col = this.getColumn(targetNode);
                    //单独下落这个节点
                    targetNode.getComponent("Image").quickDown(targetRow,col,this.backGroundArr,this.map);
                    return false;
                }
            }else if(nodeArr[0].getComponent("Image").angle === 2){
                return this.checkIsBottom(nodeArr[0],2);
            }
        }
    },
    
    /**
     * @param  {需要向下搜索背景方格的状态的初始节点} node
     */
    findTheNodeDown : function(node){
         //获得当前节点的行和列
         var row = this.getRow(node);
         var col = this.getColumn(node);
         //向下寻找
         while(row < 11){
            row++;
            if(this.map[row][col] === 1){
                break;
            }
            if(row === 11){
                break;
            }
         }
         //最底下的背景方格的状态不为1
         if(row === 11 && this.map[row][col] != 1){
             return 11;
         }else{
            return row-1;
         }
         
    },
    //判断横条的情况
    checkDown : function(nodeArr){
        this.remainTwoNumber(nodeArr);
        var count1 = 0;
        var count0 = 0;
        var nodeDownIsZero = [];
        //如果是第11行就放回false
        if(this.getRow(nodeArr[0]) === 11){
            return false;
        }
        for(let m = 0;m < nodeArr.length;m++){
            var row = this.getRow(nodeArr[m]);
            var col = this.getColumn(nodeArr[m]);
            if(this.map[row+1][col] === 1){
                count1++;
            }else if(this.map[row+1][col] ===0){
                count0++;
                nodeDownIsZero.push(nodeArr[m]);
            }
        }
        if(count1 === 2){
            //如果两个块的下面都为1的话不可以下落
            return false;
        }else if(count0 === 2){
            //如果两个块的下面都为0的话是可以下落的
            return true;
        }else{
            if(nodeDownIsZero.length > 0 && nodeDownIsZero.length === 1){
                return nodeDownIsZero[0];
            }
        }
        

    },
    // },
    //判断是否触底或者是下面还有方块
    /**
     * @param  {待检测的节点} node
     */
    checkIsBottom : function(node,angle){
        // if(angle === 0 || angle === 2){
            var row = this.getRow(node);
            var col = this.getColumn(node);
            if(row != 11){
                //下一行背景方格的状态是否为1
                if(this.map[row + 1][col] === 1){
                    //将对应的背景方格的状态改为1
                    return false;
                }else{
                    return true;
                }
            }else{
                return false;
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
