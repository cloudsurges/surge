const request = {
  url: "https://api.m.jd.com/client.action?functionId=signBeanAct&appid=ld"
}
$httpClient.post(request, (error, response, data) => {
  console.log("发送签到请求")
  $done()
})
