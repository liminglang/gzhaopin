const fs = require('fs');
const objectAssign = require('object-assign');

function changeType(s) {
  const ret = {};
  for (const i in s) {
    if (typeof s[i] === 'object') {
      ret['o_' + i] = changeType(s[i]);
    } else {
      if (typeof (s[i]) === 'number') {
        let n = Number(s[i]);
        if (n % 1 === 0) { // 所有的数字都转化法float
          n += 0.00001;
        }
        ret['n_' + i] = n;
      } else {
        ret[i] = s[i];
      }
    }
  }
  return ret;
}

function writeJsonLog(event, uid, obj) {
  if (typeof (obj) !== 'object') {
    return;
  }
  for (const key in obj) {
    if (!isNaN(Number(key))) {
      delete obj[key];
    }
  }

  const logObj = objectAssign({
    event: '' + event,
    uid: parseInt(uid),
    time: new Date().getTime()
  }, changeType(obj));
  let str = JSON.stringify(logObj);
  str += '\r\n';

  const date = new Date();
  let m = '' + (date.getMonth() + 1);
  let d = '' + date.getDate();
  if (m.length < 2) {
    m = '0' + m;
  }
  if (d.length < 2) {
    d = '0' + d;
  }
  const fileName = think.ROOT_PATH + '/logs/json' + date.getFullYear() + '-' + m + '-' + d + '.log';
  fs.appendFile(fileName, str, 'utf8');
}

module.exports.writeJsonLog = writeJsonLog;
