const app = getApp();
var config = require('../../utils/config.js');
Page({
    data: {
        pageStyle: `width:${app.globalData.width};height:${app.globalData.height}`,
        pageWidth: `width:${app.globalData.width};`,
        scale: app.globalData.windowWidth / app.globalData.windowHeight,
        scrollH: 0,
        scrollstyle: `overflow:hidden;`,
        itemHeight: 0,
        navbarArray: [
            // {
        //     text: '推荐',
        //     type: 'navbar-item-active',
        //     code: "Recommend"
        // }, {
        //     text: '校园头条',
        //     type: '',
        //     code: "Headlines"
        // }, {
        //     text: '教育',
        //     type: '',
        //     code: "	Education"
        // }, {
        //     text: '影视 ',
        //     type: '',
        //     code: "Movies"
        // }, {
        //     text: '电竞	',
        //     type: '',
        //     code: "ESports"
        // }, {
        //     text: '星座',
        //     type: '',
        //     code: "	Constellation"
        // }, {
        //     text: '娱乐',
        //     type: ''
        // }
        ],
        navbarShowIndexArray: Array.from(Array(6).keys()),//展示的个数
        navbarHideIndexArray: [],
        windowWidth: 375,
        scrollNavbarLeft: 0,
        currentChannelIndex: 0,//当前第几个
        startTouchs: {
            x: 0,
            y: 0
        },
        channelSettingShow: '',
        channelSettingModalShow: '',
        channelSettingModalHide: true,
        articlesHide: false,
        articleContent: '',
        loadingModalHide: false,
        temporaryArray: [],
        temporaryArray1: [],
        _num: 1,
        num_arr: [],
        num_jian: [],//触底去减
        isHave: false
    },
    //去详情
    go_details: function (e) {
        // let _type = e.currentTarget.dataset.type;//类型
        let _uuid = e.currentTarget.dataset.uuid;//id
        if (e.currentTarget.dataset.sid) {
            let _sid = e.currentTarget.dataset.sid;//id
            let _landingPage = e.currentTarget.dataset.landingpage;//id
            wx.navigateTo({
                url: "/pages/other/other?uuid=" + _uuid + "&sid=" + _sid + "&landingPage=" + _landingPage
            })
            return
        }
        wx.navigateTo({
            url: '/pages/article_details/article_details?uuid=' + _uuid,
        })
    },
    get_list_top: function () {
        let that = this;
        wx.request({
            url: config.baseUrl + '/stream/types',
            method: "GET",
            success: function (res) {
                if (res.data.code == "200") {
                    let _arr = res.data.data;
                    
                    for (var i = 0; i < _arr.length; i++) {
                        _arr[i].type = "";
                        _arr[0].type = 'navbar-item-active';
                    }
                    that.setData({
                        navbarArray: _arr,
                        isHave: false
                    })
                    let _cc = that.data.navbarArray.length;
                    let _tcc = that.data.navbarArray;
                    let c_arr = {};
                    for (var i = 0; i < _tcc.length; i++) {
                        c_arr['num' + i] = parseInt(_tcc[i].index)
                    }
                   
                    let c_type = {};
                    for (var j = 0; j < _tcc.length; j++) {
                        c_type[_tcc[j].code] = []
                    }
                    that.setData({
                        num_arr: c_arr,
                        num_jian: c_arr,
                        temporaryArray1: c_type,
                    })
                    let _type = _arr[0].code;
                    let _num = _arr[0].index;
                    that.get_list(_type, _num);
                }
            }
        })
    },
    //获取列表内容
    get_list: function (_type, _num) {
        let that = this;
        wx.request({
            url: config.baseUrl + '/stream?index=' + _num + "&type=" + _type,
            method: "GET",
            success: function (res) {
                if (res.data.code == "200") {
                    let _arr = res.data.data.inforArr;//
                    let _ad = [res.data.data.ad];//广告
                    if (_arr == null || _arr == "" || _arr == undefined) {
                        let _temporaryArray1 = that.data.temporaryArray1[_type];//比对数组
                        if (_temporaryArray1.length <= 0) {
                            that.setData({
                                isHave: true
                            })
                        } else {
                            that.setData({
                                temporaryArray: _temporaryArray1
                            })
                        }

                        return;
                    } else {
                        if (_ad != null || _ad != "" || _ad != undefined) {

                        } else {
                            _ad.unshift(2, 0);
                            Array.prototype.splice.apply(_arr, _ad);
                        }
                        if (_cc == "2") {

                        } else {
                            _arr = _arr.concat(that.data.temporaryArray);
                        }
                        for (var i = 0; i < _arr.length; i++) {
                            _arr[i].type = _type;
                            let _imgs = _arr[i].imgs;//
                            _imgs = _imgs.split(",");
                            _arr[i].img0 = config.imgUrl + _imgs[0];

                            if (_imgs[1] == undefined) {
                                return
                            } else {
                                _arr[i].img1 = config.imgUrl + _imgs[1];
                                _arr[i].img2 = config.imgUrl + _imgs[2];
                            }
                        }
                        let _temporaryArray1 = that.data.temporaryArray1;//比对数组
                        _temporaryArray1[_type] = _arr;
                        let _height = _arr.length;
                        let _scrollH = 123 * _height;
                        let _dd = `overflow:hidden`
                        if (_scrollH >= 492) {
                            _dd = ""
                        }
                        that.setData({
                            temporaryArray: _arr,
                            temporaryArray1: _temporaryArray1,
                            isHave: false,
                            scrollH: _scrollH,
                            scrollstyle: _dd
                        })

                        console.log(that.data.temporaryArray1)
                        console.log(that.data.temporaryArray)
                    }
                } else {
                    that.setData({
                        isHave: true
                    })
                }
            }
        })
        this.getArticles(0);
        wx.getSystemInfo({
            success: (res) => {
                that.setData({
                    windowWidth: res.windowWidth
                });
            }
        });
        let navbarArray = this.data.navbarArray;
        let navbarShowIndexArray = this.data.navbarShowIndexArray;
        let navbarHideIndexArray = [];
        navbarArray.forEach((item, index, array) => {
            if (-1 === navbarShowIndexArray.indexOf(index)) {
                navbarHideIndexArray.push(index);
            }
        });
        this.setData({
            navbarHideIndexArray: navbarHideIndexArray
        });
    },
    //切换
    get_list_q: function (_type, _num) {
        let that = this;
        let type = _type;
        let num = _num;
        let _temporaryArray1 = that.data.temporaryArray1[type];//比对数组
        if (_temporaryArray1.length == 0) {
            that.setData({
                temporaryArray: []
            });
            that.get_list(type, num, 4);
        } else {
            let _Arr = [];
            for (var i = 0; i < _temporaryArray1.length; i++) {
                if (_temporaryArray1[i].type == _type) {
                    let _imgs = _temporaryArray1[i].imgs;//
                    _imgs = _imgs.split(",");
                    _temporaryArray1[i].img0 = config.imgUrl + _imgs[0];
                    if (_imgs[1] == undefined) {
                        return
                    } else {
                        _temporaryArray1[i].img1 = config.imgUrl + _imgs[1];
                        _temporaryArray1[i].img2 = config.imgUrl + _imgs[2];
                    }
                    _Arr.push(_temporaryArray1[i]);
                }
            }
            if (_Arr.length <= 0) {
                let _currentChannelIndex = that.data.currentChannelIndex;//栏目坐标
                let _navbarArray = that.data.navbarArray[_currentChannelIndex].code;
                that.setData({
                    temporaryArray: []
                });
                that.get_list(_navbarArray, _num)
            } else {
                that.setData({
                    temporaryArray: _Arr,
                    isHave: false
                });
            }
        }
    },
    onTouchendArticles: function (e) {
        let deltaX = e.changedTouches[0].clientX - this.data.startTouchs.x;
        let deltaY = e.changedTouches[0].clientY - this.data.startTouchs.y;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            let deltaNavbarIndex = deltaX > 0 ? -1 : 1;
            let currentChannelIndex = this.data.currentChannelIndex;
            let navbarShowIndexArray = this.data.navbarShowIndexArray;
            let targetChannelIndexOfNavbarShowIndexArray = navbarShowIndexArray.indexOf(currentChannelIndex) + deltaNavbarIndex;
            let navbarShowIndexArrayLength = navbarShowIndexArray.length;
            if (targetChannelIndexOfNavbarShowIndexArray >= 0 && targetChannelIndexOfNavbarShowIndexArray <= navbarShowIndexArrayLength - 1) {
                let targetChannelIndex = navbarShowIndexArray[targetChannelIndexOfNavbarShowIndexArray];
                if (navbarShowIndexArrayLength > 6) {
                    let scrollNavbarLeft;
                    if (targetChannelIndexOfNavbarShowIndexArray < 5) {
                        scrollNavbarLeft = 0;
                    } else if (targetChannelIndexOfNavbarShowIndexArray === navbarShowIndexArrayLength - 1) {
                        scrollNavbarLeft = this.rpx2px(110 * (navbarShowIndexArrayLength - 6));
                    } else {
                        scrollNavbarLeft = this.rpx2px(110 * (targetChannelIndexOfNavbarShowIndexArray - 4));
                    }
                    this.setData({
                        scrollNavbarLeft: scrollNavbarLeft
                    });
                }
                this.switchChannel(targetChannelIndex);
            }
        }
    },
    onLoad: function () {
        let that = this;
        1
        wx.getSystemInfo({
            success: function (res) {
                let scrollH = res.windowHeight;
                that.setData({
                    scrollH: scrollH
                });
            }
        });
        that.get_list_top()
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },
    onTapNavbar: function (e) {
        this.switchChannel(parseInt(e.currentTarget.id));
    },
    switchChannel: function (targetChannelIndex) {
        this.getArticles(targetChannelIndex);
        let navbarArray = this.data.navbarArray;
        navbarArray.forEach((item, index, array) => {
            item.type = '';
            if (index === targetChannelIndex) {
                item.type = 'navbar-item-active';
            }
        });
        this.setData({
            navbarArray: navbarArray,
            currentChannelIndex: targetChannelIndex
        });
        let _num = this.data.num_arr['num' + targetChannelIndex];
        this.get_list_q(navbarArray[targetChannelIndex].code, _num);
    },
    getArticles: function (index) {
        this.setData({
            loadingModalHide: false,
            articleContent: ''
        });
        setTimeout(() => {
            this.setData({
                loadingModalHide: true,
                articleContent: this.data.navbarArray[index].name
            });
        }, 500);
    },
    rpx2px: function (rpx) {
        return this.data.windowWidth * rpx / 750;
    },
    resetNavbar: function () {
        let navbarArray = this.data.navbarArray;
        navbarArray.forEach((item, index, array) => {
            item.type = '';
            if (0 === index) {
                item.type = 'navbar-item-active';
            }
        });
        this.setData({
            navbarArray: navbarArray,
            scrollNavbarLeft: 0
        });
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        let that = this;
        let _currentChannelIndex = that.data.currentChannelIndex;
        let _navbarArray = that.data.navbarArray;
        let _code = _navbarArray[_currentChannelIndex].code;
        let _num = this.data.num_arr['num' + _currentChannelIndex] + 1;
        let _numArr = this.data.num_arr;
        _numArr['num' + _currentChannelIndex] = _num;
        that.setData({
            num_arr: _numArr,
            num_jian: _numArr
        });
        that.get_list(_code, _num, 3);
        wx.showNavigationBarLoading();
        //模拟加载    
        setTimeout(function () {
            // complete 
            wx.hideNavigationBarLoading()  //完成停止加载     
            wx.stopPullDownRefresh() //停止下拉刷新   
        }, 1500);
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;

        let _currentChannelIndex = that.data.currentChannelIndex;
        let _navbarArray = that.data.navbarArray;
        let _type = _navbarArray[_currentChannelIndex].code;
        let _num = this.data.num_jian;
        _num['num' + _currentChannelIndex] = _num['num' + _currentChannelIndex] - 1;
        let _temporaryArray1 = that.data.temporaryArray1[_type];//比对数组
        that.setData({
            num_jian: _num
        });
        that.get_list_jian(_type, _num['num' + _currentChannelIndex])
        wx.showNavigationBarLoading();
        //模拟加载    
        setTimeout(function () {
            // complete 
            wx.hideNavigationBarLoading()  //完成停止加载     
            wx.stopPullDownRefresh() //停止下拉刷新   
        }, 1500);
    },
    get_list_jian: function (_type, _num) {
        let that = this;
        wx.request({
            url: config.baseUrl + '/stream?index=' + _num + "&type=" + _type,
            method: "GET",
            success: function (res) {
                let _arr = res.data.data.inforArr;//
                let _ad = [res.data.data.ad];//广告
                let _temporaryArray1 = that.data.temporaryArray1[_type];//比对数组
                if (_arr.length <= 0) {
                    wx.showToast({
                        title: '暂时只有这么多了~~',
                        icon: 'none'
                    })
                    return;
                } else {
                    for (var i = 0; i < _arr.length; i++) {
                        _arr[i].type = _type;
                        let _imgs = _arr[i].imgs;//
                        _imgs = _imgs.split(",");
                        _arr[i].img0 = config.imgUrl + _imgs[0];

                        if (_imgs[1] == undefined) {
                            return
                        } else {
                            _arr[i].img1 = config.imgUrl + _imgs[1];
                            _arr[i].img2 = config.imgUrl + _imgs[2];
                        }
                    }
                    let c_arr = _temporaryArray1.concat(_arr);
                    that.setData({
                        temporaryArray1: c_arr,
                        temporaryArray: []
                    });
                    that.setData({
                        temporaryArray1: c_arr,
                        temporaryArray: c_arr
                    });
                }
            }
        })
    }
})
