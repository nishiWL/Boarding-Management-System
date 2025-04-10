import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import UpdateCustomer from "./pages/UpdateCustomer.js";

import Dashborad from "./pages/dashboard.js";
import Homepage from "./pages/Homepage.js";
import Login from "./pages/CustomerLogin.js";
import AddRoom from './pages/AddRoom.js';
import RoomList from './pages/DisplayRoom.js';
import Bookroom from './pages/Bookroom.js';
import Register from "./pages/CustomerRegister.js";
import Profilepage from './pages/Profile.js';
import BookingForm from './pages/BookingForm.js'
import RoomDetailsPage from './pages/Rating.js';
import Mylistings from './pages/MyListings.js';
import AllListings from './pages/AllListings.js';
import Confirm from './pages/Confirm.js';
import AdminLogin from './pages/AdminLogin.js';
import AdminRegister from './pages/AdminRegister.js';
import Admindashboard from './pages/Admindashboard.js';
import Properties from './pages/Propertieshomepage.js';
import Message from './pages/Chat.js';



function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
     
          <Route path="/" element={<Homepage />} />     
          <Route path="/dash" element={<Dashborad />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/update-customer/:id" element={<UpdateCustomer />} /> 
          <Route path="/Properties" element={<Properties />} />       
          <Route path="/Profile" element={<Profilepage />} /> 
          <Route path='/AddRoom' element={<AddRoom />} />
          <Route path='/RoomList' element={<RoomList />} />
          <Route path='/Bookroom' element={<Bookroom />} />
          <Route path='/Bookroomform' element={<BookingForm/>} />
          <Route path='/MyRoom' element={<RoomDetailsPage/>} />
          <Route path='/MyListings' element={<Mylistings/>} />
          <Route path='/allListings' element={<AllListings/>} />
          <Route path='/Confirm' element={<Confirm/>} />
          <Route path="/AdminLogin" element={<AdminLogin />} />
          <Route path="/AdminRegister" element={<AdminRegister />} />
          <Route path="/Admindash" element={<Admindashboard />} />
          <Route path="/chatpage" element={<Message />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
