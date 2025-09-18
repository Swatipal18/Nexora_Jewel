import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import styles from '../Supplier.module.css';

import axiosInstance from '../../../api/axiosInstance';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6';
import { GoSortAsc, GoSortDesc } from 'react-icons/go';

export default function Allsupplier() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, Setloader] = useState(false)
  const [toggleStates, setToggleStates] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);



  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  // console.log('selectedSupplier: ', selectedSupplier);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm('');
  const goToCreate = () => navigate('/CreateSupplier');
  const [data, setdata] = useState([])
  const [sortOrder, setSortOrder] = useState("DESC");

  //filter
  const FILTER_OPTIONS = ['All', 'Today', 'Last 7 Days', 'This Month', 'Custom'];
  const STATUS_OPTIONS = ['Active', 'Inactive'];
  const [selectedStatus, setSelectedStatus] = useState("Active"); // for active and inactive
  // console.log('selectedStatus: ', selectedStatus); 
  const [selectedFilter, setSelectedFilter] = useState("All"); //for today.last 7 days
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });
  // console.log('customRange-start: ', customRange.startDate);
  // console.log('customRange: ', customRange.endDate);


  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  async function getsupplier(search, filterDto = selectedFilter, startDate, endDate,
    status = selectedStatus,) {

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
    try {
      Setloader(true)
      let response = await axiosInstance.get(`${baseUrl}/supplier/getAll`, { params })
      const total = response.data.data.totalCount;
      setTotalUsers(total)
      Allsupplier = response.data.data.suppliers;
      // console.log(response.data.data.suppliers)
      setdata(Allsupplier)
      const initialStatus = {};
      Allsupplier.forEach(suppl => {
        initialStatus[suppl._id] = suppl.isActive;
      })
      setToggleStates(initialStatus);
      Setloader(false)
    } catch (e) {
      console.log(e)
    } finally {
      Setloader(false)
    }

  }

  useEffect(() => {
    getsupplier(searchTerm)
  }, [searchTerm, currentPage, itemsPerPage, sortOrder])

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  };

  async function delsupplier(id) {
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

        await axiosInstance.delete(`${baseUrl}/supplier/delete/${id}`)
        toast.success("Delete Catagories successfully!", { theme: "dark", autoClose: 1500 });
        getsupplier();
        Setloader(false)

      } catch (e) {
        console.log(e)
      } finally {
        Setloader(false)

      }
    }
  }
  function EditSupplier(item) {
    navigate(`/EditSupplier/${item._id}`);

  }



  useEffect(() => {
    getsupplier()
  }, [])

  const handleToggle = async (id) => {
    const newStatus = !toggleStates[id];

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
      setToggleStates((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
      try {
        Setloader(true)

        let update = await axiosInstance.put(`${baseUrl}/supplier/active-inactive/${id}`, {
          isActive: newStatus
        })
        Setloader(false)

      } catch (e) {
        console.log(e)
        setToggleStates((prev) => ({
          ...prev,
          [id]: !newStatus,
        }));
      } finally {
        Setloader(false)

      }
    }

  };

  const viewSupplierDetails = async (id) => {
    try {
      Setloader(true);
      const response = await axiosInstance.get(`${baseUrl}/supplier/get/${id}`);
      setSelectedSupplier(response.data.data);
      setShowSidebar(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch supplier details.");
    } finally {
      Setloader(false);
    }
  };


  const handleApplyCustom = () => {
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both dates");
      return;
    }
    setShowCustomModal(false);
    getsupplier(searchTerm, "Custom", customRange.startDate, customRange.endDate);
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomRange({ startDate: "", endDate: "" });
    setSelectedFilter("This Month");
    getsupplier(searchTerm, "This Month");
  };

  return (
    <>
      <div className={styles.allsupplier}>
        <h2 className='fw-bold ms-4 mt-4 mb-4'>All Supplier</h2>
        <div className={styles.wrapper}>
          <div className={styles.headerRow}>
            <div className={styles.leftSection}>
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
              <button className={styles.addBtn} onClick={goToCreate}>
                + Add Supplier
              </button>
            </div>
            <div className="d-flex gap-3">
              <div onClick={toggleSortOrder} className={styles.sortIcon}>
                {sortOrder === "ASC" ? <GoSortAsc title="Sort Ascending" /> : <GoSortDesc title="Sort Descending" />}

              </div>
              {/* <button className={styles.filterBtn}>Filter</button> */}

              <select
                className={styles.dropdown}
                value={selectedStatus}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedStatus(value);
                  setCurrentPage(1);
                  getsupplier(
                    searchTerm,
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
                    getsupplier(searchTerm, value, selectedStatus);
                    // console.log('selected: ', selectedStatus);
                  }
                }}
              >
                {FILTER_OPTIONS?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>

            </div>
          </div>

          {/* Table UI */}
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>State</th>
                  <th>Mobile No</th>
                  <th>Pin code</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? data?.map((item, i) => (
                  <tr key={i}>
                    <td>{item.partyName}</td>
                    <td>{item.city}</td>
                    <td>{item.state}</td>
                    <td>{item.mobileNo}</td>
                    <td>{item.pinCode}</td>
                    <td>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={toggleStates[item._id] || false}
                          onChange={() => handleToggle(item._id)}
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </td>
                    <td className={styles.actionIcons}>
                      <div onClick={() => viewSupplierDetails(item._id)} style={{ cursor: "pointer" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{ height: "24px" }} >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.editIcon} style={{ height: "24px" }} onClick={() => EditSupplier(item)}  >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      <FaTrash size={16} className={styles.deleteIcon} onClick={() => delsupplier(item._id)} />
                    </td>
                  </tr>
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

      <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: " var(--pagination, #fde6c9ff)" }} >
        <div className={styles.paginationInfo}>
          <span>Showing {data.length} Of {totalUsers} Supplier</span>
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
        <div className={styles.loaderOverlay}>
          <div className={styles.loader}></div>
        </div>
      )}

      {showSidebar && selectedSupplier && (
        <div className={styles.sidebarOverlay} onClick={() => setShowSidebar(false)}>
          <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sidebarHeader}>
              <h4>Supplier Information</h4>
              <button onClick={() => setShowSidebar(false)} className={styles.closeBtn}>×</button>
            </div>
            <hr />
            <div className={styles.sidebarContent}>
              <div className={styles.infoBox}>
                <h5>Supplier Details</h5>
                <p><strong>Party Name:</strong> {selectedSupplier.partyName}</p>
                <p><strong>Party Code:</strong> {selectedSupplier.partyCode}</p>
                <p><strong>Firm Name:</strong> {selectedSupplier.firmName}</p>
                <p><strong>Address:</strong> {selectedSupplier.address}</p>
                <p><strong>City:</strong> {selectedSupplier.city}</p>
                <p><strong>State:</strong> {selectedSupplier.state}</p>
                <p><strong>Mobile No:</strong> {selectedSupplier.mobileNo}</p>
                <p><strong>Pin Code:</strong> {selectedSupplier.pinCode}</p>
                <p><strong>Reference By:</strong> {selectedSupplier.referenceBy}</p>
              </div>

              <div className={styles.infoBox}>
                <h5>Bank Details</h5>
                <p><strong>Account Holder Name:</strong> {selectedSupplier.accountHolderName}</p>
                <p><strong>Account No:</strong> {selectedSupplier.accountNumber}</p>
                <p><strong>IFSC:</strong> {selectedSupplier.ifscCode}</p>
                <p><strong>Bank Name:</strong> {selectedSupplier.accountName}</p>
              </div>
            </div>
          </div>
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
