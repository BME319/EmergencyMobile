// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('EmergencyMobile', ['ionic', 'services', 'controllers', 'ngCordova','filters','directives'])

.run(function($ionicPlatform, $rootScope,$ionicLoading,$state, Storage, UserInfo,nfcService) {
  $ionicPlatform.ready(function() {
    console.log(window.localStorage);
    Storage.rm('MY_LOCATION');
    //自动登录
    var userid=Storage.get('USERID');
    var passwd=Storage.get('PASSWD');
    if(userid!=undefined && passwd!=undefined){
        $ionicLoading.show();
        UserInfo.LogOn(userid,passwd)
        .then(function(data){
          if(data.Result==1){
            $ionicLoading.hide();
            Storage.set('RoleCode',data.RoleCode);
            $state.go('location');
          }else{
            $ionicLoading.hide();
          }
        },function(err){
          $ionicLoading.hide();
        });
     
    }

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
      //监听键盘，键盘出现时计算键盘高度----start
      window.addEventListener('native.keyboardshow', keyboardShowHandler);
      function keyboardShowHandler(e){
        document.body.classList.add('keyboard-open');
        window.localStorage['keyboardHeight'] = e.keyboardHeight;
        console.log('Keyboard height is: ' + e.keyboardHeight);
      }
      ///////--------------------------------end
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        alert('掉线啦');
    })
    $rootScope.eraseCard=false;
    $rootScope.NFCmodefy=false;
    Storage.set('UUID',ionic.Platform.device().uuid);
    console.log(nfcService);
    nfcService.start();  
  });
})

// --------路由, url模式设置----------------
.config(['$stateProvider','$urlRouterProvider','$ionicConfigProvider', function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {
  $ionicConfigProvider.platform.android.tabs.position('bottom');
  $ionicConfigProvider.platform.android.navBar.alignTitle('center');

  //注册与登录
  $stateProvider
    .state('signIn', {
      cache: false,
      url: '/signIn',
      templateUrl: 'templates/signIn/signIn.html',
      controller: 'SignInCtrl'
    })
    .state('register',{
      url:'/register',
      templateUrl:'templates/signIn/register.html',
      controller:'RegisterCtrl'
    })
    .state('location',{
      url:'/location',
      templateUrl:'templates/signIn/location.html',
      controller:'LocationCtrl'
    });

  //急救人员与分流人员
  $stateProvider
    .state('ambulance', {
      url: '/ambulance',
      abstract: true,
      templateUrl: 'templates/ambulance/tabs.html'
    })
    //急救人员
    .state('ambulance.list',{
      url: '/list',
      views:{
        'ambulance':{
        templateUrl: 'templates/ambulance/list.html',
        controller:'AmbulanceListCtrl'
        }
      }
    })  
    .state('newPatient',{
      url: '/newPatient',
      templateUrl: 'templates/ambulance/newPatient.html',
      cache: false,
      controller:'NewPatientCtrl'
    })
    .state('patientInfo',{
      url: '/patientInfo',
      templateUrl: 'templates/ambulance/patientInfo.html',
      cache: false,
      controller:'PatientInfoCtrl'
    })
    .state('newVisit',{
      url: '/newVisit',
      templateUrl: 'templates/ambulance/newVisit.html',
      cache: false,
      controller:'NewVisitCtrl'
    })
    .state('visitInfo',{
      url: '/visitInfo',
      templateUrl: 'templates/ambulance/visitInfo.html',
      cache: false,
      controller:'VisitInfoCtrl'
    })
    .state('viewEmergency',{
      url: '/viewEmergency',
      templateUrl: 'templates/ambulance/viewEmergency.html',
      cache: false,
      controller:'ViewEmergencyCtrl'
    })
    .state('injury',{
      url: '/injury',
      templateUrl: 'templates/ambulance/injury.html',
      controller:'InjuryCtrl'
    })
    .state('ambulance.mine',{
      url: '/mine',
      views:{
       'mine':{
          templateUrl: 'templates/mine/setting.html',
          controller:'SettingCtrl'
        }
      }
    })
    .state('ambulance.myProfile',{
      cache: false,
      url: '/myprofile',
      views:{
       'mine':{
          templateUrl: 'templates/mine/myProfile.html',
          controller:'myProfileCtrl'
        }
      }
    })   
    .state('ambulance.setPassword', {
      cache:false,
      url: '/setPassword',
      views:{
       'mine':{
          templateUrl: 'templates/signIn/setPassword.html',
          controller: 'SetPasswordCtrl'
        }
      }      
    });

    //起始页
    $urlRouterProvider.otherwise('/signIn');
  }])

// --------不同平台的相关设置----------------
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(3);
  // note that you can also chain configs
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.navBar.positionPrimaryButtons('left');
  $ionicConfigProvider.navBar.positionSecondaryButtons('right');
  $ionicConfigProvider.form.checkbox('circle');
});

