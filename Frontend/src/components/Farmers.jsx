import React, { useEffect, useState } from 'react'
import '../styles/Farmers.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSort } from '@fortawesome/free-solid-svg-icons'
import { usersData, farmData } from '../services/farmerService';


export default function Farmers({setSelectedFarmer}) {
  const [select, setSelect] = useState('');
  const [users, setUsers] = useState([]); 
  const [farms, setFarms] = useState([]);
  const [sortBy, setSortBy] = useState(false);

  const handleClick = (v) => {
    setSelectedFarmer(v);
  }

  //attempts to fetch the data and store it in farmers state
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await usersData();
        setUsers(data.data);
        console.log('request sent')
      } catch(err) {
        console.log(err);
      }
    } 
    fetchData();
  }, []);

  //tests what is inside what is supposed to be the data
  console.log(users)

  return (
    <div className="farmers-container">
      <div className="header-farmers-containers">
        <div className="sort-container">
          <button className="sort-by-container" onClick={() => setSortBy((prev) => !prev)}>Sort By <span className="sortIcon"><FontAwesomeIcon icon={faSort} /></span></button>
          {sortBy && <div className="sort-extent">
            <div className="sort-options">
              <p>Default</p>
              <p>Name(asc)</p>
              <p>Crop (asc)</p>
              <p>Availability</p>
            </div>
          </div>}
        </div>
        <input type="text" className="searchFarmersContainer" placeholder="Search..." />
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Farm Size</th>
              <th>Crop Type</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {users && users.map((user) => (
              <tr key={user.id} onClick={() => handleClick(user.id)}>
                <td>{user.name}</td>
                <td>{/*user.farm.farmSize*/}</td>
                <td>
                  <ul>
                    {/*user.farm.crops.map(crop=> (<li key={crop._id}>{crop.cropType}</li>))*/}
                  </ul>
                </td>
                <td>kg</td>
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
