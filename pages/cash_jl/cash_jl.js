// pages/cash_jl/cash_jl.js
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
        points_list: [],
        page: "0",
        isShow: false,
        isHave: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this;
        let _num = _this.data.page;
        _this.get_list(_num)
    },
    get_list: function (_num){
        let _this = this;
        let _token = wx.getStorageSync('tennisToken');
        wx.request({
            url: config.baseUrl + '/m/extraction_record/details?page=' + _num,
            header: {
                "treasure_token": _token
            },
            success: function (res) {
                if (res.data.code == "200") {
                    let arr_list = res.data.data.content;
                    if (arr_list == "" || arr_list == undefined || arr_list == null) {
                        _this.setData({
                            isHave: true
                        })
                        return
                    }
                    arr_list = arr_list.concat(_this.data.points_list);
                    let totalPages = res.data.data.totalPages;//总页数
                    let isshow = false
                    for (var i = 0; i < arr_list.length; i++) {
                        if (arr_list[i].extractionState == "Processing") {
                            arr_list[i].extractionState = "处理中"
                        } else if (arr_list[i].extractionState == "Reject") {
                            arr_list[i].extractionState = "已驳回"
                        } else if (arr_list[i].extractionState == "Complete") {
                            arr_list[i].extractionState = "已完成"
                        }
                    }
                    if (totalPages > parseInt(_this.data.page) + 1) {
                        isshow = true;
                    }
                    _this.setData({
                        points_list: arr_list,
                        isShow: isshow
                    })
                }
            }
        })
    },
    add_pages:function(){
        let _this = this;
        let _num = parseInt(_this.data.page);
        _num = _num+1;
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