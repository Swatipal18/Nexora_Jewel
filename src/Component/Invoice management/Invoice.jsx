import React, { useState, useEffect } from "react";
import styles from "./Invoice.module.css";
import { FaFileCsv, FaFileInvoice } from "react-icons/fa6";
import axiosInstance from "../../api/axiosInstance";

export default function Invoice() {
  const [invoiceData, setInvoiceData] = useState([
    {
      invoiceNumber: "1D-19",
      userName: "shivangi",
      userContact: "924127728",
      generatedDate: "05 July 2025",
    },
    {
      invoiceNumber: "16D-24",
      userName: "Ayush",
      userContact: "9824467713",
      generatedDate: "20 June 2025",
    },
  ]);

  const [selectedRows, setSelectedRows] = useState([]);

  const FILTER_OPTIONS = ['All', 'Today', 'Last 7 Days', 'Custom'];
  const [filterChange, setfilterChange] = useState("")
  const [showmodel, SetshowModal] = useState(false);


  // useEffect(() => {
  //   const fetchInvoiceData = async () => {
  //     try {
  //       const response = await axiosInstance.get("YOUR_API_ENDPOINT_HERE");
  //       console.log('response: ', response);
  //       setInvoiceData(response.data); // adjust according to API response structure
  //     } catch (error) {
  //       console.error("Error fetching invoice data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allNumbers = invoiceData?.map((item) => item.invoiceNumber);
      setSelectedRows(allNumbers);
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (invoiceNumber) => {
    if (selectedRows.includes(invoiceNumber)) {
      setSelectedRows(selectedRows.filter((num) => num !== invoiceNumber));
    } else {
      setSelectedRows([...selectedRows, invoiceNumber]);
    }
  };

  const handleFilterChange = (value) => {
    console.log('value: ', value);
    setfilterChange(value)
    if (value == "Custom") {
      SetshowModal(true)
    }
    // else{

    // }
  }

  const handleCancelCustom = () => {
    SetshowModal(false)

  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <h2 className="fw-bold">Invoice Management</h2>
          <div className="d-flex gap-2">
            <button className={styles.actionBtn}><FaFileCsv /> Download CSV</button>
            <button className={styles.actionBtn}><FaFileInvoice /> Download Invoice</button>
            {/* <button className={styles.actionBtn}>Filter</button> */}


            <select value={filterChange} onChange={(e) => handleFilterChange(e.target.value)}>
              {FILTER_OPTIONS?.map((options) => {
                return (
                  <option key={options}>{options}</option>
                )
              })}
            </select>

          </div>
        </div>

        <div className={styles.whiteBox}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={invoiceData.length > 0 && selectedRows.length === invoiceData.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>INVOICE NUMBER</th>
                  <th>USER NAME</th>
                  <th>USER CONTACT</th>
                  <th>GENERATED DATE</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData?.length > 0 ? (
                  invoiceData?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.invoiceNumber)}
                          onChange={() => handleSelectRow(item.invoiceNumber)}
                        />
                      </td>
                      <td>{item.invoiceNumber}</td>
                      <td>{item.userName}</td>
                      <td>{item.userContact}</td>
                      <td>{item.generatedDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showmodel && (
        <div className={styles.modelOverlay}>
          <div className={styles.Modelcontent}>
            <h5>Select Date Range</h5>
            <div className="d-flex gap-3 mt-4">
              <div>
                <label>From:</label><br />

                <input type="date" name="" className={styles.datepicker} />
              </div>
              <div>
                <label>To:</label><br />
                <input type="date" name="" className={styles.datepicker} />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button className={styles.btnApply}>Apply</button>
              <button onClick={handleCancelCustom} className={styles.btnCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
