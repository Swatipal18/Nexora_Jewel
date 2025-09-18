import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./Catagory.module.css";
import { FaTrash, FaChevronDown, FaChevronUp, FaTimes, FaSearch } from "react-icons/fa";

import axiosInstance from "../../../api/axiosInstance";
import { TiPencil } from "react-icons/ti";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { GoSortAsc, GoSortDesc } from "react-icons/go";
import { useSearchParams } from "react-router-dom";

export function Catagory() {
  const { register, handleSubmit, reset, setValue, watch, control } = useForm();

  const [activeRow, setActiveRow] = useState(null);
  const [data, setData] = useState([]);
 
  //search
  const [searchTerm, setSearchTerm] = useState("");
  const [EditCatagory, setEditCatagory] = useState()
  
  //toggle(active-inactive)
  const [CatagoryStatus, setCatagoryStatus] = useState({});
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  //ascending or descanding
  const [sortOrder, setSortOrder] = useState("DESC");

//expand Row
  const [expandedData, setExpandedData] = useState({});

//loader
  const [loading, Setloader] = useState(false)

  //images
  const [selectedImages, setSelectedImages] = useState([]); // new files
  const [previewImages, setPreviewImages] = useState([]);

  //filter
  const FILTER_OPTIONS = ['All', 'Today', 'Last 7 Days', 'This Month', 'Custom'];
  const STATUS_OPTIONS = ['Active', 'Inactive'];
  const [selectedStatus, setSelectedStatus] = useState("Active"); // for active and inactive
  const [selectedFilter, setSelectedFilter] = useState("All"); //for today.last 7 days
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const categoryInput = watch("title");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleEditCategory = async (id) => {
    try {
      Setloader(true)
      const res = await axiosInstance.get(`${baseUrl}/categories/get/${id}`);
      const category = res.data.data;

      setEditCatagory(category);
      setValue("title", category.title);
      setPreviewImages(category.imageUrls || []);
      setSelectedImages([]); // clear new uploads
      Setloader(false)
    } catch (e) {
      console.error("Error fetching category:", e);
      toast.error("Failed to fetch category.", { theme: "dark" });
      Setloader(false)
    } finally {
      Setloader(false)
    }
  };


  const onSubmit = async (formData) => {
    try {

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);

      const allImages = [];

      // Add new uploaded image files
      if (selectedImages.length > 0) {
        allImages.push(...selectedImages);
      }

      // Convert existing image URLs (edit mode) to files
      if (EditCatagory && selectedImages.length === 0 && previewImages.length > 0) {
        const existingImageFiles = await Promise.all(
          previewImages.map(async (url, index) => {
            const res = await fetch(url);
            const blob = await res.blob();
            const filename = `existing_${Date.now()}_${index}.jpg`;
            return new File([blob], filename, { type: blob.type });
          })
        );
        allImages.push(...existingImageFiles);
      }

      // Append images to form data
      allImages.forEach((imgFile) => {
        formDataToSend.append("images", imgFile);
      });

      Setloader(true);

      if (EditCatagory) {
        await axiosInstance.put(`${baseUrl}/categories/update/${EditCatagory._id}`, formDataToSend);
        toast.success("Category updated!", { theme: "dark", autoClose: 1500 });
      } else {
        await axiosInstance.post(`${baseUrl}/categories/create`, formDataToSend);
        toast.success("Category added!", { theme: "dark", autoClose: 1500 });
      }

      reset();
      setEditCatagory(null);
      setSelectedImages([]);
      setPreviewImages([]);
      getCatagory();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Something went wrong!", { theme: "dark" });
    } finally {
      Setloader(false);
    }
  };



  const toggleExpand = async (id) => {
    if (activeRow === id) {
      setActiveRow(null);
    } else {
      setActiveRow(id);
      await fetchExpandedData(id);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");



  async function getCatagory(search, filterDto = selectedFilter, startDate, endDate,
    status = selectedStatus,
  ) {


    Setloader(true);
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
      const response = await axiosInstance.get(`${baseUrl}/categories/getAll`, { params });
      const category = response.data.data.categories;
      const total = response.data.data.totalCount;
      setTotalUsers(total);
      setData(category);

      const initialStatus = {};
      category.forEach(cat => {
        initialStatus[cat._id] = cat.isActive;
      });
      setCatagoryStatus(initialStatus);
    } catch (e) {
      console.log('error:', e);
    } finally {
      Setloader(false);
    }
  }


  useEffect(() => {
    getCatagory(searchTerm)
  }, [searchTerm, currentPage, itemsPerPage, sortOrder])


  async function delCatagory(id) {
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

        let del = await axiosInstance.delete(`${baseUrl}/categories/delete/${id}`)
        toast.success("Delete Catagories successfully!", { theme: "dark", autoClose: 1500 });
        getCatagory();
        Setloader(false)

      }
      catch (e) {

        console.error(e);
        // setCatagoryStatus((prev) => ({
        //   ...prev,
        //   [id]: !newStatus,
        // }));
        Setloader(false)

      } finally {
        Setloader(false)

      }
    }
  }





  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  };


  const toggleStatus = async (id) => {
    const newStatus = !CatagoryStatus[id];
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
      setCatagoryStatus((prev) => ({
        ...prev,
        [id]: newStatus,
      }));
      try {
        Setloader(true)

        let update = await axiosInstance.put(`${baseUrl}/categories/active-inactive/${id}`, {
          isActive: newStatus,
        });
        Setloader(false)

        // console.log('update: ', update);
      } catch (error) {
        console.error("Failed to update status:", error);
        setCatagoryStatus((prev) => ({
          ...prev,
          [id]: !newStatus,
        }));
      }
    }
  }

  async function fetchExpandedData(id) {
    let response = await axiosInstance.get(`${baseUrl}/categories/get/details/${id}`)
    // console.log('response--------------: ', response.data.data);
    setExpandedData(prev => ({
      ...prev,
      [id]: response.data.data,
    }));

  }
  useEffect(() => {

    getCatagory();
  }, [])
  const removeImage = (index) => {
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);

    // Only remove from selectedImages if image was uploaded (not from existing URL)
    const newSelected = [...selectedImages];
    newSelected.splice(index, 1);
    setSelectedImages(newSelected);
  };


  const handleApplyCustom = () => {
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both dates");
      return;
    }
    setShowCustomModal(false);
    getCatagory(searchTerm, "Custom", customRange.startDate, customRange.endDate);
  };

  const handleCancelCustom = () => {
    setShowCustomModal(false);
    setCustomRange({ startDate: "", endDate: "" });
    setSelectedFilter("This Month");
    getCatagory(searchTerm, "This Month");
  };

  const convertToIST = (utcTime) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  const formatDecimal = (value) => {
    if (typeof value === 'object' && value?.$numberDecimal) {
      return parseFloat(value.$numberDecimal).toFixed(2); // or just value.$numberDecimal
    }
    return value ?? "0";
  };


  return (
    <>
      <div className={styles.wrapper}>
        <h2 className="fw-bold mb-4">Category Management</h2>

        <div className={styles.whiteBox}>
          {/* Add Category */}
          <form className={styles.addCategoryForm} onSubmit={handleSubmit(onSubmit)}>
            <h3><b>Add New Category :</b></h3>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                {...register("title")}
                placeholder="Write Category Name"
                className={styles.inputBox}
              />
              {categoryInput && (
                <FaTimes
                  className={styles.clearIcon}
                  onClick={() => setValue("title", "")}
                />
              )}
            </div>
            <div className={styles.imageRow}>
              <input
                type="file"
                accept="image/*"
                multiple
                {...register("images")}
                onChange={handleImageChange}
              />
            </div>

            <div className={styles.imagePreviewWrapper}>
              {previewImages.map((src, idx) => (
                <div key={idx} className={styles.imagePreviewBox}>
                  <img src={src} alt="Preview" className={styles.previewImage} />
                  <FaTimes onClick={() => removeImage(idx)} />
                </div>
              ))}
            </div>


            <button type="submit" className={styles.createBtn}> {EditCatagory ? "UPDATE" : "CREATE"}</button>
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
              {/* <button className={styles.filterBtn}>Filter</button> */}
              {/* Status Dropdown */}
              <select
                className={styles.dropdown}
                value={selectedStatus}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedStatus(value);
                  setCurrentPage(1);
                  getCatagory(
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
                    getCatagory(searchTerm, value, selectedStatus);
                    console.log('selected: ', selectedStatus);
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
                  <th className={styles.headerText}>CATEGORY NAME</th>
                  <th className={styles.headerText}>CREATED</th>
                  <th className={styles.headerText}>TOTAL ITEMS</th>
                  <th className={styles.headerText}>TOTAL PURCHASED</th>
                  <th className={styles.headerText}>TOTAL ORDER</th>
                  <th className={styles.headerText}>ACTIVE</th>

                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? data?.map((cat, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className={activeRow === cat._id ? styles.activeRow : ""}

                    >
                      <td>{cat.title}</td>
                      <td>{convertToIST(cat.createdAt)}</td>
                      <td>{cat.totalItems}</td>
                      <td>{cat.totalPurchased}</td>
                      <td>{cat.totalOrders}</td>
                      <td>
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={CatagoryStatus[cat._id] || false}
                            onChange={() => toggleStatus(cat._id)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </td>
                      <td className={styles.icons}>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{ height: "24px" }} onClick={() => handleEditCategory(cat._id)} >
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>


                        <FaTrash onClick={() => delCatagory(cat._id)} />
                        {activeRow === index ? <FaChevronUp onClick={() => toggleExpand(cat._id)} /> : <FaChevronDown onClick={() => toggleExpand(cat._id)} />}
                      </td>
                    </tr>

                    {activeRow === cat._id && (
                      <tr>
                        <td colSpan="7">
                          <div className={styles.tableResponsive}>
                            <table className={styles.innerTable}>
                              <thead>
                                <tr>
                                  <th className={styles.headerText}>#</th>
                                  <th className={styles.headerText}>SKU</th>
                                  <th className={styles.headerText}>ITEM NAME</th>
                                  <th className={styles.headerText}>QTY</th>
                                  <th className={styles.headerText}>MRP</th>
                                  <th className={styles.headerText}>SUPPLIER</th>
                                  <th className={styles.headerText}>STATUS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {expandedData[cat._id]?.length > 0 ? expandedData[cat._id]?.map((item, idx) => (
                                  <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{item.sku}</td>
                                    <td>{item.itemName}</td>
                                    <td>{item.qty}</td>
                                    <td>{formatDecimal(item.mrp)}</td>
                                    <td>{item.supplier}</td>

                                    <td className={
                                      item.status === "OUT OF STOCK"
                                        ? styles.outOfStock
                                        : styles.inStock
                                    }>{item.status}</td>
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

      <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: " var(--pagination-bg, #fde6c9ff)" }} >
        <div className={styles.paginationInfo}>
          <span>Showing {data.length} Of {totalUsers} Category</span>
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
  );
}
