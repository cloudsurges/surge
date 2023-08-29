const Ipv6_Cancel = 'Ipv6-Cancel';
const Ipv6_Enable = 'Ipv6-Enable';
const specific_wifi = $network.wifi.ssid === 'jawave-5G' || $network.wifi.ssid === 'jawave02-5G';

function getModuleStatus() {
  return new Promise((resolve) => {
    $httpAPI('GET', 'v1/modules', null, (data) => {
      let enabled = data.enabled;
      resolve([enabled.includes(Ipv6_Cancel), enabled.includes(Ipv6_Enable)]);
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
    // 特定wifi下不使用ipv6
    $notification.post('关闭IPv6', '', '')
    switchModule(Ipv6_Cancel, Ipv6_Enable);
  } else if (!specific_wifi) {
    // 一般情况下使用ipv6
    $notification.post('启用IPv6', '', '')
    switchModule(Ipv6_Enable, Ipv6_Cancel);
  } else if (!specific_wifi && (module_status[0] || !module_status[1])) {
    // 一般情况下使用ipv6
    $notification.post('启用IPv6', '', '')
    switchModule(Ipv6_Enable, Ipv6_Cancel);
  } else {
    // 重複觸發 => 結束
    // $notification.post('重複觸發','','')
    $done();
  }
})
