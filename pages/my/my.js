// pages/my/my.js
const app = getApp();
var config = require('../../utils/config.js');
Page({
  data: {
    pageStyle: `width:${app.globalData.width};height:${app.globalData.height}`,
    scale: app.globalData.windowWidth / app.globalData.windowHeight,
    isfull: app.globalData.isfull,
    userInfo: {
      name: null,
      avatarUrl: "",
    }
  },
  //获取个人信息
  user_xx: function (e) {
    if (e.detail.errMsg == "getUserInfo:ok") {
      if (!app.globalData.userInfo || !wx.getStorageSync('userId')) {
        console.log(app.globalData.userInfo);
        //获取用户数据
        app.login();
      }
    }
    // let _isfull = false;
    let _userInfo = e.detail.userInfo;
    if (!_userInfo) {
      this.setIsFull(true);
      var sucFunc = function () {
        console.log('用户点击了“返回授权”');
      }
      app.showNoteModel('警告', '您点击了拒绝授权，将无法获得奖励!!!', false, '返回授权', null, sucFunc, null);
    } else {
      this.setUserInfo(_userInfo);
      this.setIsFull(false);
      wx.setStorageSync('userInfo', _userInfo);
    }
    // if (this.data.isfull) {
    //   app.showNoteText('您的信息不完整，请尽快完善！', 'none');
    // }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let _isfull = wx.getStorageSync('isfull');
    let _userInfo = wx.getStorageSync('userInfo');
    if (!_userInfo) {
      this.setIsFull(true);//设置 isfull 
      app.login();
    } else {
      let _token = wx.getStorageSync('tennisToken');
      this.check_token(_token);
    }
  },
  //检查 token 是否生效，生效继续；不生效引导获取
  check_token: function (_token){
    var _this = this;
    var successCallbackFunc = function () {
      let _userInfo = wx.getStorageSync('userInfo');
      _this.setUserInfo(_userInfo);
      _this.setIsFull(false);
    };
    var failCallbackFunc = function () {
      _this.setIsFull(true);//设置 isfull 
      wx.removeStorageSync("tennisToken");
    };
    app.checkToken(_token, successCallbackFunc, failCallbackFunc);
  },
  //设置 userInfo 
  setUserInfo: function (_userInfo){
    var userInfo = this.data.userInfo;
    userInfo.name = _userInfo.nickName;
    userInfo.avatarUrl = _userInfo.avatarUrl;
    this.setData({
      userInfo: userInfo
    });
    // wx.setStorageSync('userInfo', this.data.userInfo);
  },
  //设置 isfull 
  setIsFull: function(isFull){
    this.setData({
      isfull: isFull
    });
    wx.setStorageSync('isfull', isFull);
  },
  // 去基本信息
  go_info: function () {
    wx.navigateTo({
      url: '/pages/my_info/my_info'
    })
  },
  // 去积分
  go_integration: function () {
    wx.navigateTo({
      url: '/pages/my_integration/my_integration'
    })
  },
  // 去积分
  go_cash: function () {
    wx.navigateTo({
      url: '/pages/my_cash/my_cash'
    })
  },
})