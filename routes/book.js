const responseStr = require("../tool").responseStr
const db=require("../coSqlite3");
const IsDate = require('../tool').IsDate


exports.addBook=function*(req,res){
    let body = req.body;

    // 判断格式要求
    if(body.bID.length>30||body.bID.length==0)
        return responseStr(2, "提交的参数有误：你没填书号或者书号过长");
    if(body.bName.length>30||body.bName.length==0)
        return responseStr(2, "提交的参数有误：你没填书名或者书名过长");
    if(body.bPub.length>30||body.bPub.length==0)
        return responseStr(2, "提交的参数有误：你没填出版社或者出版社过长");
    if(body.bDate.length==0||!IsDate(body.bDate))
        return responseStr(2, "提交的参数有误：你没填日期或者日期格式有误");
    if(body.bAuthor.length>20||body.bAuthor.length==0)
        return responseStr(2, "提交的参数有误：你没填作者或者作者过长");
    if(body.bMem.length>30||body.bMem.length==0)
        return responseStr(2, "提交的参数有误：你没填摘要或者摘要过长");
    if(body.bCnt.length==0||!(/(^[1-9]\d*$)/.test(body.bCnt)))
        return responseStr(2, "提交的参数有误：你没数量或者没填阳间数字");

    let table = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);

    if(table.length>0)
        return responseStr(1, "该书已经存在");
    yield db.execSQL("INSERT INTO Books (bID,bName,bPub,bDate,bAuthor,bMem,bCnt,storedCnt) values(?,?,?,?,?,?,?,?)",[body.bID,body.bName,body.bPub,body.bDate,body.bAuthor,body.bMem,body.bCnt,body.bCnt]);
    return responseStr(0, "成功");
}
exports.addNum=function*(req,res){
    let body = req.body;
    if(body.bID.length>30||body.bID.length==0) return responseStr(2, "提交的参数有误：你没填书号或者书号过长");
    if(body.bCnt.length==0||!(/(^[1-9]\d*$)/.test(body.bCnt))) return responseStr(2, "提交的参数有误：你没数量或者没填阳间数字");

    let table = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);
    if(table.length==0)
        return responseStr(1, "该书不存在");

    let newbCnt = parseInt(body.bCnt)+table[0].bCnt;
    let newstoredNum = parseInt(body.bCnt)+table[0].storedCnt
    yield db.execSQL("UPDATE Books SET bCnt = ? ,storedCnt = ? WHERE bID = ?",[newbCnt,newstoredNum,body.bID]);
    return responseStr(0, "成功");
}

exports.reduceBook=function*(req,res){
    let body = req.body;

    if(body.bID.length>30||body.bID.length==0) return responseStr(3, "提交的参数有误：你没填书号或者书号过长");
    if(body.bCnt.length==0||!(/(^[1-9]\d*$)/.test(body.bCnt))) return responseStr(3, "提交的参数有误：你没数量或者没填阳间数字");
 
    let table = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);
    if(table.length==0)
        return responseStr(1, "该书不存在");

    if(parseInt(body.bCnt)>table[0].storedCnt)
        return responseStr(2, "减少的数量大于该书目前在库数量");

    if(parseInt(body.bCnt)==table[0].bCnt){
        if(table[0].storedCnt!=table[0].bCnt)
            return responseStr(3, "提交的参数有误：该图书还有外借，应全部归还");
        yield db.execSQL("DELETE FROM Books WHERE bID = ?",[body.bID]);
        return responseStr(0, "成功");
    } 

    let newbCnt = table[0].bCnt-parseInt(body.bCnt);
    let newstoredNum = table[0].storedCnt-parseInt(body.bCnt)
    yield db.execSQL("UPDATE Books SET bCnt = ?,storedCnt = ? WHERE bID = ?",[newbCnt,newstoredNum,body.bID]);
    return responseStr(0, "成功");    
}

exports.changeBook=function*(req,res){
    let body = req.body;

    if(body.bID.length>30||body.bID.length==0)
        return responseStr(2, "提交的参数有误：你没填书号或者书号过长");
    if(body.bName.length>30||body.bName.length==0)
        return responseStr(2, "提交的参数有误：你没填书名或者书名过长");
    if(body.bPub.length>30||body.bPub.length==0)
        return responseStr(2, "提交的参数有误：你没填出版社或者出版社过长");
    if(!IsDate(body.bDate)||body.bDate.length==0)
        return responseStr(2, "提交的参数有误：你没填日期或者日期格式有误");
    if(body.bAuthor.length>20||body.bAuthor.length==0)
        return responseStr(2, "提交的参数有误：你没填作者或者作者过长");
    if(body.bMem.length>30||body.bMem.length==0)
        return responseStr(2, "提交的参数有误：你没填摘要或者摘要过长");

    let table = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);
    if(table.length==0)
        return responseStr(1, "该书不存在");

    yield db.execSQL("UPDATE Books SET bName = ?,bPub = ?,bDate = ?,bAuthor = ?,bMem = ? WHERE bID = ?",[body.bName, body.bPub, body.bDate, body.bAuthor, body.bMem, body.bID])
    return responseStr(0, "成功");

}

exports.qBook=function*(req,res){
    let body = req.body;
    let bID = '%'+body.bID+'%';
    let bName = '%'+body.bName+'%';
    let bPub = '%'+body.bPub+'%';
    let bDate0 = body.bDate0;
    let bDate1 = body.bDate1;
    let bAuthor = '%'+body.bAuthor+'%';
    let bMem = '%'+body.bMem+'%';

    if(bDate0!=''&&!IsDate(bDate0))
        return responseStr(0, "提交的参数有误：日期格式有误", true);
    if(bDate1!=''&&!IsDate(bDate1))
        return responseStr(0, "提交的参数有误：日期格式有误", true);
    
    result = ""
    if(bDate0=='') bDate0='0000-01-01';
    if(bDate1=='') bDate1='9999-12-31';
    let table = yield db.execSQL("SELECT * FROM Books WHERE bID like ? and bName like ? and bPub like ? and bDate >= ? and bDate <= ? and bAuthor like ? and bMem like ?",[bID,bName,bPub,bDate0,bDate1,bAuthor,bMem]);
    for(let row of table)
        result+=
        '<tr><td>'+row.bID+'</td><td>'+row.bName+'</td><td>'+row.bCnt+'</td><td>'+
        row.storedCnt+'</td><td>'+row.bPub+'</td><td>'+row.bDate+'</td><td>'+row.bAuthor+
        '</td><td>'+row.bMem+'</td></tr>';

    return responseStr(0, result, true);
}