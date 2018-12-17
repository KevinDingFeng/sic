// pages/my_info/my_info.js
const app = getApp();
var config = require('../../utils/config.js');
var interval = null //倒计时函数
var phone_reg = /^[1][0-9][0-9]{9}$/;//手机号码正则
Page({
    /**
     * 页面的初始数据
     */
    data: {
        pageStyle: `width:${app.globalData.width};height:${app.globalData.height}`,
        scale: app.globalData.windowWidth / app.globalData.windowHeight,
        ishide:false,
        user_name:"",//姓名
        user_zh:"",//收款账号
        user_phone: "",//手机号
        phone_code:"",//验证码
        subText: "确认绑定",
        time: "获取验证码",
        currentTime: 90,
        disabled: false,
        _text_:"保存"
    },
    keep_user:function(){
        console.log(app.globalData)
        let _token = wx.getStorageSync('tennisToken');
        let _this =this;
        let user_zh = _this.data.user_zh;//收款账号
        let user_phone = _this.data.user_phone;//手机号
        let phone_code = _this.data.phone_code;   //验证码
        if (user_zh == "" || user_zh == undefined || user_zh == null) {
            wx.showToast({
                title: '账号不能为空！',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        var myreg = /^[1][0-9][0-9]{9}$/;//手机号码正则
        if (!myreg.test(user_phone)) {
            wx.showToast({
                title: '手机号有误！',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        if (phone_code == "" || phone_code == undefined || phone_code == null) {
            wx.showToast({
                title: '验证码不能为空！',
                icon: 'none',
                duration: 1500
            })
            return;
        }
        wx.request({
            method:"POST",
            url: config.baseUrl + '/m/wx_user_info/save',
            header: {
                "treasure_token": _token,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data:{
                cellphone: user_phone,
                code: phone_code,
                bankAccount: user_zh
            },
            success: function (res) {
                if (res.data.code == "200"){
                    wx.navigateTo({
                        url: '../my/my',
                    })
                    wx.setStorageSync('tennisToken.registered', true)
                }  
            }
        })
    },
    // 表单手机号验证
    blurPhone: function (e) {
        var that = this;
        var myreg = /^[1][0-9][0-9]{9}$/;//手机号码正则
        if (!myreg.test(e.detail.value)) {
            wx.showToast({
                title: '手机号有误！',
                icon: 'none',
                duration: 1500
            })
            return;
        }
    },
    //验证码验证
    blurCode:function(e){
        var that = this;
        if (e.detail.value == "" || e.detail.value == undefined || e.detail.value==null){
            wx.showToast({
                title: '验证码不能为空！',
                icon: 'none',
                duration: 1500
            })
            return;
        }
    },
    //账号验证
    blurZh: function (e) {
        var that = this;
        if (e.detail.value == "" || e.detail.value == undefined || e.detail.value == null) {
            wx.showToast({
                title: '验证码不能为空！',
                icon: 'none',
                duration: 1500
            })
            return;
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        let _token = wx.getStorageSync('tennisToken');
        wx.request({
            url: config.baseUrl + '/m/wx_user_info',
            header:{
                "treasure_token": _token
            },
            success: function(res) {
                let user_xx = res.data.data;
                let user_name = user_xx.nickName;//昵称
                let user_zh = user_xx.bankAccount;//收款账号
                let user_phone = user_xx.cellphone;//手机号
                let _ishide =null;
                if (user_phone != "" || user_zh !="" ){
                    _this.setData({
                        _text_:"修改"
                    })
                }
                _this.setData({
                    user_name: user_name,
                    user_zh: user_zh,
                    user_phone: user_phone,
                    ishide: _ishide
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    inputPhone: function (e) {
        this.setData({
            user_phone: e.detail.value
        });
    },
    inputCode: function (e) {
        console.log(e.detail.value);
        this.setData({
            phone_code: e.detail.value
        });
    },
    inputZh:function(e){
        console.log(e.detail.value);
        this.setData({
            user_zh: e.detail.value
        });
    },
    //验证码
    sendCode: function () {
        var that = this;
        var p = that.data.user_phone;
        if (p) {
            if (that.data.disabled == false) {
                wx.request({
                    url: config.baseUrl + '/m/sms/send',
                    method: "GET",
                    data: {
                        cellphone: p
                    },
                    success: function (res) {
                        var title = res.data.code == 200 ? '发送成功' : res.data.data;
                        var currentTime = that.data.currentTime
                        interval = setInterval(function () {
                            currentTime--;
                            that.setData({
                                time: "剩余" + currentTime + '秒'
                            })
                            if (currentTime <= 0) {
                                clearInterval(interval)
                                that.setData({
                                    time: '重新发送',
                                    currentTime: 90,
                                    disabled: false
                                })
                            } else {
                                that.setData({
                                    disabled: true
                                })
                            }
                        }, 1000)
                        wx.showToast({
                            title: title,
                            icon: 'none'
                        })
                    }
                })
            } else {
                wx.showToast({
                    title: '90秒后再试！',
                    icon: 'none'
                })
            }
        } else {
            wx.showToast({
                title: '请输入手机号',
                icon: 'none'
            })
        }
    },
})