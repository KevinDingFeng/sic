// pages/my_integration/my_integration.js
const app = getApp();
var config = require('../../utils/config.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageStyle: `width:${app.globalData.width};height:${app.globalData.height}`,
        pageWidth: `width:${app.globalData.width};`,
        scale: app.globalData.windowWidth / app.globalData.windowHeight,
        total_points:"1",//总分
        points_list:[],
        page:"0",
        isShow:false,
        isHave:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        let _num = _this.data.page;
        _this.get_list(_num)

    },
    get_list:function(_num){
        let _this = this;
        let _token = wx.getStorageSync('tennisToken');
        wx.request({
            url: config.baseUrl + '/m/integral_record/total_integral',
            header: {
                "treasure_token": _token
            },
            success: function (res) {
                if (res.data.code == "200"){
                    let _total_points = res.data.data.totalAmount;//总分
                    _this.setData({
                        total_points: _total_points
                    })
                }  
            }
        })
        wx.request({
            url: config.baseUrl + '/m/integral_record/details?page=' + _this.data.page,
            header: {
                "treasure_token": _token
            },
            method: "GET",
            success: function (res) {
                if(res.data.code =="200"){
                    let _points_list = res.data.data.content;
                    if (_points_list == "" || _points_list == undefined || _points_list==null){
                        _this.setData({
                            isHave: true
                        })
                        return
                    }
                    _points_list = _points_list.concat(_this.data.points_list);
                    let totalPages = res.data.data.totalPages;//总页数
                    let isshow = false
                    for (var i = 0; i < _points_list.length; i++) {
                        if (_points_list[i].settled == false) {
                            _points_list[i].settled = "+"
                        } else if (_points_list[i].settled == true){
                            _points_list[i].settled = "-"
                        }
                    }
                    if (totalPages > parseInt(_this.data.page) + 1) {
                        isshow = true;
                    }
                    _this.setData({
                        points_list: _points_list,
                        isShow: isshow
                    })
                }
            }
        })
    },
    add_pages: function () {
        let _this = this;
        let _num = parseInt(_this.data.page);
        _num = _num + 1;
        _this.setData({
            page: _num
        })
        _this.get_list(_num)
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