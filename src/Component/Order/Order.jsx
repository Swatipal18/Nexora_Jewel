import React, { useEffect, useState } from 'react';
import styles from './Order.module.css';
import Pending from './Tabs/Pending';
import { useLocation } from 'react-router-dom';

import axiosInstance from '../../api/axiosInstance';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { GoSortAsc, GoSortDesc } from 'react-icons/go';
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6';
import { HiAdjustmentsVertical } from 'react-icons/hi2';


const tabs = ['pending', 'confirmed', 'processing', 'picked', 'shipped', 'delivered', 'cancelled'];


function Order() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setAllOrder] = useState([])
  const [sortOrder, setSortOrder] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0);
  const [expandRequest, setExpandRequest] = useState(null);
  const [isTabReady, setIsTabReady] = useState(false);
  const FILTER_OPTIONS = ['Today', 'Last 7 Days', 'This Month', 'Custom'];
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });
  const location = useLocation();


  const[loading,Setloader]=useState(false)

  const viewOrderId = location.state?.orderId || null;
  // console.log(' viewOrderId: ', viewOrderId);

  const viewStatus = location.state?.status || null;
  // console.log('viewStatus: ', viewStatus);

  // isme me filter kese apply karu muje

  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  async function getOrder(search, filterDto = selectedFilter, startDate, endDate) {
    try {
      Setloader(true)
      const params = {
        status: activeTab,
        search,
        sortOrder,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        filterDto
        // ...(selectedFilter !== "All" && filterDto),
      };
      // console.log('params: ', params);

      if (filterDto === "Custom") {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
      
      const response = await axiosInstance.get(`${baseUrl}/order/getAllOrders`, { params });
      // console.log(' response : ', response);
      setAllOrder(response.data.data.data);
      setTotalUsers(response.data.data.total);
      Setloader(false)
    } catch (error) {
      console.error("Failed to fetch orders with filter:", filterDto, error);
    }finally{
      Setloader(false)
    }
  }


  useEffect(() => {
    if (isTabReady) {
      getOrder(searchTerm);
    }
  }, [searchTerm, sortOrder, currentPage, itemsPerPage, isTabReady]);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1); // reset to page 1 when sort changes
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  useEffect(() => {
    if (viewStatus) {
      setActiveTab(viewStatus);
      setIsTabReady(true);
    } else {
      setIsTabReady(true);
    }
  }, [viewStatus]);

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    if (value === "Custom") {
      setShowCustomModal(true);
    } else {
      getOrder(searchTerm, value);
    }
  };

  const handleApplyCustom = () => {
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both dates");
      return;
    }
    setShowCustomModal(false);
    getOrder(searchTerm, "Custom", customRange.startDate, customRange.endDate);
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomRange({ startDate: "", endDate: "" });
    setSelectedFilter("All");
    getOrder(searchTerm, "All");
  };


  // After orders are fetched, expand the order
  useEffect(() => {
    if (viewOrderId && orders.length > 0) {
      const indexToExpand = orders.findIndex(o => o._id === viewOrderId);
      if (indexToExpand !== -1) {
        setTimeout(() => {
          setExpandRequest({ index: indexToExpand, orderId: viewOrderId });
        }, 200); // wait for render
      }
    }
  }, [orders]);


  const renderTabComponent = () => {
    switch (activeTab) {
      case 'pending':
        return <Pending searchTerm={searchTerm} orders={orders} getOrder={getOrder} expandRequest={expandRequest} />;
      case 'confirmed':
        return <Pending searchTerm={searchTerm} orders={orders} getOrder={getOrder} expandRequest={expandRequest} />;
      case 'processing':
        return <Pending searchTerm={searchTerm} orders={orders} getOrder={getOrder} expandRequest={expandRequest} />;
      case 'picked':
        return <Pending searchTerm={searchTerm} orders={orders} getOrder={getOrder} expandRequest={expandRequest} />;
      case 'shipped':
        return <Pending searchTerm={searchTerm} orders={orders} getOrder={getOrder} expandRequest={expandRequest} />;
      case 'delivered':
        return <Pending searchTerm={searchTerm} orders={orders} getOrder={getOrder} expandRequest={expandRequest} />;
      case 'cancelled':
        return <Pending searchTerm={searchTerm} orders={orders} getOrder={getOrder} expandRequest={expandRequest} />;
      default:
        return null;
    }
  };


  useEffect(() => {
    if (isTabReady) {
      getOrder(searchTerm);
    }
  }, [activeTab, isTabReady]);


  return (
    <>
      <div className={` ${styles.orderManagement}`}>
        <h2 className="mb-4 fw-bold">Order Management</h2>

        {/* Tabs */}
        <div className={styles.orders}>
          <div className={`d-flex justify-content-around mb-3  ${styles.tabs}`}>
            {tabs?.map(tab => (
              <div
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {activeTab === tab && <div className={styles.activeUnderline}></div>}

              </div>
            ))}
          </div>

          {/* Search and Filter */}

          <div className={styles.searchFilterRow}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchBox}
              />
              {searchTerm ? (
                <FaTimes className={styles.clearIcon} onClick={clearSearch} />
              ) : (
                <FaSearch className={styles.searchIcon} />
              )}
            </div>
            <div className="d-flex gap-3">
              <div onClick={toggleSortOrder} className={styles.sortIcon}>
                {sortOrder === "ASC" ? <GoSortAsc title="Sort Ascending" /> : <GoSortDesc title="Sort Descending" />}

              </div>
              {/* <button className={styles.filterBtn}><HiAdjustmentsVertical />Filter</button>*/}
              <div className="position-relative">
                <select
                  className={styles.dropdownFilter}
                  value={selectedFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <option value="">All</option>

                  {FILTER_OPTIONS?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>


          {/* Dynamic Tab Content */}
          {renderTabComponent()}
          {showCustomModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h5>Select Date Range</h5>
                <div className="d-flex gap-3 mt-3">
                  <div>
                    <label><b>From:</b></label><br />
                    <input
                      className={styles.DatePicker}
                      type="date"
                      max={new Date().toISOString().split("T")[0]}

                      value={customRange.startDate}
                      onChange={(e) =>
                        setCustomRange({ ...customRange, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label><b>To:</b></label><br />
                    <input
                      className={styles.DatePicker}
                      type="date"
                      max={new Date().toISOString().split("T")[0]}

                      value={customRange.endDate}
                      onChange={(e) =>
                        setCustomRange({ ...customRange, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button onClick={handleApplyCustom} className={styles.btnPrimary}>Apply</button>
                  <button onClick={handleCancelCustom} className={styles.btnSecondary}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: "var(--pagination-bg, #fde6c9ff)", zIndex: "999" }} >
          <div className={styles.paginationInfo}>
            <span>Showing {orders.length} Of  {totalUsers} Order</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={styles.dropdown}
            >
              {[5, 10, 20, 50, 100]?.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className={styles.paginationControls}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={styles.pageBtn}
              disabled={currentPage === 1}
            >
              <FaCircleChevronLeft />
            </button>

            <span className={styles.pageNumber}>{currentPage}</span>
{/*  */}
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(totalUsers / itemsPerPage) ? prev + 1 : prev
                )
              }
              className={styles.pageBtn}
              disabled={currentPage >= Math.ceil(totalUsers / itemsPerPage)}
            >
              <FaCircleChevronRight />
            </button>
          </div>

        </div>
      </div>
  {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}

    </>
  );
}

export default Order;