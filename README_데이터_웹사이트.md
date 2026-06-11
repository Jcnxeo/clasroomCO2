# 교실 공기와 집중도 분석 웹사이트 자료 설명

## 만든 산출물

- `site/index.html`: 브라우저로 바로 열 수 있는 분석 웹사이트
- `site/data.js`: 웹사이트에 표시되는 정리 데이터
- `data/processed/indoor_air_quality_subway_standard.csv`: 공공데이터포털 실내공기질 표준데이터 정리본
- `data/processed/analysis_summary.json`: 정리 데이터 통계 요약
- `data/processed/paper_summary.json`: 제공한 KCI 논문에서 추출한 근거 문장 요약
- `data/processed/classroom_focus_survey_template.csv`: 실제 교실에서 CO2, 온도, 습도, 졸림, 집중도를 기록할 조사 양식

## 사용한 데이터

1. 공공데이터포털 전국지하철공기질측정정보표준데이터
   - URL: https://www.data.go.kr/data/15114145/standard.do
   - 수집 행 수: 285행
   - 포함 변수: CO2, PM10, PM2.5, 폼알데하이드, CO, NO2, 라돈, VOC 등
   - 역할: 교실 데이터가 직접 확보되지 않았을 때 쓸 수 있는 실내 화학적 환경 분석용 공개 대체 데이터

2. KCI 논문 PDF
   - 파일: `C:\Users\user\Downloads\KCI_FI002010545.pdf`
   - 역할: 교실 CO2 농도와 학습/집중 관련성을 설명하는 문헌 근거

3. KAIST 학교_F440 데이터
   - URL: https://www.bigdata-environment.kr/user/data_market/detail.do?id=825f2d80-453d-11ec-a070-ab81432fd4e1
   - 역할: 주제에 가장 가까운 학교 실내공기질 데이터
   - 상태: 자동 다운로드가 아니라 플랫폼/제공기관 요청 또는 승인 절차가 필요한 데이터

## 해석 주의점

현재 자동 확보한 공공 CSV에는 실제 학생 집중도 점수가 들어 있지 않다. 그래서 웹사이트는 공개 실내공기질 자료로 환경 변수 분석 방법을 보여 주고, 집중도와의 관계는 논문 근거와 직접 교실 조사 양식으로 연결하는 구조이다.
