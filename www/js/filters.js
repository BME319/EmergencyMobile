angular.module('filters', [])
.filter('role', function() {
  return function(input) {
    switch(input)
    {
      case 'DivideLeader':return '分流组长';break;
      case 'DividePersonnel':return '分流人员';break;
      case 'EmergencyPersonnel':return '急救人员';break;

    }
  };
})
.filter('Status', function() {
  return function(input) {
  	switch(input)
  	{
  		case '1':return '已接收';break;
  		case '2':return '已后送';break;
  		case '3':return '已送达';break;
  		case '4':return '已分诊';break;
  	}
  };
})
.filter('sex', function() {
  return function(input) {
  	switch(input)
  	{
  		case '1':return '男';break;
  		case '2':return '女';break;
  		case '0':return '其他';break;

  	}
  };
})
  .filter('itemname', function() {
    return function(input) {
      switch(input)
      {
        case 'InjuryPart':return '受伤部位';break;
        case 'InjuryType':return '受伤类型';break;
        case 'InjuryComplication':return '并发症';break;
        case 'InjuryExtent':return 'InjuryExtent';break;
        case 'EmergencySurgery':return '紧急手术';break;
        case 'InjuryOutLine':return 'InjuryOutLine';break;
        case 'WarWound':return 'WarWound';break;
        case 'CarePathway':return 'CarePathway';break;
        case 'TreatmentOutLine':return '处置概要';break;
        case 'AntiInfection':return '抗感染';break;
        case 'AntiShock':return '抗休克';break;
        case 'InjuryClass':return '受伤类别';break;

        case "Physical":return '生理信息';break;
        case "Biochemical":return '生化信息';break;
        default:return input;break;
      }
    };
  })
  .filter('bytesToHexString', function() {
    return function (input) {
        if (window.nfc) {
            return nfc.bytesToHexString(input);
        } else {
            return input;
        }
    }
})

.filter('bytesToString', function() {
    return function(input) {
        if (window.nfc) {
            return nfc.bytesToString(input);
        } else {
            return input;
        }
    };
})

.filter('tnfToString', function() {

    function tnfToString(tnf) {
        var value = tnf;

        switch (tnf) {
            case ndef.TNF_EMPTY:
                value = "Empty";
                break;
            case ndef.TNF_WELL_KNOWN:
                value = "Well Known";
                break;
            case ndef.TNF_MIME_MEDIA:
                value = "Mime Media";
                break;
            case ndef.TNF_ABSOLUTE_URI:
                value = "Absolute URI";
                break;
            case ndef.TNF_EXTERNAL_TYPE:
                value = "External";
                break;
            case ndef.TNF_UNKNOWN:
                value = "Unknown";
                break;
            case ndef.TNF_UNCHANGED:
                value = "Unchanged";
                break;
            case ndef.TNF_RESERVED:
                value = "Reserved";
                break;
        }
        return value;
    }

    return function(input) {

        if (window.ndef) {
            return tnfToString(input);
        } else {
            return input;
        }

    };
})

.filter('decodePayload', function() {

    function decodePayload(record) {

        var payload,
            recordType = nfc.bytesToString(record.type);

        if (recordType === "T") {
            payload = ndef.textHelper.decodePayload(record.payload);

        } else if (recordType === "U") {
            payload = ndef.uriHelper.decodePayload(record.payload);

        } else {

            // we don't know how to translate this type, try and print it out.
            // your app should know how to process tags it receives

            var printableData = record.payload.map(function(i) {
                if (i <= 0x1F) {
                    return 0x2e; // unprintable, replace with "."
                } else {
                    return i;
                }
            });

            payload = nfc.bytesToString(printableData);
        }

        return payload;
    }

    return function(input) {

        if (window.nfc) {
            return decodePayload(input);
        } else {
            return input.payload;
        }

    };
});