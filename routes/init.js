const responseStr = require("../tool").responseStr
const db=require("../coSqlite3");

exports.Init=function*(req,res){
    // let view = yield db.execSQL("SELECT name FROM sqlite_master WHERE type = 'table' and (name = 'Book' or name='Reader' or name ='Record') ");
    let view = yield db.execSQL("SELECT name FROM sqlite_master WHERE type = 'table' and name = 'Book' ");
    let num = 0;
    
    // 如果已有Book表，删除之
    for(let row in view){
        num+=1;
    }
    yield db.execSQL("DROP TABLE IF EXISTS Book");

    // 如果已有Reader表，删除之
    num = 0
    view = yield db.execSQL("SELECT name FROM sqlite_master WHERE type = 'table' and name = 'Reader' ");
    for(let row in view){
        num+=1;
    }
    yield db.execSQL("DROP TABLE IF EXISTS Reader");

    // 如果已有Record表，删除之
    num = 0
    view = yield db.execSQL("SELECT name FROM sqlite_master WHERE type = 'table' and name = 'Record' ");
    for(let row in view){
        num+=1;
    }
    yield db.execSQL("DROP TABLE IF EXISTS Record");

    // 新建库
    yield db.execSQL("create table Book (bID varchar(30) primary key,bName varchar(30) not null,bPub varchar(30) not null,bDate Date not null, bAuthor char(20) not null, bMem char(30) not null, bCnt int not null, libCnt int not null)");
    yield db.execSQL("create table Reader (rID varchar(30) primary key,rName varchar(10) not null,rSex char(1) not null,rDept varchar(10) not null, rGrade int not null)");
    yield db.execSQL("create table Record (rID varchar(30) not null ,bID varchar(30) not null , rentDate Date not null, sendDate Date )");

    return responseStr(0, "成功");
}

// htm="<html><body>"+
// "<div id='result' style='display:none'>1</div>"+
// "失败</body></html>";