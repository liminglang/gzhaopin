const Base = require('./base.js');
const rp = require('request-promise');

module.exports = class extends Base {
  async loginByWeixinAction() {
    const code = this.post('code');
    // const fullUserInfo = this.post('userInfo');
    // const userInfo = fullUserInfo.userInfo;
    // const clientIp = ''; // 暂时不记录 ip
    //console.log("userInfo==============",userInfo)
    // 获取openid
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      qs: {
        grant_type: 'authorization_code',
        js_code: code,
        secret: think.config('weixin.secret'),
        appid: think.config('weixin.appid')
      }
    };
    let sessionData = await rp(options);
    sessionData = JSON.parse(sessionData);
    if (!sessionData.openid) {
      return this.fail('登录失败');
    }

    // 验证用户信息完整性
    // const crypto = require('crypto');
    // const sha1 = crypto.createHash('sha1').update(fullUserInfo.rawData + sessionData.session_key).digest('hex');
    // console.log("sha1====",sha1)
    // if (fullUserInfo.signature !== sha1) {
    //   return this.fail('登录失败2222');
    // }

    // 解释用户数据
    // const WeixinSerivce = this.service('weixin');
    // const weixinUserInfo = await WeixinSerivce.decryptUserInfoData(sessionData.session_key, fullUserInfo.encryptedData, fullUserInfo.iv);
    // console.log("weixinUserInfo========",weixinUserInfo)
    // if (think.isEmpty(weixinUserInfo)) {
    //   return this.fail('登录失败3333');
    // }

    // 根据openid查找用户是否已经注册
    let userId = await this.model('user').where({ wxopenid: sessionData.openid }).getField('id', true);
    let addData = {
      wxopenid: sessionData.openid,
    }
    // if(userInfo){
    //   addData.avatar = userInfo.avatarUrl || '';
    //   addData.gender = userInfo.gender || 1;
    //   addData.wxnickname = userInfo.nickName;
    // }
    if (think.isEmpty(userId)) {
      // 注册
      userId = await this.model('user').add(addData
        // username: '微信用户' + think.uuid(6),
        // password: sessionData.openid,
        // register_time: parseInt(new Date().getTime() / 1000),
        // register_ip: clientIp,
        // last_login_time: parseInt(new Date().getTime() / 1000),
        // last_login_ip: clientIp,
        // mobile: '',
        // wxopenid: sessionData.openid,
        // avatar: userInfo.avatarUrl || '',
        // gender: userInfo.gender || 1, // 性别 0：未知、1：男、2：女
        // wxnickname: userInfo.nickName
      );
    }

    sessionData.user_id = userId;

    // 查询用户信息
    // const newUserInfo = await this.model('user').field(['id', 'username', 'nickname', 'gender', 'avatar', 'birthday']).where({ id: userId }).find();
    const newUserInfo = await this.model('user').field(['id', 'wxnickname', 'gender', 'avatar']).where({ id: userId }).find();

    // 更新登录信息
    /*
    userId = await this.model('user').where({ id: userId }).update({
      last_login_time: parseInt(new Date().getTime() / 1000),
      last_login_ip: clientIp
    });
    */

    const TokenSerivce = this.service('token');
    const sessionKey = await TokenSerivce.create(sessionData);

    if (think.isEmpty(newUserInfo) || think.isEmpty(sessionKey)) {
      return this.fail('登录失败');
    }

    return this.success({ token: sessionKey, userInfo: newUserInfo });
  }

  async logoutAction() {
    return this.success();
  }
  
  async updateUserAction() {
    const id = this.get('userid');
    const name = this.post('name');
    const email = this.post('email');
    const phone = this.post('phone');
    const birthday = this.post('birthday');
    const region = this.post('address');
    const education = this.post('education')
    const gender = this.post('gender');
    const avatar = this.post('avatar');
    const wxnickname = this.post('wxnickname');
    let userInfo = {}
    let setData = {}
    if(name){
      setData.name = name
    }
    if(email){
      setData.email = email
    }
    if(phone){
      setData.phone = phone
    }
    if(birthday){
      setData.birthday = birthday
    }
    if(region){
      setData.region = region
    }
    if(education){
      setData.education = education
    }
    if(gender){
      if(gender == '男'){
        setData.gender = 1
      }else{
        setData.gender = 2
      }     
    }
    if(avatar){
      setData.avatar = avatar
    }
    if(wxnickname){
      setData.wxnickname = wxnickname
    }
    if(region){
      setData.address = region
    }
    
    const userId = await this.model('user').where({ id: id }).update(setData);
    if(userId){
      userInfo.avatar = avatar;
      userInfo.wxnickname = wxnickname;
    }
    return this.success({userInfo:userInfo});
  }
};
