var config = require('./utils/config.js');
App({
  onLaunch: function () {
    let _this = this;
    // 屏幕参数
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var sysinfo = wx.getSystemInfoSync();
    if (sysinfo) {
      console.log(sysinfo)
      this.globalData.sysinfo = sysinfo;
      var width = sysinfo.windowWidth;
      var height = sysinfo.windowHeight;
      var px2rpx = 750 / width;
      this.globalData.width = width * px2rpx + 'rpx';
      this.globalData.height = height * px2rpx + 'rpx';
      this.globalData.windowWidth = width;
      this.globalData.windowHeight = height;
    }
  },
  login: function () {
    var _this = this;
    console.log('app login');
    wx.checkSession({
      success: function () {
        var token = wx.getStorageSync('tennisToken');
        if (token) {
          console.log('token' + token);
          var successCallbackFunc = function(){
            _this.globalData.isSure = true;
          };
          var failCallbackFunc = function(){
            wx.removeStorageSync("tennisToken");
            _this.globalData.isSure = false;
            _this.globalData.tennisToken = null;
            _this.registerUser();
          };
          _this.checkToken(token, successCallbackFunc, failCallbackFunc);//自定义的检查token
        }else{
          console.log("token is false");
          _this.registerUser();
        }
      },
      fail: function () {
        console.log("checkSession fail");
        _this.registerUser();
      }
    })
  },
  //注册用户 把用户信息同步到后台
  registerUser: function () {
    console.log('app register');
    var _this = this;
    wx.login({
      success: function (res) {
        var code = res.code;
        wx.getUserInfo({
          success: function (res) {
            _this.globalData.userInfo = res.userInfo;
            var iv = res.iv;
            var encryptedData = res.encryptedData;
            var signature = res.signature;
            var rawData = res.rawData;
            _this.authReq(code, signature, rawData, encryptedData, iv);//调用后台授权接口
          },
          fail: function () {
            console.log("失败");
            _this.authSetting();
          }
        })
      }
    })
  },
  //调用后台授权接口
  authReq: function (code, signature, rawData, encryptedData, iv){
    var _this = this;
    wx.request({
      url: config.baseUrl + '/auth',
      data: {
        code: code,
        signature: signature,
        rawData: rawData,
        encryptedData: encryptedData,
        iv: iv
      },
      success: function (res) {
        //设置返回的3rdsession
        wx.setStorageSync('tennisToken', res.data.data.authToken);
        wx.setStorageSync('registered', res.data.data.registered);
        _this.globalData.tennisToken = res.data.data.authToken;
        _this.globalData.registered = res.data.data.registered;
      }
    })
  },
  //拒绝授权之后打开授权设置
  authSetting: function () {
    var _this = this;
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userInfo']) {
          console.log("当前情况是 ，用户拒绝授权，获取不到用户相关的信息");
          //拒绝授权的情况下 打开工具开启授权
          // _this.login(); //在这儿调用会出现死循环
          _this.showNoteText('授权失败', 'none');
        } else {
          console.log("测试已经过去到了用户的信息，可以继续登录");
          _this.login();
        }
      },
      fail: function () {
        console.log("获取不到用户信息");
        _this.showNoteText('授权失败', 'none');
      }
    })
  },
  //设置弹层提示信息
  showNoteText: function (txt, icon, sucCallback) {
    wx.showToast({
      title: txt,
      icon: icon,
      success: sucCallback
    })
  }, 
  //出现文字弹层
  showNoteModel: function (title, content, showCancel, confirmText, cancelText, sucFunc, failFunc){
    if (!showCancel){
      cancelText = "";
    }
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
      confirmText: confirmText,
      cancelText: cancelText,
      success: function (res) {
        if (res.confirm) {
          console.log("用户选择了确认")
          if (sucFunc){
            sucFunc();
          }
        }else if(res.cancel){
          console.log("用户选择了取消")
          if (failFunc){
            failFunc();
          }
        }
      },
      fail: function(res){
        if (failFunc) {
          failFunc();
        }
      }
    })
  },
  //检查参数 token 是否有效 kevin
  checkToken: function(token, successCallbackFunc, failCallbackFunc){
    wx.request({
      url: config.baseUrl + '/check_token',
      header: this.getGetHeaderWithToken(token),
      success: function (res) {
        //200 表示有效； 201 表示无效
        if (res.data.code == "200") {
          successCallbackFunc();
        } else if (res.data.code == "201") {
          failCallbackFunc();
        }
      },
      fail: function(res){
        failCallbackFunc();
      }
    })
  },
  //检查全局变量中的 token 是否有效 kevin
  checkTokenInGlobalData: function (successCallbackFunc, failCallbackFunc){
    let token = this.globalData.tennisToken;
    if(token){
      this.checkToken(token, successCallbackFunc, failCallbackFunc);
    } else {
      failCallbackFunc();
    }
  },
  //统一的过期时间设置方法
  setStorageSyncInvalidTime: function (key, timeInterval) {
    var timestamp = Date.parse(new Date());
    var expiration = timestamp + timeInterval;//设置时间间隔
    wx.setStorageSync(key, expiration);
  },
  //判断 是否存在有效的时间缓存
  existStorageSyncValidTime: function (key) {
    var timestamp = Date.parse(new Date());
    var expiration = wx.getStorageSync(key);
    return timestamp < expiration;
  },
  //获取 get 请求需要的 token ，token 来自全局变量
  getGetHeaderWithTokenInGlobalData: function () {
    return this.getGetHeaderWithToken(this.globalData.tennisToken);
  },
  //获取 get 请求需要的 token 
  getGetHeaderWithToken: function(token){
    return {
      "treasure_token": token
    }
  },
  globalData: {
    tennisToken: "",//token
    registered: null,//计费标识
    userInfo: null,
    isfull: false
  }
});
