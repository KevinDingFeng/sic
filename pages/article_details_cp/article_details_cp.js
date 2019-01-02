// pages/article_details/article_details.js
const app = getApp();
var config = require('../../utils/config.js');
var watch = require('../../utils/watch.js');
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    oneCycleTime: 300, //30 秒，单位是 0.1 秒 = 100 毫秒
    scale: app.globalData.windowWidth / app.globalData.windowHeight,
    article: "",
    progress_txt: '',
    progress_img: "../../images/red_b.png",
    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为null
    isHave: false,
    uuid: "",
    _seqNum: "", //请求的序列值
    windowHeight: "81%",
    cc: false,
    timer2: null,//用来记录停止滚动的时间 定时器
    flag: true
  },
  //控制滚动停止了n秒后就停止计时
  timer2_re: function () {
    console.log("timer2_re");
    if (this.data.timer2){
      clearTimeout(this.data.timer2);
    }
    this.setFlag(true);
    let _this = this;
    let timer2 = setTimeout(function () {
      _this.setFlag(false);
    }, 5000);
    this.setData({
      timer2: timer2,
    });
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    // this.timer2_re(); TODO 先注释
    //先从缓存中把 token 拿到全局变量中
    app.globalData.tennisToken = wx.getStorageSync('tennisToken');
    let _uuid = options.uuid;
    this.setData({
      uuid: _uuid
    })
    let that = this;
    this.getDetail(_uuid, this.getDetailSuccessCallback);//获取文章 detail 内容
    wx.getSystemInfo({
      success(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })
  },
  //开始计费请求，
  startCost: function(successCallbackFunc, failCallbackFunc){
    if(!this.data.uuid){
      return ;//以防万一
    }
    let _seqNum = this.data._seqNum;
    let _this = this;
    //开始请求，需要给 序列码 +1
    wx.request({
      url: config.baseUrl + '/m/cost_record/start?uuid=' + _this.data.uuid + (_seqNum ? ("&seqNum=" + ++ _seqNum) : ""),
      method: "GET",
      header: app.getGetHeaderWithTokenInGlobalData(),
      success: function (res) {
        console.log(res);
        if (res.data.code == "200") {
          let data = res.data.data;
          successCallbackFunc(data);
        }else{
          console.log("服务器判断不满足开始计时条件");
        }
      },
      fail: function(res){
        console.log("开始请求失败");
      }
    })
  },
  //结束计费请求，
  stopCost: function (successCallbackFunc, failCallbackFunc){
    if (!this.data.uuid || !this.data._seqNum) {
      return;//以防万一
    }
    // let _seqNum = this.data._seqNum;
    let _this = this;
    wx.request({
      url: config.baseUrl + '/m/cost_record/stop?uuid=' + _this.data.uuid + "&seqNum=" + _this.data._seqNum,
      method: "GET",
      header: app.getGetHeaderWithTokenInGlobalData(),
      success: function (res) {
        console.log("stopCost");
        console.log(res);
        if (res.data.code == "200") {
          if (successCallbackFunc){
            successCallbackFunc(res.data.data);//调用停止成功后的回调方法
          }
        }
      },
      fail: function(res){

      }
    })
  },
  //获取文章 detail 后成功回调方法
  // param1 _xx 文章的所有信息
  getDetailSuccessCallback: function (inforModel){
    WxParse.wxParse('article', 'html', inforModel.context, this, 5);
    this.setData({
      article_title: inforModel.title,
      progress_txt: '',
      isHave: false
    })
    this.drawProgressbg();//画一个圈
    //判断 token 是否有效，有效可以继续判断是否可以开始计时；无效给提示信息
    var _this = this;
    var checkTokenSuccess = function(){
      console.log("checkToeknSuccess");
      //继续判断是否可以开始计时
      // TODO 目前先不对信息完整性进行校验，直接开始请求
      if (inforModel.cost){
        console.log("start first");
        // TODO 逻辑 不对
        _this.startCost(_this.firstTimeStartSuccessCallback);//第一次开始计费 请求成功后的回调方法
      }
    };
    var checkTokenFail = function(){
      console.log("checkTokenFail");
      wx.removeStorageSync("tennisToken");
      //给无效的提示和推荐 TODO
    };
    app.checkTokenInGlobalData(checkTokenSuccess, checkTokenFail);
  },
  //第一次开始计费 请求成功后的回调方法
  firstTimeStartSuccessCallback : function(data){
    console.log("firstTimeStartSuccessCallback");
    this.setData({
      count: data.time / 100,
      _seqNum: data.seqNum,
      progress_txt: '',
      progress_img: '../../images/red_b.png',
    })
    this.countInterval();//开始循环计费
  },
  //后几次开始计费 请求成功后的回调方法
  nextTimeStartSuccessCallback: function (data) {
    console.log("nextTimeStartSuccessCallback");
    this.setData({
      count: data.time / 100,
      _seqNum: data.seqNum,
      progress_img: "../../images/red_b.png",
      progress_txt: '',
      cc: false
    })
    this.drawProgressbg();
    this.countInterval();
  },
  //停止计费 请求成功后的回调方法
  stopSuccessCallback: function(data){
    console.log("stopSuccessCallback");
    this.setData({
      count: 0,
      countTimer: null,
      progress_img: "../../images/money.png",
      progress_txt: '+' + data.amount + '积分',
      cc: true
    });
    var _this = this;
    setTimeout(function () {
      _this.startCost(_this.nextTimeStartSuccessCallback);//第一次开始计费 请求成功后的回调方法
    }, 3000)
  },
  //获取文章 detail 内容
  getDetail: function (_uuid, successCallbackFunc) {
    if(_uuid){
      let _this = this;
      wx.request({
        url: config.baseUrl + '/stream/detail/' + _uuid,
        method: "GET",
        header: app.getGetHeaderWithTokenInGlobalData(),
        success: function (res) {
          console.log("getDetail");
          console.log(res);
          if (res.data.code == "200") {
            let inforModel = res.data.data;//文章信息
            successCallbackFunc(inforModel);//回调成功方法
          } else {
            _this.setIsHave(true); //设置 isHave 
          }
        }
      })
    }else{
      this.setIsHave(true); //设置 isHave 
    }
  },
  //设置 isHave 
  // param1 isHave ，true 表示没有数据，false 表示存在数据
  setIsHave: function (isHave){
    this.setData({
      isHave: isHave
    });
  },
  //设置 flag
  setFlag: function(flag){
    _this.setData({
      flag: flag,
    });
  },
  //生命周期函数--监听页面卸载
  onUnload: function () {
    if (this.data.countTimer){
      clearInterval(this.data.countTimer);
    }
    this.stopCost();
  },
  //监听页面是否滑动
  scroll: function (e) {
      this.timer2_re();
  },
  //   canvas画圆
  drawProgressbg: function () {
    var ctx = wx.createCanvasContext('canvasProgressbg')
    ctx.setLineWidth(4); // 设置圆环的宽度
    ctx.setStrokeStyle('#ddd'); // 设置圆环的颜色
    ctx.setLineCap('round') // 设置圆环端点的形状
    ctx.beginPath(); //开始一个新的路径
    ctx.arc(50, 50, 40, 0, 2 * Math.PI, false);
    //设置一个原点(100,100)，半径为90的圆的路径到当前路径
    ctx.stroke(); //对当前路径进行描边
    ctx.draw();
  },
  drawCircle: function (step) {
    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('canvasProgress');
    context.setLineWidth(10);
    context.setStrokeStyle('#7EB8F2'); // 设置圆环的颜色
    context.setLineCap('round')
    context.beginPath();
    // 参数step 为绘制的圆环周长，从0到2为一周 。 -Math.PI / 2 将起始角设在12点钟位置 ，结束角 通过改变 step 的值确定
    context.arc(50, 50, 40, -Math.PI / 2, step * Math.PI - Math.PI / 2, false);
    context.stroke();
    context.draw()
  },
  //
  drawCircleAndSetCount: function (num){
    /* 绘制彩色圆环进度条 注意此处 传参 step 取值范围是0到2， 所以 计数器 最大值 60 对应 2 做处理，计数器count=150的时候step=2 */
    this.drawCircle(this.data.count / num);
    this.setData({
      count: ++ this.data.count,
      progress_txt: '',
    });
  },
  //开始循环计数
  countInterval: function () {
    console.log("countInterval");
    let _this = this;
    // 设置倒计时 定时器 每100毫秒执行一次，计数器count+1 ,耗时 oneCycleTime 秒绘一圈
    var countTimer = setInterval(() => {
      if (_this.data.flag) {
        if (_this.data.count <= _this.data.oneCycleTime) {
          _this.drawCircleAndSetCount(_this.data.oneCycleTime / 2);
        } else if (_this.data.count > _this.data.oneCycleTime) {
          clearInterval(_this.data.countTimer);
          _this.stopCost(_this.stopSuccessCallback);//走一圈 后，请求 stop 计时
        }
      }
    }, 100);
    this.setData({
      countTimer: countTimer
    });
  }
})