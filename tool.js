'use strict';
const htmlHead = '<html><body>';
const htmlTail = '</body></html>';

exports.responseStr = function(status, content="", table = false){
    if(table)
        return htmlHead + '<head><META HTTP-EQUIV="Content-Type" Content="text-html;charset=utf-8"></head>' + 
        "<table border=1 id='result'>" + content + "</table>" + htmlTail;
    else
        return htmlHead + "<div id='result' style='display:none'>" + status.toString() +"</div>" + content + htmlTail;
}

exports.IsDate = function(str){
	const month = [31,28,31,30,31,30,31,31,30,31,30,31]

    let reg = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (!reg.test(str))
        return false;

    var arr = reg.exec(str);
    if(parseInt(RegExp.$2)>12||parseInt(RegExp.$2)<0)
        return false;
    
    //判断闰年 2月有29天
    if(parseInt(RegExp.$2)==2&&((parseInt(RegExp.$1)%4==0&&parseInt(RegExp.$1)%100!=0)||parseInt(RegExp.$1)%400==0)){
        if(parseInt(RegExp.$3)>29)
            return false;
    }
    if(parseInt(RegExp.$3)>month[parseInt(RegExp.$2)-1]||parseInt(RegExp.$3)<0)
        return false;
    return true;
}