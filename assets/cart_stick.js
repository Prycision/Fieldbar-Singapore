document.addEventListener("DOMContentLoaded", function () {
  const stickyElement = document.getElementById("mobile-sticky");
  const mainContainer = document.getElementById("ct1");

  if (!stickyElement || !mainContainer) return;

  function updateStickyPosition() {
    const viewportHeight = window.innerHeight;
    const containerRect = mainContainer.getBoundingClientRect();
    const containerBottom = containerRect.bottom;

    if (containerBottom <= viewportHeight) {
      stickyElement.classList.remove("sticky-bottom");
      stickyElement.classList.add("sticky-top");
    } else {
      stickyElement.classList.remove("sticky-top");
      stickyElement.classList.add("sticky-bottom");
    }
  }

  updateStickyPosition();

  window.addEventListener("scroll", updateStickyPosition);
  window.addEventListener("resize", updateStickyPosition);
});
