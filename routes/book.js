const responseStr = require("../tool").responseStr
const db=require("../coSqlite3");
const isdate = require('../tool').IsDate


exports.addBook=function*(req,res){
    let body = req.body;
    let bID = body.bID;
    let bName = body.bName;
    let bPub = body.bPub;
    let bDate = body.bDate;
    let bAuthor = body.bAuthor;
    let bMem = body.bMem;
    let bCnt = body.bCnt;

    // 判断格式要求
    if(bID.length>30||bID.length==0)
        return responseStr(2, "提交的参数有误：你没填书号或者书号过长");
    else if(bName.length>30||bName.length==0)
        return responseStr(2, "提交的参数有误：你没填书名或者书名过长");
    else if(bPub.length>30||bPub.length==0)
        return responseStr(2, "提交的参数有误：你没填出版社或者出版社过长");
    else if(!isdate(bDate)||bDate.length==0)
        return responseStr(2, "提交的参数有误：你没填日期或者日期格式有误");
    else if(bAuthor.length>20||bAuthor.length==0)
        return responseStr(2, "提交的参数有误：你没填作者或者作者过长");
    else if(bMem.length>30||bMem.length==0)
        return responseStr(2, "提交的参数有误：你没填摘要或者摘要过长");
    else if(bCnt.length==0||!(/(^[1-9]\d*$)/.test(bCnt)))
        return responseStr(2, "提交的参数有误：你没数量或者没填阳间数字");

    let view = yield db.execSQL("SELECT bID FROM Book WHERE bID=?",[bID]);
    let num=0;
    for(let row of view)
        num+=1;
    if(num>0)
        return responseStr(1, "该书已经存在");
    else{
        yield db.execSQL("INSERT INTO Book (bID,bName,bPub,bDate,bAuthor,bMem,bCnt,libCnt) values(?,?,?,?,?,?,?,?)",[bID,bName,bPub,bDate,bAuthor,bMem,bCnt,bCnt]);
        return responseStr(0, "成功");
    }
}
exports.addNum=function*(req,res){
    let body = req.body;
    let bID = body.bID;
    let bCnt = body.bCnt;
    if(bID.length>30||bID.length==0)
        return responseStr(2, "提交的参数有误：你没填书号或者书号过长");
    if(bCnt.length==0||!(/(^[1-9]\d*$)/.test(bCnt)))
        return responseStr(2, "提交的参数有误：你没数量或者没填阳间数字");

    let view = yield db.execSQL("SELECT * FROM Book WHERE bID=?",[bID]);
    let num=0;
    for(let row in view)
        num+=1;
    
    if(num==0)
        return responseStr(1, "该书不存在");
    else{
        yield db.execSQL("UPDATE Book SET bCnt = ? ,libCnt = ? WHERE bID = ?",[parseInt(bCnt)+view[0].bCnt,parseInt(bCnt)+view[0].libCnt,bID]);
        return responseStr(0, "成功");
    }
}

exports.reduceNum=function*(req,res){
    let body = req.body;
    let bID = body.bID;
    let bCnt = body.bCnt;

    if(bID.length>30||bID.length==0)
        return responseStr(3, "提交的参数有误：你没填书号或者书号过长");
    if(bCnt.length==0||!(/(^[1-9]\d*$)/.test(bCnt)))
        return responseStr(3, "提交的参数有误：你没数量或者没填阳间数字");
 
    let view = yield db.execSQL("SELECT * FROM Book WHERE bID=?",[bID]);
    let num=0;
    for(let row of view)
        num+=1;
    if(num==0)
        return responseStr(1, "该数不存在");
    else{
        if(parseInt(bCnt)>view[0].bCnt){
            return responseStr(2, "减少的数量大于该书目前在库数量");
        }else if(parseInt(bCnt)==view[0].bCnt){
            if(view[0].libCnt!=view[0].bCnt)
                return responseStr(2, "该图书有未归还部分，不允许删除");
            yield db.execSQL("delete FROM Book WHERE bID = ?",[bID]);
            return responseStr(0, "成功");
        }else {
            if(view[0].libCnt<bCnt)
                return responseStr(3, "该图书馆内现存不够减少量，不允许削减")
            yield db.execSQL("UPDATE Book SET bCnt = ?,libCnt = ? WHERE bID = ?",[view[0].bCnt-parseInt(bCnt),view[0].libCnt-parseInt(bCnt),bID]);
            return responseStr(0, "成功");
        }     
    }
}

exports.changeBook=function*(req,res){
    let body = req.body;
    let bID = body.bID;
    let bName = body.bName;
    let bPub = body.bPub;
    let bDate = body.bDate;
    let bAuthor = body.bAuthor;
    let bMem = body.bMem;


    if(bID.length>30||bID.length==0)
        return responseStr(2, "提交的参数有误：你没填书号或者书号过长");
    else if(bName.length>30||bName.length==0)
        return responseStr(2, "提交的参数有误：你没填书名或者书名过长");
    else if(bPub.length>30||bPub.length==0)
        return responseStr(2, "提交的参数有误：你没填出版社或者出版社过长");
    else if(!isdate(bDate)||bDate.length==0)
        return responseStr(2, "提交的参数有误：你没填日期或者日期格式有误");
    else if(bAuthor.length>20||bAuthor.length==0)
        return responseStr(2, "提交的参数有误：你没填作者或者作者过长");
    else if(bMem.length>30||bMem.length==0)
        return responseStr(2, "提交的参数有误：你没填摘要或者摘要过长");

    let view = yield db.execSQL("SELECT * FROM Book WHERE bID=?",[bID]);
    let num=0;
    for(let row of view)
        num+=1;
    
    if(num==0)
        return responseStr(1, "该书不存在");
    else{
        yield db.execSQL("UPDATE Book SET bName = ?,bPub = ?,bDate = ?,bAuthor = ?,bMem = ? WHERE bID = ?",[bName ,bPub ,bDate ,bAuthor ,bMem, bID])
        return responseStr(0, "成功");
    }
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

    if(bDate0!=''&&!isdate(bDate0))
        return responseStr(0, "提交的参数有误：日期格式有误", true);
    if(bDate1!=''&&!isdate(bDate1))
        return responseStr(0, "提交的参数有误：日期格式有误", true);
    
    result = ""
    if(bDate0=='') bDate0='0000-01-01';
    if(bDate1=='') bDate1='9999-12-31';
    let view = yield db.execSQL("SELECT * FROM Book WHERE bID like ? and bName like ? and bPub like ? and bDate >= ? and bDate <= ? and bAuthor like ? and bMem like ?",[bID,bName,bPub,bDate0,bDate1,bAuthor,bMem]);
    for(let row of view)
        result+=
        '<tr><td>'+row.bID+'</td><td>'+row.bName+'</td><td>'+row.bCnt+'</td><td>'+
        row.libCnt+'</td><td>'+row.bPub+'</td><td>'+row.bDate+'</td><td>'+row.bAuthor+
        '</td><td>'+row.bMem+'</td></tr>';

    return responseStr(0, result, true);
}