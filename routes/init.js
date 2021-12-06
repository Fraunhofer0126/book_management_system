const responseStr = require("../tool").responseStr
const db=require("../coSqlite3");

exports.Init=function*(req,res){
    
    // 如果已有Book表，删除之
    let table = yield db.execSQL("SELECT name FROM sqlite_master WHERE type = 'table' and name = 'Books' ");
    if(table.length > 0)
        yield db.execSQL("DROP TABLE IF EXISTS Books");

    // 如果已有Reader表，删除之
    table = yield db.execSQL("SELECT name FROM sqlite_master WHERE type = 'table' and name = 'Readers' ");
    if(table.length > 0)
        yield db.execSQL("DROP TABLE IF EXISTS Readers");

    // 如果已有Record表，删除之
    table = yield db.execSQL("SELECT name FROM sqlite_master WHERE type = 'table' and name = 'Infomations' ");
    if(table.length > 0)
        yield db.execSQL("DROP TABLE IF EXISTS Infomations");

    // 新建库
    yield db.execSQL("create table Books (bID varchar(30) primary key,bName varchar(30) not null,bPub varchar(30) not null,bDate Date not null, bAuthor char(20) not null, bMem char(30) not null, bCnt int not null, storedNum int not null)");
    yield db.execSQL("create table Readers (rID varchar(30) primary key,rName varchar(10) not null,rSex char(1) not null,rDept varchar(10) not null, rGrade int not null)");
    yield db.execSQL("create table Infomations (rID varchar(30) not null ,bID varchar(30) not null , rentDate Date not null, returnDate Date )");

    return responseStr(0, "成功");
}