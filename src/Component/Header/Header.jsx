import React, { useContext, useState } from 'react';
import styles from './Header.module.css';
import { FiSearch, FiX, FiLogOut } from 'react-icons/fi';
import { HiOutlineArrowRightStartOnRectangle } from 'react-icons/hi2';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { SearchContext } from '../../context/SearchContext';

export default function Header() {
  const { searchText, setSearchText, setIsSearching } = useContext(SearchContext);
  const navigate = useNavigate();
  const handleClearSearch = () => {
    setSearchText('');
    setIsSearching(true);
  };


  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  async function signOut() {
    let result = await Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No, cancel!'
    })
    if (result.isConfirmed) {


      const deviceId = localStorage.getItem('deviceId');
      const userId = localStorage.getItem('UserId');
      try {
        let post = await axiosInstance.post(`${baseUrl}/admin/logout`, { deviceId, userId })
        // console.log("response", post)
        localStorage.removeItem('authToken')
        setTimeout(() => {
          navigate("/")
        }, 1000);

        toast.success("Sign out successful!", {
          position: "top-right",
          autoClose: 1000,
          theme: "colored",
        });

      } catch (e) {
        const errorMessage =
          e?.response?.data?.message || "Something went wrong!";
        toast.error(`${errorMessage}`, { theme: "dark", autoClose: 2000 });
        console.error(e);

      }
    }
    }

    return (
      <div className={styles.headerPart}>
        {/* Left Section */}
        <div className={styles.greeting}>
          <h6><b>Hello,</b></h6>
          <h1 className={styles.userName}>Vikas Soni</h1>
          {/* <p className={styles.newOrderText}>You Have <b>1 New</b> Order Today!</p> */}
        </div>


        <div className={styles.searchWrapper}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <div className={styles.separator}></div>
            <input
              type="text"
              placeholder="Search"
              className={styles.searchInput}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setIsSearching(true);
              }}

            />
            {searchText && (
              <FiX className={styles.clearIcon} onClick={handleClearSearch} />
            )}
          </div>
        </div>


        <div className={styles.signOutWrapper}>
          <button className={styles.signOutBtn} onClick={() => signOut()}>
            Sign Out
            <HiOutlineArrowRightStartOnRectangle className={styles.logoutIcon} />

          </button>
        </div>


      </div>
    );
  }
