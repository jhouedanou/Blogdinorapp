import { mergeProps, useSSRContext, ref, computed, unref } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
import { u as useBlog, H as Header, _ as _sfc_main$2 } from './Header.vue.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper.mjs';
import { a as useNuxtApp, u as useHead } from './server.mjs';
import { v as getRequestURL } from '../nitro/nitro.mjs';
import './nuxt-link.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'unhead/utils';
import 'devalue';
import 'unhead/plugins';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'ipx';

function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}

const _sfc_main$1 = {
  props: {
    pageUrl: {
      type: String,
      required: true
    },
    pageIdentifier: {
      type: String,
      required: true
    }
  },
  mounted() {
  },
  methods: {
    loadDisqus() {
      (function() {
        var d = void 0, s = d.createElement("script");
        s.src = "https://dinor-app.disqus.com/embed.js";
        s.setAttribute("data-timestamp", +/* @__PURE__ */ new Date());
        (d.head || d.body).appendChild(s);
      })();
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ id: "disqus_thread" }, _attrs))} data-v-c3ff57e9></div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/DisqusComments.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const DisqusComments = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-c3ff57e9"]]);

function useRequestURL(opts) {
  {
    return getRequestURL(useRequestEvent(), opts);
  }
}

const _sfc_main = {
  __name: "[slug]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { posts, loading } = useBlog();
    const isRefreshing = ref(false);
    const readingProgress = ref(0);
    const post = computed(() => posts.value && posts.value.length > 0 ? posts.value[0] : null);
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(date);
    };
    const getCategoryName = (categoryId, post2) => {
      if (!post2 || !post2.categories) return "";
      const category = post2.categories.find((cat) => cat.id === categoryId || cat.slug === categoryId);
      return category ? category.name : "";
    };
    const enhancePostContent = (content) => {
      if (!content) return "";
      let enhancedContent = content.replace(/&eacute;/g, "é").replace(/&egrave;/g, "è").replace(/&agrave;/g, "à").replace(/&ccedil;/g, "ç").replace(/&ecirc;/g, "ê").replace(/&ocirc;/g, "ô").replace(/&ucirc;/g, "û").replace(/&icirc;/g, "î").replace(/&euml;/g, "ë").replace(/&iuml;/g, "ï").replace(/&uuml;/g, "ü").replace(/&acirc;/g, "â").replace(/&ugrave;/g, "ù").replace(/&Eacute;/g, "É").replace(/&Egrave;/g, "È").replace(/&Agrave;/g, "À").replace(/&Ccedil;/g, "Ç").replace(/&nbsp;/g, " ");
      enhancedContent = enhancedContent.replace(/<p>/g, '<p class="enhanced-paragraph">');
      return enhancedContent;
    };
    const featuredImage = computed(() => {
      if (!post.value) return null;
      if (post.value.featuredImage) {
        if (post.value.featuredImage.medium && post.value.featuredImage.medium.url) {
          console.log("Utilisation de l'image moyenne du featured_image");
          return post.value.featuredImage.medium.url;
        }
        if (post.value.featuredImage.large && post.value.featuredImage.large.url) {
          console.log("Utilisation de l'image large du featured_image");
          return post.value.featuredImage.large.url;
        }
        if (post.value.featuredImage.full) {
          console.log("Utilisation de l'image full du featured_image");
          return post.value.featuredImage.full;
        }
      }
      if (post.value.thumbnail) {
        console.log("Utilisation de l'image thumbnail");
        return post.value.thumbnail;
      }
      console.log("Aucune image disponible pour cet article");
      return null;
    });
    const metaDescription = computed(() => {
      if (!post.value) return "";
      const plainText = post.value.content.replace(/<[^>]*>/g, "");
      return plainText.substring(0, 160) + (plainText.length > 160 ? "..." : "");
    });
    const keywords = computed(() => {
      if (!post.value) return "";
      const allText = `${post.value.title} ${post.value.content.replace(/<[^>]*>/g, "")}`;
      const words = allText.toLowerCase().split(/\W+/).filter((word) => word.length > 3).filter((word, index, self) => self.indexOf(word) === index).slice(0, 10);
      return words.join(", ");
    });
    useHead(() => {
      var _a, _b;
      return {
        title: post.value ? `${post.value.title} | Dinor App` : "Chargement...",
        meta: [
          { name: "description", content: metaDescription.value },
          { name: "keywords", content: keywords.value },
          // OpenGraph tags
          { property: "og:title", content: (_a = post.value) == null ? void 0 : _a.title },
          { property: "og:description", content: metaDescription.value },
          { property: "og:type", content: "article" },
          { property: "og:url", content: useRequestURL().href },
          { property: "og:image", content: featuredImage.value || "/images/default-thumbnail.jpg" },
          { property: "og:site_name", content: "Dinor App" },
          // Twitter Card tags
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: (_b = post.value) == null ? void 0 : _b.title },
          { name: "twitter:description", content: metaDescription.value },
          { name: "twitter:image", content: featuredImage.value || "/images/default-thumbnail.jpg" }
        ]
      };
    });
    computed(() => {
      if (!post.value) return "";
      return useRequestURL().href;
    });
    computed(() => {
      var _a;
      return ((_a = post.value) == null ? void 0 : _a.title) || "Blog Dinor";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_nuxt_img = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-02182794><div class="blog-background" data-v-02182794></div><div class="blog-overlay" data-v-02182794></div><div class="content-wrapper" data-v-02182794>`);
      _push(ssrRenderComponent(Header, null, null, _parent));
      _push(`<div class="reading-progress-container" data-v-02182794><div class="reading-progress-bar" style="${ssrRenderStyle({ width: readingProgress.value + "%" })}" data-v-02182794></div></div><div class="header-actions" data-v-02182794></div>`);
      if (unref(loading)) {
        _push(`<div class="loading" data-v-02182794><div class="spinner" data-v-02182794></div><p data-v-02182794>Chargement de l&#39;article...</p></div>`);
      } else if (!post.value) {
        _push(`<div class="error" data-v-02182794><h2 data-v-02182794>Article non trouvé</h2><p data-v-02182794>L&#39;article que vous recherchez n&#39;existe pas ou a été supprimé.</p><button class="back-button" data-v-02182794>Retourner à la liste des articles</button></div>`);
      } else {
        _push(`<article class="post-article" data-v-02182794><header class="post-header" data-v-02182794><div class="post-meta-info" data-v-02182794><div class="post-date" data-v-02182794>${ssrInterpolate(formatDate(post.value.date))}</div>`);
        if (post.value.categories && post.value.categories.length) {
          _push(`<div class="post-categories" data-v-02182794><!--[-->`);
          ssrRenderList(post.value.categories, (category) => {
            _push(`<span class="category-badge" data-v-02182794>${ssrInterpolate(getCategoryName(category, post.value))}</span>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><h1 class="post-title" data-v-02182794>${post.value.title ?? ""}</h1></header>`);
        if (featuredImage.value) {
          _push(`<div class="post-image-container" data-v-02182794>`);
          _push(ssrRenderComponent(_component_nuxt_img, {
            src: featuredImage.value,
            alt: post.value.title,
            width: "900",
            height: "500",
            placeholder: "",
            format: "webp",
            class: "post-featured-image"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="post-no-image" data-v-02182794><div class="no-image-label" data-v-02182794>Pas d&#39;image disponible</div></div>`);
        }
        _push(`<div class="post-content" data-v-02182794>${enhancePostContent(post.value.content) ?? ""}</div>`);
        _push(ssrRenderComponent(DisqusComments, {
          pageUrl: unref(useRequestURL)().href,
          pageIdentifier: unref(route).path
        }, null, _parent));
        _push(`<div class="share-container" data-v-02182794><h3 class="share-title" data-v-02182794>Partager cet article</h3><div class="share-buttons" data-v-02182794><button class="share-button native" aria-label="Partager nativement" data-v-02182794><span class="share-icon" data-v-02182794>⇧</span></button><button class="share-button facebook" aria-label="Partager sur Facebook" data-v-02182794><span class="share-icon" data-v-02182794>f</span></button><button class="share-button twitter" aria-label="Partager sur Twitter" data-v-02182794><span class="share-icon" data-v-02182794>t</span></button><button class="share-button linkedin" aria-label="Partager sur LinkedIn" data-v-02182794><span class="share-icon" data-v-02182794>in</span></button><button class="share-button whatsapp" aria-label="Partager sur WhatsApp" data-v-02182794><span class="share-icon" data-v-02182794>w</span></button></div></div></article>`);
      }
      _push(`</div><button class="floating-btn back-floating-btn" aria-label="Retour à la liste des articles" data-v-02182794><span class="back-icon" data-v-02182794>←</span><span class="btn-tooltip" data-v-02182794>Retour</span></button>`);
      if (!unref(loading)) {
        _push(`<button class="${ssrRenderClass([{ "refreshing": isRefreshing.value }, "floating-btn refresh-floating-btn"])}" aria-label="Rafraîchir l&#39;article" data-v-02182794><span class="refresh-icon" data-v-02182794>↻</span><span class="btn-tooltip" data-v-02182794>${ssrInterpolate(isRefreshing.value ? "Rafraîchissement..." : "Rafraîchir")}</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/post/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _slug_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-02182794"]]);

export { _slug_ as default };
//# sourceMappingURL=_slug_.vue.mjs.map
