const bcrypt = require("bcryptjs");

const hashing = async (value) => {
  try {
    const salt = await bcrypt.genSalt(10);
    console.log("Salt", salt);
    const hash = await bcrypt.hash(value, salt);
    return hash;
  } catch (error) {
    return error;
  }
};

const hashCompare = async (password, hashValue) => {
  try {
    return await bcrypt.compare(password, hashValue);
  } catch (error) {
    return error;
  }
};

module.exports = { hashing, hashCompare };
