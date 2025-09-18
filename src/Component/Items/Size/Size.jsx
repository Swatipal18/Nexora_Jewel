import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FaTrash, FaTimes, FaSearch } from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";
import { TiPencil } from "react-icons/ti";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import styles from './Size.module.css'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { GoSortAsc, GoSortDesc } from "react-icons/go";
import { useSearchParams } from "react-router-dom";
import Loader from "../../pages/Loader/Loader";
export default function Size() {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [data, setData] = useState([]);
  const [EditSize, setEditSize] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortOrder, setSortOrder] = useState("DESC");
  const [loading, Setloader] = useState(false)
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;
  // const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const sizeInput = watch("sizeName");

  const onSubmit = async (formData) => {
    try {
      Setloader(true)

      if (EditSize) {
        await axiosInstance.put(`${baseUrl}/size/update/${EditSize._id}`, formData);
        toast.success("Size updated!", { theme: "dark", autoClose: 1500 });
        setEditSize(null);
        Setloader(false)

      } else {


        await axiosInstance.post(`${baseUrl}/size/create`, formData);
        toast.success("Size added!", { theme: "dark", autoClose: 1500 });
        Setloader(false)

      }
      getSizes();
      reset();
      Setloader(false)

    } catch (e) {
      const errorMessage =
        e?.response?.data?.message || "Something went wrong!";
      toast.error(` ${errorMessage}`, { theme: "dark", autoClose: 2000 });
      console.error(e);
    } finally {
      Setloader(false)

    }
  };

  async function getSizes(search) {

    try {
      Setloader(true)

      const res = await axiosInstance.get(`${baseUrl}/size/getAll`, {
        params: {
          search: search || query, page: currentPage,
          limit: itemsPerPage,
          sortOrder: sortOrder
        }
      });
      setData(res.data.data.sizes);
      const total = res.data.data.totalCount;
      setTotalUsers(total)
      Setloader(false)

    } catch (e) {
      console.error(e);


    }
    finally {
      Setloader(false)

    }
  }

  useEffect(() => {
    getSizes(searchTerm)
  }, [searchTerm, currentPage, itemsPerPage, sortOrder])

  async function delSize(id) {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      try {
        Setloader(true)

        await axiosInstance.delete(`${baseUrl}/size/delete/${id}`);
        toast.success("Size deleted!", { theme: "dark", autoClose: 1500 });
        getSizes();
        Setloader(false)

      } catch (e) {
        const errorMessage =
          e?.response?.data?.message || "Something went wrong!";
        toast.error(`${errorMessage}`, { theme: "dark", autoClose: 2000 });
        console.error(e);
      } finally {
        Setloader(false)

      }
    }
  }

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(highlightId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.style.backgroundColor = "#fffae6"; // highlight effect
      }
    }
  }, [highlightId]);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  };

  function handleEdit(size) {
    setEditSize(size);
    setValue("sizeName", size.sizeName);
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const clearSearch = () => setSearchTerm("");

  useEffect(() => {
    getSizes();
  }, []);

  return (
    <>
      <div className={styles.wrapper}>
        <h2 className="fw-bold mb-4">Size Management</h2>

        <div className={styles.whiteBox}>
          {/* Add Size */}
          <form className={styles.addCategoryForm} onSubmit={handleSubmit(onSubmit)}>
            <h3><b>Add New Size :</b></h3>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                {...register("sizeName")}
                placeholder="Write Size Name"
                className={styles.inputBox}
              />
              {sizeInput && (
                <FaTimes
                  className={styles.clearIcon}
                  onClick={() => setValue("sizeName", "")}
                />
              )}
            </div>
            <button type="submit" className={styles.createBtn}>
              {EditSize ? "UPDATE" : "CREATE"}
            </button>
          </form>

          {/* Search */}
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
            </div>
          </div>

          {/* Table */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.headerText}>SIZE NAME</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.length > 0 ? data?.map((size, index) => (
                <tr key={index} id={size._id}>
                  <td>{size.sizeName}</td>
                  <td className={styles.icons}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" style={{ height: "24px" }} onClick={() => handleEdit(size)}  >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    {/* <TiPencil size={23} onClick={() => handleEdit(size)} /> */}
                    <FaTrash onClick={() => delSize(size._id)} />
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

      <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: " var(--pagination-bg, #fde6c9ff)" }} >
        <div className={styles.paginationInfo}>
          <span>Showing {data.length} Of {totalUsers} Size</span>
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
    </>
  );
}
