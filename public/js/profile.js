const profileMessage = document.getElementById("profileMessage");
const profileContainer = document.getElementById("profileContainer");

const profilePhoto = document.getElementById("profilePhoto");
const profileName = document.getElementById("profileName");
const profileAge = document.getElementById("profileAge");
const profileEmail = document.getElementById("profileEmail");
const profileGender = document.getElementById("profileGender");
const profileAbout = document.getElementById("profileAbout");
const profileSkills = document.getElementById("profileSkills");

const editProfileButton = document.getElementById("editProfileButton");
const editProfileSection = document.getElementById("editProfileSection");
const editProfileForm = document.getElementById("editProfileForm");
const editProfileMessage = document.getElementById("editProfileMessage");
const saveProfileButton = document.getElementById("saveProfileButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const editFirstName = document.getElementById("editFirstName");
const editLastName = document.getElementById("editLastName");
const editAge = document.getElementById("editAge");
const editGender = document.getElementById("editGender");
const editPhotoUrl = document.getElementById("editPhotoUrl");
const editAbout = document.getElementById("editAbout");
const editSkills = document.getElementById("editSkills");

const changePasswordButton = document.getElementById("changePasswordButton");
const changePasswordSection = document.getElementById("changePasswordSection");
const changePasswordForm = document.getElementById("changePasswordForm");
const changePasswordMessage = document.getElementById("changePasswordMessage");
const savePasswordButton = document.getElementById("savePasswordButton");
const cancelPasswordButton = document.getElementById("cancelPasswordButton");

const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const reEnterNewPasswordInput = document.getElementById("reEnterNewPassword");

let currentProfile = null;

// Display messages safely
function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "#ef4444" : "#22c55e";
}

// Parse API responses that may contain JSON or plain text
async function readResponse(response) {
  const text = await response.text();

  let data = text;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // Keep the response as plain text.
  }

  if (!response.ok) {
    const message =
      typeof data === "string" ? data : data.message || "Something went wrong.";

    throw new Error(message);
  }

  return data;
}

// Load and display the user's profile
function displayProfile(user) {
  currentProfile = user;

  profileContainer.hidden = false;

  profileName.textContent =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

  profileAge.textContent = user.age ?? "Not provided";
  profileEmail.textContent = user.email || user.emailId || "Not provided";
  profileGender.textContent = user.gender || "Not provided";
  profileAbout.textContent = user.about || "No description added yet.";

  profilePhoto.src = user.photoUrl || "/images/default-avatar.png";
  profilePhoto.alt = "Profile photo";

  profilePhoto.onerror = () => {
    profilePhoto.onerror = null;
    profilePhoto.src = "/images/default-avatar.png";
  };

  profileSkills.replaceChildren();

  if (Array.isArray(user.skills) && user.skills.length > 0) {
    user.skills.forEach((skill) => {
      const skillElement = document.createElement("span");

      skillElement.className = "skill-tag";
      skillElement.textContent = skill;

      profileSkills.appendChild(skillElement);
    });
  } else {
    profileSkills.textContent = "No skills added yet.";
  }
}

function fetchProfile() {
  profileMessage.textContent = "Loading profile...";

  fetch("/profile")
    .then(readResponse)
    .then((responseData) => {
      const user = responseData.data || responseData.user || responseData;

      if (!user || !user.firstName) {
        throw new Error("Unable to load profile data.");
      }

      displayProfile(user);
      profileMessage.textContent = "";
    })
    .catch((error) => {
      showMessage(profileMessage, error.message, true);
    });
}

// Open the edit profile form
editProfileButton.addEventListener("click", () => {
  if (!currentProfile) return;

  editFirstName.value = currentProfile.firstName || "";
  editLastName.value = currentProfile.lastName || "";
  editAge.value = currentProfile.age ?? "";
  editGender.value = currentProfile.gender || "";
  editPhotoUrl.value = currentProfile.photoUrl || "";
  editAbout.value = currentProfile.about || "";
  editSkills.value = Array.isArray(currentProfile.skills)
    ? currentProfile.skills.join(", ")
    : "";

  editProfileMessage.textContent = "";

  changePasswordSection.hidden = true;
  editProfileSection.hidden = false;
});

// Cancel profile editing
cancelEditButton.addEventListener("click", () => {
  editProfileSection.hidden = true;
  editProfileMessage.textContent = "";
});

// Save profile changes
editProfileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const firstName = editFirstName.value.trim();
  const lastName = editLastName.value.trim();
  const about = editAbout.value.trim();

  const skills = editSkills.value
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);

  if (skills.length > 10) {
    showMessage(
      editProfileMessage,
      "You can add a maximum of 10 skills.",
      true,
    );
    return;
  }

  if (skills.some((skill) => skill.length > 30)) {
    showMessage(
      editProfileMessage,
      "Each skill must be 30 characters or fewer.",
      true,
    );
    return;
  }

  const normalizedSkills = skills.map((skill) => skill.toLowerCase());

  if (new Set(normalizedSkills).size !== normalizedSkills.length) {
    showMessage(editProfileMessage, "Please remove duplicate skills.", true);
    return;
  }

  const updatedData = {
    firstName,
    lastName,
    about,
    skills,
  };

  // Include optional fields only when provided.
  // Blank optional fields are omitted, so they won't clear existing DB values.
  if (editAge.value.trim() !== "") {
    const age = Number(editAge.value);

    if (!Number.isInteger(age) || age < 18 || age > 120) {
      showMessage(editProfileMessage, "Age must be between 18 and 120.", true);
      return;
    }

    updatedData.age = age;
  }

  if (editGender.value.trim() !== "") {
    updatedData.gender = editGender.value;
  }

  if (editPhotoUrl.value.trim() !== "") {
    updatedData.photoUrl = editPhotoUrl.value.trim();
  }

  if (!firstName) {
    showMessage(editProfileMessage, "First name is required.", true);
    return;
  }

  saveProfileButton.disabled = true;
  saveProfileButton.textContent = "Saving...";

  fetch("/profile/edit", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  })
    .then(readResponse)
    .then((responseData) => {
      const updatedUser = responseData.data || responseData.user;

      if (!updatedUser || !updatedUser.firstName) {
        throw new Error(
          "Profile updated, but the returned user data was unexpected. Reload your profile.",
        );
      }

      displayProfile(updatedUser);

      editProfileSection.hidden = true;

      showMessage(
        profileMessage,
        responseData.message || "Profile updated successfully.",
      );
    })
    .catch((error) => {
      showMessage(editProfileMessage, error.message, true);
    })
    .finally(() => {
      saveProfileButton.disabled = false;
      saveProfileButton.textContent = "Save Changes";
    });
});

// Open the change password form
changePasswordButton.addEventListener("click", () => {
  editProfileSection.hidden = true;
  changePasswordSection.hidden = false;
  changePasswordMessage.textContent = "";
});

// Cancel password change
cancelPasswordButton.addEventListener("click", () => {
  changePasswordSection.hidden = true;
  changePasswordForm.reset();
  changePasswordMessage.textContent = "";
});

// Change password
changePasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const re_enternewPassword = reEnterNewPasswordInput.value;

  if (newPassword.length < 8 || newPassword.length > 128) {
    showMessage(
      changePasswordMessage,
      "New password must be between 8 and 128 characters.",
      true,
    );
    return;
  }

  if (newPassword !== re_enternewPassword) {
    showMessage(changePasswordMessage, "The new passwords do not match.", true);
    return;
  }

  if (currentPassword === newPassword) {
    showMessage(
      changePasswordMessage,
      "Your new password must differ from your current password.",
      true,
    );
    return;
  }

  savePasswordButton.disabled = true;
  savePasswordButton.textContent = "Updating...";

  fetch("/profile/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      re_enternewPassword,
    }),
  })
    .then(readResponse)
    .then((responseData) => {
      const message =
        typeof responseData === "string"
          ? responseData
          : responseData.message || "Password changed successfully.";

      showMessage(changePasswordMessage, message);
      changePasswordForm.reset();
    })
    .catch((error) => {
      showMessage(changePasswordMessage, error.message, true);
    })
    .finally(() => {
      savePasswordButton.disabled = false;
      savePasswordButton.textContent = "Update Password";
    });
});

// Logout
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logoutButton.disabled = true;

    fetch("/logout", {
      method: "POST",
    })
      .then(readResponse)
      .then(() => {
        window.location.href = "/login.html";
      })
      .catch((error) => {
        logoutButton.disabled = false;
        showMessage(profileMessage, error.message, true);
      });
  });
}

// Load the profile when the page opens
fetchProfile();
