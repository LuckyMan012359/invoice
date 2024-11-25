const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

exports.createCustomer = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, homeAddress, password } = req.body;

  try {
    const adminUser = await User.findOne({ email: req.user.email }).exec();
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).send({ message: 'Admin only can add customer.' });
    }

    const existingCustomer = await User.findOne({ email }).exec();
    if (existingCustomer) {
      return res
        .status(409)
        .send({ message: "Customer already exists. Please update customer's info" });
    }

    const userData = new User({
      firstName,
      lastName,
      email,
      role: 'customer',
      password: bcrypt.hashSync(password, 8),
      homeAddress: homeAddress,
      phoneNumber: phoneNumber,
    });

    await userData.save();
    return res.status(201).send({ message: 'Customer created successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'An error occurred while creating the customer.' });
  }
};

exports.readCustomer = async (req, res) => {
  const { pageNum, pageSize, keyword } = req.query;

  try {
    const adminUser = await User.findOne({ email: req.user.email }).exec();
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).send({ message: 'Admin only can read customers.' });
    }

    const filter = {
      role: { $ne: 'admin' },
      ...(keyword
        ? {
            $or: [
              { firstName: { $regex: keyword, $options: 'i' } },
              { lastName: { $regex: keyword, $options: 'i' } },
              { email: { $regex: keyword, $options: 'i' } },
              { phoneNumber: { $regex: keyword, $options: 'i' } },
            ],
          }
        : {}),
    };

    const limit = parseInt(pageSize);
    const skip = (parseInt(pageNum) - 1) * limit;

    const customers = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCount = await User.find(filter).countDocuments(filter);

    return res.status(200).send({
      data: customers,
      meta: {
        totalRecords: totalCount,
        currentPage: parseInt(pageNum),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'An error occurred while fetching customers.' });
  }
};

exports.updateCustomer = async (req, res) => {
  const { _id, firstName, lastName, email, phoneNumber, homeAddress, password } = req.body;

  console.log(req.body);

  try {
    const adminUser = await User.findOne({ email: req.user.email }).exec();
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).send({ message: 'Admin only can update customer.' });
    }

    const existingCustomer = await User.findOne({ _id }).exec();
    if (!existingCustomer) {
      return res.status(404).send({ message: 'Customer not found.' });
    }

    const updateFields = {
      firstName,
      lastName,
      email,
      homeAddress,
      phoneNumber,
    };

    if (password && password.trim()) {
      console.log(123);

      updateFields.password = bcrypt.hashSync(password, 8);
    }

    await User.updateOne({ _id }, { $set: updateFields });

    return res.status(200).send({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'An error occurred while updating the customer.' });
  }
};

exports.deleteCustomer = async (req, res) => {
  console.log(req.query);
  const { deleteCustomerID } = req.query;

  try {
    const adminUser = await User.findOne({ email: req.user.email }).exec();
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).send({ message: 'Only admins can delete customers.' });
    }

    if (!deleteCustomerID) {
      return res.status(400).send({ message: 'Customer ID is required.' });
    }

    const deletedCustomer = await User.findByIdAndDelete(deleteCustomerID).exec();
    if (!deletedCustomer) {
      return res.status(404).send({ message: 'Customer not found.' });
    }

    return res
      .status(200)
      .send({ message: 'Customer deleted successfully.', customer: deletedCustomer });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).send({ message: 'An error occurred while deleting the customer.' });
  }
};
