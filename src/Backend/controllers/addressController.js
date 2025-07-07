import Address from '../models/Address.js';

// Thêm địa chỉ
const addAddress = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ lấy từ token, KHÔNG lấy từ req.body

    const addressData = {
      ...req.body,
      userId
    };

    const newAddress = new Address(addressData);
    await newAddress.save();

    res.json({ success: true, message: 'Thêm địa chỉ thành công', address: newAddress });
  } catch (err) {
    res.json({ success: false, message: 'Lỗi khi thêm địa chỉ: ' + err.message });
  }
};

// Lấy danh sách địa chỉ của người dùng
const getAddressList = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ sửa lại
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, addressList: addresses });
  } catch (err) {
    res.json({ success: false, message: 'Lỗi khi lấy địa chỉ: ' + err.message });
  }
};

// Xóa địa chỉ
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id; // ✅ sửa lại

    const result = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!result) return res.json({ success: false, message: 'Không tìm thấy địa chỉ để xoá' });

    res.json({ success: true, message: 'Xoá địa chỉ thành công' });
  } catch (err) {
    res.json({ success: false, message: 'Lỗi khi xoá địa chỉ: ' + err.message });
  }
};

// Sửa địa chỉ
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const userId = req.user.id; // ✅ lấy từ token

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      { ...req.body },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: 'Không tìm thấy địa chỉ để cập nhật' });
    }

    res.json({ success: true, message: 'Cập nhật địa chỉ thành công', address: updated });
  } catch (err) {
    res.json({ success: false, message: 'Lỗi khi cập nhật địa chỉ: ' + err.message });
  }
};

// Lấy thông tin địa chỉ theo ID
const getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
    }

    res.json({ success: true, address });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy địa chỉ: ' + err.message });
  }
};


export { addAddress, getAddressList, deleteAddress,updateAddress,getAddressById };
