var express = require('express');
var formidable = require('formidable');
var async = require('async');
var router = express.Router();

var LOADING_SIZE = 20;
var DEFAULT_USER_LATITUDE = 37.566229;
var DEFAULT_USER_LONGITUDE = 126.977689;

var postedList = function (req, res, next) {
    var member_seq = req.query.member_seq;
    var current_page = req.query.current_page || 0;

    console.log("current_page : " + current_page)
    console.log("보고자 하는 프로필의 seq : " + member_seq)
    var start_page = current_page * LOADING_SIZE;
    if (!member_seq) {
        return res.sendStatus(400);
    }
    var database = req.app.get('database');
    console.log("게시글 정렬 호출됨");
    if (database.db) {
        var tasks = [
function (callback) {
                database.SoftwareInfoModel.findBySeqandReg_date(member_seq, start_page, LOADING_SIZE, function (err, results) {
                    if (err) {
                        console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                        callback(err, null);
                        res.end();
                        return;
                    }
                    if (results.length == 0)
                        return callback("값에러")
                    callback(null, results);
                });
                },
function (data, callback) {
                var count = 0;
                console.log("data.length : " + data.length)
                data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                    database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                        if (err) {
                            console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                            res.end();
                            return;
                        }
                        if (data.length == 0)
                            return callback("값없음")
                        if (result.length > 0) {
                            data[index].image_filename = result[0].filename;
                        }
                        count++;
                        if (count == data.length) {
                            callback(null, data)
                        }
                    });
                });
},
function (data, callback) {
                var ctr = 0;
                data.forEach((item, index) => {
                    database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                        if (err) {
                            console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                            res.end();
                            return;
                        }
                        if (result.length > 0) {
                            if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                data[index].is_keep = 'true';
                            } else {
                                data[index].is_keep = 'false';
                            }
                        } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                            data[index].is_keep = 'false';
                        }
                        ctr++;
                        if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                    })
                });
                    },
function (endresults, callback) {
                console.log("postedList값 : " + JSON.stringify(endresults));
                res.status(200).json(endresults);
                res.end();
                callback(null);
                    }
        ];
        async.waterfall(tasks, function (err) {
            if (err)
                console.log('err');
            else
                console.log('done');
        });
    }
}

//food/info
var info = function (req, res, next) { //info
    if (!req.body.member_seq) {
        return res.sendStatus(400);
    }
    var member_seq = req.body.member_seq;
    var post_member_icon_filename = req.body.postMemberIconFilename;
    var name = req.body.name;
    var tel = req.body.tel;
    var address = req.body.address;
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    var post_nickname = req.body.post_nickname;
    var description = req.body.description;
    var os = req.body.os;

    var database = req.app.get('database');

    if (database.db) {
        addfoodinfo(database, member_seq, name, tel, address, latitude, longitude, description, post_nickname, os, function (err, result) {
            if (err) {
                console.error('맛집정보 저장 중 에러 발생 : ' + err.stack);
                console.log('<h2>맛집정보 저장 중 에러 발생</h2>');
                console.log('<p>' + err.stack + '</p>');
                res.end();
                return;
            }

            if (result) {
                console.log('데이터 저장 성공 : ' + result.seq);
                res.status(200).send('' + result.seq); //이걸보내야 이미지 저장할 수 있는 액티비티로 넘어간다.
                res.end();

            } else {
                console.log('맛집정보 저장  실패');
                res.end();
            }
        });
    } else {
        console.log('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }

};


//food/info/image
var info_image = function (req, res) { //info/image'
    console.log('food/info/image 호출됨.');
    var form = new formidable.IncomingForm();

    form.on('fileBegin', function (name, file) {
        file.path = './public/img/' + file.name;
    });
    var database = req.app.get('database');
    form.parse(req, function (err, fields, files) {
        if (database.db) {
            addfoodinfoimage(database, fields.info_seq, files.file.name, fields.image_memo, function (err, result) {
                if (err) {
                    console.error('맛집정보 저장 중 에러 발생 : ' + err.stack);
                    console.log('<h2>맛집정보 저장 중 에러 발생</h2>');
                    console.log('<p>' + err.stack + '</p>');
                    res.end();
                    return;
                }

                if (result) {
                    console.log('맛집정보 저장 성공');
                    res.status(200).send('' + result.name);
                    res.end();

                } else {
                    console.log('<h2>맛집정보 저장  실패</h2>');
                    res.end();
                }
            });
        } else {
            console.log('<h2>데이터베이스 연결 실패</h2>');
            res.end();
        }
    });
}

//food/info/:seq
var info_seq = function (req, res, next) { //info/:seq
    var seq = parseInt(req.params.seq);
    var member_seq = parseInt(req.query.member_seq);
    var database = req.app.get('database');
    if (database.db) {
        var tasks = [
            function (callback) {
                database.SoftwareInfoModel.findByseq(seq, function (err, results) {
                    if (err) {
                        console.error('회원정보 반환 중 오류 발생 :' + err.stack);
                        callback(err, null);
                        res.end();
                        return;
                    }
                    if (results.length == 0) return callback("갑없음")
                    callback(null, results); //info내용1개 반환하는듯
                })
            },
//이 info에서 추출한거와 같은 이미지가 있는지 조사한다 같은 이미지가 2개라면 코드가 바뀔것같다..
            function (data, callback) {
                database.SoftwareInfoImageModel.findByseq(data[0].seq, function (err, result) {
                    if (err) {
                        console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                        res.end();
                        return;
                    }
                    if (result.length > 0) {
                        console.log("불러온 이미지값" + JSON.stringify(result));
                        data[0].image_filename = result[0].filename; //첫화면을 위함
                        data[0].total_image_filename = result; //총 개수를 위함.
                        callback(null, data);
                    } else callback(null, data);
                });
},
            //위 info에서 추출한 내용을 기준으로 keep모델에서 keep에등록되어있는게 있는지 확인하고 그 keep에 등록되어있는게
            //나의 member_seq와 같은지 확인한다. 같다면 궈궈!
            function (data, callback) {
                database.SoftwareKeepModel.findByseqfromInfoseq(data[0].seq, function (err, result) {
                    if (err) {
                        console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                        res.end();
                        return;
                    }
                    if (result.length > 0) {
                        if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                            data[0].is_keep = 'true';
                        } else {
                            data[0].is_keep = 'false';
                        }
                        callback(null, data);
                    } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                        data[0].is_keep = 'false';
                        callback(null, data);
                    }
                })
                //???????????????콜백이 여기들어가면 윗윗줄의 data[0].is_keep을 실행하기도전에 endresults를 하고 지랄 ㅡㅡ 
                //그래서 위에 이프엘스에 각각넣어줌 ㅡㅡ 개짜증남정말 ㅡㅡ
                    },
            function (endresults, callback) {
                console.log("값 : " + JSON.stringify(endresults[0]));
                res.json(endresults[0]);
                callback(null);
                    }
        ];
        async.waterfall(tasks, function (err) {
            if (err)
                console.log('err');
            else
                console.log('done');
        });
    } else { // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.end();
        console.log('<h2>데이터베이스 연결 실패</h2>');
    }
}

//food/list
var list = function (req, res, next) { //list', function(req, res, next) {
    var member_seq = req.query.member_seq;
    var order_type = req.query.order_type;
    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;

    var image_filename = '';
    if (!member_seq) {
        return res.sendStatus(400);
    }

    var database = req.app.get('database');
    if (order_type == 'reg_date') {
        console.log("등록순 정렬 호출 됨");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findByreg_date(start_page, LOADING_SIZE, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    console.log("data.length : " + data.length)
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    // console.log("값 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err)
                    console.log('err');
                else
                    console.log('done');
            });
        }
    } else if (order_type == 'keep_cnt') { //즐겨찾기정렬
        console.log("즐겨찾기 정렬 호출 됨");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findBykeep_cnt(start_page, LOADING_SIZE, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    // console.log("값 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err)
                    console.log('err');
                else
                    console.log('done');
            });
        }
    }
    ////거리순 정렬
    else {
        console.log("등록순 정렬 호출 됨");
        if (database.db) {
            var tasks = [
function (callback) {
                    database.SoftwareInfoModel.findByreg_date(start_page, LOADING_SIZE, function (err, results) {
                        if (err) {
                            console.error('맛집정보 반환 중 오류 발생 :' + err.stack);
                            callback(err, null);
                            res.end();
                            return;
                        }
                        if (results.length == 0)
                            return callback("값에러")
                        callback(null, results);
                    });
                },
function (data, callback) {
                    var count = 0;
                    data.forEach((item, index) => { //같은원리 아닌가? for로 하면 안되는이유는??
                        database.SoftwareInfoImageModel.findByseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (data.length == 0)
                                return callback("값없음")
                            if (result.length > 0) {
                                data[index].image_filename = result[0].filename;
                            }
                            count++;
                            if (count == data.length) {
                                callback(null, data)
                            }
                        });
                    });
},
function (data, callback) {
                    var ctr = 0;
                    data.forEach((item, index) => {
                        database.SoftwareKeepModel.findByseqfromInfoseq(item.seq, function (err, result) {
                            if (err) {
                                console.error('이미지정보 반환 중 오류 발생 :' + err.stack);
                                res.end();
                                return;
                            }
                            if (result.length > 0) {
                                if (parseInt(member_seq) == parseInt(result[0].member_seq) && result.length != 0) {
                                    data[index].is_keep = 'true';
                                } else {
                                    data[index].is_keep = 'false';
                                }
                            } else { //즐겨찾기한게 없으면 안들어오기떄문에 false값을 줄 수 없어서 주기위해 여기에도 추가해야함
                                data[index].is_keep = 'false';
                            }
                            ctr++;
                            if (ctr == data.length) callback(null, data) // 가져온 info값들의 즐겨찾기 유무조사후 빠져나오기위한 함수
                        })
                    });
                    },
function (endresults, callback) {
                    // console.log("값 : " + JSON.stringify(endresults));
                    res.status(200).json(endresults);
                    res.end();
                    callback(null);
                    }
        ];
            async.waterfall(tasks, function (err) {
                if (err) {
                    res.sendStatus(400);
                    console.log('err');
                } else
                    console.log('done');
            });
        }
    }
}
//////////////////////////////////////////////////내부함수/////////////////////////////////////////////
var addfoodinfo = function (database, member_seq, name, tel, address, latitude, longitude, description, post_nickname, os, callback) {
    console.log('addinfo 호출됨.');

    var info = new database.SoftwareInfoModel({
        member_seq: member_seq,
        name: name,
        tel: tel,
        geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
        },
        os: os,
        post_nickname: post_nickname,
        address: address,
        description: description
    });

    // save()로 저장
    info.save(function (err) {
        if (err) {
            callback(err, null);
            return;
        }

        console.log("데이터 추가함.");
        callback(null, info);

    });
}
//addfoodinfoimage(database, fields.info_seq,files.file.name,fields.image_memo
var addfoodinfoimage = function (database, info_seq, name, image_memo, callback) {
    console.log('addinfoimage 호출됨.');

    var infoImage = new database.SoftwareInfoImageModel({
        info_seq: info_seq,
        filename: name,
        image_memo: image_memo
    });

    // save()로 저장
    infoImage.save(function (err) {
        if (err) {
            callback(err, null);
            return;
        }

        console.log("이미지 데이터 추가함.");
        callback(null, info);

    });
}
module.exports.postedList = postedList;
module.exports.info = info;
module.exports.info_image = info_image;
module.exports.info_seq = info_seq;
module.exports.list = list;