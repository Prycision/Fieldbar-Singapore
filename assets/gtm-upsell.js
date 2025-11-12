(function () {
  var root = document.querySelector(
    'product-recommendations[data-section-id="{{ section.id }}"]'
  );
  if (!root) return;

  window.dataLayer = window.dataLayer || [];

  function toItem(li) {
    if (!li) return null;
    var price = parseFloat(li.getAttribute("data-product-price"));
    return {
      item_id: li.getAttribute("data-product-id"),
      item_name: li.getAttribute("data-product-title"),
      item_brand: li.getAttribute("data-product-vendor"),
      item_variant: li.getAttribute("data-variant-id"),
      price: isNaN(price) ? undefined : price,
      currency: "{{ shop.currency }}",
      item_list_id: "{{ section.id }}",
      item_list_name: "{{ section.settings.title | escape }}",
    };
  }

  function pushGTMAdd(item, qty) {
    var quantity = qty || 1;
    window.dataLayer.push({
      event: "upsell_grid_item_add_to_cart",
      section_id: "{{ section.id }}",
      section_title: "{{ section.settings.title | escape }}",
      quantity: quantity,
      item: item,
    });

    window.dataLayer.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "{{ shop.currency }}",
        value: item.price ? item.price * quantity : undefined,
        items: [
          {
            item_id: item.item_id,
            item_name: item.item_name,
            item_brand: item.item_brand,
            item_variant: item.item_variant,
            item_list_id: item.item_list_id,
            item_list_name: item.item_list_name,
            price: item.price,
            quantity: quantity,
          },
        ],
      },
    });
  }

  var lastIntent = { variantId: null, when: 0 };
  function markIntentFrom(el) {
    var li = el && el.closest("[data-variant-id]");
    if (!li) return;
    lastIntent.variantId = li.getAttribute("data-variant-id");
    lastIntent.when = Date.now();
  }

  root.addEventListener("click", function (e) {
    var addBtn = e.target.closest(
      'button[name="add"], [type="submit"][name="add"], .quick-add__submit'
    );
    if (addBtn && root.contains(addBtn)) markIntentFrom(addBtn);
  });

  root.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || !root.contains(form)) return;
    var action = form.getAttribute("action") || "";
    if (action.indexOf("/cart/add") !== -1) markIntentFrom(form);
  });

  if (!window.__SMART_UPSELL_FETCH_PATCHED__) {
    window.__SMART_UPSELL_FETCH_PATCHED__ = true;

    var _fetch = window.fetch;
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      var method = ((init && init.method) || "GET").toUpperCase();
      var isAdd =
        /\/cart\/add(\.js|\.json)?(\?|$)/.test(url) && method === "POST";

      var body = init && init.body;
      var variantIdFromBody = null;
      var qtyFromBody = null;

      if (isAdd && body) {
        try {
          if (typeof body === "string") {
            var idMatch = body.match(/(?:^|[&?])id=(\d+)/);
            var qMatch = body.match(/(?:^|[&?])quantity=(\d+)/);
            if (idMatch) variantIdFromBody = idMatch[1];
            if (qMatch) qtyFromBody = parseInt(qMatch[1], 10);
          } else if (body instanceof FormData) {
            variantIdFromBody = body.get("id");
            qtyFromBody = parseInt(body.get("quantity") || "1", 10);
          }
        } catch (err) {
          console.warn(err);
        }
      }

      return _fetch.apply(this, arguments).then(function (res) {
        if (isAdd && res && res.ok) {
          var variantId =
            variantIdFromBody ||
            (Date.now() - (lastIntent.when || 0) < 5000
              ? lastIntent.variantId
              : null);

          var li = null;
          if (variantId)
            li = root.querySelector('[data-variant-id="' + variantId + '"]');

          if (
            !li &&
            Date.now() - (lastIntent.when || 0) < 5000 &&
            lastIntent.variantId
          ) {
            li = root.querySelector(
              '[data-variant-id="' + lastIntent.variantId + '"]'
            );
          }

          if (li) {
            var item = toItem(li);
            if (item) pushGTMAdd(item, qtyFromBody || 1);
          }
        }
        return res;
      });
    };
  }
})();
