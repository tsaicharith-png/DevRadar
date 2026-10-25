const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const emailValue = email.value.trim();
  const passwordValue = password.value;

  // Check for empty fields
  if (emailValue === "" || passwordValue === "") {
    loginMessage.textContent = "Please enter both email and password.";
    return;
  }

  // Validate email format
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(emailValue)) {
    loginMessage.textContent = "Please enter a valid email address.";
    return;
  }

  // Clear previous error
  loginMessage.textContent = "";

  // Next step: Send login request to the backend
  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailValue,
        password: passwordValue,
      }),
    });
    const data = await response.text();
    if (!response.ok) {
      loginMessage.textContent = data;
      return;
    }
    if (data.trim() === "Loggedin successfully") {
      window.location.href = "./index.html";
    } else {
      loginMessage.textContent = data;
    }
    console.log(data);
  } catch (error) {
    console.error("Login error:", error);
    loginMessage.textContent = "Something went wrong. Please try again.";
  } finally {
    loginButton.disabled = false;
    loginButton.innerHTML = 'Sign in <span aria-hidden="true">→</span>';
  }
});
