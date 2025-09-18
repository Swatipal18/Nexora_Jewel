import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { RiAppsFill, RiBox3Fill, RiFeedbackFill, RiPieChart2Fill } from 'react-icons/ri';
import { HiMiniShoppingBag, HiTruck } from 'react-icons/hi2';
import { FaUsers, FaChevronDown, FaChevronUp, FaAd } from 'react-icons/fa';
import { IoMdChatboxes, IoMdNotifications, IoMdRocket } from 'react-icons/io';
import { BiSolidCoupon } from 'react-icons/bi';

import LogoImg from '../../assets/images/LOGO.png';
import { AiFillTool } from 'react-icons/ai';
import { FaWallet } from 'react-icons/fa6';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setOpenDropdown(null);
  };

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  const isActivePath = (path) => location.pathname === path;

  const isAnyChildActive = (children) =>
    children?.some((child) => isActivePath(child.path));

  useEffect(() => {
    const matchedDropdown = menuItems.find(
      (item) => item.children && isAnyChildActive(item.children)
    );
    if (matchedDropdown) {
      setOpenDropdown(matchedDropdown.label);
    } else {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: <RiAppsFill />,
      path: '/admin',
    },
    {
      label: 'Invoice',
      icon: <FaWallet />,
      path: '/Invoice',
    },
    {
      label: 'Orders',
      icon: <HiMiniShoppingBag />,
      path: '/order',
    },
    {
      label: 'Items',
      icon: <RiBox3Fill />,
      children: [
        { label: 'Add Item', path: '/Additem' },
        { label: 'All Items', path: '/Allitem' },
        { label: 'Category', path: '/category' },
        { label: 'Sub Category', path: '/Subcatagory' },
        { label: 'Size', path: '/Size' },
        { label: 'Metal', path: '/Metal' },
      ],
    },
    {
      label: 'Users',
      icon: <FaUsers />,
      path: '/User',
    },
    // {
    //   label: 'Reports',
    //   icon: <RiPieChart2Fill />,
    //   path: '/Reports',
    // },
    {
      label: 'Supplier',
      icon: <HiTruck />,
      path: '/Supplier',
      children: [
        { label: 'All Supplier', path: '/AllSupplier' },
        { label: 'Create Supplier', path: '/CreateSupplier' },
      ]
    },
    {
      label: 'Coupons',
      icon: <BiSolidCoupon />,
      path: '/Coupon',
      children: [
        { label: 'All Coupon', path: '/AllCoupon' },
        { label: 'Create Coupon', path: '/Coupon' },
      ]
    },
    {
      label: 'Notification',
      icon: <IoMdNotifications />,
      path: '/Notification',
      children: [
        { label: 'All Notification', path: '/AllNotification' },
        { label: 'Push Notification', path: '/AddNotification' },
      ]
    },
    {
      label: 'Banner',
      icon: <FaAd />,
      children: [
        { label: 'All Bannner', path: '/AllBanner' },
        { label: 'Add Banner', path: '/Addbanner' },
      ],
    },
    {
      label: 'Support',
      icon: <IoMdChatboxes />,
      path: '/Support',
    },
    {
      label: 'Feedback',
      icon: <RiFeedbackFill />,
      path: '/Feedback',
    },
    {
      label: 'Ship Rocket',
      icon: <IoMdRocket />,
      path: '/ShipRocket',
    },
    {
      label: 'Settings',
      icon: <AiFillTool />,
      path: '/Setting'
    }
  ];

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.topBar}>
        <div className={styles.toggleButton} onClick={handleToggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" width="52" height="32" viewBox="0 0 52 32">
            <g id="Hamburger" transform="translate(0 -33)">
              <path id="Rectangle_4" d="M0,0H42A10,10,0,0,1,52,10V32a0,0,0,0,1,0,0H0a0,0,0,0,1,0,0V0A0,0,0,0,1,0,0Z"
                transform="translate(0 33)" fill="#55142A" />
              <path id="Path_3" d="M3.75,6.75h16.5M3.75,12h16.5M3.75,17.25H12"
                transform="translate(20.25 38)" fill="none" stroke="#FFF3E3"
                stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
            </g>
          </svg>

        </div>
        {!isCollapsed && <img src={LogoImg} alt="Logo" className={styles.logo} />}
      </div>


      <div className={styles.menuContainer}>
        {menuItems?.map((item, index) => {
          const hasChildren = !!item.children;
          const activeParent = openDropdown === item.label;

          // const isDropdownActive = openDropdown === item.label || (!openDropdown && activeChild);


          const isOrders = item.label === 'Orders';
          const addSpacingBelowOrders = openDropdown === 'Items' || '/User';



          return (
            <div
              key={index}
              className={`${addSpacingBelowOrders ? styles.addSpacingBelow : ''}`}>
              {
                hasChildren ? (
                  <>
                    <div
                      onClick={() => toggleDropdown(item.label)}
                      className={` ${styles.menuItem}
    ${openDropdown === item.label ? styles.activeTab : ''}
  `}
                    >

                      <span className={styles.icon}>{item.icon}</span>
                      {!isCollapsed && <span className={styles.label}>{item.label}</span>}
                      {!isCollapsed && (
                        openDropdown === item.label ? (
                          <FaChevronUp className={styles.chevron} />
                        ) : (
                          <FaChevronDown className={styles.chevron} />
                        )
                      )}
                    </div>
                    {!isCollapsed && openDropdown === item.label && (
                      <div className={`${styles.dropdownMenu} ${styles.openDropdownMenu}`}>
                        {item.children?.map((subItem, idx) => (
                          <NavLink
                            key={idx}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `${styles.submenuLink} ${isActive ? styles.activeSubTab : ''}`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `${styles.menuItem} ${isActive ? styles.activeTab : ''}`
                    }
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    {!isCollapsed && <span className={styles.label}>{item.label}</span>}
                  </NavLink>
                )}
            </div>
          );
        })}
      </div>

      {/* <div className={styles.bottomItem}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.activeTab : ''}`
          }
        >
          <span className={styles.icon}><AiFillTool /></span>
          {!isCollapsed && <span className={styles.label}>Settings</span>}
        </NavLink>
      </div> */}
    </div>

  );
};

export default Sidebar;
