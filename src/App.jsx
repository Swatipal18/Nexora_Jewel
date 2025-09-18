import React, { useEffect, useState } from 'react';
import Sidebar from './Component/Sidebar/Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './Component/Header/Header';
import { useDispatch } from 'react-redux';
import { setToken } from './store/authSlice';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { getFcmToken, onForegroundMessageListener } from './firebase';
import { SearchContext } from './context/SearchContext';
import axiosInstance from './api/axiosInstance';

const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;
export default function App() {
  const [searchText, setSearchText] = useState('');
  // console.log('searchText: ', searchText);
  const [isSearching, setIsSearching] = useState(false);


  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  // console.log('isSidebarCollapsed: ', isSidebarCollapsed);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSearching) return;

    const fetchSearchData = async () => {
      try {
        const [itemsRes, size, metal, user, category, subcategory, supplier] = await Promise.all([
          axiosInstance.get(`${baseUrl}/item/getAll`, {
            params: { search: searchText, page: 1, limit: 100 }
          }),
          axiosInstance.get(`${baseUrl}/size/getAll`, {
            params: { search: searchText, page: 1, limit: 100 }
          }),
          axiosInstance.get(`${baseUrl}/metal/list`, {
            params: { search: searchText, page: 1, limit: 100 }
          }),
          axiosInstance.get(`${baseUrl}/item/getAllUser`, {
            params: { search: searchText, page: 1, limit: 100 }
          }),
          axiosInstance.get(`${baseUrl}/categories/getAll`, {
            params: { search: searchText, page: 1, limit: 100 }
          }),
          axiosInstance.get(`${baseUrl}/sub-categories/getAll`, {
            params: { search: searchText, page: 1, limit: 100 },
          }),
          axiosInstance.get(`${baseUrl}/supplier/getAll`, {
            params: { search: searchText, page: 1, limit: 100 },
          }),
        ]);

        const matches = [];

        if (itemsRes.data.data.items.length > 0) matches.push("Allitem");
        if (size.data.data.sizes.length > 0) matches.push("Size");
        if (metal.data.data.metals.length > 0) matches.push("metal");
        if (user.data.data.users.length > 0) matches.push("user");
        if (category.data.data.categories.length > 0) matches.push("category");
        if (subcategory.data.data.categories.length > 0) matches.push("Subcatagory");
        if (supplier.data.data.suppliers.length > 0) matches.push("AllSupplier");


        if (searchText === '') {
          navigate("/admin");
        } else if (matches.length === 1) {
          navigate(`/${matches[0]}?q=${searchText}`);
        } else if (matches.length > 1) {
          navigate(`/search?q=${searchText}`);
        } else {
          navigate(`/no-results?q=${searchText}`);
        }
      } catch (err) {
        console.error("Global search failed", err);
      } finally {
        setIsSearching(false);  // reset search state
      }
    };



    fetchSearchData();
  }, [searchText, navigate, isSearching]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch(setToken(token));
    }
    // Get and log FCM token
    getFcmToken().then(token => {
      if (token) {

      }
    });

    // Foreground message handler
    onForegroundMessageListener()
      .then((payload) => {
        const { title, body } = payload.notification;
        toast.info(`${title} - ${body}`);
      })
      .catch((err) => console.error("Error in foreground message listener:", err));
  }, [dispatch]);

  return (
    <SearchContext.Provider value={{ searchText, setSearchText, setIsSearching }}>
      <div className="layout-container">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        <div
          className="main-content-section"
          style={{
            marginLeft: isSidebarCollapsed ? '70px' : '200px',
            transition: 'margin-left 0.3s ease',
            height: '100vh',
            overflowY: 'auto',
            background: 'var(--white, #FFF3E3)',
          }}
        >
          <Header />
          <Outlet />
        </div>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"

        />
      </div>
    </SearchContext.Provider>

  );
}


