const dns_module_home = 'AdGuard Home';
const dns_module_out = 'AdGuard Home DoH';
const home = $network.wifi.ssid === 'SSID1' || $network.wifi.ssid === 'SSID2';
 
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
  if (home && (!module_status[0] || module_status[1])) {
    // 在家，用本地 DNS
    $notification.post('使用 AdGuard Home 本地 DNS', '', '')
    switchModule(dns_module_home, dns_module_out);
  } else if (!home && (module_status[0] || !module_status[1])) {
    // 不在家，使用 DoH
    $notification.post('使用 AdGuard Home DoH', '', '')
    switchModule(dns_module_out, dns_module_home);
  } else {
    // 重複觸發 => 結束
    // $notification.post('重複觸發','','')
    $done();
  }
})
