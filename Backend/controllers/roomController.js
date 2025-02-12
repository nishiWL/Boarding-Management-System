const Room = require("../models/Room");
const path = require("path");
const fs = require("fs");

// Fetch all verified rooms
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isVerified: true });
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching all rooms:", err);
    res.status(500).json({ error: "An error occurred while fetching rooms" });
  }
};

// Fetch rooms of the logged-in customer
const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ customerId: req.userId });
    res.json(rooms.length ? rooms : { message: "No rooms found for this customer" });
  } catch (err) {
    console.error("Error fetching customer rooms:", err);
    res.status(500).json({ error: "An error occurred while retrieving rooms" });
  }
};

// Fetch rooms of the logged-in customer
const getBookedroom = async (req, res) => {
  try {
    const rooms = await Room.find({ buyerCustomerId: req.userId });
    res.json(rooms.length ? rooms : { message: "No rooms found for this customer" });
  } catch (err) {
    console.error("Error fetching customer rooms:", err);
    res.status(500).json({ error: "An error occurred while retrieving rooms" });
  }
};

// Add a new room (Only Room Inputs)
const addRoom = async (req, res) => {
  try {
    const { roomAddress, roomCity, roomType, price, isNegotiable, ownerName, ownerContactNumber, description } = req.body;

    if (!roomAddress || !roomCity || !roomType || !price || !ownerName || !ownerContactNumber || !description) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!req.files || req.files.length < 1 || req.files.length > 10) {
      return res.status(400).json({ error: "You must upload between 1 and 10 images." });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);

    const newRoom = new Room({
      roomAddress,
      roomCity,
      roomType,
      price,
      isNegotiable: isNegotiable === "true",
      ownerName,
      ownerContactNumber,
      images: imagePaths,
      description,
      customerId: req.userId,
      addedDate: Date.now(),
      isVerified: false,  // Room is unverified by default
      isBooked: false,     // Room is not booked initially
    });

    await newRoom.save();
    res.status(201).json({ message: "Room added successfully!", newRoom });
  } catch (err) {
    console.error("Error adding room:", err);
    res.status(500).json({ error: "An error occurred while adding the room." });
  }
};


// Update room details
const updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId);

    if (!room) return res.status(404).json({ error: "Room not found" });

    const { keepImages = "[]" } = req.body;
    const imagesToKeep = JSON.parse(keepImages);

    // Delete removed images from server
    room.images.forEach((imagePath) => {
      if (!imagesToKeep.includes(imagePath)) {
        const filePath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    room.images = imagesToKeep;

    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map((file) => `/uploads/${file.filename}`);
      room.images.push(...uploadedImages);
    }

    Object.assign(room, req.body);

    await room.save();
    res.json({ message: "Room updated successfully", room });
  } catch (err) {
    console.error("Error updating room:", err);
    res.status(500).json({ error: "Failed to update room" });
  }
};

// Delete a room
const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const deletedRoom = await Room.findOneAndDelete({ _id: roomId, customerId: req.userId });

    if (!deletedRoom) return res.status(404).json({ error: "Room not found or not authorized" });

    // Delete room images from server
    deletedRoom.images.forEach((imagePath) => {
      const filePath = path.join(__dirname, "..", imagePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ error: "An error occurred while deleting the room" });
  }
};

// Get all unverified rooms (for admin)
const getUnverifiedRooms = async (req, res) => {
  try {
    const unverifiedRooms = await Room.find({ isVerified: false });
    res.json(unverifiedRooms);
  } catch (err) {
    console.error("Error fetching unverified rooms:", err);
    res.status(500).json({ error: "Error fetching unverified rooms" });
  }
};

// Verify (Approve/Reject) a room
const verifyRoom = async (req, res) => {
  try {
    if (typeof req.body.isVerified !== "boolean") {
      return res.status(400).json({ error: "Invalid value for isVerified" });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true }
    );

    if (!updatedRoom) return res.status(404).json({ error: "Room not found" });

    res.json(updatedRoom);
  } catch (err) {
    console.error("Error updating room verification status:", err);
    res.status(500).json({ error: "Error updating room verification status" });
  }
};

// Book a room
const bookRoom = async (req, res) => {
  try {
    const { roomId, buyerName, buyerContactNumber, buyerNIC, buyingDuration } = req.body;

    if (!roomId || !buyerName || !buyerContactNumber || !buyerNIC || !buyingDuration) {
      return res.status(400).json({ error: "All fields are required for booking." });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (room.isBooked) return res.status(400).json({ error: "Room is already booked" });

    // Update the room with booking details
    room.isBooked = true;
    room.buyerName = buyerName;
    room.buyerContactNumber = buyerContactNumber;
    room.buyerNIC = buyerNIC;
    room.buyerCustomerId = req.userId; // Automatically set buyerCustomerId
    room.buyingDate = new Date();
    room.buyingDuration = buyingDuration;

    await room.save();

    res.json({ message: "Room booked successfully!", room });
  } catch (err) {
    console.error("Error booking room:", err);
    res.status(500).json({ error: "An error occurred while booking the room." });
  }
};


// Fetch bookings for room owners
const getOwnerBookings = async (req, res) => {
  try {
    const rooms = await Room.find({ customerId: req.userId, isBooked: true });
    res.json(rooms.length ? rooms : { message: "No bookings found for your rooms" });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "An error occurred while fetching bookings" });
  }
};

const repostRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Find the room
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    // Reset the booking and buyer-related fields
    room.isBooked = false;
    room.isVerified = false;
    room.buyerName = null;
    room.buyerContactNumber = null;
    room.buyerNIC = null;
    room.buyerCustomerId = null;
    room.buyingDate = null;
    room.buyingDuration = null;

    // Save the updated room
    await room.save();

    res.json({ message: "Room reposted successfully! Room Rating will be added to the Filter Bar.", room });
  } catch (err) {
    console.error("Error reposting room:", err);
    res.status(500).json({ error: "An error occurred while reposting the room." });
  }
};



const buyerRating = async (req, res) => {
  try {
    const { roomId, buyerRating, ratingdescription } = req.body;

    // Check if both roomId, buyerRating, and ratingdescription are provided
    if (!roomId || !buyerRating || !ratingdescription) {
      return res.status(400).json({ error: "Room ID, buyer rating, and rating description are required." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.isBooked) {
      return res.status(400).json({ error: "Room is not booked yet." });
    }

    // Update buyer rating and rating description
    room.buyerRating = buyerRating;
    room.ratingdescription = ratingdescription; // Save the description along with the rating
    await room.save();

    res.json({ message: "Buyer rating and description updated successfully!", room });
  } catch (err) {
    console.error("Error updating buyer rating:", err);
    res.status(500).json({ error: "An error occurred while updating buyer rating." });
  }
};





module.exports = {
  getAllRooms,
  getMyRooms,
  getBookedroom,
  addRoom,
  updateRoom,
  deleteRoom,
  getUnverifiedRooms,
  verifyRoom,
  bookRoom,
  getOwnerBookings,
  buyerRating,
  repostRoom,
  
};
