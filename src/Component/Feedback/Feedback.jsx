import React, { useEffect, useState } from 'react'
import styles from './Feedback.module.css'
import axiosInstance from '../../api/axiosInstance';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6';
import { GoSortAsc, GoSortDesc } from 'react-icons/go';

export default function Feedback() {

  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [sortOrder, setSortOrder] = useState("DESC")
  const [loading, Setloader] = useState(false)
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  async function GetFeedback(search) {
    Setloader(true)

    let res = await axiosInstance.get(`${baseUrl}/review/getReviews`, {
      params:
      {
        search: search,
        page: currentPage,
        limit: itemsPerPage,
        // sortOrder: sortOrder
      }
    });
    // console.log('res : ', res.data.data);
    setData(res.data.data.reviewList)
    const total = res.data.data.totalCount;
    setTotalUsers(total)
    Setloader(false)

  }
  useEffect(() => {
    GetFeedback()
  }, [searchTerm, currentPage, itemsPerPage, sortOrder])



  // useEffect(() => {
  //   GetFeedback()
  // }, [])

  const convertToIST = (utcTime) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "ASC" ? "DESC" : "ASC"));
    setCurrentPage(1);
  };
  return (
    <>
      <div className={styles.wrapper} style={{ background: "var(--white)" }}>
        <h2 className="fw-bold mb-4">Feedback</h2>

        <div className={styles.whiteBox}>

          {/* Search & Filter */}
          {/* <div className={styles.searchFilterRow}>
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
                {sortOrder === "ASC" ? <GoSortDesc title="Sort Descending" /> : <GoSortAsc title="Sort Ascending" />}
              </div>
              <button className={styles.filterBtn}>Filter</button>
            </div>
          </div> */}

          {/* Table */}
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.headerText}>ITEM NAME</th>
                  <th className={styles.headerText}>USER NAME</th>
                  <th className={styles.headerText}>CREATED</th>
                  <th>RATING</th>
                  <th className={styles.headerText}>DESCRIPTION</th>
                  {/* <th className={styles.headerText}>TOTAL ORDER</th> */}
                  {/* <th className={styles.headerText}>ACTIVE</th> */}

                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.length > 0 ? data?.map((cat, index) => (
                  <React.Fragment key={index}>
                    <tr

                    >
                      <td>{cat?.item?.itemName}</td>
                      <td>{cat?.user?.firstName} {cat?.user?.lastName}</td>
                      <td>{convertToIST(cat.createdAt)}</td>
                      <td>
                        {[...Array(5)]?.map((_, i) => (
                          <span key={i} style={{ color: i < cat.rating ? '#55142A' : 'gray', marginRight: "8px", fontSize: "20px" }}>
                            ★
                          </span>
                        ))}
                      </td>

                      <td>{cat?.description}</td>
                      {/* <td>0</td> */}

                      <td className={styles.icons}>



                        {/* <FaTrash onClick={() => delCatagory(cat._id)} /> */}

                      </td>
                    </tr>

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


      <div className=" col-12 d-flex align-items-center mt-3 position-fixed p-2 ps-4 bottom-0" style={{ background: " var(--pagination-bg)" }} >
        <div className={styles.paginationInfo}>
          <span>Showing {data.length} Of {totalUsers} Sub-Category</span>
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
    </>
  );
}
