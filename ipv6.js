const dns_module_home = 'Ipv6-Cancel';
const dns_module_out = 'Ipv6-Enable';
const specific_wifi = $network.wifi.ssid === 'SSID1' || $network.wifi.ssid === 'SSID2';

function getModuleStatus() {
  return new Promise((resolve) => {
    $httpAPI('GET', 'v1/modules', null, (data) => {
      let enabled = data.enabled;
      resolve([enabled.includes(dns_module_home), enabled.includes(dns_module_out)]);
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
    $notification.post('不启用IPv6', '', '')
    switchModule(dns_module_home, dns_module_out);
  } else if (!specific_wifi && (module_status[0] || !module_status[1])) {
    // 一般情况下使用ipv6
    $notification.post('启用IPv6', '', '')
    switchModule(dns_module_out, dns_module_home);
  } else {
    // 重複觸發 => 結束
    // $notification.post('重複觸發','','')
    $done();
  }
})
