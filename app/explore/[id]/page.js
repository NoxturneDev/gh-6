"use client";

import { Search, MapPin, X, CheckCircle, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DonationCampaignsDetailPage() {
  const [donationCampaign, setDonationCampaign] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    donorName: "",
    amount: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  const { id } = useParams();

  useEffect(() => {
    const handleGetDonationCampaign = async () => {
      try {
        const response = await axios.get(`/api/donation-campaigns/${id}`);
        setDonationCampaign(response.data.data);
        console.log('Campaign data:', response.data);
      } catch (error) {
        console.error("Error fetching donation campaign:", error);
        showNotification('error', 'Gagal memuat data campaign');
      }
    };

    if (id) {
      handleGetDonationCampaign();
    }
  }, [id]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Jumlah donasi harus berupa angka dan lebih dari 0";
    }
    
    if (!donationCampaign.regionId && !donationCampaign.region?.id) {
      newErrors.region = "Region tidak ditemukan untuk campaign ini";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitDonation = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Mohon periksa form Anda');
      return;
    }

    setIsLoading(true);
    
    try {
      const donationData = {
        donorName: formData.donorName.trim() || "Anonymous",
        amount: parseFloat(formData.amount),
        message: formData.message.trim() || "",
        regionId: donationCampaign.regionId || donationCampaign.region?.id
      };

      console.log('Sending donation data:', donationData);

      const response = await axios.post("/api/donation", donationData);
      
      if (response.data.success) {
        showNotification('success', 'Donasi berhasil dibuat! Mengarahkan ke pembayaran...');
        
        setTimeout(() => {
          closeModal();
          
          if (response.data.data.paymentUrl) {
            // window.location.href = response.data.data.paymentUrl;
          } else {
            showNotification('info', 'Silakan lanjutkan pembayaran manual');
          }
        }, 1000);
        
      } else {
        throw new Error(response.data.error || 'Donation creation failed');
      }
      
    } catch (error) {
      console.error("Error creating donation:", error);
      
      let errorMessage = "Gagal membuat donasi. Silakan coba lagi.";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ donorName: "", amount: "", message: "" });
    setErrors({});
  };

  const openModal = () => {
    if (!donationCampaign.id) {
      showNotification('error', 'Campaign belum dimuat. Silakan tunggu sebentar.');
      return;
    }
    setIsModalOpen(true);
  };

  const progress = donationCampaign.currentAmount && donationCampaign.targetAmount 
    ? Math.min((donationCampaign.currentAmount / donationCampaign.targetAmount) * 100, 100) 
    : 0;

  return (
    <section className="min-h-screen px-4 md:px-32 py-10">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="border border-blue-700 w-full md:w-1/2 mx-auto flex items-center rounded-full">
        <div className="px-8 py-2 flex gap-x-4 w-full">
          <Search className="text-blue-700 cursor-pointer" />
          <input
            className="rounded-full w-full focus:outline-none focus:border-none placeholder:text-blue-700"
            placeholder="Provinsi Kota"
          />
        </div>
        <div className="w-full md:w-1/2 flex text-blue-700 justify-center gap-x-8">
          <Link href="/">Home</Link>
          <Link href="/explore">Explore</Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col mt-20 md:flex-row gap-6 p-6 items-center justify-center">
        <div className="w-full md:w-1/2 max-w-md">
          <img
            src={donationCampaign.imgUrl || "/placeholder-campaign.jpg"}
            alt="Poster Donasi"
            className="rounded-md w-full object-cover h-64 md:h-80"
          />
        </div>

        {/* Detail */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          <h1 className="text-3xl font-bold">{donationCampaign.title || 'Loading...'}</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            {donationCampaign.description || 'Loading description...'}
          </p>

          <div className="text-sm text-gray-500 flex flex-col gap-1">
            <div>
              <strong>{donationCampaign.organizationName || 'SDN 1'}</strong>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <p>{donationCampaign.region?.name || donationCampaign.regionName || 'Loading location...'}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-2">
            <div className="text-sm text-gray-700 mb-1">
              Rp {(donationCampaign.currentAmount || 0).toLocaleString('id-ID')} dari Rp {(donationCampaign.targetAmount || 0).toLocaleString('id-ID')} terkumpul
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{progress.toFixed(1)}% tercapai</div>
          </div>

          {/* Donation Button */}
          <button 
            onClick={openModal}
            disabled={!donationCampaign.id}
            className="bg-blue-600 text-white mt-4 px-6 py-2 rounded-md w-fit hover:bg-blue-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {donationCampaign.id ? 'Donasi →' : 'Loading...'}
          </button>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Buat Donasi</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campaign Info */}
            <div className="mb-4 p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>Campaign:</strong> {donationCampaign.title}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Target: Rp {(donationCampaign.targetAmount || 0).toLocaleString('id-ID')}
              </p>
            </div>

            <div>
              {/* Donor Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Donatur <span className="text-gray-400">(Opsional)</span>
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama Anda atau kosongkan untuk Anonymous"
                  maxLength="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Kosongkan jika ingin donasi secara anonim
                </p>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Donasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="10000"
                    min="1"
                    step="1000"
                    required
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.amount}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[10000, 25000, 50000, 100000, 250000].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 rounded-full transition-colors"
                    >
                      Rp {amount.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pesan Dukungan <span className="text-gray-400">(Opsional)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tulis pesan dukungan Anda..."
                  maxLength="500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/500 karakter
                </p>
              </div>

              {/* Summary */}
              {formData.amount && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Ringkasan Donasi:</strong>
                  </p>
                  <p className="text-sm">Nama: {formData.donorName || 'Anonymous'}</p>
                  <p className="text-sm">Jumlah: Rp {parseFloat(formData.amount || 0).toLocaleString('id-ID')}</p>
                  {formData.message && <p className="text-sm">Pesan: {formData.message}</p>}
                </div>
              )}

              {/* Error Display */}
              {errors.region && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.region}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDonation}
                  disabled={isLoading || !formData.amount || parseFloat(formData.amount) <= 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </div>
                  ) : (
                    'Lanjut ke Pembayaran'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}