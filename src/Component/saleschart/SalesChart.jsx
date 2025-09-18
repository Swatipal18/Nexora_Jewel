import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { MdFilterListAlt } from 'react-icons/md';
import { IoDownloadOutline } from 'react-icons/io5';
import axiosInstance from '../../api/axiosInstance';
import { LuChartNoAxesCombined } from 'react-icons/lu';


const SalesChart = () => {
  const [chartData, setChartData] = useState([]);
  const baseUrl = import.meta.env.VITE_REACT_APP_API_URL;

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data } = await axiosInstance.get(`${baseUrl}/order/chart`);
        if (data?.data?.monthlySales) {
          const formattedData = data.data.monthlySales?.map(item => ({
            month: item.month,
            sales: item.totalSales || 0
          }));
          setChartData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching sales chart data:", error);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="mt-5  p-3  " style={{ backgroundColor: "var(--white, #FFF3E3)", border: "1px solid var(--text-black, #55142A)", borderRadius: "10px", }}>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h4 className="mb-0"><b>Sales Report</b></h4>
        <div className="d-flex p-2" >
          {/* <MdFilterListAlt
            style={{
              background: "black",
              color: "gray",
              padding: "5px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px"
            }}
          /> */}
          <IoDownloadOutline
            style={{
              background: "var(--text-black, #55142A)",
              color: "var(--white, #FFF3E3)",
              padding: "5px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "8px",
              width: "28px",
              height: "28px"
            }}
          />
        </div>
      </div>


      <ResponsiveContainer width="100%" height={400} className="mt-3 rounded position-relative" style={{ backgroundColor: "var(--white, #FFF3E3)",  color: "var(--text-black, #55142A)" }}>
        {chartData.length > 0 ? (
          <AreaChart data={chartData} margin={{ top: 40, right: 40, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--text-black, #55142A)" stopOpacity={1} />
                <stop offset="95%" stopColor="var(--text-black, #55142A)" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="var(--text-black, #55142A)"
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        ) : (
          <div className="text-center" style={{ paddingTop: '100px' }}>
            <span className="text-muted py-5"><LuChartNoAxesCombined size={60} /><br /><h4 className='mt-2'>No Data Found
            </h4> </span>
          </div>
        )}
      </ResponsiveContainer>

    </div>
  );
};


export default SalesChart;
