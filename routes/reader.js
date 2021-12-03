const responseStr = require("../tool").responseStr
const db=require("../coSqlite3");

exports.addReader=function*(req,res){
    let body = req.body;
    let rID = body.rID;
    let rName = body.rName;
    let rSex = body.rSex;
    let rDept = body.rDept;
    let rGrade = body.rGrade;

    if(rID.length>8||rID.length==0)
        return responseStr(2, "提交的参数有误：你没填证号或者证号过长");
    else if(rName.length>10||rName.length==0)
        return responseStr(2, "提交的参数有误：你没填姓名或者姓名过长");
    else if(!(rSex=='男'||rSex=='女'))
        return responseStr(2, "提交的参数有误：外星人？");
    else if(rDept.length>10||rDept.length==0)
        return responseStr(2, "提交的参数有误：你没填系名或者系名过长");
    else if(rGrade.length==0||!(/(^[1-9]\d*$)/.test(rGrade)))
        return responseStr(2, "提交的参数有误：你没填年级或者填的不是阳间年级");

    let view = yield db.execSQL("SELECT rID FROM Reader WHERE rID=?",[rID]);
    let num=0;
    for(let row of view)
        num+=1;
    
    if(num>0)
        return responseStr(1, "该证号已经存在");
    else{
        yield db.execSQL("INSERT INTO Reader (rID,rName,rSex,rDept,rGrade) values(?,?,?,?,?)",[rID,rName,rSex,rDept,parseInt(rGrade)]);
        return responseStr(0, "成功");
    }
}

exports.delReader=function*(req,res){
    let body = req.body;
    let rID = body.rID;

    let view = yield db.execSQL("SELECT * FROM Reader WHERE rID=?",[rID]);
    let num=0;
    for(let row of view)
        num+=1;
    if(num==0)
        return responseStr(1, "该证号不存在");
    else{
        let view1 = yield db.execSQL("SELECT * FROM Record WHERE rID=? and sendDate is null  ",[rID]);
        let num1=0;
        for(let row of view1){
            num1+=1;
        }
        if(num1==0){
            yield db.execSQL("delete FROM Reader WHERE rID = ?",[rID]);
            return responseStr(0, "成功");
        }
        else return responseStr(2, "该读者尚有书籍未归还</body></html>")
    }
}

exports.changeReader=function*(req,res){
    let body = req.body;
    let rID = body.rID;
    let rName = body.rName;
    let rSex = body.rSex;
    let rDept = body.rDept;
    let rGrade = body.rGrade;

    if(rID.length>8||rID.length==0)
        return responseStr(2, "提交的参数有误：你没填证号或者证号过长");
    else if(rName.length>10||rName.length==0)
        return responseStr(2, "提交的参数有误：你没填姓名或者姓名过长");
    else if(!(rSex=='男'||rSex=='女'))
        return responseStr(2, "提交的参数有误：外星人？");
    else if(rDept.length>10||rDept.length==0)
        return responseStr(2, "提交的参数有误：你没填系名或者系名过长");
    else if(rGrade.length==0||!(/(^[1-9]\d*$)/.test(rGrade)))
        return responseStr(2, "提交的参数有误：你没填年级或者填的不是阳间年级");
    
    let view = yield db.execSQL("SELECT * FROM Reader WHERE rID=?",[rID]);
    let num=0;
    for(let row of view)
        num+=1;
    if(num==0){
        return responseStr(1, "该证号不存在");
    }else{
        yield db.execSQL("UPDATE Reader SET rName = ?,rSex = ?,rDept = ?,rGrade = ? WHERE rID = ?",[rName,rSex,rDept,parseInt(rGrade),rID])
        return responseStr(0, "成功");
    }
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
    let view = yield db.execSQL("SELECT * FROM Reader WHERE rID like ? and rName like ? and rSex like ? and rDept like ? and rGrade >= ? and rGrade <= ? ",[ rID ,rName,rSex,rDept,parseInt(rGrade0),parseInt(rGrade1) ]);
    
    for(let row of view)
        result+='<tr><td>'+row.rID+'</td><td>'+
        row.rName+'</td><td>'+row.rSex+'</td><td>'+
        row.rDept+'</td><td>'+row.rGrade+'</td></tr>';

    return responseStr(0, result, true);
}

exports.qBooklist=function*(req,res){
    let body = req.body;
    let rID = body.rID;
    let view = yield db.execSQL("SELECT * FROM Reader WHERE rID=?",[rID]);
    let num=0;
    for(let row of view)
        num+=1;
    let result = "";
    let view1 = yield db.execSQL("SELECT Book.bID as bID,bName,rentDate, date(rentDate,'+30 day') as duedate FROM Record,Book WHERE Record.rID=? and sendDate is null and Record.bID=Book.bID",[rID]);
    let is ='否';

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    if(month<10) month = '0'+month;
    if(day<10) day = '0'+day;
    let now = year+'-'+month+'-'+day
    for(let row1 of view1){
        if(row1.duedate<now)
            is = '是';
        result+='<tr><td>'+row1.bID+'</td><td>'+
        row1.bName+'</td><td>'+row1.rentDate+'</td><td>'+
        row1.duedate+'</td><td>'+is+'</td></tr>';
    }
    return responseStr(0, result, true);
}

exports.rentBook=function*(req,res){
    let body = req.body;
    let rID = body.rID;
    let bID = body.bID;
    let view1 = yield db.execSQL("SELECT * FROM Reader WHERE rID=?",[rID]);
    let num1=0;
    for(let row of view1)
        num1+=1;
    if(num1==0)
        return responseStr(1, "该证号不存在");
    
    let view2 = yield db.execSQL("SELECT * FROM Book WHERE bID=?",[bID]);
    let num2=0;
    for(let row of view2)
        num2+=1;
    if(num2==0)
        return responseStr(2, "该书号不存在");
    
    let view3 = yield db.execSQL("SELECT bID, date(rentDate,'+30 day') as duedate FROM Record WHERE Record.rID=? and sendDate is null ",[rID]);
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
        if(row.bID==bID) num4+=1;
    }
    if(num3>0)
        return responseStr(3, "该读者有超期书未还</body></html>");
    
    if(num4>0)
        return responseStr(4, "该读者已经借阅该书，且未归还</body></html>");
    
    let view5 = yield db.execSQL("SELECT * FROM Book WHERE bID=?",[bID]);
    let num5 = view5[0].libCnt
    if(num5 ==0){
        return responseStr(5, "该书已经全部借出");
    }else{
        yield db.execSQL("INSERT INTO Record (rID,bID,rentDate) values(?,?,?)",[rID,bID,now]);
        yield db.execSQL("UPDATE Book SET libCnt = ? WHERE bID = ?",[num5-1,bID]);
        return responseStr(0, "成功");
    }
}

exports.returnBook=function*(req,res){
    let body = req.body;
    let rID = body.rID;
    let bID = body.bID;
    let view1 = yield db.execSQL("SELECT * FROM Reader WHERE rID=?",[rID]);
    let num1=0;
    for(let row of view1)
        num1+=1;
    
    let result = ""
    if(num1==0)
        return responseStr(1, "该证号不存在");
    
    let view2 = yield db.execSQL("SELECT * FROM Book WHERE bID=?",[bID]);
    let num2=0;
    for(let row of view2)
        num2+=1;

    if(num2==0)
        return responseStr(2, "该书号不存在");
    let view3 = yield db.execSQL("SELECT bID FROM Record WHERE Record.rID=? and sendDate is null ",[rID]);
    let num3=0;
    for(let row of view3)
        if(row.bID==bID)
            num3+=1;
        
    if(num3 == 0)
        return responseStr(3, "该读者并未借阅该书</body></html>");

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    if(month<10) month = '0'+month;
    if(day<10) day = '0'+day;
    let now = year+'-'+month+'-'+day
    yield db.execSQL("UPDATE Record SET sendDate = ? WHERE bID = ? and rID = ?",[now,bID,rID]);
    let view5 = yield db.execSQL("SELECT * FROM Book WHERE bID=?",[bID]);
    yield db.execSQL("UPDATE Book SET libCnt = ? WHERE bID = ?",[view5[0].libCnt+1,bID]);
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
    let view = yield db.execSQL("SELECT rID,rName,rSex,rDept,rGrade FROM Reader WHERE exists (SELECT * FROM Record WHERE date(rentDate,'+30 day')<? and Record.rID=Reader.rID and sendDate is null)",[now]);
    let result = ""
    for(let row of view)
        result+='<tr><td>'+row.rID+'</td><td>'+
        row.rName+'</td><td>'+row.rSex+'</td><td>'+
        row.rDept+'</td><td>'+row.rGrade+'</td></tr>';
    return responseStr(0, result, true);
}
