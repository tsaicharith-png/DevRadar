const validator = require("validator");

const validateUserData = (body) => {
  const fail = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  };

  // 1. Validate request body
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    fail("Invalid request body");
  }

  const {
    firstName,
    lastName,
    emailId,
    password,
    age,
    gender,
    photoUrl,
    about,
    skills,
  } = body;

  // 2. Reject unexpected fields
  const allowedFields = [
    "firstName",
    "lastName",
    "emailId",
    "password",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];

  const extraFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key),
  );

  if (extraFields.length > 0) {
    fail("Unexpected fields: " + extraFields.join(", "));
  }

  // 3. Required fields
  if (
    typeof firstName !== "string" ||
    typeof emailId !== "string" ||
    typeof password !== "string"
  ) {
    fail("First name, email and password are required");
  }

  // 4. First name
  const cleanFirstName = firstName.trim();

  if (
    cleanFirstName.length < 2 ||
    cleanFirstName.length > 50 ||
    !/^[\p{L}\p{M} '-]+$/u.test(cleanFirstName) ||
    !/\p{L}/u.test(cleanFirstName)
  ) {
    fail("Invalid first name");
  }

  // 5. Last name (optional)
  let cleanLastName;

  if (lastName !== undefined) {
    if (typeof lastName !== "string") {
      fail("Last name must be a string");
    }

    cleanLastName = lastName.trim();

    if (
      cleanLastName.length > 50 ||
      (cleanLastName.length > 0 &&
        (!/^[\p{L}\p{M} '-]+$/u.test(cleanLastName) ||
          !/\p{L}/u.test(cleanLastName)))
    ) {
      fail("Invalid last name");
    }
  }

  // 6. Email
  const cleanEmail = emailId.trim().toLowerCase();

  if (cleanEmail.length > 254 || !validator.isEmail(cleanEmail)) {
    fail("Invalid email address");
  }

  // 7. Password
  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 128) {
    fail("Password must be at least 8 characters and at most 128 bytes");
  }

  // 8. Age (optional)
  if (age !== undefined && (!Number.isInteger(age) || age < 18 || age > 120)) {
    fail("Age must be an integer between 18 and 120");
  }

  // 9. Gender (optional)
  let cleanGender;

  if (gender !== undefined) {
    if (typeof gender !== "string") {
      fail("Gender must be a string");
    }

    cleanGender = gender.trim().toLowerCase();

    if (!["male", "female", "others"].includes(cleanGender)) {
      fail("Invalid gender");
    }
  }

  // 10. Photo URL (optional)
  let cleanPhotoUrl;

  if (photoUrl !== undefined) {
    if (typeof photoUrl !== "string") {
      fail("Photo URL must be a string");
    }

    cleanPhotoUrl = photoUrl.trim();

    try {
      const parsedUrl = new URL(cleanPhotoUrl);

      if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname.includes(".") ||
        cleanPhotoUrl.length > 2048
      ) {
        fail("Invalid photo URL");
      }
    } catch (err) {
      if (err.statusCode) throw err;
      fail("Invalid photo URL");
    }
  }

  // 11. About (optional)
  let cleanAbout;

  if (about !== undefined) {
    if (typeof about !== "string") {
      fail("About must be a string");
    }

    cleanAbout = about.trim();

    if (cleanAbout.length > 500) {
      fail("About cannot exceed 500 characters");
    }
  }

  // 12. Skills (optional)
  let cleanSkills;

  if (skills !== undefined) {
    if (
      !Array.isArray(skills) ||
      skills.length > 10 ||
      !skills.every((skill) => typeof skill === "string")
    ) {
      fail("Skills must be an array of up to 10 strings");
    }

    cleanSkills = skills.map((skill) => skill.trim());

    if (cleanSkills.some((skill) => skill.length === 0 || skill.length > 30)) {
      fail("Each skill must be 1-30 characters");
    }

    const uniqueSkills = new Set(
      cleanSkills.map((skill) => skill.toLowerCase()),
    );

    if (uniqueSkills.size !== cleanSkills.length) {
      fail("Duplicate skills are not allowed");
    }
  }

  // 13. Return only validated and cleaned data
  const userData = {
    firstName: cleanFirstName,
    emailId: cleanEmail,
    password,
  };

  if (cleanLastName !== undefined) userData.lastName = cleanLastName;
  if (age !== undefined) userData.age = age;
  if (cleanGender !== undefined) userData.gender = cleanGender;
  if (cleanPhotoUrl !== undefined) userData.photoUrl = cleanPhotoUrl;
  if (cleanAbout !== undefined) userData.about = cleanAbout;
  if (cleanSkills !== undefined) userData.skills = cleanSkills;

  return userData;
};

const validateProfileEdit = (body) => {
  const fail = (message) => {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  };
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    fail("Invalid request body");
  }

  const { firstName, lastName, age, gender, photoUrl, about, skills } = body;

  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];

  const extraFields = Object.keys(body).filter(
    (key) => !allowedFields.includes(key),
  );

  if (extraFields.length > 0) {
    fail("You cant edi these fields" + extraFields.join(","));
  }
  // 4. First name
  const cleanFirstName = firstName.trim();

  if (
    cleanFirstName.length < 2 ||
    cleanFirstName.length > 50 ||
    !/^[\p{L}\p{M} '-]+$/u.test(cleanFirstName) ||
    !/\p{L}/u.test(cleanFirstName)
  ) {
    fail("Invalid first name");
  }

  // 5. Last name (optional)
  let cleanLastName;

  if (lastName !== undefined) {
    if (typeof lastName !== "string") {
      fail("Last name must be a string");
    }

    cleanLastName = lastName.trim();

    if (
      cleanLastName.length > 50 ||
      (cleanLastName.length > 0 &&
        (!/^[\p{L}\p{M} '-]+$/u.test(cleanLastName) ||
          !/\p{L}/u.test(cleanLastName)))
    ) {
      fail("Invalid last name");
    }
  }
  // 8. Age (optional)
  if (age !== undefined && (!Number.isInteger(age) || age < 18 || age > 120)) {
    fail("Age must be an integer between 18 and 120");
  }

  // 9. Gender (optional)
  let cleanGender;

  if (gender !== undefined) {
    if (typeof gender !== "string") {
      fail("Gender must be a string");
    }

    cleanGender = gender.trim().toLowerCase();

    if (!["male", "female", "others"].includes(cleanGender)) {
      fail("Invalid gender");
    }
  }

  // 10. Photo URL (optional)
  let cleanPhotoUrl;

  if (photoUrl !== undefined) {
    if (typeof photoUrl !== "string") {
      fail("Photo URL must be a string");
    }

    cleanPhotoUrl = photoUrl.trim();

    try {
      const parsedUrl = new URL(cleanPhotoUrl);

      if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        !parsedUrl.hostname.includes(".") ||
        cleanPhotoUrl.length > 2048
      ) {
        fail("Invalid photo URL");
      }
    } catch (err) {
      if (err.statusCode) throw err;
      fail("Invalid photo URL");
    }
  }

  // 11. About (optional)
  let cleanAbout;

  if (about !== undefined) {
    if (typeof about !== "string") {
      fail("About must be a string");
    }

    cleanAbout = about.trim();

    if (cleanAbout.length > 500) {
      fail("About cannot exceed 500 characters");
    }
  }

  // 12. Skills (optional)
  let cleanSkills;

  if (skills !== undefined) {
    if (
      !Array.isArray(skills) ||
      skills.length > 10 ||
      !skills.every((skill) => typeof skill === "string")
    ) {
      fail("Skills must be an array of up to 10 strings");
    }

    cleanSkills = skills.map((skill) => skill.trim());

    if (cleanSkills.some((skill) => skill.length === 0 || skill.length > 30)) {
      fail("Each skill must be 1-30 characters");
    }

    const uniqueSkills = new Set(
      cleanSkills.map((skill) => skill.toLowerCase()),
    );

    if (uniqueSkills.size !== cleanSkills.length) {
      fail("Duplicate skills are not allowed");
    }
  }

  // 13. Return only validated and cleaned data
  const userData = {
    firstName: cleanFirstName,
  };

  if (cleanLastName !== undefined) userData.lastName = cleanLastName;
  if (age !== undefined) userData.age = age;
  if (cleanGender !== undefined) userData.gender = cleanGender;
  if (cleanPhotoUrl !== undefined) userData.photoUrl = cleanPhotoUrl;
  if (cleanAbout !== undefined) userData.about = cleanAbout;
  if (cleanSkills !== undefined) userData.skills = cleanSkills;

  return userData;
};

const validatePassword = (password) => {
  if (typeof password !== "string") {
    throw new Error("Password must be a string");
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 128) {
    throw new Error(
      "Password must be at least 8 characters and at most 128 bytes",
    );
  }

  return true;
};
module.exports = {
  validateUserData,
  validateProfileEdit,
  validatePassword,
};
