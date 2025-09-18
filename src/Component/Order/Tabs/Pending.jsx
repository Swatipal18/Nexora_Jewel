import React, { use, useEffect, useState } from 'react';
import styles from '../Order.module.css';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoPrint } from 'react-icons/io5';

import axiosInstance from '../../../api/axiosInstance';
import Loader from '../../pages/Loader/Loader';


function Pending({ orders, getOrder, expandRequest }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [expandedOrderItems, setExpandedOrderItems] = useState([]);
  const [loading, Setloader] = useState(false)

  const [dropdownValue, setdropdown] = useState('')


  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const convertToIST = (utcTime) => {
    const options = {

      year: "numeric",
      month: "long",
      day: "2-digit",

    };
    return new Intl.DateTimeFormat("en-IN", options).format(new Date(utcTime));
  };

  async function EditOrder(e, order) {
    Setloader(true)
    const newStatus = e.target.value;
    setdropdown(newStatus);
    let response = await axiosInstance.put(`${baseUrl}/order/updateOrderStatus/${order._id}`,
      { status: newStatus }
    )
    getOrder();
    Setloader(false)
  }

  const handleExpand = (index, orderId) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
      setExpandedOrderItems([]);
    } else {
      setExpandedIndex(index);
      getexpandDetail(orderId);
    }
  };

  useEffect(() => {
    if (expandRequest?.orderId) {
      setExpandedIndex(expandRequest.index);
    }
  }, [expandRequest]);

  useEffect(() => {
    if (expandRequest) {
      setExpandedIndex(expandRequest.index);
      getexpandDetail(expandRequest.orderId);
    }
  }, [expandRequest]);

  async function getexpandDetail(id) {
    Setloader(true)
    let response = await axiosInstance.get(`${baseUrl}/order/getOrderById/${id}`)
    // console.log(response.data.data.items)
    setExpandedOrderItems(response.data.data.items)
    Setloader(false)
  }

  useEffect(() => {
    setExpandedIndex(null);
    setExpandedOrderItems([]);
  }, [orders]);

  return (

    <>
      <div className="table-responsive">
        <table className={`table ${styles.orderTable}`}>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>DATE</th>
              <th>SENDER NAME</th>
              <th>RECEIVER NAME</th>
              <th>QUANTITY</th>
              <th>SALES</th>
              <th>STATUS</th>
              <th></th>

            </tr>
          </thead>
          <tbody>
            {orders?.length > 0 ? orders?.map((order, index) => (
              <React.Fragment key={index}>
                <tr className={`${styles.pendingdetail}`}>
                  <td className={` ${expandedIndex === index ? styles.activeRow : ''}`}>{order.orderId}</td>
                  <td className={` ${expandedIndex === index ? styles.activeRow : ''}`}>{convertToIST(order.date)}</td>
                  <td className={` ${expandedIndex === index ? styles.activeRow : ''}`}>{order.senderName}</td>
                  <td className={` ${expandedIndex === index ? styles.activeRow : ''}`}>{`${order.deliveryPersonFirstname} ${order.deliveryPersonLastname}`}</td>
                  <td className={` ${expandedIndex === index ? styles.activeRow : ''}`}>{order.quantity}</td>
                  <td className={`${expandedIndex === index ? styles.activeRow : ''}`}>
                    ₹{Number((order.sales || '0').replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
                  </td>

                  <td className={` ${expandedIndex === index ? styles.activeRow : ''}`}>
                    <select className={styles.tabdropdown} value={order.status}

                      onChange={(e) => EditOrder(e, order)}>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="picked">Picked</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className={` ${expandedIndex === index ? styles.activeRow : ''}`}>
                    <button
                      type="button"
                      className={styles.expandButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpand(index, order._id);
                      }}
                    >
                      {expandedIndex === index ? <FaChevronUp  color='var(--text-color, #55142A)'/> : <FaChevronDown  color='var(--text-color, #55142A)'/>}
                    </button>
                  </td>
                </tr>
                {/* Expand items table */}
                {expandedIndex === index && (
                  <tr>
                    <td colSpan="7">
                      <div className={styles.orderItemsSection}>
                        <table className={`table  ${styles.itemTable}`}>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>SKU</th>
                              <th>ITEM NAME</th>
                              <th>PRICE</th>
                              <th>QTY</th>
                              <th >ADDRESS</th>
                              <th>TOTAL</th>
                              <th><IoPrint />print</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expandedOrderItems?.map((item, i) => (
                              <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{item.skus}</td>
                                <td className={styles.itemName}>{item.itemName}</td>
                                <td>₹{(item.sellingPrice).toLocaleString('en-IN')}</td>
                                <td>{item.quantity}</td>
                                <td className={styles.itemAddress}>{item.address}</td>
                                <td>
                                  ₹ {(item.sellingPrice * item.quantity).toLocaleString('en-IN')}
                                </td>
                                <td></td>
                              </tr>
                            ))}
                            {(() => {
                              const cleanSales = order.sales?.replace(/[^0-9.]/g, '') || '0';
                              const subtotal = parseFloat(cleanSales);

                              const cleanShipping = order.shipping?.replace(/[^0-9.]/g, '') || '0';
                              const shipping = parseFloat(cleanShipping);

                              const discountType = order.discountType;
                              const discountValue = parseFloat(order.discountValue) || 0;

                              let coupon = 0;

                              if (discountType === 'percentage') {
                                coupon = +(subtotal * (discountValue / 100)).toFixed(2);
                              } else if (discountType === 'flat') {
                                coupon = discountValue;
                              }

                              const isCouponApplied = coupon > 0;


                              const gstBase = isCouponApplied ? subtotal - coupon : subtotal;
                              const gst = +(gstBase * 0.03).toFixed(2);

                              const total = parseFloat(cleanSales);

                              return (
                                <tr>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td style={{ textAlign: "left", lineHeight: "2.1", fontSize: "16px" }}>
                                    <b>SubTotal:</b><span style={{ fontWeight: "500" }}> ₹{subtotal?.toLocaleString('en-IN')}</span><br />
                                    <b>Shipping:</b> <span style={{ fontWeight: "500" }}> +₹{shipping?.toLocaleString('en-IN')}</span><br />
                                    {isCouponApplied && (
                                      <>
                                        <b>
                                          Coupon ({order.code}): {discountType === 'percentage' ? `${discountValue}%` : `₹${discountValue}`}
                                        </b> <span style={{ fontWeight: "500" }}>-₹{coupon?.toLocaleString('en-IN')}</span>

                                        <br />
                                      </>
                                    )}
                                    <b>GST (3%):</b> <span style={{ fontWeight: "500" }}>+₹{gst?.toLocaleString('en-IN')}</span><br />
                                    <b>Total: ₹{total?.toLocaleString('en-IN')}</b>
                                  </td>
                                  {/* <td></td> */}
                                </tr>
                              );
                            })()}


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
      {loading && (
       <Loader />
      )}
    </>
  );
}

export default Pending;
