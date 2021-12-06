const responseStr = require("../tool").responseStr
const db=require("../coSqlite3");

exports.addReader=function*(req,res){
    let body = req.body;

    if(body.rID.length>8||body.rID.length==0) return responseStr(2, "提交的参数有误：你没填证号或者证号过长");
    else if(body.rName.length>10||body.rName.length==0) return responseStr(2, "提交的参数有误：你没填姓名或者姓名过长");
    else if(!(body.rSex=='男'||body.rSex=='女')) return responseStr(2, "提交的参数有误：外星人？");
    else if(body.rDept.length>10||body.rDept.length==0) return responseStr(2, "提交的参数有误：你没填系名或者系名过长");
    else if(body.rGrade.length==0||!(/(^[1-9]\d*$)/.test(body.rGrade))) return responseStr(2, "提交的参数有误：你没填年级或者填的不是阳间年级");

    let table = yield db.execSQL("SELECT rID FROM Readers WHERE rID=?",[body.rID]);
    
    if(table.length>0)
        return responseStr(1, "该证号已经存在");

    yield db.execSQL("INSERT INTO Readers (rID,rName,rSex,rDept,rGrade) values(?,?,?,?,?)",[body.rID,body.rName,body.rSex,body.rDept,parseInt(body.rGrade)]);
    return responseStr(0, "成功");
}

exports.delReader=function*(req,res){
    let body = req.body;

    let table = yield db.execSQL("SELECT * FROM Readers WHERE rID=?",[body.rID]);

    if(table.length==0)
        return responseStr(1, "该证号不存在");

    let view1 = yield db.execSQL("SELECT * FROM Infomations WHERE rID=? and returnDate is null  ",[body.rID]);

    if(view1.length>0)
        return responseStr(2, "该读者尚有书籍未归还</body></html>");

    yield db.execSQL("delete FROM Readers WHERE rID = ?",[body.rID]);
    return responseStr(0, "成功");
}

exports.changeReader=function*(req,res){
    let body = req.body;

    if(body.rID.length>8||body.rID.length==0) return responseStr(2, "提交的参数有误：你没填证号或者证号过长");
    else if(body.rName.length>10||body.rName.length==0) return responseStr(2, "提交的参数有误：你没填姓名或者姓名过长");
    else if(!(body.rSex=='男'||body.rSex=='女')) return responseStr(2, "提交的参数有误：外星人？");
    else if(body.rDept.length>10||body.rDept.length==0) return responseStr(2, "提交的参数有误：你没填系名或者系名过长");
    else if(body.rGrade.length==0||!(/(^[1-9]\d*$)/.test(body.rGrade))) return responseStr(2, "提交的参数有误：你没填年级或者填的不是阳间年级");
    
    let table = yield db.execSQL("SELECT * FROM Readers WHERE rID=?",[body.rID]);

    if(table.length==0)
        return responseStr(1, "该证号不存在");

    yield db.execSQL("UPDATE Readers SET rName = ?,rSex = ?,rDept = ?,rGrade = ? WHERE rID = ?",[body.rName,body.rSex,body.rDept,parseInt(body.rGrade),body.rID])
    return responseStr(0, "成功");
    
}

exports.qReader=function*(req,res){
    let body = req.body;
    let rID = '%'+body.rID+'%';
    let rName = '%'+body.rName+'%';
    let rSex = body.rSex;
    let rGrade0 = body.rGrade0;
    let rGrade1 = body.rGrade1;
    let rDept = '%'+body.rDept+'%';

    // 一个字符
    if(rSex =='') rSex ='_';
    if(rGrade0=='') rGrade0=0;
    if(rGrade1=='') rGrade1=0x3f3f3f3f;

    let result =""; 
    let table = yield db.execSQL("SELECT * FROM Readers WHERE rID like ? and rName like ? and rSex like ? and rDept like ? and rGrade >= ? and rGrade <= ? ",[ rID ,rName,rSex,rDept,parseInt(rGrade0),parseInt(rGrade1) ]);
    
    for(let row of table)
        result+='<tr><td>'+row.rID+'</td><td>'+
        row.rName+'</td><td>'+row.rSex+'</td><td>'+
        row.rDept+'</td><td>'+row.rGrade+'</td></tr>';

    return responseStr(0, result, true);
}

exports.qBooklist=function*(req,res){
    let body = req.body;

    let table = yield db.execSQL("SELECT * FROM Readers WHERE rID=?",[body.rID]);
    if(table.length == 0)
        return responseStr(1, "该证号不存在");

    let result = "";
    let view1 = yield db.execSQL("SELECT Books.bID as bID,bName,rentDate, date(rentDate,'+30 day') as duedate FROM Infomations,Books WHERE Infomations.rID=? and returnDate is null and Infomations.bID=Books.bID",[body.rID]);
    let is ='否';

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    if(month<10) month = '0'+month;
    if(day<10) day = '0'+day;
    let now = year+'-'+month+'-'+day
    for(let row of view1){
        if(row.duedate<now) is = '是';
        result+='<tr><td>'+row.bID+'</td><td>'+
        row.bName+'</td><td>'+row.rentDate+'</td><td>'+
        row.duedate+'</td><td>'+is+'</td></tr>';
    }
    return responseStr(0, result, true);
}

exports.rentBook=function*(req,res){
    let body = req.body;

    let view1 = yield db.execSQL("SELECT * FROM Readers WHERE rID=?",[body.rID]);
    if(view1.length==0)
        return responseStr(1, "该证号不存在");
    
    let view2 = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);
    if(view2.length==0)
        return responseStr(2, "该书号不存在");
    
    let view3 = yield db.execSQL("SELECT bID, date(rentDate,'+30 day') as duedate FROM Infomations WHERE Infomations.rID=? and returnDate is null ",[body.rID]);
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    if(month<10) month = '0'+month;
    if(day<10) day = '0'+day;
    let num3=0;
    let num4=0;

    let now = year+'-'+month+'-'+day

    for(let row of view3){
        if(row.duedate<now) num3+=1;
        if(row.bID==body.bID) num4+=1;
    }
    if(num3>0)
        return responseStr(3, "该读者有超期书未还</body></html>");
    
    if(num4>0)
        return responseStr(4, "该读者已经借阅该书，且未归还</body></html>");
    
    let view5 = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);

    if(view5[0].storedNum ==0)
        return responseStr(5, "该书已经全部借出");

    yield db.execSQL("INSERT INTO Infomations (rID,bID,rentDate) values(?,?,?)",[body.rID,body.bID,now]);
    yield db.execSQL("UPDATE Books SET storedNum = ? WHERE bID = ?",[view5.length-1,body.bID]);
    return responseStr(0, "成功");
    
}

exports.returnBook=function*(req,res){
    let body = req.body;

    let view1 = yield db.execSQL("SELECT * FROM Readers WHERE rID=?",[body.rID]);
    if(view1.length==0)
        return responseStr(1, "该证号不存在");
    
    let view2 = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);
    if(view2.length==0)
        return responseStr(2, "该书号不存在");

    let view3 = yield db.execSQL("SELECT bID FROM Infomations WHERE Infomations.rID=? and Infomations.bID=? and returnDate is null ",[body.rID, body.bID]);
    if(view3.length==0)
        return responseStr(3, "该读者并未借阅该书</body></html>");

    // 确实借了该书
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    if(month<10) month = '0'+month;
    if(day<10) day = '0'+day;
    let now = year+'-'+month+'-'+day
    yield db.execSQL("UPDATE Infomations SET returnDate = ? WHERE bID = ? and rID = ?",[now,body.bID,body.rID]);

    let view5 = yield db.execSQL("SELECT * FROM Books WHERE bID=?",[body.bID]);
    yield db.execSQL("UPDATE Books SET storedNum = ? WHERE bID = ?",[view5[0].storedNum+1,body.bID]);
    return responseStr(0, "成功");
}

exports.qReaderlist=function*(req,res){
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    if(month<10) month = '0'+month;
    if(day<10) day = '0'+day;
    let now = year+'-'+month+'-'+day
    let table = yield db.execSQL("SELECT rID,rName,rSex,rDept,rGrade FROM Readers WHERE exists (SELECT * FROM Infomations WHERE date(rentDate,'+30 day')<? and Infomations.rID=Readers.rID and returnDate is null)",[now]);
    let result = ""
    for(let row of table)
        result+='<tr><td>'+row.rID+'</td><td>'+row.rName+'</td><td>'+row.rSex+'</td><td>'+row.rDept+'</td><td>'+row.rGrade+'</td></tr>';
    return responseStr(0, result, true);
}
