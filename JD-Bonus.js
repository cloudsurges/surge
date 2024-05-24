/*************************

Safari浏览器打开登录 https://home.m.jd.com/myJd/newhome.action 点击"我的"页面
或者使用旧版网址 https://bean.m.jd.com/bean/signIndex.action 点击签到并且出现签到日历
如果通知获取Cookie成功, 则可以使用此签到脚本. 注: 请勿在京东APP内获取!!!

开启抓包app后, Safari浏览器登录 https://home.m.jd.com/myJd/newhome.action 点击个人中心页面后, 返回抓包app搜索关键字 info/GetJDUserInfoUnion 复制请求头Cookie字段填入json串数据内即可
*/

var Key = ''; //该参数已废弃; 仅用于下游脚本的兼容, 请使用json串数据 ↓

var DualKey = ''; //该参数已废弃; 仅用于下游脚本的兼容, 请使用json串数据  ↓

var OtherKey = ``; //无限账号Cookie json串数据, 请严格按照json格式填写, 具体格式请看以下样例:

/*以下样例为双账号("cookie"为必须,其他可选), 第一个账号仅包含Cookie, 第二个账号包含Cookie和金融签到Body: 

var OtherKey = `[{
  "cookie": "pt_key=xxx;pt_pin=yyy;"
}, {
  "cookie": "pt_key=yyy;pt_pin=xxx;",
  "jrBody": "reqData=xxx"
}]`

[mitm]
hostname = ms.jr.jd.com, me-api.jd.com, api.m.jd.com

*************************/

var LogDetails = false; //是否开启响应日志, true则开启

var stop = '0'; //自定义延迟签到, 单位毫秒. 默认分批并发无延迟; 该参数接受随机或指定延迟(例: '2000'则表示延迟2秒; '2000-5000'则表示延迟最小2秒,最大5秒内的随机延迟), 如填入延迟则切换顺序签到(耗时较长), Surge用户请注意在SurgeUI界面调整脚本超时; 注: 该参数Node.js或JSbox环境下已配置数据持久化, 留空(var stop = '')即可清除.

var DeleteCookie = false; //是否清除所有Cookie, true则开启.

var boxdis = true; //是否开启自动禁用, false则关闭. 脚本运行崩溃时(如VPN断连), 下次运行时将自动禁用相关崩溃接口(仅部分接口启用), 崩溃时可能会误禁用正常接口. (该选项仅适用于QX,Surge,Loon)

var ReDis = false; //是否移除所有禁用列表, true则开启. 适用于触发自动禁用后, 需要再次启用接口的情况. (该选项仅适用于QX,Surge,Loon)

var out = 0; //接口超时退出, 用于可能发生的网络不稳定, 0则关闭. 如QX日志出现大量"JS Context timeout"后脚本中断时, 建议填写6000

var $nobyda = nobyda();

var merge = {};

var KEY = '';

async function all(cookie, jrBody) {
  KEY = cookie;
  merge = {};
  $nobyda.num++;
  switch (stop) {
    case 0:
      await Promise.all([
        JingDongBean(stop) //京东京豆
      ]);
      break;
    default:
      await JingDongBean(0) //京东京豆
      break;
  }
  await Promise.all([
    TotalBean() //总京豆查询
  ]);
  await notify(); //通知模块
}

function notify() {
  return new Promise(resolve => {
    try {
      var bean = 0;
      var success = 0;
      var fail = 0;
      var err = 0;
      var notify = '';
      for (var i in merge) {
        bean += merge[i].bean ? Number(merge[i].bean) : 0
        success += merge[i].success ? Number(merge[i].success) : 0
        fail += merge[i].fail ? Number(merge[i].fail) : 0
        err += merge[i].error ? Number(merge[i].error) : 0
        notify += merge[i].notify ? "\n" + merge[i].notify : ""
      }
      var beans = merge.TotalBean && merge.TotalBean.Qbear ? `${merge.TotalBean.Qbear}京豆` : ""
      var Tbean = bean ? `${bean.toFixed(0)}京豆` : ""
      var Ts = success ? `成功${success}个${fail||err?`, `:``}` : ``
      var Tf = fail ? `失败${fail}个${err?`, `:``}` : ``
      var Te = err ? `错误${err}个` : ``
      var one = `【签到概览】:  ${Ts+Tf+Te}${Ts||Tf||Te?`\n`:`获取失败\n`}`
      var DName = merge.TotalBean && merge.TotalBean.nickname ? merge.TotalBean.nickname : "获取失败"
      var cnNum = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
      const Name = DualKey || OtherKey.length > 1 ? `【签到号${cnNum[$nobyda.num]||$nobyda.num}】:  ${DName}\n` : ``
      const disables = $nobyda.read("JD_DailyBonusDisables")
      const amount = disables ? disables.split(",").length : 0
      $nobyda.notify("", "", Name + one + notify, {
        'media-url': $nobyda.headUrl || 'https://cdn.jsdelivr.net/gh/NobyDa/mini@master/Color/jd.png'
      });
      $nobyda.headUrl = null;
      if ($nobyda.isJSBox) {
        $nobyda.st = (typeof($nobyda.st) == 'undefined' ? '' : $nobyda.st) + Name + one + "\n"
      }
    } catch (eor) {
      $nobyda.notify("通知模块 " + eor.name + "‼️", JSON.stringify(eor), eor.message)
    } finally {
      resolve()
    }
  });
}

(async function ReadCookie() {
  const EnvInfo = $nobyda.isJSBox ? "JD_Cookie" : "CookieJD";
  const EnvInfo2 = $nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2";
  const EnvInfo3 = $nobyda.isJSBox ? "JD_Cookies" : "CookiesJD";
  const move = CookieMove($nobyda.read(EnvInfo) || Key, $nobyda.read(EnvInfo2) || DualKey, EnvInfo, EnvInfo2, EnvInfo3);
  const cookieSet = $nobyda.read(EnvInfo3);
  if (DeleteCookie) {
    const write = $nobyda.write("", EnvInfo3);
    throw new Error(`Cookie清除${write?`成功`:`失败`}, 请手动关闭脚本内"DeleteCookie"选项`);
  } else if ($nobyda.isRequest) {
    GetCookie()
  } else if (Key || DualKey || (OtherKey || cookieSet || '[]') != '[]') {
    if (($nobyda.isJSBox || $nobyda.isNode) && stop !== '0') $nobyda.write(stop, "JD_DailyBonusDelay");
    out = parseInt($nobyda.read("JD_DailyBonusTimeOut")) || out;
    stop = Wait($nobyda.read("JD_DailyBonusDelay"), true) || Wait(stop, true);
    boxdis = $nobyda.read("JD_Crash_disable") === "false" || $nobyda.isNode || $nobyda.isJSBox ? false : boxdis;
    LogDetails = $nobyda.read("JD_DailyBonusLog") === "true" || LogDetails;
    ReDis = ReDis ? $nobyda.write("", "JD_DailyBonusDisables") : "";
    $nobyda.num = 0;
    if (Key) await all(Key);
    if (DualKey && DualKey !== Key) await all(DualKey);
    if ((OtherKey || cookieSet || '[]') != '[]') {
      try {
        OtherKey = checkFormat([...JSON.parse(OtherKey || '[]'), ...JSON.parse(cookieSet || '[]')]);
        const updateSet = OtherKey.length ? $nobyda.write(JSON.stringify(OtherKey, null, 2), EnvInfo3) : '';
        for (let i = 0; i < OtherKey.length; i++) {
          const ck = OtherKey[i].cookie;
          const jr = OtherKey[i].jrBody;
          if (ck != Key && ck != DualKey) {
            await all(ck, jr)
          }
        }
      } catch (e) {
        throw new Error(`账号Cookie读取失败, 请检查Json格式. \n${e.message}`)
      }
    }
    $nobyda.time();
  } else {
    throw new Error('脚本终止, 未获取Cookie ‼️')
  }
})().catch(e => {
  $nobyda.notify("京东签到", "", e.message || JSON.stringify(e))
}).finally(() => {
  if ($nobyda.isJSBox) $intents.finish($nobyda.st);
  $nobyda.done();
})

function JingDongBean(s) {
  merge.JDBean = {};
  return new Promise(resolve => {
    if (disable("JDBean")) return resolve()
    setTimeout(() => {
      const JDBUrl = {
        url: 'https://api.m.jd.com/client.action?functionId=signBeanAct&appid=ld',
        headers: {
          Cookie: KEY
        },
        body: ''
      };
      $nobyda.post(JDBUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            const cc = JSON.parse(data)
            const Details = LogDetails ? "response:\n" + data : '';
            if (cc.code == 3) {
              console.log("\n" + "京东商城-京豆Cookie失效 " + Details)
              merge.JDBean.notify = "京东商城-京豆: 失败, 原因: Cookie失效‼️"
              merge.JDBean.fail = 1
            } else if (data.match(/跳转至拼图/)) {
              merge.JDBean.notify = "京东商城-京豆: 失败, 需要拼图验证 ⚠️"
              merge.JDBean.fail = 1
            } else if (data.match(/\"status\":\"?1\"?/)) {
              console.log("\n" + "京东商城-京豆签到成功 " + Details)
              if (data.match(/dailyAward/)) {
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: " + cc.data.dailyAward.beanAward.beanCount + "京豆 🐶"
                merge.JDBean.bean = cc.data.dailyAward.beanAward.beanCount
              } else if (data.match(/continuityAward/)) {
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: " + cc.data.continuityAward.beanAward.beanCount + "京豆 🐶"
                merge.JDBean.bean = cc.data.continuityAward.beanAward.beanCount
              } else if (data.match(/新人签到/)) {
                const quantity = data.match(/beanCount\":\"(\d+)\".+今天/)
                merge.JDBean.bean = quantity ? quantity[1] : 0
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: " + (quantity ? quantity[1] : "无") + "京豆 🐶"
              } else {
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: 无京豆 🐶"
              }
              merge.JDBean.success = 1
            } else {
              merge.JDBean.fail = 1
              console.log("\n" + "京东商城-京豆签到失败 " + Details)
              if (data.match(/(已签到|新人签到)/)) {
                merge.JDBean.notify = "京东商城-京豆: 失败, 原因: 已签过 ⚠️"
              } else if (data.match(/人数较多|S101/)) {
                merge.JDBean.notify = "京东商城-京豆: 失败, 签到人数较多 ⚠️"
              } else {
                merge.JDBean.notify = "京东商城-京豆: 失败, 原因: 未知 ⚠️"
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-京豆", "JDBean", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}


function TotalBean() {
  merge.TotalBean = {};
  return new Promise(resolve => {
    if (disable("Qbear")) return resolve()
    $nobyda.get({
      url: 'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion',
      headers: {
        Cookie: KEY
      }
    }, (error, response, data) => {
      try {
        if (error) throw new Error(error);
        const Details = LogDetails ? "response:\n" + data : '';
        const cc = JSON.parse(data)
        if (cc.msg == 'success' && cc.retcode == 0) {
          merge.TotalBean.nickname = cc.data.userInfo.baseInfo.nickname || ""
          merge.TotalBean.Qbear = cc.data.assetInfo.beanNum || 0
          $nobyda.headUrl = cc.data.userInfo.baseInfo.headImageUrl || ""
          console.log(`\n京东-总京豆查询成功 ${Details}`)
        } else {
          const name = decodeURIComponent(KEY.split(/pt_pin=(.+?);/)[1] || '');
          merge.TotalBean.nickname = cc.retcode == 1001 ? `${name} (CK失效‼️)` : "";
          console.log(`\n京东-总京豆查询失败 ${Details}`)
        }
      } catch (eor) {
        $nobyda.AnError("账户京豆-查询", "TotalBean", eor, response, data)
      } finally {
        resolve()
      }
    })
    if (out) setTimeout(resolve, out)
  });
}

function disable(Val, name, way) {
  const read = $nobyda.read("JD_DailyBonusDisables")
  const annal = $nobyda.read("JD_Crash_" + Val)
  if (annal && way == 1 && boxdis) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val)
    if (read) {
      if (read.indexOf(Val) == -1) {
        var Crash = $nobyda.write(`${read},${Val}`, "JD_DailyBonusDisables")
        console.log(`\n${name}-触发自动禁用 ‼️`)
        merge[Val].notify = `${name}: 崩溃, 触发自动禁用 ‼️`
        merge[Val].error = 1
        $nobyda.disable = 1
      }
    } else {
      var Crash = $nobyda.write(Val, "JD_DailyBonusDisables")
      console.log(`\n${name}-触发自动禁用 ‼️`)
      merge[Val].notify = `${name}: 崩溃, 触发自动禁用 ‼️`
      merge[Val].error = 1
      $nobyda.disable = 1
    }
    return true
  } else if (way == 1 && boxdis) {
    var Crash = $nobyda.write(name, "JD_Crash_" + Val)
  } else if (way == 2 && annal) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val)
  }
  if (read && read.indexOf(Val) != -1) {
    return true
  } else {
    return false
  }
}

function Wait(readDelay, ini) {
  if (!readDelay || readDelay === '0') return 0
  if (typeof(readDelay) == 'string') {
    var readDelay = readDelay.replace(/"|＂|'|＇/g, ''); //prevent novice
    if (readDelay.indexOf('-') == -1) return parseInt(readDelay) || 0;
    const raw = readDelay.split("-").map(Number);
    const plan = parseInt(Math.random() * (raw[1] - raw[0] + 1) + raw[0], 10);
    if (ini) console.log(`\n初始化随机延迟: 最小${raw[0]/1000}秒, 最大${raw[1]/1000}秒`);
    // else console.log(`\n预计等待: ${(plan / 1000).toFixed(2)}秒`);
    return ini ? readDelay : plan
  } else if (typeof(readDelay) == 'number') {
    return readDelay > 0 ? readDelay : 0
  } else return 0
}

function CookieMove(oldCk1, oldCk2, oldKey1, oldKey2, newKey) {
  let update;
  const move = (ck, del) => {
    console.log(`京东${del}开始迁移!`);
    update = CookieUpdate(null, ck).total;
    update = $nobyda.write(JSON.stringify(update, null, 2), newKey);
    update = $nobyda.write("", del);
  }
  if (oldCk1) {
    const write = move(oldCk1, oldKey1);
  }
  if (oldCk2) {
    const write = move(oldCk2, oldKey2);
  }
}

function checkFormat(value) { //check format and delete duplicates
  let n, k, c = {};
  return value.reduce((t, i) => {
    k = ((i.cookie || '').match(/(pt_key|pt_pin)=.+?;/g) || []).sort();
    if (k.length == 2) {
      if ((n = k[1]) && !c[n]) {
        i.userName = i.userName ? i.userName : decodeURIComponent(n.split(/pt_pin=(.+?);/)[1]);
        i.cookie = k.join('')
        if (i.jrBody && !i.jrBody.includes('reqData=')) {
          console.log(`异常钢镚Body已过滤: ${i.jrBody}`)
          delete i.jrBody;
        }
        c[n] = t.push(i);
      }
    } else {
      console.log(`异常京东Cookie已过滤: ${i.cookie}`)
    }
    return t;
  }, [])
}

function CookieUpdate(oldValue, newValue, path = 'cookie') {
  let item, type, name = (oldValue || newValue || '').split(/pt_pin=(.+?);/)[1];
  let total = $nobyda.read('CookiesJD');
  try {
    total = checkFormat(JSON.parse(total || '[]'));
  } catch (e) {
    $nobyda.notify("京东签到", "", "Cookie JSON格式不正确, 即将清空\n可前往日志查看该数据内容!");
    console.log(`京东签到Cookie JSON格式异常: ${e.message||e}\n旧数据内容: ${total}`);
    total = [];
  }
  for (let i = 0; i < total.length; i++) {
    if (total[i].cookie && new RegExp(`pt_pin=${name};`).test(total[i].cookie)) {
      item = i;
      break;
    }
  }
  if (newValue && item !== undefined) {
    type = total[item][path] === newValue ? -1 : 2;
    total[item][path] = newValue;
    item = item + 1;
  } else if (newValue && path === 'cookie') {
    total.push({
      cookie: newValue
    });
    type = 1;
    item = total.length;
  }
  return {
    total: checkFormat(total),
    type, //-1: same, 1: add, 2:update
    item,
    name: decodeURIComponent(name)
  };
}

function GetCookie() {
  const req = $request;
  if (req.method != 'OPTIONS' && req.headers) {
    const CV = (req.headers['Cookie'] || req.headers['cookie'] || '');
    const ckItems = CV.match(/(pt_key|pt_pin)=.+?;/g);
    if (/^https:\/\/(me-|)api(\.m|)\.jd\.com\/(client\.|user_new)/.test(req.url)) {
      if (ckItems && ckItems.length == 2) {
        const value = CookieUpdate(null, ckItems.join(''))
        if (value.type !== -1) {
          const write = $nobyda.write(JSON.stringify(value.total, null, 2), "CookiesJD")
          $nobyda.notify(`用户名: ${value.name}`, ``, `${value.type==2?`更新`:`写入`}京东 [账号${value.item}] Cookie${write?`成功 🎉`:`失败 ‼️`}`)
        } else {
          console.log(`\n用户名: ${value.name}\n与历史京东 [账号${value.item}] Cookie相同, 跳过写入 ⚠️`)
        }
      } else {
        throw new Error("写入Cookie失败, 关键值缺失\n可能原因: 非网页获取 ‼️");
      }
    } else if (/^https:\/\/ms\.jr\.jd\.com\/gw\/generic\/hy\/h5\/m\/appSign\?/.test(req.url) && req.body) {
      const value = CookieUpdate(CV, req.body, 'jrBody');
      if (value.type) {
        const write = $nobyda.write(JSON.stringify(value.total, null, 2), "CookiesJD")
        $nobyda.notify(`用户名: ${value.name}`, ``, `获取京东 [账号${value.item}] 钢镚Body${write?`成功 🎉`:`失败 ‼️`}`)
      } else {
        throw new Error("写入钢镚Body失败\n未获取该账号Cookie或关键值缺失‼️");
      }
    } else if (req.url === 'http://www.apple.com/') {
      throw new Error("类型错误, 手动运行请选择上下文环境为Cron ⚠️");
    }
  } else if (!req.headers) {
    throw new Error("写入Cookie失败, 请检查匹配URL或配置内脚本类型 ⚠️");
  }
}

// Modified from yichahucha
function nobyda() {
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const NodeSet = 'CookieSet.json'
  const node = (() => {
    if (isNode) {
      const request = require('request');
      const fs = require("fs");
      const path = require("path");
      return ({
        request,
        fs,
        path
      })
    } else {
      return (null)
    }
  })()
  const notify = (title, subtitle, message, rawopts) => {
    const Opts = (rawopts) => { //Modified from https://github.com/chavyleung/scripts/blob/master/Env.js
      if (!rawopts) return rawopts
      if (typeof rawopts === 'string') {
        if (isLoon) return rawopts
        else if (isQuanX) return {
          'open-url': rawopts
        }
        else if (isSurge) return {
          url: rawopts
        }
        else return undefined
      } else if (typeof rawopts === 'object') {
        if (isLoon) {
          let openUrl = rawopts.openUrl || rawopts.url || rawopts['open-url']
          let mediaUrl = rawopts.mediaUrl || rawopts['media-url']
          return {
            openUrl,
            mediaUrl
          }
        } else if (isQuanX) {
          let openUrl = rawopts['open-url'] || rawopts.url || rawopts.openUrl
          let mediaUrl = rawopts['media-url'] || rawopts.mediaUrl
          return {
            'open-url': openUrl,
            'media-url': mediaUrl
          }
        } else if (isSurge) {
          let openUrl = rawopts.url || rawopts.openUrl || rawopts['open-url']
          return {
            url: openUrl
          }
        }
      } else {
        return undefined
      }
    }
    console.log(`${title}\n${subtitle}\n${message}`)
    if (isQuanX) $notify(title, subtitle, message, Opts(rawopts))
    if (isSurge) $notification.post(title, subtitle, message, Opts(rawopts))
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet)))
          node.fs.writeFileSync(node.path.resolve(__dirname, NodeSet), JSON.stringify({}));
        const dataValue = JSON.parse(node.fs.readFileSync(node.path.resolve(__dirname, NodeSet)));
        if (value) dataValue[key] = value;
        if (!value) delete dataValue[key];
        return node.fs.writeFileSync(node.path.resolve(__dirname, NodeSet), JSON.stringify(dataValue));
      } catch (er) {
        return AnError('Node.js持久化写入', null, er);
      }
    }
    if (isJSBox) {
      if (!value) return $file.delete(`shared://${key}.txt`);
      return $file.write({
        data: $data({
          string: value
        }),
        path: `shared://${key}.txt`
      })
    }
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(node.path.resolve(__dirname, NodeSet))) return null;
        const dataValue = JSON.parse(node.fs.readFileSync(node.path.resolve(__dirname, NodeSet)))
        return dataValue[key]
      } catch (er) {
        return AnError('Node.js持久化读取', null, er)
      }
    }
    if (isJSBox) {
      if (!$file.exists(`shared://${key}.txt`)) return null;
      return $file.read(`shared://${key}.txt`).string
    }
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.get(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    if (options.body) options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }
  const AnError = (name, keyname, er, resp, body) => {
    if (typeof(merge) != "undefined" && keyname) {
      if (!merge[keyname].notify) {
        merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`
      } else {
        merge[keyname].notify += `\n${name}: 异常, 已输出日志 ‼️ (2)`
      }
      merge[keyname].error = 1
    }
    return console.log(`\n‼️${name}发生错误\n‼️名称: ${er.name}\n‼️描述: ${er.message}${JSON.stringify(er).match(/\"line\"/)?`\n‼️行列: ${JSON.stringify(er)}`:``}${resp&&resp.status?`\n‼️状态: ${resp.status}`:``}${body?`\n‼️响应: ${resp&&resp.status!=503?body:`Omit.`}`:``}`)
  }
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    AnError,
    isRequest,
    isJSBox,
    isSurge,
    isQuanX,
    isLoon,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    time,
    done
  }
};
