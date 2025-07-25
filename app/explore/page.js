"use client";

import Link from "next/link";
import { Search, Plus, School, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ExplorePage() {
  const [activePage, setActivePage] = useState("pengaduan");
  const [reports, setReports] = useState([]);
  const [donations, setDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [regions, setRegions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportFormData, setReportFormData] = useState({
    title: "",
    description: "",
    regionId: "",
    name: "",
    image: null
  });

  const [donationFormData, setDonationFormData] = useState({
    title: "",
    description: "",
    regionId: "",
    targetAmount: "",
    deadline: "",
    image: null
  });

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

  const handleFetchRegions = async () => {
    try {
      const response = await axios.get('/api/regions');
      setRegions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching regions:", error);
      setRegions([
        { id: 1, name: "Jakarta" },
        { id: 2, name: "Bandung" },
        { id: 3, name: "Surabaya" },
        { id: 4, name: "Medan" },
        { id: 5, name: "Semarang" }
      ]);
    }
  };

  useEffect(() => {
    if (activePage === "pengaduan") {
      handleFetchReports();
    } else if (activePage === "donasi") {
      handleFetchDonations();
    }
    handleFetchRegions();
  }, [activePage]);

  const handleActivePage = (page) => {
    setActivePage(page);
  };

  const handleReportInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setReportFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setReportFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDonationInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setDonationFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setDonationFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', reportFormData.title);
      submitData.append('description', reportFormData.description);
      submitData.append('regionId', reportFormData.regionId);
      submitData.append('name', reportFormData.name);
      if (reportFormData.image) {
        submitData.append('image', reportFormData.image);
      }

      const response = await axios.post('/api/report', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setReportFormData({
          title: "",
          description: "",
          regionId: "",
          name: "",
          image: null
        });

        setShowModal(false);

        handleFetchReports();

        alert('Pengaduan berhasil dibuat!');
      }
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Gagal membuat pengaduan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', donationFormData.title);
      submitData.append('description', donationFormData.description);
      submitData.append('regionId', donationFormData.regionId);
      submitData.append('targetAmount', donationFormData.targetAmount);
      submitData.append('deadline', donationFormData.deadline);

      if (donationFormData.image) {
        submitData.append('image', donationFormData.image);
      }

      const response = await axios.post('/api/donation-campaigns', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Reset form
        setDonationFormData({
          title: "",
          description: "",
          regionId: "",
          targetAmount: "",
          deadline: "",
          image: null
        });

        setShowModal(false);

        handleFetchDonations();

        alert('Kampanye donasi berhasil dibuat!');
      }
    } catch (error) {
      console.error('Error creating donation campaign:', error);
      const errorMessage = error.response?.data?.error || 'Gagal membuat kampanye donasi. Silakan coba lagi.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateButton = () => {
    setShowModal(true);
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
          <button
            onClick={handleCreateButton}
            className="bg-blue-700 text-white px-7 cursor-pointer py-1 rounded-full"
          >
            + {activePage === "pengaduan" ? "Buat Pengaduan" : "Buat Donasi"}
          </button>
        </div>

        {activePage === "pengaduan" ? (
          <div className="mt-10 flex flex-wrap gap-7">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                username={report.name}
                date={report.submittedAt}
                title={report.title}
                region={report.region.name}
                image={report.imgUrl}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap gap-7">
            {donations.map((donation) => (
              <DonationCard
                key={donation.id}
                id={donation.id}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {activePage === "pengaduan" ? "Buat Pengaduan Baru" : "Buat Kampanye Donasi"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {activePage === "pengaduan" ? (
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Pengaduan
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={reportFormData.title}
                    onChange={handleReportInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pelapor
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reportFormData.name}
                    onChange={handleReportInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wilayah
                  </label>
                  <select
                    name="regionId"
                    value={reportFormData.regionId}
                    onChange={handleReportInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Wilayah</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={reportFormData.description}
                    onChange={handleReportInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gambar (Opsional)
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleReportInputChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: JPEG, JPG, PNG, GIF, WebP. Maksimal 5MB
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Pengaduan"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmitDonation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Kampanye
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={donationFormData.title}
                    onChange={handleDonationInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wilayah
                  </label>
                  <select
                    name="regionId"
                    value={donationFormData.regionId}
                    onChange={handleDonationInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Wilayah</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Donasi (Rp)
                  </label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={donationFormData.targetAmount}
                    onChange={handleDonationInputChange}
                    step="1000"
                    placeholder="Contoh: 10000000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    value={donationFormData.deadline}
                    onChange={handleDonationInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={donationFormData.description}
                    onChange={handleDonationInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jelaskan tujuan dan kebutuhan donasi..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gambar Kampanye (Opsional)
                  </label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleDonationInputChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: JPEG, JPG, PNG, GIF, WebP. Maksimal 5MB
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Membuat..." : "Buat Kampanye"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ReportCard({ username, date, region, title, image }) {
  return (
    <div className="bg-white rounded-xl w-[31.9%] overflow-hidden">
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

function DonationCard({ id, title, description, imgUrl, regionName, schoolName = "SDN 1", currentAmount, targetAmount }) {
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
          <Link href={`/explore/${id}`} className="text-indigo-600 font-medium hover:underline">View Details</Link>
        </div>
      </div>
    </div>
  );
}
