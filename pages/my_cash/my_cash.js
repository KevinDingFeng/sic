// pages/my_cash/my_cash.js
const app = getApp();
var config = require('../../utils/config.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageStyle: `width:${app.globalData.width};height:${app.globalData.height}`,
        pageWidth: `width:${app.globalData.width};height:100%`,
        scale: app.globalData.windowWidth / app.globalData.windowHeight,
        cash_q:"",//提现金额
        z_catch:""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this =this;
        let _token = wx.getStorageSync('tennisToken');
        wx.request({
            url: config.baseUrl + '/m/integral_record/exchange_money',
            method: "GET",
            header: {
                "treasure_token": _token,
            },
            success: function (res) {
                    if(res.data.code == "200"){
                        _this.setData({
                            z_catch: res.data.data.totalMoney
                        });
                    }
            }
        })
    },
    inputCash: function (e) {
        this.setData({
            cash_q: e.detail.value
        });
    },
    //提现
    withdraw_cash:function(){
        let _this =this;
        let _token = wx.getStorageSync('tennisToken');
        let _cash = Number(_this.data.cash_q);
        let _cc = Number(_this.data.z_catch);//可提现金额
        if (_cash ==""){
            wx.showToast({
                title: '提现金额不能为空！',
                icon: 'none'
            })
            return;
        } else if (_cash > _cc){
            wx.showToast({
                title: '提现金额不能大于可提现金额！',
                icon: 'none'
            })
            return;
        }
        wx.request({
            url: config.baseUrl + '/m/extraction_record/apply',
            method: "POST",
            header: {
                "treasure_token": _token,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
                amount: _cash
            },
            success: function (res) {
                if(res.data.code == "200"){
                    wx.showModal({
                        title: '提现处理中',
                        content:"提现处理中，请稍后！",
                        showCancel:false,
                        success(res) {
                            if (res.confirm) {
                                wx.navigateBack({
                                    url: '/pages/my/my'
                                })
                            }
                        }
                    })
                }else{
                    wx.showModal({
                        title: '提现失败',
                        content: "提现失败，请稍后再试！",
                        showCancel: false,
                        success(res) {
                            if (res.confirm) {
                                console.log('用户点击确定')
                            }
                        }
                    })
                }
            }
        })
    },
    go_jl:function(){
        wx.navigateTo({
            url: '../cash_jl/cash_jl'
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

    }
})