// pages/article_details/article_details.js
const app = getApp();
var config = require('../../utils/config.js');
var watch = require('../../utils/watch.js');
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    scale: app.globalData.windowWidth / app.globalData.windowHeight,
    article_title: "标题",
    article: " Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    progress_txt: '',
    progress_img: "../../images/red_b.png",
    count: 0, // 设置 计数器 初始为0
    countTimer: null, // 设置 定时器 初始为null
    js_time: "",
    count2: 0,
    isHave: false,
    uuid: "",
    sid: "",
    landingPage: "",
    _seqNum: "", //请求的序列值
    windowHeight: "81%",
    cc: false,
    scrollTop: 0,
    timer2: '',
    flag: true
  },
  timer2_re: function () {
    let _this = this;
    clearTimeout(_this.data.timer2);
    _this.setData({
      flag: true,
    });
    let a = setTimeout(function () {
      _this.setData({
        flag: false,
      });
    }, 5000);
    _this.setData({
      timer2: a,
    });
    if (_this.data.count>=150){
      _this.data.count2 = 0;
      _this.data.count = 0;
      wx.request({
        url: config.baseUrl + '/m/cost_record/stop?uuid=' + _this.data.uuid + "&seqNum=" + _this.data._seqNum,
        method: "GET",
        header: {
          "treasure_token": _token
        },
        success: function (res) {
          if (res.data.code == "200") {
            _this.setData({
              count: 0,
              count2: 0,
              countTimer: null,
              progress_img: "../../images/money.png",
              progress_txt: '+' + res.data.data.amount + '积分',
              cc: true
            });
            setTimeout(function () {
              let _seqNum = Number(_this.data._seqNum) + 1;
              wx.request({
                url: config.baseUrl + '/m/cost_record/start?uuid=' + _this.data.uuid + "&seqNum=" + _seqNum,
                method: "GET",
                header: {
                  "treasure_token": _token
                },
                success: function (res) {
                  if (res.data.code == "200") {
                    _this.drawProgressbg();
                    _this.countInterval()
                    _this.setData({
                      count: res.data.data.time / 1000,
                      count2: res.data.data.time / 1000,
                      _seqNum: res.data.data.seqNum,
                      progress_img: "../../images/red_b.png",
                      progress_txt: res.data.data.amount,
                      cc: false
                    })
                  }
                }
              })
            }, 3000)
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.timer2_re();
    console.log(this.data.scale);
    let _uuid = options.uuid;
    this.setData({
      uuid: _uuid
    })
    let that = this;
    wx.getSystemInfo({
      success(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    this.get_list(_uuid);
  },
  get_list: function (_uuid) {
    let _this = this;
    let cost;
    let _token = wx.getStorageSync('tennisToken');
    _this.check_registered();
    wx.request({
      url: config.baseUrl + '/m/information/detail/' + _uuid,
      method: "GET",
      header: {
        "treasure_token": _token
      },
      success: function (res) {
        if (res.data.code == "200") {
          let _xx = res.data.data;
          let _cost = res.data.data.cost;
          WxParse.wxParse('article', 'html', _xx.context, _this, 5);
          _this.setData({
            article_title: _xx.title,
            progress_txt: '',
            isHave: false
          })
          _this.drawProgressbg();
          let _registered = wx.getStorageSync('registered'); //是否能计时的状态
          if (_registered == true) {
            if (_cost == true) {
              if (_this.data.seqNum == undefined) {
                wx.request({
                  url: config.baseUrl + '/m/cost_record/start?uuid=' + _this.data.uuid,
                  method: "GET",
                  header: {
                    "treasure_token": _token
                  },
                  success: function (res) {
                    if (res.data.code == "200") {
                      _this.countInterval();
                      _this.setData({
                        count: res.data.data.time / 1000,
                        count2: res.data.data.time / 1000,
                        _seqNum: res.data.data.seqNum,
                        progress_txt: '',
                        progress_img: '../../images/red_b.png',
                      })
                    }
                  }
                })
              }
            }
          } else {

          }
        } else if (res.data.code == "201") {
          wx.showToast({
              title: '授权失效',
              icon: 'none'
          })
                  
        } else {
          _this.setData({
            isHave: true
          })
        }
      }
    })
  },
  //检查计费资格校验
  check_registered: function () {
    var _this = this;
    let _token = wx.getStorageSync('tennisToken');
    wx.request({
      url: config.baseUrl + '/m/wx_user_info/check_registered',
      method: "GET",
      header: {
        "treasure_token": _token
      },
      success: function (res) {
        if (res.data.code == "200") {
          if (res.data.message == "success") {
            wx.setStorageSync('registered', true);
          }
        } else if (res.data.code == "201") {
          wx.setStorageSync('registered', false);
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    let _this = this;
    let _token = wx.getStorageSync('tennisToken');
    let _num = _this.data.count;
    clearInterval(_this.countTimer);
    wx.request({
      url: config.baseUrl + '/m/cost_record/stop?uuid=' + _this.data.uuid + "&seqNum=" + _this.data._seqNum,
      method: "GET",
      header: {
        "treasure_token": _token
      },
      success: function (res) {
        if (res.data.code == "200") {
          console.log("成功")
        }
      }
    })
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
  countInterval: function () {
    let _this = this;
    let _token = wx.getStorageSync('tennisToken');
    // 设置倒计时 定时器 每100毫秒执行一次，计数器count+1 ,耗时15秒绘一圈
    _this.countTimer = setInterval(() => {
      if (_this.data.flag) {
        if (_this.data.count <= 50) {
          /* 绘制彩色圆环进度条
          注意此处 传参 step 取值范围是0到2，
          所以 计数器 最大值 60 对应 2 做处理，计数器count=150的时候step=2
          */
          _this.drawCircle(_this.data.count / (50 / 0.66))
          _this.data.count++;
          _this.data.count2++
          _this.setData({
            count: _this.data.count++,
            count2: _this.data.count2++,
            progress_txt: '',
          });
        } else if (_this.data.count <= 150) {
          _this.drawCircle(_this.data.count / (150 / 2))
          _this.data.count++;
          _this.data.count2++
          _this.setData({
            count: _this.data.count++,
            count2: _this.data.count2++,
            progress_txt: '',
          });
        } else {
          if (_this.data.count2 >= 150) {
            clearInterval(_this.countTimer);
            _this.data.count2 = 0;
            _this.data.count = 0;
            wx.request({
              url: config.baseUrl + '/m/cost_record/stop?uuid=' + _this.data.uuid + "&seqNum=" + _this.data._seqNum,
              method: "GET",
              header: {
                "treasure_token": _token
              },
              success: function (res) {
                if (res.data.code == "200") {
                  _this.setData({
                    count: 0,
                    count2: 0,
                    countTimer: null,
                    progress_img: "../../images/money.png",
                    progress_txt: '+' + res.data.data.amount + '积分',
                    cc: true
                  });
                  setTimeout(function () {
                    let _seqNum = Number(_this.data._seqNum) + 1;
                    wx.request({
                      url: config.baseUrl + '/m/cost_record/start?uuid=' + _this.data.uuid + "&seqNum=" + _seqNum,
                      method: "GET",
                      header: {
                        "treasure_token": _token
                      },
                      success: function (res) {
                        if (res.data.code == "200") {
                          _this.drawProgressbg();
                          _this.countInterval()
                          _this.setData({
                            count: res.data.data.time / 1000,
                            count2: res.data.data.time / 1000,
                            _seqNum: res.data.data.seqNum,
                            progress_img: "../../images/red_b.png",
                            progress_txt: res.data.data.amount,
                            cc: false
                          })
                        }
                      }
                    })
                  }, 3000)
                }
              }
            })
          }
        }
      }
    }, 100)
  },
})