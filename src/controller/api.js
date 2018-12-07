const Base = require('./base.js');
const jsonLogger = require('../utility/jsonlog.js');
const rp = require('request-promise');
const fs = require('fs');
const request = require('request');
module.exports = class extends Base {
  testAction() {
    think.logger.debug('api test');
  }

  // 获取未结束的职位列表
  async getJobListAction() {
    // const jobinfo = await this.model('job').where({ status: 0 }).countSelect(5, true);
    const jobinfo = await this.model('job').where({ status: 0 }).select();
    return this.success({jobList: jobinfo});
  }

  // 获取职位详情
  async getJobDetailAction() {
    const jobid = this.get('id');
    const jobinfo = await this.model('job').where({ id: jobid }).find();
    return this.success({jobInfo: jobinfo});
  }

  // 用户信息
  async getUserInfoAction() {
    const uid = this.get('userid');
    const userinfo = await this.model('user').where({ id: uid }).find();
    return this.success({userInfo: userinfo});
  }

  // 某个用户某个职位的分享信息
  async getShareInfoAction() {
    const uid = this.get('userid');
    const jobid = this.get('id');
    let first = 0;
    const shareinfo = await this.model('share').join('zhaopin_user ON zhaopin_share.father=zhaopin_user.id').where({ userid: uid,jobid:jobid}).field(['father','first','avatar','wxnickname']).find();
    if (!shareinfo.first) {
      shareinfo.first = first;
    }
    return this.success({shareinfo: shareinfo});
  }

  // 获取当前用户所有分享过的职位
  async getShareJobListAction(){
    const uid = this.get('userid');
    const shareJobList = await this.model('job').join('zhaopin_share ON zhaopin_share.jobid=zhaopin_job.id').order('zhaopin_job.status ASC, zhaopin_share.optime DESC').where({ 'zhaopin_share.father': uid }).field(['status','zhaopin_job.id','optime','name','company','location','salary','jobtype','bonus','city']).select();
    return this.success({shareJobList: shareJobList});
  }

  // 获取某个职位的分享链
  async getJobShareListAction() {
    const jobid = this.get('id');
    const shareList = await this.model('share').join('zhaopin_user ON zhaopin_share.father=zhaopin_user.id').where({ jobid: jobid }).field(['zhaopin_user.avatar']).select();
    return this.success({shareList: shareList});
  }

  // 获取当前用户的赏金余额
  async getBalanceAction() {
    const uid = this.get('userid');
    const balance = await this.model('user').where({ id: uid }).field(['balance','avatar','wxnickname']).find();
    return this.success({balance: balance});
  }

  // 绑定分享关系 POST
  async shareAction() {
    const uid = this.get('userid');
    let first = this.get('first');
    const jid = this.get('id');
    const father = this.get('father');
    if(first==0){
      first = father
    }
    // 是否分享过
    const id = await this.model('share').where({userid: uid, jobid: jid}).find();
    if (!think.isEmpty(id)) {
      return this.fail({errmsg: '已经参与该职位分享'});
    }
    if(father == uid){
      return this.fail({errmsg: '上级不能是自己'});
    }
    // insert into db
    const shareid = await this.model('share').add({
      first: first,
      jobid: jid,
      userid: uid,
      father: father,
      optime: parseInt(new Date().getTime() / 1000)
    });
    return this.success({shareid: shareid});
  }

  // 获取发起分享的第一个人
  async getFirstShareUserAction() {
    const userid = this.get('userid');
    const jobid = this.get('jobid');

    const shareinfo = await this.model('share').where({ userid: userid, jobid: jobid }).find();

    let shareid = 0;
    if (shareinfo) {
      shareid = shareinfo.first;
    }

    const jobinfo = await this.model('job').where({ id: jobid }).find();
    return this.success({firstshareid: shareid, jobinfo: jobinfo, father: shareinfo.father});
  }

  // 获取可分享职位
  async getCanShareJobAction() {
    const userid = this.get('userid');
    // step1 先拿到该用户分享过的职位
    const sjobs = await this.model('share').where({userid: userid}).getField('jobid');

    // step2 拿到所有未结束的职位
    const wjobs = await this.model('job').where({status: 0}).getField('id');

    // 取一个没分享过的
    var retjobs = 0;
    for (var i = 0; i < wjobs.length; i++) {
      var temp = wjobs[i];
      for (var j = 0; j < sjobs.length; j++) {
        if (temp === sjobs[j]) {
          break;
        }
      }
      if (j === sjobs.length) {
        retjobs = temp;
        break;
      }
    }

    // 如果已经全部分享过了,随机返回一个已经分享的职位
    if (retjobs === 0 && sjobs.length > 0) {
      const idx = Math.floor(Math.random() * (sjobs.length - 1));
      retjobs = sjobs[idx];
    }

    var jobinfo;
    if (retjobs) {
      jobinfo = await this.model('job').where({ id: retjobs }).find();
    }
    return this.success({jobinfo: jobinfo});
  }

  // 用户的分享页相关信息， 1.赏金， 2.分享状态， 3.入职后获奖明细
  async getMyShareAction() {
    const userid = this.get('userid');

    // step1 分享历史
    const sjobs = await this.model('share').where({userid: userid}).getField('jobid');
    // 拉取职位明细
    var sjobinfo;
    if (!think.isEmpty(sjobs)) {
      sjobinfo = await this.model('job').where({'id': ['IN', Array.from(sjobs)]}).select();
    }

    // step2 赏金
    const bonus = await this.model('bonushistory').where({userid: userid, status: 0}).sum('money');

    // setp3 奖金明细
    const bonushistory = await this.model('bonushistory').where({userid: userid}).order('addtime DESC').limit(5).select();
    if (!think.isEmpty(bonushistory)) {
      for (var i in bonushistory) {
        // 入职人员信息
        const entrant = await this.model('contact').where({jobid: bonushistory[i].jobid, shareuser: bonushistory[i].first}).find();
        if (!think.isEmpty(entrant)) {
          const uinfo = await this.model('user').field(['wxnickname']).where({id: entrant.userid}).find();
          bonushistory[i].entrantwxnickname = uinfo.wxnickname;
          const jobname = await this.model('job').field(['name']).where({id: bonushistory[i].jobid}).find();
          bonushistory[i].jobname = jobname.name;
        }
        // 有效传播人数
        bonushistory[i].numberofmember = await this.model('bonushistory').where({jobid: bonushistory[i].jobid, first: bonushistory[i].first, isaverage: 1}).count();
      }
    }

    return this.success({sjobinfo: sjobinfo, bonus: bonus, bonushistory: bonushistory});
  }

  // 取分享明细
  async getShareDetailAction() {
    const userid = this.get('userid');
    const jobid = this.get('jobid');
    const sons = await this.model('share').join('zhaopin_user ON zhaopin_share.userid=zhaopin_user.id').field(['avatar', 'optime','wxnickname','userid','first']).where({father: userid, jobid: jobid}).select();
    // 昵称、头像
    for (var i = 0; i < sons.length; i++) {
      const shareCount = await this.model('share').where({father: sons[i].userid}).count();
      sons[i].shareCount = shareCount;
    }

    const father = await this.model('share').join('zhaopin_user ON zhaopin_share.father=zhaopin_user.id').field(['father', 'avatar', 'optime','wxnickname', 'first']).where({userid: userid, jobid: jobid}).find();
    // 昵称、头像
    // if (father.father !== 0) {
    //   const finfo = await this.model('user').field(['wxnickname', 'avatar']).where({id: father.father}).find();
    //   father.wxnickname = finfo.wxnickname;
    //   father.avatar = finfo.avatar;
    // }

    // 招聘结果
    let first = sons[0].first
    const result = await this.model('contact').where({ jobid: jobid, shareuser: first, status: 1 }).find();
    // 有效分享链(平分链)
    if (!think.isEmpty(result)) {
      // 应聘者头像信息
      const uinfo = await this.model('user').field(['wxnickname', 'avatar']).where({id: result.userid}).find();
      result.wxnickname = uinfo.wxnickname;
      result.avatar = uinfo.avatar;

      // 成功推荐入职者的人
      result.father = await this.model('share').join('zhaopin_user ON zhaopin_share.father=zhaopin_user.id').field(['father', 'avatar', 'optime','wxnickname','zhaopin_user.id']).where({userid: result.userid, jobid: jobid,father:result.spreaduser}).find();
      // 成功把消息分享给推荐人的人
      if(!think.isEmpty(result.father)){
        result.grandfather = await this.model('share').join('zhaopin_user ON zhaopin_share.father=zhaopin_user.id').field(['father', 'avatar', 'optime','wxnickname']).where({userid: result.father.id, jobid: jobid,father:result.father.father}).find();
      }
      
      // 有效分享链
      if(!think.isEmpty(result.grandfather)){
        result.sharePeople = await this.model('share').join('zhaopin_user ON zhaopin_share.userid=zhaopin_user.id').field(['wxnickname', 'avatar']).where({jobid: jobid, first: father.first, userid: ['NOTIN', [result.spreaduser,result.father.father, result.userid]]}).select();
      }
      // 昵称、头像
      // for (i = 0; i < bonus.length; i++) {
      //   const uinfo = await this.model('user').field(['wxnickname', 'avatar']).where({id: bonus[i].userid}).find();
      //   bonus[i].wxnickname = uinfo.wxnickname;
      //   bonus[i].avatar = uinfo.avatar;
      // }
    }
    return this.success({sons: sons, father: father, result: result});
  }
  
  // 获取收支明细
  async getBillListAction() {
    const uid = this.get('userid');
    const billList = await this.model('bill').join('zhaopin_user ON zhaopin_bill.userid=zhaopin_user.id').where({ userid: uid }).field(['avatar','wxnickname','reason','result','status','balance','created','money']).select();
    return this.success({billList: billList});
  }

  // 新增一条收支明细
  async addBillRecordAction() {
    const data = this.post();
    let balance = await this.model('user').where({ id: data.userid }).getField('balance');
    balance = balance[0]
    if(data.status==1){
      if(balance<data.money){
        return this.fail({errmsg: '余额小于提现金额'});
      }
    }
    const dateStamp = parseInt(new Date().getTime() / 1000);
    
    var bill = await this.model('bill').add({
      userid:data.userid,
      reason:data.reason,
      status:data.status,
      money:data.money,
      created:dateStamp
    });
    if(!think.isEmpty(bill)){
      if(data.status==1){
        balance = balance - data.money
      }else if(data.status ==0){
        balance = balance + data.money
      }
      await this.model('user').where({ id: data.userid }).update({balance:balance});
    }
    return this.success({ bill: bill });
  }

  // 上传联系资料 POST
  async uploadContactAction() {
    const data = this.post();

    const rets = await this.model('contact').where({jobid: data.jobid, userid: data.userid}).find();
    if (!think.isEmpty(rets)) {
      return this.fail({errmsg: '已上传过'});
    }

    // add db
    var ret = await this.model('contact').add({
      userid: data.userid,
      name: data.name,
      mail: data.mail,
      phone: data.phone,
      weixin: data.weixin,
      jobid: data.jobid,
      spreaduser: data.spread,
      shareuser: data.shareuser
    });

    return this.success({ ret: ret });
  }

  async addFankuiAction() {
    const data = this.post();
    const dateStamp = parseInt(new Date().getTime() / 1000);
    var fankui = await this.model('fankui').add({
      userid:data.userid,
      content:data.content,
      created:dateStamp
    });
    return this.success({ fankui: fankui });
  }

  // 生成二维码
  async getWxacodeAction() {
    const self = this;
    const userId = this.get('userId');
    const jobId = this.get('jobId');
    const first = this.get('first');
    // jsonLogger.writeJsonLog('请求分享码', userId, {
    //   userId: userId.toString(),
    //   jobId:jobId.toString()
    // });

    const imgDir = './www/static/qrcode/';
    const fileName = userId.toString() + jobId.toString()  + '.png';
    // const scene = {
    //   userId: userId,
    //   jobId: jobId,
    //   firstUserId: shareId
    // }
    // const sceneJsonStr = JSON.stringify(scene);
    const sceneJsonStr = userId.toString() + '&' + jobId.toString() + '&' + first.toString() ;

    // 先查看本地是否有文件
    try {
      fs.accessSync(imgDir + fileName);
      return self.success({filename: fileName});
    } catch (err) {
    }

    // acess token
    const options = {
      method: 'GET',
      url: 'https://api.weixin.qq.com/cgi-bin/token',
      qs: {
        grant_type: 'client_credential',
        appid: think.config('weixin.appid'),
        secret: think.config('weixin.secret')
      }
    };
    let accessTokenData = await rp(options);
    accessTokenData = JSON.parse(accessTokenData);
    // think.logger.debug(this.ctx.res);
    if (accessTokenData.errorcode != null || accessTokenData.access_token == null) {
      return think.fail(-1000, 'accesstoken获取失败');
    }

    // const access_token = '14_3XE1vlNS_nhBxh0ZW4ko1VDydiQy2jemTdtxTHJnjxn3nW8oTpHFPXoG4ZhaRo7s1-zax4hah7eAZb5twH0_zgaiLENpXoPajsRwnVzI4IdMgqC3182vMds67JnavJls-nT3eNm-DqmAbtlSXQVhAAAPIN'
    var postData = {
     // page: 'pages/detail',
      scene: sceneJsonStr
      // width: 430,
      // auto_color: false
    };
    postData = JSON.stringify(postData);
    request({
      method: 'POST',
      url: 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=' + accessTokenData.access_token,
      body: postData
    }).pipe(fs.createWriteStream(imgDir + fileName));

    return this.success({filename: fileName});
  }
  // 保存分享图片
  async saveShareImageAction() {
    const userId = this.get('userId');
    const jobId = this.get('jobId');
    let hostdir = ''
    let readable = '';
    let fileName = userId + jobId;
    let path = '';
    this.ctx.body = this.ctx.request.body;
    if(this.ctx.body.file.image){
      hostdir = "./www/static/image/"
      readable = fs.createReadStream(this.ctx.body.file.image.path);
      path = hostdir + fileName +'.jpg'
    }else{
      hostdir = "./www/static/fankui/"
      let number = this.ctx.body.post.number;
      path = hostdir +  fileName + '/'+number + '.jpg'
      readable = fs.createReadStream(this.ctx.body.file.fankui.path);
      if (!fs.existsSync(hostdir+fileName)) {
        fs.mkdirSync(hostdir+fileName);
      }
    }
    const writable = fs.createWriteStream(path);
    readable.pipe(writable);
  };
  // 获取分享图片
  async getShareImageAction() {
    const userId = this.get('userId');
    const jobId = this.get('jobId');
    let dirname = userId +jobId ;
    let hostdir = "./www/static/image/";
    let data = {}
    if (fs.existsSync(hostdir+dirname+'.jpg')) {
      data = {filename: '/static/image/'+dirname+'.jpg'};
      return this.success(data);
    }else{
     return this.success({errmessage:'文件不存在'});
    }
  }
};
