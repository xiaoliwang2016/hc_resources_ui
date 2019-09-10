/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
	if (arguments.length === 0) {
		return null
	}
	const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
	let date
	if (typeof time === 'object') {
		date = time
	} else {
		if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
			time = parseInt(time)
		}
		if ((typeof time === 'number') && (time.toString().length === 10)) {
			time = time * 1000
		}
		date = new Date(time)
	}
	const formatObj = {
		y: date.getFullYear(),
		m: date.getMonth() + 1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		a: date.getDay()
	}
	const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
		let value = formatObj[key]
		// Note: getDay() returns 0 on Sunday
		if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
		if (result.length > 0 && value < 10) {
			value = '0' + value
		}
		return value || 0
	})
	return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
	if (('' + time).length === 10) {
		time = parseInt(time) * 1000
	} else {
		time = +time
	}
	const d = new Date(time)
	const now = Date.now()

	const diff = (now - d) / 1000

	if (diff < 30) {
		return '刚刚'
	} else if (diff < 3600) {
		// less 1 hour
		return Math.ceil(diff / 60) + '分钟前'
	} else if (diff < 3600 * 24) {
		return Math.ceil(diff / 3600) + '小时前'
	} else if (diff < 3600 * 24 * 2) {
		return '1天前'
	}
	if (option) {
		return parseTime(time, option)
	} else {
		return (
			d.getMonth() +
			1 +
			'月' +
			d.getDate() +
			'日' +
			d.getHours() +
			'时' +
			d.getMinutes() +
			'分'
		)
	}
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
	const search = url.split('?')[1]
	if (!search) {
		return {}
	}
	return JSON.parse(
		'{"' +
		decodeURIComponent(search)
			.replace(/"/g, '\\"')
			.replace(/&/g, '","')
			.replace(/=/g, '":"')
			.replace(/\+/g, ' ') +
		'"}'
	)
}

export function uniqueArr(arr) {
	var hash = [];
	for (var i = 0; i < arr.length; i++) {
		if (hash.indexOf(arr[i]) == -1) {
			hash.push(arr[i]);
		}
	}
	return hash;
}

export function getYourIP(){
	return new Promise((resolve, reject) => {
		var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
		if (RTCPeerConnection) (function () {
			var rtc = new RTCPeerConnection({iceServers:[]});
			if (1 || window.mozRTCPeerConnection) {     
				rtc.createDataChannel('', {reliable:false});
			};
			
			rtc.onicecandidate = function (evt) {
				if (evt.candidate) grepSDP("a="+evt.candidate.candidate);
			};
			rtc.createOffer(function (offerDesc) {
				grepSDP(offerDesc.sdp);
				rtc.setLocalDescription(offerDesc);
			}, function (e) { console.warn("offer failed", e); });
			
			
			var addrs = Object.create(null);
			addrs["0.0.0.0"] = false;
			function updateDisplay(newAddr) {
				if (newAddr in addrs) return;
				else addrs[newAddr] = true;
				var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
				for(var i = 0; i < displayAddrs.length; i++){
					if(displayAddrs[i].length > 16){
						displayAddrs.splice(i, 1);
						i--;
					}
				}
				resolve(displayAddrs[0])
				// document.getElementById('list').textContent = displayAddrs[0];
			}
			
			function grepSDP(sdp) {
				var hosts = [];
				sdp.split('\r\n').forEach(function (line, index, arr) { 
				   if (~line.indexOf("a=candidate")) {    
						var parts = line.split(' '),       
							addr = parts[4],
							type = parts[7];
						if (type === 'host') updateDisplay(addr);
					} else if (~line.indexOf("c=")) {       
						var parts = line.split(' '),
							addr = parts[2];
						updateDisplay(addr);
					}
				});
			}
		})();
		else{
			console.log('请使用主流浏览器：chrome,firefox,opera,safari');
			reject()
		}
	})
}

export const foowwLocalStorage = {
    set: function (key, value, ttl_ms) {
        var data = { value: value, expirse: new Date(ttl_ms).getTime() };
        localStorage.setItem(key, JSON.stringify(data));
    },
    get: function (key) {
        var data = JSON.parse(localStorage.getItem(key));
        if (data !== null) {
            debugger
            if (data.expirse != null && data.expirse < new Date().getTime()) {
                localStorage.removeItem(key);
            } else {
                return data.value;
            }
        }
        return null;
    }
}

//vuex state持久化
export const storeMaker = (state) => {
    // 初始化
    Object.keys(state).map((key) => {
        // 判断类型获取本地存储数据
        if (typeof state[key] === 'object') {
            if (sessionStorage.getItem(key) && JSON.parse(sessionStorage.getItem(key))) {
                state[key] = JSON.parse(sessionStorage.getItem(key))
            }
        } else if (typeof state[key] === 'number') {
            if (sessionStorage.getItem(key) && parseInt(sessionStorage.getItem(key))) {
                state[key] = parseInt(sessionStorage.getItem(key))
            }
        } else {
            if (sessionStorage.getItem(key)) {
                state[key] = sessionStorage.getItem(key)
            }
        }
    })

    // 重写set处理
    return new Proxy(state, {
        set: function(target, key, value) {
            let temp = value
            if (typeof temp === 'object') {
                temp = JSON.stringify(temp)
            }

            sessionStorage.setItem(key, temp)
            return Reflect.set(target, key, value)
        }
    })
}