
angular.module('controllers', ['ionic','ngResource','services'])

// --------登录、注册、修改密码、位置选择、个人信息维护 [熊嘉臻]----------------
//登录
.controller('SignInCtrl',['$state','$scope','$ionicLoading','UserInfo','Storage',function($state,$scope,$ionicLoading,UserInfo,Storage){
  $scope.account = {UserID:'',password:''};
  if(Storage.get('USERID')){
    $scope.account.UserID=Storage.get('USERID')
  }
  $scope.signIn = function(account){
    $scope.logStatus="";
    if(account.UserID!='' && account.password!=''){
      if(UserInfo.isPasswdValid(account.password)){
        $ionicLoading.show();
        UserInfo.LogOn(account.UserID,account.password)
        .then(function(data){
          if(data.Result==1){
            $ionicLoading.hide();
            $ionicLoading.show({template:'登录成功',noBackdrop:true,duration:1500});
            Storage.set('RoleCode',data.RoleCode);
            Storage.set('PASSWD',account.password);
            Storage.set('USERID',account.UserID);
            $state.go('location');
          }else{
            $ionicLoading.hide();
            $scope.logStatus="登录失败";
          }
        },function(err){
          $ionicLoading.hide();
          $scope.logStatus="登录失败，网络问题";
        });
      }else{
        $scope.logStatus="密码不符合要求"
      }
    }else{
      $scope.logStatus="请完整填写登录信息"
    }
  }
  var t={'DivideLeader':'分流组长','DividePersonnel':'分流人员','EmergencyPersonnel':'急救人员'};
  Storage.set("DictRoleMatch",JSON.stringify(t));
  $scope.toRegister = function(){
    $state.go('register');
  }
}])
//注册 
.controller('RegisterCtrl',['$ionicLoading','$state','$scope','$rootScope','$ionicHistory','UserInfo','Storage',function($ionicLoading,$state,$scope,$rootScope,$ionicHistory,UserInfo,Storage){
  var DictRoles=JSON.parse(Storage.get('DictRoleMatch'));//DictRoleMatch在signinCtrl初始化
  $scope.register={UserId:'',LoginPassword:'' ,LoginPassword0:'',UserName:"",role:"", Occupation: "", Position: "",Affiliation: ""};
  $scope.Register = function(form){
    $scope.logStatus="";
    console.log(form)
    if(form.UserId!='' && form.LoginPassword!='' && form.LoginPassword0!='' && form.UserName!='' && form.role!=''){
      if(form.Occupation=='')form.Occupation=' ';
      if(form.Position=='')form.Position=' ';
      if(form.Affiliation=='')form.Affiliation=' ';
      if(form.LoginPassword!=form.LoginPassword0){
        $scope.logStatus="两次密码的输入不一致";
        return;
      }
      if(UserInfo.isPasswdValid(form.LoginPassword)){
        $ionicLoading.show();
        var sendData={
          "UserId": "",
          "RoleCode": "",
          "UserName": "",
          "Occupation": "",
          "Position": "",
          "Affiliaation": "",
          "LoginPassword": ""
        }
        angular.forEach(DictRoles,function(value,key){
          if(form.role==value){
            form.RoleCode = key;
          }
        });         
        delete form['role'];
        delete form['LoginPassword0'];
        angular.forEach(form,function(value,key){
          sendData[key]=value;
        });          
        UserInfo.UserRegister(sendData)
        .then(function(data){
          $ionicLoading.hide();
          $ionicLoading.show({template:'注册成功',noBackdrop:true,duration:1500})
          Storage.set('RoleCode',sendData.RoleCode);
          Storage.set('USERID',sendData.UserId);
          Storage.set('PASSWD',sendData.LoginPassword);
          $state.go('location');
        },function(err){
          $ionicLoading.hide();
          $scope.logStatus=err.data.result;
        });
      }else{
        $scope.logStatus="密码格式不符合要求"
      }      
    }else{
      $scope.logStatus="请输入完整信息！"
    }      
  }
  $scope.onClickBackward = function(){
    $ionicHistory.goBack();
  }  
}])
//设置密码
.controller('SetPasswordCtrl',['$scope','$state','$ionicHistory','$ionicLoading','Storage','UserInfo', function($scope, $state,$ionicHistory,$ionicLoading,Storage,UserInfo){
  $scope.ishide=false;
  $scope.change={oldPassword:"",newPassword:"",confirmPassword:""};
  $scope.passwordCheck = function(change){
    if(change.oldPassword){
      if(UserInfo.isPasswdValid(change.oldPassword)){
        $ionicLoading.show();
        UserInfo.LogOn(Storage.get('USERID'),change.oldPassword)
        .then(function(data){
          $ionicLoading.hide();
          $ionicLoading.show({template:'密码验证成功',noBackdrop:true,duration:1500})
          $scope.ishide=true; 
        },function(err){
          $ionicLoading.hide();
          $scope.logStatus1="验证失败";
        });
      }else{
        $scope.logStatus1="密码格式不符合要求";
      }    
    } 
  }

  $scope.gotoChange = function(change){
    $scope.logStatus2='';
    if((change.newPassword!="") && (change.confirmPassword!="")){
      if(change.newPassword == change.confirmPassword){
        if(UserInfo.isPasswdValid(change.newPassword)){
          $ionicLoading.show();
          UserInfo.ChangePassword(Storage.get('USERID'),change.oldPassword,change.newPassword)
          .then(function(data){
            $ionicLoading.hide();
            Storage.set('PASSWD',change.newPassword);
            $ionicLoading.show({template:'修改成功',noBackdrop:true,duration:1500})
            $state.go('ambulance.mine');
          },function(err){
            $ionicLoading.hide();
            $scope.logStatus2="修改失败，网络错误";
          })
        }else{
          $scope.logStatus2="密码格式不符合要求";
        }
      }else{
        $scope.logStatus2="两次输入的密码不一致";
      }
    }else{
      $scope.logStatus2="请输入两遍新密码"
    }
  }
  $scope.onClickBackward = function(){
    $ionicHistory.goBack();
  }
}])
//我的位置
.controller('LocationCtrl',['$ionicLoading','$state','$scope','$rootScope','UserInfo','Storage',function($ionicLoading,$state,$scope,$rootScope,UserInfo,Storage){
  var MY_LOCATION;
  $scope.myLocation={Description:""};
  $scope.locationList=[];
  UserInfo.GetMstType('Place')
  .then(function(data){
    Storage.set("PlaceList",JSON.stringify(data));
    $scope.locationList=data;
  },function(err){

  })
  $scope.navFlag=false;
  $scope.$on('$ionicView.enter', function() {
    MY_LOCATION = Storage.get('MY_LOCATION');
    if(MY_LOCATION == undefined){
      $scope.isListShown=true;
    }else{
      $scope.myLocation.Description=MY_LOCATION;
      $scope.isListShown=false;
      $scope.navFlag=true;
    }   
  });

  $scope.toggleList = function(){
    $scope.isListShown=!$scope.isListShown;
  }
  $scope.isIconShown = function(){
    return $scope.isListShown?true:false;
  }
  
  // for(var i =0;i<5;i++){
  //   $scope.locationList.push({text:''+i,value:i+'value'});
  // }   
  $scope.setLocation = function(){
    if($scope.myLocation.Description ==''){
      $ionicLoading.show({
         template: "请选择位置",
         noBackdrop: true,
         duration: 700,
        });
      return;
    }

    $ionicLoading.show();
    var t;
    for(var i in $scope.locationList){
      if($scope.myLocation.Description == $scope.locationList[i].Description){
        t=$scope.locationList[i].Category + '|' + $scope.locationList[i].Type;
      }
    }
    UserInfo.SetMobileDevice({DeviceID:Storage.get('UUID'),Location:t,UserId:Storage.get('USERID'),DeviceFlag:1})
    .then(function(data){
      Storage.set('MY_LOCATION',$scope.myLocation.Description);
      Storage.set('MY_LOCATION_CODE',t);
      $scope.isListShown=false;
      $ionicLoading.hide();
      $ionicLoading.show({template:'位置已更新',noBackdrop:true,duration:1500});
      if($scope.navFlag){
        $state.go('ambulance.mine');
      }else{
        $state.go('ambulance.list');
      }      
    },function(err){
      $ionicLoading.hide();
      $ionicLoading.show({template:'更新位置出错',noBackdrop:true,duration:3000});
    })

  }

  $scope.onClickBackward = function(){
      $scope.isListShown=false;
      $scope.myLocation.Description=MY_LOCATION;
      $state.go('ambulance.mine');
  }
}])
//设置-退出
.controller('SettingCtrl',['$ionicLoading','$state','$scope','$ionicPopup','$timeout','$ionicHistory','$rootScope','Storage',function($ionicLoading,$state,$scope,$ionicPopup,$timeout,$ionicHistory,$rootScope,Storage){
  $scope.$on('$ionicView.enter', function() {
    $scope.myLocation=Storage.get('MY_LOCATION');
    // $scope.isListShown=false;
    $scope.userInfo={"userid":Storage.get("USERID"), role:Storage.get("RoleCode")};
  });
  //获取医生基本信息
  $scope.logOutConfirm = function(){
    var myPopup = $ionicPopup.show({
      template: '<center>确定要退出登录吗?</center>',
      title: '退出',
      //subTitle: '2',
      scope: $scope,
      buttons: [
        {
          text: '确定',
          type: 'button-assertive',
          onTap: function(e) {
            var USERID=Storage.get('USERID');
            var UUID=Storage.get('UUID');
            Storage.clear();
            Storage.set('USERID',USERID);
            Storage.set('UUID',UUID);
            $timeout(function(){
              $ionicHistory.clearHistory();
              $ionicHistory.clearCache();
              $state.go('signIn');
            },100);
          }
        },{ text: '取消',
            type: 'button-calm',
          onTap: function(e) {}
        }
      ]
    });    
  }
  // $scope.eraseCard = function(){
  //   $rootScope.eraseCard=true;
  //   $ionicLoading.show({template:'请将手机靠近NFC卡片'});
  // }  
}])

//个人信息维护
.controller('myProfileCtrl',['$state','$scope','$ionicHistory','$ionicLoading','UserInfo','Storage',function($state,$scope,$ionicHistory,$ionicLoading,UserInfo,Storage){
  var DictRoles=JSON.parse(Storage.get('DictRoleMatch'));
  // var temp={};
  // $scope.$on('$ionicView.enter', function(){
  //   if(temp){
  //     $scope.$apply(function(){
  //       $scope.profile = temp;
  //     })
  //   }
  // });
  $scope.profile={UserName:'',role:'',Occupation:'',Position:'',Affiliation:''};
  $scope.upload = function(profile){
    $ionicLoading.show();
    angular.forEach(DictRoles,function(value,key){
      if(profile.role==value){
        profile.RoleCode = key;
      }
    });
    UserInfo.ModifyUserInfo(Storage.get('USERID'),profile.RoleCode,profile.UserName,profile.Occupation,profile.Position,profile.Affiliation)
    .then(function(data){
      $ionicLoading.hide();
      // temp={UserName:profile.UserName,role:profile.role,Occupation:profile.Occupation,Position:profile.Position,Affiliation:profile.Affiliation};
      $ionicLoading.show({template:'修改成功',noBackdrop:true,duration:1500});
    },function(err){
      $scope.logStatus="修改失败";
    })    
  }
  $ionicLoading.show();
  UserInfo.GetModifyUserInfo(Storage.get('USERID'))
  .then(function(data){
    $ionicLoading.hide();
    angular.forEach(DictRoles,function(value,key){
      if(data.RoleCode == key){
        data.role=value;
      }
    })
    if(data.Occupation==' ')data.Occupation='';
    if(data.Position==' ')data.Position='';
    if(data.Affiliation==' ')data.Affiliation='';
    delete data['RoleCode'];
    // temp = data;
    $scope.profile = data;
  },function(err){
    $ionicLoading.hide();
  });
}])

// --------急救人员-列表、新建、后送 [赵艳霞]----------------
//病人列表(已接收、已后送、已送达)
.controller('AmbulanceListCtrl',['$state','$scope','$ionicLoading','UserInfo','Storage','PatientVisitInfo', '$state','Common', '$ionicPopup', '$stateParams', 'Popup', function($state,$scope,$ionicLoading,UserInfo,Storage, PatientVisitInfo, $state, Common, $ionicPopup, $stateParams, Popup){
  $scope.$on('$ionicView.enter', function() {
    $scope.refreshList();
  });
  // 批量处理
  $scope.isshown = function(){
    if ((Storage.get('RoleCode')=='DivideLeader')&&($scope.curtab=="tab3")) {
      return true;
    };
  };
  $scope.show = {showDelete:false};
  $scope.select = function(item) {
    item.itemClass = !item.itemClass;
  };
  $scope.triagegroup = function(){
    var i=0;
    $scope.patientlist_triage = [];
    // 将选中的病人放到一个数组里
    angular.forEach($scope.PatientList, function(data){
      if(data.itemClass==true){
        $scope.patientlist_triage[i] = {"PatientID":data.PatientID, "VisitNo":data.VisitNo};
        i++;
      };
    });
    console.log($scope.patientlist_triage);
    Popup.triagePopup("group", $scope);
  };

  //根据状态获取不同列表，并控制显示
  $scope.GetPatientsbyStatus = function(Status)
  {
      var promise = PatientVisitInfo.GetPatientsbyStatus(Status); 
      promise.then(function(data)
      { 
         for(var i=0;i<data.length;i++){
          data[i].itemClass=false;
         }
         $scope.PatientList = data;
         $scope.$broadcast('scroll.refreshComplete'); 
        },function(err) {   
      }); 
      // console.log($scope.PatientList);     
  }

  //不同角色，列表跳转不同
  $scope.setCurrent = function(item) {
    Storage.set("PatientID", item.PatientID);  
    Storage.set("VisitNo", item.VisitNo);
    Storage.set("PatientName", item.PatientName);
    if(Storage.get('RoleCode')=='EmergencyPersonnel')  {
      if($scope.curtab=="tab1"){
        $state.go('visitInfo'); 
      }  
      else {} //$state.go('viewEmergency'); 
    }
    else {
      if($scope.curtab=="tab3"){
        $state.go('viewEmergency'); 
      }
    }
  };

  //长按控制
  $scope.onHold = function(item) {
     if( (Storage.get('RoleCode')!='EmergencyPersonnel')  && ($scope.curtab=="tab2") ) {
        //送达
        var ArriveDateTime = Common.DateTimeNow().fullTime;
        // console.log(ArriveDateTime);

        var Popup_Arrive = $ionicPopup.show({
          template : '伤员 '+item.PatientID+' 于 '+ArriveDateTime+' 送达 '+Storage.get('MY_LOCATION'),
          scope : $scope,
          title : '送达' ,
          buttons : [
            { text:'确定',
              type:'button-assertive',
              onTap: function(){
              // 插入病人送达信息
              var promise = PatientVisitInfo.UpdateArrive(item.PatientID, item.VisitNo, "3", ArriveDateTime, Storage.get('MY_LOCATION_CODE'));
              promise.then(function(data){
                if(data.result=="数据插入成功"){
                  $scope.GetPatientsbyStatus(2);
                  $ionicLoading.show({
                    template: '送达成功',
                    duration:1000
                  });
                  // $state.go('Injurylist');
                }
              }, function(err){
                // 无错误处理
              });
              }
            },{ text:'取消' ,
              type:'button-positive'
            }
          ]
        });

     }
  };

  //tab选中的控制
  //默认显示 初始化与角色权限相关
  if(Storage.get('RoleCode')=='EmergencyPersonnel'){    
      $scope.tab1_checked=true;  
       $scope.tab2_checked=false;  
       $scope.tab3_checked=false;  
       $scope.curtab="tab1";  
       $scope.tab1_color={color:'blue'};   
       $scope.tab2_color="";  
       $scope.tab3_color="";  
       $scope.GetPatientsbyStatus(1);
       $scope.newPatientIcon=true;  
   }
   else if(Storage.get('RoleCode')=='DividePersonnel'){
       $scope.tab1_checked=false;  
       $scope.tab2_checked=true;  
       $scope.tab3_checked=false;  
       $scope.curtab="tab2";  
       $scope.tab1_color="";   
       $scope.tab2_color={color:'blue'};  
       $scope.tab3_color="";  
       $scope.GetPatientsbyStatus(2);
       $scope.newPatientIcon=false; 
   }
   else{
       $scope.tab1_checked=false;  
       $scope.tab2_checked=false;  
       $scope.tab3_checked=true;  
       $scope.curtab="tab3";  
       $scope.tab1_color="";   
       $scope.tab2_color="";  
       $scope.tab3_color={color:'blue'};  
       $scope.GetPatientsbyStatus(3);
       $scope.newPatientIcon=false; 
   }

 //tab切换列表 显示或隐藏
 $scope.sel_tab = function(vtab) {  
   if($scope.curtab!=vtab) 
   {
    if(vtab=="tab1")  $scope.GetPatientsbyStatus(1);
    else if(vtab=="tab2")  $scope.GetPatientsbyStatus(2);
    else  $scope.GetPatientsbyStatus(3);
   }

   if(vtab=="tab1"){ 
          $scope.tab1_checked=true;  
          $scope.tab2_checked=false;  
          $scope.tab3_checked=false;  
          $scope.curtab="tab1";  
          $scope.tab1_color={color:'blue'};  
          $scope.tab2_color="";  
          $scope.tab3_color=""; 
          $scope.show.showDelete=false;                  
   }
   else if (vtab=="tab2"){  
          $scope.tab1_checked=false;  
          $scope.tab2_checked=true;  
          $scope.tab3_checked=false;  
          $scope.curtab="tab2";  
          $scope.tab1_color="";  
          $scope.tab2_color={color:'blue'};  
          $scope.tab3_color="";  
          $scope.show.showDelete=false;               
   }
   else if (vtab=="tab3"){  
          $scope.tab1_checked=false;  
          $scope.tab2_checked=false;  
          $scope.tab3_checked=true;  
          $scope.curtab="tab3";  
          $scope.tab1_color="";  
          $scope.tab2_color="";  
          $scope.tab3_color={color:'blue'}; 
          $scope.show.showDelete=false;                 
   }  
     
  };
  
  //下拉刷新
  $scope.refreshList = function() { 
    if($scope.curtab=="tab1")  $scope.GetPatientsbyStatus(1);
    else if($scope.curtab=="tab2")  $scope.GetPatientsbyStatus(2);
    else  $scope.GetPatientsbyStatus(3);
  };

}])

//新建PID
.controller('NewPatientCtrl', ['$scope', '$ionicHistory' ,'PatientInfo','MstType','$ionicLoading','$ionicPopup','Storage','$state', function ($scope, $ionicHistory,PatientInfo,MstType,$ionicLoading,$ionicPopup,Storage,$state) {

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }; 

  var GetDefault =function(){    
    Storage.set("PatientID","");  
    Storage.set("VisitNo","");
    $scope.NewPatientID={"PatientID":""};

    var promise_NewPatient = PatientInfo.GetNewPatientID();  //获取推荐PID
     promise_NewPatient.then(function(data)
     { 
       $scope.NewPatientID.PatientID= data.PatientID;
       
      },function(err) {   
     }); 

     // 获取血型类型
     var promise_BloodType = MstType.GetMstType('BloodType');
     promise_BloodType.then(function(data)
     { 
       $scope.BloodTypes = data;
       },function(err) {   
     });      

     //获取性别
     var promise_Gender = MstType.GetMstType('Gender');
     promise_Gender.then(function(data)
     { 
       $scope.Genders = data;
      },function(err) {   
    });      
        
    //获取部别
     var promise_Troop = MstType.GetMstType('Troop');
     promise_Troop.then(function(data)
     { 
       $scope.Troops = data;
      },function(err) {   
    });      
     
     //获取职位
     var promise_JOB = MstType.GetMstType('JOB');
     promise_JOB.then(function(data)
     { 
       $scope.JOBs = data;
      },function(err) {   
    });      
  
     //获取头衔
     var promise_Rank = MstType.GetMstType('Rank');
     promise_Rank.then(function(data)
     { 
       $scope.Ranks = data;
      },function(err) {   
    }); 
  }
    
  GetDefault(); //加载页面默认参数  
  //$scope.BasicInfo={DOB:Date()};
  
  //检查新建的PID是否重复,不重复则弹出确认框
  $scope.SaveNewPatientID = function() {
    if($scope.NewPatientID.PatientID==""){
      $ionicLoading.show({
        template: "病人ID不能为空",
        noBackdrop: true,
        duration: 1000,
      });
    }
    else{
      var promise_CheckPatientID = PatientInfo.CheckPatientID( $scope.NewPatientID.PatientID);
      promise_CheckPatientID.then(function(data)
       { 
           
          if(data.result=="病人Id不存在"){
             //showConfirm();
             if($scope.BasicInfo.DOB) $scope.birthcheck='';
             setPatientInfo();
          }
          else{
            $ionicLoading.show({
              template: "该病人ID已存在，请重新输入",
              noBackdrop: true,
              duration: 1000,
            });
          }
        },function(err) {   
      }); 
    } //else end
  }  

   //将生日转化为年龄
    var  jsGetAge=function(strBirthday)
    {       
        $scope.BasicInfo.Age;
        if(strBirthday=="")
          {  
            $scope.BasicInfo.Age=""
            }else
            {

        var strBirthdayArr=strBirthday;
        var birthYear = strBirthday.getFullYear();
        var birthMonth = strBirthday.getMonth()+1;
        var birthDay = strBirthday.getDate();
      
        d = new Date();
        var nowYear = d.getFullYear();
        var nowMonth = d.getMonth() + 1;
        var nowDay = d.getDate();
    
        if(nowYear == birthYear)
        {
            $scope.BasicInfo.Age = 0;//同年 则为0岁
        }
        else
        {
            var ageDiff = nowYear - birthYear ; //年之差
            if(ageDiff > 0)
            {
                if(nowMonth == birthMonth)
                {
                    var dayDiff = nowDay - birthDay;//日之差
                    if(dayDiff < 0)
                    {
                        $scope.BasicInfo.Age = ageDiff - 1;
                    }
                    else
                    {
                        $scope.BasicInfo.Age = ageDiff ;
                    }
                }
                else
                {
                    var monthDiff = nowMonth - birthMonth;//月之差
                    if(monthDiff < 0)
                    {
                        $scope.BasicInfo.Age = ageDiff - 1;
                    }
                    else
                    {
                        $scope.BasicInfo.Age = ageDiff ;
                    }
                }
            }
            else
            {
                $scope.BasicInfo.Age = '';//返回-1 表示出生日期输入错误 晚于今天
            }
        }


        return $scope.BasicInfo.Age;//返回周岁年龄 
      }

    }
   $scope.BasicInfo={}; //提交的容器初始化
   //患者基本信息插入
   var setPatientInfo = function() {
      $scope.BasicInfo.DOB =new Date($scope.BasicInfo.DOB);
      var sendData = {
          "PatientID": $scope.NewPatientID.PatientID,
          "PatientName": $scope.BasicInfo.PatientName,
          "Gender":  $scope.BasicInfo.Gender,
          "Age": jsGetAge($scope.BasicInfo.DOB),
          "DOB": $scope.BasicInfo.DOB,
          "BloodType": $scope.BasicInfo.BloodType,
          "Allergy": $scope.BasicInfo.Allergy,
          "ImageID": $scope.BasicInfo.ImageID,
          "TroopType": $scope.BasicInfo.Troop,
          "Job": $scope.BasicInfo.JOB,
          "Rank": $scope.BasicInfo.Rank,
          'UserID':'',
          'TerminalName':"",
          "TerminalIP": ""
        }
      var promise =  PatientInfo.SetPatientInfo(sendData);
      promise.then(function(data){ 
            
            if(data.result=="数据插入成功"){
              Storage.set("PatientID", $scope.NewPatientID.PatientID); //Storage存入PatientID
              Storage.set("PatientName", $scope.BasicInfo.PatientName);
              $ionicLoading.show({
                 template: "保存PatientID成功",
                 noBackdrop: true,
                duration: 1000,
              });
              $state.go('newVisit');
            }//if end 
          },function(err) {  
             $ionicLoading.show({
               template:"保存PatientID失败" , //err.data.result
               noBackdrop: false,
               duration: 1000,
               hideOnStateChange: true
             }); 
      }); //promise end
   }
                  
}])

//新建VID
.controller('NewVisitCtrl', ['$rootScope','$timeout','$scope', '$ionicHistory', '$http','$ionicPopup' ,'PatientVisitInfo', '$ionicLoading','MstType','Storage','PatientInfo', 'Common', 'MstEva','$state' ,'Evacation',function ($rootScope,$timeout,$scope, $ionicHistory,$http,$ionicPopup,PatientVisitInfo, $ionicLoading,MstType,Storage, PatientInfo, Common, MstEva, $state,Evacation) {

  //写入信息
  $rootScope.isWritedToCard = false;
  var VNo,PID;
  $scope.wirteToCard = function(){
    $scope.saveVisitInfo(false);
  }

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

  $scope.goInjury = function() {
    // if(!$rootScope.isWritedToCard){
    //   $ionicLoading.show({template: '请先将信息写入NFC卡片', noBackdrop: true, duration: 1000});
    //   return;
    // } 
    if( (Storage.get("VisitNo")!='') && (Storage.get("PatientID")!='')){
       Storage.set("New", 1);
       $state.go('injury');
    }
    else
    {
        $ionicLoading.show({
           template: '请先保存就诊记录',
           noBackdrop: false,
           duration: 1000,
           hideOnStateChange: true
        });
    }
    
  };
  
  //获取推荐VID
  var GetNewVisitNo= function(patientID)
  {
     var promise = PatientVisitInfo.GetNewVisitNo(patientID); 
     promise.then(function(data)
     { 
        $scope.NewVisitNo = data;
        if(PID!=Storage.get("PatientID") || VNo!=$scope.NewVisitNo){
          $rootScope.isWritedToCard = false;
          PID=Storage.get("PatientID");VNo=$scope.NewVisitNo;
        }
        },function(err) {   
     });      
  }

  //获取病人基本信息
  var GetPsPatientInfo= function(strPatientID)
  {
     var promise = PatientInfo.GetPsPatientInfo(strPatientID); 
     promise.then(function(data)
     { 
       $scope.Patient = data;
      },function(err) {   
    });      
  }

  //获取病人基本信息
  $scope.$on('$ionicView.enter', function() { 
      GetNewVisitNo(Storage.get("PatientID"));
      //$scope.Patient = {"PatientID":Storage.get("PatientID"), "PatientName":Storage.get("PatientName")};
      GetPsPatientInfo(Storage.get("PatientID")); 
  }); 

  $scope.visitInfo={"InjuryArea": "", "InjuryDateTime": new Date(Common.DateTimeNow().fullTime), "VisitDateTime": new Date(Common.DateTimeNow().fullTime)};

  //保存
  $scope.saveVisitInfo = function(Type) {
    if(Type && !$rootScope.isWritedToCard){
      $ionicLoading.show({template: '请先将信息写入NFC卡片', noBackdrop: true, duration: 1000});
      return;
    }
    $ionicLoading.show();
    var sendData = {
                  "PatientID": Storage.get("PatientID"),
                  "VisitNo":  $scope.NewVisitNo.VisitNo,
                  "Status": "1",
                  "DeviceID": "",  //暂时留空
                  "InjuryArea": $scope.visitInfo.InjuryArea, 
                  "InjuryAreaGPS": "",
                  "InjuryDateTime":Common.DateTimeNow($scope.visitInfo.InjuryDateTime).fullTime, //"9999-12-31 23:59:59"
                  "VisitDateTime": Common.DateTimeNow($scope.visitInfo.VisitDateTime).fullTime, //"2016-03-07 19:07:19"
                  "EvaDateTime": new Date("9999-12-31 23:59:59"),
                  "EvaBatchNo": "",
                  "EvaDestination": "",
                  "EvaTransportation": "",
                  "EvaPosition": "",
                  "ArriveDateTime": new Date("9999-12-31 23:59:59"),
                  "ArrivePlace": "",
                  "TriageDateTime": new Date("9999-12-31 23:59:59"),
                  "TriageToDept": "",
                  "UnitCode": "",
                  "UserID": "",
                  "TerminalName": "",
                  "TerminalIP": ""
                }
              //console.log(sendData);
              var promise =  PatientVisitInfo.SetPsPatientVisitInfo(sendData);
              promise.then(function(data){ 
                  $ionicLoading.hide();
                  if(data.result=="数据插入成功")
                  {
                   if(($scope.visitInfo.InjuryDateTime!='')&&($scope.visitInfo.VisitDateTime!='')){
                    
                      //Storage存入VisitNo
                      Storage.set("VisitNo",$scope.NewVisitNo.VisitNo); 
                      if(Type){
                        $ionicLoading.show({template: "保存VisitNo成功", noBackdrop: true, duration: 700});
                      }else{
                        //写入NFC卡
                        $rootScope.NFCmodefy=true;
                        var record = ndef.encodemifareMessage(Storage.get("PatientID"));
                        $rootScope.recordToWrite=record;
                        $ionicLoading.show({template:'信息写入,请将设备靠近NFC卡片'});              
                      }
                  }else
                  {
                   $ionicLoading.show({template: "保存VisitNo失败", noBackdrop: true, duration: 700});
                  }
                    }
                },function(err) {  
                   $ionicLoading.show({
                      template: "保存VisitNo失败",
                     noBackdrop: false,
                     duration: 1000,
                     hideOnStateChange: true
                   }); 
              });  
  };
     
  //后送选择框         
    $scope.showreservePop = function() {
      // if(!$rootScope.isWritedToCard){
      //   $ionicLoading.show({template: '请先将信息写入NFC卡片', noBackdrop: true, duration: 1000});
      //   return;
      // }
     var myPopup = Evacation.getPopup($scope);
     myPopup.then(function(res) {
     console.log('haha',res);
   });
  };

}])

//查看或编辑病人基本信息
.controller('PatientInfoCtrl', ['$scope', '$ionicHistory' ,'PatientInfo','MstType','$ionicLoading','$ionicPopup','Storage','$state', function ($scope, $ionicHistory,PatientInfo,MstType,$ionicLoading,$ionicPopup,Storage,$state) {

  $scope.goBack = function() {
    $ionicHistory.goBack();
  }; 

  //获取下拉框选项
  var GetDefault =function(){    

     // 获取血型类型
     var promise_BloodType = MstType.GetMstType('BloodType');
     promise_BloodType.then(function(data)
     { 
       $scope.BloodTypes = data;
       },function(err) {   
     });      

     //获取性别
     var promise_Gender = MstType.GetMstType('Gender');
     promise_Gender.then(function(data)
     { 
       $scope.Genders = data;
      },function(err) {   
    });      
        
    //获取部别
     var promise_Troop = MstType.GetMstType('Troop');
     promise_Troop.then(function(data)
     { 
       $scope.Troops = data;
      },function(err) {   
    });      
     
     //获取职位
     var promise_JOB = MstType.GetMstType('JOB');
     promise_JOB.then(function(data)
     { 
       $scope.JOBs = data;
      },function(err) {   
    });      
  
     //获取头衔
     var promise_Rank = MstType.GetMstType('Rank');
     promise_Rank.then(function(data)
     { 
       $scope.Ranks = data;
      },function(err) {   
    }); 
  }
    
  GetDefault(); //加载页面默认参数     
  
  $scope.BasicInfo={};
  var  jsGetAge=function(strBirthday)
    {       
        $scope.BasicInfo.Age;
        var strBirthdayArr=strBirthday;
        var birthYear = strBirthday.getFullYear();
        var birthMonth = strBirthday.getMonth()+1;
        var birthDay = strBirthday.getDate();
    
        d = new Date();
        var nowYear = d.getFullYear();
        var nowMonth = d.getMonth() + 1;
        var nowDay = d.getDate();
    
        if(nowYear == birthYear)
        {
            $scope.BasicInfo.Age = 0;//同年 则为0岁
        }
        else
        {
            var ageDiff = nowYear - birthYear ; //年之差
            if(ageDiff > 0)
            {
                if(nowMonth == birthMonth)
                {
                    var dayDiff = nowDay - birthDay;//日之差
                    if(dayDiff < 0)
                    {
                        $scope.BasicInfo.Age = ageDiff - 1;
                    }
                    else
                    {
                        $scope.BasicInfo.Age = ageDiff ;
                    }
                }
                else
                {
                    var monthDiff = nowMonth - birthMonth;//月之差
                    if(monthDiff < 0)
                    {
                        $scope.BasicInfo.Age = ageDiff - 1;
                    }
                    else
                    {
                        $scope.BasicInfo.Age = ageDiff ;
                    }
                }
            }
            else
            {
                $scope.BasicInfo.Age = '';//返回-1 表示出生日期输入错误 晚于今天
            }
        }
        return $scope.BasicInfo.Age;//返回周岁年龄 
    }
  //获取已经保存的信息并展示
  var promise_PatientInfo = PatientInfo.GetPsPatientInfo(Storage.get("PatientID")); 
  promise_PatientInfo.then(function(data)
  { 
     $scope.BasicInfo = data;
    },function(err) {   
  });

   //修改患者基本信息确认框
   $scope.showConfirm = function() {
      
      $scope.confirmPopup = $ionicPopup.confirm({
         //title: '确认修改?',
         template: '<center>确定修改患者基本信息？</center>',
         scope: $scope,
         buttons: [
            {text: '确认',
             type: 'button-assertive',
           　onTap: function(e) {
               $scope.BasicInfo.DOB =new Date($scope.BasicInfo.DOB);
               sendData = {
                "PatientID": Storage.get("PatientID"),
                "PatientName": $scope.BasicInfo.PatientName,
                "Gender":  $scope.BasicInfo.Gender,
                "Age": jsGetAge($scope.BasicInfo.DOB),
                "DOB": $scope.BasicInfo.DOB,
                "BloodType": $scope.BasicInfo.BloodType,
                "Allergy": $scope.BasicInfo.Allergy,
                "ImageID": $scope.BasicInfo.ImageID,
                "TroopType": $scope.BasicInfo.Troop,
                "Job": $scope.BasicInfo.JOB,
                "Rank": $scope.BasicInfo.Rank,
                'UserID':$scope.BasicInfo.UserID,
                'TerminalName':"",
                "TerminalIP": ""
              }
             
            var promise =  PatientInfo.SetPatientInfo(sendData);
            promise.then(function(data){
                  //$scope.BasicInfo.DOB =new Date($scope.BasicInfo.DOB);
                  if(data.result=="数据插入成功"){
                   
                    Storage.set("PatientName", $scope.BasicInfo.PatientName);
                    
                    $ionicLoading.show({
                       template: "患者基本信息修改成功",
                       noBackdrop: true,
                      duration: 1000,
                    });

                  }//if end 
                },function(err) {  
                   $ionicLoading.show({
                     template:"保存失败" , //err.data.result
                     noBackdrop: false,
                     duration: 1000,
                     hideOnStateChange: true
                   }); 
            }); //promise end
          } //onTap end
        },{
            text: '取消',
            type: 'button-positive',
         }]
      });
   }
                   
}])

//查看或编辑病人就诊记录
.controller('VisitInfoCtrl', ['$rootScope','$scope', '$ionicHistory', '$http','$ionicPopup' ,'PatientVisitInfo', '$ionicLoading','MstType','Storage','PatientInfo','Common', '$state', 'MstEva','Evacation' ,function ($rootScope,$scope, $ionicHistory,$http,$ionicPopup,PatientVisitInfo, $ionicLoading,MstType,Storage, PatientInfo, Common, $state, MstEva,Evacation) {

  $scope.goBack = function() {
    $ionicHistory.goBack();
  };
  
   $scope.goInjury = function() {
     saveVisitInfo();
     Storage.set("New", 0);
  };

  //写卡
  $scope.wirteToCard = function(){
    $rootScope.NFCmodefy=true;
    // var type = "text/pg",
    //     id = Storage.get("PatientID")+"|"+Storage.get("VisitNo"),
    //     payload = "",//暂时用不到
    //     // payload = nfc.stringToBytes("fdsf"),
    //     record = ndef.record(ndef.TNF_MIME_MEDIA, type, id, payload);
    var record = ndef.encodemifareMessage(Storage.get("PatientID"));
    $rootScope.recordToWrite=record;
    $ionicLoading.show({template:'信息写入,请将设备靠近NFC卡片'});    
  }
  //获取病人基本信息
  var GetPatientbyPID= function(strPatientID)
  {
    var promise_PatientInfo = PatientInfo.GetPsPatientInfo(Storage.get("PatientID")); 
    promise_PatientInfo.then(function(data)
    { 
        $scope.Patient = data;
      },function(err) {   
    });
  }
  //获取病人已填就诊信息
  var GetPatientVisitInfo= function(strPatientID, strVisitNo)
  {
     var promise = PatientVisitInfo.GetPatientVisitInfo(strPatientID, strVisitNo); 
     promise.then(function(data)
     { 
       $scope.visitInfo = data;
       $scope.visitInfo.InjuryDateTime =new Date($scope.visitInfo.InjuryDateTime);
       $scope.visitInfo.VisitDateTime =new Date($scope.visitInfo.VisitDateTime);
      },function(err) {   
    });      
  }

  $scope.$on('$ionicView.enter', function() { 
      GetPatientbyPID(Storage.get("PatientID")); 
      //$scope.Patient = {"PatientID":Storage.get("PatientID"), "PatientName":Storage.get("PatientName")};
      GetPatientVisitInfo(Storage.get("PatientID"), Storage.get("VisitNo"));
  }); 

  //$scope.visitInfo={"InjuryArea": "", "InjuryDateTime": new Date(), "VisitDateTime": new Date()};
  //保存确认框
  $scope.showConfirm = function() {
    $scope.confirmPopup = $ionicPopup.confirm({
           title: '确认修改?',
           //template: '请确认',
           scope: $scope,
           buttons: [
              {text: '确认',
               type: 'button-assertive',
             　onTap: function(e) {
              if(($scope.visitInfo.InjuryDateTime!='')&&($scope.visitInfo.VisitDateTime!='')){
                 
                 saveVisitInfo();
               }
            }
          },
          {
              text: '取消',
              type: 'button-positive',
          }]
    });
     
  };
  
  //保存
   var saveVisitInfo = function() {
    var sendData = {
                  "PatientID": Storage.get("PatientID"),
                  "VisitNo":  $scope.visitInfo.VisitNo,
                  "Status": "1",
                  "DeviceID": "",  //暂时留空
                  "InjuryArea": $scope.visitInfo.InjuryArea, 
                  "InjuryAreaGPS": "",
                  "InjuryDateTime": Common.DateTimeNow($scope.visitInfo.InjuryDateTime).fullTime, //"9999-12-31 23:59:59"
                  "VisitDateTime": Common.DateTimeNow($scope.visitInfo.VisitDateTime).fullTime, //"2016-03-07 19:07:19"
                  "EvaDateTime": new Date("9999-12-31 23:59:59"),
                  "EvaBatchNo": "",
                  "EvaDestination": "",
                  "EvaTransportation": "",
                  "EvaPosition": "",
                  "ArriveDateTime": new Date("9999-12-31 23:59:59"),
                  "ArrivePlace": "",
                  "TriageDateTime": new Date("9999-12-31 23:59:59"),
                  "TriageToDept": "",
                  "UnitCode": "",
                  "UserID": "",
                  "TerminalName": "",
                  "TerminalIP": ""
                }
              //console.log(sendData);
              var promise =  PatientVisitInfo.SetPsPatientVisitInfo(sendData);
              promise.then(function(data){ 
                  if(data.result=="数据插入成功"){
                      //Storage存入VisitNo
                      Storage.set("VisitNo",$scope.visitInfo.VisitNo); 
                      $ionicLoading.show({
                       template: "保存VisitNo成功",
                       noBackdrop: true,
                       duration: 700,
                      });
                  }
                },function(err) {  
                   $ionicLoading.show({
                      template: "保存VisitNo失败",
                     noBackdrop: false,
                     duration: 1000,
                     hideOnStateChange: true
                   }); 
              });  
  };

  //后送确认框         
   $scope.showreservePop = function() {
     var myPopup = Evacation.getPopup($scope);
     myPopup.then(function(res) {
     console.log('haha',res);
   });
  };

}])


// --------分流人员-列表、信息查看、分流 [张桠童]----------------
//信息查看
.controller('ViewEmergencyCtrl', ['$scope', '$ionicHistory', '$http','$ionicPopup' ,'$ionicLoading','Storage','MstType', 'PatientInfo', 'VitalSignInfo', 'EmergencyInfo','PatientVisitInfo', 'Common', 'MstDivision','Popup', function ($scope, $ionicHistory,$http,$ionicPopup, $ionicLoading, Storage, MstType, PatientInfo, VitalSignInfo, EmergencyInfo, PatientVisitInfo, Common, MstDivision, Popup) {
  
  $scope.goBack = function() {
    $ionicHistory.goBack();
  }; 

   //已后送与已送达的控制

   // 读入病人基本信息
  var promise = PatientInfo.GetPsPatientInfo(Storage.get("PatientID"));
  promise.then(function(data){
    $scope.PatientInfos = data;
        // console.log($scope.PatientInfos);
  }, function(err){
    // 无错误读入处理
  });

  // 读入病人生理体征参数信息
  var promise = VitalSignInfo.GetVitalSignInfos(Storage.get("PatientID"), Storage.get("VisitNo"));
  promise.then(function(data){
    $scope.VitalSignInfos = data;
    // console.log($scope.VitalSignInfos);
  }, function(err){
    // 无错误读入处理
  });

  // 读入病人伤情/处置信息
  var promise = EmergencyInfo.GetEmergencyInfos(Storage.get("PatientID"), Storage.get("VisitNo"));
  promise.then(function(data){
    $scope.EmergencyInfos = data;
    // console.log($scope.EmergencyInfos);
  }, function(err){
    // 无错误读入处理
  });

  // 分诊按钮
  $scope.triagealone = function(){
    Popup.triagePopup("alone", $scope);
  };
 
}])
// --------急救人员-伤情与处置 [马志彬]----------------
//伤情、处置记录
//生理参数采集
////---------------------伤情记录/处置，生理生化信息录入界面---------马志彬
.controller('InjuryCtrl', ['$scope','$http','$ionicScrollDelegate','$ionicPlatform','bleService','$rootScope','Patients','$ionicPopup','$ionicHistory','VitalSignInfo','EmergencyInfo', '$state','Storage','PatientInfo','Evacation',
  function ($scope,$http,$ionicScrollDelegate,$ionicPlatform,bleService,$rootScope,Patients,$ionicPopup,$ionicHistory,VitalSignInfo,EmergencyInfo, $state,Storage,PatientInfo,Evacation) {
  $scope.head = 'HEAD';

  //屏幕高度和宽度
  var scrollWidth = document.body.clientWidth;
  var scrollHeight = document.body.clientHeight;

    var basicinfo = {"height":"0","width":"0","top":"0","left":"0"},
      firstdirs = {"height":"0","width":"0","top":"0","left":"0"},
      seconddirs = {"height":"0","width":"0","top":"0","left":"0"}//,
      // Preview = {"height":"0","width":"0","top":"0","left":"0"};
      // console.log(scrollWidth);
    //计算四个模块的位置
    basicinfo.height = 100;
    basicinfo.top = 43;

    firstdirs.height = (scrollHeight - 190);
    firstdirs.top = 143;
    firstdirs.width = scrollWidth*2/5;

    seconddirs.height = firstdirs.height;
    seconddirs.top = firstdirs.top;
    seconddirs.width = scrollWidth - firstdirs.width;
    seconddirs.left = firstdirs.width;

    // Preview.height = firstdirs.height/3;
    // Preview.top = scrollHeight - Preview.height;

    //配置四个模块的位置数据
    document.getElementById("basicinfo").style.height=basicinfo.height+"px";
    document.getElementById("basicinfo").style.top=basicinfo.top+"px";

    document.getElementById("firstdirs").style.height=firstdirs.height+"px";
    document.getElementById("firstdirs").style.width=firstdirs.width+"px";
    document.getElementById("firstdirs").style.top=firstdirs.top+"px";

    document.getElementById("seconddirs").style.height=seconddirs.height+"px";
    document.getElementById("seconddirs").style.width=seconddirs.width+"px";
    document.getElementById("seconddirs").style.top=seconddirs.top+"px";
    document.getElementById("seconddirs").style.left=seconddirs.left+"px";

    //////////////////////////默认选中生理信息
    $scope.showPDA = true;
    $scope.ifphysiological = true;//初始化显示生理信息采集
    $scope.ifbiochemical=false;
    $scope.showClassfyinfo=false;
    // $scope.itemdetail = $scope.testdata.physiological;
    //////////////////////////

    //获取病人信息

    var visitNo = window.localStorage['VisitNo'];
    var Userid = window.localStorage['USERID'];
    var patientID = window.localStorage['PatientID'];
    //获取病人基本信息
    $scope.showpatientinfo={"PatientID":patientID, "VisitNo":visitNo, "PatientName":""}
    // var promise_PatientInfo = PatientInfo.GetPsPatientInfo(Storage.get("PatientID")); 
    // promise_PatientInfo.then(function(data)
    // { 
    //     $scope.testdata.PatientName = data.PatientName;
    //   },function(err) {   
    // });

    $scope.selectResult=[];//伤情记录/处置选择结果
    $scope.inputResult=[];//生理生化信息输入结果

    var blem = angular.fromJson(window.localStorage['blemac']);
    blem==undefined?$scope.bindble = '--':$scope.bindble = blem.name;//生化ble绑定结果blemac

    var btd = angular.fromJson(window.localStorage['bluetoothdevice']);
    btd==undefined?$scope.bindBle = '--':$scope.bindBle = btd.name;//生理手持ble绑定结果

    var btdp = angular.fromJson(window.localStorage['bluetoothdeviceP']);
    btdp==undefined?$scope.bindBleP = '--':$scope.bindBleP = btdp.name;//生理腕表ble绑定结果

    console.log($scope.bindBleP);
    $scope.catalog = {};//获取目录

    Patients.GetVitalSignDictItems().then(
    function(s){
      for(var i=0;i<s.length;i++)
      {
        $scope.catalog[s[i].Category] = s[i].Item;
      }

      VitalSignInfo.GetVitalSignInfos(patientID,visitNo).then(//获取已有信息
        function(s){
          // console.log(s);
          for(var i=0;i<s.length;i++)
          {
            $scope.catalog[s[i].ItemCategory][s[i].ItemCode-1].value = s[i].ItemValue;
          }
          scoring();
        },
        function(e){
          console.log(e);
        });

      $scope.itemdetail = $scope.catalog.Physical;
      console.log($scope.catalog);
    },function(e){
      // console.log(e);
    })
    Patients.GetEmergencyDictItems().then(
      function(s){
        console.log(s);
         for(var i=0;i<s.length;i++)
         {
           $scope.catalog[s[i].Category] = s[i].Item;
         }
        EmergencyInfo.GetEmergencyInfos(patientID,visitNo).then(//获取已有信息
          function(s){
            // console.log(s);
            for(var i1=0;i1<s.length;i1++)
            {
              for(var i2=0;i2<s[i1].Item.length;i2++)
              {
                $scope.catalog[s[i1].ItemCategory][s[i1].Item[i2].ItemCode-1].status = true;
                if(s[i1].Item[i2].ItemName=="其他")
                  $scope.catalog[s[i1].ItemCategory][s[i1].Item[i2].ItemCode-1].value = s[i1].Item[i2].ItemValue;
              }
            }
            angular.forEach($scope.catalog.InjuryExtent,function(value,key){
              value.status=false;
            })
          },
          function(e){
            // console.log(e);
        });
        // console.log($scope.catalog);
     },function(e){
        // console.log(e);
    })
    $scope.onClickBackward = function(){
      if(Storage.get("New")==1)  $state.go('ambulance.list'); //回主页
      else $ionicHistory.goBack();
    } 
      $scope.firstdirs = [//左侧目录的数据
      [   "Site",//伤情记录
          "Class",
          "Type",
          "Complications"
      ],
      [
          "Emergency",//伤情处理
          "Treatment",
          "AntiInfect",
          "AntiShock"
      ],
      [
        'Physical',//检测信息
        'Biochemical'
      ],
      [
        'ClassifyInfo',//分类信息
      ]
    ];
    $scope.items = {//左侧目录详细数据，filters.js文件中有过滤信息
      "Site":{Style:{}},
      "Class":{Style:{}},
      "Type":{Style:{}},
      "Complications":{Style:{}},
      "InjuryExtent":{Style:{}},
      "Emergency":{Style:{}},
      "Treatment":{Style:{}},
      "WarWound":{Style:{}},
      "CarePathway":{Style:{}},
      "TreatmentOutLine":{Style:{}},
      "AntiInfect":{Style:{}},
      "AntiShock":{Style:{}},
      "Physical":{Style:{'background-color':'#BEDBD7'}},
      "Biochemical":{Style:{}},
      "ClassifyInfo":{Style:{}}
    };
    $scope.lastchooseitem = 'Physical';//记录上一次选中的左侧目录信息，如 physiological
      $scope.chooseitem = function(ci){
        // console.log(ci);
        if(ci!=$scope.lastchooseitem)//防止重复点击同一个目录
        {
          switch(ci)
          {
            case "Physical"://这两个界面放的是输入框等，因此加以区分
            {
              $scope.showPDA = true;
              $scope.ifphysiological = true;
              $scope.ifbiochemical=false;
              $scope.showClassfyinfo=false;
              $scope.itemdetail = $scope.catalog.Physical;//获取所选目录详细信息进行显示
              break;
            }
            case "Biochemical":
            {
              $scope.showPDA = true;
              $scope.ifbiochemical = true;
              $scope.ifphysiological=false;
              $scope.showClassfyinfo=false;
              $scope.itemdetail = $scope.catalog.Biochemical;
              break;
            }
            case "ClassifyInfo":
            {
              $scope.showClassfyinfo=true;
              $scope.showPDA = true;
              $scope.ifbiochemical = false;
              $scope.ifphysiological=false;
              $scope.itemdetail = $scope.catalog.Info;
              break;
            }
            default://伤情记录和伤情处理部分都是checkbox
            {
              $scope.showPDA = false;
              $scope.showClassfyinfo=false;
              $scope.itemdetail = $scope.catalog[ci];
              break;
            }
          }
          $scope.items[ci].Style={'background-color':'#BEDBD7'};//设置所选目录的背景色
          if($scope.lastchooseitem!='')$scope.items[$scope.lastchooseitem].Style={};
          $scope.lastchooseitem=ci;//修改上次所选目录
        }     
      };
      $scope.onselectchange = function(ci){//每次选中或取消checkbox后调用，直接把值汇总
        // console.log(ci);
        if(ci.ItemName=="其他")
        {
          $ionicScrollDelegate.$getByHandle('myhand').resize();
          //如果选的是其他则把页面滚到底部，方便显示输入框
          $ionicScrollDelegate.$getByHandle('myhand').scrollBottom(true);
        }
        // console.log($scope.itemdetail);
        $scope.catalog[$scope.lastchooseitem]=$scope.itemdetail;

      }
      $scope.Warwound = {
        "ItemCategory":'Info',
        "ItemCode":"004",
        "ItemValue":'战伤',
        "UserId":Userid,
        "TerminalName":"sampleTerminalName",
        "TerminalIP":"sampleTerminalIP"
      }
      $scope.Save = {
              "ItemCategory":'Info',
              "ItemCode":"005",
              "ItemValue":"未处置",
              "UserId":Userid,
              "TerminalName":"sampleTerminalName",
              "TerminalIP":"sampleTerminalIP"
            }
      $scope.ClassifyInfochange=function(index,data)
      {
        switch (index)
        {
          case 0:
            $scope.Warwound = {
              "ItemCategory":'Info',
              "ItemCode":"004",
              "ItemValue":data,
              "UserId":Userid,
              "TerminalName":"sampleTerminalName",
              "TerminalIP":"sampleTerminalIP"
            }
            console.log(data)
            break;
          case 1:
            $scope.Save = {
              "ItemCategory":'Info',
              "ItemCode":"005",
              "ItemValue":data,
              "UserId":Userid,
              "TerminalName":"sampleTerminalName",
              "TerminalIP":"sampleTerminalIP"
            }
            console.log(data)
            break;
          case 2:
            if(data=="紧急处置")
            {
              if($scope.Injury1==undefined)
                $scope.Injury1={
                  "ItemCategory":'Info',
                  "ItemCode":"006",
                  "ItemValue":data,
                  "UserId":Userid,
                  "TerminalName":"sampleTerminalName",
                  "TerminalIP":"sampleTerminalIP"
                }
              else $scope.Injury1=undefined
            }else if(data == "放射污染")
            {
              if($scope.Injury2==undefined)
              $scope.Injury2={
                "ItemCategory":'Info',
                "ItemCode":"007",
                "ItemValue":data,
                "UserId":Userid,
                "TerminalName":"sampleTerminalName",
                "TerminalIP":"sampleTerminalIP"
              }
              else $scope.Injury2=undefined
            }else if(data=="隔离")
            {
              if($scope.Injury3==undefined)
              $scope.Injury3={
                "ItemCategory":'Info',
                "ItemCode":"008",
                "ItemValue":data,
                "UserId":Userid,
                "TerminalName":"sampleTerminalName",
                "TerminalIP":"sampleTerminalIP"
              }
              else $scope.Injury3=undefined
            }else if(data=="染毒")
            {
              if($scope.Injury4==undefined)
              $scope.Injury4={
                "ItemCategory":'Info',
                "ItemCode":"009",
                "ItemValue":data,
                "UserId":Userid,
                "TerminalName":"sampleTerminalName",
                "TerminalIP":"sampleTerminalIP"
              }
              else $scope.Injury4=undefined
            }
            break;
        }
          console.log($scope.Warwound)
          console.log($scope.Save)
          console.log($scope.Injury1)
          console.log($scope.Injury2)
          console.log($scope.Injury3)
          console.log($scope.Injury4)
      }
      $scope.OnFocus = function(i)//当输入框获得焦点是调用，i-所选输入框的索引
      {
        document.getElementById('mytext2').focus();//使通用输入框获得焦点
        $scope.inputindex = i;//存储输入框索引
        // console.log(i);
        if(i!=undefined)
          $scope.textarea2value = $scope.itemdetail[i].value;//通用输入框获得所选输入框的初始值
        else
          $scope.textarea2value = $scope.itemdetail.slice(-1)[0].value;
        var keyboardHeight = window.localStorage['keyboardHeight'];//获取键盘高度
        $scope.mytext2height = {'height':scrollHeight - keyboardHeight-43+"px"};//设置通用输入框高度
        $scope.mytext2textareaheight = {"height":scrollHeight - keyboardHeight - 57+"px"};
      }

      $scope.doneotherinfo = function(){//完成通用输入框时调用
        $scope.mytext2height = {'height':0+"px"};
        $scope.mytext2textareaheight = {"height":0+"px"};
        scoring();
      }

      $scope.loosecurse = function(){//通用输入框失去焦点时调用
        // console.log('loosecurse');
        // console.log($scope.lastchooseitem);
        if($scope.inputindex!=undefined)//undefined表示通用输入框操作的是生理，生化参数输入界面
        {
          $scope.itemdetail[$scope.inputindex].value = $scope.textarea2value;//将通用输入框的值赋给所选输入框
        }
        else//表示通用输入框操作的是伤情记录/处置中的某个其他输入框
        {
          $scope.itemdetail.slice(-1)[0].value = $scope.textarea2value;
        }
        scoring();
      }
      $scope.showdeviceoption_b = false;//控制显示生理/生化中的读取设备按钮详细信息
      $scope.clickshowdeviceoption = function(device){
        if(ionic.Platform.platform()!='win32'){
          ble.isEnabled(function(){

          }, function(){
            // console.log("ble is not enabled");
            $scope.ble_enable();
          });
        }
        if(device=='Physical')
        {
          $scope.showdeviceoption_p = ~$scope.showdeviceoption_p;
        }else if(device=='Biochemical')
        {
          $scope.showdeviceoption_b = ~$scope.showdeviceoption_b;
        }
      }
      var postVitalSigndata = {
        ID:{PatientID:patientID,VisitNo:visitNo},
        postdata:[]
      };
      var postEmergencydata = {
        ID:{PatientID:patientID,VisitNo:visitNo},
        postdata:[]
      };
      $scope.saveall = function(){

        console.log($scope.catalog);
        postEmergencydata.postdata = [];
        postVitalSigndata.postdata = [];
        angular.forEach($scope.catalog,function(value,key){
          for(var i=0;i<value.length;i++)
          {
            if(value[i].status)
            {
              // console.log(key+value[i].ItemName);
              var selectResult={};
              selectResult["ItemCategory"] = key;
              selectResult["ItemCode"] = value[i].ItemCode;
              selectResult["ItemValue"] = value[i].ItemName;
              selectResult["UserId"] = Userid;
              selectResult["TerminalName"] = "sampleTerminalName";
              selectResult["TerminalIP"] = "sampleTerminalIP";
              if(value[i].ItemName=='其他')selectResult["ItemValue"] = value[i].value;
              postEmergencydata.postdata.push(selectResult);
            }
            if(value[i].value!=''&&value[i].value!=undefined&&value[i].ItemName!='其他')
            {
              // console.log(key+value[i].ItemName);
              var inputResult={};
              inputResult["ItemCategory"] = key;
              inputResult["ItemCode"] = value[i].ItemCode;
              inputResult["ItemValue"] = value[i].value;
              inputResult["ItemUnit"] = value[i].ItemUnit;
              inputResult["UserID"] = Userid;
              inputResult["TerminalName"] = "sampleTerminalName";
              inputResult["TerminalIP"] = "sampleTerminalIP";
              postVitalSigndata.postdata.push(inputResult);
            }
          }
        })
        // console.log($scope.emergencylevel);
        if($scope.emergencylevel!=undefined)
        {
          postEmergencydata.postdata.push($scope.emergencylevel);
        }
        postEmergencydata.postdata.push($scope.Warwound);
        postEmergencydata.postdata.push($scope.Save);
        if($scope.Injury1!=undefined)
        {
          postEmergencydata.postdata.push($scope.Injury1);
        }
        if($scope.Injury2!=undefined)
        {
          postEmergencydata.postdata.push($scope.Injury2);
        }
        if($scope.Injury3!=undefined)
        {
          postEmergencydata.postdata.push($scope.Injury3);
        }
        if($scope.Injury4!=undefined)
        {
          postEmergencydata.postdata.push($scope.Injury4);
        }
        console.log(postVitalSigndata);
        console.log(postEmergencydata);
        if(postVitalSigndata.postdata.length>0)
        {
          Patients.PostVitalSign(postVitalSigndata).then(
            function(s){
            // console.log(s.result);
            window.plugins.toast.showShortBottom('生理/生化信息保存成功');
          },function(e){
            // console.log(e);
            window.plugins.toast.showShortBottom('生理/生化信息保存失败');
          });
        }
        if(postEmergencydata.postdata.length>0)
        {
          Patients.PostEmergency(postEmergencydata).then(
            function(s){
            // console.log(s.result);
           window.plugins.toast.showShortBottom('急救信息保存成功');
          },function(e){
            // console.log(e);
            window.plugins.toast.showShortBottom('急救信息保存失败');
          });
        }
      }
      // A confirm dialog
    $scope.showConfirm = function() {
      // console.log($scope.blescanlist);
      var confirmPopup = $ionicPopup.confirm({
        title: '选择设备',
        scope:$scope,
        template:'<ion-list><a class="item item-icon-right" href="#" ng-repeat="item in blescanlist"ng-click="selectbledevice($index)"><i class="icon ion-android-done" ng-if="item.showconnecticon"></i>{{item.name}}</a></ion-list>'
      }).then(function(res) {
        if(res) {
          // console.log('You are sure');
          for(var i=0;i<$scope.blescanlist.length;i++)
          {
            if($scope.blescanlist[i].showconnecticon == true)
            {
                $scope.ble_connect(i);
            }
          }
        } else {
          // console.log('You are not sure');
        }
      });
    };
    $scope.selectbledevice = function(index){
      // console.log(index);
      // console.log($scope.blescanlist);
      for(var i=0;i<$scope.blescanlist.length;i++)
      {
        $scope.blescanlist[i].showconnecticon = false;
      }
      $scope.blescanlist[index].showconnecticon = true;
      // console.log($scope.blescanlist);
    }
    $scope.showbluetoothConfirm = function(i) {//弹出生理设备选择提示框
      $scope.bluetoothscanlist = [
        
      ];
      $scope.Pbluttoothdevice = i;
      if(ionic.Platform.platform()!='win32')
      {
        if(i==0)
        {
          console.log('startbluetooth');
          bluetoothSerial.discoverUnpaired();
          bluetoothSerial.setDeviceDiscoveredListener(function(device) {
            $rootScope.$apply(function(){
              $scope.bluetoothscanlist.push(device);
            });
            console.log($scope.bluetoothscanlist);
          }); 
        }else{
          console.log("s");
          ble.startScan([], function(device) {
              console.log(JSON.stringify(device));
              $rootScope.$apply(function(){
                $scope.bluetoothscanlist.push(device);
              });
          }, function(e){
            console.log(e);
          });
        }
      }
      $scope.Pbluttoothdevicefun = function(i){
        // $scope.Pbluttoothdevice = i;
        console.log($scope.Pbluttoothdevice);
      }
      var confirmPopup = $ionicPopup.confirm({
        title: '选择设备',
        scope:$scope,
        template:'<ion-list><a class="item item-icon-right" href="#" ng-repeat="item in bluetoothscanlist"ng-click="selectbluetoothdevice($index)"><i class="icon ion-android-done" ng-if="item.showconnecticon"></i>{{item.name}}</a></ion-list>'
      }).then(function(res) {
        if(res) {
          $scope.bluetoothscanlist.forEach(function(value,key){
              if(value.showconnecticon == true)
              {
                if(i==0)
                {
                  window.localStorage['bluetoothdevice'] = angular.toJson(value);//存储生理设备mac(相当于绑定设备)
                  $scope.bindBle = value.name;
                  window.plugins.toast.showShortBottom('绑定手持设备');
                }
                else
                {
                  window.localStorage['bluetoothdeviceP'] = angular.toJson(value);//存储生理设备mac(相当于绑定设备)
                  $scope.bindBleP = value.name;
                  window.plugins.toast.showShortBottom('绑定腕表');
                }
              }
            })
        } else {
          // console.log('You are not sure');
        }
      });
    };
    $scope.selectbluetoothdevice = function(index){//保存选择的生理设备蓝牙信息
      $scope.bluetoothscanlist.forEach(function(value,key){
        if(key==index)
          value.showconnecticon = true;
        else
          value.showconnecticon = false;
      })
    }
    $scope.receivevdata = function(){//从生理设备获取数据
      $scope.pdata = [];
      if(ionic.Platform.platform()!='win32')
      {
        if($scope.Pbluttoothdevice==0)
        {
          var bluetoothdevice = angular.fromJson(window.localStorage['bluetoothdevice']);
          bluetoothSerial.connect(bluetoothdevice.id,
            function(s){
              bluetoothSerial.subscribeRawData(
                function(sd){
                  var bytes = new Uint8Array(sd);
                  // console.log(sd);
                  $rootScope.$apply(function(){
                    if($scope.pdata.length<55)
                    {
                      // $scope.testdata.concat(bytes);
                      angular.forEach(bytes,function(value,key){
                        // console.log(value);
                        $scope.pdata.push(value);
                        // console.log($scope.testdata);
                      })
                    }
                    else{
                      // console.log("save 55 bytes!");
                      bluetoothSerial.unsubscribeRawData(function(s){/*console.log(s)*/},function(e){/*console.log(e)*/});
                      bluetoothSerial.disconnect(function(s){/*console.log(s);*/},function(e){/*console.log(e);*/});
                      for(var i=0;i<55;i++){
                        if($scope.pdata[i] == 170 && (i+26)<55)
                          if($scope.pdata[i+1]==170)
                            if($scope.pdata[i+2]==1)
                              if($scope.pdata[i+3]==49)
                              {
                                $scope.pdata= [];
                                for(var ii=0;ii<26;ii++)
                                {
                                   $scope.pdata.push($scope.pdata[i+ii]);
                                }
                                // console.log($scope.testdata2);
                                $scope.catalog.Physical[6].value = $scope.pdata[6];//心率
                                $scope.catalog.Physical[5].value = $scope.pdata[7];//血氧值
                                $scope.catalog.Physical[1].value = $scope.pdata[8];//脉率
                                $scope.catalog.Physical[2].value = $scope.pdata[9];//呼吸率
                                $scope.catalog.Physical[3].value = $scope.pdata[10];//收缩压
                                $scope.catalog.Physical[4].value = $scope.pdata[11];//舒张压
                                // console.log($scope.catalog);
                                window.plugins.toast.showShortBottom('获取成功');
                              }
                      }
                    }
                  });
                  // console.log($scope.testdata);
                },function(ed){
                  window.plugins.toast.showShortBottom('获取失败');
                });
            }, function(e){
              window.plugins.toast.showShortBottom('获取失败');
            });
          }else{
            var bluetoothdevice = angular.fromJson(window.localStorage['bluetoothdeviceP']);
            ble.connect(bluetoothdevice.id,
              function(s)
              {
                console.log(s);
                // console.log(s.id+" "+s.services[2]+" "+s.characteristics[6].characteristic);
                ble.read(s.id, s.services[3], s.characteristics[11].characteristic,
                  function(buff){
                    // console.log(buff);
                    // console.log('buff');
                    var data = new Uint8Array(buff);
                    ///////////获取成功进行存储，此处数据格式尚待确定
                    $rootScope.$apply(function(){
                      $scope.catalog.Physical[0].value = data[7]+data[8]/100;//体温
                      $scope.catalog.Physical[1].value = data[4];//脉率
                      $scope.catalog.Physical[3].value = data[5];//收缩压
                      $scope.catalog.Physical[4].value = data[6];//舒张压
                    })

                    window.plugins.toast.showShortBottom('获取成功');
                    console.log($scope.catalog.Physical);
                    ///断开连接
                    ble.disconnect(s.id,
                      function(dcsuccess){
                        console.log(dcsuccess)
                      },
                      function(dce){
                        console.log(dce);
                      });
                  },function(e){
                    console.log(e);
                     ///断开连接
                    window.plugins.toast.showShortBottom('获取失败');
                    ble.disconnect(s.id,
                      function(dcsuccess){
                        console.log(dcsuccess)
                      },
                      function(dce){
                        console.log(dce);
                      });
                  });
              },function(e)
              {
                console.log(e);
                 ///断开连接
                    window.plugins.toast.showShortBottom('获取失败');
                    ble.disconnect(s.id,
                      function(dcsuccess){
                        console.log(dcsuccess)
                      },
                      function(dce){
                        console.log(dce);
                      });
              });
            console.log(bluetoothdevice);
          }
      }
    }
    $scope.scoring = 0;
    var scoring = function()
    {
      var breathscoring = 0;
      if($scope.catalog.Physical[2].value==0)
        breathscoring = 0;
      else if($scope.catalog.Physical[2].value>=1&&$scope.catalog.Physical[2].value<=5)
        breathscoring = 1;
      else if($scope.catalog.Physical[2].value>=6&&$scope.catalog.Physical[2].value<=9)
        breathscoring = 2;
      else if($scope.catalog.Physical[2].value>=10&&$scope.catalog.Physical[2].value<=29)
        breathscoring = 4;
      else if($scope.catalog.Physical[2].value>29)
        breathscoring = 3;
      var bp_hscoring = 0;
      if($scope.catalog.Physical[3].value<1)
        bp_hscoring = 0;
      else if($scope.catalog.Physical[3].value>=1&&$scope.catalog.Physical[3].value<=49)
        bp_hscoring = 1;
      else if($scope.catalog.Physical[3].value>=50&&$scope.catalog.Physical[3].value<=75)
        bp_hscoring = 2;
      else if($scope.catalog.Physical[3].value>=76&&$scope.catalog.Physical[3].value<=89)
        bp_hscoring = 3;
      else if($scope.catalog.Physical[3].value>89)
        bp_hscoring = 4;
      var mindscoring = 0;
      if($scope.catalog.Physical[7].value==3)
        mindscoring = 0;
      else if($scope.catalog.Physical[7].value>=4&&$scope.catalog.Physical[7].value<=5)
        mindscoring = 1;
      else if($scope.catalog.Physical[7].value>=6&&$scope.catalog.Physical[7].value<=8)
        mindscoring = 2;
      else if($scope.catalog.Physical[7].value>=9&&$scope.catalog.Physical[7].value<=12)
        mindscoring = 3;
      else if($scope.catalog.Physical[7].value>=13&&$scope.catalog.Physical[7].value<=15)
        mindscoring = 4;
      // console.log($scope.catalog);
      // console.log(breathscoring);
      // console.log(bp_hscoring);
      // console.log(mindscoring);
      $scope.showscoredetail = function()
      {
        if(ionic.Platform.platform()!='win32')
          window.plugins.toast.showShortTop("战伤计分:"+$scope.scoring);
        else 
          console.log("战伤计分:"+$scope.scoring);
      }
      $scope.scoring = breathscoring+bp_hscoring+mindscoring;
      if($scope.scoring>=6&&$scope.scoring<=9)
        {
          $scope.scoring+="分 重伤";
          $scope.emergencylevel = {
            "ItemCategory":'InjuryExtent',
            "ItemCode":3,
            "ItemValue":'重伤',
            "UserId":Userid,
            "TerminalName":"sampleTerminalName",
            "TerminalIP":"sampleTerminalIP"
          }
        }
      else if($scope.scoring>=10&&$scope.scoring<=11)
       { 
        $scope.scoring+="分 中度伤";
          $scope.emergencylevel = {
            "ItemCategory":'InjuryExtent',
            "ItemCode":2,
            "ItemValue":'中度伤',
            "UserId":Userid,
            "TerminalName":"sampleTerminalName",
            "TerminalIP":"sampleTerminalIP"
          }
      }
      else if($scope.scoring==12)
        {
          $scope.scoring+="分 轻伤";
          $scope.emergencylevel = {
            "ItemCategory":'InjuryExtent',
            "ItemCode":1,
            "ItemValue":'轻伤',
            "UserId":Userid,
            "TerminalName":"sampleTerminalName",
            "TerminalIP":"sampleTerminalIP"
          }
        }
      else if($scope.scoring<=5)
        {
          $scope.scoring+="分 危重伤";
          $scope.emergencylevel = {
            "ItemCategory":'InjuryExtent',
            "ItemCode":4,
            "ItemValue":'危重伤',
            "UserId":Userid,
            "TerminalName":"sampleTerminalName",
            "TerminalIP":"sampleTerminalIP"
          }
        }
    }
    $scope.showdescribe = function() {
      var showdescribe = $ionicPopup.alert({
        title: '战伤计分规则!',
        template: '战伤总积分为呼吸计分+收缩压计分+神志计分的总和'
      });
    };
////////////////////////for ble
    $ionicPlatform.ready(function(){
    if(ionic.Platform.platform()!='win32')
    {
      // console.log(ionic.Platform.platform());

      // console.log($scope.datafromdevice);
      $scope.blescanlist = [];
      ble.startScan([], function(success){
          // console.log('ble-success');
          $rootScope.$apply(function(){
            var hashavedevice = false;
            for(var i=0;i<$scope.blescanlist.length;i++)
            {
              if(success.id==$scope.blescanlist[i].id)
                hashavedevice = true;

            }
            if(!hashavedevice)
            {
              var length = $scope.blescanlist.push(success);
              $scope.blescanlist[length-1].index = length-1;
              $scope.blescanlist[length-1].showconnecticon = false;
            }
          });
          // console.log($scope.blescanlist);
        }, function(err){
          // console.log(err);
    });
    $scope.ble_connect = function(index){
      var device_id = $scope.blescanlist[index].id;
      // console.log(device_id);
      ble.connect(device_id, function(connectSuccess){

        window.localStorage['blemac'] = angular.toJson(connectSuccess);//angular.fromJson()
        $rootScope.$apply(function(){
          $scope.bindble = connectSuccess.name;
                });
                // console.log($scope.blescanlist);
      }, function(connectFailure){
        $rootScope.$apply(function(){
          $scope.bindble = '绑定失败';
          // console.log(index);
          // console.log($scope.blescanlist[index].showconnecticon)
          $scope.blescanlist[index].showconnecticon = false;
                });
                // console.log($scope.blescanlist);
      });
    };
    $scope.ble_disconnect = function(device_id){
      ble.disconnect(device_id, function(disconnectSuccess){
        // console.log(disconnectSuccess);
      }, function(disconnectfailure){
        // console.log(disconnectfailure);
      });
    }
    $scope.ble_enable = function(){
      ble.enable(function(enablesuccess){
        // console.log('enablesuccess');

          ble.startScan([], function(success){
          // console.log('ble-success');
          $rootScope.$apply(function(){
              var hashavedevice = false;
              for(var i=0;i<$scope.blescanlist.length;i++)
              {
                if(success.id==$scope.blescanlist[i].id)
                  hashavedevice = true;

              }
              if(!hashavedevice)
              {
                var length = $scope.blescanlist.push(success);
                $scope.blescanlist[length-1].index = length-1;
                $scope.blescanlist[length-1].showconnecticon = false;
              }
          });
          // console.log($scope.blescanlist);
        }, function(err){
          // console.log(err);
        });
        $rootScope.$apply(function(){
          $scope.bleisdisabled = false;
                });
      }, function(enablefailure){
        // console.log(enablefailure);
      });
    };
  } 
  })
  $scope.starttimesync = function(){
    // console.log('clickstarttimesync');
    var bledevice = angular.fromJson(window.localStorage['blemac']);
    ble.connect(bledevice.id, function(connectSuccess){
      // console.log(connectSuccess);
      ble_startNotification();
      $scope.step = 0;
      ble_write($scope.step);
    }, function(connectFailure){
      // console.log(connectFailure);
    });
  }
  $scope.receivecurrentdata = function(){
    // console.log('clickreceivecurrentdata');
    $scope.datafromdevice = new Uint8Array(0);
    var bledevice = angular.fromJson(window.localStorage['blemac']);
    ble.connect(bledevice.id, function(connectSuccess){
      // console.log(connectSuccess);
      ble_startNotification();
      $scope.step = 2;
      ble_write($scope.step);
    }, function(connectFailure){
      // console.log(connectFailure);
    });
  }
  var ble_startNotification = function(){
    var bledevice = angular.fromJson(window.localStorage['blemac']);
    ble.startNotification(bledevice.id, bledevice.services[2], bledevice.characteristics[6].characteristic,function(buffer){
        // console.log('readsuccess');
        var data = new Uint8Array(buffer);
        console.log(data);
        // console.log(data.length);


        if(data.length == 4)
        {
          if(data[2] == 0x00)
          {
            $rootScope.$apply(function(){
              if($scope.step==0)//if$scope.step==2表示设备成功接收发送单次数据命令，准备发送数据
              {
                setTimeout(function(){
                  $scope.step++;
                  ble_write($scope.step)
                },2000);
              }
                    });
          }else
          { }
        }else{
          //此处判断接收的数据信息是否正确，正确则发送ble_write(3);mastercomputerrespond指令并取消监听完成获取数据
          $rootScope.$apply(function(){
            // console.log($scope.step);
            if($scope.step==2)
            {
              var c = new Uint8Array($scope.datafromdevice.length+data.length);
              c.set($scope.datafromdevice);
              c.set(data,$scope.datafromdevice.length);
              $scope.datafromdevice = c;
              if($scope.datafromdevice.length == 34)
              {
                setTimeout(function(){
                  $scope.step++;
                  ble_write($scope.step);
                  ble.stopNotification(bledevice.id, bledevice.services[2], bledevice.characteristics[6].characteristic,
                    function(){/*console.log("stopNotifications");*/},
                    function(){/*console.log("stopNotificatione");*/});
                },2000);
              }
              // console.log($scope.datafromdevice); 
            }else{
              //此处应该取消监听
            }
                  });
        }
      },function(err){
        // console.log('readerr');
        // console.log(err);
        $rootScope.$apply(function(){
          $scope.step = 0;
          ble_write(0);
                });
      });
  }
  var ble_write = function(step){
    var bledevice = angular.fromJson(window.localStorage['blemac']);
    if(ionic.Platform.platform()!='win32')
    {
      switch(step){
        case 0://时间同步命令
          ble.writeWithoutResponse(bledevice.id, bledevice.services[2], bledevice.characteristics[6].characteristic, bleService.timesynccommand(),
            function(s){
              // console.log('timesynccommandsuccess');
              // console.log(s);
            },
            function(err){
              // console.log(err);
            });
          break;
        case 1://发送时间数据
          ble.writeWithoutResponse(bledevice.id, bledevice.services[2], bledevice.characteristics[6].characteristic, bleService.timesyncdata(),
            function(){
              // console.log('timesyncdatasuccess');
              // console.log(new Uint8Array(bleService.timesyncdata()));
            },
            function(err){
              // console.log(err);
            });
          break;
        case 2://发送单次数据传送命令
          ble.writeWithoutResponse(bledevice.id, bledevice.services[2], bledevice.characteristics[6].characteristic, bleService.currentdatacommand(),
            function(){
              // console.log('currentdatacommandsuccess');
            },
            function(err){
              // console.log(err);
            });
          break;
        case 3://返回接收数据成功
          ble.writeWithoutResponse(bledevice.id, bledevice.services[2], bledevice.characteristics[6].characteristic, bleService.mastercomputerrespond(),
            function(){
              // console.log('mastercomputerrespondsuccess');
            },
            function(err){
              // console.log(err);
            });
          break;
      }
    }
  }
   $scope.showreservePop = function() {
     var myPopup = Evacation.getPopup($scope);
     myPopup.then(function(res) {
     console.log('haha',res);
   });
  };
/////////////////////////ble-endv

// var mytest = [];
// var mytest2 = new Uint8Array(2);
// mytest2[0]=1;
// mytest2[1]=2;
// // angular.forEach(mytest2,function(value,key){
// //   console.log(value);
// //   mytest.push(value);
// // })
// mytest.concat(mytest2);
// console.log(mytest);
}])
;