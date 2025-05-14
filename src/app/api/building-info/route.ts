import { NextResponse } from "next/server";
import {
  getAddressInfo,
  getBuildingInfo,
  getFloorInfo,
} from "../../lib/building";

export async function POST(request: Request) {
  try {
    const { address } = await request.json();

    const juso_info = await getAddressInfo(address);

    const building_info = await getBuildingInfo(
      juso_info.admCd,
      juso_info.bun,
      juso_info.ji,
      juso_info.platGbCdNm
    );

    // 사용승인일 포맷 변환
    const use_apr_day = building_info.useAprDay || "";
    const formatted_date =
      use_apr_day && use_apr_day.length === 8
        ? `${use_apr_day.slice(0, 4)}-${use_apr_day.slice(
            4,
            6
          )}-${use_apr_day.slice(6)}`
        : "없음";

    // 층별 정보 조회
    const floor_info = await getFloorInfo(
      juso_info.admCd,
      juso_info.bun,
      juso_info.ji,
      juso_info.platGbCdNm
    );

    // 층별 정보 처리
    const floor_groups = new Map();
    if (floor_info) {
      for (const floor of floor_info) {
        const floor_name = floor.flrNoNm || "";
        const area = parseFloat(floor.area || "0");
        const purpose = floor.etcPurps || "";
        const structure = floor.etcStrct || "";

        if (!floor_groups.has(floor_name)) {
          floor_groups.set(floor_name, {
            total_area: 0,
            purposes: new Set(),
            structures: new Set(),
          });
        }

        const group = floor_groups.get(floor_name);
        group.total_area += area;
        if (purpose) group.purposes.add(purpose);
        if (structure) group.structures.add(structure);
      }
    }

    // 응답 데이터 구성
    const response_data = {
      address: {
        roadAddr: juso_info.roadAddr,
        jibunAddr: juso_info.jibunAddr,
      },
      building: {
        platArea: building_info.platArea || "없음",
        archArea: building_info.archArea || "없음",
        totArea: building_info.totArea || "없음",
        mainPurpsCdNm: building_info.mainPurpsCdNm || "없음",
        grndFlrCnt: building_info.grndFlrCnt || "없음",
        ugrndFlrCnt: building_info.ugrndFlrCnt || "없음",
        useAprDay: formatted_date,
        parkingCount:
          parseInt(building_info.indrMechUtcnt || "0") +
          parseInt(building_info.oudrMechUtcnt || "0") +
          parseInt(building_info.indrAutoUtcnt || "0") +
          parseInt(building_info.oudrAutoUtcnt || "0"),
      },
      floors: Array.from(floor_groups.entries())
        .map(([floor_name, info]) => ({
          name: floor_name,
          total_area: info.total_area,
          purposes: Array.from(info.purposes),
          structures: Array.from(info.structures),
        }))
        .sort((a, b) => {
          const aIsBasement = a.name.startsWith("지");
          const bIsBasement = b.name.startsWith("지");
          if (aIsBasement !== bIsBasement) return aIsBasement ? -1 : 1;
          const aNum = parseInt(a.name.replace(/[^0-9]/g, ""));
          const bNum = parseInt(b.name.replace(/[^0-9]/g, ""));
          return aNum - bNum;
        }),
    };

    return NextResponse.json(response_data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
