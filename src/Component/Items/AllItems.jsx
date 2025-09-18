import React, { useEffect, useState } from 'react'
import styles from './AllItems.module.css';
import { FaChevronCircleLeft, FaChevronCircleRight, FaChevronLeft, FaChevronRight, FaSearch, FaTimes, } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6';
import { GoSortAsc, GoSortDesc } from 'react-icons/go';
import axiosInstance from '../../api/axiosInstance';
import { useSearchParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { BsExclamationOctagon } from 'react-icons/bs';
import Loader from '../pages/Loader/Loader';

export default function AllItems() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);
  const [toggleState, settoggleStatus] = useState({})
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState(null);
  const [loading, setloader] = useState(false)
  // console.log('selectedItemData: ', selectedItemData);
  const [currentImage, setCurrentImage] = React.useState(0);


  const FILTER_OPTIONS = ['All', 'Today', 'Last 7 Days', 'This Month', 'Custom'];
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  async function getItems(search, filterDto = selectedFilter, startDate = customRange.startDate, endDate = customRange.endDate) {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: search || query,
      sortOrder: sortOrder,
      filterDto
    };
    // console.log('params: ', params);

    if (filterDto === 'Custom' && startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (filterDto && filterDto !== 'All') {
      params.filterDto = filterDto;
    } else if (filterDto === 'All') {
      params.filterDto = '';
    }

    try {
      setloader(true)
      const response = await axiosInstance.get(`${baseUrl}/item/getAll`, { params });
      const items = response.data.data.items;
      // console.log('items: ', response);
      const total = response.data.data.totalCount;

      setTotalUsers(total);
      setData(items);

      const initialStatus = {};
      items.forEach(item => {
        initialStatus[item._id] = item.isActive;
      });
      settoggleStatus(initialStatus);
      setloader(false)
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setloader(false)
    }
  }

  useEffect(() => {
    getItems(searchTerm, selectedFilter)
  }, [searchTerm, currentPage, itemsPerPage, sortOrder, query, selectedFilter])

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  };

  useEffect(() => {
    getItems();
  }, [])

  const toggleStatus = async (id) => {
    const newStatus = !toggleState[id];
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
      settoggleStatus((prev) => ({
        ...prev,
        [id]: newStatus,
      }));
      try {
        let update = await axiosInstance.put(`${baseUrl}/item/active-inactive/${id}`, {
          isActive: newStatus,
        });
      } catch (error) {
        console.error("Failed to update status:", error);

        settoggleStatus((prev) => ({
          ...prev,
          [id]: !newStatus,
        }));
      }
    }
  }

  const InfoRow = ({ label, value }) => (
    <div className={styles.infoRow}>
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
  const handleViewItem = async (id) => {
    try {
      const res = await axiosInstance.get(`${baseUrl}/item/get/${id}`);
      // console.log('res-----in detail : ', res.data.data);
      setSelectedItemData(res.data.data);
      setShowSidebar(true);
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast.error("Failed to load item details.");
    }
  };


  async function deleteitem(id) {
    let result = await Swal.fire({
      title: 'Are you sure?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!'
    })
    if (result.isConfirmed) {
      try {
        let del = await axiosInstance.delete(`${baseUrl}/item/delete/${id}`)
        toast.success("Delete Item Successfully!", { theme: "dark", autoClose: 1500 });
        getItems();
      }
      catch (e) {
        console.log(e)
      }
    }
  }

  const handleEditItem = (id) => {
    navigate(`/EditItem/${id}`);
  };
  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    if (value === "Custom") {
      setShowCustomModal(true);
    } else {
      getItems(searchTerm, value); // Apply filter immediately
    }
  };

  const handleApplyCustom = () => {
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both dates");
      return;
    }
    setShowCustomModal(false);
    getItems(searchTerm, "Custom", customRange.startDate, customRange.endDate

    );
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomRange({ startDate: "", endDate: "" });
    setSelectedFilter("This Month");
    getItems(searchTerm, "This Month");
  };
  const convertToIST = (utcTime) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  return (
    <>
      <div className={styles.wrapper}>
        <h2 className="fw-bold mb-4">All Items</h2>

        <div className={styles.whiteBox}>
          {/* Search & Filter */}
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
                    getItems(searchTerm, value);
                  }
                }}
              >
                {FILTER_OPTIONS?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>


            </div>
          </div>



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



          {/* Table */}
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th className={styles.headerText}>ITEM CODE</th>
                  <th className={styles.headerText}>ITEM NAME</th>
                  <th className={styles.headerText}>CATEGORY</th>
                  <th className={styles.headerText}>STOCK QTY</th>
                  <th className={styles.headerText}>PUBLISHED DATE</th>
                  <th className={styles.headerText}>IN STOCK?</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? data?.map((cat, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td >
                        <img
                          src={cat.imageUrl?.[0]}
                          alt={cat.itemName}
                          style={{ height: "100px", width: "100px", objectFit: "cover", borderRadius: "5px" }}
                        />
                      </td>
                      <td>{cat.itemCode}</td>
                      <td>{cat.itemName}</td>
                      <td>{cat.categoryTitle}</td>
                      <td>{cat.stockQty}</td>
                      <td>{convertToIST(cat.publishedDate)}</td>
                      <td>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={toggleState[cat._id] || false}
                            onChange={() => toggleStatus(cat._id)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </td>

                      <td className={styles.icons}>
                        <div onClick={() => handleViewItem(cat._id)} style={{ cursor: "pointer" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{ height: "24px" }} >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </div>
                        <div onClick={() => handleEditItem(cat._id)} style={{ cursor: "pointer" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8" style={{ height: "24px" }} >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />

                          </svg>
                        </div>
                        <div onClick={() => deleteitem(cat._id)} style={{ cursor: "pointer" }}>

                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" style={{ height: "24px" }}>
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" onClick={() => deleteitem(cat._id)} />
                          </svg>
                        </div>

                      </td>
                    </tr>


                  </React.Fragment>
                )) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "20px", fontSize: "16px", paddingTop: "50px" }}>
                      <span className="text-muted"><BsExclamationOctagon size={50} /><br /><h5 className='mt-2'>No Item Found
                      </h5> </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: " var(--pagination-bg)" }} >
        <div className={styles.paginationInfo}>
          <span>Showing {data.length} Of {totalUsers} Items</span>
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

      {showSidebar && selectedItemData && (
        <div className={styles.sidebarOverlay} onClick={() => setShowSidebar(false)}>
          <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sidebarHeader}>
              <h4>Item Information</h4>
              <button onClick={() => setShowSidebar(false)} className={styles.closeBtn}>×</button>
            </div>




            <div className={styles.carouselWrapper}>
              {selectedItemData.imageUrl.length > 1 && (
                <button
                  className={styles.carouselBtn}
                  onClick={() => setCurrentImage((prev) => (prev - 1 + selectedItemData.imageUrl.length) % selectedItemData.imageUrl.length)}
                >
                  <FaChevronCircleLeft />
                </button>
              )}
              <img
                src={selectedItemData.imageUrl[currentImage]}
                alt="Item"
                className={styles.sidebarImage}
              />
              {selectedItemData.imageUrl.length > 1 && (
                <button
                  className={styles.carouselBtn}
                  onClick={() => setCurrentImage((prev) => (prev + 1) % selectedItemData.imageUrl.length)}
                >
                  <FaChevronCircleRight />
                </button>
              )}
            </div>

            <div className={styles.infoSection}>
              <h5 className="fw-bold mb-3">{selectedItemData.itemName}</h5>

              <div className={styles.infoGrid}>
                <InfoRow label="Item Code" value={selectedItemData.itemCode || ""} />
                <InfoRow label="Category" value={selectedItemData.category?.title || ""} />
                <InfoRow label="Subcategories" value={selectedItemData.subCategory?.map(sub => sub.title).join(', ')} />
                <InfoRow label="Sizes" value={selectedItemData.size?.map(s => s.sizeName).join(', ')} />
                <InfoRow label="Metals" value={selectedItemData.metal?.map(m => m.metalName).join(', ')} />
                <InfoRow label="Supplier" value={selectedItemData.partyName} />
                <InfoRow label="SKUs" value={selectedItemData.skus} />
                <InfoRow label="Type" value={`${selectedItemData.type}`} />

                {/* <InfoRow label="Metal Weight" value={`${selectedItemData.metalWeight} g`} /> */}
                <InfoRow label="Gross Weight" value={`${selectedItemData.grossWeight?.$numberDecimal || 0} g`} />
                <InfoRow label="Net Weight" value={`${selectedItemData.netWeight?.$numberDecimal || 0} g`} />
                <InfoRow label="Less Weight" value={`${selectedItemData.lessWeight?.$numberDecimal || 0} g`} />

                <InfoRow label="Per Gram Weight" value={`${selectedItemData.perGramWeight?.$numberDecimal || 0} g`} />
                {/* <InfoRow label="Making Charges" value={`₹${selectedItemData.makingCharges}`} /> */}
                <InfoRow label="GST" value={`₹${selectedItemData.gst?.$numberDecimal
                  }`} />
                <InfoRow label="Other Charges" value={`₹${selectedItemData.otherCharges || 0}`} />
                <InfoRow label="Discount" value={`₹${selectedItemData.discount || 0}`} />
                <InfoRow label="MRP" value={`₹${selectedItemData.mrp.$numberDecimal || 0}`} />
                <InfoRow label="Selling Price" value={`₹${selectedItemData.sellingPrice.$numberDecimal || 0
                  }`} />
              </div>

              <div className={styles.descriptionBox}>
                <p><strong>Description:</strong></p>
                <p>{selectedItemData.description || "No Description Avilable"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <Loader />
      )}
    </>
  )
}
