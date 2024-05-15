const RequestURL = {
  url: "https://api.m.jd.com/client.action?functionId=signBeanAct&appid=ld",
  # headers: {
  #  Cookie: KEY
  # },
  # body: 'functionId=signBeanAct&appid=ld'
}
$httpClient.post(RequestURL, (error, response, data) => {
  console.log(`访问状态：${response.status}`)
  $done()
})
