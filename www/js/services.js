angular.module('services', ['ionic','ngResource'])

// 客户端配置
.constant('CONFIG', {
  baseUrl: 'http://121.43.107.106:8055/Api/v1/',
  //revUserId: "",
  //TerminalName: "",
  //TerminalIP: "",
  //DeviceType: '1',
})

// --------一些公用说明--------
//角色 {'DivideLeader':'分流组长','DividePersonnel':'分流人员','EmergencyPersonnel':'急救人员'}
//伤情等级  {'1':'轻','2':'中','3':'重','4':重危'}


// 本地存储函数
.factory('Storage', ['$window', function ($window) {
  return {
    set: function(key, value) {
      $window.localStorage.setItem(key, value);
    },
    get: function(key) {
      return $window.localStorage.getItem(key);
    },
    rm: function(key) {
      $window.localStorage.removeItem(key);
    },
    clear: function() {
      $window.localStorage.clear();
    }
  };
}])

//公用函数
.factory('Common', ['Storage', function (Storage) {
return{
    // 获取RevisonInfo信息 Common.postInformation().revUserId
    postInformation:function(){
      var postInformation={};
      if(window.localStorage['UID']==null){
        postInformation.revUserId = 'who'
      }
      else{
        postInformation.revUserId = window.localStorage['UID'];
      }
      
      postInformation.TerminalIP = 'IP';
      if(window.localStorage['TerminalName']==null){
        postInformation.TerminalName = 'which';
      }
      else{
        postInformation.TerminalName = window.localStorage['TerminalName'];
      }
      postInformation.DeviceType = 2;
      return postInformation;
    },
    //获取到s的当前时间
    DateTimeNow:function(){
      var date = new Date();
      var dt={};
      dt.year=date.getFullYear().toString();
      dt.year.length==1?dt.year='0'+dt.year:dt.year=dt.year;
      dt.month=(date.getMonth()+1).toString();
      dt.month.length==1?dt.month='0'+dt.month:dt.month=dt.month;
      dt.day=date.getDate().toString();
      dt.day.length==1?dt.day='0'+dt.day:dt.day=dt.day;
      dt.hour=date.getHours().toString();
      dt.hour.length==1?dt.hour='0'+dt.hour:dt.hour=dt.hour;
      dt.minute=date.getMinutes().toString();
      dt.minute.length==1?dt.minute='0'+dt.minute:dt.minute=dt.minute;
      dt.second=date.getSeconds().toString();
      dt.second.length==1?dt.second='0'+dt.second:dt.second=dt.second;
      dt.fullTime=dt.year+'-'+dt.month+'-'+dt.day+' '+dt.hour+':'+dt.minute+':'+dt.second;
      return dt;
    }
  }
}])

// 数据模型函数, 具有取消(cancel/abort)HTTP请求(HTTP request)的功能
.factory('Data',['$resource', '$q','$interval' ,'CONFIG','Storage' , function($resource,$q,$interval ,CONFIG,Storage){
  var serve={};
  var abort = $q.defer();
  var getToken=function(){
    return Storage.get('TOKEN') ;
  }

  var Users = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'UserInfo',},{
      LogOn:{method:'POST', params:{route: 'LogOn',UserID:'@UserID',LoginPassword:'@LoginPassword'}, timeout: 10000},
      UserRegister:{method:'POST', params:{route: 'UserRegister'}, timeout: 10000},
      ChangePassword:{method:'POST',params:{route:'ChangePassword',UserID:'@UserID',OldPassword:'@OldPassword',NewPassword:'@NewPassword'},timeout: 10000},
      UID:{method:'GET',params:{route:'UID',Type:'@Type',Name:'@Name'},timeout:10000},
      ModifyUserInfo:{method:'POST',params:{route:'ModifyUserInfo',UserID:'@UserID',RoleCode:'@RoleCode',UserName:'@UserName',Occupation:"@Occupation",Position:'@Position',Affiliation:'@Affiliation'},timeout:10000},
      SetUserInfo:{method:'POST',params:{route:'SetUserInfo'},timeout:10000},
      GetModifyUserInfo:{method:'GET',params:{route:'GetModifyUserInfo',UserID:'@UserID'},timeout:10000},
    });
  };
  var MstType = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'MstType',},{
      GetMstType:{method:'GET',isArray:true, params:{route: 'GetMstType',Category:'@Category'}, timeout: 10000}
    });
  }; 
  var MobileDevice = function(){
    return $resource(CONFIG.baseUrl + ':path/:route',{path:'MobileDevice',},{
      SetMobileDevice:{method:'POST', params:{route: 'SetMobileDevice'}, timeout: 10000}
    });
  };  
  var PatientInfo = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'PatientInfo'},
      {
        SetPatientInfo: {method:'POST',params:{route: 'SetPatientInfo'}, timeout:10000},
        GetNewPatientID: {method:'GET',params:{route: 'GetNewPatientID'}, timeout:10000},
        GetPsPatientInfo: {method:'GET',params:{route: 'GetPsPatientInfo',strPatientID:'@strPatientID'}, timeout:10000},
        CheckPatientID: {method:'POST',params:{route: 'CheckPatientID',PatientID:'@PatientID'}, timeout:10000},
      });
  };
  var PatientVisitInfo = function () {
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'PatientVisitInfo'},
      {
        GetPatientsbyStatus: {method:'GET',isArray: true,params:{route: 'GetPatientsbyStatus', strStatus:'@strStatus'}, timeout:10000},
        GetPatientbyPID: {method:'GET',params:{route: 'GetPatientbyPID', strPatientID:'@strPatientID'}, timeout:10000},
        GetNewVisitNo: {method:'GET',params:{route: 'GetNewVisitNo', patientID:'@patientID'}, timeout:10000},
        UpdateInjury: {method:'POST',params:{route: 'UpdateInjury'}, timeout:10000},
        UpdateEva: {method:'POST',params:{route: 'UpdateEva'}, timeout:10000},
        GetPatientVisitInfo: {method:'GET',params:{route: 'GetPatientVisitInfo', strPatientID:'@strPatientID',strVisitNo:'@strVisitNo'}, timeout:10000},
        SetPsPatientVisitInfo: {method:'POST',params:{route: 'SetPsPatientVisitInfo'}, timeout:10000},
        UpdateTriage: {method:'POST', params:{route:'UpdateTriage'}, timeout:10000},
        UpdateArrive: {method:'POST', params:{route:'UpdateArrive'}, timeout:10000},
      });
  };
  var VitalSignInfo = function(){
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'VitalSignInfo'}, {
      GetVitalSignInfos: {method:'GET', params:{route:'GetVitalSignInfos', PatientID:'@PatientID', VisitNo:'@VisitNo'}, isArray:true, timeout:10000},
      POSTVitalSign:{method:'POST', params:{route: 'SetVitalSign',PatientID:'@PatientID',VisitNo:'@VisitNo'}, timeout: 10000}
    });
  };
  var MstVitalSignDict = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'MstVitalSignDict'},{
          GETVitalSignDictItems:{method:'GET',isArray:true, params:{route: 'GetAllVitalSignDictItems'}, timeout: 10000}
      });
  };
  var EmergencyInfo = function(){
    return $resource(CONFIG.baseUrl + ':path/:route', {path:'EmergencyInfo'}, {
      GetEmergencyInfos: {method:'GET', params:{route:'GetEmergencyInfos', PatientID:'@PatientID', VisitNo:'@VisitNo'}, isArray:true, timeout:10000},
      POSTEmergency:{method:'POST', params:{route: 'SetEmergency',PatientID:'@PatientID',VisitNo:'@VisitNo'}, timeout: 10000}
    });
  };
  var MstEmergencyItemDict = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'MstEmergencyItemDict'},{
          GETEmergencyDictItems:{method:'GET',isArray:true, params:{route: 'GetAllMstEmergencyItemDict'}, timeout: 10000}
      });
  };
  var MstDivision = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'MstDivision'},{
          GetDivisions:{method:'GET',isArray:true, params:{route: 'GetDivisions'}, timeout: 10000}
      });
  };
  var MstEva = function(){
      return $resource(CONFIG.baseUrl + ':path/:route',{path:'MstEva'},{
          GetDataByEVATransportation:{method:'GET',isArray:true, params:{route: 'GetDataByEVATransportation'}, timeout: 10000}
      });
  };
  serve.abort = function ($scope) {
  abort.resolve();
  $interval(function () {
    abort = $q.defer();
    serve.Users = Users(); 
    serve.MstType = MstType(); 
    serve.MobileDevice = MobileDevice(); 
    serve.PatientInfo = PatientInfo(); 
    serve.PatientVisitInfo = PatientVisitInfo(); 
    serve.VitalSignInfo = VitalSignInfo();
    serve.EmergencyInfo = EmergencyInfo();
    serve.MstVitalSignDict = MstVitalSignDict();
    serve.MstEmergencyItemDict = MstEmergencyItemDict();
    serve.MstDivision = MstDivision();
    serve.MstEva = MstEva();
    }, 0, 1);
  };
  serve.Users = Users();
  serve.MstType = MstType(); 
  serve.MobileDevice = MobileDevice(); 
  serve.PatientInfo = PatientInfo(); 
  serve.PatientVisitInfo = PatientVisitInfo(); 
  serve.VitalSignInfo = VitalSignInfo();
  serve.EmergencyInfo = EmergencyInfo();
  serve.MstVitalSignDict = MstVitalSignDict();
  serve.MstEmergencyItemDict = MstEmergencyItemDict();
  serve.MstDivision = MstDivision();
  serve.MstEva = MstEva();
  return serve;
}])

//-------用户基本操作-登录、注册、修改密码、位置选择、个人信息维护-------- [熊嘉臻]
.factory('UserInfo', ['$q', 'Data',function($q, Data){
  var self = this;
  var RevUserId="xxx";
  var TerminalName = 'X-PC' , TerminalIP = '10.110.110.110';
  self.isPasswdValid = function(passwd){
    var patrn=/^(\w){6,20}$/;    
    if (patrn.exec(passwd)){
      return true; 
    } 
    return false;
  }
  self.UserRegister = function(form){
    var deferred = $q.defer();
    form.RevUserId = RevUserId; 
    form.TerminalName = TerminalName; 
    form.TerminalIP = TerminalIP;
    Data.Users.UserRegister(form,
      function(s){
        deferred.resolve(s);
      },function(e){
        deferred.reject(e);
      });
    return deferred.promise;
  };

  self.ChangePassword = function (UserID,OldPassword,NewPassword) {
    var deferred = $q.defer();
    Data.Users.ChangePassword({UserID:UserID,OldPassword:OldPassword,NewPassword:NewPassword}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.LogOn = function (UserID,LoginPassword) {
    var deferred = $q.defer();
    Data.Users.LogOn({UserID:UserID,LoginPassword:LoginPassword}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.ModifyUserInfo = function (UserID,RoleCode,UserName,Occupation,Position,Affiliation) {
    var deferred = $q.defer();
    Data.Users.ModifyUserInfo({UserID:UserID,RoleCode:RoleCode,UserName:UserName,Occupation:Occupation,Position:Position,Affiliation:Affiliation}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };  
  self.SetUserInfo = function (UserID,PassWord,UserName,RoleCode,UnitCode,Location) {
    var deferred = $q.defer();
    Data.Users.SetUserInfo({UserID:UserID,PassWord:PassWord,UserName:UserName,RoleCode:RoleCode,UnitCode:UnitCode,Location:Location}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetModifyUserInfo = function (UserID) {
    var deferred = $q.defer();
    Data.Users.GetModifyUserInfo({UserID:UserID}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetMstType = function(key){
    var deferred = $q.defer();
    Data.MstType.GetMstType({Category:key}, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;    
  }
  self.SetMobileDevice = function(form){
    var deferred = $q.defer();
    form.TerminalName = TerminalName;
    form.TerminalIP = TerminalIP;
    Data.MobileDevice.SetMobileDevice(form, 
      function (data, headers) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;    
  }  
  return self;
}])

//-------急救人员-列表、新建、后送--------- [赵艳霞]
//获取字典表MstType数据
.factory('MstType', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.GetMstType = function(Category){
    var deferred = $q.defer();
    Data.MstType.GetMstType({Category:Category},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  return self;
}])

//病人基本信息
.factory('PatientInfo', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.SetPatientInfo = function(sendData){
    var deferred = $q.defer();
    Data.PatientInfo.SetPatientInfo(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.GetNewPatientID = function(){
    var deferred = $q.defer();
    Data.PatientInfo.GetNewPatientID(
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetPsPatientInfo = function(strPatientID){
    var deferred = $q.defer();
    Data.PatientInfo.GetPsPatientInfo({strPatientID:strPatientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.CheckPatientID = function(strPatientID){
    var deferred = $q.defer();
    Data.PatientInfo.CheckPatientID({PatientID:strPatientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  return self;
}])

//病人就诊信息
.factory('PatientVisitInfo', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.GetPatientsbyStatus = function(strStatus){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetPatientsbyStatus({strStatus:strStatus},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetPatientbyPID = function(strPatientID){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetPatientbyPID({strPatientID:strPatientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.GetNewVisitNo = function(patientID){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetNewVisitNo({patientID:patientID},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.UpdateInjury = function(sendData){
    var deferred = $q.defer();
    Data.PatientVisitInfo.UpdateInjury(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

   self.UpdateEva = function(sendData){
    var deferred = $q.defer();
    Data.PatientVisitInfo.UpdateEva(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };

  self.GetPatientVisitInfo = function(strPatientID, strVisitNo){
    var deferred = $q.defer();
    Data.PatientVisitInfo.GetPatientVisitInfo({strPatientID:strPatientID, strVisitNo:strVisitNo},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  
  self.SetPsPatientVisitInfo = function(sendData){
    var deferred = $q.defer();
    Data.PatientVisitInfo.SetPsPatientVisitInfo(sendData,
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  self.UpdateTriage = function(PatientID, VisitNo, Status, TriageDateTime, TriageToDept){
    var deferred = $q.defer();
    Data.PatientVisitInfo.UpdateTriage({PatientID:PatientID, VisitNo:VisitNo, Status:Status, TriageDateTime:TriageDateTime, TriageToDept:TriageToDept, UserID:'', TerminalName:'', TerminalIP:''}, function(data, headers){
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  self.UpdateArrive = function(PatientID, VisitNo, Status, ArriveDateTime, ArrivePlace){
    var deferred = $q.defer();
    Data.PatientVisitInfo.UpdateArrive({PatientID:PatientID, VisitNo:VisitNo, Status:Status, ArriveDateTime:ArriveDateTime, ArrivePlace:ArrivePlace, UserID:'', TerminalName:'', TerminalIP:''}, function(data, headers){
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])



//-------分流人员-列表、信息查看、分流-------- [张亚童]
.factory('VitalSignInfo', ['$q', '$http', 'Data', function( $q, $http, Data ){
  var self = this;
  // 获取某一病人体征信息（供分流使用）--张桠童
  self.GetVitalSignInfos = function(PatientID, VisitNo){
    var deferred = $q.defer();
    Data.VitalSignInfo.GetVitalSignInfos({PatientID:PatientID, VisitNo:VisitNo}, function(data, headers){
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

.factory('EmergencyInfo', ['$q', '$http', 'Data', function( $q, $http, Data ){
  var self = this;
  // 获取某一病人伤情/处置/等级（供分流使用）--张桠童
  self.GetEmergencyInfos = function(PatientID, VisitNo){
    var deferred = $q.defer();
    Data.EmergencyInfo.GetEmergencyInfos({PatientID:PatientID, VisitNo:VisitNo}, function(data, headers){
      deferred.resolve(data);
    }, function(err){
      deferred.reject(err);
    });
    return deferred.promise;
  };
  return self;
}])

//获取字典表MstDivision数据
.factory('MstDivision', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.GetDivisions = function(){
    var deferred = $q.defer();
    Data.MstDivision.GetDivisions({},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  return self;
}])

//获取后送批次字典表数据
.factory('MstEva', ['$q','$http', 'Data', function($q,$http, Data){
  var self = this;

  self.GetDataByEVATransportation = function(EVATransportation){
    var deferred = $q.defer();
    Data.MstEva.GetDataByEVATransportation({EVATransportation:EVATransportation},
      function(data, headers){
        deferred.resolve(data);
      },function(err){
        deferred.reject(err);
      });
    return deferred.promise;
  };
  return self;
}])
//-------急救人员-伤情与处置-------- [马志彬]
////////////蓝牙(BLE)相关服务///马志彬-----------start
.factory('bleService', function () {
        return {
            stringToBytes: function(string) {
                var array = new Uint8Array(string.length);
                for (var i = 0, l = string.length; i < l; i++) {
                    array[i] = string.charCodeAt(i);
                }
                return array;
            },
            bytesToString: function(buffer){
                return String.fromCharCode.apply(null, new Uint8Array(buffer));
            },
            timesynccommand:function(){
                var Timesynccommand = new Uint8Array(4);
                Timesynccommand[0] = 0x00;//起始标志
                Timesynccommand[1] = 0x01;//上位机编号
                Timesynccommand[2] = 0x80;//命令
                Timesynccommand[3] = 0x88;//结束码
                return Timesynccommand.buffer;
            },
            timesyncdata:function(){
                var Timesyncdata = new Uint8Array(10);
                Timesyncdata[0] = 0x00;//起始标志
                Timesyncdata[1] = 0xF1;//上位机编号
                Timesyncdata[2] = 0x00;//年（2xxx）
                Timesyncdata[3] = 0x00;//月
                Timesyncdata[4] = 0x00;//日
                Timesyncdata[5] = 0x00;//时
                Timesyncdata[6] = 0x00;//分
                Timesyncdata[7] = 0x00;//秒
                Timesyncdata[8] = 0x88;//校验和
                Timesyncdata[9] = 0x88;//结束码
                var date = new Date();
                Timesyncdata[2] = date.getFullYear()%1000;
                Timesyncdata[3] = date.getMonth()+1;
                Timesyncdata[4] = date.getDate();
                Timesyncdata[5] = date.getHours();
                Timesyncdata[6] = date.getMinutes();
                Timesyncdata[7] = date.getSeconds();
                // Timesyncdata[8] = Timesyncdata[1]+Timesyncdata[0]+Timesyncdata[2]+Timesyncdata[3]+Timesyncdata[4]+Timesyncdata[5]+Timesyncdata[6]+Timesyncdata[7];

                return Timesyncdata.buffer;
            },
            currentdatacommand:function(){
                var Currentdatacommand = new Uint8Array(4);
                Currentdatacommand[0] = 0x00;//起始标志
                Currentdatacommand[1] = 0x01;//上位机编号
                Currentdatacommand[2] = 0x81;//当前数据传送
                Currentdatacommand[3] = 0x88;//结束码

                return Currentdatacommand.buffer;
            },
            multitudedatacommand:function(){
                var Multitudedatacommand = new Uint8Array(5);
                Multitudedatacommand[0] = 0x00;//起始标志
                Multitudedatacommand[1] = 0x01;//上位机编号
                Multitudedatacommand[2] = 0x82;//N个数据传送
                Multitudedatacommand[3] = 0x46;//传送数据的组数（N）
                Multitudedatacommand[4] = 0x88;//结束码

                return Multitudedatacommand.buffer;
            },
            mastercomputerrespond:function(status){//默认成功，failed-失败
                var Mastercomputerrespond = new Uint8Array(4);
                Mastercomputerrespond[0] = 0x00;//起始标志
                Mastercomputerrespond[1] = 0x01;//上位机编号
                Mastercomputerrespond[2] = 0x00;//应答值(0x00-接收成功/0x01-接收失败)
                Mastercomputerrespond[4] = 0x88;//结束码

                if(status=='failed')Mastercomputerrespond[2] = 0x01;

                return Mastercomputerrespond.buffer;
            }
        };
    })
.factory('Patients',['Data','$q','$resource','CONFIG',function(Data,$q,$resource,CONFIG){
        var self = this;
        self.PostVitalSign = function(Postdata){

            var deferred = $q.defer();
            Data.VitalSignInfo.POSTVitalSign(Postdata.ID,Postdata.postdata,
                function (s) {
                    deferred.resolve(s);
                },
                function (e) {
                    deferred.reject(e);
                }
            );
            return deferred.promise;        
        },
        self.GetVitalSignDictItems = function(){

            var deferred = $q.defer();

            Data.MstVitalSignDict.GETVitalSignDictItems(
                function (s) {
                    deferred.resolve(s);
                },
                function (e) {
                    deferred.reject(e);
                }
            );
            return deferred.promise;        
        },
        self.PostEmergency = function(Postdata){

            var deferred = $q.defer();

            Data.EmergencyInfo.POSTEmergency(Postdata.ID,Postdata.postdata,
                function (s) {
                    deferred.resolve(s);
                },
                function (e) {
                    deferred.reject(e);
                }
            );
            return deferred.promise;        
        },
        self.GetEmergencyDictItems = function(){

            var deferred = $q.defer();

            Data.MstEmergencyItemDict.GETEmergencyDictItems(
                function (s) {
                    deferred.resolve(s);
                },
                function (e) {
                    deferred.reject(e);
                }
            );
            return deferred.promise;        
        }
        return self;
    }])
  ///////////////////////////////////////////////-----end


//NFC XJZ
.factory('nfcService', function ($rootScope, $ionicPlatform,$ionicPopup,$ionicLoading,$state,Storage) {

    var openPop = function(){
      $ionicPopup.show({
        title: '<center>发现NFC卡片</center>',
        template: '卡片信息为空，新建患者？',
        //subTitle: '2',
        scope: $rootScope,
        buttons: [
          {
            text: '确定',
            type: 'button-assertive',
            onTap: function(e) {
                $state.go('newPatient');
            }
          },{ text: '取消',
              type: 'button-calm',
            onTap: function(e) {}
          }
        ]
      });      
    }
    var writeTag = function(){
      nfc.write(
        [$rootScope.recordToWrite], 
        function () {
            $rootScope.recordToWrite='';
            $rootScope.NFCmodefy=false;
            $ionicLoading.hide();
            $ionicLoading.show({template:'NFC卡片写入成功',noBackdrop:true,duration:1000});
            $state.go('injury');
        }, 
        function (reason) {
            $ionicLoading.hide();
            $ionicPopup.show({
              title: '<center>操作失败</center>',
              template: '请重新写入信息至NFC卡片',
              //subTitle: '2',
              scope: $rootScope,
              buttons: [
                {
                  text: '确定',
                  type: 'button-assertive',
                  onTap: function(e) {
                  }
                }
              ]
            });
            //navigator.notification.alert(reason, function() {}, "There was a problem");
            // console.log(reason);
        }
      );
    }
    var start = function() {
        nfc.addNdefListener(function (nfcEvent) {
            if(Storage.get('MY_LOCATION') == undefined){
              $ionicLoading.show({template:'请先登录，并提交位置',noBackdrop:true,duration:2000});
            }else if($rootScope.eraseCard == true){
              nfc.erase(function(){
                $ionicLoading.hide();
                $ionicLoading.show({template:'NFC卡片擦除成功',noBackdrop:true,duration:2000});
                $rootScope.eraseCard=false;
              },function(){});
            }else{
              console.log(JSON.stringify(nfcEvent, null, 4));
              console.log(nfcEvent);
              $rootScope.$apply(function(){
                  //angular.copy(nfcEvent.tag, tag);
                  if(!$rootScope.NFCmodefy && (typeof(nfcEvent.tag.ndefMessage) === 'undefined' || nfcEvent.tag.ndefMessage[0].id=='')){
                    openPop();
                  }else if(!$rootScope.NFCmodefy){
                    var temp= new Array();
                    temp = nfc.bytesToString(nfcEvent.tag.ndefMessage[0].id).split("|");//取出相应数据
                    //var pid=temp[0];
                    //var visit=temp[1];
                    Storage.set('PatientID',temp[0]);
                    Storage.set('VisitNo',temp[1]);
                    if(Storage.get('RoleCode') == 'EmergencyPersonnel') $state.go('visitInfo');
                    else  $state.go('viewEmergency');
                    
                  }
              });
              if($rootScope.NFCmodefy && $rootScope.recordToWrite!=undefined && $rootScope.recordToWrite!=''){
                //写信息
                writeTag();
              }              
            }
        }, function () {
            console.log("Listening for any tag type.");
        }, function (reason) {
            alert("Error adding NFC Listener " + reason);
        });
        
        nfc.addTagDiscoveredListener(function (nfcEvent) {
            console.log(JSON.stringify(nfcEvent, null, 4));
            console.log(nfcEvent);
            if(Storage.get('MY_LOCATION') == undefined){
              $ionicLoading.show({template:'请先登录，并提交位置',noBackdrop:true,duration:2000});
            }else if($rootScope.NFCmodefy && $rootScope.recordToWrite!=undefined && $rootScope.recordToWrite!=''){
              writeTag();
            }else{
              var record = ndef.record(ndef.TNF_MIME_MEDIA, "", "", "");
              nfc.write(
                [record], 
                function () {
                  openPop();                       
                }, 
                function (reason) {
                  // console.log(reason);
                }
              );              
            }
        }, function () {
            console.log("Listening for any tag type.");
        }, function (reason) {
            alert("Error adding NFC Listener " + reason);
        });
    }

    return {
      start,
    };
})

//后送
.factory('Evacation', function ($rootScope, $ionicPlatform,$ionicPopup,$ionicLoading,$state,Storage) {
  
})
//分诊
;
