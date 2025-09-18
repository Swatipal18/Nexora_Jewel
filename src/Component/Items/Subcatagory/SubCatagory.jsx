import React, { useEffect, useState } from 'react'
import styles from './SubCatagory.module.css'
import { useForm } from 'react-hook-form';
import { FaChevronDown, FaChevronUp, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import { TiPencil } from 'react-icons/ti';
import axiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6';
import { GoSortAsc, GoSortDesc } from 'react-icons/go';
import { useSearchParams } from 'react-router-dom';

export default function SubCatagory() {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeRow, setActiveRow] = useState(null);
  const [data, setData] = useState([]); // Initialize with empty array
  const [SubCatagory, setSubCatagory] = useState()
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, Setloader] = useState(false)

  //filter
  const FILTER_OPTIONS = ['All', 'Today', 'Last 7 Days', 'This Month', 'Custom'];
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" })
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  async function getsubcat(search, filterDto = selectedFilter, startDate = customRange.startDate, endDate = customRange.endDate) {
    try {
      Setloader(true)

      const params = {
        search: search || query,
        page: currentPage,
        limit: itemsPerPage,
        sortOrder: sortOrder,
        filterDto
      }

      if (filterDto === 'Custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (filterDto && filterDto !== 'All') {
        params.filterDto = filterDto;
      } else if (filterDto === 'All') {
        params.filterDto = '';
      }

      let response = await axiosInstance.get(`${baseUrl}/sub-categories/getAll`, { params })

      // Add null check for response data
      if (response?.data?.data) {
        const total = response.data.data.totalCount || 0;
        setTotalUsers(total)
        setData(response.data.data.categories || []) // Fallback to empty array
      } else {
        setData([])
        setTotalUsers(0)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setData([]) // Set empty array on error
      setTotalUsers(0)
      toast.error("Failed to fetch subcategories", { theme: "dark", autoClose: 2000 });
    } finally {
      Setloader(false)
    }
  }

  useEffect(() => {
    getsubcat(searchTerm)
  }, [searchTerm, currentPage, itemsPerPage, sortOrder])

  useEffect(() => {
    getsubcat()
  }, [])

  const handleApplyCustom = () => {
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both dates");
      return;
    }
    setShowCustomModal(false);
    getsubcat(searchTerm, "Custom", customRange.startDate, customRange.endDate);
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomRange({ startDate: "", endDate: "" });
    setSelectedFilter("This Month");
    getsubcat(searchTerm, "This Month");
  };

  const convertToIST = (utcTime) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  const onSubmit = async (formData) => {
    try {
      Setloader(true)

      if (SubCatagory) {
        let edit = await axiosInstance.put(`${baseUrl}/sub-categories/update/${SubCatagory._id}`, formData, {
          headers: { "Content-Type": "application/json" },
        })
        toast.success("Sub-Category updated!", { theme: "dark", autoClose: 1500 });
        setSubCatagory(null);
      } else {
        let postdata = await axiosInstance.post(`${baseUrl}/sub-categories/create`, formData, {
          headers: { "Content-Type": "application/json" },
        })
        toast.success("Sub-Category added!", { theme: "dark", autoClose: 1500 });
      }

      getsubcat();
      reset();
    } catch (e) {
      const errorMessage = e?.response?.data?.message || "Something went wrong!";
      toast.error(`${errorMessage}`, { theme: "dark", autoClose: 2000 });
      console.error(e);
    } finally {
      Setloader(false)
    }
  }

  async function delsubcatagory(id) {
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
        let del = await axiosInstance.delete(`${baseUrl}/sub-categories/delete/${id}`)
        toast.success("Delete Sub-Categories successfully!", { theme: "dark", autoClose: 1500 });
        getsubcat();
      } catch (e) {
        console.log(e)
        toast.error("Failed to delete subcategory", { theme: "dark", autoClose: 2000 });
      }
    }
  }

  function EditSub(cat) {
    setSubCatagory(cat)
    setValue("title", cat.title)
    setValue("categoryId", cat.categoryId._id)
  }

  const toggleExpand = (index) => {
    setActiveRow(activeRow === index ? null : index);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  async function fetchCategories() {
    try {
      Setloader(true)
      const res = await axiosInstance.get(`${baseUrl}/categories/getAll?page=1&limit=10`);
      console.log('res: ', res);

      if (res?.data?.data?.categories) {
        setCategories(res.data.data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      toast.error("Failed to fetch categories", { theme: "dark", autoClose: 2000 });
    } finally {
      Setloader(false)
    }
  }

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const categoryInput = watch("title");

  return (
    <>
      <div className={styles.wrapper}>
        <h2 className="fw-bold mb-4">Sub-Category Management</h2>

        <div className={styles.whiteBox}>
          {/* Add Category */}
          <form className={styles.addCategoryForm} onSubmit={handleSubmit(onSubmit)}>
            <h3 className='mb-3'><b>Add New Sub-Category :</b></h3>

            <div className={styles.inputWrapper}>
              <select
                {...register("categoryId", { required: true })}
                className={`${styles.inputBox}`}
                defaultValue=""
              >
                <option value="" disabled>Select Category</option>
                {categories?.map((cat, i) => (
                  <option key={i} value={cat._id}>{cat.title}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputWrapper}>
              <input
                type="text"
                {...register("title")}
                placeholder="Write Sub-Category Name"
                className={styles.inputBox}
              />
              {categoryInput && (
                <FaTimes
                  className={styles.clearIcon}
                  onClick={() => setValue("title", "")}
                />
              )}
            </div>
            <button
              type="submit"
              className={styles.createBtn}
              disabled={!watch("categoryId") || !watch("title") || loading}
            >
              {SubCatagory ? "EDIT" : "CREATE"}
            </button>
          </form>

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
                    getsubcat(searchTerm, value);
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
                  <th className={styles.headerText}>SUB-CATEGORY NAME</th>
                  <th className={styles.headerText}>CATEGORY</th>
                  <th className={styles.headerText}>CREATED</th>
                  <th className={styles.headerText}>TOTAL ITEMS</th>
                  <th className={styles.headerText}>TOTAL PURCHASED</th>
                  <th className={styles.headerText}>TOTAL ORDER</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {/* Fixed condition: check if data exists and has length */}
                {data && data.length > 0 ? data.map((cat, index) => (
                  <React.Fragment key={index}>
                    <tr className={activeRow === index ? styles.activeRow : ""}>
                      <td>{cat.title}</td>
                      <td>{cat.categoryId?.title || 'N/A'}</td>
                      <td>{convertToIST(cat.createdAt)}</td>
                      <td>{cat.totalItems || 0}</td>
                      <td>{cat.totalPurchased || 0}</td>
                      <td>{cat.totalOrders || 0}</td>
                      <td className={styles.icons}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                          style={{ height: "24px", cursor: "pointer" }}
                          onClick={() => EditSub(cat)}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        <FaTrash
                          onClick={() => delsubcatagory(cat._id)}
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                    </tr>
                  </React.Fragment>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "20px", fontSize: "16px" }}>
                      {loading ? "Loading..." : "No Data Available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: " var(--pagination, #fde6c9ff)" }}>
        <div className={styles.paginationInfo}>
          <span>Showing {data?.length || 0} Of {totalUsers} Sub-Category</span>
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
  )
}