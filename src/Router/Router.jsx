import React from 'react';
import {
  createHashRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';

import App from '../App';
import Order from '../Component/Order/Order';
import { AddItem } from '../Component/Items/AddItem';
import AllItems from '../Component/Items/AllItems';
import User from '../Component/User/User';
import Dashboard from '../Component/Dashboard/Dashboard';
import Login from '../Component/Login/Login';
import AllBanner from '../Component/Banner/AllBanner';
import Addbanner from '../Component/Banner/Addbanner';
import { Catagory } from '../Component/Items/Catagory/Catagory';
import Editbanner from '../Component/Banner/Editbanner';
import SubCatagory from '../Component/Items/Subcatagory/SubCatagory';
import Size from '../Component/Items/Size/Size';
import Allsupplier from '../Component/Supplier/Allsupplier/Allsupplier';
import CreateSupplier from '../Component/Supplier/CreateSupplier/CreateSupplier';
import EditSupplier from '../Component/Supplier/EditSupplier.jsx/EditSupplier';
import Metal from '../Component/Items/Metal/Metal';
import EditItem from '../Component/Items/EditItem/EditItem';
import Coupon from '../Component/Coupon/Coupon';
import AllCoupon from '../Component/Coupon/All-Coupon/AllCoupon';
import EditCoupon from '../Component/Coupon/EditCoupon/EditCoupon';
import Addnotification from '../Component/Notification/Add notification/Addnotification';
import AllNotification from '../Component/Notification/All notification/AllNotification';
import SHipRocket from '../Component/Ship Rocket/SHipRocket';
import Feedback from '../Component/Feedback/Feedback';
import NoResults from '../Component/NoResult/NoResults';
import Search from '../Component/pages/Search';
import Setting from '../Component/Setting/Setting';
import Support from '../Component/Support/Support';
import Invoice from '../Component/Invoice management/Invoice';

// ✅ Protected Route Logic
// const ProtectedRoute = () => {
//   const authToken = localStorage.getItem('authToken');
//   if (!authToken) {
//     return <Navigate to="/" replace />;
//   }
//   return <Outlet />;
// };

export default function Router() {
  const routes = createHashRouter([
    {
      path: "/",
      element: <Login />, // Public Route
    },
    {
      path: "/",
      element: <ProtectedRoute />, // Wrapper for all private routes
      children: [
        {
          path: "/",
          element: <App />,
          children: [
            { path: "/admin", element: <Dashboard /> },
            { path: "/order", element: <Order /> },
            { path: "/Additem", element: <AddItem /> },
            { path: "/Allitem", element: <AllItems /> },
            { path: "/EditItem/:id", element: <EditItem /> },
            { path: "/category", element: <Catagory /> },
            { path: "/User", element: <User /> },
            { path: "/AllBanner", element: <AllBanner /> },
            { path: "/Addbanner", element: <Addbanner /> },
            { path: "/Editbanner/:id", element: <Editbanner /> },
            { path: "/Subcatagory", element: <SubCatagory /> },
            { path: "/Size", element: <Size /> },
            { path: "/AllSupplier", element: <Allsupplier /> },
            { path: "/CreateSupplier", element: <CreateSupplier /> },
            { path: "/EditSupplier/:id", element: <EditSupplier /> },
            { path: "/Metal", element: <Metal /> },
            { path: "/Coupon", element: <Coupon /> },
            { path: "/AllCoupon", element: <AllCoupon /> },
            { path: "/EditCoupon/:id", element: <EditCoupon /> },
            { path: "/AddNotification", element: <Addnotification /> },
            { path: "/AllNotification", element: <AllNotification /> },
            { path: "/ShipRocket", element: <SHipRocket /> },
            { path: "/Feedback", element: <Feedback /> },
            { path: "/search", element: <Search /> },
            { path: "/no-results", element: <NoResults /> },
            { path: "/Setting", element: <Setting /> },
            { path: "/Support", element: <Support /> },
            { path: "/Invoice", element: <Invoice /> },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]);

  return <RouterProvider router={routes} />;
}
