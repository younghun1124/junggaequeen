"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [address, setAddress] = useState("");
  const [buildingData, setBuildingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (address.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "http://localhost:8001/api/building-info",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            mode: "cors",
            body: JSON.stringify({ address: address }),
          }
        );

        if (!response.ok) {
          throw new Error("건물 정보를 가져오는데 실패했습니다.");
        }

        const data = await response.json();
        setBuildingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 표 복사 함수
  const handleCopyTableToClipboard = () => {
    const row = [
      buildingData.address.roadAddr,
      buildingData.address.jibunAddr,
      buildingData.building.platArea,
      buildingData.building.totArea,
      buildingData.building.archArea,
      buildingData.building.ugrndFlrCnt,
      buildingData.building.grndFlrCnt,
      buildingData.floors
        .find((f) => f.name === "지1")
        ?.total_area.toFixed(2) || "-",
      buildingData.floors
        .find((f) => f.name === "지2")
        ?.total_area.toFixed(2) || "-",
      buildingData.floors
        .find((f) => f.name === "1층")
        ?.total_area.toFixed(2) || "-",
      buildingData.floors
        .find((f) => f.name === "2층")
        ?.total_area.toFixed(2) || "-",
      buildingData.building.parkingCount + "대",
      buildingData.building.useAprDay,
    ];
    const clipboardText = row.join("\t");
    navigator.clipboard
      .writeText(clipboardText)
      .then(() => alert("클립보드에 복사되었습니다. 엑셀에 붙여넣기 하세요."))
      .catch(() => alert("복사에 실패했습니다."));
  };

  return (
    <div className="min-h-screen p-8 font-sans">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">부동산 정보 탐색기</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          매물 등록하기
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            어디에 있는 부동산을 찾으시나요?
          </h2>
          <p className="text-gray-600 mb-8">
            주소를 입력하면 건물 정보를 확인할 수 있습니다.
          </p>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="주소를 입력하세요"
                className="flex-grow p-3 border rounded-lg text-lg"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? "검색 중..." : "검색"}
              </button>
            </div>
          </form>
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2">건물 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-10 text-red-500">
            <p>{error}</p>
          </div>
        )}

        {buildingData && !isLoading && (
          <div className="mt-10 flex flex-col items-center w-full">
            <button
              onClick={handleCopyTableToClipboard}
              className="mb-4 self-end bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              엑셀로 복사
            </button>
            <table className="w-auto border-separate border-spacing-0 text-base table-fixed">
              <colgroup>
                <col className="w-[50px]" />
                <col className="w-[260px]" />
                <col className="w-[260px]" />
                <col className="w-[90px]" />
                <col className="w-[90px]" />
                <col className="w-[90px]" />
                <col className="w-[70px]" />
                <col className="w-[70px]" />
                <col className="w-[90px]" />
                <col className="w-[90px]" />
                <col className="w-[90px]" />
                <col className="w-[70px]" />
                <col className="w-[110px]" />
              </colgroup>
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap"></th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    도로명주소
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    지번주소
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    대지면적
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    연면적
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    건축면적
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    지하
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    지상
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    지하 1층
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    지하 2층
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    1층
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    2층
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    주차장
                  </th>
                  <th className="border border-gray-200 px-4 py-2 font-semibold whitespace-nowrap">
                    사용승인일
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center bg-white hover:bg-gray-50 transition">
                  <td className="border border-gray-200 px-4 py-2 font-medium bg-gray-50">
                    정보
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-pre-line">
                    {buildingData.address.roadAddr}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-pre-line">
                    {buildingData.address.jibunAddr}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.building.platArea}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.building.totArea}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.building.archArea}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.building.ugrndFlrCnt}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.building.grndFlrCnt}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.floors
                      .find((f) => f.name === "지1")
                      ?.total_area.toFixed(2) || "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.floors
                      .find((f) => f.name === "지2")
                      ?.total_area.toFixed(2) || "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.floors
                      .find((f) => f.name === "1층")
                      ?.total_area.toFixed(2) || "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.floors
                      .find((f) => f.name === "2층")
                      ?.total_area.toFixed(2) || "-"}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.building.parkingCount}대
                  </td>
                  <td className="border border-gray-200 px-4 py-2 whitespace-nowrap">
                    {buildingData.building.useAprDay}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>© 2023 부동산 정보 탐색기. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}
