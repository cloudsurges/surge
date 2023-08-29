const name = "Ipv6-Cancel";
//const Ipv6_Cancel = 'Ipv6-Cancel';
//const Ipv6_Enable = 'Ipv6-Enable';
let home = ($network.wifi.ssid === 'jawave-5G') || ($network.wifi.ssid === 'jawave02-5G');

const getModuleStatus = new Promise((resolve) => {
  $httpAPI("GET", "v1/modules", null, (data) =>
	  resolve(data.enabled.includes(name))
  );
});

getModuleStatus.then((enabled) => {
  if (home && enabled) {
    //在家，卻啟用模組 => 關閉
	$notification.post(`關閉IPv6 模組`, "" ,"");
	enableModule(false);
  } else if (!home && !enabled) {
	//不在家，沒啟用模組 => 啟用
	$notification.post(`啟用IPv6模組`, "" ,"");
	enableModule(true);
  } else {
	//其他情況 => 重複觸發 => 結束腳本
	//$notification.post("重複觸發", "", "");
	$done();
  }
});

function enableModule(status) {
  $httpAPI("POST", "v1/modules", { [name]: status }, () => $done());
}
