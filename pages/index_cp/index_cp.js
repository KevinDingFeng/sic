const app = getApp();
var config = require('../../utils/config.js');
Page({
  data: {
    pageWidth: `width:${app.globalData.width};`,
    navbarArray: [],
    temporaryArray: [],
    allTypeTemporaryArray: [],//每个类型的 临时缓存，即所有 temporaryArray 的集中存储 
    num_arr: [],
    num_reverse: [],//触底去减
    isHave: false,
    navbarActiveId: 0
  },
  //只执行一次
  onLoad: function () {
    let _this = this;
    //设置 获取 头部导航的回调函数，获取列表中的文章信息
    var successCallbackFun = function(_code, _num){
      _this.getListForOnePage(_code, _num, "onLoad", _this.setListInfo);//获取 _num 指定的文章信息，设置回调函数是 解析文章信息
    };
    this.getTopTypeList(successCallbackFun);//获取 首页 头部的 类型 列表
  },
  //获取头部的类型导航信息
  getTopTypeList: function (successCallbackFun) {
    let that = this;
    wx.request({
      url: config.baseUrl + '/stream/types',
      method: "GET",
      success: function (res) {
        console.log(res);
        if (res.data.code == "200") {
          //先设置 navbarArr 
          let _arr = res.data.data;
          that.setData({
            navbarArray: _arr
          })
          //获取完类型之后，要明确 1，是否需要使用缓存中的 num_arr,并同时更新num_reverse（该变量不能做缓存，缓存后会有问题）；2，首页显示的内容 是通过缓存获取 还是通过接口获取(==暂时实现不了，缓存内容有要求)
          let code = _arr[0].code;
          if (app.existStorageSyncValidTime('sicNumArrExp')) {//&& app.existStorageSyncValidTime('sicNumReverseExp')
            var cacheNumArr = wx.getStorageSync('sicNumArr');
            // var cacheNumReverse = wx.getStorageSync('sicNumReverse');
            // that.updateNumArrAndReverse(cacheNumArr, cacheNumReverse);//更新 num_arr 和 num_reverse
            that.updateNumArrAndReverse(cacheNumArr, cacheNumArr);//更新 num_arr 和 num_reverse
          }else{
            let c_arr = {};
            for (let i = 0; i < _arr.length; i++) {
              let _index = _arr[i].index;
              if (_index && _index > 0){
                --_index ;
              }
              c_arr[_arr[i].code] = parseInt(_index);//每个类型对应的起始坐标, key = CODE , value = INDEX
            }
            that.updateNumArrAndReverse(c_arr, c_arr);//更新 num_arr 和 num_reverse
          }
          let _num = that.data.num_arr[code];
          successCallbackFun(code, _num);//获取列表中的文章信息
        }
      }
    })
  },
  //获取列表内容
  getListForOnePage: function (code, _num, funcName, successCallbackFun) {
    console.log(code, _num);
    let that = this;
    wx.request({
      url: config.baseUrl + '/stream?index=' + _num + "&type=" + code,
      method: "GET",
      success: function (res) {
        console.log(res);
        if(successCallbackFun){
          successCallbackFun(code, res.data, funcName);//回调函数是 解析文章信息
          wx.hideNavigationBarLoading();  //完成停止加载
        }
      }
    })
  },
  //设置首页列表的内容 包括 文章、广告、软文
  // param1 _type 类型的 code
  // param2 data 需要处理的数据
  // param3 funcName 用来区别方法的来源，onLoad 表示初次加载，onPullDown 表示下拉, onPullUp 表示上拉
  setListInfo: function (code, data, funcName){
    if (data.code == "200") {
      let _arr = data.data.inforArr;//文章
      let _ad = data.data.ad;//广告
      if (!_arr) {//_arr 不存在，即文章不存在
        let _allTypeTempArr = this.data.allTypeTemporaryArray[code];//比对数组；通过类型到已有的数组中获取信息
        if (!_allTypeTempArr || _allTypeTempArr.length <= 0) {
          this.setIsHave(true);//提示“暂无信息”
        } else {
          this.updateTemporaryArray(_allTypeTempArr);//当历史数据存在该类型的信息时，直接赋值
        }
      } else {
        if (_ad) {//如果广告存在
          _arr.splice(1, 0, _ad);//把广告信息拼到文章信息中
        }
        _arr = this.setImgsUrl(_arr); //设置图片的 url
        if (funcName && (funcName == "onPullDown" || funcName == "onPullUp")){
          //如果是上拉或下拉加载，_arr 需要添加到已有数据的头部或者尾部
          _arr = this.fullTemporaryArray(_arr, funcName, code, data.data.index);
        }
        this.setData({
          temporaryArray: _arr,
          isHave: false,
          // scrollstyle: this.calculateScrollstyle(_arr.length)
        });
        //更细总集合数据
        this.updateAllTypeTemporaryArrayByCode(code, _arr);
      }
    } else {
      this.setIsHave(true);//提示“暂无信息”
    }
  },
  //根据 funcName 填充数据，onPullDown 填充到原有数据的头部，onPullUp 填充到原有数据的尾部
  // param1 _arr 现有数据
  // param2 funcName 用来区别方法的来源，onLoad 表示初次加载，onPullDown 表示下拉, onPullUp 表示上拉
  fullTemporaryArray: function (_arr, funcName, _code, _num){
    if (funcName && this.data.temporaryArray){
      let teamArr = this.data.temporaryArray;
      if (funcName == "onPullDown"){//下拉
        for (let i = 0; i < teamArr.length ; i ++){
          _arr.splice(_arr.length, 0, teamArr[i]);
        }
        let _numArr = this.data.num_arr;
        _numArr[_code] = _num;
        this.updateNumArr(_numArr);
        wx.stopPullDownRefresh(); //停止下拉刷新
      } else if (funcName == "onPullUp"){//上拉
        for (let i = 0; i < _arr.length; i++) {
          teamArr.splice(teamArr.length, 0, _arr[i]);
        }
        let _numArr = this.data.num_reverse;
        _numArr[_code] = _num;
        this.updateNumReverse(_numArr);
        _arr = teamArr;
      }
    }
    return _arr;
  },
  //更新当前的显示数据集合
  updateTemporaryArray: function (tempArr){
    this.setData({
      temporaryArray: tempArr,//当历史数据存在该类型的信息时，直接赋值
      isHave: false
    })
  },
  //更新 code 对应的总集合数据
  updateAllTypeTemporaryArrayByCode: function(code, _arr){
    let _allTypeTempArr = this.data.allTypeTemporaryArray;//比对数组，历史数据
    _allTypeTempArr[code] = _arr;
    this.setData({
      allTypeTemporaryArray: _allTypeTempArr,
    });
    // wx.setStorageSync('sicAllTypeTemporaryArray', _allTypeTempArr);//暂时不实现，缓存对内容有要求
    // app.setStorageSyncInvalidTime('sicAllTypeTemporaryArrayExp', 3600000);//设置有效期
  },
  //更新 总集合数据
  updateAllTypeTemporaryArray: function(_arr){
    this.setData({
      allTypeTemporaryArray: _arr
    });
    // wx.setStorageSync('sicAllTypeTemporaryArray', _arr);//暂时不实现，缓存对内容有要求
    // app.setStorageSyncInvalidTime('sicAllTypeTemporaryArrayExp', 3600000);//设置有效期
  },
  //更新 num_arr 和 num_reverse
  updateNumArrAndReverse: function(numArr, numReverse){
    this.setData({
      num_arr: numArr,
      num_reverse: numReverse
    });
    wx.setStorageSync('sicNumArr', numArr);
    // wx.setStorageSync('sicNumReverse', numReverse);
    app.setStorageSyncInvalidTime('sicNumArrExp', 3600000);//设置有效期
    // app.setStorageSyncInvalidTime('sicNumReverseExp', 3600000);//设置有效期
  },
  //更新 num_reverse ，包括设置缓存
  updateNumReverse: function(numReverse){
    this.setData({
      num_reverse: numReverse
    });
    // wx.setStorageSync('sicNumReverse', numReverse);
    // app.setStorageSyncInvalidTime('sicNumReverseExp', 3600000);//设置有效期
  },
  //更新 num_arr ，包括设置缓存
  updateNumArr: function (numArr) {
    this.setData({
      num_arr: numArr
    });
    wx.setStorageSync('sicNumArr', numArr);
    app.setStorageSyncInvalidTime('sicNumArrExp', 3600000);//设置有效期
  },
  //设置图片的 url
  setImgsUrl: function(_arr){
    for (var i = 0; i < _arr.length; i++) {//设置信息的 类型和 图片路径
      let _imgs = _arr[i].imgs;//
      _imgs = _imgs.split(",");
      _arr[i].img0 = config.imgUrl + _imgs[0];
      if (_imgs[1]) {
        _arr[i].img1 = config.imgUrl + _imgs[1];
        _arr[i].img2 = config.imgUrl + _imgs[2];
      }
    }
    return _arr;
  },
  //页面相关事件处理函数--监听用户下拉动作
  onPullDownRefresh: function () {
    var _code = this.data.navbarArray[this.data.navbarActiveId].code;
    // var _numArr = this.data.num_arr;
    // _numArr[_code] = _numArr[_code] + 1;
    // this.updateNumArr(_numArr);//应该在获取信息之后再更新
    // var _num = _numArr[_code];
    var _num = this.data.num_arr[_code] + 1
    wx.showNavigationBarLoading();
    // wx.startPullDownRefresh();//这个不能开启，会造成死循环
    this.getListForOnePage(_code, _num, "onPullDown", this.setListInfo);
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    var _code = this.data.navbarArray[this.data.navbarActiveId].code;
    // var _numArr = this.data.num_reverse;
    // var _index = _numArr[_code];
    var _index = this.data.num_reverse[_code];
    if (_index && _index > 1){
      // _numArr[_code] = _numArr[_code] - 1;
      // this.updateNumReverse(_numArr);//应该在获取信息之后再更新
      // var _num = _numArr[_code];
      var _num = _index - 1;
      wx.showNavigationBarLoading();
      this.getListForOnePage(_code, _num, "onPullUp", this.setListInfo);
    }else{
    }
  },
  //点击导航的事件
  onTapNavbar: function (e) {
    let idx = e.currentTarget.id;
    let code = this.data.navbarArray[idx].code;
    //TODO 设置导航选中的样式
    this.setData({
      navbarActiveId: idx
    });
    this.switchChannel(code);//切换导航
  },
  //切换导航
  switchChannel: function (code) {
    let _num = this.data.num_arr[code];//获取类型对应的起始坐标
    this.switchTemporaryArr(code, _num);// 切换 导航对应的数据
  },
  //导航对应的数据，如果 总集合中存在数据，则不需要获取，直接展示；如果不存在说明是第一次获取，需要访问后台
  switchTemporaryArr: function (code, _num) {
    let _allTypeTempArr = this.data.allTypeTemporaryArray[code];//比对数组，历史数据
    if (!_allTypeTempArr || _allTypeTempArr.length == 0) {
      this.setTemporaryArray([]);//设置系统的 temporaryArray，即当前类型的列表信息
      //当发现 总集合中不存在当前类型的数据，就重新获取
      this.getListForOnePage(code, _num, "switch", this.setListInfo);//获取 _num 指定的文章信息，设置回调函数是 解析文章信息
    } else {
      this.setData({
        temporaryArray: _allTypeTempArr,
        isHave: false
      });
    }
  },
  //去详情, 使用是否存在 sid(广告策略id)来区别当前点击的是广告还是文章
  go_details: function (e) {
    let _uuid = e.currentTarget.dataset.uuid;
    if (e.currentTarget.dataset.sid) {
      let _sid = e.currentTarget.dataset.sid;
      let _landingPage = e.currentTarget.dataset.landingpage;
      wx.navigateTo({
        url: "/pages/other/other?uuid=" + _uuid + "&sid=" + _sid + "&landingPage=" + _landingPage
      })
    } else {
      wx.navigateTo({
        url: '/pages/article_details_cp/article_details_cp?uuid=' + _uuid
      })
    }
  },
  //设置系统的 isHave 变量
  // param1 isHave true 时显示“暂无信息”；false 时显示文章等列表内容
  setIsHave: function(isHave){
    this.setData({
      isHave: isHave
    })
  },
  //设置系统的 temporaryArray，即当前类型的列表信息
  // param1 arr 当前的集合，可以为 []
  setTemporaryArray: function(arr){
    this.setData({
      temporaryArray: arr
    });
  },
  //计算 scrollstyle 值
  // param1 len 某个集合的 length 属性
  calculateScrollstyle: function (len) {
    // return 367 * len >= 492 ? "" : `overflow:hidden`;
    return len > 3 ? "" : `overflow:hidden`;
  }
})
