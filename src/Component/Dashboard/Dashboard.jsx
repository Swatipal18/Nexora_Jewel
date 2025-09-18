import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { RiMoneyRupeeCircleFill } from 'react-icons/ri';
import { FaIndianRupeeSign, FaCircle } from 'react-icons/fa6';
import { IoIosTrendingUp, IoIosTrendingDown } from 'react-icons/io';
import { FaUsers, FaBoxOpen } from 'react-icons/fa';
import { MdOutlineCallMade, MdOutlineShoppingBag } from 'react-icons/md';
import { IoDownloadOutline } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import SalesChart from '../saleschart/SalesChart';
import CountUp from 'react-countup';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import 'bootstrap/dist/css/bootstrap.min.css';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { BsExclamationOctagon } from 'react-icons/bs';

const FILTER_OPTIONS = ['Today', 'Last 7 Days', 'This Month', 'Custom'];
export default function Dashboard() {
  const [overview, setOverview] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [BestSelling, setBestSelling] = useState([])
  const [NewOrder, SetNewOrder] = useState([])
  const [lastTransaction, setLastTransaction] = useState([])

  const [selectedFilter, setSelectedFilter] = useState("Last 7 Days");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRange, setCustomRange] = useState({ startDate: "", endDate: "" });


  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;
  const navigate = useNavigate();
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const response = await axiosInstance.get(`${baseUrl}/order/dashboard`);
        const stats = response.data.data;
        // console.log('stats: ', stats);

        const overviewData = [
          {
            icon: <RiMoneyRupeeCircleFill size={42} />,
            title: "Total Sales",
            symbol: <FaIndianRupeeSign />,
            amount: stats.totalSales?.total ?? 0,
            upDown: stats.totalSales?.isPositive ? <IoIosTrendingUp /> : <IoIosTrendingDown />,
            change: stats.totalSales?.change ?? 0,
            isPositive: stats.totalSales?.isPositive ?? true,
            time: "Last Week"
          },
          {
            icon: <MdOutlineShoppingBag size={42} />,
            title: "Total Orders",
            symbol: '',
            amount: stats.totalOrders?.total ?? 0,
            upDown: stats.totalOrders?.isPositive ? <IoIosTrendingUp /> : <IoIosTrendingDown />,
            change: stats.totalOrders?.change ?? 0,
            isPositive: stats.totalOrders?.isPositive ?? true,
            time: "Last Week"
          },
          {
            icon: <FaUsers size={42} />,
            title: "Total Users",
            symbol: '',
            amount: stats.totalUsers?.total ?? 0,
            upDown: stats.totalUsers?.isPositive ? <IoIosTrendingUp /> : <IoIosTrendingDown />,
            change: stats.totalUsers?.change ?? 0,
            isPositive: stats.totalUsers?.isPositive ?? true,
            time: "Last Week"
          },
          {
            icon: <FaBoxOpen size={42} />,
            title: "Total Items",
            symbol: '',
            amount: stats.totalItems?.total ?? 0,
            upDown: stats.totalItems?.isPositive ? <IoIosTrendingUp /> : <IoIosTrendingDown />,
            change: stats.totalItems?.change ?? 0,
            isPositive: stats.totalItems?.isPositive ?? true,
            time: "Last Week"
          }
        ];

        setOverview(overviewData);
      } catch (error) {
        console.error("Failed to fetch dashboard overview", error);
      }
    };

    fetchOverviewData();
  }, []);








  // jab dropdown me value select hoti hai
  const handleFilterChange = (value) => {
    setSelectedFilter(value); // dropdown ki value state me save ho gayi

    if (value === "Custom") {
      // agar user Custom select kare to popup modal dikhao
      setShowCustomModal(true);
    } else {
      // warna API call karo aur data reload karo
      sendParams({ filterDto: value });
    }
  };

  const handleApplyCustom = () => {
    // agar koi date nahi dali to alert do
    if (!customRange.startDate || !customRange.endDate) {
      alert("Please select both From and To dates");
      return;
    }


    setShowCustomModal(false);

    setCustomRange({ startDate: "", endDate: "" });
    sendParams({
      filterDto: "Custom",
      startDate: customRange.startDate,
      endDate: customRange.endDate,
    });
  };

  const handleCancelCustom = () => {
    // Modal band karo
    setShowCustomModal(false);

    // Date khali karo
    setCustomRange({ startDate: "", endDate: "" });

    // Dropdown me "Last 7 Days" set karo
    setSelectedFilter("Last 7 Days");

    // "Today" ka data fetch karo
    sendParams({ filterDto: "Last 7 Days" });
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const sendParams = async ({ filterDto, startDate, endDate }) => {
    // Log sirf wahi dikhaye jo actual API call me jaa raha ho
    const logParams = { filterDto };
    if (filterDto === "Custom") {
      logParams.startDate = startDate;
      logParams.endDate = endDate;
    }
    // console.log("API call sending with:", logParams);

    try {
      const params = { filterDto };
      // console.log(' params: ', params);

      if (filterDto === "Custom") {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const response = await axiosInstance.get(`${baseUrl}/order/top-selling-categories`, {
        params,
      });

      // console.log("API Response for filter:", response.data);

      const formattedData = response.data.data?.map((item) => ({
        name: item.title,
        value: item.totalSold,
        color: getRandomColor()
      }));

      setCategoryData(formattedData);
    } catch (error) {
      console.error("Failed to fetch category data with filter:", filterDto, error);
    }
  };






  useEffect(() => {
    sendParams({ filterDto: "Last 7 Days" });
  }, []);


  useEffect(() => {
    const fetchBestSelling = async () => {
      try {
        let res = await axiosInstance.get(`${baseUrl}/order/best-selling-products`);
        // console.log(' res : ', res.data.data);
        setBestSelling(res.data.data)
      } catch (e) {
        console.log(e)
      }
    }
    fetchBestSelling();
  }, [])


  useEffect(() => {
    const fetchNewOrder = async () => {
      let res = await axiosInstance.get(`${baseUrl}/order/new-orders`)
      // console.log('res: ', res.data.data);
      SetNewOrder(res.data.data)
    }
    fetchNewOrder();
  }, [])

  useEffect(() => {
    const FetchLastTrans = async () => {
      let res = await axiosInstance.get(`${baseUrl}/order/last-transactions`)
      // console.log('res: ', res.data.data);

      setLastTransaction(res.data.data)
    }
    FetchLastTrans();
  }, [])


  const total = categoryData.reduce((acc, item) => acc + item.value, 0);

  const CustomLegend = () => (
    <div>
      {categoryData?.map((entry, index) => {
        const percentage = ((entry.value / total) * 100).toFixed(1);
        return (
          <div key={index} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <FaCircle color={entry.color} style={{ marginRight: "8px", fontSize: "12px" }} />
              <span style={{ fontWeight: "bold" }}>{entry.name}</span>
            </div>
            <div style={{ fontSize: "12px", color: "gray", marginLeft: "20px" }}>
              {percentage}% — {entry.value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );

  const convertToIST = (utcTime) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  function ViewAll() {
    navigate("/order")
  }
  return (
    <div className={styles.dashboard}>
      <div className={styles.overviewHeader}>
        <h1 className='position-sticky top-25'><b>Overview</b></h1>
      </div>

      {/* Overview Cards */}
      <div className={styles.cardContainer}>
        {overview?.map((v, i) => (
          <div className={styles.cardWrapper} key={i}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                {v.icon}
                <h5>{v.title}</h5>
              </div>
              <div className={styles.cardContent}>
                <h3>{v.symbol} <CountUp end={v.amount} duration={1} separator="," /></h3>

              </div>
            </div>
          </div>
        ))}
      </div>

      <SalesChart />

      <div className="container-fluid p-0 my-4" >
        <div className="row">
          {/* Best Selling Product */}
          <div className="col-lg-6 mb-4">
            <div className={styles.ProductDetails}>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h6 className="mb-4 ms-2" ><b>Best Selling Product</b></h6>
                <div className="d-flex p-2">
                  {/* <LuFilter className={styles.FilterIcon} /> */}
                  <IoDownloadOutline className={styles.FilterIcon} />
                </div>
              </div>
              <table className="table table-hover" >
                <tbody>
                  {BestSelling.length > 0 ? BestSelling.slice(0, 5)?.map((v, i) => (
                    <tr key={i}>
                      <td>{v.itemName}</td>
                      <td className="text-secondary">{v.unitsSold}</td>
                      <td className={v.stockStatus === "Stock" ? styles.stockInStock : styles.stockOutOfStock}>
                        {v.stockStatus}
                      </td>
                      <td className={styles.detailPrice}>₹ {v.sellingPrice.$numberDecimal}</td>
                    </tr>

                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        <BsExclamationOctagon size={60} color='var(--text-black, #55142A)' /><br />
                        <h4 className='mt-2'>No Transactions Found</h4>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>

            </div>
          </div>


          {/* New Orders */}
          <div className="col-lg-6 mb-4">
            <div className={styles.ProductDetail}>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h6 className="mb-3 ms-3"><b>New Orders</b></h6>
                <div className="d-flex p-2">
                  {/* <LuFilter className={styles.FilterIcon} /> */}
                  <IoDownloadOutline className={styles.FilterIcon} />
                </div>
              </div>
              <table className="table table-hover">
                <tbody>
                  {NewOrder.length > 0 ? NewOrder.slice(0, 5)?.map((v, i) => (
                    <tr key={i}>
                      <td>{v.itemName}</td>
                      <td className="text-secondary">{v.categoryName}</td>
                      <td>₹ {v.sellingPrice}</td>
                      <td style={{ cursor: "pointer" }} onClick={() => navigate('/order', {
                        state: {
                          orderId: v._id,
                          status: v.status?.toLowerCase()
                        }
                      })}> <b>View</b></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        <BsExclamationOctagon size={60} color='var(--text-black, #55142A)' /><br />
                        <h4 className='mt-2'>No Transactions Found</h4>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div>
                <button className={styles.ViewAllBtn} onClick={() => ViewAll()}>View All <MdOutlineCallMade /></button>
              </div>
            </div>
          </div>

          {/* Top Selling Category */}
          <div className="col-lg-6 mb-4 h-25">
            <div className={styles.PieChart}>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h6 className="mb-4 ms-2"><b>Top Selling Category</b></h6>
                <div className="d-flex p-2">

                  <div className="position-relative">
                    <select
                      className={styles.dropdownFilter}
                      value={selectedFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      onClick={() => {
                        if (selectedFilter == "Custom") {
                          setShowCustomModal(true)
                        }
                      }}


                    >
                      {FILTER_OPTIONS?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Date Modal */}
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
                              onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <label><b>To:</b></label><br />
                            <input
                              className={styles.DatePicker}
                              type="date"
                              max={new Date().toISOString().split("T")[0]}
                              value={customRange.endDate}
                              onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
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



                  <IoDownloadOutline className={styles.FilterIcon} />
                </div>
              </div>
              {categoryData.length > 0 && total > 0 ? (
                <div className="row">
                  <div className="col-sm-5">
                    <div className={styles.legendScroll}>
                      <CustomLegend />
                    </div>
                  </div>

                  <div className="col-sm-7">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                        >
                          {categoryData?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value?.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className='text-center d-flex'>
                  <span colSpan="4" className="text-center d-flex w-100 justify-content-center align-items-center flex-column py-5 text-muted">
                    <BsExclamationOctagon size={60} color='var(--text-black, #55142A)' /><br />
                    <h4 className='mt-2'>No Transactions Found</h4>
                  </span>
                </div>
              )}

            </div>
          </div>


          {/* Last Transactions */}
          <div className="col-lg-6 mb-4">
            <div className={styles.PieChart}>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h6 className="mb-3 ms-3"><b>Last Transactions</b></h6>
                <div className="d-flex p-2">
                  {/* <LuFilter className={styles.FilterIcon} /> */}
                  <IoDownloadOutline className={styles.FilterIcon} />
                </div>
              </div>
              <table className="table table-hover">
                <tbody>
                  {lastTransaction.length > 0 ? lastTransaction.slice(0, 5)?.map((v, i) => (
                    <tr key={i}>
                      <td>{v.orderId}</td>
                      <td className="text-secondary">{convertToIST(v.date)}</td>
                      <td className="text-secondary">{v.totalPrice}</td>
                      <td style={{ cursor: "pointer" }} onClick={() => navigate('/order', {
                        state: {
                          orderId: v._id,
                          status: v.status?.toLowerCase()
                        }
                      })}>
                        <b>View</b>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        <BsExclamationOctagon size={60} color='var(--text-black, #55142A)' /><br />
                        <h4 className='mt-2'>No Transactions Found</h4>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div>
                <button className={styles.ViewBtn} onClick={() => navigate("/Invoice")}>View All <MdOutlineCallMade /></button>
              </div>
            </div>
          </div>

        </div>
      </div>




    </div>
  );
}


