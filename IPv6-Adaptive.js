const IPv6_Cancel = 'IPv6-Cancel';
const IPv6_Enable = 'IPv6-Enable';
//const specific_wifi = $network.wifi.ssid === '' || $network.wifi.ssid === '';
//const wifi = typeof $network.wifi.ssid != 'undefined';
const ssid = $network.wifi.ssid;
const { wifi, v4 } = $network;
const IPv4_address = v4.primaryAddress;
let IPv6_address = (typeof $network.v6 != 'undefined') && (typeof $network.v6.primaryAddress != 'undefined') ? $network.v6.primaryAddress : '';

if (IPv4_address) {
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
            if (!IPv6_address && (!module_status[0] || module_status[1])) {
            // 在不支持IPv6的网络下关闭IPv6
                  if ($network.wifi.ssid != 'null'){
                  console.log('成功连接SSID:' + $network.wifi.ssid + `的WIFI! \t`)
              }
            console.log(`IP: ${IPv4_address} \t`)
            console.log('关闭IPv6')
            switchModule(IPv6_Cancel, IPv6_Enable);
       } else if (IPv6_address && (module_status[0] || !module_status[1])) {
            // 在支持IPv6的网络下开启IPv6
                  if ($network.wifi.ssid != 'null'){
                  console.log('成功连接SSID:' + $network.wifi.ssid + `的WIFI! \t`)
              }
            console.log(`IP: ${IPv4_address} \t`)
            console.log('开启IPv6')
            switchModule(IPv6_Enable, IPv6_Cancel);
       } else {
            // 重复触发 => 结束
            // $notification.post('特定WIFI环境下关闭IPv6的模块条件重复触发！','','')
            //console.log($network)
            //console.log(`${network.cellular-data.radio}
            //console.log('\n' + `Cellular·Radio: ` + $network.cellular + `\n` +`WIFI·SSID: ` +  $network.wifi.ssid + `\n` + 'IPv4: ' + $network.v4.primaryAddress + `\n` + 'IPv6: ' + $network.v6.primaryAddress + `\n` + 'DNS: ' +$network.dns)
            console.log(`\n` +`WIFI·SSID: ` +  $network.wifi.ssid + `\n` + 'IPv4: ' + $network.v4.primaryAddress + `\n` + 'IPv6: ' + $network.v6.primaryAddress)
            $done();
       }
 })
}
else{
      console.log('无网络连接!')
      $done();
}
