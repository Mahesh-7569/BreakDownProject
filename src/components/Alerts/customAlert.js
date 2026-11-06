let alertElement = null;
let alertTimer = null;

const customAlert = (message, status = "ok", duration = 5000) => {
  // Remove existing alert
  if (alertElement) {
    alertElement.remove();
    alertElement = null;
  }

  // Clear existing timer
  if (alertTimer) {
    clearTimeout(alertTimer);
    alertTimer = null;
  }

  const overlay = document.createElement("div");

  overlay.className =
    "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-[2px]";

  const popup = document.createElement("div");

  popup.className =
    "w-full max-w-md overflow-hidden rounded-3xl bg-white text-center shadow-2xl ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700";

  const statusLine = document.createElement("div");

  statusLine.className =
    status === "ok" ? "h-2 w-full bg-emerald-400" : "h-2 w-full bg-rose-500";

  statusLine.style.transformOrigin = "left";
  statusLine.style.transition = `transform ${duration}ms linear`;

  // Start at 100%
  statusLine.style.transform = "scaleX(1)";

  const content = document.createElement("div");

  content.className = "px-7 py-7";

  const text = document.createElement("p");

  text.className =
    "text-[15px] font-semibold leading-6 text-slate-700 dark:text-slate-200";

  text.textContent = message;

  content.appendChild(text);

  popup.appendChild(statusLine);
  popup.appendChild(content);

  overlay.appendChild(popup);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeCustomAlert();
    }
  });

  document.body.appendChild(overlay);

  alertElement = overlay;

  // Start progress animation
  requestAnimationFrame(() => {
    statusLine.style.transform = "scaleX(0)";
  });

  alertTimer = setTimeout(() => {
    closeCustomAlert();
  }, duration);
};

const closeCustomAlert = () => {
  if (alertElement) {
    alertElement.remove();
    alertElement = null;
  }

  if (alertTimer) {
    clearTimeout(alertTimer);
    alertTimer = null;
  }
};

export default customAlert;