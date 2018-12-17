// pages/my/my.js
const app = getApp();
var config = require('../../utils/config.js');
Page({
    /**
     * 页面的初始数据
     */
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
        let _isfull = false;
        let _userInfo = e.detail.userInfo;
        if (_userInfo == "" || _userInfo == undefined || _userInfo == null) {
            this.setData({
                isfull: true,
            });
            wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权，将无法获得奖励!!!',
                showCancel: false,
                confirmText: '返回授权',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击了“返回授权”')
                    }
                }
            })
        } else {
            wx.setStorageSync('isfull', false);
            wx.setStorageSync('userInfo', _userInfo);
            this.setData({
                isfull: false,
                userInfo: {
                    name: _userInfo.nickName,
                    avatarUrl: _userInfo.avatarUrl
                }
            });
        }
        if (this.data.isfull == true) {
            wx.showToast({
                title: '您的信息不完整，请尽快完善！',
                icon: 'none',
                duration: 2000
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _isfull = wx.getStorageSync('isfull');
        let _userInfo = wx.getStorageSync('userInfo');
        if (_userInfo == "" || _userInfo == undefined || _userInfo == null) {
            this.setData({
                isfull: true,
            });
            app.login();
        } else {
            let _token = wx.getStorageSync('tennisToken');
            this.check_token(_token);
        }
    },
    check_token: function (_token){
        let that =this;
        wx.request({
            url: config.baseUrl + '/check_token',
            header: {
                "treasure_token": _token
            },
            success: function (res) {
                if (res.data.code == "200"){
                    let _isfull = wx.getStorageSync('isfull');
                    let _userInfo = wx.getStorageSync('userInfo');
                    that.setData({
                        isfull: false,
                        userInfo: {
                            name: _userInfo.nickName,
                            avatarUrl: _userInfo.avatarUrl
                        }
                    });
                } else if (res.data.code == "201"){
                    that.setData({
                        isfull: true,
                    });
                }
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