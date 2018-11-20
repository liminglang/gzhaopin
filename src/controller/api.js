const Base = require('./base.js');

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

  // 绑定分享关系 POST
  async shareAction() {
    const uid = this.get('userid');
    const firstuid = this.get('firstuserid');
    const jid = this.get('jobid');
    const shareuid = this.get('shareuser');

    // 是否分享过
    const id = await this.model('share').where({userid: uid, jobid: jid}).find();
    if (!think.isEmpty(id)) {
      return this.fail({errmsg: '已经参与该职位分享'});
    }

    // insert into db
    const shareid = await this.model('share').add({
      first: firstuid,
      jobid: jid,
      userid: uid,
      father: shareuid,
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
    const sons = await this.model('share').field(['userid', 'optime']).where({father: userid, jobid: jobid}).select();
    // 昵称、头像
    for (var i = 0; i < sons.length; i++) {
      const uinfo = await this.model('user').field(['wxnickname', 'avatar']).where({id: sons[i].userid}).find();
      sons[i].wxnickname = uinfo.wxnickname;
      sons[i].avatar = uinfo.avatar;
    }

    const father = await this.model('share').field(['father', 'optime', 'first']).where({userid: userid, jobid: jobid}).find();
    // 昵称、头像
    if (father.father !== 0) {
      const finfo = await this.model('user').field(['wxnickname', 'avatar']).where({id: father.father}).find();
      father.wxnickname = finfo.wxnickname;
      father.avatar = finfo.avatar;
    }

    // 招聘结果
    const result = await this.model('contact').where({ jobid: jobid, shareuser: father.first, status: 1 }).find();

    // 有效分享链(平分链)
    var bonus;
    if (!think.isEmpty(result)) {
      // 应聘者头像信息
      const uinfo = await this.model('user').field(['wxnickname', 'avatar']).where({id: result.userid}).find();
      result.wxnickname = uinfo.wxnickname;
      result.avatar = uinfo.avatar;

      // 有效分享链
      bonus = await this.model('bonushistory').where({jobid: jobid, first: father.first, isaverage: 1}).select();

      // 昵称、头像
      for (i = 0; i < bonus.length; i++) {
        const uinfo = await this.model('user').field(['wxnickname', 'avatar']).where({id: bonus[i].userid}).find();
        bonus[i].wxnickname = uinfo.wxnickname;
        bonus[i].avatar = uinfo.avatar;
      }
    }
    return this.success({ds: sons, df: father, result: result, bonus: bonus});
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
};
