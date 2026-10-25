const signupForm = document.getElementById("signupForm");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const age = document.getElementById("age");
const gender = document.getElementById("gender");
const emailId = document.getElementById("emailId");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const skills = document.getElementById("skills");
const about = document.getElementById("about");
const photoUrl = document.getElementById("photoUrl");

const signupMessage = document.getElementById("signupMessage");
const signupButton = document.getElementById("signupButton");

signupForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  // 1. Get form values
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();
  const emailValue = emailId.value.trim();
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;

  // 2. Validate required fields
  if (
    firstNameValue === "" ||
    emailValue === "" ||
    passwordValue === "" ||
    confirmPasswordValue === ""
  ) {
    signupMessage.textContent = "Please fill in all required fields.";
    return;
  }

  // 3. Validate first name
  if (firstNameValue.length < 2 || firstNameValue.length > 50) {
    signupMessage.textContent = "First name must contain 2 to 50 characters.";
    return;
  }

  // 4. Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(emailValue)) {
    signupMessage.textContent = "Please enter a valid email address.";
    return;
  }

  // 5. Validate password length
  if (passwordValue.length < 8) {
    signupMessage.textContent = "Password must contain at least 8 characters.";
    return;
  }

  // 6. Confirm password
  if (passwordValue !== confirmPasswordValue) {
    signupMessage.textContent = "Passwords do not match.";
    return;
  }

  // 7. Prepare signup data
  const signupData = {
    firstName: firstNameValue,
    emailId: emailValue,
    password: passwordValue,
  };

  // Add optional fields only when provided
  if (lastNameValue !== "") {
    signupData.lastName = lastNameValue;
  }

  if (age.value !== "") {
    const ageValue = Number(age.value);

    if (!Number.isInteger(ageValue) || ageValue < 18 || ageValue > 120) {
      signupMessage.textContent = "Age must be an integer between 18 and 120.";
      return;
    }

    signupData.age = ageValue;
  }

  if (gender.value !== "") {
    signupData.gender = gender.value;
  }

  if (about.value.trim() !== "") {
    signupData.about = about.value.trim();
  }

  if (photoUrl.value.trim() !== "") {
    signupData.photoUrl = photoUrl.value.trim();
  }

  // Convert comma-separated skills into an array
  if (skills.value.trim() !== "") {
    signupData.skills = skills.value
      .split(",")
      .map(function (skill) {
        return skill.trim();
      })
      .filter(function (skill) {
        return skill !== "";
      });
  }

  // 8. Send signup request to backend
  signupMessage.textContent = "";
  signupButton.disabled = true;
  signupButton.textContent = "Creating account...";

  try {
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData),
    });

    // Backend responds with plain text
    const data = await response.text();

    if (!response.ok) {
      signupMessage.textContent = data;
      return;
    }

    if (response.status === 201) {
      signupMessage.textContent =
        "Account created successfully! Redirecting to login...";

      signupForm.reset();

      setTimeout(function () {
        window.location.href = "/login.html";
      }, 1500);
    } else {
      signupMessage.textContent = data;
    }
  } catch (error) {
    console.error("Signup error:", error);

    signupMessage.textContent = "Something went wrong. Please try again.";
  } finally {
    signupButton.disabled = false;
    signupButton.textContent = "Create account";
  }
});
