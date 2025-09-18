import React, { useEffect, useState } from "react";
import styles from "./User.module.css";
import {
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaTimes,
  FaTrash,
} from "react-icons/fa";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
// import axiosInstance from "../../api/axiosInstance";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { GoSortAsc, GoSortDesc } from "react-icons/go";
import axiosInstance from "../../api/axiosInstance";
import { useSearchParams } from "react-router-dom";
import Loader from "../pages/Loader/Loader";

export default function User() {
  const [activeRow, setActiveRow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, Setloader] = useState(false)
  const [AllUser, SetAllUser] = useState([])
  const [userStatus, setUserStatus] = useState({});
  const [expandedData, setExpandedData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  //filter
  const FILTER_OPTIONS = ['All', 'Today', 'Last 7 Days', 'This Month', 'Custom'];
  const STATUS_OPTIONS = ['Active', 'Inactive'];
  const [selectedStatus, setSelectedStatus] = useState("Active"); // for active and inactive
  // console.log('selectedStatus: ', selectedStatus); 
  const [selectedFilter, setSelectedFilter] = useState("All"); //for today.last 7 days
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

  const toggleExpand = async (id) => {
    if (activeRow === id) {
      setActiveRow(null);
    } else {
      setActiveRow(id);
      await fetchExpandedData(id);
    }
  };

  const clearSearch = () => {
    setSearchText("");
  };
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  async function getuser(search, filterDto = selectedFilter, startDate, endDate,
    status = selectedStatus,) {
    Setloader(true)

    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: search || query,
      sortOrder: sortOrder,
      // filterDto,
      // isActive
    };

    if (filterDto === 'Custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
      params.filterDto = 'Custom';
    } else if (filterDto && filterDto !== 'All') {
      params.filterDto = filterDto;
    } else {
      params.filterDto = ''; // When 'All' is selected
    }

    // Handle status
    if (status === 'Active') {
      params.isActive = 'true';
    } else if (status === 'Inactive') {
      params.isActive = 'false';
    }



    let response = await axiosInstance.get(`${baseUrl}/item/getAllUser`, { params })
    // console.log(response.data.data)
    const total = response.data.data.totalCount;
    setTotalUsers(total)
    const users = response.data.data.users;
    SetAllUser(users);
    const initialStatus = {};
    users.forEach(user => {
      initialStatus[user._id] = user.isActive;
    });
    setUserStatus(initialStatus);
    Setloader(false)

  }

  useEffect(() => {
    getuser(searchText)
  }, [searchText, currentPage, itemsPerPage, sortOrder])



  const fetchExpandedData = async (userId) => {
    try {
      Setloader(true)

      const response = await axiosInstance.get(`${baseUrl}/item/getUserById/${userId}`);
      // console.log('response: ', response);
      setExpandedData(prev => ({
        ...prev,
        [userId]: response.data.data.orders,
      }));
      Setloader(false)

    } catch (error) {
      console.error("Error fetching expanded data:", error);
    } finally {
      Setloader(false)

    }
  };


  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  };


  const toggleStatus = async (id) => {
    const newStatus = !userStatus[id];
    const result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No, cancel!'
    });


    if (result.isConfirmed) {
      setUserStatus((prev) => ({
        ...prev,
        [id]: newStatus,
      }));
      try {
        Setloader(true)

        let update = await axiosInstance.put(`${baseUrl}/item/userActiveOrInactive/${id}`, {
          isActive: newStatus,
        });
        Setloader(false)

        // console.log('update: ', update);
      } catch (error) {
        console.error("Failed to update status:", error);

        setUserStatus((prev) => ({
          ...prev,
          [id]: !newStatus,
        }));
      } finally {
        Setloader(false)

      }
    }
  };


  async function delUser(id) {
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

        let del = await axiosInstance.delete(`${baseUrl}/user/delete/${id}`)
        toast.success("Delete User successfully!", { theme: "dark", autoClose: 1500 });
        getuser();
        Setloader(false)

      } catch (e) {
        console.log(e)
      } finally {
        Setloader(false)

      }
    }
  }

  const handleApplyCustom = () => {
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both dates");
      return;
    }
    setShowCustomModal(false);
    getuser(searchText, "Custom", customRange.startDate, customRange.endDate);
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomRange({ startDate: "", endDate: "" });
    setSelectedFilter("This Month");
    getuser(searchText, "This Month");
  };
  const convertToIST = (utcTime) => {
    const options = {

      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  useEffect(() => {
    getuser();
  }, [])
  return (
    <>
      <div className="container-fluid p-4">
        <h2><b>User Management</b></h2>
        <div className={styles.wholeUSer}>
          {/* Search and Filter Section */}
          <div className={styles.topBar}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <FaTimes className={styles.clearIcon} onClick={clearSearch} />
              )}
            </div>
            <div className="d-flex gap-3">
              <div onClick={toggleSortOrder} className={styles.sortIcon}>
                {sortOrder === "ASC" ? <GoSortAsc title="Sort Ascending" /> : <GoSortDesc title="Sort Descending" />}

              </div>
              {/* <button className={styles.filterButton}>Filter</button> */}

              <select
                className={styles.dropdown}
                value={selectedStatus}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedStatus(value);
                  setCurrentPage(1);
                  getuser(
                    searchText,
                    selectedFilter,
                    customRange.startDate,
                    customRange.endDate,
                    value
                  );
                }}
              >
                {STATUS_OPTIONS?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>


              {/* Filter Dropdown */}
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
                    getuser(searchText, value, selectedStatus);
                    console.log('selected: ', selectedStatus);
                  }
                }}
              >
                {FILTER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

            </div>

          </div>

          <div className={`table-responsive ${styles.tableWrapper}`}>
            <div className={styles.tableResponsive}>
              <table className={`table ${styles.customTable}`}>
                <thead>
                  <tr>
                    <th>USER NAME</th>
                    <th>CREATED</th>
                    <th>EMAIL</th>
                    <th>MOBILE NUMBER</th>
                    <th>ITEM PURCHASED</th>
                    <th>LAST ORDER</th>
                    <th>STATUS</th>
                    <th></th>

                  </tr>
                </thead>
                <tbody>
                  {AllUser?.length > 0 ? AllUser?.map((cat, index) => (
                    <React.Fragment key={index}>
                      <tr
                        className={`${styles.tableRow} ${activeRow === cat._id ? styles.activeRow : ""}`}

                      >
                        <td className={activeRow === cat._id ? styles.activeRow : ""}> {`${cat.firstName} ${cat.lastName}`}</td>
                        <td className={activeRow === cat._id ? styles.activeRow : ""}>{convertToIST(cat.createdAt)}</td>
                        <td className={activeRow === cat._id ? styles.activeRow : ""}>{cat.email}</td>
                        <td className={activeRow === cat._id ? styles.activeRow : ""}>{cat.mobileNo}</td>
                        <td className={activeRow === cat._id ? styles.activeRow : ""}>{cat.totalItemsPurchased
                        }</td>
                        <td className={activeRow === cat._id ? styles.activeRow : ""}></td>
                        <td className={activeRow === cat._id ? styles.activeRow : ""}>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={userStatus[cat._id] || false}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleStatus(cat._id);
                              }}
                            />
                            <span className={styles.slider}></span>
                          </label>
                        </td>

                        <td className={`text-end ${styles.icons} ${activeRow === cat._id ? styles.activeRow : ""}`}>

                          <FaTrash className={styles.icon} onClick={() => delUser(cat._id)} />
                          {activeRow === cat._id ? (
                            <FaChevronUp onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(cat._id);
                            }} />

                          ) : (
                            <FaChevronDown onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(cat._id);
                            }} />

                          )}
                        </td>
                      </tr>

                      {activeRow === cat._id && (
                        <tr>
                          <td colSpan="8" className={styles.expandArea}>
                            <div className={styles.tableResponsive}>
                              <table className={`table ${styles.innerTable}`}>
                                <thead>
                                  <tr>
                                    {/* <th className={styles.headerText}>#</th> */}
                                    <th className={styles.headerText}>ORDER ID</th>
                                    <th className={styles.headerText}>QTY</th>
                                    <th className={styles.headerText}>TOTAL</th>
                                    <th className={styles.headerText}>ADDRESS</th>
                                    <th className={styles.headerText}>PAYMENT MODE</th>

                                  </tr>
                                </thead>
                                <tbody>

                                  {expandedData[cat._id]?.length > 0 ? expandedData[cat._id]?.map((order, index) => (
                                    <tr key={index}>
                                      {/* <td>{index + 1}</td> */}
                                      <td style={{ width: "100px" }}>{order.orderId}</td>
                                      <td>{order.quantity}</td>
                                      <td>{order.total}</td>
                                      <td style={{ width: "700px" }}>{order.address}</td>
                                      <td>{order.paymentMode}</td>
                                    </tr>
                                  )) : (
                                    <tr>
                                      <td colSpan="7" style={{ textAlign: "center", padding: "15px", fontSize: "16px" }}>
                                        No Data Available
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "20px", fontSize: "16px" }}>
                        No Data Available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: "var(--pagination-bg, #fde6c9ff)" }} >
        <div className={styles.paginationInfo}>
          <span>Showing {AllUser.length} Of {totalUsers} User</span>
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
      {loading && (
        <Loader />
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
