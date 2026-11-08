/* ================================================================
   연수 웹앱 설정 파일 — 이 파일만 고치면 됩니다.
   ================================================================ */
window.APP_CONFIG = {
  // ① Firebase 설정값
  //    Firebase 콘솔 > 프로젝트 설정(톱니바퀴) > 일반 > 내 앱 > "SDK 설정 및 구성" > "구성(Config)"에
  //    나오는 { apiKey: ..., authDomain: ..., ... } 덩어리를 아래 null 자리에 그대로 붙여 넣으세요.
  //    null 로 두면 "체험 모드"로 동작합니다(같은 브라우저 안에서만 저장·동기화).
  firebase: {
    apiKey: "AIzaSyAAl37A7vGU0xU1eKhR3Juh2B65JP6DGOY",
    authDomain: "aiedap-ce609.firebaseapp.com",
    projectId: "aiedap-ce609",
    storageBucket: "aiedap-ce609.firebasestorage.app",
    messagingSenderId: "39423744530",
    appId: "1:39423744530:web:2a6be6a6ac5d1bd8bf56cb",
    measurementId: "G-XJ19GGJNH8"
  },

  // ② 강사 계정 이메일 (Firebase > Authentication > 사용자에 추가한 이메일)
  //    ⚠ 이메일만 적으세요. 이 파일은 누구나 볼 수 있어서 비밀번호를 적으면 안 됩니다.
  //    비밀번호는 강사 화면에서 직접 입력합니다.
  instructorEmail: "romans082627@gmail.com",

  // ③ 체험 모드에서 쓰는 강사 비밀번호 (Firebase 연결 후에는 사용되지 않음)
  demoPassword: "1234",

  // ④ 기본 차수 코드 (주소 뒤에 ?room=코드 를 붙이면 차수를 나눠 운영할 수 있어요)
  defaultRoom: "module5",

  // ⑤ 화면에 표시되는 연수 정보
  courseTitle: "2026 AIEDAP 마스터교원 신규연수",
  instructor: { name: "손우재", org: "경남권역 명진초등학교" },

  // ⑥ 마무리 단계 링크
  postSurvey: { code: "58SMRVK", url: "https://www.aiedap.or.kr" },
  satisfaction: { label: "숏.한국/아이에답/", url: "https://숏.한국/아이에답/" }
};
