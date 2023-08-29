const IPv6_Cancel = 'IPv6-Cancel';
const IPv6_Enable = 'IPv6-Enable';
const specific_wifi = $network.wifi.ssid === 'jawave-5G' || $network.wifi.ssid === 'jawave02-5G';
 
function getModuleStatus() {
  return new Promise((resolve) => {
    $httpAPI('GET', 'v1/modules', null, (data) => {
      let enabled = data.enabled;
      resolve([enabled.includes(IPv6_Cancel), enabled.includes(IPv6_Enable)]);
    });
  });
}
 
const switchModule = (enable_module_name, disable_module_name) => {
  $httpAPI('POST', 'v1/modules', {
    [enable_module_name]: true,
    [disable_module_name]: false,
  }, () => $done());
}
 
getModuleStatus().then((module_status) => {
  if (specific_wifi && (!module_status[0] || module_status[1])) {
    // 在特定网络下关闭IPv6
    $notification.post('关闭IPv6', '', '')
    switchModule(IPv6_Cancel, IPv6_Enable);
  } else if (!specific_wifi && (module_status[0] || !module_status[1])) {
    // 默认的情况下开启IPv6
    $notification.post('开启IPv6', '', '')
    switchModule(IPv6_Enable, IPv6_Cancel);
  } else {
    // 重复触发 => 结束
    // $notification.post('特定WIFI环境下关闭IPv6的模块条件重复触发！','','')
    $done();
  }
})
