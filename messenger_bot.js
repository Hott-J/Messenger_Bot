const scriptName = "test";
/**
 * (string) room
 * (string) sender
 * (boolean) isGroupChat
 * (void) replier.reply(message)
 * (boolean) replier.reply(room, message, hideErrorToast = false) // 전송 성공시 true, 실패시 false 반환
 * (string) imageDB.getProfileBase64()
 * (string) packageName
 */

 function getWeather(replier, msg) {
  // 특정 웹 페이지로부터 HTML의 특정 소스코드(id = wob_wc) 가져오기
  var weather = org.jsoup.Jsoup.connect("https://www.google.com/search?q=" + msg.replace(" ", "+")).get().select("#wob_wc");;

  // 가져온 데이터가 없거나 공백일 경우 종료
  if (weather == undefined || weather == "") return ;

  // 날씨 데이터 파싱
  var data = weather.select("#wob_loc").text() + " 날씨 ⛅";
  data = data.concat("\n" + weather.select("#wob_dts").text() + "\n");
  data = data.concat("\n" + weather.select("#wob_dc").text() + " ");
  data = data.concat("\n" + weather.select("#wob_tm").text() + "℃");

  var wob_d = weather.select("#wob_d").select(".wob-dtl");
  data = data.concat("\n강수확률 : " + wob_d.select("#wob_pp").text());
  data = data.concat("\n습도 : " + wob_d.select("#wob_hm").text());
  data = data.concat("\n풍속 : " + wob_d.select("#wob_ws").text());
  data = data.concat("\n\n=-=-=-=-=-=-=-=-=-=-=-=-=");

  var wob_df = weather.select(".wob_df");
  for (var i = 0; i < wob_df.size(); i++) {
    var t = wob_df.get(i);
    data = data.concat("\n");
    data = data.concat(t.select("div>div").get(0).text() + " : ");
    data = data.concat(t.select("div>img").attr("alt") + " ");
    data = data.concat("(" + t.select("div>div>span").get(0).text());
    data = data.concat(" ~ " + t.select("div>div>span").get(2).text() + "℃)");
  }
  replier.reply(data);
}

var DFLT_ADMIN = [{ name: "핫제" }, { name: "핫제이" }];

var RoomList = [];

function checkRoom(room) {
  var new_flag = 1;
  for (var idx in RoomList) {
    if (RoomList[idx] == room) new_flag = 0;
  }
  if (new_flag) RoomList.push(room);
}
function showRooms() {
  var rtn_msg = "[방 리스트]";
  for (var idx in RoomList) rtn_msg = rtn_msg.concat("\n " + RoomList[idx]);
  return rtn_msg;
}

function isNull(value) {
  return typeof value == "undefined" || value == null || value == "" ? true : false;
}

function getAdminList() {
  var database = DataBase.getDataBase("AdminList.json");
  if (isNull(database) || database == "[]") database = DataBase.setDataBase("AdminList.json", JSON.stringify(DFLT_ADMIN));
  return database;
}

// 관리자 조회
function getAdminText() {
  var AdminList = JSON.parse(getAdminList());
  var text = "";
  for (var idx in AdminList) text = text.concat(AdminList[idx]["name"] + "\n");
  return text.slice(0, -1);
}

// 관리자 추가
function addAdmin(name) {
  var AdminList = JSON.parse(getAdminList());
  for (var idx in AdminList) {
    if (AdminList[idx]["name"] == name) return -1; // already exist
  }
  AdminList.push({ name: name });
  DataBase.setDataBase("AdminList.json", JSON.stringify(AdminList));
  return 0; // success
}

// 관리자 제거
function delAdmin(name) {
  var AdminList = JSON.parse(getAdminList());
  for (var idx in AdminList) {
    if (AdminList[idx]["name"] == name) {
      AdminList.splice(idx, 1);
      DataBase.setDataBase("AdminList.json", JSON.stringify(AdminList));
      return 0; // success
    }
  }
  return -1; // not exist
}

// 관리자 확인
function isAdmin(name) {
  var AdminList = JSON.parse(getAdminList());
  for (var idx in AdminList) {
    if (AdminList[idx]["name"] == name) return 1; // is admin
  }
  return 0; // isn't admmin
}

function botStatus() {
  var stat_msg = "";
  var scripts = Api.getScriptNames();
  for (var idx in scripts) {
    stat_msg = stat_msg.concat("[" + scripts[idx] + " 봇 상태]");
    stat_msg = stat_msg.concat("\n 전원 상태 : " + Api.isOn(scripts[idx]));
    stat_msg = stat_msg.concat("\n 컴파일 완료 : " + Api.isCompiled(scripts[idx]));
    stat_msg = stat_msg.concat("\n 컴파일 진행중 : " + Api.isCompiling(scripts[idx]));
    stat_msg = stat_msg.concat("\n\n");
  }
  return stat_msg.slice(0, -2);
}

function deviceStatus() {
  var stat_msg = "[디바이스 상태]";
  stat_msg = stat_msg.concat("\n안드로이드 OS빌드 : " + Device.getBuild());
  stat_msg = stat_msg.concat("\n안드로이드 버전코드 : " + Device.getAndroidVersionCode());
  stat_msg = stat_msg.concat("\n안드로이드 버전이름 : " + Device.getAndroidVersionCode());
  stat_msg = stat_msg.concat("\n휴대폰 브랜드명 : " + Device.getPhoneBrand());
  stat_msg = stat_msg.concat("\n휴대폰 모델명 : " + Device.getPhoneModel());
  stat_msg = stat_msg.concat("\n");
  stat_msg = stat_msg.concat("\n충전 여부 : " + Device.isCharging());
  stat_msg = stat_msg.concat("\n충전기 타입 : " + Device.getPlugType());
  stat_msg = stat_msg.concat("\n배터리 잔량 : " + Device.getBatteryLevel() + "%");
  stat_msg = stat_msg.concat("\n배터리 온도 : " + Device.getBatteryTemperature());
  stat_msg = stat_msg.concat("\n배터리 전압 : " + Device.getBatteryVoltage() + "mV");
  stat_msg = stat_msg.concat("\n배터리 상태 : " + Device.getBatteryStatus());
  stat_msg = stat_msg.concat("\n배터리 건강상태 : " + Device.getBatteryHealth());
  return stat_msg;
}

var FoodList = {
    "한식": ["불고기", "두루치기", "닭볶음", "쌈밥", "비빔밥", "생선구이", "한우정식", "낙지볶음", "양념게장", "간장게장", "고등어자반", "잡채", "더덕구이", "계란말이", "김치", "총각김치", "깍두기", "열무김치", "우엉조림", "멸치볶음", "소세지야채볶음", "스팸구이", "전복죽", "계란죽", "참치죽", "산적", "표고전", "풋고추전", "육전", "감자전", "해물파전", "김치전", "호박전", "오이소박이", "오징어볶음", "무생채", "북어구이", "너비아니", "두부조림"],
    "탕": ["김치찌개", "순두부찌개", "된장찌개", "부대찌개", "동태찌개", "청국장", "갈비탕", "추어탕", "삼계탕", "해물탕", "게국지", "알탕", "호박찌개", "고추장찌개", "시래기국", "만두국", "떡국"],
    "중식": ["짜장면", "짬뽕", "볶음밥", "탕수육", "마파두부", "양장피", "깐풍기", "유린기", "고추잡채", "군만두", "단무지", "칠리새우", "훠궈", "마라탕", "양꼬치", "양갈비"],
    "일식": ["초밥", "라멘", "낫또", "오니기리", "덮밥", "우동", "야키니쿠", "메밀소바", "돈카츠", "사케동"],
    "양식": ["로제파스타", "봉골레파스타", "크림파스타", "피자", "스테이크", "리조또", "햄버거", "시저샐러드", "빠네"],
    "고기": ["찜닭", "닭갈비", "월남쌈", "샤브샤브", "치킨", "스테이크", "떡갈비", "돼지갈비", "삼겹살", "소고기", "꽃등심", "육회", "양꼬치", "양갈비", "훠궈"],
    "해장": ["북어국", "콩나물국밥", "수육국밥", "순대국", "뼈해장국", "우거지국", "선지해장국", "올갱이국", "매운라면", "물냉면", , "우유", "맥주", "소주", "사케", "컨디션"],
    "간편": ["도시락", "샌드위치", "토스트", "샐러드", "닭가슴살 샐러드", "김밥", "떡볶이", "핫도그", "밥버거", "시리얼", "컵밥", "붕어빵", "핫바", "닭다리", "오뎅", "순대허파간"],
    "기타": ["쌀국수", "팟타이", "카레", "수제비", "칼국수", "아구찜", "베스킨라빈스31", "마카롱", "과자"]
};

function showFoodList(msg) {
    var rtn_msg = "";
    for (var key in FoodList) {
        if (msg.indexOf(key) != -1) {
            rtn_msg = rtn_msg.concat("########## " + key + " ##########\n");
            rtn_msg = rtn_msg.concat(FoodList[key] + "\n\n");
        }
    }
    if (rtn_msg == "") {
        for (var key in FoodList) {
            rtn_msg = rtn_msg.concat("########## " + key + " ##########\n");
            rtn_msg = rtn_msg.concat(FoodList[key] + "\n\n");
        }
    }
    return rtn_msg.slice(0, -2);
}

function recommendFood(msg) {
    var Foods = new Array();
    for (var key in FoodList) {
        if (msg.indexOf(key) != -1) Foods = Foods.concat(FoodList[key]);
    }

    if (!Array.isArray(Foods) || !Foods.length) {
        var keys = Object.keys(FoodList);
        Foods = FoodList[keys[(keys.length * Math.random()) << 0]];
    }
    return "저는 " + Foods[Math.floor(Math.random() * Foods.length)] + " 추천 드려요! 🍳";
}

function getFortune(sender, msg) {
    var rtn_msg = "";
    var seed = 970119;
    for (var i = 0; i < sender.length; i++) seed *= sender.charCodeAt(i);

    var date = new Date();
    seed *= date.getFullYear();
    seed *= date.getMonth() + 1;
    if (msg.indexOf("오늘") != -1 && msg.indexOf("내일") == -1) {
        rtn_msg = "# " + sender + "님의 오늘 운세 #";
        seed *= date.getDate();
    } else if (msg.indexOf("내일") != -1 && msg.indexOf("오늘") == -1) {
        rtn_msg = "# " + sender + "님의 내일 운세 #";
        date.setDate(date.getDate() + 1);
        seed *= date.getDate();
    } else {
        rtn_msg = "# " + sender + "님의 종합 운세 #";
        seed += 58;
    }

    var love = parseInt((seed = seed / 258)) % 5 + 1;
    var job = parseInt((seed = seed / 369)) % 5 + 1;
    var luck = parseInt((seed = seed / 987)) % 5 + 1;
    var gold = parseInt((seed = seed / 654)) % 5 + 1;
    var health = parseInt((seed = seed / 321)) % 5 + 1;

    if ((love + job + luck + gold + health) / 5 < 2) { love++; job++; luck++; gold++; health++; }

    rtn_msg = rtn_msg.concat("\n애정 "); while (love > 0) { rtn_msg = rtn_msg.concat("❤"); love--; }
    rtn_msg = rtn_msg.concat("\n직업 "); while (job > 0) { rtn_msg = rtn_msg.concat("🏆"); job--; }
    rtn_msg = rtn_msg.concat("\n행운 "); while (luck > 0) { rtn_msg = rtn_msg.concat("🍀"); luck--; }
    rtn_msg = rtn_msg.concat("\n금전 "); while (gold > 0) { rtn_msg = rtn_msg.concat("💎"); gold--; }
    rtn_msg = rtn_msg.concat("\n건강 "); while (health > 0) { rtn_msg = rtn_msg.concat("💊"); health--; }
    return rtn_msg;
}

function getHelp() {
    var rtn_msg = "## " + scriptName + " 도움말##";
    rtn_msg = rtn_msg.concat("\n# 명령어\n");
    rtn_msg = rtn_msg.concat("--도움말\n");
    rtn_msg = rtn_msg.concat("A vs B\n");
    rtn_msg = rtn_msg.concat("경기도 날씨\n");
    rtn_msg = rtn_msg.concat("메뉴 뭐, 메뉴 보여줘\n");
    rtn_msg = rtn_msg.concat("음식 추천, 뭐 먹지, ...\n");

    rtn_msg = rtn_msg.concat("\n# 봇 채팅\n");
    rtn_msg = rtn_msg.concat("민찬짱, 민찬쨩\n");
    rtn_msg = rtn_msg.concat("굿봇, 굿 봇, 구웃봇\n");
    rtn_msg = rtn_msg.concat("밷봇, 밷 봇, 배드봇\n");
    rtn_msg = rtn_msg.concat("~건데, ~껀데\n");
    rtn_msg = rtn_msg.concat("심심해\n");
    rtn_msg = rtn_msg.concat("응원, 위로해줘, 힘들어\n");
    rtn_msg = rtn_msg.concat("어때?, 좋아?, 싫어?\n");
    return rtn_msg;
}

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
      if (msg == "--도움말") {
        replier.reply(getHelp()); return;
    }
   if(msg.indexOf("하이")!=-1){
    replier.reply("하이~"+" "+sender+"!!");
  }
   if(msg.indexOf("ㅎㅇ")!=-1){
    replier.reply("ㅎㅇ~"+" "+sender+"!!");
  }
   if(msg.indexOf("하위")!=-1){
    replier.reply("하위~"+" "+sender+"!!");
  }
   if (msg.indexOf("날씨") != -1) {
    getWeather(replier,msg);
  }

      if (msg.indexOf("운세") != -1) {
        replier.reply(getFortune(sender, msg)); return;
    }
  if (msg.indexOf("vs") !=-1) {
    var content = msg.replace("vs","*").trim(); // 좌우 공백 제거
    if (content == "") return; // 내용이 없을 경우, 종료

    var array = content.split("*"); // 띄어쓰기를 기준으로 나눠 배열 array 생성
    for (var idx in array) {
      if (array[idx] == "") array.splice(idx, 1); // 값이 없을 경우, 배열에서 제거
    }
    replier.reply(array[Math.ceil(Math.random() * array.length) - 1] + "!!");
  }
    if (msg.indexOf("뭐하지") != -1) {
    var ment = ["피파!", "롤!", "잠자기!", "데이트!", "배그!","공부!","코딩!"];
    replier.reply(ment[Math.ceil(Math.random() * ment.length) - 1]);
  }
    if (msg.indexOf("메뉴") != -1 && (msg.indexOf("보여줘") != -1 || msg.indexOf("뭐") != -1)) {
        replier.reply(showFoodList(msg)); return;
    }

    if ((msg.indexOf("뭐") != -1 && (msg.indexOf("먹지") != -1 || msg.indexOf("먹을까") != -1 || msg.indexOf("먹는게") != -1)) || (msg.indexOf("추천") != -1)) {
        if (msg.indexOf("추천") != -1) {
            var flag = 0;
            for (var idx in FoodList) { if (msg.indexOf(idx) != - 1) flag = 1; }

            var list = ["아침", "점심", "저녁", "야식", "간식", "음식", "먹을"];
            for (var idx in list) { if (msg.indexOf(list[idx]) != - 1) flag = 1; }

            if (flag == 0) return;
        }
        replier.reply(recommendFood(msg)); return;
    }

  if (msg == "*디바이스 상태") replier.reply(deviceStatus());

  if (msg.indexOf("*공지") == 0) {
    var contents = msg.replace("*공지", "").trim();
    if (isNull(contents)) {
      replier.reply("ex) *공지\n디버그룸\n테스트 메시지 입니다.");
    } else {
      var room_name = contents.split("\n")[0]; // 공백이 오기 전 문자열
      var notice = contents.substring(contents.indexOf("\n") + 1); // 공백 다음 문자열
      replier.reply(room_name, notice);
    }
  }
  // 방 확인
  if (msg == "*방") replier.reply(showRooms());

  // 스크립트 상태 확인
  if (msg == "*상태") replier.reply(botStatus());

  // 스크립트 재컴파일
  if (msg.indexOf("*재컴파일") == 0) {
    var contents = msg.replace("*재컴파일", "").trim();
    if (isNull(contents)) {
      Api.reload();
      replier.reply("전체 스크립트가 재컴파일되었습니다.");
    } else {
      var scripts = contents.split(" ");
      for (var idx in scripts) {
        if (!isNull(scripts[idx])) {
          Api.reload(scripts[idx]);
          replier.reply(scripts[idx] + "(이)가 재컴파일되었습니다.");
        }
      }
    }
  }
     if(msg.indexOf('!무릉 ') == 0){
      var murung=msg.split(' ');
      var url = Utils.getWebText("https://maple.gg/u/"+murung[1]);
      if(url.indexOf('검색결과가 없습니다.') != -1){
         replier.reply('[' + murung[1] + ']\n' + '존재하지 않는 캐릭터 입니다.');
         return;
      }

      var data = url.split('text-white">')[3].split('더시드')[0].replace(/(<([^>]+)>)/g,"");
      data = data.replace(/ /gi, '');
      data = data.replace(/\n/gi, '');

      if (data.indexOf('기록이없습') != -1){
         replier.reply('[' + murung[1] + ']\n' + '기록이 없습니다');
         return;
      }

      else{
         var info, date;
         //replier.reply(data);
         if(data.indexOf('예전')==-1){
            info = data.split('초')[1].split('월드')[0];
            date = data.split('기준일:')[1].split('">')[0];
         }
         else{
            info = data.split('예전')[1].split('층')[1].split('월드')[0];
            date = data.split('기준일:')[2].split('">')[0];
         }
         var floor = data.split('록')[1].split('층')[0];
         var time = data.split('층')[1].split('Lv')[0];

         replier.reply('[' + murung[1] + ']\n' + info + '\n기록: ' + floor + '층\n시간: ' + time + '\n날짜: ' + date);
      }
    }

    // chatting
    if ((msg.indexOf("좋은") != -1 && msg.indexOf("아침") != -1) || (msg.indexOf("굿모닝") != -1)) {
        ment = [sender + "님, 좋은 아침이에요!", sender + "님, 굿모닝♬", sender + "님, 오늘 하루도 화이팅이에요!"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }
    if (msg.indexOf("좋은") != -1 && msg.indexOf("저녁") != -1) {
        ment = [sender + "님, 좋은 저녁이에요!", sender + "님, 오늘 하루도 수고 많으셨어요!"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }
    if ((msg.indexOf("좋은") != -1 && (msg.indexOf("꿈") != -1)) || (msg.indexOf("굿밤") != -1)) {
        ment = ["제 꿈 꿔요...♥", "좋은 꿈 꿔요💕", " ꈍ﹃ꈍ ", "쫀밤!", "굿밤 🐑"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }

    if (msg.indexOf("안녕") != -1) {
        ment = [sender + "님, 안녕하세요!!", "하이요!!", "하이하이"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }

    if (msg.indexOf("심심해") != -1) {
        var ment = ["밀린 과제나 업무가 있지는 않나요?", "오늘도 열공!! ٩(*•̀ᴗ•́*)و ", "운동! 운동! ୧(๑•̀ㅁ•́๑)૭✧", "저랑 같이 놀아요\n(っ˘▽˘)(˘▽˘)˘▽˘ς)", "_(-ω-`_)⌒)_"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }

    if (msg.indexOf("응원") != -1 || msg.indexOf("위로해줘") != -1 || msg.indexOf("힘들어") != -1) {
        var ment = ["힘내세요! ❀.(*´▽`*)❀.", "충분히 잘하고 계세요!", "҉*( ‘ω’ )/*҉", "아자! 아자! (ง •̀ω•́)ง✧", "마법 걸어줄게요\nଘ(੭*ˊᵕˋ)੭* ੈ✩‧₊˚❛ ֊ ❛„ 뾰로롱₊୭*ˈ ", "전 힘들 때 빗속에서 힙합을 춰요\n｀、、｀ヽ｀ヽ｀、、ヽヽ、｀、\nヽ｀ヽ｀ヽヽ｀ヽ｀、｀ヽ｀、ヽ\n｀｀、ヽ｀ヽ｀、ヽヽ｀ヽ、｀ヽ\n、ヽヽ｀ヽ｀ヽ、ヽ、｀ヽ｀ヽ、\nヽ｀ヽ｀ヽ、ዽ｀｀、ヽ｀、ヽヽ"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }

    if (msg.indexOf("어때?") != -1 || msg.indexOf("좋아?") != -1 || msg.indexOf("싫어?") != -1) {
        ment = ["좋아요! 🙆", "싫어요! 🙅", "고민되네요..😥", "다시 물어봐주세요!", sender + "님이 고르신 걸로! 0.<"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }


    if (msg.indexOf("굿봇") != -1 || msg.indexOf("굿 봇") != -1 || msg.indexOf("구웃봇") != -1) {
        var ment = ["(◍•ᴗ•◍)♡ ✧*。", "(･ω<)☆", " ꉂꉂ(ᵔᗜᵔ*) ", "°˖✧◝(⁰▿⁰)◜✧˖°", "(๑ゝڡ◕๑)", "（*´▽`*)", "(♡´艸`)", "ꈍ .̮ ꈍ", "( • ̀ω•́  )✧", "٩(๑•̀o•́๑)و", "(*´˘`*)♡", "٩(*´◒`*)۶♡"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    } else if (msg.indexOf("밷봇") != -1 || msg.indexOf("밷 봇") != -1 || msg.indexOf("배드봇") != -1) {
        var ment = ["ŏ̥̥̥̥םŏ̥̥̥̥", "( ´ｰ`)", "(ó﹏ò｡)", " ˃̣̣̣̣̣̣︿˂̣̣̣̣̣̣ ", ":3c", "(இ﹏இ`｡)", "( ･×･)", "｡ﾟﾟ(*´□`*｡)°ﾟ｡"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    } else if (msg.indexOf("껀데") > 0 || msg.indexOf("건데") > 0) {
        var ment = ["(｡•́ - •̀｡)", "(._. )", "...", "(・-・*)♪", "๑°⌓°๑"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    } else if (msg.indexOf("음악") != -1 || msg.indexOf("노래") != -1) {
        var ment = ["▶               3:14", "⇆ㅤㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤㅤ↻"];
        replier.reply(ment[Math.floor(Math.random() * ment.length)]);
    }
      if(msg.indexOf('!코디 ') == 0){
      var murung=msg.split(' ');
      var url = Utils.getWebText("https://maple.gg/u/"+murung[1]);
      if(url.indexOf('검색결과가 없습니다.') != -1){
         replier.reply('[' + murung[1] + ']\n' + '존재하지 않는 캐릭터 입니다.');
         return;
      }
    }
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}
