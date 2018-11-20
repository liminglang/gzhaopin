const Base = require('./base.js');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  async addJobAction() {
    const data = this.post();

    // add db
    var ret = await this.model('job').add({
      // id: data.id,
      name: data.name,
      company: data.company,
      location: data.location,
      salary: data.salary,
      jobtype: data.jobtype,
      trequirements: data.trequirements,
      responsibility: data.responsibility,
      bonus: data.bonus,
      count: data.count,
    });
    return this.success({ ret: ret });
  }

  async deleteJobAction() {
    const jobid = this.post('jobid');
    var ret = await this.model('job').where({id: jobid}).delete();
    return this.success({ ret: ret });
  }

  async getContactAction() {

  }

  async setRecruitSuccessAction() {
    // 应聘成功
    const data = this.post();

    // step  1 修改 contact 状态
    const contact = await this.model('contact').where({userid: data.userid, jobid: data.jobid}).find();
    if (think.isEmpty(contact)) {
      return this.fail(401, {errmsg: 'error id'});
    }

    await this.model('contact').where({userid: data.userid, jobid: data.jobid}).update({status: 1});

    // step 2 修改 job 表状态
    await this.model('job').where({id: data.jobid}).update({status: 1});

    // step3 奖金分配
    // 生成有效分享链
    const userlist = await this.model('share').field(['userid', 'father']).where({jobid: data.jobid, first: contact.shareuser}).select();
    var usermap = new Map();
    for (var i in userlist) {
      usermap.set(userlist[i].userid, userlist[i].father);
    }

    var flist = [];
    var father = contact.spreaduser;
    // 说明有有效分享
    if (father !== 0 && !think.isEmpty(usermap)) {
      flist.push(father);
      // 做一下安全措施
      i = 0;
      while (i < userlist.length) {
        father = usermap.get(father);
        if (father === 0) {
          break;
        }
        flist.push(father);
        i++;
      }
      // 根据不同的层数分配奖金
      // 应聘者上一级 奖金
      // 应聘者上二级 奖金
      // 其余分享着 平分
      var avrbonus = 0;
      const avrusercount = (flist.length > 2) ? (flist.length - 2) : 0;
      if (avrusercount !== 0) {
        // 精确到分, 放大100倍
        avrbonus = ((2000 - 1200 - 400) * 100) / avrusercount;
      }

      // 倒数1、2层分红
      var fshare = 0;
      var sshare = 0;
      if (flist.length === 1) {
        fshare = 200000;
      } else if (flist.length === 2) {
        fshare = 160000;
        sshare = 40000;
      } else {
        fshare = 120000;
        sshare = 40000;
      }

      if (flist.length >= 1) {
        await this.model('bonushistory').add({
          userid: flist[0],
          jobid: data.jobid,
          first: contact.shareuser,
          money: fshare,
          addtime: parseInt((new Date().getTime() / 1000))
        });
      }

      if (flist.length >= 2) {
        await this.model('bonushistory').add({
          userid: flist[1],
          jobid: data.jobid,
          first: contact.shareuser,
          money: sshare,
          addtime: parseInt((new Date().getTime() / 1000))
        });
      }

      if (flist.length > 2) {
        for (i = 2; i < flist.length; i++) {
          await this.model('bonushistory').add({
            userid: flist[i],
            jobid: data.jobid,
            first: contact.shareuser,
            money: avrbonus,
            isaverage: 1,
            addtime: parseInt((new Date().getTime() / 1000))
          });
        }
      }
    }

    return this.success();
  }
};
