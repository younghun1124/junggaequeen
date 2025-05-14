// API 키 설정
const JUSO_KEY = process.env.JUSO_KEY || "";
const BLDG_KEY = process.env.BLDG_KEY || "";

interface AddressInfo {
  roadAddr: string;
  jibunAddr: string;
  admCd: string;
  bun: string;
  ji: string;
  platGbCdNm: string;
}

// 1. 주소 → 법정동코드, 본번, 부번 추출
export async function getAddressInfo(juso: string): Promise<AddressInfo> {
  const url = "https://business.juso.go.kr/addrlink/addrLinkApi.do";
  const params = new URLSearchParams({
    confmKey: JUSO_KEY,
    currentPage: "1",
    countPerPage: "1",
    keyword: juso,
    resultType: "json",
  });

  const res = await fetch(`${url}?${params}`);
  const data = await res.json();

  if (!data.results?.juso?.length) {
    throw new Error("주소 결과 없음");
  }

  const juso_info = data.results.juso[0];
  return {
    roadAddr: juso_info.roadAddr,
    jibunAddr: juso_info.jibunAddr,
    admCd: juso_info.admCd,
    bun: juso_info.lnbrMnnm,
    ji: juso_info.lnbrSlno,
    platGbCdNm: juso_info.mtYn,
  };
}

// 2. 건축물대장 표제부 정보 조회
export async function getBuildingInfo(
  admCd: string,
  bun: string,
  ji: string,
  platGbCd: string
) {
  const sigunguCd = admCd.slice(0, 5);
  const bjdongCd = admCd.slice(5);
  const url = "http://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo";
  const params = new URLSearchParams({
    serviceKey: BLDG_KEY,
    sigunguCd,
    bjdongCd,
    platGbCd,
    bun: bun.padStart(4, "0"),
    ji: ji.padStart(4, "0"),
    _type: "json",
    numOfRows: "100",
    pageNo: "1",
  });

  const res = await fetch(`${url}?${params}`);
  const data = await res.json();
  return data.response.body.items.item[0];
}

// 3. 층별 정보 조회
export async function getFloorInfo(
  admCd: string,
  bun: string,
  ji: string,
  platGbCd: string
) {
  const sigunguCd = admCd.slice(0, 5);
  const bjdongCd = admCd.slice(5);
  const url =
    "http://apis.data.go.kr/1613000/BldRgstHubService/getBrFlrOulnInfo";
  const params = new URLSearchParams({
    serviceKey: BLDG_KEY,
    sigunguCd,
    bjdongCd,
    platGbCd,
    bun: bun.padStart(4, "0"),
    ji: ji.padStart(4, "0"),
    _type: "json",
    numOfRows: "10",
    pageNo: "1",
  });

  const res = await fetch(`${url}?${params}`);
  const data = await res.json();
  return data.response.body.items.item;
}
