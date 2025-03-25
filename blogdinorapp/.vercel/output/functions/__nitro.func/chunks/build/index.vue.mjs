import { _ as __nuxt_component_0 } from './nuxt-link.mjs';
import { useSSRContext, ref, computed, watch, mergeProps, unref, withCtx, createTextVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { useRoute, useRouter } from 'vue-router';
import { u as useBlog, H as Header, _ as _sfc_main$1 } from './Header.vue.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'ipx';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'unhead/utils';
import 'devalue';
import 'unhead/plugins';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    const {
      posts,
      loading,
      // Pagination
      currentPage,
      totalPages,
      itemsPerPage,
      // Catégories
      activeCategory,
      setActiveCategory,
      clearCategoryFilter
    } = useBlog();
    const isRefreshing = ref(false);
    ref(false);
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    };
    const formatCategoryName = (slug) => {
      switch (slug) {
        case "recette":
          return "Recettes";
        case "top-10":
          return "Top 10";
        default:
          return slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
      }
    };
    const formatExcerpt = (excerpt) => {
      if (!excerpt) return "";
      let formattedExcerpt = excerpt.replace(/&eacute;/g, "é").replace(/&egrave;/g, "è").replace(/&agrave;/g, "à").replace(/&ccedil;/g, "ç").replace(/&ecirc;/g, "ê").replace(/&ocirc;/g, "ô").replace(/&ucirc;/g, "û").replace(/&icirc;/g, "î").replace(/&euml;/g, "ë").replace(/&iuml;/g, "ï").replace(/&uuml;/g, "ü").replace(/&acirc;/g, "â").replace(/&ugrave;/g, "ù").replace(/&Eacute;/g, "É").replace(/&Egrave;/g, "È").replace(/&Agrave;/g, "À").replace(/&Ccedil;/g, "Ç").replace(/&nbsp;/g, " ");
      formattedExcerpt = formattedExcerpt.replace(/<p>/g, "").replace(/<\/p>/g, "").replace(/\[&hellip;\]/g, "...").replace(/\[…\]/g, "...").replace(/\.\.\.<\/p>/g, "...").replace(/\s+/g, " ").trim();
      if (formattedExcerpt.length > 150) {
        formattedExcerpt = formattedExcerpt.substring(0, 150) + "...";
      }
      return formattedExcerpt;
    };
    const formatTitle = (title) => {
      if (!title) return "";
      return title.replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"').replace(/&eacute;/g, "é").replace(/&egrave;/g, "è").replace(/&agrave;/g, "à").replace(/&ccedil;/g, "ç").replace(/&ecirc;/g, "ê").replace(/&ocirc;/g, "ô").replace(/&ucirc;/g, "û").replace(/&icirc;/g, "î").replace(/&euml;/g, "ë").replace(/&iuml;/g, "ï").replace(/&uuml;/g, "ü").replace(/&acirc;/g, "â").replace(/&ugrave;/g, "ù").replace(/&Eacute;/g, "É").replace(/&Egrave;/g, "È").replace(/&Agrave;/g, "À").replace(/&Ccedil;/g, "Ç").replace(/&nbsp;/g, " ");
    };
    const totalArticles = computed(() => {
      return totalPages.value * itemsPerPage.value;
    });
    const displayedRange = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(currentPage.value * itemsPerPage.value, totalArticles.value);
      return { start, end };
    });
    const paginationButtons = computed(() => {
      const maxVisibleButtons = 5;
      const buttons = [];
      if (totalPages.value <= maxVisibleButtons) {
        for (let i = 1; i <= totalPages.value; i++) {
          buttons.push({ value: i, label: i, type: "page" });
        }
      } else {
        buttons.push({ value: 1, label: 1, type: "page" });
        let startPage = Math.max(2, currentPage.value - Math.floor(maxVisibleButtons / 2) + 1);
        let endPage = Math.min(totalPages.value - 1, startPage + maxVisibleButtons - 3);
        if (endPage - startPage < maxVisibleButtons - 3) {
          startPage = Math.max(2, endPage - (maxVisibleButtons - 3) + 1);
        }
        if (startPage > 2) {
          buttons.push({ value: null, label: "...", type: "ellipsis" });
        }
        for (let i = startPage; i <= endPage; i++) {
          buttons.push({ value: i, label: i, type: "page" });
        }
        if (endPage < totalPages.value - 1) {
          buttons.push({ value: null, label: "...", type: "ellipsis" });
        }
        buttons.push({ value: totalPages.value, label: totalPages.value, type: "page" });
      }
      return buttons;
    });
    computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return posts.value.slice(start, end);
    });
    watch(() => route.query.category, (newCategory) => {
      if (newCategory) {
        setActiveCategory(newCategory);
      } else {
        clearCategoryFilter();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_nuxt_img = _sfc_main$1;
      const _component_nuxt_link = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-c3a9d64d><div class="blog-background" data-v-c3a9d64d></div><div class="blog-overlay" data-v-c3a9d64d></div><div class="content-wrapper" data-v-c3a9d64d><div data-v-c3a9d64d>`);
      _push(ssrRenderComponent(Header, null, null, _parent));
      _push(`<div class="header-actions" data-v-c3a9d64d>`);
      if (unref(activeCategory)) {
        _push(`<div class="active-filter" data-v-c3a9d64d><span class="filter-label" data-v-c3a9d64d>Filtré par : </span><span class="filter-value" data-v-c3a9d64d>${ssrInterpolate(formatCategoryName(unref(activeCategory)))}</span><button class="clear-filter-btn" data-v-c3a9d64d>×</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(loading)) {
        _push(`<div class="loading" data-v-c3a9d64d><div class="spinner" data-v-c3a9d64d></div><p data-v-c3a9d64d>Chargement des articles...</p></div>`);
      } else {
        _push(`<div data-v-c3a9d64d><div${ssrRenderAttrs({
          name: "post-list",
          class: "posts-grid"
        })} data-v-c3a9d64d>`);
        ssrRenderList(unref(posts), (post, index2) => {
          _push(`<div class="post-card" style="${ssrRenderStyle({ "--i": index2 })}" data-v-c3a9d64d><div class="post-image-container" data-v-c3a9d64d>`);
          if (post.thumbnail) {
            _push(ssrRenderComponent(_component_nuxt_img, {
              src: post.thumbnail,
              width: "340",
              height: "180",
              quality: "90",
              format: "webp",
              alt: post.title,
              class: "post-thumbnail-image"
            }, null, _parent));
          } else {
            _push(`<div class="no-image" data-v-c3a9d64d>Pas d&#39;image</div>`);
          }
          _push(`<h3 class="post-title-overlay" data-v-c3a9d64d>${formatTitle(post.title) ?? ""}</h3></div><div class="post-meta" data-v-c3a9d64d><span class="post-date" data-v-c3a9d64d>${ssrInterpolate(formatDate(post.date))}</span>`);
          if (post.categories && post.categories.length) {
            _push(`<div class="post-categories" data-v-c3a9d64d><!--[-->`);
            ssrRenderList(post.categories, (category) => {
              _push(`<span class="category-badge" data-v-c3a9d64d>${ssrInterpolate(category.name)}</span>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="post-excerpt" data-v-c3a9d64d>${formatExcerpt(post.excerpt) ?? ""}</div><div class="post-footer" data-v-c3a9d64d>`);
          _push(ssrRenderComponent(_component_nuxt_link, {
            to: `/post/${post.slug}`,
            class: "read-more-btn"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Lire plus`);
              } else {
                return [
                  createTextVNode("Lire plus")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div>`);
        });
        _push(`</div>`);
        if (unref(posts).length === 0) {
          _push(`<div class="no-posts" data-v-c3a9d64d><h3 data-v-c3a9d64d>Aucun article trouvé</h3>`);
          if (unref(activeCategory)) {
            _push(`<p data-v-c3a9d64d>Aucun article n&#39;a été trouvé dans la catégorie &quot;${ssrInterpolate(formatCategoryName(unref(activeCategory)))}&quot;.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="refresh-btn" data-v-c3a9d64d>Voir tous les articles</button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(totalPages) > 1) {
          _push(`<div class="pagination" data-v-c3a9d64d><button class="${ssrRenderClass([{ "disabled": unref(currentPage) === 1 }, "pagination-btn"])}"${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} data-v-c3a9d64d><span class="pagination-arrow" data-v-c3a9d64d>←</span> Précédent </button><div class="pagination-pages" data-v-c3a9d64d><!--[-->`);
          ssrRenderList(paginationButtons.value, (page) => {
            _push(`<button class="${ssrRenderClass([{
              "active": page.value === unref(currentPage),
              "ellipsis": page.type === "ellipsis"
            }, "pagination-page"])}"${ssrIncludeBooleanAttr(page.type === "ellipsis") ? " disabled" : ""} data-v-c3a9d64d>${ssrInterpolate(page.label)}</button>`);
          });
          _push(`<!--]--></div><button class="${ssrRenderClass([{ "disabled": unref(currentPage) === unref(totalPages) }, "pagination-btn"])}"${ssrIncludeBooleanAttr(unref(currentPage) === unref(totalPages)) ? " disabled" : ""} data-v-c3a9d64d> Suivant <span class="pagination-arrow" data-v-c3a9d64d>→</span></button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(posts).length > 0) {
          _push(`<div class="posts-info" data-v-c3a9d64d> Affichage de ${ssrInterpolate(displayedRange.value.start)}-${ssrInterpolate(displayedRange.value.end)} sur ${ssrInterpolate(totalArticles.value)} articles `);
          if (unref(activeCategory)) {
            _push(`<span data-v-c3a9d64d> dans la catégorie &quot;${ssrInterpolate(formatCategoryName(unref(activeCategory)))}&quot;</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
      if (!unref(loading)) {
        _push(`<button class="${ssrRenderClass([{ "refreshing": isRefreshing.value }, "floating-btn refresh-floating-btn"])}" aria-label="Rafraîchir les articles" data-v-c3a9d64d><span class="refresh-icon" data-v-c3a9d64d>↻</span><span class="btn-tooltip" data-v-c3a9d64d>${ssrInterpolate(isRefreshing.value ? "Rafraîchissement..." : "Rafraîchir")}</span></button>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading)) {
        _push(`<button class="floating-btn back-floating-btn" aria-label="Retour" data-v-c3a9d64d><span class="back-icon" data-v-c3a9d64d>⇐</span><span class="btn-tooltip" data-v-c3a9d64d>Retour</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c3a9d64d"]]);

export { index as default };
//# sourceMappingURL=index.vue.mjs.map
