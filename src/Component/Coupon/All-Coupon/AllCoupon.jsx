import React, { useEffect, useState } from 'react';
import { FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import styles from './Coupon.module.css';
import { GoSortAsc, GoSortDesc } from 'react-icons/go';
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';


export default function AllCoupon() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [loading, Setloader] = useState(false)
  const [toggleState, setToggleState] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const FILTER_OPTIONS = ['All', 'Today', 'Last 7 Days', 'This Month', 'Custom'];
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });


  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  const getCoupons = async (search, filterDto = selectedFilter, startDate = customRange.startDate, endDate = customRange.endDate) => {
    Setloader(true)
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: search || query,
      sortOrder: sortOrder,
      filterDto
    };
    const res = await axiosInstance.get(`${baseUrl}/coupon/getAll`, { params });

    if (filterDto === 'Custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (filterDto && filterDto !== 'All') {
      params.filterDto = filterDto;
    } else if (filterDto === 'All') {
      params.filterDto = '';
    }

    const couponList = res.data.data.data;
    // console.log(' couponList: ', couponList);
    const total = res.data.data.totalCount;

    setData(couponList);
    setTotalCoupons(total);

    const statusMap = {};
    couponList.forEach(c => {
      statusMap[c._id] = c.isActive;
    });
    setToggleState(statusMap);
    Setloader(false)

  };

  useEffect(() => {
    getCoupons(searchTerm, selectedFilter);
  }, [searchTerm, currentPage, itemsPerPage, sortOrder, query, selectedFilter]);



  const deleteCoupon = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    });
    if (result.isConfirmed) {
      try {
        Setloader(true)

        await axiosInstance.delete(`${baseUrl}/coupon/delete/${id}`);
        toast.success("Coupon Deleted Successfully!", { theme: "dark", autoClose: 1500 });
        getCoupons();
        Setloader(false)

      } catch (e) {
        console.error(e);
      } finally {
        Setloader(false)

      }
    }
  };

  const EditCoupon = (id) => {
    navigate(`/EditCoupon/${id}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "ASC" ? "DESC" : "ASC");
    setCurrentPage(1);
  };

  const convertToIST = (utcTime) => {
    if (!utcTime) return "N/A";

    const date = new Date(utcTime);
    if (isNaN(date.getTime())) return "Invalid Date";

    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-IN", options).format(date);
  };
  const handleApplyCustom = () => {
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both dates");
      return;
    }
    setShowCustomModal(false);
    getCoupons(searchTerm, "Custom", customRange.startDate, customRange.endDate

    );
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomRange({ startDate: "", endDate: "" });
    setSelectedFilter("This Month");
    getCoupons(searchTerm, "This Month");
  };

  return (
    <>
      <div className={styles.wrapper}>
        <h2 className="fw-bold mb-4">All Coupons</h2>

        <div className={styles.whiteBox}>
          {/* Search & Sort */}
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
              {/* <button className={styles.filterBtn}>Filter</button> */}
              <select
                className={styles.dropdown}
                value={selectedFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedFilter(value);
                  setCurrentPage(1);

                  if (value === "Custom") {
                    setShowCustomModal(true);
                  } else {
                    getCoupons(searchTerm, value);
                  }
                }}
              >
                {FILTER_OPTIONS?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

            </div>
          </div>

          {/* Table */}
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.headerText}>COUPON CODE</th>
                  <th className={styles.headerText}>DISCOUNT VALUE</th>
                  <th className={styles.headerText}>CREATED</th>
                  <th className={styles.headerText}>CATEGOTY</th>
                  <th className={styles.headerText}>ITEM NAME</th>
                  <th className={styles.headerText}>VALID FROM</th>
                  <th className={styles.headerText}>VALID TO</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? data?.map((coupon, index) => (
                  <tr key={index}>
                    <td>{coupon.code}</td>
                    <td>{coupon.discountValue}</td>
                    <td>{convertToIST(coupon.createdAt)}</td>
                    <td>{coupon.categoryTitle ? coupon.categoryTitle : "-"}</td>
                    <td>{coupon.itemName ? coupon.itemName : "-"}</td>
                    <td>{convertToIST(coupon.validTo)}</td>

                    <td>{convertToIST(coupon.validFrom)}</td>


                    <td className={styles.icons}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" onClick={() => EditCoupon(coupon._id)} style={{ height: "24px" }} >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>

                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" style={{ height: "24px" }} onClick={() => deleteCoupon(coupon._id)}>
                        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                      </svg>
                      {/* <TiPencil size={23} onClick={() => EditCoupon(coupon)} /> */}
                      {/* <FaTrash onClick={() => deleteCoupon(coupon._id)} /> */}

                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px", fontSize: "16px" }}>
                      No Coupons Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div >

      {/* Pagination */}
      < div className="col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: "var(--pagination-bg, #fde6c9ff)" }
      }>
        <div className={styles.paginationInfo}>
          <span>Showing {data.length} Of {totalCoupons} Coupons</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className={styles.dropdown}
          >
            {[5, 10, 20, 50, 100]?.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className={styles.paginationControls}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className={styles.pageBtn}
            disabled={currentPage === 1}
          >
            <FaCircleChevronLeft />
          </button>
          <span className={styles.pageNumber}>{currentPage}</span>
          <button
            onClick={() => setCurrentPage(prev => (
              prev < Math.ceil(totalCoupons / itemsPerPage) ? prev + 1 : prev
            ))}
            className={styles.pageBtn}
            disabled={currentPage >= Math.ceil(totalCoupons / itemsPerPage)}
          >
            <FaCircleChevronRight />
          </button>
        </div>
      </div >
      {loading && (
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}


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


    </>
  );
}
