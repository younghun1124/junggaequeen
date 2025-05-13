"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [address, setAddress] = useState("");
  const [propertyData, setPropertyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 가상의 부동산 데이터를 생성하는 함수
  const fetchPropertyData = (address) => {
    // 실제 구현에서는 API 호출로 대체
    setIsLoading(true);

    // 데모 목적으로 타임아웃 사용
    setTimeout(() => {
      const mockData = [
        {
          address: address,
          price: "5억 2000만원",
          size: "84.3m²",
          rooms: "3",
          built: "2010년",
        },
        {
          address: address + " 인근",
          price: "4억 8000만원",
          size: "76.2m²",
          rooms: "2",
          built: "2012년",
        },
        {
          address: address + " 주변",
          price: "6억 1000만원",
          size: "92.5m²",
          rooms: "3",
          built: "2015년",
        },
        {
          address: address + " 근처",
          price: "5억 5000만원",
          size: "88.1m²",
          rooms: "3",
          built: "2011년",
        },
      ];

      setPropertyData(mockData);
      setIsLoading(false);
      setShowResults(true);
    }, 1500);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (address.trim()) {
      fetchPropertyData(address);
    }
  };

  const handleCopyToClipboard = () => {
    // 테이블 데이터를 탭으로 구분된 텍스트로 변환
    const headers = ["주소", "가격", "면적", "방 개수", "건축년도"];
    const rows = propertyData.map(
      (item) =>
        `${item.address}\t${item.price}\t${item.size}\t${item.rooms}\t${item.built}`
    );

    const clipboardText = [headers.join("\t"), ...rows].join("\n");

    navigator.clipboard
      .writeText(clipboardText)
      .then(() => alert("클립보드에 복사되었습니다. 엑셀에 붙여넣기 하세요."))
      .catch((err) => console.error("클립보드 복사 실패:", err));
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
            다음 단계에서 더 자세한 정보를 추가할 수 있습니다.
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
            <p className="mt-2">부동산 정보를 불러오는 중입니다...</p>
          </div>
        )}

        {showResults && !isLoading && (
          <div className="mt-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">검색 결과</h3>
              <button
                onClick={handleCopyToClipboard}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                엑셀로 복사
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border-b text-left">주소</th>
                    <th className="py-3 px-4 border-b text-left">가격</th>
                    <th className="py-3 px-4 border-b text-left">면적</th>
                    <th className="py-3 px-4 border-b text-left">방 개수</th>
                    <th className="py-3 px-4 border-b text-left">건축년도</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyData.map((property, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="py-3 px-4 border-b">{property.address}</td>
                      <td className="py-3 px-4 border-b">{property.price}</td>
                      <td className="py-3 px-4 border-b">{property.size}</td>
                      <td className="py-3 px-4 border-b">{property.rooms}</td>
                      <td className="py-3 px-4 border-b">{property.built}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>© 2023 부동산 정보 탐색기. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}
