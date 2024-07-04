// 初始化
var Init = function() {
    // 倒计时刷新
    function startInterval() {
        setInterval(function () {
          var ttls = Math.floor(Date.now() / 1000 % 30);
          $('ttl').innerHTML = 30 - ttls;
          if (ttls === 0) {
            refreshCode();
          }
        }, 1000);
    }
    // 将时间同步到整秒, 再开始轮询
    function sync2NextSecond() {
        var ms2NextSecond = 1000 - (Date.now() % 1000);
        setTimeout(startInterval, ms2NextSecond);
    }
    
    function refreshCode() {
        var secret = $('skey').value;
        secret = secret.substr(0, secret.length - secret.length % 8);
        $('code').innerHTML = generate(secret);
    }
    
    function eye_open(){
        $('eye_open').style.display="inline";
        $('eye_close').style.display="none";
        $('skey').type = 'text';
        setTimeout(function(){eye_open();}, 5000);
    }
    
    function eye_close(){
        $('eye_close').style.display="inline";
        $('eye_open').style.display="none";
        $('skey').type = 'password';
    }
    // 刷新按钮
    $('btn1').addEventListener('click', function(){
        refreshCode();
    });
    // 显示密码
    $('eye_open').addEventListener('click', eye_close);
    // 隐藏密码
    $('eye_close').addEventListener('click', eye_open);
    
    sync2NextSecond();
    refreshCode();
}

/* make totp code
*  secret: 密钥
*  epoch : 时间，如无则调用当前时间
*/
var generate = function(secret, epoch) {
    var key = base32tohex(secret);
    
    // 若 epoch 为空则设为当前时间
    if(typeof epoch === 'undefined') {
        epoch = Math.round(new Date().getTime() / 1000.0);
    }
    var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');

    // HMAC hash
    var hmacObj = new jsSHA("SHA-1", "HEX", {
          hmacKey: { value: key, format: "HEX" },
        });
    hmacObj.update(time);
    var hmac = hmacObj.getHMAC("HEX");

    var offset = hex2dec(hmac.substr(-1));
    var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')).toString();
    return otp.substr(-6);
};

var base32tohex = function(str) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";

    for (var i = 0; i < str.length; i++) {
        var val = base32chars.indexOf(str.charAt(i).toUpperCase());
        bits += leftpad(val.toString(2), 5, '0');
    }

    for (i = 0; i + 4 <= bits.length; i += 4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16);
    }

    return hex;
};

var leftpad = function(str, len, pad) {
    if (len + 1 >= str.length) {
        str = new Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
};

var dec2hex = function(s) {
    return (s < 15.5 ? '0' : '') + Math.round(s).toString(16);
};

var hex2dec = function(s) {
    return parseInt(s, 16);
};

var $ = function(id){
    return document.getElementById(id);
}
