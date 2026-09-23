const modal = document.getElementById("loginModal");

function openLogin() {
  modal.style.display = "grid";
}

function closeLogin() {
  modal.style.display = "none";
}

window.addEventListener("click", function(event) {
  if (event.target === modal) {
    closeLogin();
  }
});

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("loginMessage");

  if (!email || !password) {
    message.textContent = "Please enter email and password.";
    return;
  }

  message.textContent = "Demo login successful! 🎮";

  setTimeout(() => {
    closeLogin();
  }, 1200);
}

function googleLogin() {
  document.getElementById("loginMessage").textContent =
    "Google Login will be connected with Firebase.";
}

function playGame(gameName) {
  alert("🎮 Launching " + gameName + "...");
}

document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", () => {
    window.scrollTo({
      top: window.scrollY,
      behavior: "smooth"
    });
  });
});