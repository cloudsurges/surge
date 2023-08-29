const Ipv6_Cancel = "Ipv6-Cancel";
let specific_wifi = ($network.wifi.ssid === 'jawave-5G') || ($network.wifi.ssid === 'jawave02-5G');

const getModuleStatus = new Promise((resolve) => {
  $httpAPI("GET", "v1/modules", null, (data) =>
	  resolve(data.enabled.includes(Ipv6_Cancel))
  );
});

getModuleStatus.then((enabled) => {
  if (specific_wifi && enabled) {
    //在家，卻啟用模組 => 關閉
	$notification.post('關閉IPv6', "" ,"");
	enableModule(false);
  } else if (!specific_wifi && !enabled) {
	//不在家，沒啟用模組 => 啟用
	$notification.post('啟用IPv6', "" ,"");
	enableModule(true);
  } else {
	//其他情況 => 重複觸發 => 結束腳本
	//$notification.post("重複觸發", "", "");
	$done();
  }
});

function enableModule(status) {
  $httpAPI("POST", "v1/modules", { [Ipv6_Cancel]: status }, () => $done());
}
