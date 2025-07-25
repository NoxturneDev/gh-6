"use client";

import Link from "next/link";
import { Search, Plus, School, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ExplorePage() {
  const [activePage, setActivePage] = useState("pengaduan");
  const [reports, setReports] = useState([]);
  const [donations, setDonations] = useState([]);

  const handleFetchReports = async (page = 1) => {
    try {
      const response = await axios.get(`/api/report?page=${page}&limit=10`);
      console.log("Fetched reports:", response.data);
      setReports(response.data.data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleFetchDonations = async (page = 1) => {
    try {
      const response = await axios.get(`/api/donation-campaigns?page=${page}&limit=10`);
      console.log("Fetched donations:", response.data);
      setDonations(response.data.data.campaigns);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  useEffect(() => {
    if (activePage === "pengaduan") {
      handleFetchReports();
    } else if (activePage === "donasi") {
      handleFetchDonations();
    }
  }, [activePage]);

  const handleActivePage = (page) => {
    setActivePage(page);
  };
  return (
    <section className="h-screen px-32 py-10">
      <div className="border border-blue-700 w-1/2 mx-auto flex items-center rounded-full">
        <div className="px-8 py-2 flex gap-x-4 w-full">
          <Search className="text-blue-700 cursor-pointer" />
          <input
            className="rounded-full w-full focus:outline-none focus:border-none placeholder:text-blue-700"
            placeholder="Provinsi Kota"
          />
        </div>
        <div className="w-1/2 flex text-blue-700 justify-center gap-x-8">
          <Link href="/">Home</Link>
          <Link href="/explore">Explore</Link>
        </div>
      </div>

      <div className="mt-20">
        <div className="flex justify-between">
          <div className="flex gap-x-4">
            <button
              onClick={() => handleActivePage("pengaduan")}
              className={`py-1 px-2 cursor-pointer ${activePage === "pengaduan" ? "border-b border-blue-700 text-blue-700" : ""}`}
            >
              Pengaduan Terkini
            </button>
            <button
              onClick={() => handleActivePage("donasi")}
              className={`py-1 px-2 cursor-pointer ${activePage === "donasi" ? "border-b border-blue-700 text-blue-700" : ""}`}
            >
              Donasi
            </button>
          </div>
          <button className="bg-blue-700 text-white px-7 cursor-pointer py-1 rounded-full">+ Buat Pengaduan</button>
        </div>
        {activePage === "pengaduan" ? (
          <div className="mt-10">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                username={report.name}
                date={report.submittedAt}
                title={report.title}
                region={report.region.name}
                image={report.imgUrl}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap gap-x-7">
            {donations.map((donation) => (
              <DonationCard
                key={donation.id}
                title={donation.title}
                description={donation.description}
                imgUrl={donation.imgUrl}
                regionName={donation.region?.name || "Tidak diketahui"}
                currentAmount={donation.currentAmount}
                targetAmount={donation.targetAmount}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ReportCard({ username, date, region, title, image }) {
  return (
    <div className="bg-white rounded-xl w-1/3 overflow-hidden">
      <img
        className="w-full h-48 object-cover"
        src={image}
        alt="Report Thumbnail"
      />
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-2">
          <span>{username}</span> &bull; <span>{new Date(date).toLocaleDateString()}</span> &bull; <span>{region}</span>
        </div>
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      </div>
    </div>
  );
}

function DonationCard({ title, description, imgUrl, regionName, schoolName = "SDN 1", currentAmount, targetAmount }) {
  const progress = (currentAmount / targetAmount) * 100;

  return (
    <div className="flex w-[48.9%] bg-white rounded-xl shadow-lg overflow-hidden">
      <img
        src={imgUrl}
        alt={title}
        className="w-1/4 object-cover"
      />
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <div className="flex items-center text-sm text-gray-500 gap-2 mb-1">
            <School className="w-4 h-4" />
            <span>{schoolName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{regionName}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-indigo-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-800">Rp {targetAmount.toLocaleString("id-ID")}</span>
          <button className="text-indigo-600 font-medium hover:underline">View Details</button>
        </div>
      </div>
    </div>
  );
}
