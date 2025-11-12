document.addEventListener("DOMContentLoaded", function () {
  const bannedWords = ["fuck", "shit", "cunt", "ass", "tits"];

  function getPersonalisationInputs() {
    return document.querySelectorAll('input[name^="properties["][type="text"]');
  }
  function getSubmitButton() {
    return document.querySelector(
      'form[action="/cart/add"] button[type="submit"], ' +
        'form[action="/cart/add"] button[type="button"].product-form__submit'
    );
  }

  function validateInput(input) {
    const value = input.value.toLowerCase();
    const hasProfanity = bannedWords.some((w) => value.includes(w));
    const errorBox = input
      .closest(".tpo_option-input-wrapper")
      ?.parentElement.querySelector(".tpo_error-message");
    input.classList.add("input-error");
    if (errorBox) errorBox.textContent = "Please remove inappropriate words.";
    if (hasProfanity) return false;

    input.classList.remove("input-error");
    if (
      errorBox &&
      errorBox.textContent === "Please remove inappropriate words."
    ) {
      errorBox.textContent = "";
    }
    return true;
  }

  function validateAllInputs() {
    const inputs = getPersonalisationInputs();
    let allValid = true;
    inputs.forEach((input) => {
      if (!validateInput(input)) allValid = false;
    });

    const submitButton = getSubmitButton();
    if (submitButton) {
      submitButton.disabled = !allValid;
      submitButton.classList.toggle("disabled", !allValid);
    }
    return allValid;
  }

  function bindValidationEvents() {
    const inputs = getPersonalisationInputs();
    inputs.forEach((input) => {
      input.addEventListener("input", validateAllInputs);
      input.addEventListener("blur", validateAllInputs);
    });
    const submitButton = getSubmitButton();
    if (submitButton) {
      submitButton.addEventListener("click", (e) => {
        if (!validateAllInputs()) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      });
    }
    validateAllInputs();
  }

  let tries = 0;
  const retry = setInterval(() => {
    const readyInputs = getPersonalisationInputs().length > 0;
    const readyBtn = !!getSubmitButton();
    if (readyInputs && readyBtn) {
      clearInterval(retry);
      bindValidationEvents();
    }
    if (++tries > 30) clearInterval(retry);
  }, 300);
});

jQuery(document).ready(function ($) {
  var RE_EMOJI =
    /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
  var $doc = $(document);
  var $error = $(".error-has-emoji");
  var cmdDown = false;

  $doc.on("keydown", function (e) {
    if (e.which === 91 || e.which === 92) cmdDown = true;
  });
  $doc.on("keyup", function (e) {
    if (e.which === 91 || e.which === 92) cmdDown = false;
  });

  $doc.on("keydown", ".prevent-emoji", function (e) {
    if (e.which === 32 && e.ctrlKey && cmdDown) {
      e.preventDefault();
      $error.text("You cannot use the emoji keyboard here!");
    }
  });

  function stripEmoji($el) {
    var content = $el.val();
    if (RE_EMOJI.test(content)) {
      $el.val(content.replace(RE_EMOJI, ""));
      $error.text("Emoji characters are not supported!");
      return true;
    }
    $error.text("");
    return false;
  }
  $doc.on("keyup change", ".prevent-emoji", function () {
    stripEmoji($(this));
  });
});

const SECTION_KEYS = {
  items: ".cart-items",
  footer: "main-cart-footer",
  sticky: "sticky_cart",
};

function getItemsWrapper() {
  return document.querySelector("#shopify-section-main-cart-items");
}
function getFooterWrapper() {
  return document.querySelector("#shopify-section-main-cart-footer");
}
function getStickyWrapper() {
  return (
    document.getElementById("mobile-sticky") ||
    document.querySelector('[id^="shopify-section-"][id$="sticky_cart"]') ||
    document.querySelector('[id^="shopify-section-"][id*="__sticky_cart"]')
  );
}

async function getCartJSON() {
  const r = await fetch(`/cart.js?cb=${Date.now()}`, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Cart fetch failed");
  return r.json();
}

function formatRand(cents) {
  const rands = Math.round((cents || 0) / 100);
  return "R " + rands.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function refreshCartSections() {
  const parseHTML = (html) =>
    new DOMParser().parseFromString(html, "text/html");
  const url = `/?sections=${SECTION_KEYS.items},${SECTION_KEYS.footer},${
    SECTION_KEYS.sticky
  }&cb=${Date.now()}`;
  let sections;

  try {
    const res = await fetch(url, {
      credentials: "same-origin",
      cache: "no-store",
    });
    sections = await res.json();
  } catch {
    sections = {};
    sections[SECTION_KEYS.items] = await fetch(
      `/?section_id=${SECTION_KEYS.items}`,
      { credentials: "same-origin", cache: "no-store" }
    ).then((r) => r.text());
    sections[SECTION_KEYS.footer] = await fetch(
      `/?section_id=${SECTION_KEYS.footer}`,
      { credentials: "same-origin", cache: "no-store" }
    ).then((r) => r.text());
    sections[SECTION_KEYS.sticky] = await fetch(
      `/?section_id=${SECTION_KEYS.sticky}`,
      { credentials: "same-origin", cache: "no-store" }
    ).then((r) => r.text());
  }

  if (sections[SECTION_KEYS.items]) {
    const doc = parseHTML(sections[SECTION_KEYS.items]);
    const newCic = doc.querySelector(".cic");
    const curCic =
      document.querySelector("#shopify-section-main-cart-items .cic") ||
      document.querySelector(".cic");
    if (newCic && curCic) curCic.replaceWith(newCic);
    document.dispatchEvent(
      new CustomEvent("shopify:section:load", {
        detail: { sectionId: SECTION_KEYS.items },
      })
    );
  }

  if (sections[SECTION_KEYS.footer]) {
    const doc = parseHTML(sections[SECTION_KEYS.footer]);
    const newFooter = doc.querySelector("#main-cart-footer");
    const curFooter =
      document.querySelector(
        "#shopify-section-main-cart-footer #main-cart-footer"
      ) || document.querySelector("#main-cart-footer");
    if (newFooter && curFooter) curFooter.replaceWith(newFooter);
    document.dispatchEvent(
      new CustomEvent("shopify:section:load", {
        detail: { sectionId: SECTION_KEYS.footer },
      })
    );
  }

  if (sections[SECTION_KEYS.sticky]) {
    const stickyDoc = parseHTML(sections[SECTION_KEYS.sticky]);
    const returnedSticky =
      stickyDoc.getElementById("mobile-sticky") ||
      stickyDoc.querySelector("#shopify-section-sticky_cart") ||
      stickyDoc.body.firstElementChild;

    const liveSticky = getStickyWrapper();
    if (liveSticky) {
      if (returnedSticky) {
        liveSticky.replaceWith(returnedSticky);
      } else {
        liveSticky.innerHTML = sections[SECTION_KEYS.sticky];
      }
      rebindStickyHandlers(getStickyWrapper());
      document.dispatchEvent(
        new CustomEvent("shopify:section:load", {
          detail: { sectionId: SECTION_KEYS.sticky },
        })
      );
    }
  }
}

function rebindStickyHandlers(root) {
  if (!root) return;
  root.querySelectorAll(".accordion-title").forEach((title) => {
    title.addEventListener("click", function () {
      const parent = this.parentElement;
      const isActive = parent.classList.contains("active");
      root.querySelectorAll(".accordion-item").forEach((acc) => {
        acc.classList.remove("active");
        const icon = acc.querySelector(".accordion-title span");
        if (icon) icon.textContent = "+";
      });
      if (!isActive) {
        parent.classList.add("active");
        const icon = this.querySelector("span");
        if (icon) icon.textContent = "-";
      }
    });
  });
}

function updateCountBubbles(cart) {
  const count = cart.item_count || 0;

  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
  });

  document.querySelectorAll(".cart-count-bubble").forEach((bubble) => {
    const target = bubble.querySelector("[aria-hidden]") || bubble;
    target.textContent = count;
    bubble.classList.toggle("hidden", count === 0);
  });
}
function updateTotalsFallback(cart) {
  //const txt = formatRand(cart.total_price || 0);
  //document
  //  .querySelectorAll(
  //    "#main-cart-footer .totals__total-value, .cfc .totals__total-value"
  //  )
  //  .forEach((el) => {
  //    el.textContent = txt;
  //  });
  //const sticky = getStickyWrapper()?.querySelector(".totals__total-value");
  //if (sticky) sticky.textContent = txt;
}

let _cartRefreshTimer = null;
function queueCartRefresh(delay = 60) {
  clearTimeout(_cartRefreshTimer);
  _cartRefreshTimer = setTimeout(async () => {
    try {
      await refreshCartSections();
      const cart = await getCartJSON();
      updateCountBubbles(cart);
      updateTotalsFallback(cart);
      document.dispatchEvent(
        new CustomEvent("cart:updated", { detail: { cart } })
      );
      await refreshUpsell();
    } catch (e) {
      console.error("Cart refresh failed", e);
    }
  }, delay);
}

document.addEventListener("DOMContentLoaded", () => queueCartRefresh(0));
document.addEventListener("submit", (e) => {
  if (e.target.matches('form[action^="/cart/add"]')) queueCartRefresh(60);
});
document.addEventListener("change", (e) => {
  if (e.target.matches('input.quantity__input[name="updates[]"]'))
    queueCartRefresh(20);
});
document.addEventListener("click", (e) => {
  if (e.target.closest(".quantity__button")) queueCartRefresh(20);
});
document.addEventListener("click", (e) => {
  // Only trigger cart refresh for cart-specific buttons
  const cartButton = e.target.closest(
    "button[name='add'], button[type='submit'][form*='cart'], .cart-button, [data-cart-button]"
  );
  if (cartButton) queueCartRefresh(20);
});

document.addEventListener("click", async function onRemove(e) {
  const removeAnchor = e.target.closest(
    'a.items_remove, a.cart-remove-button, a.cart-remove, [data-cart-remove], [name="remove"]'
  );
  if (!removeAnchor) return;

  const host = removeAnchor.closest("cart-remove-button");
  if (host) {
    setTimeout(() => queueCartRefresh(60), 50);
    return;
  }

  let href =
    removeAnchor.getAttribute("href") || removeAnchor.dataset.action || "";
  let key = null;

  try {
    const u = new URL(href, location.origin);
    const idParam = u.searchParams.get("id");
    if (idParam) {
      if (idParam.includes(":")) key = idParam.split(":")[1];
      else if (/^[0-9a-f]{32}$/i.test(idParam)) key = idParam;
    }
  } catch {}

  let line = null;
  const wrapper = removeAnchor.closest(
    'cart-remove-button,[data-index],[id^="CartItem-"]'
  );
  if (wrapper?.dataset?.index) line = parseInt(wrapper.dataset.index, 10);
  if (!line) {
    const qtyInput = (wrapper || document).querySelector(
      'input.quantity__input[id^="Quantity-"]'
    );
    const m = qtyInput?.id?.match(/Quantity-(\\d+)/);
    if (m) line = parseInt(m[1], 10);
  }

  try {
    if (key) {
      await fetch("/cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id: key, quantity: 0 }),
      });
    } else if (line) {
      await fetch("/cart/change.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ line, quantity: 0 }),
      });
    } else if (href) {
      await fetch(href, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
    }
  } catch (err) {
    console.error("Remove failed", err);
  } finally {
    queueCartRefresh(60);
  }
});

async function refreshUpsell() {
  const root = document.querySelector(
    "product-recommendations[data-cart-product-ids]"
  );
  if (!root) return;

  const spinner = document.getElementById("upsell-spinner");
  const sectionId = "cart-upsell-custom";
  const limit = 25;

  spinner?.classList.add("active");

  try {
    const cart = await getCartJSON();
    const cartProductIds = cart.items.map((i) => i.product_id).filter(Boolean);

    if (cartProductIds.length === 0) {
      root.style.display = "none";
      return;
    }

    const seen = new Set();
    let newSlider = null;

    for (const pid of cartProductIds) {
      const url = `/recommendations/products?section_id=${sectionId}&product_id=${pid}&limit=${limit}&intent=complementary`;
      const html = await fetch(url, {
        credentials: "same-origin",
        cache: "no-store",
      }).then((r) => r.text());
      const doc = new DOMParser().parseFromString(html, "text/html");
      const fetched = doc.querySelector("slider-component");
      if (!fetched) continue;

      fetched.querySelectorAll("li[data-product-id]").forEach((li) => {
        const recPid = parseInt(li.dataset.productId || "0", 10);
        if (cartProductIds.includes(recPid) || seen.has(recPid)) {
          li.remove();
        } else {
          seen.add(recPid);
        }
      });

      if (!newSlider) {
        newSlider = fetched;
      } else {
        const ul = newSlider.querySelector("ul");
        fetched
          .querySelectorAll("li[data-product-id]")
          .forEach((li) => ul.appendChild(li));
      }
    }

    if (newSlider) {
      const old = root.querySelector("slider-component");
      if (old) old.replaceWith(newSlider);
      else root.appendChild(newSlider);
      root.style.display = newSlider.querySelectorAll("li[data-product-id]")
        .length
        ? ""
        : "none";
      document.dispatchEvent(
        new CustomEvent("shopify:section:load", { detail: { sectionId } })
      );
    } else {
      root.style.display = "none";
    }
  } catch (e) {
    console.error("Upsell refresh failed", e);
  } finally {
    spinner?.classList.remove("active");
  }
}

window.updateCartCount = async function () {
  try {
    updateCountBubbles(await getCartJSON());
    queueCartRefresh(0);
  } catch (e) {
    console.error("Cart count update failed", e);
  }
};

// let clickTimeout = null;
// document.addEventListener("click", function () {
//   if (clickTimeout) {
//     clearTimeout(clickTimeout);
//   }
//   clickTimeout = setTimeout(function () {
//     queueCartRefresh(0);
//   }, 500);
// });
