import { useContext, useEffect, useState } from 'react';
import '../styles/Farmers.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faShoppingCart, faEye, faEyeSlash, faSeedling, faChartBar,
} from '@fortawesome/free-solid-svg-icons';
import { usersData, farmerDetails } from '../services/farmerService';
import { useSelectedFarmer } from '../contexts/SelectedFarmerContext';
import { AdminLocationPopUp } from './AdminLocationPopUp';
import Loading from './Loading';
import { ThemeContext } from '../contexts/ThemeContext';

// Import farmers management components
import SearchAndSort from './adminDashboard/SearchAndSort';
import MunicipalityInfo from './adminDashboard/MunicipalityInfo';
import FarmersTable from './adminDashboard/FarmersTable';
import Pagination from './adminDashboard/Pagination';

// Dashboard Components
import DashboardStats from './adminDashboard/DashboardStats';
import RecentActivity from './adminDashboard/RecentActivity';
import QuickActions from './adminDashboard/QuickActions';


// Import crop analytics components
import CropAnalyticsOverview from './adminDashboard/CropAnalyticsOverview';
import CropPerformanceCharts from './adminDashboard/CropPerformanceCharts';

// Import marketplace components
import MarketplaceOverview from './adminDashboard/MarketplaceOverview';
import OrdersManagement from './adminDashboard/OrdersManagement';

// Import data visualization components
import YieldTrendsChart from './adminDashboard/YieldTrendsChart';
import RevenueAnalytics from './adminDashboard/RevenueAnalytics';
import ReportGenerator from './adminDashboard/ReportGenerator';


export default function Farmers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [growthStageFilter, setGrowthStageFilter] = useState('');
  const [adminMunicipality, setAdminMunicipality] = useState('');
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);
  const [activeTab, setActiveTab] = useState('farmers');


  // Individual toggle states
  const [showCropOverview, setShowCropOverview] = useState(true);
  const [showCropCharts, setShowCropCharts] = useState(true);
  const [showMarketplace, setShowMarketplace] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const [showYieldCharts, setShowYieldCharts] = useState(true);
  const [showRevenueAnalytics, setShowRevenueAnalytics] = useState(true);
  const [showReportGenerator, setShowReportGenerator] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const { theme } = useContext(ThemeContext);
  const { setSelectedFarmer } = useSelectedFarmer();

  const handleClick = async (userId) => {
    try {
      const data = await farmerDetails(userId);
      setSelectedFarmer(data.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const query = { page: currentPage, limit: 5 };
      if (searchTerm) query.search = searchTerm;
      if (sortOption) query.sort = sortOption;
      if (growthStageFilter) query.growth_stage = growthStageFilter;

      const data = await usersData(query);

      if (data.requiresLocation) {
        setShowLocationPopup(true);
        setUsers([]);
        setAdminMunicipality('');
        setTotalPages(1);
        setTotalResults(0);
      } else {
        setUsers(data.data || []);
        setAdminMunicipality(data.adminMunicipality || '');
        setShowLocationPopup(false);
        setTotalPages(data.pages || 1);
        setTotalResults(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setShowLocationPopup(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      await fetchData();
      setTimeout(() => {
        setShowLoading(false);
        setIsLoading(false);
      }, 500);
    };
    initializeData();
  }, []);

  // Refetch when search/sort/page/filter changes
  useEffect(() => {
    if (!showLoading) fetchData();
  }, [searchTerm, sortOption, currentPage, growthStageFilter]);

  // Reset to page 1 when search, sort or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOption, growthStageFilter]);

  const handleSortOptionChange = (option) => {
    setSortOption(option);
  };

  const handleGrowthStageFilterChange = (stage) => {
    setGrowthStageFilter(stage);
  };

  const handlePopupClose = () => setShowLocationPopup(false);
  const handleLocationSetSuccess = () => fetchData();

  // Pagination helpers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  // Show loading progress screen only once
  if (showLoading) {
    return <Loading />;
  }

  // return (
  //   <div className={`farmers-container ${theme}`}>
  //     {showLocationPopup && (
  //       <AdminLocationPopUp setPopUp={handlePopupClose} onSuccess={handleLocationSetSuccess} />
  //     )}

  //     {/* Dashboard Section */}
  //     {showDashboard && (
  //       <div className={`dashboard-section ${theme}`}>
  //         <div className="dashboard-header">
  //           <h2>Farm Management Dashboard</h2>
  //           <button
  //             className={`toggle-dashboard-btn ${theme}`}
  //             onClick={() => setShowDashboard(!showDashboard)}
  //           >
  //             {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
  //           </button>
  //         </div>

  //         <div className="dashboard-content">
  //           <DashboardStats theme={theme} />

  //           <div className="dashboard-bottom-row">
  //             <div className="dashboard-column">
  //               <RecentActivity theme={theme} />
  //             </div>
  //             <div className="dashboard-column">
  //               <QuickActions
  //                 theme={theme}
  //                 onAction={(actionId) => console.log('Action:', actionId)}
  //               />
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     )}

  //     {/* Navigation Tabs */}
  //     <div className={`navigation-tabs ${theme}`}>
  //       <button
  //         className={`tab-button ${activeTab === 'farmers' ? 'active' : ''} ${theme}`}
  //         onClick={() => setActiveTab('farmers')}
  //       >
  //         <FontAwesomeIcon icon={faUsers} className="tab-icon" />
  //         <span className="tab-label">Farmers Management</span>
  //       </button>
  //       <button
  //         className={`tab-button ${activeTab === 'crops' ? 'active' : ''} ${theme}`}
  //         onClick={() => setActiveTab('crops')}
  //       >
  //         <FontAwesomeIcon icon={faSeedling} className="tab-icon" />
  //         <span className="tab-label">Crop Analytics</span>
  //       </button>
  //       <button
  //         className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''} ${theme}`}
  //         onClick={() => setActiveTab('marketplace')}
  //       >
  //         <FontAwesomeIcon icon={faShoppingCart} className="tab-icon" />
  //         <span className="tab-label">Marketplace</span>
  //       </button>
  //       <button
  //         className={`tab-button ${activeTab === 'reports' ? 'active' : ''} ${theme}`}
  //         onClick={() => setActiveTab('reports')}
  //       >
  //         <FontAwesomeIcon icon={faChartBar} className="tab-icon" />
  //         <span className="tab-label">Reports & Analytics</span>
  //       </button>
  //     </div>
  //     {/* Farmers Management Section */}
  //     {activeTab === 'farmers' && (
  //       <div className={`farmers-management-section ${theme}`}>
  //         {!showDashboard && (
  //           <div className="show-dashboard-mini">
  //             <button
  //               className={`show-dashboard-btn ${theme}`}
  //               onClick={() => setShowDashboard(true)}
  //             >
  //               Show Dashboard
  //             </button>
  //           </div>
  //         )}

  //         <SearchAndSort
  //           theme={theme}
  //           searchTerm={searchTerm}
  //           setSearchTerm={setSearchTerm}
  //           sortOption={sortOption}
  //           handleSortOptionChange={handleSortOptionChange}
  //           onGrowthStageFilterChange={handleGrowthStageFilterChange}
  //         />

  //         {isLoading ? (
  //           <div className="loading-state-container">
  //             <div className="loading-spinner"></div>
  //             <p>Loading farmers data...</p>
  //           </div>
  //         ) : (
  //           <>
  //             <MunicipalityInfo
  //               theme={theme}
  //               adminMunicipality={adminMunicipality}
  //               totalResults={totalResults}
  //               currentPage={currentPage}
  //             />

  //             <FarmersTable
  //               users={users}
  //               theme={theme}
  //               handleClick={handleClick}
  //               isLoading={isLoading}
  //             />

  //             <Pagination
  //               theme={theme}
  //               currentPage={currentPage}
  //               totalPages={totalPages}
  //               totalResults={totalResults}
  //               goToPage={goToPage}
  //               goToPrevPage={goToPrevPage}
  //               goToNextPage={goToNextPage}
  //               getPageNumbers={getPageNumbers}
  //             />
  //           </>
  //         )}
  //       </div>
  //     )}

  //     {/* Crop Analytics Section */}
  //     {activeTab === 'crops' && (
  //       <div className={`crop-analytics-section ${theme}`}>
  //         <div className="crop-section-toggles">
  //           <button
  //             className={`section-toggle-btn ${showCropOverview ? 'active' : ''} ${theme}`}
  //             onClick={() => setShowCropOverview(!showCropOverview)}
  //           >
  //             {showCropOverview ? '📋 Hide Crop Overview' : '📋 Show Crop Overview'}
  //           </button>
  //           <button
  //             className={`section-toggle-btn ${showCropCharts ? 'active' : ''} ${theme}`}
  //             onClick={() => setShowCropCharts(!showCropCharts)}
  //           >
  //             {showCropCharts ? '📊 Hide Analytics' : '📊 Show Analytics'}
  //           </button>
  //         </div>

  //         {showCropOverview && <CropAnalyticsOverview theme={theme} />}
  //         {showCropCharts && <CropPerformanceCharts theme={theme} />}

  //         {!showCropOverview && !showCropCharts && (
  //           <div className={`all-sections-hidden ${theme}`}>
  //             <p>All crop analytics sections are hidden.</p>
  //             <button
  //               className={`show-all-sections-btn ${theme}`}
  //               onClick={() => {
  //                 setShowCropOverview(true);
  //                 setShowCropCharts(true);
  //               }}
  //             >
  //               Show All Sections
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     )}

  //     {/* Marketplace Section */}
  //     {activeTab === 'marketplace' && (
  //       <div className={`marketplace-section ${theme}`}>
  //         <div className="marketplace-section-toggles">
  //           <button
  //             className={`section-toggle-btn ${showMarketplace ? 'active' : ''} ${theme}`}
  //             onClick={() => setShowMarketplace(!showMarketplace)}
  //           >
  //             {showMarketplace ? '🛒 Hide Marketplace' : '🛒 Show Marketplace'}
  //           </button>
  //           <button
  //             className={`section-toggle-btn ${showOrders ? 'active' : ''} ${theme}`}
  //             onClick={() => setShowOrders(!showOrders)}
  //           >
  //             {showOrders ? '📦 Hide Orders' : '📦 Show Orders'}
  //           </button>
  //         </div>

  //         {showMarketplace && <MarketplaceOverview theme={theme} />}
  //         {showOrders && <OrdersManagement theme={theme} />}

  //         {!showMarketplace && !showOrders && (
  //           <div className={`all-sections-hidden ${theme}`}>
  //             <p>All marketplace sections are hidden.</p>
  //             <button
  //               className={`show-all-sections-btn ${theme}`}
  //               onClick={() => {
  //                 setShowMarketplace(true);
  //                 setShowOrders(true);
  //               }}
  //             >
  //               Show All Sections
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     )}

  //     {/* Data Visualization & Reports Section */}
  //     {activeTab === 'reports' && (
  //       <div className={`reports-section ${theme}`}>
  //         <div className="reports-section-toggles">
  //           <button
  //             className={`section-toggle-btn ${showYieldCharts ? 'active' : ''} ${theme}`}
  //             onClick={() => setShowYieldCharts(!showYieldCharts)}
  //           >
  //             {showYieldCharts ? '📊 Hide Yield Charts' : '📊 Show Yield Charts'}
  //           </button>
  //           <button
  //             className={`section-toggle-btn ${showRevenueAnalytics ? 'active' : ''} ${theme}`}
  //             onClick={() => setShowRevenueAnalytics(!showRevenueAnalytics)}
  //           >
  //             {showRevenueAnalytics ? '💰 Hide Revenue Analytics' : '💰 Show Revenue Analytics'}
  //           </button>
  //           <button
  //             className={`section-toggle-btn ${showReportGenerator ? 'active' : ''} ${theme}`}
  //             onClick={() => setShowReportGenerator(!showReportGenerator)}
  //           >
  //             {showReportGenerator ? '📄 Hide Report Generator' : '📄 Show Report Generator'}
  //           </button>
  //         </div>

  //         {showYieldCharts && <YieldTrendsChart theme={theme} />}
  //         {showRevenueAnalytics && <RevenueAnalytics theme={theme} />}
  //         {showReportGenerator && <ReportGenerator theme={theme} />}

  //         {!showYieldCharts && !showRevenueAnalytics && !showReportGenerator && (
  //           <div className={`all-sections-hidden ${theme}`}>
  //             <p>All data visualization sections are hidden.</p>
  //             <button
  //               className={`show-all-sections-btn ${theme}`}
  //               onClick={() => {
  //                 setShowYieldCharts(true);
  //                 setShowRevenueAnalytics(true);
  //                 setShowReportGenerator(true);
  //               }}
  //             >
  //               Show All Sections
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // );
 return (
    <div className={`farmers-container ${theme}`}>
      {showLocationPopup && (
        <AdminLocationPopUp setPopUp={handlePopupClose} onSuccess={handleLocationSetSuccess} />
      )}

            {/* Navigation Tabs */}
      <div className={`navigation-tabs ${theme}`}>
        <button
          className={`tab-button ${activeTab === 'farmers' ? 'active' : ''} ${theme}`}
          onClick={() => setActiveTab('farmers')}
        >
          <FontAwesomeIcon icon={faUsers} className="tab-icon" />
          <span className="tab-label">Farmers Management</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'crops' ? 'active' : ''} ${theme}`}
          onClick={() => setActiveTab('crops')}
        >
          <FontAwesomeIcon icon={faSeedling} className="tab-icon" />
          <span className="tab-label">Crop Analytics</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''} ${theme}`}
          onClick={() => setActiveTab('marketplace')}
        >
          <FontAwesomeIcon icon={faShoppingCart} className="tab-icon" />
          <span className="tab-label">Marketplace</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''} ${theme}`}
          onClick={() => setActiveTab('reports')}
        >
          <FontAwesomeIcon icon={faChartBar} className="tab-icon" />
          <span className="tab-label">Reports & Analytics</span>
        </button>
      </div>

      {/* Dashboard Section */}
      {showDashboard && (
        <div className={`dashboard-section ${theme}`}>
          <div className="dashboard-header">
            <h2>Farm Management Dashboard</h2>
            <button
              className={`toggle-dashboard-btn ${theme}`}
              onClick={() => setShowDashboard(!showDashboard)}
            >
              {showDashboard ? (
                <>
                  <FontAwesomeIcon icon={faEyeSlash} className="btn-icon" />
                  Hide Dashboard
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faEye} className="btn-icon" />
                  Show Dashboard
                </>
              )}
            </button>
          </div>

          <div className="dashboard-content">
            <DashboardStats theme={theme} />

            <div className="dashboard-bottom-row">
              <div className="dashboard-column">
                <RecentActivity theme={theme} />
              </div>
              <div className="dashboard-column">
                <QuickActions
                  theme={theme}
                  onAction={(actionId) => console.log('Action:', actionId)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farmers Management Section */}
      {activeTab === 'farmers' && (
        <div className={`farmers-management-section ${theme}`}>
          {!showDashboard && (
            <div className="show-dashboard-mini">
              <button
                className={`show-dashboard-btn ${theme}`}
                onClick={() => setShowDashboard(true)}
              >
                <FontAwesomeIcon icon={faEye} className="btn-icon" />
                Show Dashboard
              </button>
            </div>
          )}

          <SearchAndSort
            theme={theme}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOption={sortOption}
            handleSortOptionChange={handleSortOptionChange}
            onGrowthStageFilterChange={handleGrowthStageFilterChange}
          />

          {isLoading ? (
            <div className="loading-state-container">
              <div className="loading-spinner"></div>
              <p>Loading farmers data...</p>
            </div>
          ) : (
            <>
              <MunicipalityInfo
                theme={theme}
                adminMunicipality={adminMunicipality}
                totalResults={totalResults}
                currentPage={currentPage}
              />

              <FarmersTable
                users={users}
                theme={theme}
                handleClick={handleClick}
                isLoading={isLoading}
              />

              <Pagination
                theme={theme}
                currentPage={currentPage}
                totalPages={totalPages}
                totalResults={totalResults}
                goToPage={goToPage}
                goToPrevPage={goToPrevPage}
                goToNextPage={goToNextPage}
                getPageNumbers={getPageNumbers}
              />
            </>
          )}
        </div>
      )}

      {/* Crop Analytics Section */}
      {activeTab === 'crops' && (
        <div className={`crop-analytics-section ${theme}`}>
          <div className="crop-section-toggles">
            <button
              className={`section-toggle-btn ${showCropOverview ? 'active' : ''} ${theme}`}
              onClick={() => setShowCropOverview(!showCropOverview)}
            >
              <FontAwesomeIcon icon={showCropOverview ? faEyeSlash : faEye} className="btn-icon" />
              {showCropOverview ? 'Hide Crop Overview' : 'Show Crop Overview'}
            </button>
            <button
              className={`section-toggle-btn ${showCropCharts ? 'active' : ''} ${theme}`}
              onClick={() => setShowCropCharts(!showCropCharts)}
            >
              <FontAwesomeIcon icon={showCropCharts ? faEyeSlash : faEye} className="btn-icon" />
              {showCropCharts ? 'Hide Analytics' : 'Show Analytics'}
            </button>
          </div>

          {showCropOverview && <CropAnalyticsOverview theme={theme} />}
          {showCropCharts && <CropPerformanceCharts theme={theme} />}

          {!showCropOverview && !showCropCharts && (
            <div className={`all-sections-hidden ${theme}`}>
              <p>All crop analytics sections are hidden.</p>
              <button
                className={`show-all-sections-btn ${theme}`}
                onClick={() => {
                  setShowCropOverview(true);
                  setShowCropCharts(true);
                }}
              >
                <FontAwesomeIcon icon={faEye} className="btn-icon" />
                Show All Sections
              </button>
            </div>
          )}
        </div>
      )}

      {/* Marketplace Section */}
      {activeTab === 'marketplace' && (
        <div className={`marketplace-section ${theme}`}>
          <div className="marketplace-section-toggles">
            <button
              className={`section-toggle-btn ${showMarketplace ? 'active' : ''} ${theme}`}
              onClick={() => setShowMarketplace(!showMarketplace)}
            >
              <FontAwesomeIcon icon={showMarketplace ? faEyeSlash : faEye} className="btn-icon" />
              {showMarketplace ? 'Hide Marketplace' : 'Show Marketplace'}
            </button>
            <button
              className={`section-toggle-btn ${showOrders ? 'active' : ''} ${theme}`}
              onClick={() => setShowOrders(!showOrders)}
            >
              <FontAwesomeIcon icon={showOrders ? faEyeSlash : faEye} className="btn-icon" />
              {showOrders ? 'Hide Orders' : 'Show Orders'}
            </button>
          </div>

          {showMarketplace && <MarketplaceOverview theme={theme} />}
          {showOrders && <OrdersManagement theme={theme} />}

          {!showMarketplace && !showOrders && (
            <div className={`all-sections-hidden ${theme}`}>
              <p>All marketplace sections are hidden.</p>
              <button
                className={`show-all-sections-btn ${theme}`}
                onClick={() => {
                  setShowMarketplace(true);
                  setShowOrders(true);
                }}
              >
                <FontAwesomeIcon icon={faEye} className="btn-icon" />
                Show All Sections
              </button>
            </div>
          )}
        </div>
      )}

      {/* Data Visualization & Reports Section */}
      {activeTab === 'reports' && (
        <div className={`reports-section ${theme}`}>
          <div className="reports-section-toggles">
            <button
              className={`section-toggle-btn ${showYieldCharts ? 'active' : ''} ${theme}`}
              onClick={() => setShowYieldCharts(!showYieldCharts)}
            >
              <FontAwesomeIcon icon={showYieldCharts ? faEyeSlash : faEye} className="btn-icon" />
              {showYieldCharts ? 'Hide Yield Charts' : 'Show Yield Charts'}
            </button>
            <button
              className={`section-toggle-btn ${showRevenueAnalytics ? 'active' : ''} ${theme}`}
              onClick={() => setShowRevenueAnalytics(!showRevenueAnalytics)}
            >
              <FontAwesomeIcon icon={showRevenueAnalytics ? faEyeSlash : faEye} className="btn-icon" />
              {showRevenueAnalytics ? 'Hide Revenue Analytics' : 'Show Revenue Analytics'}
            </button>
            <button
              className={`section-toggle-btn ${showReportGenerator ? 'active' : ''} ${theme}`}
              onClick={() => setShowReportGenerator(!showReportGenerator)}
            >
              <FontAwesomeIcon icon={showReportGenerator ? faEyeSlash : faEye} className="btn-icon" />
              {showReportGenerator ? 'Hide Report Generator' : 'Show Report Generator'}
            </button>
          </div>

          {showYieldCharts && <YieldTrendsChart theme={theme} />}
          {showRevenueAnalytics && <RevenueAnalytics theme={theme} />}
          {showReportGenerator && <ReportGenerator theme={theme} />}

          {!showYieldCharts && !showRevenueAnalytics && !showReportGenerator && (
            <div className={`all-sections-hidden ${theme}`}>
              <p>All data visualization sections are hidden.</p>
              <button
                className={`show-all-sections-btn ${theme}`}
                onClick={() => {
                  setShowYieldCharts(true);
                  setShowRevenueAnalytics(true);
                  setShowReportGenerator(true);
                }}
              >
                <FontAwesomeIcon icon={faEye} className="btn-icon" />
                Show All Sections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}