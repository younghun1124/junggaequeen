import requests
import json
from collections import defaultdict
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용
    allow_credentials=False,  # credentials 비활성화
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# ▼ 본인의 API 키로 교체하세요
JUSO_KEY = "U01TX0FVVEgyMDI1MDUxMzIxMjYzNzExNTc0NjU="
BLDG_KEY = "yFX21EBzf2bmN/BRlsbQgxNChoMyPOcfBI/GC5K6J976oLqhX7nopWRd+lpXq+6UuiF3BCOW5J1mqdeQjJ/f5Q=="

# 1. 주소 → 법정동코드, 본번, 부번 추출
def get_address_info(juso):
    url = "https://business.juso.go.kr/addrlink/addrLinkApi.do"
    params = {
        "confmKey": JUSO_KEY,
        "currentPage": 1,
        "countPerPage": 1,
        "keyword": juso,
        "resultType": "json"
    }
    res = requests.get(url, params=params)
    data = res.json()
    
    if "juso" not in data["results"] or not data["results"]["juso"]:
        raise ValueError("주소 결과 없음")

    juso_info = data["results"]["juso"][0]
    return {
        "roadAddr": juso_info["roadAddr"],
        "jibunAddr": juso_info["jibunAddr"],
        "admCd": juso_info["admCd"],  # 법정동 코드 10자리
        "bun": juso_info["lnbrMnnm"],  # 본번
        "ji": juso_info["lnbrSlno"],   # 부번
        "platGbCdNm": juso_info["mtYn"] # 대지여부(0 : 대지, 1 : 산)
    }

# 2. 건축물대장 표제부 정보 조회
def get_building_info(admCd, bun, ji, platGbCd):
    sigunguCd = admCd[:5]
    bjdongCd = admCd[5:]
    url = "http://apis.data.go.kr/1613000/BldRgstHubService/getBrTitleInfo"
    params = {
        "serviceKey": BLDG_KEY,
        "sigunguCd": sigunguCd,
        "bjdongCd": bjdongCd,
        "platGbCd": platGbCd,
        "bun": bun.zfill(4),
        "ji": ji.zfill(4),
        "_type": "json",
        "numOfRows": 100,
        "pageNo": 1
    }
    res = requests.get(url, params=params)
    data = res.json()
    return data["response"]["body"]["items"]["item"][0]

# 3. 층별 정보 조회
def get_floor_info(admCd, bun, ji, platGbCd):
    sigunguCd = admCd[:5]
    bjdongCd = admCd[5:]
    url = "http://apis.data.go.kr/1613000/BldRgstHubService/getBrFlrOulnInfo"
    params = {
        "serviceKey": BLDG_KEY,
        "sigunguCd": sigunguCd,
        "bjdongCd": bjdongCd,
        "platGbCd": platGbCd,
        "bun": bun.zfill(4),
        "ji": ji.zfill(4),
        "_type": "json",
        "numOfRows": 10,
        "pageNo": 1
    }
    res = requests.get(url, params=params)
    data = res.json()
    return data["response"]["body"]["items"]["item"]

class AddressRequest(BaseModel):
    address: str

@app.post("/api/building-info")
async def get_building_info_endpoint(request: AddressRequest):
    try:
        juso_info = get_address_info(request.address)
        
        building_info = get_building_info(
            admCd=juso_info["admCd"],
            bun=juso_info["bun"],
            ji=juso_info["ji"],
            platGbCd=juso_info["platGbCdNm"]
        )

        # 사용승인일 포맷 변환
        use_apr_day = building_info.get("useAprDay", "")
        if use_apr_day and len(use_apr_day) == 8:
            formatted_date = f"{use_apr_day[:4]}-{use_apr_day[4:6]}-{use_apr_day[6:]}"
        else:
            formatted_date = "없음"

        # 층별 정보 조회
        floor_info = get_floor_info(
            admCd=juso_info["admCd"],
            bun=juso_info["bun"],
            ji=juso_info["ji"],
            platGbCd=juso_info["platGbCdNm"]
        )

        # 층별 정보 처리
        floor_groups = defaultdict(lambda: {"total_area": 0, "purposes": set(), "structures": set()})
        if floor_info:
            for floor in floor_info:
                floor_name = floor.get('flrNoNm', '')
                area = float(floor.get('area', 0))
                purpose = floor.get('etcPurps', '')
                structure = floor.get('etcStrct', '')
                
                floor_groups[floor_name]["total_area"] += area
                if purpose:
                    floor_groups[floor_name]["purposes"].add(purpose)
                if structure:
                    floor_groups[floor_name]["structures"].add(structure)

        # 응답 데이터 구성
        response_data = {
            "address": {
                "roadAddr": juso_info["roadAddr"],
                "jibunAddr": juso_info["jibunAddr"]
            },
            "building": {
                "platArea": building_info.get("platArea", "없음"),
                "archArea": building_info.get("archArea", "없음"),
                "totArea": building_info.get("totArea", "없음"),
                "mainPurpsCdNm": building_info.get("mainPurpsCdNm", "없음"),
                "grndFlrCnt": building_info.get("grndFlrCnt", "없음"),
                "ugrndFlrCnt": building_info.get("ugrndFlrCnt", "없음"),
                "useAprDay": formatted_date,
                "parkingCount": int(building_info.get("indrMechUtcnt", "0")) + 
                              int(building_info.get("oudrMechUtcnt", "0")) + 
                              int(building_info.get("indrAutoUtcnt", "0")) + 
                              int(building_info.get("oudrAutoUtcnt", "0"))
            },
            "floors": [
                {
                    "name": floor_name,
                    "total_area": info["total_area"],
                    "purposes": list(info["purposes"]),
                    "structures": list(info["structures"])
                }
                for floor_name, info in sorted(floor_groups.items(), 
                    key=lambda x: (x[0].startswith('지'), 
                                 int(x[0].replace('지', '')) if x[0].startswith('지') 
                                 else int(x[0].replace('층', ''))))
            ]
        }
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)