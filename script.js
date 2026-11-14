
document.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  // HELPERS

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isValidName = (name) =>
    name.trim().length >= 2;

  function feedback(element, message, type = "success") {
    if (!element) return;
    element.textContent = message;
    element.className = `form-feedback ${type}`;
  }

  function clearFeedback(element) {
    if (!element) return;
    element.textContent = "";
    element.className = "form-feedback";
  }

  function markInvalid(element, invalid) {
    if (!element) return;
    element.classList.toggle("invalid-field", invalid);
    element.setAttribute("aria-invalid", String(invalid));
  }

  document.querySelectorAll("input,textarea,select").forEach((field) => {
    field.addEventListener("input", () => markInvalid(field, false));
    field.addEventListener("change", () => markInvalid(field, false));
  });

  // FOOTER YEAR

  if ($("year")) {
    $("year").textContent = new Date().getFullYear();
  }

  // MOBILE NAVIGATION

  const menuToggle = $("menuToggle");
  const navLinks = $("navLinks");

  function closeMenu() {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  // MODALS

  const authModal = $("authModal");
  const checkoutModal = $("checkoutModal");

  function openModal(modal) {
    if (!modal) return;

    closeMenu();

    [authModal,checkoutModal].forEach((other) => {
      if (other && other !== modal) {
        other.classList.remove("open");
        other.setAttribute("aria-hidden", "true");
      }
    });

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const input = modal.querySelector("input");
    if (input) setTimeout(() => input.focus(), 50);
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");

    if (!document.querySelector(".modal.open")) {
      document.body.style.overflow = "";
    }
  }

  document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", () => {
      closeModal(element.closest(".modal"));
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      [authModal,checkoutModal].forEach((modal) => {
        if (modal && modal.classList.contains("open")) {
          closeModal(modal);
        }
      });
      closeMenu();
    }
  });

  // SIGNUP AND LOGIN TABS

  const signupForm = $("signupForm");
  const loginForm = $("loginForm");
  const signupFeedback = $("signupFeedback");
  const loginFeedback = $("loginFeedback");

  function switchAuthTab(tab) {
    const signup = tab === "signup";

    signupForm.classList.toggle("hidden", !signup);
    loginForm.classList.toggle("hidden", signup);

    signupForm.reset();
    loginForm.reset();

    clearFeedback(signupFeedback);
    clearFeedback(loginFeedback);

    $("authTitle").textContent = signup
      ? "Welcome to FlowPilot"
      : "Welcome back";

    document.querySelectorAll("[data-auth-tab]").forEach((button) => {
      const active = button.dataset.authTab === tab;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
  }

  document.querySelectorAll("[data-open-auth]").forEach((button) => {
    button.addEventListener("click", () => {
      switchAuthTab(button.dataset.openAuth);
      openModal(authModal);
    });
  });

  document.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      switchAuthTab(button.dataset.authTab);
    });
  });

  // SIGNUP FORM

  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("signupName");
    const email = $("signupEmail");
    const password = $("signupPassword");
    const confirm = $("signupConfirm");

    const validName = isValidName(name.value);
    const validEmail = isValidEmail(email.value);
    const validPassword = password.value.length >= 8;
    const matchingPasswords = password.value === confirm.value;

    markInvalid(name, !validName);
    markInvalid(email, !validEmail);
    markInvalid(password, !validPassword);
    markInvalid(confirm, !matchingPasswords);

    if (!validName) {
      feedback(signupFeedback, "Please enter your full name.", "error");
      name.focus();
      return;
    }

    if (!validEmail) {
      feedback(signupFeedback, "Please enter a valid email address.", "error");
      email.focus();
      return;
    }

    if (!validPassword) {
      feedback(signupFeedback, "Password must contain at least 8 characters.", "error");
      password.focus();
      return;
    }

    if (!matchingPasswords) {
      feedback(signupFeedback, "Your passwords do not match.", "error");
      confirm.focus();
      return;
    }

    feedback(
      signupFeedback,
      `Welcome to FlowPilot, ${name.value.trim()}! This demo does not create a real account.`,
      "success"
    );

    signupForm.reset();
  });

  // LOGIN FORM

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = $("loginEmail");
    const password = $("loginPassword");

    const validEmail = isValidEmail(email.value);
    const validPassword = password.value.length >= 8;

    markInvalid(email, !validEmail);
    markInvalid(password, !validPassword);

    if (!validEmail) {
      feedback(loginFeedback, "Please enter a valid email address.", "error");
      email.focus();
      return;
    }

    if (!validPassword) {
      feedback(loginFeedback, "Enter a password with at least 8 characters.", "error");
      password.focus();
      return;
    }

    feedback(
      loginFeedback,
      "Demo login validated. Real authentication is not connected.",
      "success"
    );

    loginForm.reset();
  });

  // PRICING AND CHECKOUT

  const checkoutForm = $("checkoutForm");
  const paymentSuccess = $("paymentSuccess");
  const receiptDetails = $("receiptDetails");

  let selectedPlan = "";
  let selectedPrice = "";

  document.querySelectorAll(".pricing-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedPlan = button.dataset.plan;
      selectedPrice = button.dataset.price;

      if (selectedPlan === "Starter") {
        switchAuthTab("signup");
        openModal(authModal);
        return;
      }

      $("checkoutPlan").textContent = selectedPlan;
      $("checkoutPrice").textContent =
        `$${Number(selectedPrice).toFixed(2)} / person / month`;

      checkoutForm.reset();
      clearFeedback(paymentSuccess);
      receiptDetails.textContent = "";

      openModal(checkoutModal);
    });
  });

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("checkoutName");
    const email = $("checkoutEmail");
    const method = $("paymentMethod");

    const validName = isValidName(name.value);
    const validEmail = isValidEmail(email.value);
    const validMethod = method.value !== "";

    markInvalid(name, !validName);
    markInvalid(email, !validEmail);
    markInvalid(method, !validMethod);

    if (!validName) {
      feedback(paymentSuccess, "Please enter your name.", "error");
      name.focus();
      return;
    }

    if (!validEmail) {
      feedback(paymentSuccess, "Please enter a valid email.", "error");
      email.focus();
      return;
    }

    if (!validMethod) {
      feedback(paymentSuccess, "Please choose a payment method.", "error");
      method.focus();
      return;
    }

    const reference =
      "FP-" + Math.random().toString(36).slice(2,10).toUpperCase();

    feedback(
      paymentSuccess,
      "Your demo plan selection was successful. No payment was made.",
      "success"
    );

    receiptDetails.textContent =
      `Reference: ${reference} | Plan: ${selectedPlan} | Name: ${name.value.trim()}`;

    checkoutForm.reset();
  });

  // CONTACT FORM

  const contactForm = $("contactForm");
  const contactFeedback = $("contactFeedback");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = $("contactName");
    const email = $("contactEmail");
    const message = $("contactMessage");

    const validName = isValidName(name.value);
    const validEmail = isValidEmail(email.value);
    const validMessage = message.value.trim().length >= 10;

    markInvalid(name, !validName);
    markInvalid(email, !validEmail);
    markInvalid(message, !validMessage);

    if (!validName) {
      feedback(contactFeedback, "Please enter your name.", "error");
      name.focus();
      return;
    }

    if (!validEmail) {
      feedback(contactFeedback, "Please enter a valid email address.", "error");
      email.focus();
      return;
    }

    if (!validMessage) {
      feedback(contactFeedback, "Please enter at least 10 characters in your message.", "error");
      message.focus();
      return;
    }

    feedback(
      contactFeedback,
      `Thank you, ${name.value.trim()}! Your demo message has been validated.`,
      "success"
    );

    contactForm.reset();
  });

  // CTA EMAIL FORM

  const ctaForm = $("ctaForm");
  const ctaFeedback = $("ctaFeedback");

  ctaForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = $("ctaEmail");
    const validEmail = isValidEmail(email.value);

    markInvalid(email, !validEmail);

    if (!validEmail) {
      feedback(ctaFeedback, "Please enter a valid email address.", "error");
      email.focus();
      return;
    }

    feedback(
      ctaFeedback,
      "Thanks! Your email has been validated in this demo.",
      "success"
    );

    ctaForm.reset();
  });

  // SCROLL REVEAL

  const revealItems = document.querySelectorAll(
    ".section-heading,.feature-card,.detail-card,.how-step,.pricing-card,.contact-info,.contact-form"
  );

  revealItems.forEach((item) => item.classList.add("reveal"));

  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const observer = new IntersectionObserver((entries,currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("visible"));
  }

});
