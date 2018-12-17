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
        //console.log(sysinfo);
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
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {//已授权
                    //获取用户数据
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: function (res) {
                            _this.globalData.userInfo = res.userInfo;
                            _this.globalData.isfull = false;
                            wx.setStorageSync('isfull', false);
                            wx.setStorageSync('userInfo', res.userInfo);
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (_this.userInfoReadyCallback) {
                                _this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },
    login: function () {
        var _this = this;
        console.log('app login');
        // var token = _this.globalData.token;
        var token = wx.getStorageSync('tennisToken');
        if (token) {
            _this.globalData.tennisToken = token;
        }
        wx.checkSession({
            success: function () {
                if (token) {
                    console.log('token' + token);
                    wx.request({
                        url: config.baseUrl + '/check_token',
                        header: {
                            "treasure_token": token
                        },
                        success: function (res) {
                            if (res.data.code == "200"){
                                wx.setStorageSync('tennisToken', token);
                                _this.globalData.isSure = true;
                            }else{
                                wx.removeStorageSync("tennisToken");
                                _this.globalData.isSure = false;
                                _this.globalData.tennisToken = null;
                                _this.registerUser();
                            } 
                        }
                    })
                }
                _this.registerUser();
            },
            fail: function () {
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
                    fail: function () {
                        console.log("失败");
                        _this.authSetting();
                    }
                })
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
                    _this.login();
                } else {
                    console.log("测试已经过去到了用户的信息，可以继续登录");
                    _this.login();
                }
            },
            fail: function () {
                console.log("获取不到用户信息");
                wx.showToast({
                    title: '授权失败'
                })
            }
        })
    },
    //检查计费资格校验
    check_registered: function (){
        var _this = this;
        let _token = wx.getStorageSync('tennisToken');
        wx.request({
            url: config.baseUrl + '/m/wx_user_info/check_registered',
            method:"GET",
            header: {
                "treasure_token": _token
            },
            success: function (res) {
                debugger
                if (res.data.code == "200"){
                    if (res.data.message == "success"){
                        wx.setStorageSync('registered', true);
                    }else{
                        wx.setStorageSync('registered', false);
                    }
                }
            }
        })
    },
    globalData: {
        tennisToken: "",//token
        registered: null,//计费标识
        userInfo: null,
        isfull: false,
        isSure: null,
        isSure:""
    }
});
